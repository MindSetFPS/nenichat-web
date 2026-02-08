/**
 * Template for the initial docker-compose file for a WhatsApp container.
 */
export const INITIAL_COMPOSE_FILE = `services:
  whatsapp:
    image: aldinokemal2104/go-whatsapp-web-multidevice:v7.11.1
    restart: always
    networks:
      # - api-network
      # - wapp-network
      # IMPORTANT: Must include the network Traefik is running on
      - dokploy-network
    labels:
      - "traefik.enable=true"
      
      # --- Router Configuration ---
      # We use backslash (\) to escape the backticks needed for Traefik syntax inside this JS string
      - "traefik.http.routers.whatsapp-{business_id}.rule=PathPrefix(\`/api/user/{business_id}\`)"
      - "traefik.http.routers.whatsapp-{business_id}.entrypoints=web"
      
      # --- Middleware (Path Stripping) ---
      # This removes "/api/user/{business_id}" before sending the request to the Go app
      - "traefik.http.middlewares.strip-{business_id}.stripprefix.prefixes=/api/user/{business_id}"
      - "traefik.http.routers.whatsapp-{business_id}.middlewares=strip-{business_id}"
      
      # --- Service Configuration ---
      # Tell Traefik the container listens on port 3000 internally
      - "traefik.http.services.whatsapp-{business_id}.loadbalancer.server.port=3000"

    #volumes:
    #  - whatsapp_data:/app
    command:
      - rest
      - --basic-auth=admin:admin
      - --webhook=http://192.168.1.64:5102/webhook/{business_id}
      - --port=3000
      - --debug=true
      - --os=Chrome
      - --account-validation=false

networks:
  dokploy-network:
    external: true
  # api-network:
  #   Set to true if this network is created by another stack, false if created here
  #   external: true 
  # wapp-network:
  #  external: true
`;



/**
 * Template for the docker-compose file for a WhatsApp container with a specific phone.
 */
export const COMPOSE_FILE_WITH_PHONE = `services:
  wapp-ws-client:
    image: 192.168.1.73:3064/chat-ally/wapp-ws-client:latest
    restart: always
    networks:
      - wapp-network
    environment:
      - INITIAL_PHONE={initial_phone}
      - BUSINESS_ID={business_id}
      - WS_USERNAME=admin
      - WS_PASSWORD=admin
      - WS_URL=whatsapp:3000
      - SUPABASE_URL=\${{SUPABASE_URL}}
      - SUPABASE_KEY=\${{SUPABASE_KEY}}
    
  whatsapp:
    image: aldinokemal2104/go-whatsapp-web-multidevice
    restart: always
    networks:
      - api-network
      - wapp-network
    ports:
      - "{port}:3000"
    volumes:
      - whatsapp_data:/app
    command:
      - rest
      - --basic-auth=admin:admin
      - --webhook=http://chat-ally-api:8000/{business_id}/{phone_id}
      - --port=3000
      - --debug=true
      - --os=Chrome
      - --account-validation=false
  
volumes:
  whatsapp_data:

networks:
  api-network:
    name: api-network
    external: true
  wapp-network:
    name: wapp-network
    external: false
`;
