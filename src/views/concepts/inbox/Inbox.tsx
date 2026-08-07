import React, { useState } from 'react';
import { useChatState } from './hooks/useChatState';
import { ChatSidebar } from './components/ChatSidebar';
import { ChatArea } from './components/ChatArea';
import { ContactDetails } from './components/ContactDetails';
import { useSessionUser } from '@/store/authStore';

const Inbox = () => {
    const { user } = useSessionUser();
    const currentUserId = user?.id; 
    const [isInfoOpen, setIsInfoOpen] = useState(false);

    const {
        conversations,
        activeChat,
        currentMessages,
        cannedResponses,
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
        totalCount,
        assignConversation,
        closeConversation,
        loadMessageContext,
        handleEndConversation,
        setPage ,
    } = useChatState();

    return (
        <div className="relative flex h-[calc(100vh-120px)] w-full bg-[#f4f4f5] dark:bg-[#0f172a] rounded-[2rem] overflow-hidden animate-[fadeIn_0.3s_ease-out]">            
            
            {/* ======================================= */}
            {/* 🌟 ۱. بخش لیست گفتگوها (Sidebar) */}
            {/* در موبایل: اگر چت باز باشد مخفی می‌شود. در دسکتاپ: همیشه پیداست */}
            {/* ======================================= */}
            <div className={`h-full shrink-0 transition-all duration-300 ${
                activeChatId ? 'hidden lg:block' : 'block w-full lg:w-auto'
            }`}>
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
                    totalCount={totalCount}
                    currentUserId={currentUserId}
                />
            </div>

            {/* ======================================= */}
            {/* 🌟 ۲. بخش محیط چت (Chat Area) */}
            {/* در موبایل: اگر چت باز نباشد مخفی می‌شود. در دسکتاپ: همیشه پیداست */}
            {/* ======================================= */}
            <div className={`flex-1 overflow-hidden my-0 lg:my-3 mx-0 lg:mx-3 rounded-none lg:rounded-3xl bg-white dark:bg-[#1c242f] shadow-none lg:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] dark:lg:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.4)] lg:border border-gray-100/80 dark:border-gray-800/50 transition-all duration-300 flex-col ${
                !activeChatId ? 'hidden lg:flex' : 'flex'
            }`}>          
                <ChatArea 
                    activeChat={activeChat}
                    messages={currentMessages}
                    onSendMessage={sendMessage}
                    onSendFile={SendFile}
                    currentUserId={currentUserId}
                    onResendMessage={ResendMessage}
                    onDeleteMessage={DeleteMessage}
                    cannedResponses={cannedResponses}
                    onToggleInfo={() => setIsInfoOpen(!isInfoOpen)}
                    isInfoOpen={isInfoOpen}
                    onBackToList={() => setActiveChatId(null)} 

                    onAssignToMe={() => {
                        if (currentUserId) {
                            assignConversation(currentUserId);
                        }
                    }}
                    onCloseConversation={() => {
                        if (closeConversation) {
                            closeConversation(currentUserId);
                        }
                    }}
                    onEndConversation={handleEndConversation}
                    onLoadMessageContext={loadMessageContext}
                />
            </div>

            {/* ======================================= */}
            {/* ۳. سایدبار اطلاعات مشتری (Contact Details) */}
            {/* ======================================= */}
           <div 
                className={`absolute z-40 rtl:left-6 ltr:right-6 top-6 bottom-6 w-[260px] xl:w-[280px] transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] overflow-hidden rounded-[24px] shadow-[0_30px_60px_rgba(0,0,0,0.15)] dark:shadow-[0_30px_60px_rgba(0,0,0,0.7)] border border-white/60 dark:border-white/10 backdrop-blur-2xl bg-white/60 dark:bg-[#151b23]/70 ${
                    isInfoOpen 
                    ? 'opacity-100 pointer-events-auto translate-x-0 scale-100' 
                    : 'opacity-0 pointer-events-none rtl:-translate-x-12 ltr:translate-x-12 scale-95'
                }`}
            >
                <ContactDetails activeChat={activeChat} onClose={() => setIsInfoOpen(false)} />
            </div>
        </div>
    );
};

export default Inbox;