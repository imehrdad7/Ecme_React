import React from 'react';
import { 
    HiOutlinePhone, 
    HiOutlineClock,
    HiOutlineAtSymbol,
    HiOutlineHashtag,
    HiCheckCircle
} from 'react-icons/hi';
import Avatar from '@/components/ui/Avatar';
import Tag from '@/components/ui/Tag';
import { Conversation } from '../types';

interface Props {
    activeChat?: Conversation;
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

export const ContactDetails = ({ activeChat }: Props) => {
    if (!activeChat) return null;

    const avatarLetter = activeChat.contactName ? activeChat.contactName.charAt(0) : '?';
    const displayName = activeChat.contactName || 'کاربر ناشناس';
    const displayPhone = activeChat.contactPhoneNumber || 'ثبت نشده';
    const ContactUserNameInPlatform = activeChat.contactUserNameInPlatform || 'ثبت نشده';
    const isOpen = activeChat.status === 1;

    return (
        // عرض و ارتفاع رو w-full h-full دادیم چون Inbox خودش عرض رو کنترل می‌کنه
        <div className="w-full h-full bg-gray-50/50 dark:bg-[#0f172a]/30 flex flex-col overflow-y-auto scrollbar-hide">
            
            {/* ۱. بخش هدر پروفایل (با گرادیانت ملایم در پس‌زمینه) */}
            <div className="relative flex flex-col items-center pt-10 pb-6 px-4 bg-gradient-to-b from-indigo-50/50 to-transparent dark:from-indigo-900/10">
                <div className="relative group cursor-pointer">
                    <Avatar 
                        size={88} 
                        shape="circle" 
                        className="bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-black text-3xl shadow-xl shadow-indigo-500/20 ring-4 ring-white dark:ring-gray-900 transition-transform duration-300 group-hover:scale-105"
                    >
                        {avatarLetter}
                    </Avatar>
                    
                    {/* نقطه وضعیت (Status Dot) چسبیده به آواتار */}
                    <div className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-[3px] border-white dark:border-gray-900 shadow-sm ${
                        isOpen ? 'bg-emerald-500' : 'bg-gray-400'
                    }`}></div>
                </div>
                
                <h2 className="font-black text-gray-900 dark:text-white text-lg mt-4 mb-1 text-center tracking-tight">
                    {displayName}
                </h2>
                
                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400">
                    {isOpen ? (
                        <><HiCheckCircle className="text-emerald-500 text-sm" /> مکالمه در جریان</>
                    ) : (
                        <span className="text-gray-400">مکالمه پایان یافته</span>
                    )}
                </div>
            </div>

            <div className="px-4 pb-8 flex flex-col gap-4">
                
                {/* ۲. کارت اطلاعات نشست (Apple Settings Style) */}
                <div className="bg-white dark:bg-gray-800/80 backdrop-blur-md rounded-[24px] p-2 shadow-sm border border-gray-100 dark:border-gray-700/50">
                    
                    {/* ردیف شماره تماس */}
                    <div className="flex items-center justify-between p-3 group">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 flex items-center justify-center transition-transform group-hover:scale-110">
                                <HiOutlinePhone className="text-lg" />
                            </div>
                            <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">شماره تماس</span>
                        </div>
                        <span className="text-sm font-bold text-gray-900 dark:text-white font-mono tracking-wider" dir="ltr">
                            {displayPhone}
                        </span>
                    </div>

                    <div className="h-[1px] w-[calc(100%-3.5rem)] ml-auto bg-gray-50 dark:bg-gray-700/30 my-1"></div>

                    {/* ردیف نام کاربری */}
                    <div className="flex items-center justify-between p-3 group">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-500/10 text-purple-500 flex items-center justify-center transition-transform group-hover:scale-110">
                                <HiOutlineAtSymbol className="text-lg" />
                            </div>
                            <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">نام کاربری</span>
                        </div>
                        <span className="text-sm font-bold text-gray-900 dark:text-white font-mono">
                            {ContactUserNameInPlatform}
                        </span>
                    </div>

                    <div className="h-[1px] w-[calc(100%-3.5rem)] ml-auto bg-gray-50 dark:bg-gray-700/30 my-1"></div>

                    {/* ردیف تاریخ شروع */}
                    <div className="flex items-center justify-between p-3 group">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-blue-500 flex items-center justify-center transition-transform group-hover:scale-110">
                                <HiOutlineClock className="text-lg" />
                            </div>
                            <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">شروع چت</span>
                        </div>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                            {formatDateTime(activeChat.createdAt)}
                        </span>
                    </div>
                </div>

                {/* ۳. کارت تگ‌های مشتری */}
                <div className="bg-white dark:bg-gray-800/80 backdrop-blur-md rounded-[24px] p-5 shadow-sm border border-gray-100 dark:border-gray-700/50">
                    <div className="flex items-center gap-2 mb-4">
                        <HiOutlineHashtag className="text-lg text-indigo-500" />
                        <h3 className="text-sm font-extrabold text-gray-800 dark:text-white">تگ‌های مشتری</h3>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                        {activeChat.tags && activeChat.tags.length > 0 ? (
                            activeChat.tags.map((tag: any, index: number) => {
                                const tagName = typeof tag === 'string' ? tag : (tag.name || tag.title || 'تگ نامشخص');
                                const tagClasses = typeof tag === 'object' && (tag.color || tag.colorHex) 
                                    ? (tag.color || tag.colorHex) 
                                    : 'bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20';

                                return (
                                    <Tag 
                                        key={index} 
                                        className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all hover:scale-105 cursor-default ${tagClasses}`}
                                    >
                                        {tagName}
                                    </Tag>
                                );
                            })
                        ) : (
                            <div className="w-full py-4 text-center rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-dashed border-gray-200 dark:border-gray-700">
                                <span className="text-xs font-medium text-gray-400 dark:text-gray-500">
                                    بدون تگ
                                </span>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};