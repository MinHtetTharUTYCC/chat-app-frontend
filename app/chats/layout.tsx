'use client';

import { ChatSidebar } from '@/components/chat/sidebar';
import { useAppStore } from '@/hooks/use-app-store';
import { usePresenceSetup } from '@/hooks/use-presence-setup';

function ChatsLayout({ children }: { children: React.ReactNode }) {
    const { isChatsOpen } = useAppStore();
    usePresenceSetup();

    return (
        <main className="flex h-screen w-full overflow-hidden bg-background">
            <div
                className={`w-full md:w-[320px] lg:w-[380px] border-r shrink-0 ${
                    isChatsOpen ? 'flex-1' : 'hidden md:flex'
                }
              `}
            >
                <ChatSidebar />
            </div>

            {/* Chat window - Hidden on mobile if chatList is opened */}
            <div
                className={`
                flex-1 flex-col
                ${isChatsOpen ? 'hidden md:flex' : 'flex'}
              `}
            >
                {children}
            </div>
        </main>
    );
}

export default ChatsLayout;
