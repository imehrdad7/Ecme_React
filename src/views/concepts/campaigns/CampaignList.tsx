import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    HiOutlineSpeakerphone, 
    HiPlus,
    HiOutlineChevronRight,
    HiOutlineChevronLeft,
    HiOutlineUsers
} from 'react-icons/hi';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Table from '@/components/ui/Table';
import toast from '@/components/ui/toast';
import Notification from '@/components/ui/Notification';
import { apiSearchCampaigns, apiDeleteCampaign } from '@/services/CampaignService';
import { useSessionUser } from '@/store/authStore'; 
import DeleteConfirmModal from '@/components/ui/DeleteConfirmModal';
import { CampaignDto, CampaignStatus } from './types';
import { getToken } from '@/store/authStore'
import { useCampaignSocket } from '@/utils/hooks/useCampaignSocket';
import { CampaignRowActions } from './components/CampaignRowActions'; 
import ViewContactsModal from './components/ViewContactsModal'

const { Tr, Th, Td, THead, TBody } = Table;

const formatPersianDateTime = (isoString: string) => {
    if (!isoString) return 'نامشخص';
    
    const date = new Date(isoString);
    
    return new Intl.DateTimeFormat('fa-IR', {
        calendar: 'persian',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
};

const CampaignList = () => {
    const navigate = useNavigate();
    const [campaigns, setCampaigns] = useState<CampaignDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useSessionUser(); 
    const [token, setToken] = useState<string>('');
    const companyId = user.companyId ?? '';
    
    // استیت‌های مربوط به مودال حذف
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [campaignToDelete, setCampaignToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // 🌟 استیت‌های صفحه‌بندی (Pagination)
    const [pageIndex, setPageIndex] = useState(1);
    const [pageSize] = useState(10);
    const [totalItems, setTotalItems] = useState(0);

    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [viewModalCampaignId, setViewModalCampaignId] = useState<string | null>(null);

    // اتصال به SignalR برای آپدیت زنده
    useEffect(() => {
        const resolveToken = async () => {
            const t = await getToken();
            setToken(t || '');
        };
        resolveToken();
    }, []);

    useCampaignSocket({
        token,
        onCampaignUpdated: (updatedCampaign) => {
            setCampaigns((prev) => 
                prev.map((c) => (c.id === updatedCampaign.id ? { ...c, ...updatedCampaign } : c))
            );
        }
    });

    // 🌟 واکشی اطلاعات با در نظر گرفتن شماره صفحه
    useEffect(() => {
        const fetchCampaigns = async () => {
            setIsLoading(true);
            try {
                const params = {
                    pageIndex: pageIndex,
                    pageSize: pageSize,
                    companyId: companyId
                };

                const response: any = await apiSearchCampaigns(params);
                
                // استخراج لیست آیتم‌ها و تعداد کل
                const fetchedCampaigns = response?.data?.items || response?.items || response?.data || [];
                const total = response?.data?.totalCount || response?.totalCount || 0;
                
                setCampaigns(fetchedCampaigns);
                setTotalItems(total);
                
            } catch (error) {
                console.error("خطا در دریافت لیست کمپین‌ها:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCampaigns();
    }, [companyId, pageIndex, pageSize]);

    // 🌟 رندر وضعیت با استفاده از حروف (مینیمال و زیبا)
    const renderStatusLetter = (status: number) => {
        switch (status) {
            case CampaignStatus.Draft:
                return <span title="پیش‌نویس" className="w-8 h-8 flex items-center justify-center bg-gray-100 text-gray-600 rounded-full text-sm font-bold border border-gray-200 cursor-help">D</span>;
            case CampaignStatus.Scheduled:
                return <span title="زمان‌بندی شده" className="w-8 h-8 flex items-center justify-center bg-indigo-50 text-indigo-600 rounded-full text-sm font-bold border border-indigo-100 cursor-help">S</span>;
            case CampaignStatus.InProgress:
                return (
                    <span title="در حال ارسال" className="w-8 h-8 flex items-center justify-center bg-amber-50 text-amber-600 rounded-full text-sm font-bold border border-amber-200 relative cursor-help">
                        <span className="animate-ping absolute inset-0 rounded-full bg-amber-400 opacity-50"></span>
                        I
                    </span>
                );
            case CampaignStatus.Completed:
                return <span title="پایان یافته" className="w-8 h-8 flex items-center justify-center bg-emerald-50 text-emerald-600 rounded-full text-sm font-bold border border-emerald-200 cursor-help">C</span>;
            case CampaignStatus.Paused:
                return <span title="متوقف شده" className="w-8 h-8 flex items-center justify-center bg-orange-50 text-orange-600 rounded-full text-sm font-bold border border-orange-200 cursor-help">P</span>;
            case CampaignStatus.Cancelled:
                return <span title="لغو شده" className="w-8 h-8 flex items-center justify-center bg-red-50 text-red-600 rounded-full text-sm font-bold border border-red-200 cursor-help">X</span>;
            case CampaignStatus.Retrying:
                return (
                    <span title="در حال تلاش مجدد" className="w-8 h-8 flex items-center justify-center bg-blue-50 text-blue-600 rounded-full text-sm font-bold border border-blue-200 relative cursor-help">
                        <span className="animate-ping absolute inset-0 rounded-full bg-blue-400 opacity-50"></span>
                        R
                    </span>
                );
            default:
                return <span title="نامشخص" className="w-8 h-8 flex items-center justify-center bg-gray-100 text-gray-500 rounded-full text-sm font-bold cursor-help">?</span>;
        }
    };

    
    const openDeleteModal = (id: string) => {
        setCampaignToDelete(id);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!campaignToDelete) return;
        
        setIsDeleting(true);
        try {
            await apiDeleteCampaign(campaignToDelete);
            toast.push(<Notification type="success" title="موفق">کمپین با موفقیت حذف شد.</Notification>, { placement: 'top-center' });
            
            // در صورت موفقیت، هم از استیت کم میکنیم هم تعداد کل را کاهش میدیم
            setCampaigns(prev => prev.filter(c => c.id !== campaignToDelete));
            setTotalItems(prev => prev > 0 ? prev - 1 : 0);
            setDeleteModalOpen(false);
        } catch (error: any) {
            toast.push(
                <Notification type="danger" title="خطا در حذف">
                    {error?.response?.data?.Message || 'خطایی رخ داد. شاید این کمپین در حال اجرا باشد.'}
                </Notification>, 
                { placement: 'top-center' }
            );
        } finally {
            setIsDeleting(false);
            setCampaignToDelete(null);
        }
    };

    const handleOpenContactsModal = (campaignId: string, e?: React.MouseEvent) => {
        if (e) {
            e.stopPropagation();
        }
        
        // آیدی کمپین را تنظیم کن و مودال را باز کن
        setViewModalCampaignId(campaignId);
        setIsViewModalOpen(true);
    };

    // محاسبه تعداد کل صفحات
    const totalPages = Math.ceil(totalItems / pageSize) || 1;

    return (
        <div className="flex flex-col gap-6 w-full h-full pb-8 animate-[fadeIn_0.3s_ease-out]" dir="rtl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                        <HiOutlineSpeakerphone className="text-indigo-600" /> مدیریت کمپین‌ها
                    </h3>
                    <p className="text-sm text-gray-500">لیست تمام پیام‌های انبوه، زمان‌بندی‌ها و پیش‌نویس‌ها</p>
                </div>
                <Button 
                    variant="solid" 
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md rounded-xl"
                    icon={<HiPlus className="text-lg" />}
                    onClick={() => navigate('/concepts/campaigns/create')}
                >
                    کمپین جدید
                </Button>
            </div>

            <Card className="border-gray-200 dark:border-gray-700 p-0 overflow-hidden bg-white dark:bg-gray-900 shadow-sm">
                <div className="overflow-x-auto min-h-[400px]">
                    <Table>
                        <THead className="bg-gray-50 dark:bg-gray-800/50">
                            <Tr>
                                {/* 🌟 وضعیت به ستون اول منتقل شد */}
                                <Th className="w-16 text-center">وضعیت</Th>
                                <Th>نام کمپین</Th>
                                <Th>فرستنده (ربات)</Th>
                                <Th>زمان اجرا</Th>
                                <Th>گیرندگان</Th>
                                <Th className="text-left pl-6">عملیات</Th>
                            </Tr>
                        </THead>
                        <TBody>
                            {isLoading ? (
                                <Tr>
                                    <Td colSpan={5} className="text-center py-16">
                                        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                                        <span className="text-gray-500 font-medium">در حال واکشی اطلاعات...</span>
                                    </Td>
                                </Tr>
                            ) : campaigns.length > 0 ? (
                                campaigns.map((campaign) => {
                                    const isEditable = campaign.status === CampaignStatus.Draft || campaign.status === CampaignStatus.Scheduled;
                                    return(
                                        <Tr key={campaign.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                                            {/* 🌟 دایره وضعیت در ستون اول */}
                                            <Td className="text-center">
                                                <div className="flex justify-center">
                                                    {renderStatusLetter(campaign.status)}
                                                </div>
                                            </Td>
                                            <Td>
                                                <div 
                                                    onClick={() => navigate(isEditable ? `/concepts/campaigns/${campaign.id}/edit` : `/concepts/campaigns/${campaign.id}/report`)}
                                                    className="font-bold text-gray-900 dark:text-gray-100 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors"
                                                    title={isEditable ? "ویرایش پیام کمپین" : "مشاهده گزارش کمپین"}
                                                >    
                                                    {campaign.name}
                                                </div>
                                                <div className="text-[11px] text-gray-400 mt-0.5">ایجاد شده: {formatPersianDateTime(campaign.createdAt)}</div>
                                            </Td>
                                            <Td>
                                                <span className="text-sm text-gray-600 dark:text-gray-400">{campaign.botName}</span>
                                            </Td>
                                            <Td>
                                                {campaign.scheduledAt ? (
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="block w-full text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                                                                {formatPersianDateTime(campaign.scheduledAt)}
                                                        </span>
                                                        <span className="flex w-full items-center justify-center px-2 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700 rounded-md mt-1">
                                                                    زمان‌بندی شده
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="flex items-center justify-center px-2 py-1 text-xs font-bold text-slate-600 bg-slate-100 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700 rounded-md w-full mt-1">
                                                                به محض تایید کمپین
                                                        </span>
                                                    </div>
                                                )}
                                            </Td>
                                            <Td>
                                                <div 
                                                    onClick={(e) => handleOpenContactsModal(campaign.id, e)}
                                                    className="inline-flex items-center justify-center px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold text-sm cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors border border-indigo-100 dark:border-indigo-800"
                                                >
                                                    <HiOutlineUsers className="me-1.5 text-lg" />
                                                    {campaign.totalRecipients || 0} نفر
                                                </div>
                                            </Td>
                                            <Td className="text-left w-32 pl-4">
                                                <CampaignRowActions 
                                                    campaignId={campaign.id} 
                                                    status={campaign.status} 
                                                    totalRecipients={campaign.totalRecipients || 0}
                                                    openDeleteModal={openDeleteModal} 
                                                    openViewContactsModal={(id) => handleOpenContactsModal(id)}
                                                />
                                            </Td>
                                        </Tr>
                                    );
                                })
                            ) : (
                                <Tr>
                                    <Td colSpan={5} className="text-center py-16 text-gray-500 font-medium">هیچ کمپینی ثبت نشده است.</Td>
                                </Tr>
                            )}
                        </TBody>
                    </Table>
                </div>

                {/* 🌟 بخش صفحه‌بندی (Pagination) */}
                {totalItems > 0 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/20">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            نمایش <span className="font-bold text-gray-900 dark:text-gray-100">{((pageIndex - 1) * pageSize) + 1}</span> تا <span className="font-bold text-gray-900 dark:text-gray-100">{Math.min(pageIndex * pageSize, totalItems)}</span> از <span className="font-bold text-gray-900 dark:text-gray-100">{totalItems}</span> کمپین
                        </span>
                        
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => setPageIndex(p => Math.max(1, p - 1))}
                                disabled={pageIndex === 1 || isLoading}
                                className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <HiOutlineChevronRight className="text-lg" />
                            </button>
                            
                            <div className="flex items-center gap-1">
                                {[...Array(totalPages)].map((_, i) => {
                                    const pageNum = i + 1;
                                    // منطق ساده برای نمایش صفحات (جلوگیری از طولانی شدن بیش از حد)
                                    if (pageNum === 1 || pageNum === totalPages || (pageNum >= pageIndex - 1 && pageNum <= pageIndex + 1)) {
                                        return (
                                            <button 
                                                key={pageNum}
                                                onClick={() => setPageIndex(pageNum)}
                                                disabled={isLoading}
                                                className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-colors ${
                                                    pageIndex === pageNum 
                                                        ? 'bg-indigo-600 text-white shadow-sm' 
                                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                                }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    } else if (pageNum === pageIndex - 2 || pageNum === pageIndex + 2) {
                                        return <span key={pageNum} className="text-gray-400">...</span>;
                                    }
                                    return null;
                                })}
                            </div>

                            <button 
                                onClick={() => setPageIndex(p => Math.min(totalPages, p + 1))}
                                disabled={pageIndex === totalPages || isLoading}
                                className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <HiOutlineChevronLeft className="text-lg" />
                            </button>
                        </div>
                    </div>
                )}
            </Card>

            <DeleteConfirmModal 
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                isLoading={isDeleting}
                title="حذف کمپین"
                message={
                    <>
                        آیا از حذف این کمپین اطمینان دارید؟<br/>
                        این عمل غیرقابل بازگشت است و تمام تنظیمات آن پاک خواهد شد.
                    </>
                }
            />
            <ViewContactsModal 
                isOpen={isViewModalOpen}
                campaignId={viewModalCampaignId}
                onClose={() => {
                    setIsViewModalOpen(false);
                    setViewModalCampaignId(null);
                }}
            />
            </div>
        );
    };

export default CampaignList;