import { useEffect, useState, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import appConfig from '@/configs/app.config';

import { Message } from '../../views/concepts/inbox/types';

interface UseChatSocketProps {
    token: string | null;
    onNewMessage: (message: Message) => void;
    onConversationUpdated?: (chatId: string, action: string, assigneeUserId?: string) => void;
    onCannedResponsesUpdated?: () => void;
}
    

export const useChatSocket = ({ token, onNewMessage, onConversationUpdated, onCannedResponsesUpdated }: UseChatSocketProps) => {
    const [isConnected, setIsConnected] = useState(false);
    
    const onNewMessageRef = useRef(onNewMessage);
    const onConversationUpdatedRef = useRef(onConversationUpdated);
    const onCannedResponsesUpdatedRef = useRef(onCannedResponsesUpdated);

    useEffect(() => {
        onNewMessageRef.current = onNewMessage;
        onConversationUpdatedRef.current = onConversationUpdated;
        onCannedResponsesUpdatedRef.current = onCannedResponsesUpdated;
    }, [onNewMessage, onConversationUpdated]);

    useEffect(() => {
        if (!token) return;

        // ۱. ساخت کانکشن با تنظیمات حرفه‌ای
        const connection = new signalR.HubConnectionBuilder()
            .withUrl(`${appConfig.apiPrefix}/hubs/chat`, {
                accessTokenFactory: () => token 
            })
            .withAutomaticReconnect([0, 2000, 5000, 10000, 30000]) // تلاش مجدد در صورت قطعی اینترنت
            .configureLogging(signalR.LogLevel.Trace)
            .build();

        // ۲. تعریف لیسنرها (شنونده‌ها) قبل از شروع اتصال
        connection.on("ReceiveNewMessage", (message: Message) => {
            console.log("پیام جدید از سوکت دریافت شد:", message);
            onNewMessageRef.current(message);
        });

        connection.on("ConversationUpdated", (conversationId: string, action: string, assigneeUserId?: string) => {
            if (onConversationUpdatedRef.current) {
                // 👈 پارامتر سوم در اینجا پاس داده می‌شود
                onConversationUpdatedRef.current(conversationId, action, assigneeUserId);
            }
        });

        connection.on("OnCannedResponsesUpdated", () => {
            if (onCannedResponsesUpdatedRef.current) {
                console.log("⚡ درخواست آپدیت لیست پاسخ‌های آماده دریافت شد");
                onCannedResponsesUpdatedRef.current();
            }
        });

        // ۳. استارت کردن اتصال
        const startConnection = async () => {
            try {
                await connection.start();
                setIsConnected(true);
                console.log("⚡ به سرور SignalR متصل شد!");
            } catch (error) {
                console.error("خطا در اتصال به سوکت:", error);
            }
        };

        startConnection();

        // ۴. تمیزکاری (Cleanup) موقع خارج شدن کاربر از صفحه چت
        return () => {
            connection.stop().then(() => setIsConnected(false));
        };
    }, [token]); // این هوک فقط زمانی دوباره اجرا می‌شود که توکن تغییر کند

    return { isConnected };
};