import { useEffect, useRef, useState } from 'react';
import { HiOutlineChatAlt2, HiOutlineDotsVertical, HiOutlineTrash , HiOutlineLockClosed , HiOutlineCheckCircle , HiOutlineArrowDown} from 'react-icons/hi';
import { FaWhatsapp , FaTelegramPlane , FaInstagram } from 'react-icons/fa';
import Button from '@/components/ui/Button';
import { Conversation, Message ,CannedResponse } from '../types';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { useSessionUser } from '@/store/authStore';
import { ChatHeader } from './ChatHeader';
import { apiSearchMessages, apiGetMessageContext} from '@/services/livechatService';
import { SearchListModal } from './SearchListModal';

interface Props {
    activeChat?: Conversation & {
        isPrivateChat?: boolean;
        chatName?: string;
        assigneeUserId?: string | null;
        status?: number;
    };
    messages: Message[];
    cannedResponses?: CannedResponse[];
    onSendMessage: (text: string) => void;
    onSendFile?: (file: File, type: 'image' | 'video' | 'document' | "voice") => void; 
    currentUserId: string; 
    onResendMessage?: (messageId: string) => void;
    onDeleteMessage?: (messageId: string) => void;
    onToggleInfo: () => void;
    isInfoOpen: boolean;
    onAssignToMe: () => void;
    onCloseConversation: () => void;
    onEndConversation: () => void;
    onLoadMessageContext?: (messageId: string) => Promise<void>;
    onBackToList?: () => void;
}

export const ChatArea = ({ 
    activeChat, 
    messages, 
    cannedResponses = [],
    onSendMessage, 
    onSendFile,
    currentUserId, 
    onResendMessage, 
    onDeleteMessage,
    onToggleInfo,
    isInfoOpen,
    onAssignToMe,
    onCloseConversation,
    onEndConversation,
    onLoadMessageContext,
    onBackToList
}: Props) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
    const [showEndConfirm, setShowEndConfirm] = useState(false);
    const [showScrollButton, setShowScrollButton] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const prevMessagesLengthRef = useRef(messages.length);
    const { user } = useSessionUser();
    const companyId = user?.companyId || '';

    // ==========================================
    // 🌟 استیت‌های کنترل سرچ یکپارچه
    // ==========================================
    const [isSearchMode, setIsSearchMode] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<Message[]>([]);
    const [currentSearchIndex, setCurrentSearchIndex] = useState(-1);
    const [isSearching, setIsSearching] = useState(false);
    const [appliedSearchTerm, setAppliedSearchTerm] = useState('');
    const [hasSearched, setHasSearched] = useState(false);
    const [isSearchListModalOpen, setIsSearchListModalOpen] = useState(false);


    useEffect(() => {
        if (showScrollButton && messages.length > prevMessagesLengthRef.current) {
            const newMessagesCount = messages.length - prevMessagesLengthRef.current;
            setUnreadCount(prev => prev + newMessagesCount);
        }
        prevMessagesLengthRef.current = messages.length;
    }, [messages.length, showScrollButton]);

    useEffect(() => {
        if (isSearchMode) {
            handleCloseSearch();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeChat?.id]);

    useEffect(() => {
        if (!isSearchMode) return;
        
        setHasSearched(false);
        setAppliedSearchTerm('');
       
        if (!searchTerm.trim()) {
            if (searchResults.length > 0) {
                setSearchResults([]);
                setCurrentSearchIndex(-1);
            }
            return;
        }

        const delaySearchTimer = setTimeout(() => {
            executeSearch(searchTerm);
        }, 1500);

        return () => clearTimeout(delaySearchTimer);
        
    }, [searchTerm, isSearchMode]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (isSearchMode && e.key === 'Escape') {
                handleCloseSearch();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
        
    }, [isSearchMode]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        setUnreadCount(0);
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);
    
    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            executeSearch(searchTerm);
        } else {
            handleCloseSearch();
        }
    };

    const executeScrollAnimation = (element: HTMLElement) => {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        document.querySelectorAll('.search-highlight').forEach(el => {
            el.classList.remove('bg-yellow-200/80', 'dark:bg-yellow-900/60', 'search-highlight', 'rounded-xl', 'transition-all', 'duration-1000');
        });

        element.classList.add('bg-yellow-200/80', 'dark:bg-yellow-900/60', 'search-highlight', 'rounded-xl', 'transition-all', 'duration-1000');
        
        setTimeout(() => {
            element.classList.remove('bg-yellow-200/80', 'dark:bg-yellow-900/60');
        }, 2500);
    };

    const scrollToAndHighlight = async (messageId: string) => {
        let targetElement = document.getElementById(`message-${messageId}`);
        
        if (targetElement) {
            executeScrollAnimation(targetElement);
        } else {
            if (onLoadMessageContext) {
                await onLoadMessageContext(messageId);
                
                setTimeout(() => {
                    const newlyLoadedElement = document.getElementById(`message-${messageId}`);
                    if (newlyLoadedElement) {
                        executeScrollAnimation(newlyLoadedElement);
                    } else {
                        console.warn("اسکرول: پیام حتی پس از دریافت تاریخچه در صفحه یافت نشد.");
                    }
                }, 500); 
            }
        }
    };


    const executeSearch = async (term: string) => {
        if (!term.trim() || !activeChat) return;

        setIsSearching(true);
        try {
            const response = await apiSearchMessages(activeChat.id, term.trim(), 1, 50);
            const foundMessages = response.items || [];
            
            setSearchResults(foundMessages);
            
            setAppliedSearchTerm(term.trim()); 
            setHasSearched(true);

            if (foundMessages.length > 0) {
                setCurrentSearchIndex(0);
                scrollToAndHighlight(foundMessages[0].id);
            } else {
                setCurrentSearchIndex(-1);
            }
        } catch (error) {
            console.error("خطا در جستجوی پیام‌ها", error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleNextResult = () => {
        if (currentSearchIndex < searchResults.length - 1) {
            const newIndex = currentSearchIndex + 1;
            setCurrentSearchIndex(newIndex);
            scrollToAndHighlight(searchResults[newIndex].id);
        }
    };

    const handlePrevResult = () => {
        if (currentSearchIndex > 0) {
            const newIndex = currentSearchIndex - 1;
            setCurrentSearchIndex(newIndex);
            scrollToAndHighlight(searchResults[newIndex].id);
        }
    };

    const handleCloseSearch = () => {
        setIsSearchMode(false);
        setAppliedSearchTerm('');
        setHasSearched(false);
        setSearchTerm('');
        setSearchResults([]);
        setCurrentSearchIndex(-1);
        setIsSearchListModalOpen(false);
        
        document.querySelectorAll('.search-highlight').forEach(el => {
            el.classList.remove('bg-yellow-200/80', 'dark:bg-yellow-900/60', 'search-highlight', 'rounded-xl', 'transition-all', 'duration-1000');
        });
    };

    if (!activeChat) {
        return (
            <div className="flex-1 w-full min-w-0 flex flex-col items-center justify-center bg-gray-50/50 dark:bg-[#0f172a]/30 h-full relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 dark:bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none"></div>

                <div className="relative z-10 flex flex-col items-center animate-[fadeIn_0.5s_ease-out]">
                    <div className="relative flex items-center justify-center w-36 h-36 mb-8">
                        <div className="absolute inset-0 bg-indigo-100 dark:bg-indigo-900/40 rounded-full animate-pulse"></div>
                        
                        <div className="relative flex items-center justify-center w-24 h-24 bg-white dark:bg-[#1c242f] rounded-full shadow-2xl border border-gray-100 dark:border-white/5 z-10">
                            <HiOutlineChatAlt2 className="text-[42px] text-indigo-500 dark:text-indigo-400" />
                        </div>

                        <div className="absolute -top-1 -right-4 w-12 h-12 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-lg transform rotate-12 animate-[bounce_3s_infinite] z-20 border-2 border-white dark:border-[#1c242f]">
                            <FaWhatsapp size={24} />
                        </div>
                        
                        <div className="absolute top-1/2 -left-6 w-11 h-11 bg-[#3390ec] text-white rounded-full flex items-center justify-center shadow-lg transform -rotate-12 animate-[bounce_4s_infinite] z-20 border-2 border-white dark:border-[#1c242f]">
                            <FaTelegramPlane size={20} className="-ml-1" />
                        </div>
                        
                        <div className="absolute -bottom-2 right-4 w-11 h-11 bg-gradient-to-tr from-[#f09433] via-[#e6683c] to-[#bc1888] text-white rounded-full flex items-center justify-center shadow-lg transform rotate-6 animate-[bounce_3.5s_infinite] z-20 border-2 border-white dark:border-[#1c242f]">
                            <FaInstagram size={20} />
                        </div>
                        <div className="absolute top-0 -left-4 w-12 h-12 transform -rotate-6 animate-[bounce_3.2s_infinite] z-20">
                            <svg 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-full h-full drop-shadow-lg"
                            >
                                <path 
                                    d="M12 22.5c-5.8 0-10.5-4.7-10.5-10.5 0-2.1.6-4.1 1.7-5.8L1.5 1.5l4.7 1.7c1.7-1.1 3.7-1.7 5.8-1.7 5.8 0 10.5 4.7 10.5 10.5S17.8 22.5 12 22.5z" 
                                    fill="white" 
                                    className="dark:fill-[#1c242f]"
                                />
                                <path 
                                    d="M12 21.5c-5.25 0-9.5-4.25-9.5-9.5 0-1.93.58-3.72 1.57-5.2L2.5 2.5l4.3 1.57C8.28 3.08 10.07 2.5 12 2.5c5.25 0 9.5 4.25 9.5 9.5s-4.25 9.5-9.5 9.5z" 
                                    fill="#00D09C" 
                                />
                                <path 
                                    d="M7.5 12.5L10.5 15.5L16.5 8.5" 
                                    stroke="white" 
                                    strokeWidth="2.5" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                />
                            </svg>
                        </div>
                    </div>

                    <h3 className="text-2xl sm:text-3xl font-black text-gray-800 dark:text-white mb-3 tracking-tight">
                        صندوق پیام‌های یکپارچه
                    </h3>
                    <p className="text-[13px] sm:text-[14px] font-bold text-gray-500 dark:text-gray-400 max-w-[320px] text-center leading-relaxed">
                        برای مشاهده جزئیات و شروع چت، یکی از گفتگوها را از لیست کناری انتخاب کنید.
                    </p>
                    
                    <div className="mt-8 px-5 py-2.5 bg-white dark:bg-[#1c242f] border border-gray-100 dark:border-gray-800/60 rounded-full shadow-sm flex items-center gap-2.5">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                        </span>
                        <span className="text-[12px] font-black text-gray-600 dark:text-gray-300 tracking-wide">
                            سیستم آماده دریافت پیام
                        </span>
                    </div>

                </div>
            </div>
        );
    }

    const userName = activeChat.contactName || activeChat.contactPhoneNumber || 'کاربر ناشناس';
    const isGroup = activeChat.isPrivateChat === false;
    const groupName = activeChat.chatName || 'گروه';
    const avatarLetter = userName !== 'کاربر ناشناس' ? userName.charAt(0) : '?';
    
    const isEnded = activeChat.status === 2;
    const isUnassigned = !activeChat.assigneeUserId;
    const isAssignedToMe = activeChat.assigneeUserId === currentUserId;
    const isAssignedToOther = !!activeChat.assigneeUserId && activeChat.assigneeUserId !== currentUserId;

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        const isScrolledUp = scrollHeight - scrollTop - clientHeight > 150;
        setShowScrollButton(isScrolledUp);

        if (!isScrolledUp) {
            setUnreadCount(0);
        }
    };

    

    return (
        <div className="flex-1 h-full flex flex-col bg-gray-50/50 dark:bg-gray-950/10 relative">
            
            {/* === Header === */}
            <ChatHeader 
                activeChat={activeChat}
                avatarLetter={avatarLetter}
                userName={userName}
                isGroup={isGroup}
                groupName={groupName}
                isUnassigned={isUnassigned}
                isAssignedToMe={isAssignedToMe}
                isAssignedToOther={isAssignedToOther}
                isInfoOpen={isInfoOpen}
                onToggleInfo={onToggleInfo}
                onCloseConversation={onCloseConversation}
                onEndConversationClick={() => setShowEndConfirm(true)}
                hasSearched={hasSearched}
                isSearchMode={isSearchMode}
                setIsSearchMode={setIsSearchMode}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                onSearchSubmit={handleSearchSubmit}
                searchResultsCount={searchResults.length}
                currentSearchIndex={currentSearchIndex}
                onNextResult={handleNextResult}
                onPrevResult={handlePrevResult}
                onCloseSearch={handleCloseSearch}
                isSearching={isSearching}
                onOpenListModal={() => setIsSearchListModalOpen(true)}
                onBackToList={onBackToList}
            />

            {/* === Messages Box === */}
            <div 
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col scrollbar-thin scrollbar-thumb-black/20 dark:scrollbar-thumb-white/20 bg-[url('/img/chat-bg.jpg')] bg-cover bg-center bg-fixed bg-no-repeat relative"
            >
                <div className="absolute inset-0 bg-white/60 dark:bg-black/60 -z-10 mix-blend-overlay"></div>

                {messages.map((msg, index) => {
                    const prevMsg = index > 0 ? messages[index - 1] : null;
                    const nextMsg = index < messages.length - 1 ? messages[index + 1] : null;
                    
                    const isConsecutive = prevMsg && 
                                          prevMsg.direction === msg.direction && 
                                          prevMsg.senderUserId === msg.senderUserId;
                    
                    const isFirstInGroup = !(prevMsg && 
                                            prevMsg.direction === msg.direction && 
                                            prevMsg.senderUserId === msg.senderUserId);

                    const isLastInGroup = !(nextMsg && 
                                            nextMsg.direction === msg.direction && 
                                            nextMsg.senderUserId === msg.senderUserId);
                    

                    const marginClass = index === 0 ? 'mt-0' : (isConsecutive ? 'mt-1' : 'mt-4');

                    return (
                        <div key={msg.id} id={`message-${msg.id}`} className={`w-full flex flex-col ${marginClass}`}>
                            <MessageBubble 
                                message={msg} 
                                currentUserId={currentUserId} 
                                onResend={onResendMessage}
                                onDelete={(id) => setMessageToDelete(id)} 
                                isLastInGroup={isLastInGroup} 
                                isFirstInGroup={isFirstInGroup}
                                searchTerm={isSearchMode ? appliedSearchTerm : ''}
                            />
                        </div>
                    );
                })}

                <div ref={messagesEndRef} />
            </div>
            
            {showScrollButton && (
                <button
                    onClick={scrollToBottom}
                    className="absolute bottom-24 right-8 z-20 w-[46px] h-[46px] flex items-center justify-center rounded-full bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] border border-white/40 dark:border-gray-700/50 text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800 hover:text-indigo-600 dark:hover:text-indigo-400 hover:-translate-y-1 transition-all duration-300 group animate-in fade-in slide-in-from-bottom-5"
                    title="پرش به جدیدترین پیام"
                >
                    <HiOutlineArrowDown className="text-xl group-hover:translate-y-0.5 transition-transform duration-200" />
                    
                    {unreadCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 min-w-[22px] h-[22px] px-1.5 flex items-center justify-center bg-indigo-500 text-white text-[11px] font-bold rounded-full shadow-sm ring-2 ring-white/80 dark:ring-gray-800 animate-in zoom-in-50 duration-300">
                            {unreadCount > 99 ? '+99' : unreadCount}
                        </span>
                    )}
                </button>
            )}
            
            {/* === Input Area === */}
            {isEnded ? (
                <div className="p-4 bg-gray-50/90 dark:bg-gray-900/90 backdrop-blur-sm border-t border-gray-200 dark:border-gray-800 flex items-center justify-center">
                    <p className="text-[13px] font-bold text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        <HiOutlineLockClosed className="text-[18px]" />
                        این مکالمه پایان یافته است و امکان ارسال پیام وجود ندارد.
                    </p>
                </div>
            ) : isAssignedToOther ? (
                <div className="p-4 bg-red-50/80 dark:bg-red-950/30 border-t border-red-100 dark:border-red-900/50 flex items-center justify-center">
                    <p className="text-[13px] font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
                        <HiOutlineLockClosed className="text-[18px]" />
                        این گفتگو توسط اپراتور دیگری در حال انجام است و شما مجاز به ارسال پیام نیستید.
                    </p>
                </div>
            ) : isUnassigned ? (
                <div className="p-5 bg-indigo-50/80 dark:bg-indigo-950/30 border-t border-indigo-100 dark:border-indigo-900/50 flex flex-col items-center justify-center gap-3">
                    <p className="text-[13px] font-bold text-indigo-700 dark:text-indigo-300">
                        برای پاسخگویی به این مشتری، ابتدا باید گفتگو را به خود اختصاص دهید.
                    </p>
                    <Button 
                        onClick={onAssignToMe} 
                        size="sm" 
                        className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm font-bold"
                    >
                        اختصاص این گفتگو به من
                    </Button>
                </div>
            ) : (
                <MessageInput 
                    companyId={companyId}
                    onSendMessage={onSendMessage} 
                    onSendFile={onSendFile} 
                    cannedResponses={cannedResponses}
                />
            )}

            {/* === Modals === */}
            {messageToDelete && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-all duration-300">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
                                <HiOutlineTrash className="text-3xl" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">حذف پیام</h3>
                            <p className="text-[13px] text-gray-500 dark:text-gray-400 leading-relaxed">
                                آیا از حذف این پیام مطمئن هستید؟ این عملیات غیرقابل بازگشت است و پیام پاک خواهد شد.
                            </p>
                        </div>
                        
                        <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-800">
                            <button 
                                onClick={() => setMessageToDelete(null)}
                                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors outline-none"
                            >
                                انصراف
                            </button>
                            <button 
                                onClick={() => {
                                    if (onDeleteMessage) onDeleteMessage(messageToDelete);
                                    setMessageToDelete(null);
                                }}
                                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 shadow-sm shadow-red-200 dark:shadow-none transition-colors outline-none"
                            >
                                بله، حذف کن
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showEndConfirm && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-all duration-300">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
                                <HiOutlineCheckCircle className="text-4xl" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">پایان قطعی مکالمه</h3>
                            <p className="text-[13px] text-gray-500 dark:text-gray-400 leading-relaxed">
                                آیا مشکل کاربر حل شده است؟ با این کار گفتگو بسته شده و پیام خداحافظی برای کاربر ارسال می‌شود.
                            </p>
                        </div>
                        
                        <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-800">
                            <button 
                                onClick={() => setShowEndConfirm(false)}
                                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors outline-none"
                            >
                                انصراف
                            </button>
                            <button 
                                onClick={() => {
                                    onEndConversation();
                                    setShowEndConfirm(false);
                                }}
                                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 shadow-sm shadow-red-200 dark:shadow-none transition-colors outline-none"
                            >
                                بله، پایان بده
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <SearchListModal 
                isOpen={isSearchListModalOpen}
                onClose={() => setIsSearchListModalOpen(false)}
                searchTerm={appliedSearchTerm}
                searchResults={searchResults}
                currentSearchIndex={currentSearchIndex}
                currentUserId={currentUserId}
                contactName={activeChat?.contactName}
                onSelectResult={(index, messageId) => {
                    setCurrentSearchIndex(index);
                    scrollToAndHighlight(messageId);
                    setIsSearchListModalOpen(false); // بستن مودال بعد از کلیک روی نتیجه
                }}
            />
        </div>
    );
};