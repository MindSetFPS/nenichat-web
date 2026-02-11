/* Represents different states of a container 
'empty': The container was created, but hasnt received a compose setup yet.
'created': The container received a compose setup, but has not been deployed yet.
'deployed': The container has been deployed, but doesnt have a phone number connected yet.
'connected': The container has beed deployed and has a phone number connected.
'error': The container has encountered an error.
'stopped': The container has been stopped, due to lack of payment or other reasons.
*/

export type container_states = 'empty' | 'created' | 'deployed' | 'connected' | 'error' | 'stopped'
