'use client';

import { ChatSidebar } from '@/components/chat/sidebar';
import { useAppStore } from '@/hooks/use-app-store';

function ChatsLayout({ children }: { children: React.ReactNode }) {
    const { isChatsOpen } = useAppStore();
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

            {/* Main Chat Area - Hidden on mobile if chatList is opened */}
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
