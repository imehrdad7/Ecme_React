import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Table from '@/components/ui/Table'
import Dialog from '@/components/ui/Dialog'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { FaTelegramPlane, FaInstagram, FaWhatsapp, FaGlobe, FaCommentDots } from 'react-icons/fa'
import { PiRobot } from 'react-icons/pi'
import { HiOutlineSearch, HiPlus, HiOutlinePencil, HiOutlineTrash, HiExclamation, HiOutlineRefresh, HiOutlineX } from 'react-icons/hi'
import { apiGetBots, apiDeleteBot, apiActivateBot, apiDeactivateBot, BotResponse } from '@/services/botservice'
import { SuperAdmin, ADMIN } from '@/constants/roles.constant'
import { useBotSocket } from '@/utils/hooks/useBotSocket';
import { useSessionUser, getToken } from '@/store/authStore';

const { Tr, Th, Td, THead, TBody } = Table
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

const formatPersianDate = (dateString: string) => {
    if (!dateString) return '-';
    try {
        return new Intl.DateTimeFormat('fa-IR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(new Date(dateString));
    } catch {
        return dateString;
    }
}

const BotList = () => {
    const { user } = useSessionUser();
    const userRoles = user?.authority || (user?.role ? [user.role] : []);
    const canCreateBot = [SuperAdmin, ADMIN].some(allowedRole => userRoles.includes(allowedRole));

    const [isSearchOpen, setIsSearchOpen] = useState(false)
    const searchInputRef = useRef<HTMLInputElement>(null)

    const navigate = useNavigate()
    const [searchText, setSearchText] = useState('')

    const [bots, setBots] = useState<BotResponse[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(true)

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [selectedBot, setSelectedBot] = useState<BotResponse | null>(null)
    const [togglingId, setTogglingId] = useState<string | null>(null)

    const [resolvedToken, setResolvedToken] = useState<string | null>(null);

    useEffect(() => {
        const fetchToken = async () => {
            const t = await getToken();
            setResolvedToken(t);
        };
        fetchToken();
    }, []);
    useBotSocket({
        token: resolvedToken,
        onReceiveWhatsAppStatus: async (receivedBotId, status, data) => {
            const rawReceivedId = receivedBotId.split('_').pop() || '';
            const extractedBotId = rawReceivedId.replace(/-/g, '').toLowerCase();

            if (status === 'qr' || status === 'QrScanTimeout' || status === 'disconnected') {
                toast.push(
                    <Notification title="نیاز به اسکن بارکد" type="warning" duration={6000}>
                        برای فعال سازی این ربات، لطفاً به بخش <strong>ویرایش ربات</strong> بروید و بارکد را اسکن کنید.
                    </Notification>,
                    { placement: 'top-center' }
                );

                setBots(prev => prev.map(b => b.id.replace(/-/g, '').toLowerCase() === extractedBotId ? { ...b, isActive: false } : b));
            }

            else if (status === 'connected') {
                toast.push(
                    <Notification title="اتصال برقرار شد" type="success" duration={4000}>
                        ربات واتس‌اپ با موفقیت روشن شد.
                    </Notification>,
                    { placement: 'top-center' }
                );

                setBots(prev => prev.map(b => b.id.replace(/-/g, '').toLowerCase() === extractedBotId ? { ...b, isActive: true } : b));
            }
        }
    });

    const fetchBots = async () => {
        setIsLoading(true)
        try {
            const result: any = await apiGetBots()
            const fetchedItems = result?.items || result?.data?.items || [];
            setBots(fetchedItems)

        } catch (error: any) {
            console.error('Error fetching bots:', error)
            toast.push(
                <Notification title="خطا در دریافت اطلاعات" type="danger" duration={5000}>
                    {error?.message || 'مشکلی در ارتباط با سرور پیش آمد.'}
                </Notification>,
                { placement: 'top-center' }
            )
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchBots()
    }, [])

    const filteredBots = bots.filter(bot =>
        bot.name?.toLowerCase().includes(searchText.toLowerCase()) ||
        (bot as any).platformName?.toLowerCase().includes(searchText.toLowerCase())
    )

    const openDeleteDialog = (bot: BotResponse) => {
        setSelectedBot(bot)
        setIsDeleteDialogOpen(true)
    }

    const closeDeleteDialog = () => {
        setIsDeleteDialogOpen(false)
        setSelectedBot(null)
    }

    const handleDeleteConfirm = async () => {
        if (!selectedBot) return

        setIsDeleting(true)

        try {
            await apiDeleteBot(selectedBot.id)

            setBots(bots.filter(b => b.id !== selectedBot.id))

            toast.push(
                <Notification title="حذف موفقیت‌آمیز" type="success" duration={3000}>
                    ربات "{selectedBot.name}" با موفقیت از سیستم حذف شد.
                </Notification>,
                { placement: 'top-center' }
            )

            closeDeleteDialog()
        } catch (error: any) {
            debugger
            console.error('Delete error:', error)
            toast.push(
                <Notification title="خطا در حذف" type="danger" duration={5000}>
                    {error?.message || error?.Message || 'مشکلی در حذف ربات پیش آمد.'}
                </Notification>,
                { placement: 'top-center' }
            )
        } finally {
            setIsDeleting(false)
        }
    }

    const handleToggleBotStatus = async (bot: BotResponse) => {
        if (togglingId) return;

        setTogglingId(bot.id);
        try {
            if (bot.isActive) {
                await apiDeactivateBot(bot.id);
                setBots(prevBots => prevBots.map(b => b.id === bot.id ? { ...b, isActive: false } : b));

                toast.push(
                    <Notification title="ربات غیرفعال شد" type="success" duration={3000}>
                        ربات "{bot.name}" با موفقیت متوقف شد.
                    </Notification>,
                    { placement: 'top-center' }
                );
                setTogglingId(null);
            }
            else {
                try {
                    const response: any = await apiActivateBot(bot.id);
                    const data = response.data || response;

                    if (data.qrCodeBase64 === "WAITING_FOR_QR_VIA_WEBHOOK") {

                        toast.push(
                            <Notification title="در حال اتصال به واتس‌اپ" type="info" duration={4000}>
                                در حال بررسی وضعیت نشست... لطفاً چند لحظه منتظر بمانید.
                            </Notification>,
                            { placement: 'top-center' }
                        );
                    } else {
                        setBots(prevBots => prevBots.map(b => b.id === bot.id ? { ...b, isActive: true } : b));
                        toast.push(
                            <Notification title="ربات فعال شد" type="success" duration={3000}>
                                ربات "{bot.name}" با موفقیت فعال شد.
                            </Notification>,
                            { placement: 'top-center' }
                        );
                    }
                } catch (error: any) {
                    toast.push(
                        <Notification title="خطا" type="danger" duration={5000}>
                            {error?.response?.data?.message || 'مشکلی در فعال‌سازی پیش آمد.'}
                        </Notification>,
                        { placement: 'top-center' }
                    );
                } finally {
                    setTogglingId(null);
                }
            }
        } catch (error: any) {
            toast.push(
                <Notification title="خطا در تغییر وضعیت" type="danger" duration={5000}>
                    {error?.response?.data?.Message || error?.Message || 'مشکلی در تغییر وضعیت ربات پیش آمد.'}
                </Notification>,
                { placement: 'top-center' }
            );
            setTogglingId(null);
        }
    }

    const getPlatformDetails = (platformName: string) => {
        const name = platformName || '';
        switch (name) {
            case 'Telegram': return { icon: FaTelegramPlane, color: 'text-sky-500', bg: 'bg-sky-100 dark:bg-sky-900/40', label: 'تلگرام' }
            case 'Instagram': return { icon: FaInstagram, color: 'text-pink-600', bg: 'bg-pink-100 dark:bg-pink-900/40', label: 'اینستاگرام' }
            case 'WhatsApp': return { icon: FaWhatsapp, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/40', label: 'واتس‌اپ' }
            case 'Web': return { icon: FaGlobe, color: 'text-indigo-500', bg: 'bg-indigo-100 dark:bg-indigo-900/40', label: 'ویجت سایت' }
            case 'Rubika': return { icon: FaCommentDots, color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/40', label: 'روبیکا' }
            case 'Bale': return { icon: BaleIcon, color: 'text-teal-500', bg: 'bg-teal-100 dark:bg-teal-900/40', label: 'بله' }
            default: return { icon: PiRobot, color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-800/40', label: name || 'نامشخص' }
        }
    }

    return (
        <div className="flex flex-col gap-4 h-full">
            <Card className="flex-1 shadow-sm border-0 rounded-2xl overflow-hidden">
                {/* ========================================== */}
                {/* 🎯 هدر ریسپانسیو (طراحی App-Like برای موبایل) */}
                {/* ========================================== */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 md:mb-8">
                    <div className="flex items-center justify-center sm:justify-start gap-3 md:gap-4 w-full sm:w-auto text-right">
                        <div className="w-12 h-12 md:w-14 md:h-14 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center rounded-xl flex-shrink-0">
                            <PiRobot className="text-2xl" />
                        </div>
                        <div className="flex flex-col">
                            <h3 className="text-lg md:text-2xl font-extrabold text-gray-800 dark:text-gray-100">
                                دستیارهای هوشمند
                            </h3>
                            <p className="text-[11px] md:text-sm text-gray-500 mt-0.5">
                                مدیریت و اتصال کانال‌های ارتباطی
                            </p>
                        </div>
                    </div>

                    {/* بخش سمت چپ: اکشن‌بار */}
                    {/* در موبایل به صورت ستونی (flex-col) و در دسکتاپ تو یک خط (md:flex-row) */}
                    <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">

                        {/* ردیف اول تو موبایل (سرچ و رفرش) */}
                        <div className="flex items-center justify-end gap-2 w-full md:w-auto">

                            {/* 🔍 کانتینر سرچ‌بار */}
                            <div
                                className={`relative flex items-center transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] h-11 ${isSearchOpen || searchText
                                    ? 'flex-1 md:flex-none md:w-[32rem] bg-white dark:bg-gray-800 rounded-xl border-indigo-500 shadow-indigo-100 dark:shadow-indigo-900/20 shadow-md'
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
                                    placeholder="جستجوی نام ربات..."
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                    onBlur={() => {
                                        if (!searchText) setIsSearchOpen(false);
                                    }}
                                    className={`w-full h-full bg-transparent outline-none pr-12 pl-10 transition-all duration-500 text-gray-800 dark:text-gray-100 text-[15px] md:text-base ${isSearchOpen || searchText ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                                        }`}
                                />

                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSearchText('');
                                        setIsSearchOpen(false);
                                    }}
                                    className={`absolute left-2 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-300 ${isSearchOpen || searchText ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-50 invisible'}`}
                                    title="بستن جستجو"
                                >
                                    <HiOutlineX className="text-base" />
                                </button>
                            </div>

                            {/* 🔄 دکمه رفرش */}
                            <button
                                type="button"
                                onClick={fetchBots}
                                disabled={isLoading}
                                className="flex-shrink-0 w-11 h-11 flex items-center justify-center rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 hover:border-indigo-300 dark:hover:border-indigo-600 shadow-sm transition-all duration-300 active:scale-95 disabled:opacity-50"
                                title="به‌روزرسانی لیست"
                            >
                                <HiOutlineRefresh className={`text-xl ${isLoading ? 'animate-spin text-indigo-500' : ''}`} />
                            </button>
                        </div>

                        {/* ➕ ردیف دوم تو موبایل (دکمه ربات جدید) تمام‌عرض */}
                        {canCreateBot && (
                            <Button
                                variant="solid"
                                icon={<HiPlus className="text-xl" />}
                                // استفاده از w-full برای موبایل و md:w-auto برای دسکتاپ
                                className="w-full md:w-auto h-11 rounded-xl shadow-md shadow-indigo-200 dark:shadow-none hover:translate-y-[-1px] active:scale-[0.98] transition-all text-base font-bold"
                                onClick={() => navigate('/concepts/bots/bot-create')}
                            >
                                ربات جدید
                            </Button>
                        )}
                    </div>
                </div>

                {/* ========================================== */}
                {/* 🖥️ بخش نمایش دسکتاپ (جدول کلاسیک و حرفه‌ای) */}
                {/* ========================================== */}
                <div className="hidden md:block overflow-auto max-h-[calc(100vh-250px)] rounded-xl border border-gray-200 dark:border-gray-800 relative bg-white dark:bg-gray-900 shadow-sm 
    [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-gray-700 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-400 dark:hover:[&::-webkit-scrollbar-thumb]:bg-gray-600 [scrollbar-width:thin]">
                    <table className="w-full text-right border-collapse relative">
                        <thead className="sticky top-0 z-30">
                            <tr className="bg-gray-100 dark:bg-gray-800 shadow-[0_2px_4px_-1px_rgba(0,0,0,0.05)]">
                                <th className="py-3.5 px-4 text-[15px] font-bold text-gray-800 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700">ربات / پلتفرم</th>
                                <th className="text-center py-3.5 px-4 text-[15px] font-bold text-gray-800 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700">تاریخ ایجاد</th>
                                <th className="text-center py-3.5 px-4 text-[15px] font-bold text-gray-800 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 w-48">عملیات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={3} className="text-center py-12">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                            <span className="text-gray-500 font-medium">در حال بارگذاری اطلاعات...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredBots.length > 0 ? (
                                filteredBots.map((bot) => {
                                    const platformNameStr = (bot as any).platformName;
                                    const platform = getPlatformDetails(platformNameStr);
                                    const PlatformIcon = platform.icon;

                                    return (
                                        <tr key={bot.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors group border-b border-gray-100 dark:border-gray-800 last:border-0">
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${bot.isActive ? `${platform.bg} shadow-sm group-hover:scale-105` : 'bg-gray-100 dark:bg-gray-800 grayscale opacity-60'}`}>
                                                        <PlatformIcon className={`text-xl ${bot.isActive ? platform.color : 'text-gray-400 dark:text-gray-500'}`} />
                                                    </div>
                                                    <div className="flex flex-col gap-1.5">
                                                        <span className={`font-bold text-[15px] cursor-pointer transition-colors ${bot.isActive ? 'text-gray-800 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`} onClick={() => navigate(`/concepts/bots/bot-edit/${bot.id}`)}>
                                                            {bot.name}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="text-center text-gray-500 dark:text-gray-400 font-medium text-sm py-3 px-4">
                                                <span dir="rtl">{formatPersianDate(bot.createdAt)}</span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center justify-center gap-3">
                                                    <button type="button" onClick={() => handleToggleBotStatus(bot)} disabled={togglingId === bot.id} className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none disabled:opacity-60 disabled:cursor-wait shadow-inner ${bot.isActive ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'}`} dir="ltr" title={bot.isActive ? 'غیرفعال کردن' : 'فعال‌سازی'}>
                                                        <span className={`pointer-events-none flex h-5 w-5 transform items-center justify-center rounded-full bg-white shadow-md ring-0 transition duration-300 ease-in-out ${bot.isActive ? 'translate-x-5' : 'translate-x-0'}`}>
                                                            {togglingId === bot.id && <div className={`w-3 h-3 border-2 border-t-transparent rounded-full animate-spin ${bot.isActive ? 'border-emerald-500' : 'border-gray-400'}`}></div>}
                                                        </span>
                                                    </button>
                                                    <div className="w-[1px] h-5 bg-gray-200 dark:bg-gray-700"></div>
                                                    <div className="flex items-center gap-1">
                                                        <button className="text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 p-2 rounded-lg transition-all flex items-center justify-center" onClick={() => navigate(`/concepts/bots/bot-edit/${bot.id}`)} title="ویرایش ربات"><HiOutlinePencil className="text-[1.2rem]" /></button>
                                                        <button className="text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 p-2 rounded-lg transition-all flex items-center justify-center" onClick={() => openDeleteDialog(bot)} title="حذف ربات"><HiOutlineTrash className="text-[1.2rem]" /></button>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })
                            ) : (
                                <tr>
                                    <td colSpan={3} className="text-center py-16 text-gray-500">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-2 shadow-inner"><PiRobot className="text-3xl text-gray-300 dark:text-gray-600" /></div>
                                            <span className="font-bold text-lg text-gray-700 dark:text-gray-300">هیچ رباتی یافت نشد</span>
                                            <span className="text-sm">با استفاده از دکمه «ربات جدید» اولین ربات خود را بسازید.</span>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* ========================================== */}
                {/* 📱 بخش نمایش موبایل (کارت‌های اپلیکیشنی مدرن) */}
                {/* ========================================== */}
                <div className="md:hidden flex flex-col gap-4 pb-6">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-3 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-gray-500 font-medium">در حال بارگذاری اطلاعات...</span>
                        </div>
                    ) : filteredBots.length > 0 ? (
                        filteredBots.map((bot) => {
                            const platformNameStr = (bot as any).platformName;
                            const platform = getPlatformDetails(platformNameStr);
                            const PlatformIcon = platform.icon;

                            return (
                                <div
                                    key={bot.id}
                                    className={`bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border ${bot.isActive ? 'border-gray-200 dark:border-gray-700' : 'border-gray-100 dark:border-gray-800 opacity-80'} flex flex-col gap-4 relative overflow-hidden transition-all`}
                                >
                                    <div className={`absolute right-0 top-0 bottom-0 w-1 ${bot.isActive ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>

                                    <div className="flex items-start justify-between pl-1 pr-3">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${bot.isActive ? platform.bg : 'bg-gray-100 dark:bg-gray-800 grayscale'}`}>
                                                <PlatformIcon className={`text-2xl ${bot.isActive ? platform.color : 'text-gray-400 dark:text-gray-500'}`} />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <span
                                                    className={`font-extrabold text-base ${bot.isActive ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
                                                    onClick={() => navigate(`/concepts/bots/bot-edit/${bot.id}`)}
                                                >
                                                    {bot.name}
                                                </span>
                                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400" dir="rtl">
                                                    ایجاد: {formatPersianDate(bot.createdAt)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* کادر خاکستری پایین کارت برای دکمه‌ها (App-like Footer) */}
                                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-3 flex items-center justify-between mt-1 border border-gray-100 dark:border-gray-800">

                                        {/* بخش سوییچ در موبایل */}
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-gray-600 dark:text-gray-400 mr-1">وضعیت:</span>
                                            <button
                                                type="button"
                                                onClick={() => handleToggleBotStatus(bot)}
                                                disabled={togglingId === bot.id}
                                                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none disabled:opacity-60 shadow-inner ${bot.isActive ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                                                dir="ltr"
                                            >
                                                <span className={`pointer-events-none flex h-5 w-5 transform items-center justify-center rounded-full bg-white shadow-md ring-0 transition duration-300 ease-in-out ${bot.isActive ? 'translate-x-5' : 'translate-x-0'}`}>
                                                    {togglingId === bot.id && <div className={`w-3 h-3 border-2 border-t-transparent rounded-full animate-spin ${bot.isActive ? 'border-emerald-500' : 'border-gray-400'}`}></div>}
                                                </span>
                                            </button>
                                        </div>

                                        {/* بخش دکمه‌های ویرایش و حذف */}
                                        <div className="flex items-center gap-2">
                                            <button
                                                className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm active:scale-95 transition-all"
                                                onClick={() => navigate(`/concepts/bots/bot-edit/${bot.id}`)}
                                            >
                                                <HiOutlinePencil className="text-lg" />
                                            </button>
                                            <button
                                                className="flex items-center justify-center w-8 h-8 rounded-lg text-red-500 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm active:scale-95 transition-all"
                                                onClick={() => openDeleteDialog(bot)}
                                            >
                                                <HiOutlineTrash className="text-lg" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    ) : (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 border border-gray-100 dark:border-gray-700 shadow-sm">
                            <div className="w-16 h-16 bg-gray-50 dark:bg-gray-900/50 rounded-full flex items-center justify-center mb-2">
                                <PiRobot className="text-3xl text-gray-300 dark:text-gray-600" />
                            </div>
                            <span className="font-bold text-lg text-gray-700 dark:text-gray-300">هیچ رباتی یافت نشد</span>
                            <span className="text-sm text-center text-gray-500 leading-relaxed">با استفاده از دکمه «ربات جدید» اولین دستیار خود را پیکربندی کنید.</span>
                        </div>
                    )}
                </div>
            </Card>

            <Dialog
                isOpen={isDeleteDialogOpen}
                onClose={closeDeleteDialog}
                closable={!isDeleting}
                contentClassName="pb-0"
            >
                <div className="flex flex-col gap-4 mt-8">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/30 text-red-600 flex items-center justify-center flex-shrink-0">
                            <HiExclamation className="text-2xl" />
                        </div>
                        <div className="flex-1 mt-1">
                            <h5 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">حذف ربات</h5>
                            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                آیا از حذف ربات <span className="font-bold text-gray-800 dark:text-gray-200">"{selectedBot?.name}"</span> مطمئن هستید؟ این عمل غیرقابل بازگشت است.
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6 pt-5 pb-6 border-t border-gray-100 dark:border-gray-800">
                        <Button
                            type="button"
                            variant="default"
                            disabled={isDeleting}
                            onClick={closeDeleteDialog}
                        >
                            انصراف
                        </Button>
                        <Button
                            loading={isDeleting}
                            variant="solid"
                            className="bg-red-600 hover:bg-red-500 text-white border-0"
                            onClick={handleDeleteConfirm}
                        >
                            {isDeleting ? 'در حال حذف...' : 'بله، حذف شود'}
                        </Button>
                    </div>
                </div>
            </Dialog>
        </div>
    )
}

export default BotList