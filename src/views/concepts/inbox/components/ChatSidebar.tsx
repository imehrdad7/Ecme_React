import { useEffect, useRef } from 'react';
import { HiOutlineSearch } from 'react-icons/hi';
import { ConversationItem } from './ConversationItem';
import { Conversation } from '../types';

interface Props {
    conversations: Conversation[];
    activePlatformIds?: string[];
    activeChatId: string | null;
    setActiveChatId: (id: string) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    selectedPlatform: string;
    setSelectedPlatform: (platform: string) => void;
    chatFilterMode: 'all' | 'waiting';
    setChatFilterMode: (mode: 'all' | 'waiting') => void;
    isLoading?: boolean;
    isLoadingMore?: boolean;
    hasMore?: boolean;
    onLoadMore?: () => void;
    totalCount: number;
    currentUserId?: string | null;
}

const PLATFORMS = [
    { id: 'all', label: 'همه پلتفرم‌ها' },
    { id: 'telegram', label: 'تلگرام' },
    { id: 'whatsapp', label: 'واتس‌اپ' },
    { id: 'instagram', label: 'اینستاگرام' },
    { id: 'bale', label: 'بله' },
];

export const ChatSidebar = ({
    conversations,
    activePlatformIds = [],
    activeChatId,
    setActiveChatId,
    searchQuery,
    setSearchQuery,
    selectedPlatform,
    setSelectedPlatform,
    chatFilterMode,
    setChatFilterMode,
    isLoading = false,
    isLoadingMore = false,
    hasMore = false,
    onLoadMore,
    totalCount,
    currentUserId
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

    const availablePlatforms = PLATFORMS.filter(platform => {
        if (platform.id === 'all') return true;

        return conversations.some(chat =>
            chat.platform && chat.platform.toLowerCase() === platform.id.toLowerCase()
        );
    });

    return (
        <div className="w-full md:w-[300px] h-[calc(100%-24px)] my-3 mr-3 rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.4)] border border-gray-100 dark:border-gray-800/60 overflow-hidden flex flex-col flex-shrink-0 bg-white dark:bg-[#1c242f] z-30 transition-all duration-300">
            <div className="px-3 pt-3 pb-1 flex flex-col gap-3 bg-white dark:bg-[#1c242f] z-10 border-b border-gray-100/50 dark:border-gray-800/50">
                <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center min-w-[36px] h-[36px] bg-[#3390ec]/10 dark:bg-[#8774e1]/15 text-[#3390ec] dark:text-[#8774e1] rounded-full text-xs font-bold px-2 shadow-sm border border-[#3390ec]/20 dark:border-[#8774e1]/20">
                        {totalCount}
                    </div>
                    <div className="flex-1 relative flex items-center bg-[#f4f4f5] dark:bg-[#2b3643] rounded-full px-3 py-2 transition-colors focus-within:bg-white dark:focus-within:bg-[#212b36] focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500/50 border border-transparent">
                        <HiOutlineSearch className="text-lg text-gray-400 min-w-[18px]" />
                        <input
                            type="text"
                            placeholder="جستجو در گفتگوها..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-transparent border-none outline-none px-2 text-[13.5px] text-gray-800 dark:text-gray-100 placeholder-gray-400 dir-auto"
                        />
                    </div>
                </div>
                <div className="flex p-1 bg-gray-100/80 dark:bg-gray-800/60 rounded-xl relative">
                    <button
                        onClick={() => { if (chatFilterMode !== 'all') setChatFilterMode('all'); }}
                        className={`flex-1 py-1.5 text-[12px] font-bold rounded-lg transition-all duration-300 z-10 ${chatFilterMode === 'all'
                            ? 'bg-white dark:bg-[#2b3643] text-gray-800 dark:text-gray-100 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                            }`}
                    >
                        صندوق ورودی
                    </button>

                    {conversations.some(c => c.mode === 1) && (
                        <div className="relative flex-1 flex overflow-hidden rounded-lg p-[1.5px]">
                            <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,transparent_0%,#ef4444_50%,transparent_100%)] opacity-70" />
                            <button
                                onClick={() => {
                                    if (chatFilterMode !== 'waiting') setChatFilterMode('waiting');
                                }}
                                className={`relative flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[12px] font-bold rounded-[6px] transition-all duration-300 z-10 ${chatFilterMode === 'waiting'
                                    ? 'bg-white dark:bg-[#2b3643] text-indigo-600 dark:text-indigo-400 shadow-sm'
                                    : 'bg-gray-100 dark:bg-[#1f2937] hover:bg-white dark:hover:bg-[#2b3643] text-gray-700 dark:text-gray-300'
                                    }`}
                            >
                                <span>نیازمند بررسی</span>
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
                            </button>
                        </div>
                    )}
                </div>

                <div className="flex items-center w-full gap-1.5 pb-2 pt-1">
                    {availablePlatforms.map((platform) => (
                        <button
                            key={platform.id}
                            onClick={(e) => {
                                e.preventDefault();
                                if (selectedPlatform !== platform.id) {
                                    setSelectedPlatform(platform.id);
                                }
                            }}
                            className={`flex-1 flex justify-center whitespace-nowrap px-1 py-1.5 text-[12px] font-semibold rounded-xl transition-all duration-200 ${selectedPlatform === platform.id
                                ? 'bg-[#3390ec] text-white dark:bg-[#8774e1] shadow-sm'
                                : 'bg-transparent text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                                }`}
                        >
                            {platform.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-x-hidden overflow-y-auto flex flex-col pt-2 pr-2 pl-0 auto-hide-scrollbar">

                {isLoading && conversations.length === 0 ? (
                    <div className="flex flex-col animate-pulse">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div
                                key={i}
                                className="flex flex-col justify-center px-3 py-6 min-h-[90px] mb-1 bg-white dark:bg-[#212b36] rounded-xl border border-gray-100/60 dark:border-white/5"
                            >
                                <div className="flex justify-between items-center w-full mb-2">
                                    <div className="h-3.5 bg-gray-200 dark:bg-gray-800 rounded w-28"></div>
                                    <div className="h-2.5 bg-gray-100 dark:bg-gray-800/50 rounded w-10"></div>
                                </div>
                                <div className="flex justify-between items-center w-full">
                                    <div className="h-3 bg-gray-100 dark:bg-gray-800/50 rounded w-full max-w-[180px]"></div>
                                    <div className="w-4 h-4 bg-gray-200 dark:bg-gray-800 rounded-full"></div>
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
                                currentUserId={currentUserId}
                                onClick={() => setActiveChatId(chat.id)}
                            />
                        ))}
                        {isLoadingMore && (
                            <div className="flex justify-center p-3">
                                <div className="w-5 h-5 border-2 border-[#3390ec] dark:border-[#8774e1] border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        )}
                        <div ref={observerTarget} className="h-4 w-full flex-shrink-0"></div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-4 opacity-60">
                        <span className="text-[13px] font-medium">گفتگویی یافت نشد.</span>
                    </div>
                )}
            </div>
        </div>
    );
};