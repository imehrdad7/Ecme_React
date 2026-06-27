import { useState } from 'react'
import { 
    HiOutlineLightningBolt, HiOutlineClock, HiOutlineUserGroup, HiOutlineChatAlt,
    HiOutlineArrowUp, HiOutlineTrendingUp, HiOutlineFilter, HiOutlineGlobeAlt
} from 'react-icons/hi'
import { FaTelegramPlane, FaInstagram, FaWhatsapp, FaGlobe } from 'react-icons/fa'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

// دیتای فرضی ربات‌های سیستم برای فیلتر دسکتاپ
const availableBots = [
    { id: 'all', name: 'همه ربات‌ها', channel: 'All' },
    { id: 'bot-101', name: 'ربات پشتیبانی فروش', channel: 'Telegram', icon: FaTelegramPlane, color: 'text-sky-500' },
    { id: 'bot-102', name: 'دستیار هوشمند سایت', channel: 'Web', icon: FaGlobe, color: 'text-indigo-500' },
    { id: 'bot-103', name: 'پاسخگوی دایرکت', channel: 'Instagram', icon: FaInstagram, color: 'text-pink-600' },
]

const Dashboard = () => {
    const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d'>('7d')
    const [selectedBot, setSelectedBot] = useState<string>('all')
    const [isSpikeActive, setIsSpikeActive] = useState<boolean>(false)

    // لایه دیتای پویا (با قابلیت شبیه‌سازی ترافیک زنده)
    const baseMetrics = {
        totalMessages: isSpikeActive ? 48250 : 34210,
        botRate: isSpikeActive ? 84 : 76,
        avgTime: isSpikeActive ? '۰.۸ ثانیه' : '۱.۲ ثانیه',
        handovers: isSpikeActive ? 1240 : 1840,
    }

    // مختصات نقاط نمودار SVG (در حالت عادی و حالت اسپایک ترافیک)
    const chartPoints = isSpikeActive 
        ? "10,120 50,110 90,90 130,130 170,70 210,40 250,20 290,15" 
        : "10,120 50,100 90,110 130,85 170,95 210,70 250,65 290,60"

    const botChartPoints = isSpikeActive
        ? "10,140 50,130 90,110 130,140 170,90 210,60 250,35 290,25"
        : "10,140 50,125 90,130 130,105 170,115 210,95 250,90 290,85"

    return (
        <div className="flex flex-col gap-6 w-full h-full pb-8 text-right" dir="rtl">
            
            {/* 🌟 هدر اصلی داشبورد و دکمه شبیه‌سازی */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">داشبرد تحلیلی</h3>
                    <p className="text-sm text-gray-500 mt-1">گزارش زنده عملکرد ربات‌ها و راندمان پاسخگویی خودکار</p>
                </div>
                
                <Button 
                    variant={isSpikeActive ? 'solid' : 'twoTone'}
                    className={isSpikeActive ? 'bg-amber-600 hover:bg-amber-500 text-white' : ''}
                    icon={<HiOutlineTrendingUp className="text-lg animate-pulse" />}
                    onClick={() => setIsSpikeActive(!isSpikeActive)}
                >
                    {isSpikeActive ? 'توقف شبیه‌سازی ترافیک زنده' : 'شبیه‌سازی ترافیک زنده (Spike)'}
                </Button>
            </div>

            {/* 🌟 نوار فیلترهای هوشمند */}
            <Card className="p-4 bg-gray-50/50 dark:bg-gray-800/40 border-gray-100 dark:border-gray-800">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    
                    {/* فیلتر انتخاب ربات‌ها */}
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs text-gray-400 flex items-center gap-1 ml-2">
                            <HiOutlineFilter /> فیلتر ربات:
                        </span>
                        {availableBots.map((bot) => {
                            const isSelected = selectedBot === bot.id
                            return (
                                <button
                                    key={bot.id}
                                    type="button"
                                    onClick={() => setSelectedBot(bot.id)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 border
                                        ${isSelected 
                                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' 
                                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    {bot.icon && <bot.icon className={isSelected ? 'text-white' : bot.color} />}
                                    <span>{bot.name}</span>
                                </button>
                            )
                        })}
                    </div>

                    {/* فیلتر بازه زمانی */}
                    <div className="flex bg-gray-200/60 dark:bg-gray-900 border border-transparent rounded-xl p-1 self-start md:self-auto">
                        <button 
                            type="button" onClick={() => setTimeframe('24h')}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${timeframe === '24h' ? 'bg-white dark:bg-gray-800 text-indigo-600 shadow-sm' : 'text-gray-500'}`}
                        >
                            ۲۴ ساعت گذشته
                        </button>
                        <button 
                            type="button" onClick={() => setTimeframe('7d')}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${timeframe === '7d' ? 'bg-white dark:bg-gray-800 text-indigo-600 shadow-sm' : 'text-gray-500'}`}
                        >
                            ۷ روز گذشته
                        </button>
                        <button 
                            type="button" onClick={() => setTimeframe('30d')}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${timeframe === '30d' ? 'bg-white dark:bg-gray-800 text-indigo-600 shadow-sm' : 'text-gray-500'}`}
                        >
                            ۳۰ روز گذشته
                        </button>
                    </div>

                </div>
            </Card>

            {/* 🌟 بخش کارت‌های شاخص کلیدی (KPI Cards) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* کارت ۱: کل پیام‌ها */}
                <Card className="overflow-hidden relative group border-gray-100 dark:border-gray-800">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-gray-400 font-medium">کل پیام‌های پردازش شده</span>
                            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-1">
                                {baseMetrics.totalMessages.toLocaleString('fa-IR')}
                            </h3>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 flex items-center justify-center text-xl">
                            <HiOutlineChatAlt />
                        </div>
                    </div>
                    <div className="flex items-center gap-1 mt-4 text-[11px] text-emerald-500 font-bold">
                        <HiOutlineArrowUp /> <span>۱۲٪ افزایش نسبت به بازه قبل</span>
                    </div>
                </Card>

                {/* کارت ۲: نرخ پاسخگویی خودکار */}
                <Card className="overflow-hidden relative group border-gray-100 dark:border-gray-800">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-gray-400 font-medium">نرخ پاسخگویی خودکار ربات</span>
                            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-1">
                                ٪{baseMetrics.botRate.toLocaleString('fa-IR')}
                            </h3>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center text-xl">
                            <HiOutlineLightningBolt />
                        </div>
                    </div>
                    {/* پروگرس بار کوچک پیشرفت خودکار */}
                    <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full mt-5 overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full transition-all duration-500" style={{ width: `${baseMetrics.botRate}%` }}></div>
                    </div>
                </Card>

                {/* کارت ۳: میانگین زمان پاسخ */}
                <Card className="overflow-hidden relative group border-gray-100 dark:border-gray-800">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-gray-400 font-medium">میانگین سرعت بازخورد</span>
                            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-1">
                                {baseMetrics.avgTime}
                            </h3>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 flex items-center justify-center text-xl">
                            <HiOutlineClock />
                        </div>
                    </div>
                    <div className="flex items-center gap-1 mt-4 text-[11px] text-emerald-500 font-bold">
                        <HiOutlineArrowUp /> <span>۱۸٪ بهبود کارایی سرور</span>
                    </div>
                </Card>

                {/* کارت ۴: ارجاع به اپراتور */}
                <Card className="overflow-hidden relative group border-gray-100 dark:border-gray-800">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-gray-400 font-medium">ارجاع به اپراتور انسانی</span>
                            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-1">
                                {baseMetrics.handovers.toLocaleString('fa-IR')}
                            </h3>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center text-xl">
                            <HiOutlineUserGroup />
                        </div>
                    </div>
                    <div className="flex items-center gap-1 mt-4 text-[11px] text-rose-500 font-bold">
                        <span>کمتر از ۴٪ نیاز به مداخله ادمین</span>
                    </div>
                </Card>

            </div>

            {/* 🌟 بخش نمودار اصلی تعاملی */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* کارت نمودار جریانی SVG (تمام‌عرض در تبلت و دسکتاپ) */}
                <Card className="lg:col-span-2 flex flex-col justify-between border-gray-100 dark:border-gray-800">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h4 className="text-sm font-bold text-gray-800 dark:text-gray-100">روند تعاملات و پیام‌ها در طول زمان</h4>
                            <p className="text-xs text-gray-400 mt-0.5">تفکیک بین بازخورد هوشمند ربات و پاسخ دستی اپراتور</p>
                        </div>
                        {/* لند یا راهنمای نمودار */}
                        <div className="flex items-center gap-4 text-xs">
                            <div className="flex items-center gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                                <span className="text-gray-500">کل ورودی</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                                <span className="text-gray-500">حل شده توسط ربات</span>
                            </div>
                        </div>
                    </div>

                    {/* کادر رندر گرافیک نمودار خطی */}
                    <div className="w-full h-56 relative mt-4" dir="ltr">
                        <svg className="w-full h-full overflow-visible" viewBox="0 0 300 150" preserveAspectRatio="none">
                            {/* خطوط پس‌زمینه گرید */}
                            <line x1="0" y1="37" x2="300" y2="37" stroke="#f1f5f9" strokeWidth="1" className="dark:stroke-gray-800"/>
                            <line x1="0" y1="75" x2="300" y2="75" stroke="#f1f5f9" strokeWidth="1" className="dark:stroke-gray-800"/>
                            <line x1="0" y1="112" x2="300" y2="112" stroke="#f1f5f9" strokeWidth="1" className="dark:stroke-gray-800"/>
                            
                            {/* خط جریان کل پیام‌ها */}
                            <polyline
                                fill="none"
                                stroke="#6366f1"
                                strokeWidth="3"
                                strokeLinecap="round"
                                className="transition-all duration-700 ease-in-out"
                                points={chartPoints}
                            />

                            {/* خط جریان حل شده توسط ربات */}
                            <polyline
                                fill="none"
                                stroke="#f59e0b"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeDasharray="4 2"
                                className="transition-all duration-700 ease-in-out"
                                points={botChartPoints}
                            />
                        </svg>
                        
                        {/* برچسب‌های محور افقی زمان */}
                        <div className="absolute -bottom-5 inset-x-0 flex justify-between text-[10px] text-gray-400 font-bold px-1" dir="rtl">
                            <span>شنبه</span>
                            <span>۱شنبه</span>
                            <span>۲شنبه</span>
                            <span>۳شنبه</span>
                            <span>۴شنبه</span>
                            <span>۵شنبه</span>
                            <span>جمعه</span>
                        </div>
                    </div>
                </Card>

                {/* ستون کناری: سهم هر کانال ارتباطی از کل ترافیک */}
                <Card className="border-gray-100 dark:border-gray-800 flex flex-col justify-between">
                    <div>
                        <h4 className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-1">ترافیک به تفکیک پلتفرم‌ها</h4>
                        <p className="text-xs text-gray-400 mb-6">کدام کانال ارتباطی بیشترین کاربر را روانه پلتفرم کرده است؟</p>
                    </div>

                    <div className="flex flex-col gap-4 flex-1 justify-center">
                        {/* ۱. تلگرام */}
                        <div className="flex flex-col gap-1.5">
                            <div className="flex items-center justify-between text-xs font-bold text-gray-600 dark:text-gray-300">
                                <span className="flex items-center gap-1.5"><FaTelegramPlane className="text-sky-500" /> تلگرام</span>
                                <span>۴۵٪</span>
                            </div>
                            <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div className="h-full bg-sky-500 rounded-full" style={{ width: '45%' }}></div>
                            </div>
                        </div>

                        {/* ۲. اینستاگرام */}
                        <div className="flex flex-col gap-1.5">
                            <div className="flex items-center justify-between text-xs font-bold text-gray-600 dark:text-gray-300">
                                <span className="flex items-center gap-1.5"><FaInstagram className="text-pink-500" /> اینستاگرام</span>
                                <span>۳۰٪</span>
                            </div>
                            <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div className="h-full bg-pink-500 rounded-full" style={{ width: '30%' }}></div>
                            </div>
                        </div>

                        {/* ۳. ویجت چت سایت */}
                        <div className="flex flex-col gap-1.5">
                            <div className="flex items-center justify-between text-xs font-bold text-gray-600 dark:text-gray-300">
                                <span className="flex items-center gap-1.5"><HiOutlineGlobeAlt className="text-indigo-500" /> ویجت چت سایت</span>
                                <span>۱۵٪</span>
                            </div>
                            <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500 rounded-full" style={{ width: '15%' }}></div>
                            </div>
                        </div>

                        {/* ۴. واتس‌اپ */}
                        <div className="flex flex-col gap-1.5">
                            <div className="flex items-center justify-between text-xs font-bold text-gray-600 dark:text-gray-300">
                                <span className="flex items-center gap-1.5"><FaWhatsapp className="text-green-500" /> واتس‌اپ بیزینس</span>
                                <span>۱۰٪</span>
                            </div>
                            <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div className="h-full bg-green-500 rounded-full" style={{ width: '10%' }}></div>
                            </div>
                        </div>
                    </div>
                </Card>

            </div>

            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            `}</style>
        </div>
    )
}

export default Dashboard