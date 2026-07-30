import { useState, useRef, useEffect } from 'react';
import { 
    HiX, 
    HiDownload, 
    HiDocument,
    HiOutlineDotsVertical,
    HiOutlineRefresh,
    HiOutlineDuplicate,
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
}

const formatTime = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
};

const isImageFile = (url?: string) => {
    if (!url) return false;
    return /\.(jpeg|jpg|gif|png|webp|svg)(\?.*)?$/i.test(url);
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

export const MessageBubble = ({ message, currentUserId, onResend, onDelete }: Props) => {
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const isOutgoing = message.direction === 2;
    const isBot = isOutgoing && !message.senderUserId;
    const isAgent = isOutgoing && !!message.senderUserId;
    const isFailed = message.status === 0 || message.status === 1;

    const bubbleStyle = isOutgoing
        ? isBot 
            ? 'bg-indigo-50 dark:bg-indigo-900/40 text-gray-800 dark:text-gray-100 rounded-tr-sm border border-indigo-100 dark:border-indigo-800' 
            : 'bg-[#effdde] dark:bg-[#2b5278] text-gray-900 dark:text-gray-100 rounded-tr-sm shadow-sm' 
        : 'bg-white dark:bg-[#182533] text-gray-900 dark:text-gray-100 rounded-tl-sm shadow-sm border border-gray-100 dark:border-gray-800'; 

    const hasMedia = !!message.mediaUrl;
    const fullMediaUrl = getFullMediaUrl(message.mediaUrl);
    const fileName = message.mediaUrl?.split('/').pop() || 'downloaded-file';

    // مدیریت کلیک خارج از پاپ‌اور برای بستن آن
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
        };
        if (showMenu) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showMenu]);


    const handleResend = () => {
        if (onResend) onResend(message.id);
        setShowMenu(false);
    };

    const handleDelete = () => {
        if (onDelete) onDelete(message.id);
        setShowMenu(false);
    };

    const isImage = message.type === 2 || (message.type !== 3 && message.type !== 5 && message.mediaUrl?.match(/\.(jpg|jpeg|png|gif|webp)$/i) !== null);
    const isVideo = message.type === 3 || (message.type !== 2 && message.type !== 5 && message.mediaUrl?.match(/\.(mp4|webm|ogv|mov|mkv)$/i) !== null);   
    const isAudio = message.type === 5 || (message.type !== 2 && message.type !== 3 && message.mediaUrl?.match(/\.(mp3|wav|ogg|oga|m4a)$/i) !== null);
    const isDocument = message.type === 4 || (!isImage && !isVideo && !isAudio);

    return (
        <>
            <div className={`flex flex-col max-w-[80%] md:max-w-[70%] group ${isOutgoing ? 'self-end items-end' : 'self-start items-start'}`}>
                
                {isOutgoing && (
                    <span className="text-[10px] font-medium text-gray-500 mb-1 px-1">
                        {isBot ? 'ربات سیستم' : 'شما (اپراتور)'}
                    </span>
                )}
                
                <div className="flex items-center gap-1.5 relative">
                    
                    {isOutgoing && isFailed && (
                        <div className="relative flex items-center" ref={menuRef}>
                            <button 
                                onClick={() => setShowMenu(!showMenu)}
                                className={`p-1 rounded text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors ${showMenu ? 'opacity-100 bg-red-50 dark:bg-red-900/30' : 'opacity-0 group-hover:opacity-100'}`}                            >
                                <HiOutlineDotsVertical size={16} />
                            </button>
                            {showMenu && (
                                <div className="absolute bottom-full mb-1.5 rtl:left-0 ltr:right-0 min-w-[135px] bg-white dark:bg-gray-800 rounded-lg shadow-[0_4px_16px_rgba(0,0,0,0.1)] dark:shadow-none border border-gray-200 dark:border-gray-700 py-1 z-[100] animate-in fade-in zoom-in-95 duration-100">
                                    
                                    <button 
                                        onClick={handleResend}
                                        className="flex items-center gap-2.5 px-3 py-1.5 text-[12.5px] font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors w-full text-start"
                                    >
                                        <HiOutlineRefresh className="text-gray-400 text-[14px]" />
                                        <span>ارسال مجدد</span>
                                    </button>

                                    <div className="h-px bg-gray-100 dark:bg-gray-700 my-1 mx-2"></div>
                                    
                                    <button 
                                        onClick={handleDelete}
                                        className="flex items-center gap-2.5 px-3 py-1.5 text-[12.5px] font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full text-start"
                                    >
                                        <HiOutlineTrash className="text-red-400 text-[14px]" />
                                        <span>حذف پیام</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* === حباب اصلی پیام === */}
                    <div className={`p-2.5 rounded-2xl ${bubbleStyle}`}>
                        {hasMedia && (
                            <div className="mb-2 relative rounded-lg overflow-hidden max-w-sm">
                                
                                {isImage && (
                                    <ImageMessage 
                                        src={fullMediaUrl} 
                                        onClick={() => setIsImageModalOpen(true)} 
                                    />
                                )}

                                {isVideo && (
                                    <div className={`relative w-full rounded-2xl mb-2 overflow-hidden shadow-sm border ${
                                        isOutgoing 
                                        ? 'border-indigo-100/50 dark:border-indigo-800/30' 
                                        : 'border-gray-100 dark:border-gray-700'
                                    }`}>
                                        <VideoPlayer 
                                            src={fullMediaUrl} 
                                            isOutgoing={isOutgoing} 
                                        />
                                    </div>
                                )}

                                {isAudio && (
                                    <div className={`relative w-full rounded-2xl mb-2 overflow-hidden shadow-sm border ${
                                        isOutgoing 
                                        ? 'bg-indigo-50/50 dark:bg-indigo-900/20 border-indigo-100/50 dark:border-indigo-800/30' 
                                        : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700'
                                    }`}>
                                        {/* استفاده از پلیر مدرن و اختصاصی */}
                                        <VoicePlayer 
                                            src={fullMediaUrl} 
                                            isOutgoing={isOutgoing} 
                                        />
                                    </div>
                                )}

                                {isDocument && (
                                    <DocumentMessage 
                                        src={fullMediaUrl} 
                                        fileName={fileName}
                                        isOutgoing={isOutgoing} 
                                    />
                                )}

                            </div>
                        )}
                        
                        {message.textContent && (
                            <div className="text-[15px] leading-relaxed whitespace-pre-wrap px-1" dir="auto">
                                {message.textContent}
                            </div>
                        )}

                        <div className="flex items-center justify-end gap-1 mt-1 px-1 opacity-70">
                            <span className="text-[10px] font-medium">
                                {formatTime(message.createdAt)}
                            </span>
                            {isOutgoing && (
                                <span className="text-[11px]">
                                    {message.status === 4 ? '✓✓' : message.status >= 2 ? '✓' : '🕒'}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* === مدال نمایش تمام صفحه عکس === */}
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