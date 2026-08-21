import { useState, useEffect } from 'react';
import { Button } from '@/components/ui';
import { HiOutlineUsers, HiX, HiOutlineInformationCircle, HiOutlinePhone } from 'react-icons/hi';
import { apiGetCampaignContactsDetails } from '@/services/CampaignService'; // مسیر درست را چک کنید
import toast from '@/components/ui/toast';
import Notification from '@/components/ui/Notification';

interface ViewContactsModalProps {
    isOpen: boolean;
    onClose: () => void;
    campaignId: string | null;
}

// یک آرایه از رنگ‌های ملایم برای آواتارها
const avatarColors = [
    'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
    'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
    'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400',
];

const ViewContactsModal = ({ isOpen, onClose, campaignId }: ViewContactsModalProps) => {
    const [contacts, setContacts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchContacts = async () => {
            if (!isOpen || !campaignId) return;
            setIsLoading(true);
            try {
                const response: any = await apiGetCampaignContactsDetails(campaignId);
                setContacts(response.data || response || []);
            } catch (error) {
                toast.push(<Notification type="danger">خطا در دریافت لیست مخاطبین</Notification>, { placement: 'top-center' });
            } finally {
                setIsLoading(false);
            }
        };

        fetchContacts();
        if (!isOpen) setContacts([]);
    }, [isOpen, campaignId]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-gray-900/60 backdrop-blur-sm transition-opacity" dir="rtl">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden transform transition-all scale-100 max-h-[85vh]">
                
                {/* 🌟 هدر مودال */}
                <div className="flex-none flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/80">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center">
                            <HiOutlineUsers className="text-xl" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">لیست گیرندگان کمپین</h3>
                            <p className="text-xs text-gray-500 mt-0.5">
                                {contacts.length > 0 ? `شامل ${contacts.length} مخاطب` : 'مشاهده افرادی که در این کمپین قرار دارند'}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-gray-700 rounded-xl transition-colors">
                        <HiX className="text-xl" />
                    </button>
                </div>

                {/* 🌟 بدنه اصلی (بدون اسکرول - اسکرول فقط روی جدول است) */}
                <div className="flex-1 flex flex-col p-6 overflow-hidden bg-white dark:bg-gray-800">
                    
                    {/* پیام راهنما */}
                    <div className="flex-none flex items-start gap-2 p-3 mb-5 bg-blue-50/50 dark:bg-blue-900/10 text-blue-700 dark:text-blue-400 rounded-2xl text-sm border border-blue-100 dark:border-blue-800/20">
                        <HiOutlineInformationCircle className="text-xl shrink-0 mt-0.5" />
                        <span className="leading-relaxed">این لیست فقط جهت مشاهده است. برای ویرایش، از گزینه «تکمیل مخاطبین» استفاده کنید.</span>
                    </div>

                    {/* 🌟 باکسِ جدول با ارتفاع مشخص و اسکرول داخلی */}
                    <div className="flex-1 min-h-0 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden flex flex-col relative bg-white dark:bg-gray-900">
                        
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center h-full py-12">
                                <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                                <span className="text-sm font-medium text-gray-500">در حال واکشی اطلاعات...</span>
                            </div>
                        ) : contacts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full py-12 text-gray-400">
                                <HiOutlineUsers className="text-6xl mb-4 opacity-20" />
                                <p className="font-medium text-lg text-gray-500">مخاطبی یافت نشد</p>
                            </div>
                        ) : (
                            // 🌟 کانتینر اسکرول‌خورِ جدول
                            <div className="overflow-y-auto flex-1 custom-scrollbar">
                                <table className="w-full text-sm text-right relative">
                                    {/* 🌟 هدر چسبان (Sticky) با افکت بلور */}
                                    <thead className="sticky top-0 z-20 bg-gray-50/95 dark:bg-gray-800/95 backdrop-blur-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 shadow-sm">
                                        <tr>
                                            <th className="px-6 py-4 font-semibold text-center w-16">#</th>
                                            <th className="px-6 py-4 font-semibold">مخاطب</th>
                                            <th className="px-6 py-4 font-semibold">شماره تماس / شناسه</th>
                                        </tr>
                                    </thead>
                                    
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                        {contacts.map((contact, index) => {
                                            const hasName = !!contact.fullName;
                                            const displayName = hasName ? contact.fullName : 'بدون نام';
                                            const initial = hasName ? contact.fullName.substring(0, 1) : '?';
                                            const colorClass = avatarColors[index % avatarColors.length];

                                            return (
                                                <tr key={contact.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/50 transition-colors group">
                                                    {/* ستون ردیف */}
                                                    <td className="px-6 py-3.5 text-center text-gray-400 font-medium">
                                                        {index + 1}
                                                    </td>
                                                    
                                                    {/* 🌟 ستون نام با آواتار جذاب */}
                                                    <td className="px-6 py-3.5">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm ${colorClass}`}>
                                                                {initial}
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className={`font-bold ${hasName ? 'text-gray-800 dark:text-gray-200' : 'text-gray-400 italic'}`}>
                                                                    {displayName}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    
                                                    {/* 🌟 ستون شماره با استایل Badge */}
                                                    <td className="px-6 py-3.5" dir="ltr">
                                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 group-hover:border-indigo-100 dark:group-hover:border-indigo-900/50 transition-colors">
                                                            <HiOutlinePhone className="text-gray-400" />
                                                            <span className="font-mono text-gray-700 dark:text-gray-300 tracking-wider font-medium">
                                                                {contact.phoneNumber || '-'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* 🌟 فوتر مودال */}
                <div className="flex-none p-4 px-6 border-t border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/80 flex justify-end">
                    <Button variant="solid" onClick={onClose} className="font-bold rounded-xl px-8 bg-indigo-600 hover:bg-indigo-700">
                        متوجه شدم
                    </Button>
                </div>

            </div>
        </div>
    );
};

export default ViewContactsModal;