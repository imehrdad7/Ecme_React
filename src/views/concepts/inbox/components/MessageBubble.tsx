import { useState, useRef, useEffect } from 'react';
import { 
    HiX, 
    HiOutlineDotsVertical,
    HiOutlineRefresh,
    HiOutlineTrash
} from 'react-icons/hi';
import { Message } from '../types';
import appConfig from '@/configs/app.config'; 
import { VoicePlayer } from './VoicePlayer';
import { VideoPlayer } from './VideoPlayer';
import { ImageMessage } from './ImageMessage';
import { DocumentMessage } from './DocumentMessage';

interface Props {
    message: Message;
    currentUserId: string;
    onResend?: (messageId: string) => void;
    onDelete?: (messageId: string) => void;
    isFirstInGroup?: boolean;
    isLastInGroup?: boolean;
    searchTerm?: string;
}

const formatTime = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
};

const getFullMediaUrl = (mediaPath?: string | null) => {
    if (!mediaPath) return '';
    if (mediaPath.startsWith('http') || mediaPath.startsWith('blob:')) {
        return mediaPath;
    }
    const backendBaseUrl = appConfig.apiPrefix; 
    const separator = mediaPath.startsWith('/') ? '' : '/';
    return `${backendBaseUrl}${separator}${mediaPath}`;
};

const checkIsOnlyEmojis = (text: string) => {
    if (!text) return false;
    const noSpaceText = text.replace(/\s/g, '');
    if (noSpaceText.length === 0) return false;
    
    // رجکس جدید که شامل کاراکترهای نامرئیِ سازنده ایموجی (مثل \uFE0F) و رنگ پوست‌ها می‌شود
    const emojiRegex = /^[\p{Extended_Pictographic}\p{Emoji_Presentation}\uFE0F\u200D\p{Emoji_Modifier}]+$/gu;
    
    // اگر حتی یک حرف متنی داخل پیام باشد، غول‌پیکر نمی‌شود
    if (!emojiRegex.test(noSpaceText)) return false;

    // برای شمارش دقیق، کاراکترهای نامرئی (رنگ پوست و اتصالات) را موقتاً در نظر نمی‌گیریم
    const cleanForCount = noSpaceText.replace(/[\uFE0F\u200D\p{Emoji_Modifier}]/gu, '');
    const emojiCount = Array.from(cleanForCount).length; 
    
    return emojiCount > 0 && emojiCount <= 3;
};

const getJumboAnimationClass = (text: string) => {
    if (!text) return '';
    
    // قلب‌ها: تپش و بزرگ شدنِ عاشقانه ❤️
    if (/(❤️|🤍|💖|💔|💕|💘)/.test(text)) {
        return 'hover:scale-[1.3] transition-transform duration-300 ease-out cursor-pointer';
    }
    
    // خنده‌ها: لرزش، چرخش و پرش به بالا 😂
    if (/(😂|🤣|😁|😆|💀)/.test(text)) {
        return 'hover:-translate-y-4 hover:scale-110 hover:rotate-12 transition-all duration-300 ease-bounce cursor-pointer';
    }
    
    // جشن و انرژی: پرش و چرخش برعکس 🎉
    if (/(🎉|✨|🔥|🚀|💯)/.test(text)) {
        return 'hover:scale-125 hover:-rotate-12 hover:-translate-y-2 transition-all duration-300 ease-out cursor-pointer';
    }
    
    // پیش‌فرض برای سایر ایموجی‌ها: یک پرش ملایم به بالا
    return 'hover:scale-110 hover:-translate-y-2 transition-all duration-300 ease-out cursor-pointer';
};

export const MessageBubble = ({ message, currentUserId, onResend, onDelete, isFirstInGroup = true, isLastInGroup = true , searchTerm}: Props) => {
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const isOutgoing = message.direction === 2;
    const isBot = isOutgoing && !message.senderUserId;
    const isFailed = message.status === 0 || message.status === 1;

    const alignmentClass = isOutgoing 
        ? 'ltr:self-end rtl:self-start ltr:items-end rtl:items-start'
        : 'ltr:self-start rtl:self-end ltr:items-start rtl:items-end'; 

    const bubbleStyle = isOutgoing
        ? isBot 
            ? `bg-[#f0f4f9] dark:bg-indigo-900/60 text-gray-800 dark:text-gray-100 rounded-2xl ${isFirstInGroup ? 'rounded-tr-md' : ''} ${isLastInGroup ? 'rounded-br-none' : ''} shadow-[0_1px_2px_rgba(0,0,0,0.12)]` 
            : `bg-[#e3ffc8] dark:bg-[#2b5278] text-gray-900 dark:text-gray-100 rounded-2xl ${isFirstInGroup ? 'rounded-tr-md' : ''} ${isLastInGroup ? 'rounded-br-none' : ''} shadow-[0_1px_2px_rgba(0,0,0,0.15)]` 
        : `bg-white dark:bg-[#182533] text-gray-900 dark:text-gray-100 rounded-2xl ${isFirstInGroup ? 'rounded-tl-md' : ''} ${isLastInGroup ? 'rounded-bl-none' : ''} shadow-[0_1px_2px_rgba(0,0,0,0.12)]`; 

    const hasMedia = !!message.mediaUrl;
    const fullMediaUrl = getFullMediaUrl(message.mediaUrl);
    const fileName = message.mediaUrl?.split('/').pop() || 'downloaded-file';

    const isJumboEmoji = !hasMedia && checkIsOnlyEmojis(message.textContent || '');

    const hasActions = onDelete || (isFailed && onResend);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
        };
        if (showMenu) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showMenu]);

    const isImage = message.type === 2 || (message.type !== 3 && message.type !== 5 && message.mediaUrl?.match(/\.(jpg|jpeg|png|gif|webp)$/i) !== null);
    const isVideo = message.type === 3 || (message.type !== 2 && message.type !== 5 && message.mediaUrl?.match(/\.(mp4|webm|ogv|mov|mkv)$/i) !== null);   
    const isAudio = message.type === 5 || (message.type !== 2 && message.type !== 3 && message.mediaUrl?.match(/\.(mp3|wav|ogg|oga|m4a)$/i) !== null);
    const isDocument = message.type === 4 || (!isImage && !isVideo && !isAudio);

    const highlightMatch = (text?: string, term?: string) => {
        if (!text) return null;
        if (!term || term.trim() === '') return text;

        let escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        escapedTerm = escapedTerm.replace(/ی|ي/g, '[یي]');
        escapedTerm = escapedTerm.replace(/ک|ك/g, '[کك]');
        
        const regex = new RegExp(`(${escapedTerm})`, 'gi');
        const parts = text.split(regex);

        return (
            <>
                {parts.map((part, index) => 
                    index % 2 !== 0 ? ( 
                        <mark key={index} className="bg-yellow-300 dark:bg-yellow-500/90 text-gray-900 rounded-[2px] px-[2px] font-bold shadow-sm">
                            {part}
                        </mark>
                    ) : (
                        <span key={index}>{part}</span>
                    )
                )}
            </>
        );
    };

  return (
        <>
            {/* 🌟 استایل اختصاصی برای انیمیشن فنری ورود ایموجی */}
            <style>
                {`
                @keyframes jumbo-entrance {
                    0% { transform: scale(0.1) rotate(-30deg); opacity: 0; }
                    50% { transform: scale(1.3) rotate(15deg); opacity: 1; }
                    75% { transform: scale(0.9) rotate(-5deg); }
                    100% { transform: scale(1) rotate(0deg); opacity: 1; }
                }
                .animate-jumbo-entry {
                    animation: jumbo-entrance 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) both;
                }
                `}
            </style>

            <div className={`flex flex-col max-w-[85%] md:max-w-[75%] group ${alignmentClass} mb-1`}>
                
                {isOutgoing && !isJumboEmoji && (
                    <span className="text-[10px] font-medium text-gray-500 mb-1 px-1">
                        {isBot ? 'ربات سیستم' : 'شما (اپراتور)'}
                    </span>
                )}
                
                <div className="flex items-center gap-1.5 relative">
                    
                    {hasActions && (
                        <div 
                            className={`relative flex items-center ${isOutgoing ? 'ltr:order-1 rtl:order-2' : 'ltr:order-2 rtl:order-1'}`} 
                            ref={menuRef}
                        >
                            <button 
                                onClick={() => setShowMenu(!showMenu)}
                                className={`p-1 rounded transition-colors ${
                                    isFailed 
                                    ? 'text-red-500 hover:text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 opacity-100' 
                                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 opacity-0 group-hover:opacity-100'
                                } ${showMenu ? 'opacity-100 bg-gray-100 dark:bg-gray-800' : ''}`}
                            >
                                <HiOutlineDotsVertical size={16} />
                            </button>
                            
                            {showMenu && (
                                <div className={`absolute top-1/2 -translate-y-1/2 min-w-[135px] bg-white dark:bg-gray-800 rounded-lg shadow-[0_4px_16px_rgba(0,0,0,0.15)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.4)] border border-gray-100 dark:border-gray-700 py-1 z-[100] animate-in fade-in zoom-in-95 duration-100 ${
                                    isOutgoing ? 'right-full mr-1.5' : 'left-full ml-1.5'
                                }`}>
                                    {isFailed && onResend && (
                                        <>
                                            <button onClick={() => { onResend(message.id); setShowMenu(false); }} className="flex items-center gap-2.5 px-3 py-1.5 text-[12.5px] font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors w-full text-start">
                                                <HiOutlineRefresh className="text-gray-400 text-[14px]" />
                                                <span>ارسال مجدد</span>
                                            </button>
                                            <div className="h-px bg-gray-100 dark:bg-gray-700 my-1 mx-2"></div>
                                        </>
                                    )}
                                    {onDelete && (
                                        <button onClick={() => { onDelete(message.id); setShowMenu(false); }} className="flex items-center gap-2.5 px-3 py-1.5 text-[12.5px] font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full text-start">
                                            <HiOutlineTrash className="text-red-400 text-[14px]" />
                                            <span>حذف پیام</span>
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* === حباب پیام === */}
                    <div className={`relative ${isJumboEmoji ? '' : `p-2.5 ${bubbleStyle}`} ${isOutgoing ? 'ltr:order-2 rtl:order-1' : 'ltr:order-1 rtl:order-2'}`}>
                        
                        {isLastInGroup && isOutgoing && !isJumboEmoji && (
                            <svg className={`absolute bottom-0 -right-[8px] ${isBot ? 'text-[#f0f4f9] dark:text-indigo-900/60' : 'text-[#e3ffc8] dark:text-[#2b5278]'}`} width="9" height="16" viewBox="0 0 9 16" fill="currentColor">
                                <path d="M0 0C0 8 4 12 9 16L0 16Z" />
                            </svg>
                        )}
                        
                        {isLastInGroup && !isOutgoing && !isJumboEmoji && (
                            <svg className={`absolute bottom-0 -left-[8px] text-white dark:text-[#182533]`} width="9" height="16" viewBox="0 0 9 16" fill="currentColor">
                                <path d="M9 0C9 8 5 12 0 16L9 16Z" />
                            </svg>
                        )}

                        {hasMedia && (
                            <div className="mb-2 relative rounded-lg overflow-hidden max-w-sm">
                                {isImage && (
                                    <ImageMessage src={fullMediaUrl} onClick={() => setIsImageModalOpen(true)} />
                                )}
                                {isVideo && (
                                    <div className="relative w-full rounded-2xl mb-2 overflow-hidden shadow-sm">
                                        <VideoPlayer src={fullMediaUrl} isOutgoing={isOutgoing} />
                                    </div>
                                )}
                                {isAudio && (
                                    <div className="relative w-full rounded-2xl mb-2 overflow-hidden shadow-sm">
                                        <VoicePlayer src={fullMediaUrl} isOutgoing={isOutgoing} />
                                    </div>
                                )}
                                {isDocument && (
                                    <DocumentMessage src={fullMediaUrl} fileName={fileName} isOutgoing={isOutgoing} />
                                )}
                            </div>
                        )}
                        
                        {message.textContent && (
                            isJumboEmoji ? (
                                <div className="animate-jumbo-entry relative z-10" dir="auto">
                                    
                                    <div 
                                        className={`text-[64px] sm:text-[72px] leading-none drop-shadow-[0_10px_25px_rgba(0,0,0,0.15)] dark:drop-shadow-[0_10px_25px_rgba(0,0,0,0.5)] origin-bottom inline-block ${getJumboAnimationClass(message.textContent)}`} 
                                    >
                                        {message.textContent}
                                    </div>
                                    
                                </div>
                            ) : (
                                <div className="text-[13px] leading-[1.65] whitespace-pre-wrap px-1 font-medium relative z-10" dir="auto">
                                    {highlightMatch(message.textContent, searchTerm)}
                                </div>
                            )
                        )}

                        <div className={`flex items-center justify-end gap-1 mt-1 relative z-10 ${
                            isJumboEmoji 
                            ? 'bg-black/5 dark:bg-white/10 rounded-full px-2.5 py-[2px] w-max ltr:ml-auto rtl:mr-auto shadow-sm backdrop-blur-sm' 
                            : 'px-1 opacity-70'
                        }`}>
                            <span className={`text-[10px] font-medium ${isJumboEmoji ? 'text-gray-500 dark:text-gray-300' : ''}`}>
                                {formatTime(message.createdAt)}
                            </span>
                            {isOutgoing && (
                                <span className={`text-[11px] ${isJumboEmoji ? 'text-gray-500 dark:text-gray-300' : ''}`}>
                                    {message.status === 4 ? '✓✓' : message.status >= 2 ? '✓' : '🕒'}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal نمایش تصویر */}
            {isImageModalOpen && isImage && (
                <div 
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-sm transition-all duration-300 p-4 sm:p-8"
                    onClick={() => setIsImageModalOpen(false)}
                >
                    <button 
                        onClick={() => setIsImageModalOpen(false)}
                        className="absolute top-4 right-4 sm:top-6 sm:right-6 text-white/70 hover:text-white bg-black/50 hover:bg-black/80 rounded-full p-2 backdrop-blur-md transition-all"
                    >
                        <HiX className="text-2xl sm:text-3xl" />
                    </button>
                    <img
                        src={fullMediaUrl} 
                        alt="تصویر بزرگ"
                        className="max-w-full max-h-full object-contain rounded-lg shadow-2xl scale-100 select-none"
                        onClick={(e) => e.stopPropagation()} 
                    />
                </div>
            )}
        </>
    );
};