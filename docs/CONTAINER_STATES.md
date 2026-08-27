# Container Lifecycle States & Known Issues

Reference for `whatsapp-containers.status`, who writes it, and three known bugs
around the `deployed ↔ connected` transitions and the terminal-ish
`unreachable` state. Related reading:
[WHATSAPP_INFRA.md](./WHATSAPP_INFRA.md), [ARCHITECTURE.md](./ARCHITECTURE.md).

## The state machine (canonical)

| State | Meaning |
|---|---|
| `none` | No container or compose exists at all. Fresh state after reset. |
| `empty` | Dokploy compose project created but hasn't received a compose file yet. |
| `created` | Compose file assigned, not yet deployed. |
| `deployed` | Container deployed and running, but no WhatsApp session connected. |
| `connected` | Container deployed + WhatsApp session active. |
| `error` | Error encountered (QR polling failed, deployment failed, etc.). |
| `stopped` | Container stopped (non-payment, manual stop, etc.). |
| `unreachable` | Container not responding — the GoWapp container itself is nuked or broken. Must be recreated. |

Source of truth in code: `Nenichat/Containers/Domain/container-states.ts`.
All writes should go through `SupabaseContainerRepository.updateContainerState()`
— except two client components that write to Supabase directly (see below).

## Who writes state

| Writer | Writes | Trigger |
|---|---|---|
| `app/(app)/api/whatsapp/devices/route.ts` | `connected` | Devices probe finds ≥ 1 linked phone |
| `Nenichat/Containers/app/fetch-and-store-qr-code.ts` | `deployed` / `error` | QR stored successfully / flow failed |
| `app/(app)/chats/chat-list-loader.tsx` (catch block) | `deployed` / `unreachable` | Chat list throws + liveness probe result |
| `components/connections/whatsapp/check-wapp-connection-button.tsx` | `deployed` (+ clears QR) | Devices probe returns empty **or throws** |

Read-side gates that require exactly `'connected'`: `chats/layout.tsx`,
`home/page.tsx`, `whatsapp-settings.tsx`.

## Known issue #1 — `connected` silently demoted to `deployed`

**Status:** unfixed. **Observed in production:** yes (business 115, 2026-08).

Both of these writers change state based on *indirect* evidence instead of the
question each state actually poses ("is there an active WhatsApp session?"):

1. `chat-list-loader.tsx`: if fetching the chat list throws AND a health probe
   answers, it writes `deployed`. But a chats-endpoint failure does **not**
   mean the WhatsApp session died — any transient error (timeout, restart,
   bad deploy) demotes healthy containers.
2. `check-wapp-connection-button.tsx`: its `catch` block writes `deployed`
   and wipes `qr_code_url` on *any* thrown error, including network blips.

Incident timeline for business 115: status was `connected`; a regression made
chat requests hit an un-routed URL (plain Traefik 404); every visit to
`/chats` threw → loader's catch classified "alive" → wrote `deployed` → the
layout gate (`status === "connected"`) then hid the chats behind the
reconnect screen permanently.

### Correct classification rule (to implement)

Only `getAppDevices(businessId)` may decide between `deployed` / `connected` /
`unreachable`, because it answers the question the states are defined by:

| Probe result | Correct action |
|---|---|
| ≥ 1 device | Session live → never demote; treat upstream failure as transient |
| 0 devices | Write `deployed` (session genuinely gone) |
| Probe request fails | Write `unreachable` |

## Known issue #2 — `deployed → connected` depends on a manual click

The only transition trigger is the *"Ya escaneé el código QR"* button
(`check-wapp-auth-button.tsx`) on `/wapp`, which calls the devices route (that
route performs the actual write). If the user scans and never clicks it, the
session is live at the gateway but the row stays `deployed` forever — same
visible symptom as issue #1.

Planned remedy: auto-poll `/api/whatsapp/devices` while the setup page shows
the QR, keeping the route as the single writer; optionally reconcile lazily
in `chats/layout.tsx` for users who closed the tab mid-scan.

## Known issue #3 — `unreachable` never self-recovers after a transient outage

**Status:** unfixed. **Observed in production:** yes (business 115,
2026-08-26, during a Traefik/IPAM host outage — see
[WHATSAPP_INFRA.md](./WHATSAPP_INFRA.md)).

Both chat-path writers classify *any* request failure as `unreachable`:

1. `chat-list-loader.tsx`: catch block probes liveness and writes
   `unreachable` when the probe itself fails.
2. `app/(app)/api/chats/route.ts`: same on the API path (503
   `container_unreachable`).

That classification assumes network failure == container dead. But during an
infrastructure outage (reverse proxy down, host networking broken) every
container is equally "unreachable" while being perfectly healthy. Once the
host recovers:

- Nothing transitions out of `unreachable` — no writer re-probes, so the row
  stays stuck even though the gateway answers again.
- The `'connected'` gates (`chats/layout.tsx`, `home/page.tsx`,
  `whatsapp-settings.tsx`) keep users blocked behind error screens.
- `whatsapp-settings.tsx` offers **Recreate**, which would destroy a healthy
  container and its registered device slot — destructive overkill for what
  was a transient outage.

Correct rule (same probe logic as issue #1): a successful
`getAppDevices(businessId)` proves the container is alive, so it must demote
`unreachable` back to `deployed`/`connected`. Only keep `unreachable` when
the probe *still* fails after infra recovery — only then is Recreate
appropriate.

## Recovering rows stuck in `deployed` / `unreachable` (while issues are open)

If the gateway answers (JSON body, not refusal/plain-text 404), the container
is fine and the row just needs flipping — do not use Recreate:

```bash
curl -u admin:<password> http://192.168.1.64/api/user/{business_id}/devices   # confirm logged_in
# then update whatsapp-containers.status = 'connected' for that business_id
```

This applies equally to rows stuck in `deployed` (issues #1/#2) and to rows
stuck in `unreachable` after a host outage recovered (issue #3). Reserve the
Recreate flow for endpoints that stay dead — connection refused or plain-text
404 — per the triage table in [WHATSAPP_INFRA.md](./WHATSAPP_INFRA.md).
