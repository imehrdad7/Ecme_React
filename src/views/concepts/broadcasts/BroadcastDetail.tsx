import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Table from '@/components/ui/Table'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { HiOutlineArrowRight, HiOutlineRefresh, HiOutlinePhotograph, HiOutlineExternalLink, HiCheckCircle, HiXCircle } from 'react-icons/hi'
import { BsBroadcast } from 'react-icons/bs'
import { PiRobot } from 'react-icons/pi'
import { FaTelegramPlane, FaInstagram, FaWhatsapp, FaGlobe, FaCommentDots } from 'react-icons/fa'

import { apiGetBroadcastById, apiRetryBroadcast } from '@/services/broadcastService'
import { apiGetBots, BotResponse } from '@/services/botservice'
import { BroadcastDetailDto, BroadcastStatus } from './types'

const { Tr, Th, Td, THead, TBody } = Table

// آیکون اختصاصی بله
const BaleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 999.72" width="1em" height="1em" preserveAspectRatio="xMidYMid meet" {...props}>
        <defs>
            <linearGradient id="bale-gradient-detail" x1="800.4" y1="93.39" x2="93.57" y2="800.23" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#46ce9e" />
                <stop offset="1" stopColor="#2a8365" />
            </linearGradient>
        </defs>
        <path d="M1010.36,547.36c-.73,17.77-2.6,36-6.85,53.41-1.54,16.48-6.36,32.54-10.76,48.52-5.14,19.5-12.48,38.33-19.9,57.17-6.77,15.66-14.35,30.91-22.26,46.08C942.92,766,934.93,779.2,926.29,792q-14.32,21-30.5,40.45c-11.18,13.13-22.68,26.09-35.15,37.92a503.68,503.68,0,0,1-51.3,43.55,453.44,453.44,0,0,1-48.44,31.56C742.06,956.74,722.16,966,702,974.6a548,548,0,0,1-65.89,21.86c-19.49,4.32-39,9.21-58.88,10.76-37,5.71-74.86,5.79-112.13,2.2-33.6-2.61-66.87-9.78-99.25-19.32l-.08-.58C210.19,944.18,82.32,816.07,34.94,661.2c-10.36-33.35-17.62-67.93-20.31-102.83-3.83-33.85-2-68-2.2-102q-.37-40.74-.08-81.64-.26-41.83,0-83.83c-.17-24-.08-47.95-.08-71.93s-.17-48.19.16-72.25c-.33-23.82-.08-47.63-.16-71.44-1.64-17.94,4.24-36.7,17.86-48.85C44.48,13.44,65.68,8.55,84,14.91c11.09,3.75,20.71,10.6,30.58,16.72,36,23.4,70.54,48.85,104.71,74.78a86.74,86.74,0,0,0,10.68-6.77A426.86,426.86,0,0,1,272.58,73.3a483.59,483.59,0,0,1,45.75-22.1c16.39-6.85,33.19-12.8,50.15-18.1,18.1-5,36.29-10.11,55-12.72a392.65,392.65,0,0,1,61.82-7.26,451.46,451.46,0,0,1,76.41,1.71A413.36,413.36,0,0,1,619,24c128.53,27,244.08,108.3,314.46,219a493,493,0,0,1,66.47,159.76c4.73,20.95,8.48,42.32,9.7,63.77A411.89,411.89,0,0,1,1010.36,547.36Z" transform="translate(-12 -12.14)" fill="url(#bale-gradient-detail)" />
        <path d="M705.69,273.2a107.59,107.59,0,0,1,62.37,1.3c25.62,9.82,46.29,29.94,57.5,54.9,8.34,22.86,9.31,48.42.91,71.44-6.06,16.2-16.76,30.09-29.4,41.74q-16.7,16.49-33.21,33.14c-11.79,11.79-23.64,23.5-35.33,35.35-11.3,11.28-22.62,22.49-33.85,33.81-12.32,12.34-24.68,24.61-36.95,37-14,14-28.06,27.94-42,42-13.24,13.29-26.55,26.49-39.8,39.78s-26.77,26.71-40.1,40.11c-12.27,11.85-23.51,24.94-37.35,35.06a106.69,106.69,0,0,1-57.95,16C417,753.28,393.79,744,376.87,727.33q-78.53-78.44-157-156.94c-12.82-12.66-21.38-29.07-26-46.38-4.75-23.86-1.94-49.51,10.31-70.75,9.37-16.54,23.79-29.65,40.19-39a107.52,107.52,0,0,1,57.86-9.73c21.38,3.21,42,13,56.91,28.76Q401.7,476,444.37,518.5c8.63-8.18,16.9-16.73,25.19-25.27q18-17.31,35.24-35.35c11.36-10.68,22.33-21.82,33.07-33.12,7.74-6.88,14.75-14.51,22.07-21.8,12-11.68,23.75-23.59,35.49-35.51,11.21-10.83,22.11-21.95,33.07-33,11.79-11.5,23.28-23.28,35-34.87a105.75,105.75,0,0,1,42.21-26.37Z" transform="translate(-12 -12.14)" fill="#fff" />
    </svg>
)

const formatPersianDate = (dateString: string) => {
    if (!dateString) return '-';
    try {
        return new Intl.DateTimeFormat('fa-IR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(dateString));
    } catch {
        return dateString;
    }
}

const getStatusDetails = (status: BroadcastStatus) => {
    switch (status) {
        case BroadcastStatus.Completed: return { color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-500/20', label: 'ارسال موفق' }
        case BroadcastStatus.Pending: return { color: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-500/20', label: 'در صف انتظار' }
        case BroadcastStatus.Processing: return { color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-500/20', label: 'در حال ارسال...' }
        case BroadcastStatus.Failed: return { color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-500/20', label: 'خطا در ارسال' }
        case BroadcastStatus.Partial: return { color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-500/20', label: 'ارسال ناقص' }
        default: return { color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-800', label: 'نامشخص' }
    }
}

const getPlatformDetails = (platformName: string) => {
    const name = platformName || '';
    switch (name) {
        case 'Telegram': return { icon: FaTelegramPlane, color: 'text-sky-500', bg: 'bg-sky-100 dark:bg-sky-900/40' }
        case 'Instagram': return { icon: FaInstagram, color: 'text-pink-600', bg: 'bg-pink-100 dark:bg-pink-900/40' }
        case 'WhatsApp': return { icon: FaWhatsapp, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/40' }
        case 'Web': return { icon: FaGlobe, color: 'text-indigo-500', bg: 'bg-indigo-100 dark:bg-indigo-900/40' }
        case 'Rubika': return { icon: FaCommentDots, color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/40' }
        case 'Bale': return { icon: BaleIcon, color: 'text-teal-500', bg: 'bg-teal-100 dark:bg-teal-900/40' }
        default: return { icon: PiRobot, color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-800/40' }
    }
}

const BroadcastDetail = () => {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()

    const [broadcast, setBroadcast] = useState<BroadcastDetailDto | null>(null)
    const [botsMap, setBotsMap] = useState<Record<string, BotResponse>>({})
    const [isLoading, setIsLoading] = useState(true)
    const [isRetrying, setIsRetrying] = useState(false)

    const fetchData = async () => {
        if (!id) return;
        setIsLoading(true);
        try {
            // دریافت همزمان اطلاعات پیام و لیست ربات‌ها برای Map کردن داده‌ها
            const [broadcastRes, botsRes] = await Promise.all([
                apiGetBroadcastById(id),
                apiGetBots()
            ]);

            const broadcastData = (broadcastRes as any).data || broadcastRes;
            setBroadcast(broadcastData);

            // ساخت یک دیکشنری از ربات‌ها برای دسترسی سریع به نام و پلتفرم
            const fetchedBots: BotResponse[] = (botsRes as any).items || (botsRes as any).data?.items || [];
            const botDict: Record<string, BotResponse> = {};
            fetchedBots.forEach(b => {
                botDict[b.id] = b;
            });
            setBotsMap(botDict);

        } catch (error: any) {
            toast.push(
                <Notification title="خطا" type="danger">دریافت اطلاعات با شکست مواجه شد.</Notification>,
                { placement: 'top-center' }
            );
            navigate('/concepts/BroadcastList');
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
    }, [id]);

    const handleRetry = async () => {
        if (!id) return;
        setIsRetrying(true);
        try {
            await apiRetryBroadcast(id);
            toast.push(
                <Notification title="درخواست ثبت شد" type="success" duration={3000}>
                    تلاش مجدد در صف پردازش قرار گرفت.
                </Notification>,
                { placement: 'top-center' }
            );
            fetchData(); // بارگذاری مجدد برای آپدیت وضعیت به Pending
        } catch (error: any) {
            toast.push(
                <Notification title="خطا" type="danger" duration={5000}>
                    {error?.response?.data?.Message || 'مشکلی پیش آمد.'}
                </Notification>,
                { placement: 'top-center' }
            );
        } finally {
            setIsRetrying(false);
        }
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-500 font-medium">در حال بارگذاری جزئیات پیام...</p>
            </div>
        )
    }

    if (!broadcast) return <></>;

    const overallStatus = getStatusDetails(broadcast.status);
    const canRetry = broadcast.status === BroadcastStatus.Failed || broadcast.status === BroadcastStatus.Partial;

    return (
        <div className="flex flex-col gap-4 md:gap-6 relative pb-8 md:pb-10 w-full h-full">
            
            {/* Header Sticky */}
            <div className="sticky top-[55px] md:top-[70px] z-30 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md shadow-sm border border-gray-100 dark:border-gray-700 rounded-xl md:rounded-2xl p-3 md:p-4 flex flex-row items-center justify-between transition-all mt-2">
                <div className="flex items-center gap-2 md:gap-4">
                    <Button
                        shape="circle"
                        variant="plain"
                        className="text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 w-8 h-8 md:w-10 md:h-10 min-w-[32px]"
                        icon={<HiOutlineArrowRight className="text-lg md:text-xl" />}
                        onClick={() => navigate('/concepts/BroadcastList')}
                    />
                    <div>
                        <div className="flex items-center gap-2 md:gap-3">
                            <h3 className="text-sm md:text-xl font-extrabold text-gray-800 dark:text-gray-100 line-clamp-1">
                                {broadcast.title}
                            </h3>
                            <span className={`px-2 py-0.5 md:px-2.5 md:py-1 rounded-md text-[10px] md:text-xs font-bold whitespace-nowrap ${overallStatus.bg} ${overallStatus.color}`}>
                                {overallStatus.label}
                            </span>
                        </div>
                        <p className="text-gray-500 text-[10px] md:text-sm mt-0.5">
                            ثبت شده در: <span dir="rtl">{formatPersianDate(broadcast.createdAt)}</span>
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        size="sm"
                        variant="default"
                        className="bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 text-xs md:text-sm"
                        onClick={fetchData}
                        icon={<HiOutlineRefresh className={isLoading ? 'animate-spin' : ''} />}
                    >
                        <span className="hidden sm:inline">به‌روزرسانی</span>
                    </Button>
                    {canRetry && (
                        <Button
                            size="sm"
                            loading={isRetrying}
                            variant="solid"
                            onClick={handleRetry}
                            className="bg-orange-500 hover:bg-orange-600 text-white border-0 text-xs md:text-sm"
                        >
                            <span className="hidden sm:inline">تلاش مجدد خطادارها</span>
                            <span className="inline sm:hidden">تلاش مجدد</span>
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                
                {/* 📝 Message Content Card */}
                <Card className="lg:col-span-1 shadow-sm border border-gray-100 dark:border-gray-700 rounded-2xl flex flex-col h-fit">
                    <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-4 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 flex items-center justify-center">
                            <BsBroadcast className="text-xl" />
                        </div>
                        <h4 className="text-base font-bold text-gray-800 dark:text-gray-200">
                            محتوای پیام
                        </h4>
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                                {broadcast.content}
                            </p>
                        </div>

                        {broadcast.mediaUrl && (
                            <div className="flex items-center justify-between p-3 rounded-xl border border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-500/10">
                                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                                    <HiOutlinePhotograph className="text-lg" />
                                    <span className="text-sm font-semibold">پیوست رسانه</span>
                                </div>
                                <a 
                                    href={broadcast.mediaUrl} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                                >
                                    مشاهده فایل
                                    <HiOutlineExternalLink />
                                </a>
                            </div>
                        )}
                    </div>
                </Card>

                {/* 🎯 Destinations Card */}
                <Card className="lg:col-span-2 shadow-sm border border-gray-100 dark:border-gray-700 rounded-2xl flex flex-col">
                    <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-4 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 flex items-center justify-center">
                            <PiRobot className="text-xl" />
                        </div>
                        <h4 className="text-base font-bold text-gray-800 dark:text-gray-200">
                            وضعیت ارسال به ربات‌ها
                        </h4>
                    </div>

                    {/* 🖥️ Desktop Table */}
                    <div className="hidden sm:block overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-800">
                        <table className="w-full text-right">
                            <thead className="bg-gray-50 dark:bg-gray-800/80">
                                <tr>
                                    <th className="py-3 px-4 text-xs font-bold text-gray-500 border-b dark:border-gray-700">ربات / پلتفرم</th>
                                    <th className="py-3 px-4 text-xs font-bold text-gray-500 border-b dark:border-gray-700 text-center">وضعیت</th>
                                    <th className="py-3 px-4 text-xs font-bold text-gray-500 border-b dark:border-gray-700">شناسه سیستم/خطا</th>
                                </tr>
                            </thead>
                            <tbody>
                                {broadcast.destinations.map((dest, index) => {
                                    const bot = botsMap[dest.botId];
                                    const platformNameStr = (bot as any)?.platformName || '';
                                    const platform = getPlatformDetails(platformNameStr);
                                    const PlatformIcon = platform.icon;

                                    return (
                                        <tr key={index} className="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${platform.bg}`}>
                                                        <PlatformIcon className={`text-lg ${platform.color}`} />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                                                            {bot ? bot.name : 'ربات حذف شده'}
                                                        </span>
                                                        <span className="text-[11px] text-gray-500">{platformNameStr || dest.botId}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                {dest.isSent ? (
                                                    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 text-xs font-bold">
                                                        <HiCheckCircle className="text-base" /> موفق
                                                    </div>
                                                ) : broadcast.status === BroadcastStatus.Pending || broadcast.status === BroadcastStatus.Processing ? (
                                                    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 text-xs font-bold">
                                                        <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div> در انتظار
                                                    </div>
                                                ) : (
                                                    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 text-xs font-bold">
                                                        <HiXCircle className="text-base" /> ناموفق
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-3 px-4">
                                                {dest.isSent ? (
                                                    <span className="text-xs font-mono text-gray-500">{dest.platformPostId || '-'}</span>
                                                ) : dest.errorMessage ? (
                                                    <span className="text-xs text-red-500 line-clamp-2 max-w-xs" title={dest.errorMessage}>{dest.errorMessage}</span>
                                                ) : (
                                                    <span className="text-xs text-gray-400">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* 📱 Mobile List */}
                    <div className="sm:hidden flex flex-col gap-3">
                        {broadcast.destinations.map((dest, index) => {
                            const bot = botsMap[dest.botId];
                            const platformNameStr = (bot as any)?.platformName || '';
                            const platform = getPlatformDetails(platformNameStr);
                            const PlatformIcon = platform.icon;

                            return (
                                <div key={index} className="flex flex-col gap-2 p-3 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${platform.bg}`}>
                                                <PlatformIcon className={`text-lg ${platform.color}`} />
                                            </div>
                                            <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                                                {bot ? bot.name : 'ربات حذف شده'}
                                            </span>
                                        </div>
                                        {dest.isSent ? (
                                            <HiCheckCircle className="text-emerald-500 text-xl" />
                                        ) : broadcast.status === BroadcastStatus.Pending || broadcast.status === BroadcastStatus.Processing ? (
                                            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            <HiXCircle className="text-red-500 text-xl" />
                                        )}
                                    </div>
                                    
                                    {(dest.errorMessage || dest.platformPostId) && (
                                        <div className={`text-[11px] p-2 rounded-lg mt-1 ${dest.isSent ? 'bg-gray-100 dark:bg-gray-800 text-gray-500 font-mono' : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'}`}>
                                            {dest.isSent ? `ID: ${dest.platformPostId}` : dest.errorMessage}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </Card>
            </div>
        </div>
    )
}

export default BroadcastDetail