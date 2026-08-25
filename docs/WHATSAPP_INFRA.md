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
