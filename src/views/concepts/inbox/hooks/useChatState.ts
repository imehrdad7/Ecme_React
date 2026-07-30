import { useState, useEffect, useRef } from 'react';
import { Conversation, Message, SendMessagePayload } from '../types';
import { 
    apiSearchConversations, 
    apiGetConversationMessages, 
    apiSendOutgoingMessage,
    apiUploadMedia,
    apiDeleteMedia
} from '@/services/liveChatService'; 
import { useSessionUser } from '@/store/authStore';
import React from 'react';
import toast from '@/components/ui/toast';
import Notification from '@/components/ui/Notification';

export const useChatState = () => {
    const { user } = useSessionUser();
    const companyId = user?.companyId;
    const CURRENT_USER_ID = user?.id; 

    // === استیت‌های اصلی ===
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeChatId, setActiveChatId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');
    
    const [messages, setMessages] = useState<Record<string, Message[]>>(() => {
        if (typeof window !== 'undefined') {
            const savedMessages = localStorage.getItem('anybot_offline_messages');
            if (savedMessages) {
                try {
                    return JSON.parse(savedMessages);
                } catch (e) {
                    console.error("خطا در پارس کردن کش پیام‌ها:", e);
                }
            }
        }
        return {};
    });

    const fetchedChats = useRef<Set<string>>(new Set());
    
    // === استیت‌های فیلتر و صفحه‌بندی ===
    const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
    const [page, setPage] = useState<number>(1);
    const [hasMore, setHasMore] = useState<boolean>(true);
    
    // === استیت‌های بارگذاری ===
    const [isLoadingChats, setIsLoadingChats] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);

    // ذخیره خودکار پیام‌ها در مرورگر به محض هرگونه تغییر
    useEffect(() => {
        if (Object.keys(messages).length > 0) {
            localStorage.setItem('anybot_offline_messages', JSON.stringify(messages));
        }
    }, [messages]);

    // ۱. دریافت لیست مکالمات
    useEffect(() => {
        const fetchConversations = async () => {
            if (!companyId) return; 

            if (page === 1) {
                setIsLoadingChats(true);
            } else {
                setIsLoadingMore(true);
            }
            
            try {
                const payload: any = { 
                    companyId: companyId,
                    pageNumber: page,
                    pageSize: 10 
                };

                if (selectedPlatform !== 'all') {
                    payload.platform = selectedPlatform;
                }

                const response = await apiSearchConversations<any>(payload);
                const items = response?.data?.items || response?.items || [];
                
                if (page === 1) {
                    setConversations(items);
                } else {
                    setConversations(prev => [...prev, ...items]);
                }

                setHasMore(items.length === 10);
                
            } catch (error) {
                console.error("خطا در دریافت لیست مکالمات:", error);
            } finally {
                setIsLoadingChats(false);
                setIsLoadingMore(false);
            }
        };

        fetchConversations();
    }, [page, selectedPlatform, companyId]);

    const handleSetSelectedPlatform = (platform: string) => {
        setSelectedPlatform(platform);
        setPage(1); 
        setConversations([]); 
        setHasMore(true); 
    };

    // 🌟 متد جدید: بارگذاری تاریخچه چت (قابل استفاده به صورت دستی یا خودکار)
    const loadChatHistory = async (targetChatId?: string, forceRefresh: boolean = false) => {
        const chatId = targetChatId || activeChatId;
        
        // بررسی پیش‌نیازها
        if (!companyId || !chatId) return;

        // اگر forceRefresh خاموش باشد و قبلاً این چت را لود کرده باشیم، دوباره از API نمی‌گیریم
        if (!forceRefresh && fetchedChats.current.has(chatId)) return;

        setIsLoadingMessages(true);
        try {
            const response = await apiGetConversationMessages<any>(chatId, { companyId: companyId });
            const items = response?.data?.items || response?.items || [];
            const reversedServerItems = items.reverse();
            
            // ادغام هوشمند پیام‌های سرور با پیام‌های خطاخورده لوکال (Smart Merge)
            setMessages(prev => {
                const currentLocalMessages = prev[chatId] || [];
                
                // استخراج پیام‌هایی که هنوز به سرور نرسیده‌اند
                const localUnsentMessages = currentLocalMessages.filter(
                    msg => msg.status === 0 || msg.status === 1
                );

                const mergedMessages = [...reversedServerItems, ...localUnsentMessages];

                // مرتب‌سازی بر اساس تاریخ
                mergedMessages.sort(
                    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                );

                return {
                    ...prev,
                    [chatId]: mergedMessages
                };
            });

            // ثبت این چت در رفرنس
            fetchedChats.current.add(chatId);

        } catch (error) {
            console.error("خطا در دریافت تاریخچه پیام‌ها:", error);
        } finally {
            setIsLoadingMessages(false);
        }
    };

    // ۲. اجرای خودکار loadChatHistory هنگام تغییر چتِ فعال
    useEffect(() => {
        if (activeChatId) {
            loadChatHistory(activeChatId);
        }
    }, [activeChatId, companyId]);

    const sendMessage = async (textContent: string) => {
        if (!companyId || !textContent.trim() || !activeChatId) return;

        const payload: SendMessagePayload = {
            conversationId: activeChatId,
            companyId: companyId,
            senderUserId: CURRENT_USER_ID,
            messageType: 1,
            textContent: textContent
        };

        const tempMessage: Message = {
            id: Date.now().toString(),
            conversationId: activeChatId,
            direction: 2, 
            directionName: 'Outgoing',
            type: 1,
            typeName: 'Text',
            status: 1, 
            statusName: 'Pending',
            textContent: textContent,
            createdAt: new Date().toISOString(),
            senderUserId: CURRENT_USER_ID
        };

        setMessages(prev => ({
            ...prev,
            [activeChatId]: [...(prev[activeChatId] || []), tempMessage]
        }));

        try {
            const response = await apiSendOutgoingMessage<any>(payload);
            const newId = response?.data || response; 

            setMessages(prev => ({
                ...prev,
                [activeChatId]: prev[activeChatId].map(msg => 
                    msg.id === tempMessage.id ? { ...msg, id: newId, status: 2, statusName: 'Sent' } : msg
                )
            }));

        } catch (error) {
            console.error("خطا در ارسال پیام:", error);
            setMessages(prev => ({
                ...prev,
                [activeChatId]: prev[activeChatId].map(msg => 
                    msg.id === tempMessage.id ? { ...msg, status: 0, statusName: 'Failed' } : msg
                )
            }));
        }
    };

    const SendFile = async (file: File, type: "video" | "image" | "document" | "voice") => {
        if (!companyId || !activeChatId || !CURRENT_USER_ID) return;

        const localPreviewUrl = URL.createObjectURL(file);

        let msgTypeNumber = 2; 
        if (type === 'video') msgTypeNumber = 3;
        if (type === 'document') msgTypeNumber = 4;
        if (type === 'voice') msgTypeNumber = 5;

        const tempMessage = {
            id: Date.now().toString(),
            conversationId: activeChatId,
            direction: 2, 
            directionName: 'Outgoing',
            type: msgTypeNumber, 
            typeName: type, 
            status: 1, 
            statusName: 'Pending',
            mediaUrl: localPreviewUrl,
            createdAt: new Date().toISOString(),
            senderUserId: CURRENT_USER_ID
        };

        // نمایش اولیه فایل در چت باکس
        setMessages(prev => ({
            ...prev,
            [activeChatId]: [...(prev[activeChatId] || []), tempMessage as any]
        }));

        let finalUploadedUrl: string | undefined = undefined;

        try {
            const formData = new FormData();
            formData.append('file', file);
            
            const uploadResponse = await apiUploadMedia(formData);
            
            finalUploadedUrl = uploadResponse?.url || (uploadResponse as any)?.url;

            if (!finalUploadedUrl) {
                throw new Error("UPLOAD_FAILED"); // پرتاب خطای اختصاصی آپلود
            }

            const payload: SendMessagePayload = {
                conversationId: activeChatId,
                companyId: companyId,
                senderUserId: CURRENT_USER_ID,
                messageType: msgTypeNumber,
                mediaUrl: finalUploadedUrl 
            };

            const sendResponse = await apiSendOutgoingMessage<any>(payload);
            const newId = sendResponse?.data?.id || sendResponse?.id || sendResponse?.data; 

            setMessages(prev => ({
                ...prev,
                [activeChatId]: prev[activeChatId].map(msg => 
                    msg.id === tempMessage.id 
                    ? { 
                        ...msg, 
                        id: newId, 
                        status: 2, 
                        statusName: 'Sent', 
                        mediaUrl: finalUploadedUrl 
                    } 
                    : msg
                )
            }));

        } catch (error: any) {
            console.error("خطا در جریان آپلود و ارسال فایل:", error);
            
            if (!finalUploadedUrl || error.message === "UPLOAD_FAILED") {
                // حالت اول: آپلود شکست خورده است
                setMessages(prev => ({
                    ...prev,
                    [activeChatId]: prev[activeChatId].filter(msg => msg.id !== tempMessage.id)
                }));
                
                // 👇 استفاده از React.createElement به جای JSX
                toast.push(
                    React.createElement(
                        Notification, 
                        { title: 'خطای آپلود', type: 'danger' }, 
                        'ارتباط با سرور برقرار نشد و فایل آپلود نشد. لطفاً مجدداً تلاش کنید.'
                    ),
                    { placement: 'top-center' }
                );

            } else {
                // حالت دوم: آپلود موفق بوده اما ثبت پیام خطا داده است
                setMessages(prev => ({
                    ...prev,
                    [activeChatId]: prev[activeChatId].map(msg => 
                        msg.id === tempMessage.id 
                        ? { 
                            ...msg, 
                            status: 0, 
                            statusName: 'Failed',
                            mediaUrl: finalUploadedUrl 
                        } 
                        : msg
                    )
                }));
            }
        } finally {
            URL.revokeObjectURL(localPreviewUrl);
        }
    };

    const ResendMessage = async (messageId: string) => {
        if (!companyId || !activeChatId) return;

        const messageToResend = currentMessages.find(msg => msg.id === messageId);
        
        if (!messageToResend || (!messageToResend.textContent && messageToResend.type === 1)) return;
        if (messageToResend.type !== 1 && messageToResend.mediaUrl?.startsWith('blob:')) {
            alert("خطای آپلود: فایل به طور کامل در سرور آپلود نشده است. لطفاً پیام را حذف کرده و مجدداً ارسال کنید.");
            return;
        }

        console.log("تلاش مجدد برای ارسال پیام:", messageToResend.textContent || "مدیا");

        const payload: SendMessagePayload = {
            conversationId: activeChatId,
            companyId: companyId,
            senderUserId: CURRENT_USER_ID,
            messageType: messageToResend.type || 1, 
            textContent: messageToResend.type === 1 ? messageToResend.textContent : undefined,
            mediaUrl: messageToResend.type !== 1 ? messageToResend.mediaUrl : undefined
        };

        setMessages(prev => ({
            ...prev,
            [activeChatId]: (prev[activeChatId] || []).map(msg => 
                msg.id === messageId ? { ...msg, status: 1, statusName: 'Pending' } : msg
            )
        }));

        try {
            const response = await apiSendOutgoingMessage<any>(payload);
            const newId = response?.data || response; 

            setMessages(prev => ({
                ...prev,
                [activeChatId]: (prev[activeChatId] || []).map(msg => 
                    msg.id === messageId ? { ...msg, id: newId, status: 2, statusName: 'Sent' } : msg
                )
            }));

        } catch (error) {
            console.error("ارسال مجدد باز هم با خطا مواجه شد", error);
            
            setMessages(prev => ({
                ...prev,
                [activeChatId]: (prev[activeChatId] || []).map(msg => 
                    msg.id === messageId ? { ...msg, status: 0, statusName: 'Failed' } : msg
                )
            }));
        }
    };

    const DeleteMessage = async (messageId: string) => {
        try {
            debugger
            console.log("در حال ارسال درخواست حذف به سرور برای پیام:", messageId);
            
            // ۱. 🌟 پیام مورد نظر را از توی State پیدا می‌کنیم
            if (!activeChatId) return;
            
            // فرض می‌کنیم متغیر استیت شما که کل پیام‌ها رو نگه میداره messages باشه
            // (اگه اسمش چیز دیگه‌ایه تغییرش بده)
            const currentChatMessages = messages[activeChatId] || [];
            const targetMessage = currentChatMessages.find((msg: Message) => msg.id === messageId);
            
            if (!targetMessage) {
                console.error("پیام مورد نظر برای حذف پیدا نشد!");
                return;
            }

            // ۲. 🌟 آدرس فایل رو از خودِ پیام استخراج می‌کنیم
            // ⚠️ مهم: بررسی کنید اسم فیلد فایل در اینترفیس Message شما چیست (fileUrl، mediaUrl یا ...)
            const fileUrlToDelete = targetMessage.mediaUrl; 

            // ۳. حذف فایل از سرور (اگر فایلی داشت)
            if (fileUrlToDelete && typeof fileUrlToDelete === 'string' && !fileUrlToDelete.startsWith('blob:')) {
                try {
                    if (user?.companyId) {
                        await apiDeleteMedia(user.companyId, fileUrlToDelete);
                        console.log("مدیای متصل به پیام با موفقیت از سرور حذف شد.");
                    }
                } catch (error) {
                    console.error("خطا در حذف فایل از سرور:", error);
                }
            }
            
            // ۴. درخواست حذف خود پیام از دیتابیس
            // await api.delete(`/messages/${messageId}`); 
            
            // ۵. آپدیت رابط کاربری و حذف پیام از صفحه
            setMessages((prevMessages: Record<string, Message[]>) => {
                const chatMsgs = prevMessages[activeChatId] || [];
                return {
                    ...prevMessages,
                    [activeChatId]: chatMsgs.filter((msg: Message) => msg.id !== messageId)
                };
            });

            console.log("پیام با موفقیت حذف شد.");

        } catch (error) {
            console.error("خطا در حذف پیام:", error);
            alert("متأسفانه حذف پیام با خطا مواجه شد. لطفاً مجدداً تلاش کنید.");
        }
    };

    // محاسبات محلی برای فرمت‌دهی داده‌ها
    const activeChat = conversations.find(c => c.id === activeChatId);
    const currentMessages = activeChatId ? (messages[activeChatId] || []) : [];
    
    const filteredChats = conversations.filter(c => 
        (c.contactName?.includes(searchQuery) || c.contactPhoneNumber?.includes(searchQuery))
    );

    // خروجی نهایی هوک
    return {
        conversations: filteredChats,
        activeChat,
        currentMessages,
        
        activeChatId,
        setActiveChatId,
        searchQuery,
        setSearchQuery,
        
        selectedPlatform,
        setSelectedPlatform: handleSetSelectedPlatform, 
        page,
        setPage,
        hasMore,
        
        isLoadingChats,
        isLoadingMore,
        isLoadingMessages,
        
        loadChatHistory, // 👈 متد جدید به خروجی اضافه شد
        sendMessage,
        SendFile,
        ResendMessage,
        DeleteMessage
    };
};