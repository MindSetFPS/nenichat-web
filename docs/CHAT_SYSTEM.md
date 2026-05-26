# Chat Management System Documentation

## Overview

This document describes the chat management system in Nenichat, including data flow, file interactions, and caching strategies.

## Architecture

The chat system uses a multi-layer architecture:

```
┌─────────────────────────────────────────────────────────────────────┐
│                           SERVER SIDE                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────┐      ┌────────────────────────────────┐    │
│  │   WhatsApp API      │      │    API Route (cache)           │    │
│  │  (192.168.1.64)     │ ───► │  app/api/chats/route.ts        │    │
│  │                     │      │  - Server-side in-memory cache │    │
│  └─────────────────────┘      │  - TTL: 5 minutes              │    │
│                                └───────────────────────────────┘    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENT SIDE                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────┐       │
│  │  Layout Chain (app/(app)/layout.tsx)                         │       │
│  │  ┌─────────────────┐  ┌────────────────────┐  ┌───────────┐  │       │
│  │  │ BusinessProvider│──│  ChatInitializer   │──│ Contact   │  │       │
│  │  │                 │  │  (fetches chats)   │  │ Init.     │  │       │
│  │  └─────────────────┘  └────────────────────┘  └───────────┘  │       │
│  └──────────────────────────────────────────────────────────────┘       │
│                                    │                                    │
│                                    ▼                                    │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  Stores (Zustand with persistence)                              │    │
│  │  ┌─────────────────┐  ┌─────────────────────────────────────┐   │    │
│  │  │  chat-store.ts  │  │         contact-store.ts            │   │    │
│  │  │ - Chat data     │  │  - Contact lookup by phone/lid      │   │    │
│  │  │ - localStorage  │  │  - localStorage                     │   │    │
│  │  └─────────────────┘  └─────────────────────────────────────┘   │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Files and Their Responsibilities

### 1. `app/api/chats/route.ts`

**Purpose:** Server-side API endpoint that fetches chats from WhatsApp API with caching.

**Responsibilities:**
- Receives `businessId` and `wappUrl` as query parameters
- Checks in-memory cache before fetching from WhatsApp
- If cache miss: calls WhatsApp API, stores result in cache
- If cache hit: returns cached data (no WhatsApp API call)
- Provides DELETE endpoint to manually clear cache

**Cache Details:**
- Storage: In-memory `Map` (server RAM)
- Key: `businessId`
- TTL: 5 minutes (300000ms)
- Persistence: None (resets on server restart)

**Code Reference:**
```typescript
// Cache structure
const chatCache = new Map<string, CacheEntry>();

// TTL configuration
const TTL_MS = 5 * 60 * 1000; // 5 minutes
```

---

### 2. `stores/chat-store.ts`

**Purpose:** Client-side Zustand store for managing chat state with localStorage persistence.

**Responsibilities:**
- Fetches chats from `/api/chats` endpoint
- Stores chats in localStorage (key: `nenichat-chats`)
- Provides methods: `addChat`, `removeChat`, `updateChat`, `clearChats`, `getChat`
- Tracks loading state (`isLoading`, `isLoaded`)

**Persistence:**
- Storage: Browser localStorage
- Key: `nenichat-chats`
- Persisted fields: `chats`, `isLoaded`
- On page reload: restores from localStorage automatically

**Code Reference:**
```typescript
// Store configuration
persist(
    (set, get) => ({
        chats: [],
        isLoaded: false,
        isLoading: false,
        // ... methods
    }),
    {
        name: 'nenichat-chats',
        partialize: (state) => ({
            chats: state.chats,
            isLoaded: state.isLoaded,
        }),
    }
)
```

---

### 3. `hooks/useInitializeChats.ts`

**Purpose:** React hook that triggers chat fetching on app mount.

**Responsibilities:**
- Called when ChatInitializer component mounts
- Gets business data from BusinessProvider
- Calls `fetchChats(business)` to initiate data fetching
- Returns `isLoading` state for UI feedback

**Flow:**
```
useInitializeChats() 
    → useEffect runs on mount 
    → fetchChats(business) 
    → /api/chats 
    → WhatsApp API (if cache miss)
    → Update store 
    → Persist to localStorage
```

---

### 4. `components/chat-initializer.tsx`

**Purpose:** Client component wrapper that initializes chat data.

**Responsibilities:**
- Wraps children with chat initialization logic
- Uses `useInitializeChats` hook
- Renders children immediately (non-blocking)

**Placement in Layout:**
```tsx
<BusinessProvider>
    <ChatInitializer>        {/* ← Runs useInitializeChats */}
        <ContactInitializer> {/* ← Waits for chats, then fetches contacts */}
            <AppLayout>
                {children}
            </AppLayout>
        </ContactInitializer>
    </ChatInitializer>
</BusinessProvider>
```

---

### 5. `components/contact-initializer.tsx`

**Purpose:** Fetches contact data based on chats.

**Responsibilities:**
- Watches chat store for changes
- When chats are loaded: extracts JIDs from chats
- Filters out contacts already in contact-store
- Batch fetches missing contacts from `/api/contacts/batch`
- Updates contact-store with new contacts

**Dependencies:**
- Requires `chat-store` to be loaded first
- Uses `ContactInitializerProps` children pattern

---

### 6. `components/providers/business-context.tsx`

**Purpose:** React Context for providing business data to all components.

**Responsibilities:**
- Creates `BusinessContext`
- Provides business data to all child components
- Used by `useBusiness()` hook

**Data Flow:**
```
Server Layout (fetches business from DB)
    ↓
<BusinessProvider business={business}>
    ↓
useBusiness() hook reads context
```

---

### 7. `hooks/useBusiness.ts`

**Purpose:** Hook to access business data from BusinessProvider context.

**Usage:**
```typescript
const business = useBusiness();
// business.id for API calls
```

---

## Data Flow

### Initial Load (First Visit)

```
1. User visits app
       │
2. Server Layout runs
   - requireAuth() checks authentication
   - getBusinessFromUser() fetches business from DB
   - Renders HTML with BusinessProvider
       │
3. Client hydrates
   - ChatInitializer mounts
   - useInitializeChats() hook runs
       │
4. fetchChats(business) called
   - Checks: isLoading=false, isLoaded=false
   - Calls: GET /api/chats?businessId=1&wappUrl=...
       │
5. API Route (/api/chats)
   - Checks server cache
   - Cache MISS → calls WhatsApp API
   - Stores result in cache
   - Returns chats to client
       │
6. Chat store updates
   - set({ chats, isLoaded: true })
   - Zustand persist middleware saves to localStorage
       │
7. ContactInitializer detects chats loaded
   - Extracts JIDs from chats
   - Filters already-cached contacts
   - Batch fetches missing contacts
   - Updates contact-store
       │
8. Page renders with all data
```

### Subsequent Navigations

```
1. User clicks link to different page
       │
2. Server Layout re-runs (App Router behavior)
   - BusinessProvider receives same business data
   - NO WhatsApp API call (business already in context)
       │
3. Client:
   - ChatInitializer mounts
   - useInitializeChats() runs
   - fetchChats(business) called
       │
4. fetchChats checks state:
   - isLoaded = true (from localStorage)
   - Returns early (no API call)
       │
5. Chats already in store (instant)
   - ContactInitializer sees chats loaded
   - Already-cached contacts used
       │
6. Page renders instantly
```

### Page Reload

```
1. User refreshes page
       │
2. Browser loads app fresh
       │
3. Zustand persist middleware:
   - Reads 'nenichat-chats' from localStorage
   - Restores: chats=[...], isLoaded=true
       │
4. ChatInitializer mounts
       │
5. useInitializeChats() runs
   - isLoaded = true (restored from localStorage)
   - Returns early (no fetch)
       │
6. Page renders with cached chats instantly
```

## Caching Strategy

### Two-Level Cache

| Level | Storage | TTL | Invalidation |
|-------|---------|-----|--------------|
| Server | In-memory (Map) | 5 min | TTL expiry, server restart |
| Client | localStorage | Forever | Manual clear, storage clear |

### Cache Invalidation Options

**Option 1: Wait for TTL**
- Default behavior
- Cache expires after 5 minutes
- Next request fetches fresh data

**Option 2: Manual DELETE endpoint**
```bash
DELETE /api/chats?businessId=123
```
- Clears server cache for specific business
- Next request fetches fresh data

**Option 3: Client-side clear**
```typescript
const { clearChats } = useChatStore();
clearChats(); // Resets store and localStorage
```

**Option 4: Webhook integration** (future)
- When new message arrives, webhook calls DELETE
- Cache cleared, next fetch gets fresh data

## To Modify Later

### Change Cache Duration

**Server (API route):**
```typescript
// app/api/chats/route.ts
const TTL_MS = 5 * 60 * 1000; // Change this value
```

### Change localStorage Key

**Client (chat-store):**
```typescript
// stores/chat-store.ts
{
    name: 'nenichat-chats', // Change this key
}
```

### Add Polling for Updates

**Client (chat-store):**
```typescript
fetchChats: async (business) => {
    // ... existing code
    
    // Add polling after successful fetch
    setTimeout(() => {
        set({ isLoaded: false }); // Allow re-fetch
        fetchChats(business);
    }, 60000); // Every 1 minute
}
```

### Add Real-time Updates

**Future enhancement:**
- Implement WebSocket connection to WhatsApp
- On new message event: update chat-store directly
- No polling needed

## Troubleshooting

### Chats not loading

1. Check browser console for `[CHAT_STORE]` logs
2. Verify business data exists in BusinessProvider
3. Check Network tab for `/api/chats` request
4. Verify WhatsApp API is accessible

### Chats not persisting

1. Check localStorage for `nenichat-chats` key
2. Verify localStorage is not full
3. Check browser privacy settings (may block localStorage)

### Contacts not loading

1. Check chat store has chats loaded first
2. Verify `/api/contacts/batch` endpoint exists
3. Check contact-store for existing contacts

## API Reference

### GET /api/chats

**Request:**
```
GET /api/chats?businessId=123&wappUrl=http://192.168.1.64/api/user/123
```

**Response:**
```json
[
  {
    "jid": "1234567890@s.whatsapp.net",
    "name": "John Doe",
    "last_message_time": "2024-01-15T10:30:00.000Z",
    "ephemeral_expiration": 0,
    "is_group": false,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
]
```

### DELETE /api/chats

**Request:**
```
DELETE /api/chats?businessId=123
```

**Response:**
```json
{
  "success": true,
  "message": "Cache cleared for business"
}
```
