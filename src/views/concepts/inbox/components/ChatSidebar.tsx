import { useEffect, useRef } from 'react';
import { HiOutlineSearch, HiOutlineInbox } from 'react-icons/hi';
import Input from '@/components/ui/Input';
import { ConversationItem } from './ConversationItem';
import { Conversation } from '../types';

interface Props {
    conversations: Conversation[];
    activeChatId: string | null;
    setActiveChatId: (id: string) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    selectedPlatform: string;
    setSelectedPlatform: (platform: string) => void;
    isLoading?: boolean;
    isLoadingMore?: boolean;
    hasMore?: boolean;
    onLoadMore?: () => void;
}

const PLATFORMS = [
    { id: 'all', label: 'همه' },
    { id: 'telegram', label: 'تلگرام' },
    { id: 'whatsapp', label: 'واتس‌اپ' },
    { id: 'instagram', label: 'اینستاگرام' },
    { id: 'web', label: 'وب' },
];

export const ChatSidebar = ({ 
    conversations, 
    activeChatId, 
    setActiveChatId, 
    searchQuery, 
    setSearchQuery,
    selectedPlatform,
    setSelectedPlatform,
    isLoading = false,
    isLoadingMore = false,
    hasMore = false,
    onLoadMore
}: Props) => {
    
    const observerTarget = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !isLoading && !isLoadingMore && onLoadMore) {
                    onLoadMore();
                }
            },
            { threshold: 0.1 }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => {
            if (observerTarget.current) {
                observer.unobserve(observerTarget.current);
            }
        };
    }, [hasMore, isLoading, isLoadingMore, onLoadMore]);

    return (
        <div className="w-full md:w-[340px] lg:w-[360px] h-full border-l border-gray-100 dark:border-gray-800/60 flex flex-col flex-shrink-0 bg-gray-50/30 dark:bg-[#0f172a]/20">
            
            <div className="p-5 border-b border-gray-100 dark:border-gray-800/60 flex flex-col gap-5 bg-white dark:bg-gray-900/50 z-10 shadow-sm">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
                            <HiOutlineInbox className="text-xl" />
                        </div>
                        گفتگوها
                    </h3>
                    <span className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-base font-bold px-3 py-1.5 rounded-full">
                        {conversations.length}
                    </span>
                </div>
                
                {/* 🌟 سایز Input بزرگتر شد */}
                <Input
                    size="md"
                    placeholder="جستجوی مشتری..."
                    prefix={<HiOutlineSearch className="text-xl text-gray-400" />}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-gray-100/80 dark:bg-gray-800 border-transparent rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                />

                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none hide-scrollbar">
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none hide-scrollbar">
                        {PLATFORMS.map((platform) => (
                            <button
                                key={platform.id}
                                onClick={() => setSelectedPlatform(platform.id)}
                                className={`whitespace-nowrap px-3 py-1.5 text-[11px] font-semibold rounded-full transition-colors ${
                                    selectedPlatform === platform.id
                                        ? 'bg-indigo-500 text-white shadow-sm'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                                }`}
                            >
                                {platform.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 hover-scrollbar">
                
                {isLoading && conversations.length === 0 ? (
                    <div className="flex flex-col gap-3 p-1 animate-pulse">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex gap-4 items-center bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700/50">
                                <div className="w-14 h-14 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                                <div className="flex-1">
                                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-3"></div>
                                    <div className="h-2 bg-gray-100 dark:bg-gray-700/50 rounded w-full"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : conversations.length > 0 ? (
                    <>
                        {conversations.map((chat) => (
                            <ConversationItem 
                                key={chat.id} 
                                chat={chat} 
                                isSelected={chat.id === activeChatId} 
                                onClick={() => setActiveChatId(chat.id)} 
                            />
                        ))}

                        {isLoadingMore && (
                            <div className="flex justify-center p-4">
                                <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        )}
                        <div ref={observerTarget} className="h-4 w-full"></div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-4 opacity-60">
                        <div className="w-20 h-20 rounded-3xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-center">
                            <HiOutlineSearch className="text-4xl text-gray-300" />
                        </div>
                        <span className="text-sm font-semibold">مکالمه‌ای یافت نشد.</span>
                    </div>
                )}
            </div>
        </div>
    );
};