import { useState, useEffect, useRef, useCallback } from 'react';
import { Conversation, Message, SendMessagePayload } from '../types';
import { 
    apiSearchConversations, 
    apiGetConversationMessages, 
    apiSendOutgoingMessage,
    apiUploadMedia,
    apiDeleteMedia,
    apiGetConversationDetails,
    apiAssignConversation,
    apiCloseConversation,
    apiUnAssignConversation,
    apiGetCannedResponses,
    apiGetMessageContext
} from '@/services/liveChatService'; 
import { useSessionUser, getToken } from '@/store/authStore';
import React from 'react';
import toast from '@/components/ui/toast';
import Notification from '@/components/ui/Notification';
import { useChatSocket } from '@/utils/hooks/useChatSocket';

export const useChatState = () => {
    const { user } = useSessionUser();
    const companyId = user?.companyId;
    const currentUserId = user?.id; 
    const [resolvedToken, setResolvedToken] = useState<string>('');
    const [cannedResponses, setCannedResponses] = useState<any[]>([]);

    useEffect(() => {
        const fetchToken = async () => {
            try {
                const t = await getToken(); 
                if (t) setResolvedToken(t);
            } catch (error) {
                console.error("خطا در خواندن توکن از استوریج:", error);
            }
        };
        fetchToken();
    }, [currentUserId]);
    // === استیت‌های اصلی ===
    const [conversations, setConversations] = useState<Conversation[]>([]);

    const conversationsRef = useRef<Conversation[]>([]);
    useEffect(() => {
        conversationsRef.current = conversations;
    }, [conversations]);

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
    const [totalCount, setTotalCount] = useState<number>(0);

    // === استیت‌های فیلتر و صفحه‌بندی ===
    const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
    const [page, setPage] = useState<number>(1);
    const [hasMore, setHasMore] = useState<boolean>(true);
    
    // === استیت‌های بارگذاری ===
    const [isLoadingChats, setIsLoadingChats] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);

    // ==========================================
    // 🌟 ۲. منطق دریافت پیام جدید از SignalR
    // ==========================================
    const handleReceiveNewMessage = useCallback(async (newMessage: Message) => {
        const chatId = newMessage.conversationId;

        const currentChats = conversationsRef.current;
        const chatIndex = currentChats.findIndex(c => c.id === chatId);
        const isNewChat = !conversationsRef.current.some(c => c.id === chatId);

        setMessages((prevMessages) => {
            const currentChatMessages = prevMessages[chatId] || [];
                if (currentChatMessages.some((msg: Message) => msg.id === newMessage.id)) {
                return prevMessages;
            }

            const mappedMessage: Message = {
                id: newMessage.id,
                conversationId: newMessage.conversationId,
                direction: newMessage.direction,
                directionName: newMessage.directionName,
                type: newMessage.type,
                typeName: newMessage.typeName,
                status: newMessage.status,
                statusName: newMessage.statusName,
                textContent: newMessage.textContent || undefined,
                mediaUrl: newMessage.mediaUrl || undefined,
                createdAt: newMessage.createdAt,
                senderUserId: newMessage.senderUserId || undefined,
            };

            return {
                ...prevMessages,
                [chatId]: [...currentChatMessages, mappedMessage]
            };
        });

        if (isNewChat) {
            // ۲. فوراً کارت موقت را می‌سازیم
            const tempConversation: Conversation = {
                id: chatId,
                contactId: '', 
                contactName: 'در حال دریافت اطلاعات...', 
                contactPhoneNumber: '...',
                status: 1, 
                statusName: 'Open',
                createdAt: newMessage.createdAt,
                contactUserNameInPlatform: '...',
                lastMessage: newMessage.textContent || "پیام رسانه",
                lastMessageDate: newMessage.createdAt,
            };

            // ۳. استیت و رفرنس را دستی و "بدون هیچ تابع واسطه‌ای" آپدیت می‌کنیم تا در لحظه روی صفحه بیاید
            const newChatsList = [tempConversation, ...currentChats];
            setConversations(newChatsList);
            conversationsRef.current = newChatsList; // قفل کردن دیتای جدید برای جلوگیری از تداخل
            setTotalCount(prevCount => prevCount + 1);
            // ۴. حالا که کارت موقت روی صفحه رفت، با خیال راحت به سرور درخواست می‌زنیم
            try {
                const response = await apiGetConversationDetails<any>(chatId);
                const realConversation = response?.data || response; 

                if (realConversation) {
                    // ۵. وقتی جواب سرور آمد، چون زمان گذشته، اینجا منطقی است که از prev استفاده کنیم
                    setConversations((prev) => {
                        const filteredChats = prev.filter(c => c.id !== chatId);
                        const safeConversation: Conversation = {
                            ...realConversation,
                            id: realConversation.id || realConversation.Id || chatId,
                            contactId: realConversation.contactId || realConversation.ContactId || '',
                            contactName: realConversation.contactName || realConversation.ContactName || 'مشتری جدید',
                            contactPhoneNumber: realConversation.contactPhoneNumber || realConversation.ContactPhoneNumber || 'ناشناس',
                            status: realConversation.status ?? realConversation.Status ?? 1,
                            statusName: realConversation.statusName || realConversation.StatusName || 'Open',
                            createdAt: realConversation.createdAt || realConversation.CreatedAt || newMessage.createdAt,
                            contactUserNameInPlatform: realConversation.contactUserNameInPlatform || realConversation.ContactUserNameInPlatform || '',
                            lastMessage: newMessage.textContent || "پیام رسانه",
                            lastMessageDate: newMessage.createdAt,
                            botName: realConversation.botName || realConversation.BotName || ''
                        };
                        return [safeConversation, ...filteredChats];
                    });
                }
            } catch (error) {
                console.error(`خطا در واکشی اطلاعات کامل گفتگوی ${chatId}:`, error);
            }
        } 
        else {
            // اگر چت از قبل وجود داشت (چت قدیمی است)
            const chatToUpdate = { ...currentChats[chatIndex] };
            chatToUpdate.lastMessage = newMessage.textContent || "پیام رسانه"; 
            chatToUpdate.lastMessageDate = newMessage.createdAt;
            
            const otherChats = currentChats.filter(c => c.id !== chatId);
            const updatedChatsList = [chatToUpdate, ...otherChats];
            
            // مستقیماً آپدیت می‌کنیم
            setConversations(updatedChatsList);
            conversationsRef.current = updatedChatsList;
        }
       
    }, [companyId]);

    const fetchCannedResponses = async () => {
        if (!companyId) return;
        try {
            const response = await apiGetCannedResponses(companyId);
            const items = response || []; 
            setCannedResponses(items);
        } catch (error) {
            console.error("خطا در به‌روزرسانی پاسخ‌های آماده", error);
        }
    };

    useEffect(() => {
        fetchCannedResponses();
    }, [companyId]);

    // 🌟 ۳. راه‌اندازی و اتصال سوکت
    const { isConnected } = useChatSocket({
        token: resolvedToken,
        onNewMessage: handleReceiveNewMessage,
        onConversationUpdated: (chatId: string, action: string, assigneeUserId?: string) => {
            console.log(`وضعیت چت ${chatId} به ${action} تغییر کرد`);
           
            setConversations((currentChats) => {
                const chatIndex = currentChats.findIndex(c => c.id === chatId);
                if (chatIndex === -1) return currentChats;

                const updatedChats = [...currentChats];
                const chatToUpdate = { ...updatedChats[chatIndex] };

                // اعمال تغییرات دریافتی از SignalR روی استیت
                if (action === "Assigned") {
                    chatToUpdate.assigneeUserId = assigneeUserId; 
                } else if (action === "Closed") {
                    chatToUpdate.assigneeUserId = undefined; 
                    chatToUpdate.status = 0; // تغییر به وضعیت بسته شده
                }

                updatedChats[chatIndex] = chatToUpdate;
                return updatedChats;
            });
        },
        onCannedResponsesUpdated: () => {
            console.log("⚡ سیگنال‌آر گفت لیست آپدیت شده، در حال دریافت مجدد...");
            fetchCannedResponses();
        }
    });

    // ==========================================


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
                const count = response?.totalCount || 0; // خواندن totalCount
                setTotalCount(count);
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

    // ==========================================
    // 🌟 متد تخصیص گفتگو به اپراتور
    // ==========================================
    const assignConversation = async (operatorId: string) => {
        if (!companyId || !activeChatId || !currentUserId) return;

        try {
            await apiAssignConversation({
                conversationId: activeChatId,
                assigneeUserId: operatorId,
                assignedByUserId: currentUserId,
                companyId: companyId
            });
            
            // آپدیت سریع استیت برای اعمال تغییر در UI خود شخص بدون انتظار برای سوکت
            setConversations((currentChats) => {
                const chatIndex = currentChats.findIndex(c => c.id === activeChatId);
                if (chatIndex === -1) return currentChats;

                const updatedChats = [...currentChats];
                updatedChats[chatIndex] = { 
                    ...updatedChats[chatIndex], 
                    assigneeUserId: operatorId 
                };
                return updatedChats;
            });

            toast.push(
                React.createElement(
                    Notification, 
                    { title: 'موفق', type: 'success' }, 
                    'این گفتگو با موفقیت به شما اختصاص یافت.'
                ),
                { placement: 'top-center' }
            );
        } catch (error) {
            console.error("خطا در اختصاص گفتگو:", error);
            toast.push(
                React.createElement(
                    Notification, 
                    { title: 'خطا', type: 'danger' }, 
                    'تخصیص گفتگو انجام نشد. ممکن است شخص دیگری آن را برداشته باشد.'
                ),
                { placement: 'top-center' }
            );
        }
    };

    const closeConversation = async (operatorId: string) => {
        if (!companyId || !activeChatId) return;

        try {
                await apiUnAssignConversation({
                    conversationId: activeChatId,
                    assigneeUserId: operatorId,
                    assignedByUserId: currentUserId,
                    companyId: companyId
                });

                setConversations((currentChats) => {
                    const chatIndex = currentChats.findIndex(c => c.id === activeChatId);
                    if (chatIndex === -1) return currentChats;

                    const updatedChats = [...currentChats];
                    updatedChats[chatIndex] = { 
                        ...updatedChats[chatIndex], 
                        assigneeUserId: undefined,
                        status: 0
                    };
                    return updatedChats;
                });

            toast.push(
                React.createElement(
                    Notification, 
                    { title: 'موفق', type: 'success' }, 
                    'گفتگو با موفقیت پایان یافت و به ربات سپرده شد.'
                ),
                { placement: 'top-center' }
            );
        } catch (error) {
            console.error("خطا در بستن گفتگو:", error);
            toast.push(
                React.createElement(
                    Notification, 
                    { title: 'خطا', type: 'danger' }, 
                    'خطا در بستن گفتگو. لطفاً دوباره تلاش کنید.'
                ),
                { placement: 'top-center' }
            );
        }
    };

    const unAssignConversation = async () => {
        // بررسی وجود آیدی کاربر لاگین شده برای مشخص شدن فرستنده پیام
        if (!companyId || !activeChatId || !currentUserId) return;

        try {
            // ۱. آماده‌سازی پیام خداحافظی
            const defaultMessage = "پشتیبانی شما توسط اپراتور به پایان رسید. از این پس ربات هوشمند ما پاسخگوی شما خواهد بود.";

            const goodbyeMessage = (user as any)?.company?.autoGoodbyeMessage || defaultMessage;

            // ۲. ارسال پیام خداحافظی به مشتری
            await apiSendOutgoingMessage({
                conversationId: activeChatId,
                companyId: companyId,
                senderUserId: currentUserId,
                messageType: 1, // متن
                textContent: goodbyeMessage
            });

            // ۳. آپدیت استیت پیام‌ها تا اپراتور پیام ارسالی را در صفحه چت ببیند
            const tempMessage: Message = {
                id: Date.now().toString(),
                conversationId: activeChatId,
                direction: 2, // Outgoing
                directionName: 'Outgoing',
                type: 1, // Text
                typeName: 'Text',
                status: 2, // Sent
                statusName: 'Sent',
                textContent: goodbyeMessage,
                createdAt: new Date().toISOString(),
                senderUserId: currentUserId
            };
            
            setMessages(prev => ({
                ...prev,
                [activeChatId]: [...(prev[activeChatId] || []), tempMessage]
            }));

            // ۴. فراخوانی متد قبلی شما برای آزادسازی چت از سمت سرور
            await apiCloseConversation({
                conversationId: activeChatId,
                companyId: companyId
            });

            // ۵. برداشتن قفل از روی کارت چت
            setConversations((currentChats) => {
                return currentChats.filter(c => c.id !== activeChatId);
            });
            setActiveChatId(null);

            toast.push(
                React.createElement(
                    Notification, 
                    { title: 'موفق', type: 'success' }, 
                    'گفتگو با موفقیت پایان یافت .'
                ),
                { placement: 'top-center' }
            );
        } catch (error) {
            console.error("خطا در بستن گفتگو:", error);
            toast.push(
                React.createElement(
                    Notification, 
                    { title: 'خطا', type: 'danger' }, 
                    'خطا در بستن گفتگو. لطفاً دوباره تلاش کنید.'
                ),
                { placement: 'top-center' }
            );
        }
    };

    const sendMessage = async (textContent: string): Promise<boolean> => {
        if (!companyId || !textContent.trim() || !activeChatId) return false;

        const payload: SendMessagePayload = {
            conversationId: activeChatId,
            companyId: companyId,
            senderUserId: currentUserId,
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
            senderUserId: currentUserId
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
            return true;
        } catch (error) {
            console.error("خطا در ارسال پیام:", error);
            setMessages(prev => ({
                ...prev,
                [activeChatId]: prev[activeChatId].map(msg => 
                    msg.id === tempMessage.id ? { ...msg, status: 0, statusName: 'Failed' } : msg
                )
            }));
            return false;
        }
    };

    const SendFile = async (file: File, type: "video" | "image" | "document" | "voice") => {
        if (!companyId || !activeChatId || !currentUserId) return;

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
            senderUserId: currentUserId
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
                senderUserId: currentUserId,
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
            senderUserId: currentUserId,
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

    const handleEndConversation = async () => {
        const currentChatId = activeChat?.id; 
        
        if (!companyId || !activeChatId) return;
        if (!currentChatId) return;

        try {
            const goodbyeMsg = user?.company?.autoGoodbyeMessage || "گفتگوی شما با پشتیبانی پایان یافت. در صورت داشتن سوال جدید پیام دهید.";

            const isMessageSent = await sendMessage(goodbyeMsg);
            if (isMessageSent) {
            await apiCloseConversation({
                conversationId: activeChatId,
                companyId: companyId
            });

            if (setConversations) {
                setConversations(prev => prev.filter(c => c.id !== currentChatId));
            }
            
            if (setActiveChatId) {
                setActiveChatId(null);
            }
            toast.push(
                React.createElement(
                    Notification, 
                    { title: 'موفقیت', type: 'success' }, 
                    'مکالمه پایان یافت و پیام خداحافظی ارسال شد.'
                ),
                { placement: 'top-center' }
            );
        }
         else {
                toast.push(
                    React.createElement(
                        Notification, 
                        { title: 'خطا', type: 'danger' }, 
                        'ارسال پیام خداحافظی با مشکل مواجه شد. پرونده مکالمه بسته نشد.'
                    ),
                    { placement: 'top-center' }
                );
            }

        } catch (error) {
            console.error(error);
            
            // نمایش پیام خطا با فرمت React.createElement
            toast.push(
                React.createElement(
                    Notification, 
                    { title: 'خطا', type: 'danger' }, 
                    'مشکلی در پایان دادن به مکالمه پیش آمد.'
                ),
                { placement: 'top-center' }
            );
        }
    };

    // ==========================================
    // 🌟 متد جدید: بارگذاری بافت یک پیام خاص (برای جستجو)
    // ==========================================
    const loadMessageContext = async (messageId: string, contextSize: number = 20) => {
        if (!companyId || !activeChatId) return;

        setIsLoadingMessages(true);
        try {
            const response = await apiGetMessageContext(activeChatId, messageId, contextSize);

            // بسته به ساختار خروجی اکسیس شما، آرایه را پیدا می‌کنیم
            const contextMessages = response || [];
            
            if (contextMessages.length > 0) {
                setMessages(prev => {
                    const currentLocalMessages = prev[activeChatId] || [];
                    
                    // ۱. ترکیب پیام‌های قبلی موجود در صفحه با پیام‌های جدیدِ دریافت شده
                    const mergedMessages = [...currentLocalMessages, ...contextMessages];

                    // ۲. حذف پیام‌های تکراری (بر اساس id) تا در رندر مشکلی پیش نیاید
                    const uniqueMessages = Array.from(
                        new Map(mergedMessages.map(item => [item.id, item])).values()
                    );

                    // ۳. مرتب‌سازی نهایی بر اساس تاریخ (صعودی)
                    uniqueMessages.sort(
                        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                    );

                    return {
                        ...prev,
                        [activeChatId]: uniqueMessages
                    };
                });
            }
        } catch (error) {
            console.error("خطا در دریافت بافت پیام:", error);
        } finally {
            setIsLoadingMessages(false);
        }
    };


    // محاسبات محلی برای فرمت‌دهی داده‌ها
    const activeChat = conversations.find(c => c.id === activeChatId);
    const currentMessages = activeChatId ? (messages[activeChatId] || []) : [];
    
    const filteredChats = conversations.filter(c => 
        (c.contactName?.includes(searchQuery) || c.contactPhoneNumber?.includes(searchQuery))
    );

    
    return {
        conversations: filteredChats,
        activeChat,
        currentMessages,
        currentUserId,
        
        activeChatId,
        setActiveChatId,
        searchQuery,
        setSearchQuery,
        
        selectedPlatform,
        setSelectedPlatform: handleSetSelectedPlatform, 
        page,
        setPage,
        hasMore,
        totalCount,
        loadMessageContext,
        isLoadingChats,
        isLoadingMore,
        isLoadingMessages,
        cannedResponses,
        fetchCannedResponses,
        loadChatHistory,
        sendMessage,
        SendFile,
        ResendMessage,
        DeleteMessage,
        assignConversation,
        unAssignConversation,
        closeConversation,
        handleEndConversation,
        isConnected
    };
};