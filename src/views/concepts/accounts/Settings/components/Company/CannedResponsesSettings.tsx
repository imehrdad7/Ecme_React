import React, { useState, useEffect } from 'react';
import { 
    HiOutlineLightningBolt, HiPlus, HiPencil, HiTrash, 
    HiX , HiArrowRight , HiSearch , HiChevronRight, HiChevronLeft,
    HiOutlineExclamation

} from 'react-icons/hi';
import toast from '@/components/ui/toast';
import Notification from '@/components/ui/Notification';
import Button from '@/components/ui/Button'


import { 
    apiGetCannedResponses, 
    apiCreateCannedResponse, 
    apiUpdateCannedResponse, 
    apiDeleteCannedResponse 
} from '@/services/liveChatService';

export type CannedResponse = {
    id: string;
    trigger: string;
    text: string;
}

interface Props {
    companyId: string;
    onBack?: () => void;
}

export const CannedResponsesSettings = ({ companyId, onBack }: Props) => {
    const [responses, setResponses] = useState<CannedResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 4;
    // استیت‌های مربوط به مودال
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({ trigger: '', text: '' });
    
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const fetchResponses = async () => {
        setIsLoading(true);
        try {
            const res = await apiGetCannedResponses(companyId);
            if (res) {
                setResponses(res);
            }
        } catch (error) {
            toast.push(<Notification title="خطا" type="danger">دریافت لیست با مشکل مواجه شد.</Notification>, { placement: 'top-center' });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (companyId) fetchResponses();
    }, [companyId]);

    const handleOpenAddModal = () => {
        setEditingId(null);
        setFormData({ trigger: '/', text: '' }); // تریگر دیفالت با اسلش شروع شود
        setIsModalOpen(true);
    };

    // باز کردن مودال برای ویرایش
    const handleOpenEditModal = (item: CannedResponse) => {
        setEditingId(item.id);
        setFormData({ trigger: item.trigger, text: item.text });
        setIsModalOpen(true);
    };

    // ذخیره فرم (افزودن یا ویرایش)
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.trigger || !formData.text) {
             toast.push(<Notification title="خطا" type="warning">لطفاً همه فیلدها را پر کنید.</Notification>, { placement: 'top-center' });
             return;
        }

        setIsSaving(true);
        try {
            // فرمت کردن تریگر در فرانت‌اند برای UX بهتر (بک‌اند هم خودش هندل می‌کند)
            const formattedTrigger = formData.trigger.startsWith('/') 
                ? formData.trigger.replace(/\s+/g, '') 
                : `/${formData.trigger.replace(/\s+/g, '')}`;

            if (editingId) {
                await apiUpdateCannedResponse(editingId, { 
                    id: editingId, 
                    companyId, 
                    trigger: formattedTrigger, 
                    text: formData.text 
                });
                toast.push(<Notification title="موفقیت" type="success">پاسخ با موفقیت ویرایش شد.</Notification>, { placement: 'top-center' });
            } else {
                await apiCreateCannedResponse({ 
                    companyId, 
                    trigger: formattedTrigger, 
                    text: formData.text 
                });
                toast.push(<Notification title="موفقیت" type="success">پاسخ جدید اضافه شد.</Notification>, { placement: 'top-center' });
            }
            
            setIsModalOpen(false);
            fetchResponses(); // رفرش لیست
        } catch (error: any) {
            const errorMsg = error?.response?.data?.message || error.message || 'عملیات با خطا مواجه شد.';
            toast.push(<Notification title="خطا" type="danger">{errorMsg}</Notification>, { placement: 'top-center' });
        } finally {
            setIsSaving(false);
        }
    };

    const openDeleteModal = (id: string) => {
        setDeletingId(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!deletingId) return;
        
        setIsDeleting(true);
        try {
            await apiDeleteCannedResponse(deletingId, companyId);
            toast.push(<Notification title="موفقیت" type="success">پاسخ حذف شد.</Notification>, { placement: 'top-center' });
            
            const totalItemsInCurrentPage = paginatedResponses.length;
            if (currentPage > 1 && totalItemsInCurrentPage === 1) {
                setCurrentPage(currentPage - 1);
            }

            fetchResponses();
            setIsDeleteModalOpen(false); // بستن مودال
        } catch (error) {
            toast.push(<Notification title="خطا" type="danger">حذف با شکست مواجه شد.</Notification>, { placement: 'top-center' });
        } finally {
            setIsDeleting(false);
            setDeletingId(null); // پاک کردن آیدی
        }
    };

    const filteredResponses = responses.filter(item => 
        item.trigger.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.text.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredResponses.length / pageSize);
    const paginatedResponses = filteredResponses.slice(
        (currentPage - 1) * pageSize, 
        currentPage * pageSize
    );

   return (
        <div className="animate-[fadeIn_0.3s_ease-out]">
            {/* دکمه بازگشت در بالاترین بخش */}
            {onBack && (
                <div className="mb-6 flex items-center">
                    <Button 
                        size="sm" 
                        variant="plain" 
                        onClick={onBack}
                        icon={<HiArrowRight className="text-xl" />} // از آیکون فلش راست برای RTL استفاده کردیم
                    >
                        بازگشت به اطلاعات شرکت
                    </Button>
                </div>
            )}

            {/* هدر اصلی شامل عنوان، توضیحات و دکمه افزودن */}
            <div className="flex items-center justify-between mb-8 border-b border-gray-200 dark:border-gray-700 pb-4">
                <div>
                    <h4 className="mb-1 flex items-center gap-2">
                        <HiOutlineLightningBolt className="text-indigo-500" />
                        پاسخ‌های آماده
                    </h4>
                    <p className="text-gray-500 text-sm">
                        متن‌های پرتکرار را اینجا تعریف کنید تا با تایپ ( / ) سریعاً ارسال شوند.
                    </p>
                </div>
                <Button
                    variant="solid"
                    type="button"
                    onClick={handleOpenAddModal}
                >
                    <div className="flex items-center gap-2">
                        <HiPlus className="text-lg" />
                        <span>افزودن پاسخ جدید</span>
                    </div>
                </Button>
            </div>

            <div className="mb-6 relative">
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <HiSearch className="text-gray-400 text-lg" />
                </div>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="جستجو در کلمات کلیدی یا متن پیام‌ها..."
                    className="w-full sm:w-96 pl-4 pr-10 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
                />
            </div>

          {isLoading ? (
                <div className="flex justify-center items-center h-32">
                    <span className="animate-spin h-6 w-6 border-2 border-indigo-600 border-t-transparent rounded-full"></span>
                </div>
            ) : responses.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                    <HiOutlineLightningBolt className="mx-auto text-4xl text-gray-300 dark:text-gray-600 mb-2" />
                    <p className="text-gray-500">هیچ پاسخ آماده‌ای یافت نشد.</p>
                </div>
            ) : filteredResponses.length === 0 ? (
                /* 🌟 4. نمایش پیام خطا اگر سرچ نتیجه‌ای نداشت */
                <div className="text-center py-10 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                    <HiSearch className="mx-auto text-4xl text-gray-300 dark:text-gray-600 mb-2" />
                    <p className="text-gray-500">موردی با عبارت «<span className="font-bold text-gray-700 dark:text-gray-300">{searchTerm}</span>» پیدا نشد.</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {paginatedResponses.map((item) => (
                            <div key={item.id} className="group p-4 bg-gray-50 hover:bg-indigo-50/50 dark:bg-gray-800 dark:hover:bg-gray-750 border border-gray-200 dark:border-gray-700 rounded-xl transition-all relative overflow-hidden">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="inline-block bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-mono font-bold px-2 py-1 rounded-md text-xs dir-ltr">
                                        {item.trigger}
                                    </span>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleOpenEditModal(item)} className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg" title="ویرایش">
                                            <HiPencil />
                                        </button>
                                        <button onClick={() => openDeleteModal(item.id!)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg" title="حذف">
                                            <HiTrash />
                                        </button>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                                    {item.text}
                                </p>
                            </div>
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4 mt-6">
                            <span className="text-sm text-gray-500">
                                نمایش {(currentPage - 1) * pageSize + 1} تا {Math.min(currentPage * pageSize, filteredResponses.length)} از {filteredResponses.length} مورد
                            </span>
                            <div className="flex items-center gap-2">
                                <Button
                                    size="sm"
                                    variant="plain"
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(prev => prev - 1)}
                                    icon={<HiChevronRight className="text-lg" />} // فلش راست برای صفحه قبلی در RTL
                                >
                                    قبلی
                                </Button>
                                
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 px-2">
                                    صفحه {currentPage} از {totalPages}
                                </span>

                                <Button
                                    size="sm"
                                    variant="plain"
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(prev => prev + 1)}
                                >
                                    <div className="flex items-center gap-1">
                                        <span>بعدی</span>
                                        <HiChevronLeft className="text-lg" />
                                    </div>
                                </Button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* مودال افزودن / ویرایش (بدون تغییر) */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-gray-800">
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                            <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-0">
                                {editingId ? 'ویرایش پاسخ' : 'افزودن پاسخ جدید'}
                            </h4>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                                <HiX className="text-xl" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSave} className="p-6">
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    کلمه کلیدی (بدون فاصله)
                                </label>
                                <input
                                    dir="ltr"
                                    type="text"
                                    value={formData.trigger}
                                    onChange={(e) => setFormData({ ...formData, trigger: e.target.value.replace(/\s+/g, '') })}
                                    placeholder="/salam"
                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-left font-mono"
                                    onKeyDown={(e) => {
                                        if (e.key === ' ') {
                                            e.preventDefault();
                                        }
                                    }}
                                />
                                <p className="text-xs text-gray-400 mt-1">با کاراکتر / شروع شود (مثال: /شماره_کارت)</p>
                            </div>
                            
                            <div className="mb-8">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    متن پاسخ
                                </label>
                                <textarea
                                    value={formData.text}
                                    onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                                    placeholder="متن کامل پیام را اینجا بنویسید..."
                                    rows={5}
                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                                <Button
                                    type="button"
                                    variant="plain"
                                    onClick={() => setIsModalOpen(false)}
                                >
                                    انصراف
                                </Button>
                                <Button
                                    type="submit"
                                    variant="solid"
                                    loading={isSaving}
                                    className="min-w-[100px]"
                                >
                                    ذخیره
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-gray-800 p-6 text-center">
                        
                        {/* آیکون هشدار */}
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-6">
                            <HiOutlineExclamation className="h-8 w-8 text-red-600 dark:text-red-500" />
                        </div>
                        
                        {/* عنوان و توضیحات */}
                        <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">
                            حذف پاسخ آماده
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
                            آیا از حذف این پاسخ مطمئن هستید؟ این عمل غیرقابل بازگشت است و اپراتورها دیگر به آن دسترسی نخواهند داشت.
                        </p>
                        
                        {/* دکمه‌ها */}
                        <div className="flex justify-center gap-3">
                            <Button
                                variant="plain"
                                onClick={() => {
                                    setIsDeleteModalOpen(false);
                                    setDeletingId(null);
                                }}
                                className="flex-1"
                                disabled={isDeleting}
                            >
                                انصراف
                            </Button>
                            <Button
                                variant="solid"
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white border-transparent"
                                onClick={confirmDelete}
                                loading={isDeleting}
                            >
                                حذف پاسخ
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};