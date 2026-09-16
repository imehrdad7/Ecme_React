import { useEffect, useState, useRef } from 'react';
import { socketManager } from '@/utils/socketManager';

interface UseBotSocketProps {
    token: string | null;
    onReceiveQrCode?: (botId: string, qrCodeBase64: string) => void;
    onReceiveWhatsAppStatus?: (botId: string, status: string, phoneNumber?: string) => void;
}

export const useBotSocket = ({ 
    token, 
    onReceiveQrCode, 
    onReceiveWhatsAppStatus 
}: UseBotSocketProps) => {
    
    const [isConnected, setIsConnected] = useState(false);
    
    // استفاده از useRef برای جلوگیری از re-render های اضافی هنگام تغییر توابع
    const onReceiveQrCodeRef = useRef(onReceiveQrCode);
    const onReceiveWhatsAppStatusRef = useRef(onReceiveWhatsAppStatus);

    useEffect(() => {
        onReceiveQrCodeRef.current = onReceiveQrCode;
        onReceiveWhatsAppStatusRef.current = onReceiveWhatsAppStatus;
    }, [onReceiveQrCode, onReceiveWhatsAppStatus]);

    useEffect(() => {
        if (!token) return;

        let isMounted = true;

        const handleReceiveQrCode = (botId: string, qrCodeBase64: string) => {
            console.log("⚡ بارکد واتس‌اپ از سوکت دریافت شد برای ربات:", botId);
            if (onReceiveQrCodeRef.current) onReceiveQrCodeRef.current(botId, qrCodeBase64);
        };

        const handleReceiveWhatsAppStatus = (botId: string, status: string, phoneNumber?: string) => {
            console.log(`⚡ وضعیت واتس‌اپ ربات ${botId} به ${status} تغییر کرد`);
            if (onReceiveWhatsAppStatusRef.current) onReceiveWhatsAppStatusRef.current(botId, status, phoneNumber);
        };

        const startConnection = async () => {
            try {
                // دریافت اتصال از طریق منیجر مرکزی 
                const connection = await socketManager.connect(token);
                
                if (!connection || !isMounted) return;

                setIsConnected(connection.state === 'Connected');

                connection.on("ReceiveQrCode", handleReceiveQrCode);
                connection.on("ReceiveWhatsAppStatus", handleReceiveWhatsAppStatus);

            } catch (error) {
                console.error("خطا در برقراری ارتباط با مدیر سوکت ربات‌ها:", error);
                setIsConnected(false);
            }
        };

        startConnection();

        // پاکسازی هنگام Unmount شدن کامپوننت
        return () => {
            isMounted = false;
            const connection = socketManager.getConnection();
            if (connection) {
                connection.off("ReceiveQrCode", handleReceiveQrCode);
                connection.off("ReceiveWhatsAppStatus", handleReceiveWhatsAppStatus);
            }
        };
    }, [token]); 

    return { isConnected };
};