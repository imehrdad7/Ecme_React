import React, { useState } from 'react';
import { useChatState } from './hooks/useChatState';
import { ChatSidebar } from './components/ChatSidebar';
import { ChatArea } from './components/ChatArea';
import { ContactDetails } from './components/ContactDetails';
import { useSessionUser } from '@/store/authStore';


const Inbox = () => {
    const { user } = useSessionUser();
    const CURRENT_USER_ID = user?.id; 
    const [isInfoOpen, setIsInfoOpen] = useState(false);

    const {
        conversations,
        activeChat,
        currentMessages,
        activeChatId,
        setActiveChatId,
        searchQuery,
        setSearchQuery,
        sendMessage,
        SendFile,
        ResendMessage,
        DeleteMessage,
        isLoadingChats,
        selectedPlatform,
        setSelectedPlatform,
        isLoadingMore,
        hasMore,
        setPage 
    } = useChatState();

    return (
        <div className="flex h-[calc(100vh-120px)] w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-sm animate-[fadeIn_0.3s_ease-out]">
            
            <ChatSidebar 
                conversations={conversations}
                activeChatId={activeChatId}
                setActiveChatId={setActiveChatId}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedPlatform={selectedPlatform}
                setSelectedPlatform={setSelectedPlatform}
                isLoading={isLoadingChats}
                isLoadingMore={isLoadingMore}
                hasMore={hasMore}
                onLoadMore={() => setPage((prevPage: number) => prevPage + 1)}
            />

            <ChatArea 
                activeChat={activeChat}
                messages={currentMessages}
                onSendMessage={sendMessage}
                onSendFile={SendFile}
                currentUserId={CURRENT_USER_ID}
                onResendMessage={ResendMessage}
                onDeleteMessage={DeleteMessage}
                onToggleInfo={() => setIsInfoOpen(!isInfoOpen)}
                isInfoOpen={isInfoOpen}
            />

            <div 
                className={`transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden flex-shrink-0 bg-gray-50 dark:bg-gray-900/50 ${
                    isInfoOpen 
                    ? 'w-80 md:w-96 opacity-100 rtl:border-r ltr:border-l border-gray-200 dark:border-gray-700' 
                    : 'w-0 opacity-0 border-transparent'
                }`}
            >
                <div className="w-80 md:w-96 h-full">
                    <ContactDetails activeChat={activeChat} />
                </div>
            </div>
        </div>
    );
};

export default Inbox;