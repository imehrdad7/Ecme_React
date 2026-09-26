import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    HiOutlineClock,
    HiOutlineUserGroup,
    HiOutlineChatAlt,
    HiChevronLeft,
    HiOutlineFilter,
    HiOutlineChartSquareBar,
    HiOutlineViewGrid,
    HiChevronUp,
    HiOutlineUsers,
    HiOutlineOfficeBuilding,
    HiOutlineBadgeCheck,
    HiOutlineCalendar
} from 'react-icons/hi';
import { TbMessageBolt, TbCpu, TbApi, TbBrandTeams } from 'react-icons/tb';
import { FaTelegramPlane, FaInstagram, FaWhatsapp, FaGlobe } from 'react-icons/fa';
import { PiRobot, PiChartPieSliceDuotone } from 'react-icons/pi'
import Card from '@/components/ui/Card';
import TrendChart from './TrendChart';

import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend

} from 'recharts';

import { useDashboardStore } from '@/store/useDashboardStore';
import { useDashboardMetrics, useManagementOverview } from '@/utils/hooks/useDashboardMetrics';
import { useSessionUser } from '@/store/authStore'
import { apiGetBots } from '@/services/BotService';

const BaleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 999.72" width="1em" height="1em" preserveAspectRatio="xMidYMid meet" {...props}>
        <defs>
            <linearGradient id="bale-gradient-dash" x1="800.4" y1="93.39" x2="93.57" y2="800.23" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#46ce9e" />
                <stop offset="1" stopColor="#2a8365" />
            </linearGradient>
        </defs>
        <path d="M1010.36,547.36c-.73,17.77-2.6,36-6.85,53.41-1.54,16.48-6.36,32.54-10.76,48.52-5.14,19.5-12.48,38.33-19.9,57.17-6.77,15.66-14.35,30.91-22.26,46.08C942.92,766,934.93,779.2,926.29,792q-14.32,21-30.5,40.45c-11.18,13.13-22.68,26.09-35.15,37.92a503.68,503.68,0,0,1-51.3,43.55,453.44,453.44,0,0,1-48.44,31.56C742.06,956.74,722.16,966,702,974.6a548,548,0,0,1-65.89,21.86c-19.49,4.32-39,9.21-58.88,10.76-37,5.71-74.86,5.79-112.13,2.2-33.6-2.61-66.87-9.78-99.25-19.32l-.08-.58C210.19,944.18,82.32,816.07,34.94,661.2c-10.36-33.35-17.62-67.93-20.31-102.83-3.83-33.85-2-68-2.2-102q-.37-40.74-.08-81.64-.26-41.83,0-83.83c-.17-24-.08-47.95-.08-71.93s-.17-48.19.16-72.25c-.33-23.82-.08-47.63-.16-71.44-1.64-17.94,4.24-36.7,17.86-48.85C44.48,13.44,65.68,8.55,84,14.91c11.09,3.75,20.71,10.6,30.58,16.72,36,23.4,70.54,48.85,104.71,74.78a86.74,86.74,0,0,0,10.68-6.77A426.86,426.86,0,0,1,272.58,73.3a483.59,483.59,0,0,1,45.75-22.1c16.39-6.85,33.19-12.8,50.15-18.1,18.1-5,36.29-10.11,55-12.72a392.65,392.65,0,0,1,61.82-7.26,451.46,451.46,0,0,1,76.41,1.71A413.36,413.36,0,0,1,619,24c128.53,27,244.08,108.3,314.46,219a493,493,0,0,1,66.47,159.76c4.73,20.95,8.48,42.32,9.7,63.77A411.89,411.89,0,0,1,1010.36,547.36Z" transform="translate(-12 -12.14)" fill="url(#bale-gradient-dash)" />
        <path d="M705.69,273.2a107.59,107.59,0,0,1,62.37,1.3c25.62,9.82,46.29,29.94,57.5,54.9,8.34,22.86,9.31,48.42.91,71.44-6.06,16.2-16.76,30.09-29.4,41.74q-16.7,16.49-33.21,33.14c-11.79,11.79-23.64,23.5-35.33,35.35-11.3,11.28-22.62,22.49-33.85,33.81-12.32,12.34-24.68,24.61-36.95,37-14,14-28.06,27.94-42,42-13.24,13.29-26.55,26.49-39.8,39.78s-26.77,26.71-40.1,40.11c-12.27,11.85-23.51,24.94-37.35,35.06a106.69,106.69,0,0,1-57.95,16C417,753.28,393.79,744,376.87,727.33q-78.53-78.44-157-156.94c-12.82-12.66-21.38-29.07-26-46.38-4.75-23.86-1.94-49.51,10.31-70.75,9.37-16.54,23.79-29.65,40.19-39a107.52,107.52,0,0,1,57.86-9.73c21.38,3.21,42,13,56.91,28.76Q401.7,476,444.37,518.5c8.63-8.18,16.9-16.73,25.19-25.27q18-17.31,35.24-35.35c11.36-10.68,22.33-21.82,33.07-33.12,7.74-6.88,14.75-14.51,22.07-21.8,12-11.68,23.75-23.59,35.49-35.51,11.21-10.83,22.11-21.95,33.07-33,11.79-11.5,23.28-23.28,35-34.87a105.75,105.75,0,0,1,42.21-26.37Z" transform="translate(-12 -12.14)" fill="#fff" />
    </svg>
);

const getPlatformStyling = (platform: number | string) => {
    const platformStr = String(platform).toLowerCase();
    switch (platformStr) {
        case '1':
        case 'whatsapp':
            return { icon: FaWhatsapp, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/30 border-green-100 dark:border-green-800' };
        case '2':
        case 'telegram':
            return { icon: FaTelegramPlane, color: 'text-sky-500', bg: 'bg-sky-50 dark:bg-sky-900/30 border-sky-100 dark:border-sky-800' };
        case '3':
        case 'instagram':
            return { icon: FaInstagram, color: 'text-pink-600', bg: 'bg-pink-50 dark:bg-pink-900/30 border-pink-100 dark:border-pink-800' };
        case '6':
        case 'bale':
            return { icon: BaleIcon, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-100 dark:border-emerald-800' };
        case '4':
        case 'web':
        default:
            return { icon: FaGlobe, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-100 dark:border-indigo-800' };
    }
};

// تابع تشخیص هوشمند پلتفرم و رنگ برای نمودار
const getChartPlatformInfo = (platform: string | number) => {
    // تبدیل به حروف کوچک برای جستجوی راحت‌تر
    const platformStr = String(platform).toLowerCase();

    // استفاده از includes برای پوشش دادن نام‌های فارسی و انگلیسی و جلوگیری از خطای نیم‌فاصله
    if (platformStr === '1' || platformStr.includes('whatsapp') || platformStr.includes('واتس')) {
        return { hexColor: '#22c55e', faName: 'واتس‌اپ', icon: FaWhatsapp };
    }
    if (platformStr === '2' || platformStr.includes('telegram') || platformStr.includes('تلگرام')) {
        return { hexColor: '#0ea5e9', faName: 'تلگرام', icon: FaTelegramPlane };
    }
    if (platformStr === '3' || platformStr.includes('instagram') || platformStr.includes('اینستا')) {
        return { hexColor: '#db2777', faName: 'اینستاگرام', icon: FaInstagram };
    }
    if (platformStr === '6' || platformStr.includes('bale') || platformStr.includes('بله')) {
        // چون پیام‌رسان بله لوگوی رسمی در react-icons ندارد، از یک آیکون پیام‌رسان عمومی استفاده کردیم
        return { hexColor: '#10b981', faName: 'بله', icon: BaleIcon };
    }

    // حالت پیش‌فرض (وب‌سایت یا سایر موارد)
    return { hexColor: '#6366f1', faName: 'سایت (Web)', icon: FaGlobe };
};

const Dashboard = () => {
    const { user } = useSessionUser()
    const navigate = useNavigate();
    const companyId = user.companyId ?? '';


    const ManagementIsland = () => {
        const [isOpen, setIsOpen] = useState(true);

        const { data: overview, isLoading } = useManagementOverview(companyId);
        const formatBytesToMB = (bytes: number) => (bytes / (1024 * 1024)).toFixed(1);
        const usedTokens = overview ? Math.max(0, overview.allocatedAiTokens - overview.remainingAiTokens) : 0;
        const tokenPercentage = overview && overview.allocatedAiTokens > 0
            ? Math.round((usedTokens / overview.allocatedAiTokens) * 100)
            : 0;

        return (
            <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/50 rounded-[2rem] p-6 shadow-sm transition-all duration-300">

                {/* هدر */}
                <div className="flex justify-between items-center cursor-pointer select-none" onClick={() => setIsOpen(!isOpen)}>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-slate-700 to-slate-900 text-white rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-slate-900/20 border border-slate-600/30">
                            <HiOutlineViewGrid className="text-2xl" />
                        </div>
                        <div>
                            <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">منابع و لایسنس‌ها</h1>
                            <p className="text-sm text-slate-500 mt-1">مدیریت مصرف سیستم بر اساس اشتراک</p>
                        </div>
                    </div>
                    <div className="relative flex items-center justify-center">
                        <style>{`
                            @keyframes heartbeat-slate {
                                0%, 100% { transform: scale(1); box-shadow: 0 0 0 rgba(100, 116, 139, 0); }
                                50% { transform: scale(1.15); box-shadow: 0 0 12px rgba(100, 116, 139, 0.4); }
                            }
                            .animate-heartbeat-slate {
                                animation: heartbeat-slate 2s infinite ease-in-out;
                            }
                        `}</style>

                        <div className="w-10 h-10 flex items-center justify-center rounded-full cursor-pointer transition-all duration-300 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 animate-heartbeat-slate">
                            <HiChevronUp className={`text-xl transition-transform duration-500 ${isOpen ? '' : 'rotate-180'}`} />
                        </div>
                    </div>
                </div>

                <div className={`grid transition-all duration-500 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100 mt-6' : 'grid-rows-[0fr] opacity-0 mt-0'}`}>
                    <div className="overflow-hidden">
                        {isLoading || !overview ? (
                            <div className="flex flex-col items-center justify-center py-12 opacity-50">
                                <span className="text-slate-500 text-base font-bold animate-pulse">در حال دریافت...</span>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-[fadeIn_0.2s_ease-out] pb-1">

                                {/* ======================================= */}
                                {/* ردیف اول: 4 کارت با عرض یکسان */}
                                {/* ======================================= */}

                                {/* ربات‌های متصل */}
                                {overview.activeBotsCount > 0 ? (
                                    <Card className="relative overflow-hidden flex flex-col shadow-sm border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900 p-4 xl:p-5 group hover:shadow-md transition-shadow">
                                        <div className="mb-4">
                                            <p className="text-lg font-bold text-gray-500 -mt-3 -mr-3 pb-4">ربات‌های متصل</p>
                                            <div className="absolute top-0 left-0 p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-br-2xl text-indigo-600 shadow-sm border-b border-r border-indigo-100 dark:border-indigo-500/20 transition-transform group-hover:scale-105 origin-top-left">
                                                <PiRobot className="h-10 w-10" />
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="flex items-baseline gap-1">
                                                <h4 className="text-2xl font-black text-gray-900 dark:text-white">
                                                    {overview.activeBotsCount}
                                                </h4>
                                                <span className="text-xs text-gray-400">از {overview.maxBotsLimit}</span>
                                            </div>

                                            {overview.anactiveBotsCount > 0 && (
                                                <div className="flex items-center gap-2 mr-1">
                                                    <span className="text-xl font-black text-amber-500 dark:text-amber-400 drop-shadow-sm">
                                                        +
                                                    </span>

                                                    <span className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-500/10 dark:to-orange-500/10 text-amber-700 dark:text-amber-400 text-xs font-bold rounded-xl border border-amber-200 dark:border-amber-700/50 shadow-sm">
                                                        <span className="text-sm font-black">{overview.anactiveBotsCount}</span>
                                                        <span>بات غیرفعال</span>
                                                    </span>

                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-auto border-t border-gray-100 dark:border-gray-800 pt-3 flex items-center justify-between">
                                            <div className="flex -space-x-1.5 space-x-reverse">
                                                {overview.activePlatforms.map((id, idx) => {
                                                    const platform = getChartPlatformInfo(id);
                                                    const Icon = platform.icon; // فرض می‌کنیم آیکون را از این تابع دریافت می‌کنید

                                                    return (
                                                        <div
                                                            key={idx}
                                                            className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-900 shadow-sm flex items-center justify-center overflow-hidden"
                                                            style={{ backgroundColor: platform.hexColor }}
                                                            title={platform.faName}
                                                        >
                                                            {/* اگر آیکون شما از نوع کامپوننت (مثل react-icons) است: */}
                                                            {Icon && <Icon className="w-3.5 h-3.5 text-white" />}

                                                            {/* 💡 نکته: اگر لوگوهای شما به صورت عکس (png/svg) هستند، 
                خط بالا را پاک کنید و از تگ img زیر استفاده کنید: */}
                                                            {/* <img src={platform.logoUrl} alt={platform.faName} className="w-full h-full object-cover" /> */}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            <button
                                                onClick={() => navigate('/concepts/bots/bot-list')}
                                                className="flex items-center gap-0.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors">
                                                مدیریت ربات‌ها <HiChevronLeft />
                                            </button>
                                        </div>
                                    </Card>

                                ) : overview.anactiveBotsCount > 0 ? (
                                    <Card className="flex flex-col shadow-sm border border-amber-200 dark:border-amber-900/50 rounded-xl bg-amber-50/50 dark:bg-amber-500/5 p-4 xl:p-5 group hover:shadow-md transition-all justify-center items-center text-center relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>

                                        <h2 className="text-sm font-black text-amber-900 dark:text-amber-100 mb-2 z-10">
                                            ربات فعالی ندارید!
                                        </h2>

                                        <p className="text-[11px] text-amber-700/80 dark:text-amber-300 mb-4 z-10">
                                            شما <span className="font-bold text-amber-600 dark:text-amber-400">{overview.anactiveBotsCount} ربات غیرفعال</span> دارید. برای شروع پاسخگویی آن‌ها را فعال کنید یا بات جدیدی بسازید.
                                        </p>

                                        <div className="w-full flex items-center gap-2 z-10">
                                            <button
                                                onClick={() => navigate('/concepts/bots/bot-list')}
                                                className="flex-1 flex items-center justify-center px-2 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-bold rounded-lg transition-colors shadow-sm">
                                                مدیریت و فعال‌سازی
                                            </button>
                                            <button
                                                onClick={() => navigate('/concepts/bots/bot-create')}
                                                className="flex-1 flex items-center justify-center px-2 py-2.5 bg-white dark:bg-gray-800 hover:bg-amber-50 dark:hover:bg-gray-700 text-amber-700 dark:text-amber-400 text-[11px] font-bold rounded-lg border border-amber-200 dark:border-amber-700/50 transition-colors shadow-sm">
                                                بات جدید
                                            </button>
                                        </div>
                                    </Card>

                                ) : (
                                    <Card className="flex flex-col shadow-sm border border-indigo-100 dark:border-indigo-900/50 rounded-xl bg-indigo-50/50 dark:bg-indigo-500/5 p-4 xl:p-5 group hover:shadow-md transition-all justify-center items-center text-center relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>

                                        <h2 className="text-sm font-black text-indigo-900 dark:text-indigo-100 mb-2 z-10">
                                            رباتی در سیستم نیست!
                                        </h2>

                                        <p className="text-[11px] text-indigo-600/80 dark:text-indigo-300 mb-4 z-10">
                                            برای شروع استفاده از امکانات AnyBot، لطفاً همین حالا اولین بات خود را ایجاد کنید.
                                        </p>

                                        <button
                                            onClick={() => navigate('/concepts/bots/bot-create')}
                                            className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm z-10">
                                            ایجاد اولین بات
                                        </button>
                                    </Card>
                                )}

                                {/* سیستم پاسخ خودکار */}
                                {overview.autoRepliesCount > 0 ? (
                                    /* 🟢 حالت اول: کاربر قانون پاسخ خودکار دارد */
                                    <Card className="relative overflow-hidden flex flex-col shadow-sm border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900 p-4 xl:p-5 group hover:shadow-md transition-shadow">
                                        <div className="mb-4">
                                            {/* عنوان به صورت طبیعی سمت راست قرار می‌گیرد */}
                                            <p className="text-lg font-bold text-gray-500 -mt-3 -mr-3 pb-4">پاسخ‌های خودکار</p>

                                            {/* 🌟 آیکون چسبیده به گوشه بالا سمت چپ 🌟 */}
                                            <div className="absolute top-0 left-0 p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-br-2xl text-indigo-600 shadow-sm border-b border-r border-indigo-100 dark:border-indigo-500/20 transition-transform group-hover:scale-105 origin-top-left">
                                                <TbMessageBolt className="h-10 w-10" />
                                            </div>
                                        </div>

                                        <div className="flex items-baseline gap-1 mb-4">
                                            {/* نمایش عدد واقعی از سرور */}
                                            <h4 className="text-2xl font-black text-gray-900 dark:text-white">{overview.autoRepliesCount}</h4>
                                            <span className="text-xs text-gray-400">قانون تنظیم شده</span>
                                        </div>

                                        <div className="mt-auto border-t border-gray-100 dark:border-gray-800 pt-3 flex items-center justify-between">
                                            <div className="flex -space-x-1.5 space-x-reverse"></div>
                                            <button
                                                onClick={() => navigate('/concepts/auto-replies')}
                                                className="flex items-center gap-0.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors">
                                                مدیریت پاسخ خودکار <HiChevronLeft />
                                            </button>
                                        </div>
                                    </Card>
                                ) : (
                                    /* 🟠 حالت دوم: کاربر هیچ پاسخ خودکاری ندارد (طراحی تشویقی) */
                                    <Card className="flex flex-col shadow-sm border border-amber-100 dark:border-amber-900/50 rounded-xl bg-amber-50/50 dark:bg-amber-500/5 p-4 xl:p-5 group hover:shadow-md transition-all justify-center items-center text-center relative overflow-hidden">
                                        {/* افکت پس‌زمینه کارت خالی */}
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>

                                        <div className="p-3 bg-white dark:bg-gray-800 rounded-2xl text-amber-500 shadow-sm mb-3 z-10 border border-amber-50 dark:border-amber-500/20">
                                            {/* آیکون اتوماسیون */}
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" />
                                                <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
                                                <path d="m11 13.73-4 6.93" />
                                                <path d="m17 3.34-1 1.73" />
                                            </svg>
                                        </div>

                                        <h4 className="text-sm font-black text-amber-900 dark:text-amber-100 mb-1.5 z-10">
                                            پاسخ خودکاری ندارید!
                                        </h4>

                                        <p className="text-[11px] text-amber-700/80 dark:text-amber-300 mb-4 z-10">
                                            برای پاسخگویی هوشمند و سریع به مشتریان، اولین قانون خود را بسازید.
                                        </p>

                                        <button
                                            onClick={() => navigate('/concepts/auto-replies')}
                                            className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg transition-colors shadow-sm z-10">
                                            ایجاد اولین قانون
                                        </button>
                                    </Card>
                                )}

                                {/* ۱. تیم پشتیبانی و اپراتورها */}
                                {overview.maxOperatorsLimit === -1 ? (
                                    <Card className="flex flex-col shadow-sm border border-rose-100 dark:border-rose-900/50 rounded-xl bg-rose-50/50 dark:bg-rose-500/5 p-4 xl:p-5 group hover:shadow-md transition-all justify-center items-center text-center relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl pointer-events-none"></div>

                                        <div className="p-3 bg-white dark:bg-gray-800 rounded-2xl text-rose-500 shadow-md mb-3 z-10 border border-rose-100 dark:border-rose-500/20">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                        </div>

                                        <h4 className="text-sm font-black text-rose-900 dark:text-rose-100 mb-1.5 z-10">
                                            تیم پشتیبانی قفل است!
                                        </h4>

                                        <p className="text-[11px] text-rose-700/80 dark:text-rose-300 mb-5 z-10 leading-relaxed">
                                            در پلن لایسنس فعلی شما، امکان افزودن اپراتور انسانی وجود ندارد.
                                        </p>

                                        <div className="relative w-full z-10">
                                            <div className="absolute -inset-1 bg-gradient-to-r from-rose-400 to-red-500 rounded-lg blur opacity-50 animate-pulse"></div>

                                            <button
                                                onClick={() => navigate('/concepts/account/settings?tab=#subscription')}
                                                className="relative w-full flex items-center justify-center gap-1.5 px-4 py-3 bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 text-white text-xs font-black rounded-lg transition-all shadow-md">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 animate-bounce text-rose-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                </svg>
                                                ارتقا لایسنس
                                            </button>
                                        </div>
                                    </Card>
                                ) : overview.currentOperatorsCount === 0 ? (
                                    <Card className="flex flex-col shadow-sm border border-teal-100 dark:border-teal-900/50 rounded-xl bg-teal-50/50 dark:bg-teal-500/5 p-4 xl:p-5 group hover:shadow-md transition-all justify-center items-center text-center relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl pointer-events-none"></div>

                                        <div className="p-3 bg-white dark:bg-gray-800 rounded-2xl text-teal-500 shadow-sm mb-3 z-10 border border-teal-50 dark:border-teal-500/20">
                                            <TbBrandTeams className="h-8 w-8" />
                                        </div>

                                        <h4 className="text-sm font-black text-teal-900 dark:text-teal-100 mb-1.5 z-10">
                                            تیمی اضافه نکرده‌اید!
                                        </h4>

                                        <p className="text-[11px] text-teal-700/80 dark:text-teal-300 mb-4 z-10">
                                            شما تا <span className="font-bold">{overview.maxOperatorsLimit} اپراتور</span> ظرفیت دارید. همین حالا هم‌تیمی‌های خود را اضافه کنید.
                                        </p>

                                        <button
                                            onClick={() => navigate('/concepts/account/settings?tab=#Team')}
                                            className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm z-10">
                                            افزودن اولین اپراتور
                                        </button>
                                    </Card>
                                ) : (
                                    <Card className="relative overflow-hidden flex flex-col shadow-sm border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900 p-4 xl:p-5 group hover:shadow-md transition-shadow">
                                        <div className="mb-4">
                                            <p className="text-lg font-bold text-gray-500 -mt-3 -mr-3 pb-4">تیم پشتیبانی</p>
                                            <div className="absolute top-0 left-0 p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-br-2xl text-indigo-600 shadow-sm border-b border-r border-indigo-100 dark:border-indigo-500/20 transition-transform group-hover:scale-105 origin-top-left">
                                                <TbBrandTeams className="h-10 w-10" />
                                            </div>
                                        </div>

                                        <div className="flex items-baseline gap-1 mb-4">
                                            <h4 className="text-2xl font-black text-gray-900 dark:text-white">
                                                {overview.currentOperatorsCount}
                                            </h4>
                                            <span className="text-xs text-gray-400">/ {overview.maxOperatorsLimit} اپراتور</span>
                                        </div>

                                        <div className="mt-auto border-t border-gray-100 dark:border-gray-800 pt-3 flex items-center justify-between">
                                            <span className="text-[11px] font-bold text-gray-500">ظرفیت تیم انسانی</span>
                                            <button
                                                onClick={() => navigate('/concepts/account/settings?tab=team')}
                                                className="flex items-center gap-0.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
                                            >
                                                مدیریت تیم <HiChevronLeft />
                                            </button>
                                        </div>
                                    </Card>
                                )}





                                {/* ۴. مخاطبین */}
                                <Card className="relative overflow-hidden flex flex-col shadow-sm border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900 p-4 xl:p-5 group hover:shadow-md transition-shadow">
                                    <div className="mb-4">
                                        <p className="text-lg font-bold text-gray-500 -mt-3 -mr-3 pb-4">مخاطبین</p>
                                        <div className="absolute top-0 left-0 p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-br-2xl text-indigo-600 shadow-sm border-b border-r border-indigo-100 dark:border-indigo-500/20 transition-transform group-hover:scale-105 origin-top-left">
                                            <HiOutlineUsers className="h-10 w-10" />
                                        </div>
                                    </div>
                                    <div className="flex items-baseline gap-1 mb-4">
                                        <h4 className="text-2xl font-black text-gray-900 dark:text-white">{overview.currentContactsCount.toLocaleString('fa-IR')}</h4>
                                        <span className="text-xs text-gray-400">/ {overview.maxContactsLimit.toLocaleString('fa-IR')} مخاطب</span>
                                    </div>
                                    <div className="mt-auto border-t border-gray-100 dark:border-gray-800 pt-3 flex items-center justify-between">
                                        <span className="text-[11px] font-bold text-gray-500">ظرفیت مخاطبین</span>
                                        {/* 🚀 دکمه مدیریت */}
                                        <button
                                            onClick={() => navigate('/concepts/contacts')}
                                            className="flex items-center gap-0.5 text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
                                            مدیریت مخاطبین <HiChevronLeft />
                                        </button>
                                    </div>
                                </Card>

                                {/* ======================================= */}
                                {/* ردیف دوم: 2 کارت پهن‌تر */}
                                {/* ======================================= */}

                                {/* ۵. کارت ویژه: شناسنامه شرکت و لایسنس */}
                                <Card className="flex flex-col lg:col-span-2 shadow-sm border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900 p-5 group hover:shadow-md transition-shadow relative overflow-hidden">
                                    {/* افکت سایه‌روشن تزئینی در پس‌زمینه کارت */}
                                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>

                                    <div className="flex flex-col md:flex-row h-full gap-6 relative z-10">

                                        {/* بخش راست: اطلاعات هویتی کسب‌وکار و بج‌ها (65%) */}
                                        <div className="w-full md:w-[65%] flex flex-col justify-between gap-4 border-b md:border-b-0 md:border-l border-gray-100 dark:border-gray-800 pb-5 md:pb-0 md:pl-6">

                                            {/* قسمت بالا: آیکون، نام شرکت و بج پلن */}
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 flex-shrink-0">
                                                    <HiOutlineOfficeBuilding className="w-8 h-8" />
                                                </div>
                                                <div className="w-full flex flex-col overflow-hidden">
                                                    <h3 className="text-xl font-black text-gray-900 dark:text-white truncate">
                                                        {overview.companyName || 'نام کسب‌وکار'}
                                                    </h3>
                                                    <div className="mt-2 w-full">
                                                        <span className="w-full px-2 py-1.5 bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 text-xs font-black rounded-lg border border-purple-100 dark:border-purple-500/20 flex items-center justify-center gap-1.5 shadow-sm text-center">
                                                            <HiOutlineBadgeCheck className="w-4 h-4 flex-shrink-0" />
                                                            پلن {overview.subscriptionPlan}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 🌟 قسمت پایین: باکس هشدار API (فاصله گرفته از بالا و چسبیده به پایین) 🌟 */}
                                            <div className="w-full mt-auto">
                                                {overview.hasApiAccess ? (
                                                    <div className="w-full px-3 py-2 bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-400 text-xs font-bold rounded-lg border border-sky-100 dark:border-sky-500/20 flex items-center justify-center gap-2 shadow-sm text-center">
                                                        <TbApi className="w-4 h-4 flex-shrink-0" />
                                                        قابلیت ارسال پیام به کمک API در نرم‌افزار شما
                                                    </div>
                                                ) : (
                                                    <div className="w-full px-3 py-2 bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 text-xs font-bold rounded-lg border border-rose-100 dark:border-rose-500/20 flex items-center justify-center gap-2 shadow-sm text-center">
                                                        <TbApi className="w-4 h-4 flex-shrink-0" />
                                                        عدم دسترسی به API
                                                    </div>
                                                )}
                                            </div>

                                        </div>

                                        {/* بخش چپ: وضعیت لایسنس و اکشن‌ها (35%) (بدون هیچ تغییری) */}
                                        <div className="w-full md:w-[35%] flex flex-col justify-between gap-4">

                                            {/* باکس روزهای باقیمانده (حجم‌دار و متمرکز) */}
                                            <div className="flex items-center bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-gray-700/50">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl text-emerald-600 shadow-sm">
                                                        <HiOutlineCalendar className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-baseline gap-1">
                                                            <h4 className="text-xl font-black text-gray-900 dark:text-white">
                                                                {overview.daysRemaining}
                                                            </h4>
                                                            <span className="text-[11px] font-bold text-gray-400">روز باقیمانده</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* دکمه مدیریت */}
                                            <div className="flex justify-end mt-auto">
                                                <button
                                                    onClick={() => navigate('/concepts/account/settings?tab=#subscription')}
                                                    className="flex items-center gap-1.5 px-5 py-2.5 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-xl border border-gray-200 dark:border-gray-700 transition-all shadow-sm">
                                                    ارتقا و تنظیمات <HiChevronLeft />
                                                </button>
                                            </div>
                                        </div>

                                    </div>
                                </Card>


                                {/* ۶. مصرف هوش مصنوعی و پایگاه دانش (RAG) */}
                                <Card className="flex flex-col lg:col-span-2 shadow-sm border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900 p-4 xl:p-5 group hover:shadow-md transition-shadow">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                        {/* بخش سمت راست: آمار توکن‌ها */}
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-amber-50 dark:bg-amber-500/10 rounded-2xl text-amber-600">
                                                <TbCpu className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-500 mb-1">مصرف توکن </p>
                                                <div className="flex items-baseline gap-1">
                                                    <h4 className="text-2xl font-black text-gray-900 dark:text-white">{usedTokens.toLocaleString('fa-IR')}</h4>
                                                    <span className="text-sm text-gray-400">/ {overview.allocatedAiTokens.toLocaleString('fa-IR')} توکن</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* بخش سمت چپ: آمار فایل‌ها و دکمه */}
                                        <div className="flex flex-row items-center gap-4 md:justify-end border-t md:border-t-0 border-gray-100 dark:border-gray-800 pt-3 md:pt-0">
                                            <div className="text-right">
                                                <p className="text-xs font-bold text-gray-500 mb-1">پایگاه دانش</p>
                                                <div className="flex items-baseline gap-1 justify-end">
                                                    <h4 className="text-xl font-black text-gray-900 dark:text-white">{overview.totalKnowledgeDocuments.toLocaleString('fa-IR')}</h4>
                                                    <span className="text-xs text-gray-400">فایل</span>
                                                </div>
                                            </div>

                                            {/* خط جداکننده (فقط در دسکتاپ) */}
                                            <div className="h-10 w-px bg-gray-200 dark:bg-gray-700 hidden md:block mx-1"></div>

                                            {/* 🚀 دکمه مدیریت */}
                                            <button
                                                onClick={() => navigate('/concepts/knowledge')} // مسیر صفحه دانش‌نامه را اینجا قرار دهید
                                                className="flex items-center justify-center gap-1.5 px-4 py-2 bg-gray-50 hover:bg-amber-50 dark:bg-gray-800 dark:hover:bg-amber-500/10 text-gray-700 hover:text-amber-700 dark:text-gray-300 dark:hover:text-amber-400 text-sm font-bold rounded-lg border border-gray-200 dark:border-gray-700 transition-all"
                                            >
                                                مدیریت پایگاه دانش <HiChevronLeft />
                                            </button>
                                        </div>
                                    </div>

                                    {/* نوار پیشرفت توکن در پایین کارت عریض */}
                                    <div className="mt-auto pt-2">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-[11px] font-bold text-gray-500">وضعیت مصرف پردازش AI</span>
                                            <span className="text-[11px] font-black text-gray-700 dark:text-gray-300">٪{tokenPercentage.toLocaleString('fa-IR')} استفاده شده</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-1000 ${tokenPercentage > 85 ? 'bg-rose-500 animate-pulse' : 'bg-amber-500'}`}
                                                style={{ width: `${tokenPercentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </Card>

                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };


    // 🟨 کامپوننت ۲: جزیره تحلیلی (داینامیک و متصل به فیلترها)
    const AnalyticsIsland = () => {
        const [isOpen, setIsOpen] = useState(false);


        const { timeframe, selectedBot, setTimeframe, setSelectedBot } = useDashboardStore();
        const { data: metrics, isLoading: isMetricsLoading, isError: isMetricsError } = useDashboardMetrics(companyId);

        // 🌟 دریافت لیست ربات‌ها به صورت زنده از بک‌اند
        const { data: botsData } = useQuery({
            queryKey: ['companyBots'],
            queryFn: async () => {
                const response = await apiGetBots();

                // 💡 کست کردن به any برای خاموش کردن ارور تایپ‌اسکریپت روی فیلد data
                const rawResponse = response as any;
                const responseData = rawResponse?.data || rawResponse;

                // حالت اول: اگر بک‌اند ساختار صفحه‌بندی (PagedResult) برگرداند
                if (responseData && Array.isArray(responseData.items)) {
                    return responseData.items;
                }

                // حالت دوم: اگر مستقیماً آرایه برگرداند
                if (Array.isArray(responseData)) {
                    return responseData;
                }

                return [];
            },
            staleTime: 10 * 60 * 1000, // کش ۱۰ دقیقه‌ای
        });

        const safeBotsArray = Array.isArray(botsData) ? botsData : [];

        const filterOptions = [
            { id: 'all', name: 'همه ربات‌ها', platform: 'all' },
            ...safeBotsArray
        ];

        if (isMetricsLoading) return <div className="p-8 text-center text-gray-500 font-bold animate-pulse">در حال بارگذاری اطلاعات داشبورد...</div>;
        if (isMetricsError || !metrics) return <div className="p-8 text-center text-red-500 font-bold">خطا در دریافت اطلاعات داشبورد!</div>;

        // تابع رندر کادر شناور سفارشی برای نمودار دایره‌ای
        const renderCustomTooltip = ({ active, payload }: any) => {
            if (active && payload && payload.length) {
                const data = payload[0].payload;
                const color = payload[0].payload.fill || payload[0].color;

                return (
                    <div className="bg-white dark:bg-gray-800 px-4 py-2.5 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
                        <p className="text-sm font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2 m-0">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }}></span>
                            {`${payload[0].value} پیام ${data.platform}`}
                        </p>
                    </div>
                );
            }
            return null;
        };
        // جلوگیری از کرش اگر دیتا هنوز لود نشده بود
        if (!metrics) return <div>در حال بارگذاری اطلاعات تحلیلی...</div>;

        return (
            <div className="bg-indigo-50/40 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800/30 rounded-[2rem] p-6 lg:p-8 shadow-sm transition-all duration-300">
                <div className={`flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 ${isOpen ? 'mb-8' : ''}`}>

                    {/* 🌟 استایل انیمیشن تپش (یک‌بار برای کل این بخش تعریف می‌شود) 🌟 */}
                    <style>{`
                        @keyframes heartbeat {
                            0%, 100% { transform: scale(1); box-shadow: 0 0 0 rgba(79, 70, 229, 0); }
                            50% { transform: scale(1.15); box-shadow: 0 0 12px rgba(79, 70, 229, 0.5); }
                        }
                        .animate-heartbeat {
                            animation: heartbeat 2s infinite ease-in-out;
                        }
                    `}</style>

                    {/* بخش عنوان و دکمه موبایل */}
                    <div
                        className="flex items-center justify-between w-full xl:w-auto cursor-pointer select-none"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/30 border border-white/10">
                                <PiChartPieSliceDuotone className="text-[26px]" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black text-slate-900 dark:text-white">داشبورد تحلیلی</h1>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">گزارش زنده عملکرد ربات‌ها و پاسخگویی خودکار</p>
                            </div>
                        </div>

                        {/* دکمه فلش مخصوص موبایل (در xl مخفی می‌شود) */}
                        <div className="relative xl:hidden flex items-center justify-center">
                            <div className={`w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 ${!isOpen
                                ? 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-700/50 animate-heartbeat'
                                : 'bg-indigo-50 dark:bg-indigo-800/50 text-indigo-500 dark:text-indigo-400 border border-transparent'}`}>
                                <HiChevronUp className={`text-xl transition-transform duration-500 ${isOpen ? '' : 'rotate-180'}`} />

                            </div>
                        </div>
                    </div>

                    {/* بخش فیلترها و دکمه دسکتاپ */}
                    <div className="flex flex-col md:flex-row items-center gap-4 w-full xl:w-auto">

                        {/* فیلترها */}
                        {isOpen && (
                            <div className="flex flex-col lg:flex-row items-center gap-3 lg:gap-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md p-3 rounded-2xl border border-indigo-100/50 dark:border-gray-700/50 w-full xl:w-auto shadow-sm animate-[fadeIn_0.2s_ease-out]">

                                {/* ۱. فیلتر ربات‌ها */}
                                <div className="w-full lg:w-auto flex items-center overflow-hidden">
                                    <span className="hidden md:flex text-sm font-bold text-gray-400 dark:text-gray-500 items-center gap-1.5 ml-3 flex-shrink-0">
                                        <HiOutlineFilter className="text-xl" />
                                    </span>

                                    <div className="flex items-center gap-2 w-full overflow-x-auto pb-1 scroll-smooth snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                                        {filterOptions.map((bot) => {
                                            const isSelected = selectedBot === bot.id;
                                            const style = bot.id === 'all'
                                                ? { icon: null, color: '', bg: 'bg-gray-100 dark:bg-gray-800' }
                                                : getPlatformStyling(bot.platform);
                                            const IconComponent = style.icon;

                                            return (
                                                <button
                                                    key={bot.id}
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation(); // جلوگیری از بسته شدن منو هنگام کلیک روی فیلتر
                                                        setSelectedBot(bot.id);
                                                    }}
                                                    className={`snap-start flex items-center gap-2 px-4 py-2.5 md:py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap flex-shrink-0 border-2 ${isSelected
                                                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 shadow-sm'
                                                        : 'border-transparent bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                        }`}
                                                >
                                                    {IconComponent && (
                                                        <IconComponent className={`text-lg ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : style.color}`} />
                                                    )}
                                                    {bot.name}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="hidden lg:block w-px h-8 bg-gray-200 dark:bg-gray-700"></div>

                                {/* ۲. فیلتر زمان */}
                                <div className="flex bg-gray-100 dark:bg-gray-800/80 rounded-xl p-1 w-full lg:w-max flex-shrink-0 mt-1 lg:mt-0">
                                    {[
                                        { id: '24h', label: '۲۴ ساعت' },
                                        { id: '7d', label: '۷ روز' },
                                        { id: '30d', label: '۳۰ روز' }
                                    ].map(t => (
                                        <button
                                            key={t.id}
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setTimeframe(t.id as any);
                                            }}
                                            className={`flex-1 lg:flex-none px-4 py-2.5 md:py-2 rounded-lg text-sm font-bold transition-all ${timeframe === t.id
                                                ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                                }`}
                                        >
                                            {t.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* دکمه فلش مخصوص دسکتاپ (فقط در xl نمایش داده می‌شود) */}
                        <div
                            className={`hidden xl:flex w-10 h-10 items-center justify-center rounded-full cursor-pointer transition-all duration-300 ${!isOpen
                                ? 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-700/50 animate-heartbeat'
                                : 'bg-indigo-50 dark:bg-indigo-800/50 text-indigo-500 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-800 border border-transparent'}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsOpen(!isOpen);
                            }}
                        >
                            <HiChevronUp className={`text-2xl transition-transform duration-500 ${isOpen ? '' : 'rotate-180'}`} />
                        </div>
                    </div>
                </div>
                <div className={`grid transition-all duration-500 ease-in-out ${isOpen ? 'grid-rows-[1fr] mt-8' : 'grid-rows-[0fr] mt-0'
                    }`}>
                    <div className="overflow-hidden">
                        <div className={`transition-all duration-[600ms] ease-out transform origin-top ${isOpen ? 'opacity-100 translate-y-0 scale-100 delay-100' : 'opacity-0 -translate-y-8 scale-[0.97] pointer-events-none'
                            }`}>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
                                <Card className="overflow-hidden relative group shadow-sm border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900 p-5">
                                    <div className="flex items-start justify-between">
                                        <div className="flex flex-col gap-1.5">
                                            <span className="text-sm font-bold text-gray-500 dark:text-gray-400">کل پیام‌های پردازش شده</span>
                                            <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">
                                                {metrics.totalMessages?.toLocaleString('fa-IR') || 0}
                                            </h3>
                                        </div>
                                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-2xl flex-shrink-0">
                                            <HiOutlineChatAlt />
                                        </div>
                                    </div>
                                </Card>

                                <Card className="overflow-hidden relative group shadow-sm border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900 p-5">
                                    <div className="flex items-start justify-between">
                                        <div className="flex flex-col gap-1.5">
                                            <span className="text-sm font-bold text-gray-500 dark:text-gray-400">نرخ پاسخگویی خودکار</span>
                                            <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">
                                                ٪{metrics.botRate?.toLocaleString('fa-IR') || 0}
                                            </h3>
                                        </div>
                                        <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center text-2xl flex-shrink-0">
                                            <TbMessageBolt />
                                        </div>
                                    </div>
                                    <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full mt-6 overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-700 ease-out" style={{ width: `${metrics.botRate || 0}%` }}></div>
                                    </div>
                                </Card>

                                <Card className="overflow-hidden relative group shadow-sm border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900 p-5">
                                    <div className="flex items-start justify-between">
                                        <div className="flex flex-col gap-1.5">
                                            <span className="text-sm font-bold text-gray-500 dark:text-gray-400">میانگین سرعت پاسخ</span>
                                            <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">
                                                {metrics.avgTime || '۰ ثانیه'}
                                            </h3>
                                        </div>
                                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-2xl flex-shrink-0">
                                            <HiOutlineClock />
                                        </div>
                                    </div>
                                </Card>

                                <Card className="overflow-hidden relative group shadow-sm border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900 p-5">
                                    <div className="flex items-start justify-between">
                                        <div className="flex flex-col gap-1.5">
                                            <span className="text-sm font-bold text-gray-500 dark:text-gray-400">ارجاع به اپراتور انسانی</span>
                                            <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">
                                                {metrics.handovers?.toLocaleString('fa-IR') || 0}
                                            </h3>
                                        </div>
                                        <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center text-2xl flex-shrink-0">
                                            <HiOutlineUserGroup />
                                        </div>
                                    </div>
                                </Card>

                            </div>
                            <div className="flex flex-col gap-5 w-full animate-[fadeIn_0.3s_ease-out]" dir="rtl">
                                <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                                    <Card className="xl:col-span-2 flex flex-col justify-between shadow-sm border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900 p-6">
                                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-2">
                                            <div>
                                                <h4 className="text-lg font-bold text-gray-900 dark:text-white">روند تعاملات ربات‌ها</h4>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">مقایسه کل پیام‌های ورودی با پیام‌های حل‌شده توسط ربات</p>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-4 bg-gray-50 dark:bg-gray-800/50 p-2 rounded-xl border border-gray-100 dark:border-gray-700">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 rounded-full bg-indigo-500 shadow-sm shadow-indigo-500/50"></div>
                                                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">کل ورودی</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50"></div>
                                                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">حل شده (ربات)</span>
                                                </div>
                                            </div>
                                        </div>

                                        <TrendChart data={metrics.chartData || []} />
                                    </Card>

                                    <Card className="flex flex-col shadow-sm border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900 p-6">
                                        <div className="mb-4">
                                            <h4 className="text-lg font-bold text-gray-900 dark:text-white">توزیع پلتفرم‌ها</h4>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">سهم هر پیام‌رسان از کل پیام‌های ورودی</p>
                                        </div>

                                        <div className="h-[250px] w-full flex items-center justify-center relative">
                                            {(!metrics.platformData || metrics.platformData.length === 0) ? (
                                                <span className="text-sm text-gray-400 font-bold">داده‌ای برای نمایش وجود ندارد</span>
                                            ) : (
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie
                                                            // 💡 در اینجا دیتا را در لحظه کپی (map) می‌کنیم تا کشِ React Query دست‌نخورده بماند
                                                            data={metrics.platformData.map(entry => {
                                                                const { hexColor, faName } = getChartPlatformInfo(entry.platform);
                                                                return {
                                                                    ...entry,           // کپی کردن دیتای قبلی
                                                                    platformName: faName, // اضافه کردن فیلد جدید به کپی
                                                                    fillColor: hexColor   // اضافه کردن رنگ به کپی
                                                                };
                                                            })}
                                                            innerRadius={65}
                                                            outerRadius={90}
                                                            paddingAngle={5}
                                                            dataKey="count"
                                                            stroke="none"
                                                            cornerRadius={8}
                                                        >
                                                            {/* حالا از دیتای امن و کپی شده برای رسم سلول‌ها استفاده می‌کنیم */}
                                                            {metrics.platformData.map((entry, index) => {
                                                                const { hexColor } = getChartPlatformInfo(entry.platform);
                                                                return <Cell key={`cell-${index}`} fill={hexColor} />;
                                                            })}
                                                        </Pie>

                                                        <RechartsTooltip
                                                            content={renderCustomTooltip}
                                                        />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            )}

                                            {metrics.platformData && metrics.platformData.length > 0 && (
                                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                                    <span className="text-2xl font-extrabold text-gray-900 dark:text-white">
                                                        {metrics.totalMessages?.toLocaleString('fa-IR')}
                                                    </span>
                                                    <span className="text-xs font-bold text-gray-500">کل پیام‌ها</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
                                            {metrics.platformData?.map((entry, index) => {
                                                // استفاده مجدد از تابع کمکی برای استایل‌های راهنما
                                                const { hexColor, faName } = getChartPlatformInfo(entry.platform);
                                                const percentage = Math.round((entry.count / metrics.totalMessages) * 100) || 0;

                                                return (
                                                    <div key={index} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-100 dark:border-gray-700">
                                                        <span className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: hexColor }}></span>
                                                        <span className="text-xs font-bold text-gray-600 dark:text-gray-300">{faName}</span>
                                                        <span className="text-xs font-extrabold text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-600 pr-2 mr-1">
                                                            ٪{percentage}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </Card>
                                </div>
                                <Card className="w-full flex flex-col shadow-sm border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900 p-6">
                                    <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                                        <div>
                                            <h4 className="text-lg font-bold text-gray-900 dark:text-white">عملکرد کمپین‌های اخیر</h4>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">مقایسه حجم پیام‌های ارسال شده با کل مخاطبین هدف</p>
                                        </div>
                                        <button
                                            onClick={() => navigate('/concepts/CampaignList')}
                                            className="flex items-center justify-center gap-2 px-4 py-2 text-sm md:text-base font-bold bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 hover:scale-105 transition-all duration-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:hover:bg-indigo-500/20 w-full sm:w-auto"
                                        >
                                            مدیریت کمپین‌ها
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 rtl:rotate-180" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>

                                    <div className="h-[300px] w-full">
                                        {(!metrics.campaignData || metrics.campaignData.length === 0) ? (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <span className="text-sm text-gray-400 font-bold">هیچ کمپینی در این بازه زمانی یافت نشد</span>
                                            </div>
                                        ) : (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart
                                                    data={metrics.campaignData}
                                                    margin={{ top: 20, right: 0, left: -20, bottom: 5 }}
                                                    barSize={35}
                                                >
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-gray-200 dark:text-gray-700" />

                                                    <XAxis
                                                        dataKey="name"
                                                        tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 'bold' }}
                                                        axisLine={false}
                                                        tickLine={false}
                                                    />

                                                    <YAxis
                                                        tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 'bold' }}
                                                        axisLine={false}
                                                        tickLine={false}
                                                    />

                                                    <RechartsTooltip
                                                        cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
                                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
                                                        formatter={(value, name) => [
                                                            `${value} پیام`,
                                                            name === 'sent' ? 'ارسال موفق' : 'در صف / باقیمانده'
                                                        ]}
                                                    />

                                                    <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '13px', fontWeight: 'bold', color: '#4b5563' }} />

                                                    <Bar
                                                        dataKey="sent"
                                                        name="ارسال موفق"
                                                        stackId="a"
                                                        fill="#4f46e5"
                                                        radius={[0, 0, 4, 4]}
                                                    />
                                                    <Bar
                                                        dataKey="pending"
                                                        name="باقیمانده / در صف"
                                                        stackId="a"
                                                        fill="#e5e7eb"
                                                        radius={[4, 4, 0, 0]}
                                                    />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        )}
                                    </div>
                                </Card>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        );
    };
    return (
        <div className="p-4 md:p-6 lg:p-8 w-full max-w-full mx-auto space-y-8">
            {/* ========================================================= */}
            {/* 🟦 جزیره اول: بخش وضعیت کلی سیستم */}
            {/* ========================================================= */}
            <ManagementIsland />

            <div className="py-2">
                <hr className="border-gray-200 dark:border-gray-800" />
            </div>


            {/* ========================================================= */}
            {/* 🟪 جزیره دوم: بخش داشبورد تحلیلی و نمودارها */}
            {/* ========================================================= */}
            <AnalyticsIsland />

        </div>
    );
};

export default Dashboard;