1. Query messages from the database
2. Query contacts from supabase
3. Send response to client.

Each user of our platform has its own
    - wapp container: manages wapp
    - api container: directly reads wapp container database and makes it accessible via api

To access their containers, we can
    a) set a fixed port for each container, about 63000 possible containers, so that we can query them via http://localhost:{port}/tables/chats/rows
    b) use a reverse proxy, accessing the containers via paths, where https://api.nenichat.com/api/{userId}/chats, infinite possible containers (limited by ram), but not possible to access containers from outside the server, and complex setup

## Layout Structure

The chats route uses a nested layout pattern:

- `layout.tsx` - Main layout with sidebar (RecentChats) and content area
- `page.tsx` - Individual chat view (loaded when a chat is selected)
- `loading.tsx` - Loading state for navigation

### Performance Optimization

The chat list fetch is an expensive external API call to the user's WhatsApp container. To prevent blocking navigation, we use React Suspense:

1. **`chat-list-loader.tsx`** - Server component that fetches chat data from the external API
2. **`layout.tsx`** - Wraps `RecentChatsWrapper` in `<Suspense>` with a spinner fallback
3. **`loading.tsx`** - Provides instant loading feedback when navigating within the chats route

This allows the page to render immediately while the chat list loads in the background, rather than blocking the entire page until the external API responds.