import { useEffect, useState, useRef } from 'react';
import { socketManager } from '@/utils/socketManager';
import { CampaignListItemDto } from '../../views/concepts/campaigns/types';

interface UseCampaignSocketProps {
    token: string | null;
    onCampaignUpdated: (campaign: CampaignListItemDto) => void;
}

export const useCampaignSocket = ({ token, onCampaignUpdated }: UseCampaignSocketProps) => {
    const [isConnected, setIsConnected] = useState(false);
    
    const onCampaignUpdatedRef = useRef(onCampaignUpdated);

    useEffect(() => {
        onCampaignUpdatedRef.current = onCampaignUpdated;
    }, [onCampaignUpdated]);

    useEffect(() => {
        if (!token) {
            return;
        }

        let isMounted = true;

        const startConnection = async () => {
            try {
                const connection = await socketManager.connect(token);
                
                if (!connection || !isMounted) return;

                setIsConnected(connection.state === 'Connected');

                connection.on("ReceiveCampaignUpdate", (updatedCampaign: CampaignListItemDto) => {
                    console.log("⚡ آپدیت وضعیت کمپین از سوکت دریافت شد:", updatedCampaign);
                    if (onCampaignUpdatedRef.current) {
                        onCampaignUpdatedRef.current(updatedCampaign);
                    }
                });

            } catch (error) {
                console.error("خطا در برقراری ارتباط با مدیر سوکت کمپین:", error);
                setIsConnected(false);
            }
        };
        startConnection();

        return () => {
            isMounted = false;
            const connection = socketManager.getConnection();
            if (connection) {
                connection.off("ReceiveCampaignUpdate");
            }
        };
    }, [token]);

    return { isConnected };
};