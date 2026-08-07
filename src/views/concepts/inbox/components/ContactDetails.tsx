import React from 'react';
import { 
    HiOutlinePhone, 
    HiOutlineClock,
    HiOutlineAtSymbol,
    HiOutlineHashtag,
    HiOutlineX
} from 'react-icons/hi';
// 🌟 Avatar ایمپورت نمی‌شود چون حذف شد
import Tag from '@/components/ui/Tag';
import { Conversation } from '../types';

interface Props {
    activeChat?: Conversation;
    onClose?: () => void;
}

const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'نامشخص';
    const date = new Date(dateString);
    return date.toLocaleDateString('fa-IR', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
    });
};

export const ContactDetails = ({ activeChat, onClose }: Props) => {
    if (!activeChat) return null;

    const displayName = activeChat.contactName || 'کاربر ناشناس';
    const displayPhone = activeChat.contactPhoneNumber || 'ثبت نشده';
    const ContactUserNameInPlatform = activeChat.contactUserNameInPlatform || 'ثبت نشده';
    const isOpen = activeChat.status === 1;

    return (
        // 🌟 کلید اصلی: استفاده از overflow-hidden برای جلوگیری ۱۰۰ درصدی از اسکرول
        <div className="w-full h-full bg-white dark:bg-[#1c242f] flex flex-col overflow-hidden">
            
            {/* --- هدر بسیار فشرده و مدرن --- */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800/60 bg-gray-50/50 dark:bg-[#212b36]/30 flex-shrink-0">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <h2 className="font-black text-gray-900 dark:text-white text-[16px] tracking-tight">
                            {displayName}
                        </h2>
                        {/* نشانگر آنلاین بودن در کنار نام */}
                        <div className={`w-2 h-2 rounded-full shadow-sm flex-shrink-0 ${
                            isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'
                        }`}></div>
                    </div>
                    <span className={`text-[11.5px] font-bold mt-0.5 ${
                        isOpen ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500'
                    }`}>
                        {isOpen ? 'مکالمه در جریان' : 'مکالمه پایان یافته'}
                    </span>
                </div>
                
                {onClose && (
                    <button 
                        onClick={onClose}
                        className="p-2 rounded-[12px] bg-white dark:bg-[#1c242f] border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 shadow-sm transition-all"
                        title="بستن اطلاعات"
                    >
                        <HiOutlineX className="text-lg" />
                    </button>
                )}
            </div>

            {/* --- محتوای اصلی --- */}
            {/* استفاده از flex-1 و overflow-hidden تا فضا را پر کند اما اسکرول نشود */}
            <div className="flex flex-col gap-3 p-4 flex-1 overflow-hidden">
                
                {/* ۱. کارت اطلاعات نشست - فاصله‌ها فشرده‌تر شده‌اند */}
                <div className="bg-gray-50/80 dark:bg-[#212b36]/80 rounded-[20px] p-1.5 border border-gray-100 dark:border-white/5 flex-shrink-0">
                    
                    {/* ردیف شماره تماس */}
                    <div className="flex items-center justify-between p-2.5 rounded-[14px] hover:bg-white dark:hover:bg-white/5 transition-colors group">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm">
                                <HiOutlinePhone className="text-[16px]" />
                            </div>
                            <span className="text-[12px] font-bold text-gray-700 dark:text-gray-300">شماره تماس</span>
                        </div>
                        <span className="text-[13px] font-black text-gray-900 dark:text-white font-mono tracking-wider" dir="ltr">
                            {displayPhone}
                        </span>
                    </div>

                    <div className="h-[1px] w-[calc(100%-3rem)] mx-auto bg-gray-200/50 dark:bg-gray-700/50 my-0.5"></div>

                    {/* ردیف نام کاربری */}
                    <div className="flex items-center justify-between p-2.5 rounded-[14px] hover:bg-white dark:hover:bg-white/5 transition-colors group">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-500/20 text-purple-600 flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm">
                                <HiOutlineAtSymbol className="text-[16px]" />
                            </div>
                            <span className="text-[12px] font-bold text-gray-700 dark:text-gray-300">نام کاربری</span>
                        </div>
                        <span className="text-[12px] font-bold text-gray-900 dark:text-white font-mono">
                            {ContactUserNameInPlatform}
                        </span>
                    </div>

                    <div className="h-[1px] w-[calc(100%-3rem)] mx-auto bg-gray-200/50 dark:bg-gray-700/50 my-0.5"></div>

                    {/* ردیف تاریخ شروع */}
                    <div className="flex items-center justify-between p-2.5 rounded-[14px] hover:bg-white dark:hover:bg-white/5 transition-colors group">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm">
                                <HiOutlineClock className="text-[16px]" />
                            </div>
                            <span className="text-[12px] font-bold text-gray-700 dark:text-gray-300">شروع گفتگو</span>
                        </div>
                        <span className="text-[11px] font-bold text-gray-900 dark:text-white">
                            {formatDateTime(activeChat.createdAt)}
                        </span>
                    </div>
                </div>

                {/* ۲. کارت تگ‌ها */}
                {/* flex-1 باعث می‌شود تگ‌ها هرچقدر جا بود کِش بیایند اما overflow-hidden جلوی اسکرول را می‌گیرد */}
                <div className="bg-gray-50/80 dark:bg-[#212b36]/80 rounded-[20px] p-4 border border-gray-100 dark:border-white/5 flex flex-col flex-1 overflow-hidden">
                    <div className="flex items-center gap-2 mb-3 flex-shrink-0">
                        <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 flex items-center justify-center shadow-sm">
                            <HiOutlineHashtag className="text-[15px]" />
                        </div>
                        <h3 className="text-[13px] font-black text-gray-800 dark:text-white">تگ‌های مشتری</h3>
                    </div>
                    
                    {/* محتوای تگ‌ها: استفاده از content-start برای چینش از بالا و پنهان کردن موارد اضافی */}
                    <div className="flex flex-wrap content-start gap-1.5 flex-1 overflow-hidden">
                        {activeChat.tags && activeChat.tags.length > 0 ? (
                            activeChat.tags.map((tag: any, index: number) => {
                                const tagName = typeof tag === 'string' ? tag : (tag.name || tag.title || 'تگ نامشخص');
                                const tagClasses = typeof tag === 'object' && (tag.color || tag.colorHex) 
                                    ? (tag.color || tag.colorHex) 
                                    : 'bg-white dark:bg-[#1c242f] text-indigo-600 dark:text-indigo-400 border border-gray-200 dark:border-gray-700 shadow-sm';

                                return (
                                    <Tag 
                                        key={index} 
                                        className={`px-2.5 py-1 text-[10.5px] font-extrabold rounded-[8px] transition-all hover:scale-105 cursor-default ${tagClasses}`}
                                    >
                                        {tagName}
                                    </Tag>
                                );
                            })
                        ) : (
                            <div className="w-full h-full min-h-[60px] flex items-center justify-center rounded-[14px] bg-white/50 dark:bg-[#1c242f]/50 border border-dashed border-gray-300 dark:border-gray-700">
                                <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500">
                                    تگی برای این کاربر ثبت نشده است.
                                </span>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};