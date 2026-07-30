import { useEffect, useRef, useState } from 'react';
import { HiOutlineChatAlt2, HiOutlineDotsVertical, HiOutlineTrash } from 'react-icons/hi';
import { FaUsers } from 'react-icons/fa';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import { Conversation, Message } from '../types';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { HiOutlineIdentification } from 'react-icons/hi';

interface Props {
    activeChat?: Conversation & {
        isPrivateChat?: boolean;
        chatName?: string;
    };
    messages: Message[];
    onSendMessage: (text: string) => void;
    onSendFile?: (file: File, type: 'image' | 'video' | 'document' | "voice") => void; 
    currentUserId: string; 
    onResendMessage?: (messageId: string) => void;
    onDeleteMessage?: (messageId: string) => void;
    onToggleInfo: () => void; // 🌟 اضافه شود
    isInfoOpen: boolean;
}

export const ChatArea = ({ 
    activeChat, 
    messages, 
    onSendMessage, 
    onSendFile,
    currentUserId, 
    onResendMessage, 
    onDeleteMessage,
    onToggleInfo,
    isInfoOpen
}: Props) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [messageToDelete, setMessageToDelete] = useState<string | null>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    if (!activeChat) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900 h-full">
                <p className="text-gray-500 dark:text-gray-400">لطفاً یک گفتگو را انتخاب کنید</p>
            </div>
        );
    }

    const userName = activeChat.contactName || activeChat.contactPhoneNumber || 'کاربر ناشناس';
    const isGroup = activeChat.isPrivateChat === false;
    const groupName = activeChat.chatName || 'گروه';
    const avatarLetter = userName !== 'کاربر ناشناس' ? userName.charAt(0) : '?';
    
    return (
        <div className="flex-1 h-full flex flex-col bg-gray-50/50 dark:bg-gray-950/10 relative">
            
            {/* === Header === */}
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md flex items-center justify-between z-10 sticky top-0">
                <div className="flex items-center gap-3">
                    <Avatar size={42} shape="circle" className="bg-indigo-50 text-indigo-600 font-bold text-lg">
                        {avatarLetter}
                    </Avatar>
                    
                    <div className="flex flex-col justify-center">
                        <h4 className="text-base font-bold text-gray-800 dark:text-gray-100">
                            {userName}
                        </h4>
                        
                        <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-gray-500 dark:text-gray-400">
                            {isGroup && (
                                <>
                                    <span className="text-gray-400 dark:text-gray-500">در</span>
                                    <span dir="auto" className="text-sm font-semibold text-slate-600 dark:text-slate-300 max-w-[350px] truncate" title={groupName}>
                                       " {groupName} "
                                    </span>
                                    <span className="mx-1 opacity-40">•</span>
                                </>
                            )}
                            <span>ورودی از {activeChat.platform || 'نامشخص'}</span>
                        </div>
                    </div>
                </div>
                <button 
                    onClick={onToggleInfo}
                    className={`p-2 rounded-full transition-all duration-200 flex items-center justify-center ${
                        isInfoOpen 
                        ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400 rotate-0' 
                        : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 rotate-180'
                    }`}
                    title="اطلاعات مشتری"
                >
                    <HiOutlineIdentification 
                            className={`text-2xl transition-transform duration-300 ${isInfoOpen ? 'scale-110' : 'scale-100'}`} 
                        />            
                </button>
            </div>

            {/* === Messages Box === */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-700 bg-[url('https://web.telegram.org/a/chat-bg-pattern-light.png')] dark:bg-[url('https://web.telegram.org/a/chat-bg-pattern-dark.png')] bg-cover bg-center bg-fixed bg-no-repeat relative">
                
                <div className="absolute inset-0 bg-white/60 dark:bg-black/60 -z-10 mix-blend-overlay"></div>

                {messages.map((msg) => (
                    <MessageBubble 
                        key={msg.id} 
                        message={msg} 
                        currentUserId={currentUserId} 
                        onResend={onResendMessage}
                        onDelete={(id) => setMessageToDelete(id)} 
                    />
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* === Input Area === */}
            {/* 👇 ۲. پاس دادن تابع ارسال فایل به اینپوت */}
            <MessageInput 
                onSendMessage={onSendMessage} 
                onSendFile={onSendFile} 
            />

            {/* === پاپ‌آپ (مدال) اختصاصی تأیید حذف === */}
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
                                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors outline-none"
                            >
                                انصراف
                            </button>
                            <button 
                                onClick={() => {
                                    if (onDeleteMessage) onDeleteMessage(messageToDelete); // اجرای تابع حذف بک‌اند
                                    setMessageToDelete(null); // بستن مدال بعد از کلیک
                                }}
                                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-red-600 hover:bg-red-700 shadow-sm shadow-red-200 dark:shadow-none transition-colors outline-none"
                            >
                                بله، حذف کن
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};