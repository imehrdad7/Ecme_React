import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Table from '@/components/ui/Table'
import Dialog from '@/components/ui/Dialog'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { FaTelegramPlane, FaInstagram, FaWhatsapp, FaGlobe, FaCommentDots, FaRobot, FaPowerOff } from 'react-icons/fa'
import { HiOutlineSearch, HiPlus, HiOutlinePencil, HiOutlineTrash, HiExclamation, HiOutlineUserGroup } from 'react-icons/hi'
import { apiGetBots, apiDeleteBot, apiActivateBot, apiDeactivateBot, BotResponse } from '@/services/botservice'
import { SuperAdmin, ADMIN } from '@/constants/roles.constant'
import { useBotSocket } from '@/utils/hooks/useBotSocket';
import { useSessionUser, getToken } from '@/store/authStore';

const { Tr, Th, Td, THead, TBody } = Table
const BaleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1000 999.72"
        width="1em"
        height="1em"
        preserveAspectRatio="xMidYMid meet"
        {...props}
    >
        <defs>
            <linearGradient id="bale-gradient" x1="800.4" y1="93.39" x2="93.57" y2="800.23" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#46ce9e" />
                <stop offset="1" stopColor="#2a8365" />
            </linearGradient>
        </defs>
        <g id="File">
            <g>
                <path d="M1010.36,547.36c-.73,17.77-2.6,36-6.85,53.41-1.54,16.48-6.36,32.54-10.76,48.52-5.14,19.5-12.48,38.33-19.9,57.17-6.77,15.66-14.35,30.91-22.26,46.08C942.92,766,934.93,779.2,926.29,792q-14.32,21-30.5,40.45c-11.18,13.13-22.68,26.09-35.15,37.92a503.68,503.68,0,0,1-51.3,43.55,453.44,453.44,0,0,1-48.44,31.56C742.06,956.74,722.16,966,702,974.6a548,548,0,0,1-65.89,21.86c-19.49,4.32-39,9.21-58.88,10.76-37,5.71-74.86,5.79-112.13,2.2-33.6-2.61-66.87-9.78-99.25-19.32l-.08-.58C210.19,944.18,82.32,816.07,34.94,661.2c-10.36-33.35-17.62-67.93-20.31-102.83-3.83-33.85-2-68-2.2-102q-.37-40.74-.08-81.64-.26-41.83,0-83.83c-.17-24-.08-47.95-.08-71.93s-.17-48.19.16-72.25c-.33-23.82-.08-47.63-.16-71.44-1.64-17.94,4.24-36.7,17.86-48.85C44.48,13.44,65.68,8.55,84,14.91c11.09,3.75,20.71,10.6,30.58,16.72,36,23.4,70.54,48.85,104.71,74.78a86.74,86.74,0,0,0,10.68-6.77A426.86,426.86,0,0,1,272.58,73.3a483.59,483.59,0,0,1,45.75-22.1c16.39-6.85,33.19-12.8,50.15-18.1,18.1-5,36.29-10.11,55-12.72a392.65,392.65,0,0,1,61.82-7.26,451.46,451.46,0,0,1,76.41,1.71A413.36,413.36,0,0,1,619,24c128.53,27,244.08,108.3,314.46,219a493,493,0,0,1,66.47,159.76c4.73,20.95,8.48,42.32,9.7,63.77A411.89,411.89,0,0,1,1010.36,547.36Z" transform="translate(-12 -12.14)" fill="url(#bale-gradient)" />
                <path d="M705.69,273.2a107.59,107.59,0,0,1,62.37,1.3c25.62,9.82,46.29,29.94,57.5,54.9,8.34,22.86,9.31,48.42.91,71.44-6.06,16.2-16.76,30.09-29.4,41.74q-16.7,16.49-33.21,33.14c-11.79,11.79-23.64,23.5-35.33,35.35-11.3,11.28-22.62,22.49-33.85,33.81-12.32,12.34-24.68,24.61-36.95,37-14,14-28.06,27.94-42,42-13.24,13.29-26.55,26.49-39.8,39.78s-26.77,26.71-40.1,40.11c-12.27,11.85-23.51,24.94-37.35,35.06a106.69,106.69,0,0,1-57.95,16C417,753.28,393.79,744,376.87,727.33q-78.53-78.44-157-156.94c-12.82-12.66-21.38-29.07-26-46.38-4.75-23.86-1.94-49.51,10.31-70.75,9.37-16.54,23.79-29.65,40.19-39a107.52,107.52,0,0,1,57.86-9.73c21.38,3.21,42,13,56.91,28.76Q401.7,476,444.37,518.5c8.63-8.18,16.9-16.73,25.19-25.27q18-17.31,35.24-35.35c11.36-10.68,22.33-21.82,33.07-33.12,7.74-6.88,14.75-14.51,22.07-21.8,12-11.68,23.75-23.59,35.49-35.51,11.21-10.83,22.11-21.95,33.07-33,11.79-11.5,23.28-23.28,35-34.87a105.75,105.75,0,0,1,42.21-26.37Z" transform="translate(-12 -12.14)" fill="#fff" />
            </g>
        </g>
    </svg>
)

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


    const navigate = useNavigate()
    const [searchText, setSearchText] = useState('')

    const [bots, setBots] = useState<BotResponse[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(true)

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [selectedBot, setSelectedBot] = useState<BotResponse | null>(null)
    const [togglingId, setTogglingId] = useState<string | null>(null)

    const [resolvedToken, setResolvedToken] = useState<string | null>(null);
    const [qrModalOpen, setQrModalOpen] = useState(false);
    const [currentQrData, setCurrentQrData] = useState<string | null>(null);

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

                // در اینجا مطمئن می‌شویم که سوییچ ربات حتماً خاموش بماند
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


    useEffect(() => {
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
            console.error('Delete error:', error)
            toast.push(
                <Notification title="خطا در حذف" type="danger" duration={5000}>
                    {error?.message || 'مشکلی در حذف ربات پیش آمد.'}
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
                    const data = response.data || response; // بسته به تنظیمات Axios شما

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

    const renderStatusDot = (isActive: boolean) => {
        const dotBg = isActive ? 'bg-emerald-500' : 'bg-red-500'
        const label = isActive ? 'فعال' : 'غیرفعال'

        return (
            <span className="relative flex h-2.5 w-2.5 flex-shrink-0 mt-0.5" title={`وضعیت: ${label}`}>
                {isActive && (
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${dotBg} opacity-75`}></span>
                )}
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${dotBg}`}></span>
            </span>
        )
    }

    // تشخیص آیکون و رنگ بر اساس platformName که سرور می‌فرستد
    const getPlatformDetails = (platformName: string) => {
        const name = platformName || '';
        switch (name) {
            case 'Telegram': return { icon: FaTelegramPlane, color: 'text-sky-500', bg: 'bg-sky-100 dark:bg-sky-900/40', label: 'تلگرام' }
            case 'Instagram': return { icon: FaInstagram, color: 'text-pink-600', bg: 'bg-pink-100 dark:bg-pink-900/40', label: 'اینستاگرام' }
            case 'WhatsApp': return { icon: FaWhatsapp, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/40', label: 'واتس‌اپ' }
            case 'Web': return { icon: FaGlobe, color: 'text-indigo-500', bg: 'bg-indigo-100 dark:bg-indigo-900/40', label: 'ویجت سایت' }
            case 'Rubika': return { icon: FaCommentDots, color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/40', label: 'روبیکا' }
            case 'Bale': return { icon: BaleIcon, color: 'text-teal-500', bg: 'bg-teal-100 dark:bg-teal-900/40', label: 'بله' }
            default: return { icon: FaRobot, color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-800/40', label: name || 'نامشخص' }
        }
    }

    return (
        <div className="flex flex-col gap-4 h-full">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
                <div>
                    <h3 className="mb-1 text-2xl font-bold text-gray-800 dark:text-gray-100">لیست ربات‌ها</h3>
                    <p className="text-gray-500 text-sm">مدیریت و پیکربندی ربات‌های متصل به سیستم</p>
                </div>
                {canCreateBot && (
                    <Button
                        variant="solid"
                        icon={<HiPlus className="text-lg" />}
                        className="w-full md:w-auto"
                        onClick={() => navigate('/concepts/bots/bot-create')}
                    >
                        ایجاد ربات جدید
                    </Button>
                )}
            </div>

            <Card className="flex-1">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <Input
                        type="text"
                        placeholder="جستجوی نام ربات..."
                        className="max-w-md"
                        prefix={<HiOutlineSearch className="text-lg" />}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                </div>

                <div className="overflow-x-auto">
                    <Table>
                        <THead>
                            <Tr>
                                <Th>ربات / پلتفرم</Th>
                                <Th className="hidden md:table-cell">کاربران فعال</Th>
                                <Th className="hidden md:table-cell">تاریخ ایجاد</Th>
                                <Th>عملیات</Th>
                            </Tr>
                        </THead>
                        <TBody>
                            {isLoading ? (
                                <Tr>
                                    <Td colSpan={4} className="text-center py-12">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                            <span className="text-gray-500">در حال بارگذاری اطلاعات...</span>
                                        </div>
                                    </Td>
                                </Tr>
                            ) : filteredBots.length > 0 ? (
                                filteredBots.map((bot) => {
                                    const platformNameStr = (bot as any).platformName;
                                    const platform = getPlatformDetails(platformNameStr);
                                    const PlatformIcon = platform.icon;

                                    const subscribersCount = (bot as any).totalSubscribers || 0;

                                    return (
                                        <Tr key={bot.id}>
                                            <Td>
                                                <div className="flex items-center gap-3 md:gap-4">
                                                    <div className={`w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${platform.bg}`}>
                                                        <PlatformIcon className={`text-xl md:text-2xl ${platform.color}`} />
                                                    </div>
                                                    <div className="flex flex-col gap-1">

                                                        <div className="flex items-center gap-2">
                                                            {renderStatusDot(bot.isActive)}
                                                            <span className="font-bold text-gray-800 dark:text-gray-100 text-sm">
                                                                {bot.name}
                                                            </span>
                                                        </div>

                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs text-gray-500">{platform.label}</span>

                                                            <div className="md:hidden flex items-center gap-1 text-[10px] font-medium text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-1.5 py-0.5 rounded-md">
                                                                <HiOutlineUserGroup className="text-xs" />
                                                                <span>{subscribersCount.toLocaleString()}</span>
                                                            </div>
                                                        </div>

                                                    </div>
                                                </div>
                                            </Td>

                                            <Td className="hidden md:table-cell font-medium text-gray-700">
                                                {subscribersCount.toLocaleString()}
                                            </Td>

                                            {/* 🌟 تبدیل تاریخ میلادی سرور به شمسی */}
                                            <Td className="hidden md:table-cell text-gray-500 text-sm">
                                                <span dir="rtl">{formatPersianDate(bot.createdAt)}</span>
                                            </Td>

                                            <Td>
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        className={`${bot.isActive ? 'text-orange-500 hover:text-orange-600' : 'text-emerald-500 hover:text-emerald-600'} transition-colors disabled:opacity-50 flex items-center justify-center`}
                                                        onClick={() => handleToggleBotStatus(bot)}
                                                        disabled={togglingId === bot.id}
                                                        title={bot.isActive ? 'غیرفعال کردن ربات' : 'فعال‌سازی ربات'}
                                                    >
                                                        {togglingId === bot.id ? (
                                                            <div className={`w-5 h-5 border-2 ${bot.isActive ? 'border-orange-500' : 'border-emerald-500'} border-t-transparent rounded-full animate-spin`}></div>
                                                        ) : (
                                                            <FaPowerOff className="text-xl" />
                                                        )}
                                                    </button>
                                                    <button
                                                        className="text-gray-500 hover:text-indigo-600 transition-colors"
                                                        onClick={() => navigate(`/concepts/bots/bot-edit/${bot.id}`)}
                                                        title="ویرایش ربات"
                                                    >
                                                        <HiOutlinePencil className="text-xl" />
                                                    </button>
                                                    <button
                                                        className="text-gray-500 hover:text-red-600 transition-colors"
                                                        onClick={() => openDeleteDialog(bot)}
                                                        title="حذف ربات"
                                                    >
                                                        <HiOutlineTrash className="text-xl" />
                                                    </button>
                                                </div>
                                            </Td>
                                        </Tr>
                                    )
                                })
                            ) : (
                                <Tr>
                                    <Td colSpan={4} className="text-center py-8 text-gray-500">
                                        هیچ رباتی یافت نشد.
                                    </Td>
                                </Tr>
                            )}
                        </TBody>
                    </Table>
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