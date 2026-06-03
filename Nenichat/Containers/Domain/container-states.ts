/* Represents different states of a container 
'none': There is no container or compose at all.
'empty': The container was created, but hasnt received a compose setup yet.
'created': The container received a compose setup, but has not been deployed yet.
'deployed': The container has been deployed, but doesnt have a phone number connected yet.
'connected': The container has been deployed and has a phone number connected.
'error': The container has encountered an error.
'stopped': The container has been stopped, due to lack of payment or other reasons.
'unreachable': The container is not responding (nuked/broken). Must be recreated.
*/

export type container_states = 'none' | 'empty' | 'created' | 'deployed' | 'connected' | 'error' | 'stopped' | 'unreachable'
