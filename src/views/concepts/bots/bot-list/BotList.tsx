import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Table from '@/components/ui/Table'
import Dialog from '@/components/ui/Dialog'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { FaTelegramPlane, FaInstagram, FaWhatsapp, FaGlobe, FaCommentDots, FaCommentAlt, FaRobot } from 'react-icons/fa' 
import { HiOutlineSearch, HiPlus, HiOutlinePencil, HiOutlineTrash, HiExclamation, HiOutlineUserGroup, HiOutlineLightningBolt } from 'react-icons/hi'
import { apiGetBots, apiDeleteBot, apiActivateBot, BotResponse } from '@/services/botservice'

const { Tr, Th, Td, THead, TBody } = Table

// تبدیل تاریخ میلادی به شمسی خوانا
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
    const navigate = useNavigate()
    const [searchText, setSearchText] = useState('')
    
    const [bots, setBots] = useState<BotResponse[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(true)

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [selectedBot, setSelectedBot] = useState<BotResponse | null>(null)
    const [activatingId, setActivatingId] = useState<string | null>(null)

    useEffect(() => {
        const fetchBots = async () => {
            setIsLoading(true)
            try {
                const result: any = await apiGetBots()
                
                // 🌟 استخراج آرایه ربات‌ها از داخل ویژگی items که بک‌اند برمی‌گرداند
                // axios معمولاً دیتا را در result.data قرار می‌دهد، پس هر دو حالت را چک می‌کنیم
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

    // فیلتر کردن لیست (استفاده از platformName)
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

    const handleActivateBot = async (bot: BotResponse) => {
        setActivatingId(bot.id);
        try {
            debugger
            await apiActivateBot(bot.id);
            
            setBots(prevBots => prevBots.map(b => b.id === bot.id ? { ...b, isActive: true } : b));
            
            toast.push(
                <Notification title="اتصال موفق" type="success" duration={3000}>
                    ربات "{bot.name}" با موفقیت فعال و متصل شد.
                </Notification>,
                { placement: 'top-center' }
            );
        } catch (error: any) {
            toast.push(
                <Notification title="خطا در اتصال" type="danger" duration={5000}>
                    {error?.response?.data?.Message || error?.Message || 'مشکلی در فعال‌سازی ربات پیش آمد.'}
                </Notification>,
                { placement: 'top-center' }
            );
        } finally {
            setActivatingId(null);
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
            case 'Bale': return { icon: FaCommentAlt, color: 'text-teal-500', bg: 'bg-teal-100 dark:bg-teal-900/40', label: 'بله' }
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
                <Button 
                    variant="solid" 
                    icon={<HiPlus className="text-lg" />} 
                    className="w-full md:w-auto"
                    onClick={() => navigate('/concepts/bots/bot-create')}
                >
                    ایجاد ربات جدید
                </Button>
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
                                    // استفاده از platformName به جای عدد platform
                                    const platformNameStr = (bot as any).platformName;
                                    const platform = getPlatformDetails(platformNameStr);
                                    const PlatformIcon = platform.icon;
                                    
                                    // اگر دیتای کاربران هنوز پیاده نشده 0 در نظر می‌گیریم
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
                                                    {!bot.isActive && (
                                                        <button 
                                                            className="text-gray-500 hover:text-emerald-600 transition-colors disabled:opacity-50 flex items-center justify-center"
                                                            onClick={() => handleActivateBot(bot)}
                                                            disabled={activatingId === bot.id}
                                                            title="اتصال و فعال‌سازی ربات"
                                                        >
                                                            {activatingId === bot.id ? (
                                                                <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                                                            ) : (
                                                                <HiOutlineLightningBolt className="text-xl" />
                                                            )}
                                                        </button>
                                                    )}
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