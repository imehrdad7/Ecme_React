import { HiOutlineLockClosed } from 'react-icons/hi';
import { FaTelegramPlane, FaWhatsapp, FaInstagram, FaGlobe } from 'react-icons/fa';
import { Conversation } from '../types';

interface Props {
    chat: Conversation & { 
        isAnsweredByBot?: boolean;
        isPrivateChat?: boolean;
        chatName?: string;
        assigneeUserId?: string | null;
        isRead?: boolean;
    };
    isSelected: boolean;
    onClick: () => void;
    currentUserId?: string | null ;
}

// 🌟 خلاقیت ۱: دریافت استایل‌های اختصاصی هر پلتفرم (رنگ، آیکون واترمارک)
const getPlatformStyle = (platform?: string) => {
    const pt = platform?.toLowerCase();
    switch (pt) {
        case 'telegram':
            return {
                icon: FaTelegramPlane,
                colorClass: 'bg-[#3390ec]',
                textClass: 'text-[#3390ec]',
                watermarkColor: 'text-[#3390ec]',
                gradient: 'from-[#3390ec] to-[#277ac9]'
            };
        case 'whatsapp':
            return {
                icon: FaWhatsapp,
                colorClass: 'bg-[#25D366]',
                textClass: 'text-[#25D366]',
                watermarkColor: 'text-[#25D366]',
                gradient: 'from-[#25D366] to-[#1da851]'
            };
        case 'instagram':
            return {
                icon: FaInstagram,
                colorClass: 'bg-[#E1306C]',
                textClass: 'text-[#E1306C]',
                watermarkColor: 'text-[#E1306C]',
                gradient: 'from-[#E1306C] to-[#b32454]'
            };
        default:
            return {
                icon: FaGlobe,
                colorClass: 'bg-gray-400',
                textClass: 'text-gray-500',
                watermarkColor: 'text-gray-400',
                gradient: 'from-gray-500 to-gray-600'
            };
    }
};

const formatSmartTime = (dateString?: string) => {
    if (!dateString) return '';
    const messageDate = new Date(dateString);
    const today = new Date();
    const timePart = messageDate.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });

    const isToday = messageDate.getDate() === today.getDate() && 
                    messageDate.getMonth() === today.getMonth() && 
                    messageDate.getFullYear() === today.getFullYear();

    if (isToday) {
        return timePart;
    } else {
        const datePart = messageDate.toLocaleDateString('fa-IR', { month: 'short', day: 'numeric' });
        return `${datePart} ${timePart}`;
    }
};

export const ConversationItem = ({ chat, isSelected, currentUserId, onClick }: Props) => {
    const lastMessageText = chat.lastMessage || 'پیامی ارسال نشده است...';
    const userName = chat.contactName || chat.contactPhoneNumber || 'کاربر ناشناس';
    const isGroup = chat.isPrivateChat === false;
    const groupName = chat.chatName || '';
    
    const isAssignedToOther = !!chat.assigneeUserId && chat.assigneeUserId !== currentUserId;
    const isAssignedToMe = !!chat.assigneeUserId && chat.assigneeUserId === currentUserId;
    const hasUnread = (chat.unreadCount ?? 0) > 0;

    const platformStyle = getPlatformStyle(chat.platform);
    const PlatformIcon = platformStyle.icon;

    return (
        <button
            onClick={onClick}
            // استایل پایه: فاصله بیشتر، گوشه‌های گردتر، و حالت شیشه‌ای در لایت/دارک مود
            className={`relative w-full text-left rtl:text-right flex flex-col justify-between p-4 min-h-[115px] mb-2.5 rounded-[22px] transition-all duration-300 outline-none group overflow-hidden ${          
                isSelected
                    ? `bg-gradient-to-br ${platformStyle.gradient} shadow-lg shadow-${platformStyle.colorClass}/20 scale-[1.02] z-10 border-transparent`
                    : 'bg-white dark:bg-[#1f2937]/60 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_20px_-10px_rgba(0,0,0,0.2)] border border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-white/10 hover:shadow-md hover:-translate-y-0.5'
            }`}
        >
            {/* 🌟 خلاقیت ۲: نوار رنگی هویت (Accent Bar) در حالت عادی */}
            {!isSelected && (
                <div className={`absolute top-0 right-0 w-1.5 h-full ${platformStyle.colorClass} opacity-80 rounded-r-[22px]`}></div>
            )}

            {/* 🌟 خلاقیت ۳: واترمارک بزرگ و محو لوگوی پلتفرم در بک‌گراند سمت چپ */}
            <div className={`absolute -bottom-4 -left-3 transform -rotate-12 transition-opacity duration-300 pointer-events-none ${
                isSelected 
                ? 'opacity-[0.15] text-white scale-125' 
                : `opacity-[0.04] dark:opacity-[0.03] ${platformStyle.watermarkColor} scale-150`
            }`}>
                <PlatformIcon size={90} />
            </div>

            {/* نشانگر آنلاین بودن (نقطه درخشان در کنار نام) */}
            {chat.status === 1 && (
                <div className="absolute top-5 right-5 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] z-20"></div>
            )}

            {/* --- هدر کارت (نام کاربر + نام گروه) --- */}
            <div className="relative z-10 flex justify-between items-start w-full pr-3">
                <div className="flex flex-col items-start min-w-0 pr-1">
                    {/* نام اصلی */}
                    <div className="flex items-center gap-2">
                        <bdi className={`font-black text-[16px] tracking-tight truncate ${isSelected ? 'text-white drop-shadow-sm' : 'text-gray-900 dark:text-gray-100'}`}>
                            {userName}
                        </bdi>
                        {isAssignedToOther && <HiOutlineLockClosed className={`text-[13px] ${isSelected ? 'text-white/80' : 'text-red-500'}`} />}
                        {isAssignedToMe && <HiOutlineLockClosed className={`text-[13px] ${isSelected ? 'text-white/80' : 'text-amber-500'}`} />}
                    </div>
                    
                    {/* نام گروه (زیر نام اصلی با فونت ظریف‌تر) */}
                    {isGroup && groupName && (
                        <span className={`text-[11.5px] font-bold mt-0.5 truncate max-w-[150px] ${isSelected ? 'text-white/80' : platformStyle.textClass}`}>
                            {groupName}
                        </span>
                    )}
                </div>

                {/* بج تعداد پیام‌های نخوانده در بالا چپ */}
                {hasUnread && (
                    <div className={`flex items-center justify-center min-w-[20px] h-[20px] px-1.5 text-[11px] font-bold rounded-lg shadow-sm ${
                        isSelected 
                        ? 'bg-white/20 text-white backdrop-blur-md' 
                        : `${platformStyle.colorClass} text-white`
                    }`}>
                        {chat.unreadCount}
                    </div>
                )}
            </div>
            
            {/* --- بدنه پیام --- */}
            <div className="relative z-10 mt-3 pr-3 w-full">
                {/* پیام با قابلیت Line-clamp (نشان دادن حداکثر ۲ خط پیام) */}
                <span className={`text-[13px] leading-snug line-clamp-2 ${isSelected ? 'text-white/95 font-medium' : hasUnread ? 'text-gray-800 dark:text-gray-200 font-semibold' : 'text-gray-500 dark:text-gray-400'}`}>
                    <bdi>{lastMessageText}</bdi>
                </span>
            </div>

            {/* --- فوتر (تاریخ در پایین سمت چپ) --- */}
            <div className="relative z-10 flex justify-end items-end w-full mt-2">
                {/* در RTL، justify-end عناصر را به سمت چپ هل می‌دهد */}
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md backdrop-blur-sm ${
                    isSelected ? 'bg-white/10 text-white' : 'bg-gray-50/80 dark:bg-gray-800/50 text-gray-400 dark:text-gray-500'
                }`}>
                    <span className="text-[10px] font-black tracking-wider uppercase">
                        {formatSmartTime(chat.time || chat.createdAt)}
                    </span>
                </div>
            </div>
        </button>
    );
};