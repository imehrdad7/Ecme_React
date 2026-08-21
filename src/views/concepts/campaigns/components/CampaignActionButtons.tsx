import { useState } from 'react';
import { HiOutlinePlay, HiOutlinePause, HiOutlineStop } from 'react-icons/hi';
import toast from '@/components/ui/toast';
import Notification from '@/components/ui/Notification';
import { CampaignStatus } from '../types'; 
import { apiExecuteCampaignAction } from '@/services/CampaignService'; 

interface CampaignActionButtonsProps {
    campaignId: string;
    currentStatus: number;
}

export const CampaignActionButtons = ({ campaignId, currentStatus }: CampaignActionButtonsProps) => {
    const [loadingAction, setLoadingAction] = useState<'start' | 'pause' | 'cancel' | null>(null);

    const handleAction = async (action: 'start' | 'pause' | 'cancel') => {
        setLoadingAction(action);
        
        try {
            await apiExecuteCampaignAction(campaignId, action);

            toast.push(
                <Notification type="success" title="موفق">دستور با موفقیت صادر شد.</Notification>,
                { placement: 'top-center' }
            );
            
        } catch (error: any) {
            console.error(`خطا در اجرای عملیات ${action}:`, error);
            
            // استخراج پیام ارور
            const errorMessage = error.response?.data?.Message || error.response?.data?.message || "خطایی در سرور رخ داد.";
            
            toast.push(
                <Notification type="danger" title="خطا">
                    {errorMessage}
                </Notification>,
                { placement: 'top-center' }
            );
        } finally {
            setLoadingAction(null);
        }
    };

    if (
        currentStatus === CampaignStatus.Completed || 
        currentStatus === CampaignStatus.Cancelled || 
        currentStatus === CampaignStatus.Scheduled
    ) {
        return null; 
    }

    return (
        <div className="flex items-center justify-center gap-2 rtl:space-x-reverse w-full">
            
            {(currentStatus === CampaignStatus.Draft || currentStatus === CampaignStatus.Paused) && (
                <button
                    onClick={() => handleAction('start')}
                    disabled={loadingAction !== null}
                    title={currentStatus === CampaignStatus.Paused ? "ادامه ارسال" : "شروع کمپین"}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-green-600 rounded shadow-sm hover:bg-green-700 disabled:opacity-50 transition-all"
                >
                    {loadingAction === 'start' ? (
                        <span className="animate-pulse">صبر کنید...</span>
                    ) : (
                        <><HiOutlinePlay className="text-sm" /> {currentStatus === CampaignStatus.Paused ? 'ادامه' : 'شروع'}</>
                    )}
                </button>
            )}

            {currentStatus === CampaignStatus.InProgress && (
                <button
                    onClick={() => handleAction('pause')}
                    disabled={loadingAction !== null}
                    title="توقف موقت ارسال"
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-amber-900 bg-amber-400 rounded shadow-sm hover:bg-amber-500 disabled:opacity-50 transition-all"
                >
                    {loadingAction === 'pause' ? (
                        <span className="animate-pulse">صبر کنید...</span>
                    ) : (
                        <><HiOutlinePause className="text-sm" /> توقف</>
                    )}
                </button>
            )}

            <button
                onClick={() => handleAction('cancel')}
                disabled={loadingAction !== null}
                title="لغو کامل کمپین"
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 rounded border border-red-200 hover:bg-red-100 transition-all"
            >
                {loadingAction === 'cancel' ? (
                    <span className="animate-pulse">...</span>
                ) : (
                    <><HiOutlineStop className="text-sm" /> لغو</>
                )}
            </button>
        </div>
    );
};