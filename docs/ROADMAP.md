# Roadmap

Planned features and technical improvements.

---

## WhatsApp Container Image Updates

**Status:** Partially complete (version bumped to v9.2.1, batch update system still planned)  
**Priority:** P2 (post-launch)

### Problem

The `go-whatsapp-web-multidevice` image tag is hardcoded in
`Nenichat/Containers/Infrastructure/Dokploy/templates.ts`. When a new version
ships, there is no way to update containers without manually editing code and
recreating each one.

Volumes are also commented out — no container has persistent storage, so any
update destroys the WhatsApp session.

### Completed

- **2026-08-31:** Bumped image from `v9.0.1` → `v9.2.1` in both templates.
  Added `--ui-enabled=false` and `--mcp-enabled=false` flags.
  See [v9.2.1 migration notes](#version-bump-v901--v921) below.

### Goal

Admin-triggered batch update that:
1. Updates all active containers to a target image version
2. Enables persistent volumes so future updates preserve sessions
3. Auto-regenerates QR codes for sessions that break on the first update

### Architecture

```
Admin UI  →  POST /api/infra/containers/update  →  update-all-containers use case
                                                      ↓
                                              For each active container:
                                                1. compose.update (new image + volumes)
                                                2. compose.deploy
                                                3. fetchAndStoreQrCode()
                                                4. update image_version in DB
```

### Implementation Steps

#### 1. Version Configuration

- Add `WAPP_IMAGE_VERSION=v9.2.1` to `.env.example`
- Read it in `DokployContainerService` constructor
- Default fallback to `v9.2.1` if not set

#### 2. Template Updates — Volumes + Version Placeholder

**File:** `Nenichat/Containers/Infrastructure/Dokploy/templates.ts`

- Replace hardcoded image with `{image_version}` placeholder
- Uncomment volumes section
- Add top-level `volumes:` declaration

```yaml
services:
  whatsapp:
    image: aldinokemal2104/go-whatsapp-web-multidevice:{image_version}
    volumes:
      - whatsapp_data:/app
    # ... rest unchanged

volumes:
  whatsapp_data:
```

Both `INITIAL_COMPOSE_FILE` and `COMPOSE_FILE_WITH_PHONE` get the same treatment.

#### 3. DokployService — Version-Aware Configuration

**File:** `Nenichat/Containers/Infrastructure/Dokploy/DokployContainerService.ts`

- Modify `renderComposeFile()` to also substitute `{image_version}`
- Add optional `version` param to `updateContainerConfiguration()`
- Uses configured env var version when param is omitted

#### 4. SupabaseContainerRepository — Version Tracking

**File:** `Nenichat/Containers/Infrastructure/Supabase/SupabaseContainerRepository.ts`

**Supabase migration:** Add `image_version` (text, nullable) column to
`whatsapp-containers`.

New methods:
- `updateImageVersion(businessId, version)` — sets the column
- `getActiveContainers()` — returns containers with status IN (`deployed`, `connected`)
- `getContainersWithVersion()` — returns all containers with version for admin UI

#### 5. Update Use Case

**New file:** `Nenichat/Containers/app/update-all-containers.ts`

```
updateAllContainers(targetVersion, supabase):
  1. Get all active containers from Supabase
  2. Filter out containers already on targetVersion
  3. For each container (sequential):
     a. containerService.updateContainerConfiguration(composeId, businessId, targetVersion)
     b. containerService.deployContainer(composeId)
     c. Update state → 'deployed'
     d. Wait 6s (container startup)
     e. fire-and-forget: fetchAndStoreQrCode()
     f. containerRepo.updateImageVersion(businessId, targetVersion)
  4. Return results: { businessId, success, error? }
```

Sequential to avoid Docker/Traefik overload. ~10-15s per container.

#### 6. API Route

**New file:** `app/(app)/api/infra/containers/update/route.ts`

```
POST /api/infra/containers/update
Body: { target_version?: string }   // optional, defaults to env var

1. Authenticate
2. Resolve target version (body || env WAPP_IMAGE_VERSION)
3. Call updateAllContainers(targetVersion, supabase)
4. Return { success, updated, results }
```

#### 7. Admin UI

**New file:** `components/admin/container-update.tsx`

- Target version input
- Table: business_id, current version, status, last updated
- "Update All" button → calls POST `/api/infra/containers/update`
- Progress/results display

### Files Summary

| File | Action | Purpose |
|------|--------|---------|
| `.env.example` | Edit | Add `WAPP_IMAGE_VERSION` |
| `Nenichat/Containers/Infrastructure/Dokploy/templates.ts` | Edit | Volumes + version placeholder |
| `Nenichat/Containers/Infrastructure/Dokploy/DokployContainerService.ts` | Edit | Version-aware rendering |
| `Nenichat/Containers/Infrastructure/Supabase/SupabaseContainerRepository.ts` | Edit | Version tracking + queries |
| `Nenichat/Containers/app/update-all-containers.ts` | **Create** | Batch update use case |
| `app/(app)/api/infra/containers/update/route.ts` | **Create** | API endpoint |
| `components/admin/container-update.tsx` | **Create** | Admin UI |
| Supabase migration | **Create** | Add `image_version` column |

### Session Behavior

- **First update:** Session breaks for all (no volumes yet), QR auto-regenerated,
  users re-scan once
- **Future updates:** Volumes preserve sessions, no re-scan needed

### Risks

| Risk | Mitigation |
|------|------------|
| Session loss on first update | Auto QR regeneration + messaging |
| Dokploy API rate limiting | Sequential updates with delays |
| Partial failure | Per-container error handling + report |
| GoWapp version incompatibility | Test one container before batch |
| Container stuck after update | Existing `RecreateButton` as fallback |

### Out of Scope

- Automatic updates on new release (manual trigger only)
- Per-business user-initiated updates (admin only)
- Rollback mechanism
- Post-update health polling (existing mechanisms handle this)

---

## Version Bump: v9.0.1 → v9.2.1

**Date:** 2026-08-31  
**File:** `Nenichat/Containers/Infrastructure/Dokploy/templates.ts`

### Changes Made

- Image tag: `v9.0.1` → `v9.2.1` (both `INITIAL_COMPOSE_FILE` and `COMPOSE_FILE_WITH_PHONE`)
- Added `--ui-enabled=false` — disables built-in gowa-ui dashboard (Nenichat has its own UI)
- Added `--mcp-enabled=false` — disables MCP endpoint (Nenichat doesn't use it)

### What Changed in v9.0.1 → v9.2.1

| Version | Changes | Impact |
|---------|---------|--------|
| v9.1.0 | MCP unified into `rest` command | None — Nenichat already uses `rest` |
| v9.2.0 | OAuth 2.1 for MCP (opt-in), HD media, Chatwoot webhook fix | None — features not used |
| v9.2.1 | Revoked messages cleaned up, pagination scoped per device, display names from contacts | Positive — better data accuracy |

### API Compatibility

All endpoints Nenichat uses are unchanged:
- `POST /devices`, `GET /devices`, `GET /devices/{id}/login`
- `GET /app/info`, `GET /app/devices`, `GET /app/reconnect`
- `GET /chats`, `GET /chat/{jid}/messages`, `POST /send/message`
- `GET /user/check`

### Post-Upgrade Benefits

1. Chat names resolved from synced contacts (not raw phone numbers)
2. Message pagination counts scoped per device
3. Revoked/deleted messages removed from local storage
4. ~50MB less memory (UI dashboard disabled)
5. Latest whatsmeow protocol support

### Migration

Existing containers must be **recreated** (DELETE + POST) to pick up the new
image. This destroys WhatsApp sessions — users must re-scan QR codes. The
batch update system (described above) will automate this in the future.
