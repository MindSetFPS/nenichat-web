/**
 * Template for the initial docker-compose file for a WhatsApp container.
 */
export const INITIAL_COMPOSE_FILE = `services:
  wapp-ws-client:
    image: 192.168.1.73:3064/chat-ally/wapp-ws-client:latest
    restart: always
    networks:
      - wapp-network
    environment:
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
      - --webhook=http://chat-ally-api:8000/{business_id}
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
