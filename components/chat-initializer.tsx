/**
 * Chat Initializer Component
 * 
 * Wraps the app with chat initialization logic.
 * 
 * BEHAVIOR:
 * - Uses useInitializeChats hook to fetch chats on mount
 * - Runs once per app session
 * - Chats are persisted in localStorage, so subsequent loads are instant
 * 
 * PLACEMENT:
 * - Located in layout.tsx inside BusinessProvider
 * - Must be inside a client-side context (has 'use client' directive)
 * - Order: ChatInitializer → ContactInitializer → AppLayout
 * 
 * TO EDIT:
 * - Add loading state display here if needed
 * - Add error boundary around chat initialization
 * - Modify when/how chats are fetched
 * 
 * NOTE:
 * - This component doesn't render anything visible
 * - It handles data fetching in the background
 * - Children (the rest of the app) render immediately
 */

'use client';

import { useInitializeChats } from '@/hooks/use-initialize-chats';

interface ChatInitializerProps {
    children: React.ReactNode;
}

export function ChatInitializer({ children }: ChatInitializerProps) {
    useInitializeChats();
    return <>{children}</>;
}