# WhatsApp Infrastructure Guide

Operational reference for the per-business GoWapp containers: device slots,
the `X-Device-Id` header, provisioning, and failure modes. For system
structure see [ARCHITECTURE.md](./ARCHITECTURE.md); for the container status
lifecycle and its known bugs see [CONTAINER_STATES.md](./CONTAINER_STATES.md).

## Device Slots & X-Device-Id

GoWapp v9 supports multiple registered devices ("slots") per container.
Nenichat uses exactly one slot per container, **named after the business ID**.

Every repository call sends `X-Device-Id: {business_id}`. GoWapp resolves it:

| Header value | GoWapp behavior |
|---|---|
| Known slot ID | Request scoped to that slot |
| Unknown non-empty ID | `404 DEVICE_NOT_FOUND` |
| Empty / absent | Falls back to the single registered device — only works while exactly one slot exists |

Slot name == business ID because every layer already keys everything by
business ID: Traefik routes by path prefix and repositories build URLs from
it, so the header matches without extra configuration.

## Provisioning

Slots live inside the container's data volume — **recreating a container
wipes them**. That is why both lifecycle entry points provision before
anything else. Both funnel through the shared use case
`fetchAndStoreQrCode()` in `Nenichat/Containers/app/fetch-and-store-qr-code.ts`:

- `app/(app)/api/infra/containers/route.ts` — on create (background task)
- `app/(app)/api/infra/regenerate-qr/route.ts` — on regenerate, idempotent

The use case delegates slot creation and login polling to
`Wapp.ensureDeviceSlot()` / `Wapp.getLoginQrLink()`
(`Nenichat/Wapp/infra/wapp-client.ts`). Both POST to
`/api/user/{business_id}/devices` with body `{device_id: business_id}` before
polling the login endpoint. Provisioning failures are logged but never block
deployment.

## Failure Modes

Distinguish who answered a 404:

| Symptom | Meaning |
|---|---|
| Plain-text `404 page not found` | **Traefik** answered — no container behind this route (missing or stopped) |
| JSON error body | **GoWapp** answered — container alive; read the error code |

Common GoWapp errors:

- `DEVICE_NOT_FOUND` → slot missing; the recreate flow re-provisions it, or POST `/devices` manually
- Session expired / logged out → slot exists but unpaired; regenerate the QR

## Debugging Recipes

```bash
# Is the route alive at all? (JSON = alive, plain-text 404 = no container)
curl -u admin:admin http://192.168.1.64/api/user/{business_id}/devices

# Which slots exist?
curl -u admin:admin http://192.168.1.64/api/user/{business_id}/devices | jq

# Manually register the business slot
curl -u admin:admin -X POST \
  -H 'Content-Type: application/json' \
  -d '{"device_id": "{business_id}"}' \
  http://192.168.1.64/api/user/{business_id}/devices

docker ps -a | grep whatsapp
docker logs {container_name} --tail 50
```

Known quirk: `checkWappHealth()` (in `Nenichat/Wapp/infra/wapp-client.ts`)
treats any HTTP response as "alive", including Traefik's plain-text 404 — so a
missing container can be classified as reachable. This is intentional for now
(only network failures/timeouts mark a container `unreachable`); revisit if
stricter detection is ever needed.

## Host Outage Playbook — "Connection refused" on port 80/443

**Observed:** 2026-08-26, and likely explains the `dokploy.1 Failed` entries
recurring every few days in swarm history.

### Symptom

Every gateway URL refuses to connect (`connect to 192.168.1.64 port 80 failed:
Connection refused`) even though `docker ps` shows all business containers Up.
Nothing about Nenichat's own code or data is wrong — the front door of the
host is gone.

### What actually happens

The boot sequence has a race:

1. Host reboots; Docker comes up with Swarm mode active (single manager node).
2. `dokploy-traefik` (standalone container, owns ports 80/443) tries to attach
   to `dokploy-network` — an **overlay** network managed by Swarm.
3. The Swarm IPAM ledger still holds stale allocations from before the crash,
   so the attach times out:
   ```
   failed to set up container networking: attaching to network failed ...
   context deadline exceeded
   ```
4. Traefik exits (code 128) and nothing ever listens on 80/443 again. Every
   routed service — including healthy GoWapp containers — becomes unreachable.

Confirm with
`docker inspect dokploy-traefik --format '{{.State.ExitCode}} | {{.State.Error}}'`;
the Docker log line that names the true root cause is
`could not allocate IP from IPAM: Address already in use`
(`journalctl -u docker --since "-2 hours"`).

### Triage order

```bash
# 1. Is anything listening on the front-door ports?
ss -tlnp | grep -E ':(80|443)\b'

# 2. Is traefik the casualty?
docker ps -a --filter name=dokploy-traefik --format '{{.Status}}'
docker inspect dokploy-traefik --format '{{.State.ExitCode}} | {{.State.Error}}'

# 3. Check for the IPAM leak signature
journalctl -u docker --since "-2 hours" --no-pager | grep -iE 'IPAM|Address already'
```

### Fix ladder (least invasive first)

1. **Restart the Docker daemon.** Rebuilds network state from live
   attachments and almost always clears the leaked ledger. Brief downtime
   (~30s) for all containers; Swarm services reschedule themselves.
   ```bash
   sudo systemctl restart docker
   docker start dokploy-traefik
   ```
2. **Only if step 1 fails: reset the Swarm network store.** Back it up, stop
   Docker, remove the corrupted ledger, start over:
   ```bash
   sudo systemctl stop docker
   sudo mv /var/lib/docker/network/files/local-kv.db /tmp/local-kv.db.bak
   sudo systemctl start docker
   # recreate the overlay only if it doesn't come back automatically:
   docker network create -d overlay --attachable dokploy-network
   docker start dokploy-traefik
   ```
3. Verify recovery: port 80 listening + a JSON answer (not refusal) from a
   known route:
   ```bash
   ss -tlnp | grep ':80'
   curl -u admin:<password> http://192.168.1.64/api/user/{business_id}/devices
   ```

Do **not** jump to recreating `dokploy-network` or leaving/rejoining Swarm —
unnecessary risk for what is a state-file problem.

### Distinguishing this from app-level failures

| Probe result | Meaning |
|---|---|
| Connection refused on 80/443 | Host/Traefik down — this playbook |
| Plain-text `404 page not found` | Traefik alive, container missing/stopped — see Failure Modes above |
| HTTP response from GoWapp | Infra fine; debug app/session level |

Note: `dokploy`'s own dashboard listens on port **3000** — finding something
answering there does *not* mean the gateway recovered.

App-level aftermath: any business whose row was marked `unreachable` while
the proxy was down stays stuck there after recovery — chats gated behind
error screens and settings offering Recreate for a healthy container. See
[CONTAINER_STATES.md](./CONTAINER_STATES.md), known issue #3, for why and
for the one-curl manual fix.
