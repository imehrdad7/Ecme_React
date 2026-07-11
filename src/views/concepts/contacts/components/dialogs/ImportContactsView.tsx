import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import Notification from '@/components/ui/Notification';
import toast from '@/components/ui/toast';
import { HiOutlineUpload } from 'react-icons/hi';
import ImportModal from './ImportModal'; 
import { Platform } from '../../types';
import { useSessionUser } from '@/store/authStore'
import { apiSubmitParsedContacts } from '@/services/contactService'; 

const ImportContactsView = () => {
    const { user } = useSessionUser(); 
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    const appTags: Record<string, { color: string; id: string }> = {
        "مشتری VIP": { color: "bg-amber-100 text-amber-700", id: "1" },
        "نیاز به پیگیری": { color: "bg-blue-100 text-blue-700", id: "2" },
        "لید جدید": { color: "bg-emerald-100 text-emerald-700", id: "3" }
    };

    const renderPlatformIcon = (platform: Platform, sizeClass: string = 'text-base') => {
        switch (platform) {
            case 'WhatsApp': return <span className={`text-green-500 ${sizeClass}`}>WA</span>;
            case 'Telegram': return <span className={`text-blue-500 ${sizeClass}`}>TG</span>;
            case 'Instagram': return <span className={`text-pink-500 ${sizeClass}`}>IG</span>;
            default: return <span className={`text-gray-500 ${sizeClass}`}>💬</span>;
        }
    };

    const handleFinalImportSubmit = async (finalPayload: any[]) => {
        try {
            const companyId = user?.companyId || "00000000-0000-0000-0000-000000000000"; 
            
            await apiSubmitParsedContacts(companyId, finalPayload);

            toast.push(
                <Notification type="success" title="موفقیت‌آمیز">
                    تعداد {finalPayload.length} مخاطب با موفقیت پردازش و به سیستم اضافه شد.
                </Notification>,
                { placement: 'top-center' }
            );

        } catch (error: any) {
            console.error("خطا در ارسال فایل نهایی به سرور:", error);
            const errorMessage = error?.response?.data?.message || "ذخیره مخاطبین با مشکل مواجه شد. لطفا مجددا تلاش کنید.";
            
            toast.push(
                <Notification type="danger" title="خطای سرور">
                    {errorMessage}
                </Notification>,
                { placement: 'top-center' }
            );
            
            throw error; 
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">مدیریت مخاطبین</h2>
                
                <Button 
                    variant="solid" 
                    color="emerald-600" 
                    icon={<HiOutlineUpload />} 
                    onClick={() => setIsImportModalOpen(true)}
                >
                    ایمپورت از اکسل
                </Button>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 min-h-[400px] flex items-center justify-center text-gray-400">
                جدول اصلی مخاطبین اینجا قرار می‌گیرد...
            </div>

            <ImportModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                appTags={appTags}
                renderPlatformIcon={renderPlatformIcon}
                onSubmitFinalData={handleFinalImportSubmit}
            />
        </div>
    );
};

export default ImportContactsView;