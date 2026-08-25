# Container Lifecycle States & Known Issues

Reference for `whatsapp-containers.status`, who writes it, and two known bugs
around the `deployed ↔ connected` transitions. Related reading:
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

## Recovering rows stuck in `deployed` (while issues are open)

If the gateway still reports the device as logged in, either click
*"Verificar estado de conexión"* on `/wapp` once, or flip the row manually:

```bash
curl -u admin:<password> http://192.168.1.64/api/user/{business_id}/devices   # confirm logged_in
# then update whatsapp-containers.status = 'connected' for that business_id
```
