1. Query messages from the database
2. Query contacts from supabase
3. Send response to client.

Each user of our platform has its own
    - wapp container: manages wapp
    - api container: directly reads wapp container database and makes it accessible via api

To access their containers, we can
    a) set a fixed port for each container, about 63000 possible containers, so that we can query them via http://localhost:{port}/tables/chats/rows
    b) use a reverse proxy, accessing the containers via paths, where https://api.nenichat.com/api/{userId}/chats, infinite possible containers (limited by ram), but not possible to access containers from outside the server, and complex setup