
import { FaTelegramPlane, FaWhatsapp, FaInstagram, FaGlobe ,FaCheck , FaCheckDouble} from 'react-icons/fa';
import Avatar from '@/components/ui/Avatar';
import { Conversation } from '../types';

interface Props {
    chat: Conversation & { 
        isAnsweredByBot?: boolean;
        isPrivateChat?: boolean;
        chatName?: string;
    };
    isSelected: boolean;
    onClick: () => void;
}

const PlatformBadge = ({ platform }: { platform?: string }) => {
    switch (platform?.toLowerCase()) {
        case 'telegram':
            return <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-50 text-blue-500 dark:bg-blue-500/10 dark:text-blue-400"><FaTelegramPlane size={13} /></div>;
        case 'whatsapp':
            return <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-50 text-green-500 dark:bg-green-500/10 dark:text-green-400"><FaWhatsapp size={13} /></div>;
        case 'instagram':
            return <div className="flex items-center justify-center w-6 h-6 rounded-full bg-pink-50 text-pink-500 dark:bg-pink-500/10 dark:text-pink-400"><FaInstagram size={13} /></div>;
        default:
            return <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"><FaGlobe size={13} /></div>;
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

export const ConversationItem = ({ chat, isSelected, onClick }: Props) => {
    const avatarLetter = chat.contactName ? chat.contactName.charAt(0) : '?';
    const lastMessageText = chat.lastMessage || 'پیامی ارسال نشده است...';
    const userName = chat.contactName || chat.contactPhoneNumber || 'کاربر ناشناس';
    const isGroup = chat.isPrivateChat === false;
    const groupName = chat.chatName || 'گروه';
    
    

   return (
    <>
        <button
            onClick={onClick}
            className={`relative w-full text-right flex items-start gap-4 p-5 rounded-[24px] transition-all duration-300 border outline-none group ${
                isSelected
                    ? 'bg-white dark:bg-gray-800 border-indigo-500 shadow-md shadow-indigo-500/10 ring-1 ring-indigo-500'
                    : 'bg-white dark:bg-gray-800 border-transparent hover:border-gray-200 dark:hover:border-gray-700/80 shadow-sm hover:shadow-md'
            }`}
        >
            <div className="relative flex-shrink-0 mt-1">
                <Avatar 
                    size={64} // سایز آواتار بزرگتر شد تا با ارتفاع کارت هماهنگ شود
                    shape="circle" 
                    className={`${isSelected ? 'bg-indigo-600 text-white' : 'bg-indigo-50 dark:bg-gray-700 text-indigo-600 dark:text-indigo-400'} font-black text-2xl transition-colors shadow-sm`}
                >
                    {avatarLetter}
                </Avatar>
                
                {chat.status === 1 && (
                    <div className="absolute bottom-0 right-1 w-4 h-4 bg-emerald-500 border-[3px] border-white dark:border-gray-800 rounded-full shadow-sm"></div>
                )}
            </div>

            <div className="flex flex-col flex-1 min-w-0 h-full justify-between gap-3">
                
                {/* ردیف اول: نام + اطلاعات پلتفرم و زمان */}
                <div className="flex justify-between items-start w-full">
                    
                    {/* محفظه ثابت برای نام (جلوگیری از پرش به خاطر انگلیسی/فارسی) */}
                    <div className="flex-1 min-w-0 pl-2 text-right">
                        {/* تگ bdi جادوی حل مشکل اسامی ترکیب‌شده است */}
                        <bdi className="font-extrabold text-[16px] text-gray-900 dark:text-gray-100 block truncate">
                            {userName}
                        </bdi>

                        {isGroup && groupName && (
                            <div 
                                dir="auto"
                                className="flex items-center gap-1.5 mt-0.5 w-full overflow-hidden opacity-90"
                                title={groupName}
                            >
                                <span className="text-[11px] text-gray-400 dark:text-gray-500 flex-shrink-0">
                                    در
                                </span>
                                <span 
                                    dir="auto"
                                    className="text-[12px] font-bold text-slate-500 dark:text-slate-400 truncate"
                                >
                                    <bdi>{groupName}</bdi>
                                </span>
                            </div>
                        )}

                    </div>
                    

                    {/* اطلاعات گوشه سمت چپ (آیکون پلتفرم + ساعت) */}
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                        {/* فرض کردم فیلد پلتفرم در آبجکت چت شما platform است. اگر نامش چیز دیگری است آن را اصلاح کنید */}
                        <PlatformBadge platform={chat.platform || 'telegram'} /> 
                        <span className={`text-[11px] font-bold ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'}`}>
                            {formatSmartTime(chat.time || chat.createdAt)}
                        </span>
                    </div>
                </div>
                
                {/* ردیف دوم: آخرین پیام (در پایین‌ترین نقطه با فونت درشت‌تر) */}
                <div className="flex justify-between items-end w-full">
                    <span className={`text-[14px] leading-relaxed truncate pr-1 flex-1 text-right ${
                        isSelected 
                        ? 'text-gray-800 dark:text-gray-200 font-semibold' 
                        : 'text-gray-600 dark:text-gray-400 font-medium'
                    }`}>
                        <bdi>{lastMessageText}</bdi>
                    </span>
                    
                    {/* نشانگر پیام خوانده نشده */}
                    {chat.unreadCount ? (
                        <div className="flex flex-shrink-0 items-center justify-center min-w-[22px] h-[22px] px-1.5 bg-rose-500 text-white text-[11px] font-bold rounded-full ml-1 shadow-sm">
                            {chat.unreadCount}
                        </div>
                    ) : null}
                </div>

            </div>
        </button>
    </>
    );
};