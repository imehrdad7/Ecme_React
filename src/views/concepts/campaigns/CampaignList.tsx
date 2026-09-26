import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    HiOutlineSpeakerphone,
    HiPlus,
    HiOutlineChevronRight,
    HiOutlineChevronLeft,
    HiOutlineUsers,
    HiOutlineLightningBolt,
    HiOutlineClock,
    HiOutlinePause,
    HiOutlineBan,
    HiOutlineCheckCircle,
    HiOutlineSearch,
    HiOutlineRefresh,
    HiX
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
import { getToken } from '@/store/authStore';
import { useCampaignSocket } from '@/utils/hooks/useCampaignSocket';
import { CampaignRowActions } from './components/CampaignRowActions';
import ViewContactsModal from './components/ViewContactsModal';
import { FaGlobe, FaTelegramPlane, FaInstagram, FaWhatsapp, FaRobot } from 'react-icons/fa';

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

const BaleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 999.72" width="1em" height="1em" preserveAspectRatio="xMidYMid meet" {...props}>
        <defs>
            <linearGradient id="bale-gradient" x1="800.4" y1="93.39" x2="93.57" y2="800.23" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#46ce9e" />
                <stop offset="1" stopColor="#2a8365" />
            </linearGradient>
        </defs>
        <g id="File"><g>
            <path d="M1010.36,547.36c-.73,17.77-2.6,36-6.85,53.41-1.54,16.48-6.36,32.54-10.76,48.52-5.14,19.5-12.48,38.33-19.9,57.17-6.77,15.66-14.35,30.91-22.26,46.08C942.92,766,934.93,779.2,926.29,792q-14.32,21-30.5,40.45c-11.18,13.13-22.68,26.09-35.15,37.92a503.68,503.68,0,0,1-51.3,43.55,453.44,453.44,0,0,1-48.44,31.56C742.06,956.74,722.16,966,702,974.6a548,548,0,0,1-65.89,21.86c-19.49,4.32-39,9.21-58.88,10.76-37,5.71-74.86,5.79-112.13,2.2-33.6-2.61-66.87-9.78-99.25-19.32l-.08-.58C210.19,944.18,82.32,816.07,34.94,661.2c-10.36-33.35-17.62-67.93-20.31-102.83-3.83-33.85-2-68-2.2-102q-.37-40.74-.08-81.64-.26-41.83,0-83.83c-.17-24-.08-47.95-.08-71.93s-.17-48.19.16-72.25c-.33-23.82-.08-47.63-.16-71.44-1.64-17.94,4.24-36.7,17.86-48.85C44.48,13.44,65.68,8.55,84,14.91c11.09,3.75,20.71,10.6,30.58,16.72,36,23.4,70.54,48.85,104.71,74.78a86.74,86.74,0,0,0,10.68-6.77A426.86,426.86,0,0,1,272.58,73.3a483.59,483.59,0,0,1,45.75-22.1c16.39-6.85,33.19-12.8,50.15-18.1,18.1-5,36.29-10.11,55-12.72a392.65,392.65,0,0,1,61.82-7.26,451.46,451.46,0,0,1,76.41,1.71A413.36,413.36,0,0,1,619,24c128.53,27,244.08,108.3,314.46,219a493,493,0,0,1,66.47,159.76c4.73,20.95,8.48,42.32,9.7,63.77A411.89,411.89,0,0,1,1010.36,547.36Z" transform="translate(-12 -12.14)" fill="url(#bale-gradient)" />
            <path d="M705.69,273.2a107.59,107.59,0,0,1,62.37,1.3c25.62,9.82,46.29,29.94,57.5,54.9,8.34,22.86,9.31,48.42.91,71.44-6.06,16.2-16.76,30.09-29.4,41.74q-16.7,16.49-33.21,33.14c-11.79,11.79-23.64,23.5-35.33,35.35-11.3,11.28-22.62,22.49-33.85,33.81-12.32,12.34-24.68,24.61-36.95,37-14,14-28.06,27.94-42,42-13.24,13.29-26.55,26.49-39.8,39.78s-26.77,26.71-40.1,40.11c-12.27,11.85-23.51,24.94-37.35,35.06a106.69,106.69,0,0,1-57.95,16C417,753.28,393.79,744,376.87,727.33q-78.53-78.44-157-156.94c-12.82-12.66-21.38-29.07-26-46.38-4.75-23.86-1.94-49.51,10.31-70.75,9.37-16.54,23.79-29.65,40.19-39a107.52,107.52,0,0,1,57.86-9.73c21.38,3.21,42,13,56.91,28.76Q401.7,476,444.37,518.5c8.63-8.18,16.9-16.73,25.19-25.27q18-17.31,35.24-35.35c11.36-10.68,22.33-21.82,33.07-33.12,7.74-6.88,14.75-14.51,22.07-21.8,12-11.68,23.75-23.59,35.49-35.51,11.21-10.83,22.11-21.95,33.07-33,11.79-11.5,23.28-23.28,35-34.87a105.75,105.75,0,0,1,42.21-26.37Z" transform="translate(-12 -12.14)" fill="#fff" />
        </g></g>
    </svg>
);

const getPlatformInfo = (platform?: string) => {
    if (!platform) return { icon: FaGlobe, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/30' };
    if (platform.includes('Telegram')) return { icon: FaTelegramPlane, color: 'text-sky-500', bg: 'bg-sky-50 dark:bg-sky-900/30' };
    if (platform.includes('Instagram')) return { icon: FaInstagram, color: 'text-pink-600', bg: 'bg-pink-50 dark:bg-pink-900/30' };
    if (platform.includes('WhatsApp')) return { icon: FaWhatsapp, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/30' };
    if (platform.includes('Bale')) return { icon: BaleIcon, color: '', bg: 'bg-emerald-50 dark:bg-emerald-900/30' };
    return { icon: FaRobot, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/30' };
};

const CampaignList = () => {
    const navigate = useNavigate();
    const { user } = useSessionUser();
    const companyId = user.companyId ?? '';

    // States
    const [campaigns, setCampaigns] = useState<CampaignDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [token, setToken] = useState<string>('');

    // Search & UI States
    const [searchText, setSearchText] = useState('');
    const [debouncedSearchText, setDebouncedSearchText] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Modal States
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [campaignToDelete, setCampaignToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [viewModalCampaignId, setViewModalCampaignId] = useState<string | null>(null);

    // Pagination
    const [pageIndex, setPageIndex] = useState(1);
    const [pageSize] = useState(10);
    const [totalItems, setTotalItems] = useState(0);

    // SignalR Setup
    useEffect(() => {
        const resolveToken = async () => {
            const t = await getToken();
            setToken(t || '');
        };
        resolveToken();
    }, []);

    // اعمال Debounce روی جستجو
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchText(searchText);
            // وقتی کاربر سرچ جدید می‌کنه، منطقیه که برگردیم به صفحه اول
            setPageIndex(1);
        }, 600); // ۶۰۰ میلی‌ثانیه مکث

        return () => {
            clearTimeout(handler);
        };
    }, [searchText]);

    useCampaignSocket({
        token,
        onCampaignUpdated: (updatedCampaign) => {
            setCampaigns((prev) =>
                prev.map((c) => (c.id === updatedCampaign.id ? { ...c, ...updatedCampaign } : c))
            );
        }
    });

    // Fetch Data
    const fetchCampaigns = async () => {
        setIsLoading(true);
        try {
            const params = {
                pageNumber: pageIndex,
                pageSize: pageSize,
                companyId: companyId,
                searchTerm: debouncedSearchText
            };

            const response: any = await apiSearchCampaigns(params);

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

    useEffect(() => {
        fetchCampaigns();
    }, [companyId, pageIndex, pageSize, debouncedSearchText]);

    // 🌟 بجای حروف تکی (C, S, D)، از بج‌های مدرن استفاده می‌کنیم
    const renderStatusBadge = (status: number) => {
        switch (status) {
            case CampaignStatus.Draft:
                return <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-bold border border-gray-200 dark:border-gray-700">پیش‌نویس</span>;
            case CampaignStatus.Scheduled:
                return <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold border border-indigo-100 dark:border-indigo-800/30">زمان‌بندی شده</span>;
            case CampaignStatus.InProgress:
                return (
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold border border-amber-100 dark:border-amber-800/30">
                        <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span></span>
                        در حال ارسال
                    </span>
                );
            case CampaignStatus.Completed:
                return <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-100 dark:border-emerald-800/30">پایان یافته</span>;
            case CampaignStatus.Paused:
                return <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 text-xs font-bold border border-orange-100 dark:border-orange-800/30">متوقف شده</span>;
            case CampaignStatus.Cancelled:
                return <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-bold border border-red-100 dark:border-red-800/30">لغو شده</span>;
            case CampaignStatus.Retrying:
                return (
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold border border-blue-100 dark:border-blue-800/30">
                        <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span></span>
                        تلاش مجدد
                    </span>
                );
            default:
                return <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 text-xs font-bold">نامشخص</span>;
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
            toast.push(<Notification type="success" title="موفقیت">کمپین با موفقیت حذف شد.</Notification>, { placement: 'top-center' });
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
        if (e) e.stopPropagation();
        setViewModalCampaignId(campaignId);
        setIsViewModalOpen(true);
    };

    const totalPages = Math.ceil(totalItems / pageSize) || 1;

    return (
        <div className="flex flex-col gap-4 h-[calc(100vh-115px)] min-h-[500px] animate-[fadeIn_0.3s_ease-out]" dir="rtl">

            {/* ========================================== */}
            {/* 🎯 پنل یکپارچه (Card اصلی) */}
            {/* ========================================== */}
            <div className="flex-1 bg-white dark:bg-gray-900 shadow-sm border border-gray-200 dark:border-gray-800 rounded-2xl flex flex-col min-h-0 overflow-hidden">

                {/* --- بخش هدر و اکشن‌بار --- */}
                <div className="p-5 md:p-6 border-b border-gray-100 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-5">

                    <div className="flex items-center justify-center sm:justify-start gap-3 md:gap-4 w-full sm:w-auto text-right">
                        <div className="w-12 h-12 md:w-14 md:h-14 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center rounded-xl flex-shrink-0">
                            <HiOutlineSpeakerphone className="text-2xl" />
                        </div>
                        <div className="flex flex-col">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">مدیریت کمپین‌ها</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                لیست تمام پیام‌های انبوه و زمان‌بندی‌ها
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
                        <div className="flex items-center justify-end gap-2 w-full md:w-auto">

                            {/* سرچ‌بار انیمیشنی */}
                            <div
                                className={`relative flex items-center transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] h-11 ${isSearchOpen || searchText
                                    ? 'flex-1 md:flex-none md:w-[24rem] bg-gray-50 dark:bg-gray-800 rounded-xl border-indigo-500 shadow-inner'
                                    : 'w-11 bg-gray-50 dark:bg-gray-900/40 rounded-full border-transparent hover:border-indigo-300 dark:hover:border-indigo-500 shadow-sm cursor-pointer'
                                    } border`}
                                onClick={() => {
                                    if (!isSearchOpen && !searchText) {
                                        setIsSearchOpen(true);
                                        setTimeout(() => searchInputRef.current?.focus(), 50);
                                    }
                                }}
                            >
                                <div className={`absolute right-0 w-11 h-11 flex items-center justify-center transition-transform duration-500 ${isSearchOpen || searchText ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 hover:scale-110'}`}>
                                    <HiOutlineSearch className="text-xl" />
                                </div>
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    placeholder="جستجوی نام کمپین..."
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                    onBlur={() => { if (!searchText) setIsSearchOpen(false) }}
                                    className={`w-full h-full bg-transparent outline-none pr-12 pl-10 transition-all duration-500 text-gray-800 dark:text-gray-100 text-[15px] md:text-base ${isSearchOpen || searchText ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                                        }`}
                                />
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); setSearchText(''); setIsSearchOpen(false); }}
                                    className={`absolute left-2 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-300 ${isSearchOpen || searchText ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-50 invisible'}`}
                                >
                                    <HiX className="text-base" />
                                </button>
                            </div>

                            {/* دکمه رفرش */}
                            <button
                                type="button"
                                onClick={fetchCampaigns}
                                disabled={isLoading}
                                className="flex-shrink-0 w-11 h-11 flex items-center justify-center rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-indigo-600 dark:text-gray-400 hover:border-indigo-300 shadow-sm transition-all duration-300 active:scale-95 disabled:opacity-50"
                                title="به‌روزرسانی"
                            >
                                <HiOutlineRefresh className={`text-xl ${isLoading ? 'animate-spin text-indigo-500' : ''}`} />
                            </button>
                        </div>

                        <Button
                            variant="solid"
                            className="w-full md:w-auto h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md rounded-xl transition-all hover:translate-y-[-1px] active:scale-[0.98]"
                            icon={<HiPlus className="text-xl" />}
                            onClick={() => navigate('/concepts/campaigns/create')}
                        >
                            کمپین جدید
                        </Button>
                    </div>
                </div>

                {/* --- بخش جدول (دسکتاپ) --- */}
                <div className="hidden md:block overflow-y-auto flex-1 min-h-0 relative [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-gray-700 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-400 [scrollbar-width:thin]">
                    <table className="w-full text-right border-collapse relative">
                        <thead className="sticky top-0 z-30">
                            <tr className="bg-gray-50 dark:bg-gray-800/80 shadow-[0_1px_2px_0px_rgba(0,0,0,0.05)] backdrop-blur-md">
                                <th className="w-32 py-3.5 px-5 text-[15px] font-bold text-gray-800 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700">وضعیت</th>
                                <th className="py-3.5 px-4 text-[15px] font-bold text-gray-800 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700">نام کمپین</th>
                                <th className="py-3.5 px-4 text-[15px] font-bold text-gray-800 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700">فرستنده (ربات)</th>
                                <th className="py-3.5 px-4 text-[15px] font-bold text-gray-800 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700">زمان اجرا</th>
                                <th className="py-3.5 px-4 text-[15px] font-bold text-gray-800 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700">گیرندگان</th>
                                <th className="w-32 py-3.5 px-5 text-[15px] font-bold text-gray-800 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 text-left">عملیات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-16">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                            <span className="text-gray-500 font-medium">در حال دریافت کمپین‌ها...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : campaigns.length > 0 ? (
                                campaigns.map((campaign) => {
                                    const isEditable = campaign.status === CampaignStatus.Draft || campaign.status === CampaignStatus.Scheduled;
                                    return (
                                        <tr key={campaign.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition-colors border-b border-gray-100 dark:border-gray-800 last:border-0 group">
                                            <td className="py-4 px-5 align-top">
                                                {renderStatusBadge(campaign.status)}
                                            </td>
                                            <td className="py-4 px-4 align-top">
                                                <div
                                                    onClick={() => navigate(isEditable ? `/concepts/campaigns/${campaign.id}/edit` : `/concepts/campaigns/${campaign.id}/report`)}
                                                    className="font-bold text-[15px] text-gray-900 dark:text-gray-100 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors mb-1 inline-block"
                                                    title={isEditable ? "ویرایش پیام کمپین" : "مشاهده گزارش کمپین"}
                                                >
                                                    {campaign.name}
                                                </div>
                                                <div className="text-[11px] text-gray-400 font-medium">ایجاد: {formatPersianDateTime(campaign.createdAt)}</div>
                                            </td>
                                            <td className="py-4 px-4 align-top">
                                                {(() => {
                                                    const platInfo = getPlatformInfo(campaign.botPlatform);
                                                    const PlatformIcon = platInfo.icon;

                                                    return (
                                                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${platInfo.bg} ${platInfo.color} border border-transparent w-max`}>
                                                            <PlatformIcon className={`text-base ${campaign.botPlatform?.includes('Bale') ? 'grayscale-0' : ''}`} />
                                                            <span className="text-sm font-bold truncate max-w-[120px]" title={campaign.botName}>
                                                                {campaign.botName || 'سراسری'}
                                                            </span>
                                                        </div>
                                                    );
                                                })()}
                                            </td>
                                            <td className="py-4 px-4 align-top">
                                                <div className="flex flex-col gap-1.5">
                                                    {campaign.status === 3 || campaign.status === 7 ? (
                                                        <span className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400 text-[11px] font-bold w-max">
                                                            <span className="relative flex h-2 w-2">
                                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                                                            </span>
                                                            {campaign.status === 7 ? 'در حال تلاش مجدد...' : 'در حال ارسال...'}
                                                        </span>
                                                    ) : campaign.status === 5 ? (
                                                        <span className="inline-flex items-center gap-1 text-rose-500 dark:text-rose-400 text-[11px] font-bold w-max">
                                                            <HiOutlinePause className="text-[14px]" /> متوقف شده
                                                        </span>
                                                    ) : campaign.status === 4 ? (
                                                        <span className="inline-flex items-center gap-1 text-emerald-500 dark:text-emerald-400 text-[11px] font-bold w-max">
                                                            <HiOutlineCheckCircle className="text-[14px]" /> پایان یافته
                                                        </span>
                                                    ) : campaign.status === 6 ? (
                                                        <span className="inline-flex items-center gap-1 text-gray-500 dark:text-gray-400 text-[11px] font-bold w-max">
                                                            <HiOutlineBan className="text-[14px]" /> لغو شده
                                                        </span>
                                                    ) : campaign.status === 2 ? (
                                                        <span className="inline-flex items-center gap-1 text-indigo-500 dark:text-indigo-400 text-[11px] font-bold w-max">
                                                            <HiOutlineClock className="text-[14px]" /> در انتظار ارسال
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-amber-500 dark:text-amber-400 text-[11px] font-bold w-max">
                                                            <HiOutlineLightningBolt className="text-[14px]" /> پیش‌نویس (فوری)
                                                        </span>
                                                    )}
                                                    {campaign.status === 1 ? (
                                                        <span className="text-xs font-semibold text-gray-400 mt-1">در انتظار تایید گیرندگان</span>
                                                    ) : campaign.status === 2 && campaign.scheduledAt ? (
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                                                                {new Date(campaign.scheduledAt).toLocaleDateString('fa-IR', { month: 'long', day: 'numeric' })}
                                                            </span>
                                                            <span className="text-[11px] font-semibold text-gray-500 mt-0.5">
                                                                برنامه‌ریزی برای ساعت <span className="font-bold text-gray-600 dark:text-gray-300">{new Date(campaign.scheduledAt).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}</span>
                                                            </span>
                                                        </div>
                                                    ) : campaign.startedAt ? (
                                                        <div className="flex flex-col">
                                                            <span className={`text-sm font-bold ${campaign.status === 4 ? 'text-emerald-700 dark:text-emerald-500' : 'text-gray-800 dark:text-gray-200'}`}>
                                                                {new Date(campaign.startedAt).toLocaleDateString('fa-IR', { month: 'long', day: 'numeric' })}
                                                            </span>
                                                            <span className="text-[11px] font-semibold text-gray-500 mt-0.5 flex items-center gap-1">
                                                                {campaign.status === 4 ? 'تکمیل ارسال در' : campaign.status === 5 ? 'زمانِ استارت اولیه:' : 'آغاز ارسال از'}
                                                                <span className="font-bold text-gray-700 dark:text-gray-300">
                                                                    {new Date(campaign.startedAt).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
                                                                </span>
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs font-semibold text-gray-400 mt-1">نامشخص</span>
                                                    )}

                                                </div>
                                            </td>
                                            <td className="py-4 px-4 align-top">
                                                <div
                                                    onClick={(e) => handleOpenContactsModal(campaign.id, e)}
                                                    className="inline-flex items-center justify-center px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold text-sm cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors border border-indigo-100 dark:border-indigo-800"
                                                >
                                                    <HiOutlineUsers className="me-1.5 text-lg" />
                                                    {campaign.totalRecipients || 0} نفر
                                                </div>
                                            </td>
                                            <td className="py-4 px-5 text-left align-top">
                                                <CampaignRowActions
                                                    campaignId={campaign.id}
                                                    status={campaign.status}
                                                    totalRecipients={campaign.totalRecipients || 0}
                                                    openDeleteModal={openDeleteModal}
                                                    openViewContactsModal={(id) => handleOpenContactsModal(id)}
                                                />
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={6} className="text-center py-16 text-gray-500">
                                        هیچ کمپینی یافت نشد. با زدن دکمه «کمپین جدید» اولین ارسال خود را بسازید.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* --- بخش موبایل (کارت‌های اپلیکیشنی) --- */}
                <div className="md:hidden overflow-y-auto flex-1 min-h-0 flex flex-col gap-4 p-4 bg-gray-50/50 dark:bg-gray-900/30">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-3 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-gray-500 font-medium">در حال بارگذاری...</span>
                        </div>
                    ) : campaigns.length > 0 ? (
                        campaigns.map((campaign) => {
                            const isEditable = campaign.status === CampaignStatus.Draft || campaign.status === CampaignStatus.Scheduled;
                            return (
                                <div key={campaign.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col shrink-0 relative overflow-hidden transition-all">
                                    <div className="p-4 flex flex-col gap-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex flex-col gap-1 pr-2">
                                                <span
                                                    className="font-extrabold text-base text-gray-900 dark:text-white cursor-pointer"
                                                    onClick={() => navigate(isEditable ? `/concepts/campaigns/${campaign.id}/edit` : `/concepts/campaigns/${campaign.id}/report`)}
                                                >
                                                    {campaign.name}
                                                </span>

                                                {(() => {
                                                    const platInfo = getPlatformInfo(campaign.botPlatform);
                                                    const PlatformIcon = platInfo.icon;
                                                    return (
                                                        <div className={`inline-flex items-center gap-1 mt-0.5 w-max px-2 py-0.5 rounded-md ${platInfo.bg} ${platInfo.color}`}>
                                                            <PlatformIcon className="text-xs" />
                                                            <span className="text-[11px] font-bold truncate max-w-[140px]">
                                                                {campaign.botName || 'سراسری'}
                                                            </span>
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                            <div className="flex-shrink-0 pl-1">{renderStatusBadge(campaign.status)}</div>
                                        </div>

                                        <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-900/50 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800 mt-1">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-gray-400 font-bold mb-0.5">زمان اجرا</span>
                                                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                                                    {campaign.startedAt || campaign.scheduledAt
                                                        ? new Date(campaign.startedAt || campaign.scheduledAt || '').toLocaleDateString('fa-IR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                                                        : 'نامشخص'}
                                                </span>
                                            </div>
                                            <div
                                                onClick={(e) => handleOpenContactsModal(campaign.id, e)}
                                                className="flex items-center gap-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded-lg text-xs font-bold cursor-pointer"
                                            >
                                                <HiOutlineUsers className="text-sm" />
                                                {campaign.totalRecipients || 0} گیرنده
                                            </div>
                                        </div>
                                    </div>

                                    {/* نوار پایین برای اکشن‌ها */}
                                    <div className="bg-gray-50/80 dark:bg-gray-900/80 rounded-b-2xl p-2.5 flex items-center justify-end border-t border-gray-100 dark:border-gray-800">
                                        <CampaignRowActions
                                            campaignId={campaign.id}
                                            status={campaign.status}
                                            totalRecipients={campaign.totalRecipients || 0}
                                            openDeleteModal={openDeleteModal}
                                            openViewContactsModal={(id) => handleOpenContactsModal(id)}
                                        />
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 border border-gray-100 dark:border-gray-700 shadow-sm text-center">
                            <div className="w-16 h-16 bg-gray-50 dark:bg-gray-900/50 rounded-full flex items-center justify-center mb-2"><HiOutlineSpeakerphone className="text-3xl text-gray-300 dark:text-gray-600" /></div>
                            <span className="font-bold text-lg text-gray-700 dark:text-gray-300">هیچ کمپینی یافت نشد</span>
                            <span className="text-sm text-gray-500">برای ارسال پیام انبوه، یک کمپین جدید ایجاد کنید.</span>
                        </div>
                    )}
                </div>

                {/* --- بخش صفحه‌بندی --- */}
                {totalItems > 0 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 gap-4">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            نمایش <span className="font-bold text-gray-900 dark:text-gray-100">{((pageIndex - 1) * pageSize) + 1}</span> تا <span className="font-bold text-gray-900 dark:text-gray-100">{Math.min(pageIndex * pageSize, totalItems)}</span> از <span className="font-bold text-gray-900 dark:text-gray-100">{totalItems}</span> کمپین
                        </span>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPageIndex(p => Math.max(1, p - 1))}
                                disabled={pageIndex === 1 || isLoading}
                                className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors bg-white dark:bg-gray-900"
                            >
                                <HiOutlineChevronRight className="text-lg" />
                            </button>

                            <div className="flex items-center gap-1" dir="ltr">
                                {[...Array(totalPages)].map((_, i) => {
                                    const pageNum = i + 1;
                                    if (pageNum === 1 || pageNum === totalPages || (pageNum >= pageIndex - 1 && pageNum <= pageIndex + 1)) {
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => setPageIndex(pageNum)}
                                                disabled={isLoading}
                                                className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-bold transition-colors ${pageIndex === pageNum
                                                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                                                    : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                                                    }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    } else if (pageNum === pageIndex - 2 || pageNum === pageIndex + 2) {
                                        return <span key={pageNum} className="text-gray-400 px-1">...</span>;
                                    }
                                    return null;
                                })}
                            </div>

                            <button
                                onClick={() => setPageIndex(p => Math.min(totalPages, p + 1))}
                                disabled={pageIndex === totalPages || isLoading}
                                className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors bg-white dark:bg-gray-900"
                            >
                                <HiOutlineChevronLeft className="text-lg" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <DeleteConfirmModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                isLoading={isDeleting}
                title="حذف کمپین"
                message={
                    <>
                        آیا از حذف این کمپین اطمینان دارید؟<br />
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