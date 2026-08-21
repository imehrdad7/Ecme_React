import { useEffect, useState, useRef } from 'react';
import { socketManager } from '@/utils/socketManager';
import { Message } from '../../views/concepts/inbox/types';

interface UseChatSocketProps {
    token: string | null;
    onNewMessage: (message: Message) => void;
    onMessageUpdated?: (message: Message) => void;
    onConversationUpdated?: (chatId: string, action: string, assigneeUserId?: string) => void;
    onCannedResponsesUpdated?: () => void;
}
    
export const useChatSocket = ({ token, onNewMessage, onConversationUpdated, onCannedResponsesUpdated, onMessageUpdated }: UseChatSocketProps) => {
    const [isConnected, setIsConnected] = useState(false);
    
    const onNewMessageRef = useRef(onNewMessage);
    const onConversationUpdatedRef = useRef(onConversationUpdated);
    const onCannedResponsesUpdatedRef = useRef(onCannedResponsesUpdated);
    const onMessageUpdatedRef = useRef(onMessageUpdated);

    useEffect(() => {
        onNewMessageRef.current = onNewMessage;
        onConversationUpdatedRef.current = onConversationUpdated;
        onCannedResponsesUpdatedRef.current = onCannedResponsesUpdated;
        onMessageUpdatedRef.current = onMessageUpdated;
    }, [onNewMessage, onConversationUpdated, onCannedResponsesUpdated, onMessageUpdated]);

    useEffect(() => {
        if (!token) return;

        let isMounted = true;

        const handleReceiveNewMessage = (message: Message) => {
            console.log("پیام جدید از سوکت دریافت شد:", message);
            if (onNewMessageRef.current) onNewMessageRef.current(message);
        };
        const handleConversationUpdated = (conversationId: string, action: string, assigneeUserId?: string) => {
            if (onConversationUpdatedRef.current) onConversationUpdatedRef.current(conversationId, action, assigneeUserId);
        };

        const handleCannedResponsesUpdated = () => {
            console.log("⚡ درخواست آپدیت لیست پاسخ‌های آماده دریافت شد");
            if (onCannedResponsesUpdatedRef.current) onCannedResponsesUpdatedRef.current();
        };

        const handleMessageUpdated = (updatedMessage: Message) => {
            console.log("⚡ وضعیت پیام آپدیت شد:", updatedMessage);
            if (onMessageUpdatedRef.current) onMessageUpdatedRef.current(updatedMessage);
        };

        const startConnection = async () => {
            try {
                // ۱. دریافت اتصال از طریق منیجر مرکزی به جای ساخت اتصال جدید
                const connection = await socketManager.connect(token);
                
                if (!connection || !isMounted) return;

                setIsConnected(connection.state === 'Connected');

                connection.on("ReceiveNewMessage", handleReceiveNewMessage);
                connection.on("ConversationUpdated", handleConversationUpdated);
                connection.on("OnCannedResponsesUpdated", handleCannedResponsesUpdated);
                connection.on("MessageUpdated", handleMessageUpdated);

            } catch (error) {
                console.error("خطا در برقراری ارتباط با مدیر سوکت چت:", error);
                setIsConnected(false);
            }
        };

        startConnection();

        // ۳. تمیزکاری (Cleanup) موقع خارج شدن کاربر از صفحه چت
        return () => {
            isMounted = false;
            const connection = socketManager.getConnection();
            if (connection) {
               connection.off("ReceiveNewMessage", handleReceiveNewMessage);
                connection.off("ConversationUpdated", handleConversationUpdated);
                connection.off("OnCannedResponsesUpdated", handleCannedResponsesUpdated);
                connection.off("MessageUpdated", handleMessageUpdated);
            }
        };
    }, [token]); 

    return { isConnected };
};