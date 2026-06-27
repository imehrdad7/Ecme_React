import { useState, useRef, useEffect } from 'react'
import { 
    HiOutlineSpeakerphone, HiOutlineUsers, HiOutlineCalendar, 
    HiOutlinePaperAirplane, HiOutlinePhotograph, HiOutlineClock,
    HiOutlineTag, HiCheckCircle
} from 'react-icons/hi'
import { FaTelegramPlane, FaInstagram, FaWhatsapp } from 'react-icons/fa'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'

const targetTags = [
    { id: 't1', label: 'مشتریان وفادار', count: 1250 },
    { id: 't2', label: 'لیدهای جدید (این ماه)', count: 840 },
    { id: 't3', label: 'سبد خرید رها شده', count: 320 },
    { id: 't4', label: 'همه کاربران', count: 5410 },
]

const connectedBots = [
    { id: 'bot-101', name: 'ربات پشتیبانی اصلی', platform: 'Telegram', icon: FaTelegramPlane, color: 'text-sky-500', bg: 'bg-sky-50' },
    { id: 'bot-102', name: 'خط فروش واتس‌اپ', platform: 'WhatsApp', icon: FaWhatsapp, color: 'text-green-500', bg: 'bg-green-50' },
    { id: 'bot-103', name: 'پاسخگوی دایرکت‌ها', platform: 'Instagram', icon: FaInstagram, color: 'text-pink-600', bg: 'bg-pink-50' },
]

const jalaliMonths = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند']

// 🌟 تنظیمات پایه برای محدودیت یک‌ساله (مثلاً امروز: ۱ تیر ۱۴۰۵)
const CURRENT_YEAR = 1405
const CURRENT_MONTH_INDEX = 3 // 0-based: تیر
const CURRENT_DAY = 1

const CampaignBuilder = () => {
    const [campaignName, setCampaignName] = useState<string>('')
    const [selectedTags, setSelectedTags] = useState<string[]>(['t4'])
    const [selectedBots, setSelectedBots] = useState<string[]>(['bot-101'])
    const [messageText, setMessageText] = useState<string>('')
    const [hasMedia, setHasMedia] = useState<boolean>(false)
    const [sendTiming, setSendTiming] = useState<'now' | 'scheduled'>('now')
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

    // استیت‌های تاریخ‌زن هوشمند
    const [isPickerOpen, setIsPickerOpen] = useState<boolean>(false)
    const [scheduleYear, setScheduleYear] = useState<number>(CURRENT_YEAR)
    const [scheduleMonth, setScheduleMonth] = useState<number>(CURRENT_MONTH_INDEX)
    const [scheduleDay, setScheduleDay] = useState<number>(CURRENT_DAY)
    const [scheduleHour, setScheduleHour] = useState<string>('10')
    const [scheduleMinute, setScheduleMinute] = useState<string>('30')
    
    const datePickerRef = useRef<HTMLDivElement>(null)

    // منطق تقویم: محاسبه ماه‌ها و روزهای در دسترس
    const availableYears = [CURRENT_YEAR, CURRENT_YEAR + 1]

    const getAvailableMonths = () => {
        return jalaliMonths.map((name, index) => ({ name, index })).filter(m => {
            if (scheduleYear === CURRENT_YEAR) return m.index >= CURRENT_MONTH_INDEX
            if (scheduleYear === CURRENT_YEAR + 1) return m.index <= CURRENT_MONTH_INDEX
            return true
        })
    }

    const getDaysInMonth = (monthIndex: number) => {
        if (monthIndex <= 5) return 31
        if (monthIndex <= 10) return 30
        return 29
    }

    const getAvailableDays = () => {
        const totalDays = getDaysInMonth(scheduleMonth)
        return Array.from({ length: totalDays }, (_, i) => i + 1).filter(d => {
            if (scheduleYear === CURRENT_YEAR && scheduleMonth === CURRENT_MONTH_INDEX) return d >= CURRENT_DAY
            if (scheduleYear === CURRENT_YEAR + 1 && scheduleMonth === CURRENT_MONTH_INDEX) return d <= CURRENT_DAY
            return true
        })
    }

    // اصلاح خودکار انتخاب‌های نامعتبر هنگام تغییر سال یا ماه
    useEffect(() => {
        if (scheduleYear === CURRENT_YEAR && scheduleMonth < CURRENT_MONTH_INDEX) {
            setScheduleMonth(CURRENT_MONTH_INDEX)
        } else if (scheduleYear === CURRENT_YEAR + 1 && scheduleMonth > CURRENT_MONTH_INDEX) {
            setScheduleMonth(0) // برگرداندن به فروردین
        }
    }, [scheduleYear])

    useEffect(() => {
        const availableDays = getAvailableDays()
        if (!availableDays.includes(scheduleDay)) {
            setScheduleDay(availableDays[0] || 1)
        }
    }, [scheduleYear, scheduleMonth])

    // بستن تقویم با کلیک بیرون
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
                setIsPickerOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const estimatedReach = selectedTags.reduce((total, tagId) => {
        const tag = targetTags.find(t => t.id === tagId)
        return total + (tag ? tag.count : 0)
    }, 0)

    const handleToggleTag = (tagId: string) => {
        if (tagId === 't4') return setSelectedTags(['t4'])
        let newTags = selectedTags.filter(t => t !== 't4')
        if (newTags.includes(tagId)) newTags = newTags.filter(t => t !== tagId)
        else newTags.push(tagId)
        if (newTags.length === 0) newTags = ['t4']
        setSelectedTags(newTags)
    }

    const handleToggleBot = (botId: string) => {
        if (selectedBots.includes(botId)) {
            if (selectedBots.length > 1) setSelectedBots(selectedBots.filter(id => id !== botId))
        } else {
            setSelectedBots([...selectedBots, botId])
        }
    }

    const handleSendCampaign = async () => {
        if (!campaignName.trim() || !messageText.trim()) {
            return toast.push(<Notification type="danger" title="خطا">عنوان کمپین و متن پیام الزامی است.</Notification>, { placement: 'top-center' })
        }
        setIsSubmitting(true)
        try {
            await new Promise(resolve => setTimeout(resolve, 2000))
            const successMsg = sendTiming === 'now' 
                ? 'پیام‌ها با موفقیت در صف ارسال قرار گرفتند.' 
                : `کمپین برای ${scheduleDay.toLocaleString('fa-IR')} ${jalaliMonths[scheduleMonth]} ${scheduleYear.toLocaleString('fa-IR')} زمان‌بندی شد.`
            
            toast.push(<Notification type="success" title="کمپین ثبت شد">{successMsg}</Notification>, { placement: 'top-center' })
            setCampaignName(''); setMessageText(''); setHasMedia(false)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="flex flex-col lg:flex-row gap-8 w-full h-full pb-8 animate-[fadeIn_0.3s_ease-out]" dir="rtl">
            
            {/* 🛑 ستون راست: فرم ساخت کمپین با فاصله و مرزبندی دقیق */}
            <div className="flex-1 flex flex-col gap-6">
                <div className="flex flex-col gap-1 mb-2">
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                        <HiOutlineSpeakerphone className="text-indigo-600" /> ارسال پیام انبوه (کمپین)
                    </h3>
                    <p className="text-sm text-gray-500">مخاطبین هدف را انتخاب کنید و پیام خود را برای آن‌ها برودکست کنید.</p>
                </div>

                {/* 🌟 کادر اصلی که پدینگ بیرونی ندارد تا بلوک‌ها لبه‌به‌لبه باشند */}
                <Card className="border-gray-200 dark:border-gray-700 p-0 overflow-hidden bg-white dark:bg-gray-900 shadow-sm flex flex-col">
                    
                    {/* 🌟 بخش ۱ */}
                    <div className="p-6 sm:p-8 flex flex-col gap-5">
                        <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-4">
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-bold text-sm">۱</span>
                            <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100">اطلاعات پایه</h4>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">نام کمپین (جهت رهگیری در پنل)</label>
                            <Input placeholder="مثال: تخفیف ویژه شب یلدا" value={campaignName} onChange={(e) => setCampaignName(e.target.value)} className="bg-gray-50 dark:bg-gray-800/50" />
                        </div>
                    </div>

                    <div className="h-px w-full bg-gray-100 dark:bg-gray-800"></div>

                    {/* 🌟 بخش ۲ */}
                    <div className="p-6 sm:p-8 flex flex-col gap-6 bg-gray-50/50 dark:bg-gray-800/20">
                        <div className="flex items-center gap-3 border-b border-gray-200 dark:border-gray-700 pb-4">
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-bold text-sm">۲</span>
                            <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100">فرستنده و گیرندگان پیام</h4>
                        </div>
                        
                        <div className="flex flex-col gap-4">
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">انتخاب ربات‌های ارسال‌کننده</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                                {connectedBots.map(bot => {
                                    const isSelected = selectedBots.includes(bot.id)
                                    return (
                                        <div key={bot.id} onClick={() => handleToggleBot(bot.id)} className={`flex flex-col gap-2 p-4 rounded-2xl border-2 cursor-pointer transition-all bg-white dark:bg-gray-900 ${isSelected ? 'border-indigo-500 shadow-md transform -translate-y-1' : 'border-transparent shadow-sm hover:border-gray-300'}`}>
                                            <div className="flex items-center justify-between">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bot.bg}`}><bot.icon className={`text-xl ${bot.color}`} /></div>
                                                {isSelected ? <HiCheckCircle className="text-indigo-500 text-2xl" /> : <div className="w-5 h-5 rounded-full border-2 border-gray-200 dark:border-gray-600"></div>}
                                            </div>
                                            <div className="mt-2">
                                                <span className={`block text-sm font-bold ${isSelected ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-200'}`}>{bot.name}</span>
                                                <span className="text-[11px] text-gray-400 uppercase tracking-wider">{bot.platform}</span>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 mt-4">
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                                <HiOutlineTag className="text-lg" /> ارسال برای گروه مخاطبین (تگ‌ها)
                            </label>
                            <div className="flex flex-wrap gap-2.5">
                                {targetTags.map(tag => {
                                    const isSelected = selectedTags.includes(tag.id)
                                    return (
                                        <span key={tag.id} onClick={() => handleToggleTag(tag.id)} className={`px-4 py-2 rounded-xl text-sm font-bold cursor-pointer transition-all border-2 ${isSelected ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white dark:bg-gray-900 border-transparent text-gray-600 dark:text-gray-300 hover:border-gray-300 shadow-sm'}`}>
                                            {tag.label} <span className="opacity-70 text-xs mr-1">({tag.count.toLocaleString('fa-IR')} نفر)</span>
                                        </span>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="h-px w-full bg-gray-100 dark:bg-gray-800"></div>

                    {/* 🌟 بخش ۳ */}
                    <div className="p-6 sm:p-8 flex flex-col gap-6">
                        <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-4">
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-bold text-sm">۳</span>
                            <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100">محتوای پیام</h4>
                        </div>
                        
                        <div className="flex flex-col gap-3">
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">تصویر یا ویدیو (اختیاری)</label>
                            {!hasMedia ? (
                                <div onClick={() => setHasMedia(true)} className="border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 rounded-2xl p-8 flex flex-col items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-indigo-500 hover:border-indigo-300 transition-colors cursor-pointer">
                                    <HiOutlinePhotograph className="text-4xl mb-3" />
                                    <span className="text-sm font-medium">برای آپلود بنر گرافیکی کلیک کنید</span>
                                </div>
                            ) : (
                                <div className="relative w-full h-40 rounded-2xl bg-gradient-to-tr from-indigo-400 to-purple-500 flex flex-col items-center justify-center text-white shadow-inner overflow-hidden">
                                    <HiOutlinePhotograph className="text-5xl opacity-40 mb-2" />
                                    <span className="font-bold text-sm shadow-sm z-10">poster_promo.jpg</span>
                                    <button onClick={() => setHasMedia(false)} className="absolute top-3 right-3 bg-black/40 hover:bg-black/60 text-white rounded-full px-3 py-1.5 backdrop-blur-md transition-colors text-xs font-bold z-20">تغییر یا حذف</button>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col gap-3 mt-2">
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">متن پیام شما</label>
                            <Input textArea rows={6} placeholder="سلام {name} عزیز! جشنواره تخفیف‌های ما شروع شد..." value={messageText} onChange={(e) => setMessageText(e.target.value)} className="bg-gray-50 dark:bg-gray-800/50 text-sm leading-loose" />
                            <p className="text-xs text-gray-500 mt-1">راهنما: از متغیر <code className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 px-1.5 py-0.5 rounded-md font-mono">{'{name}'}</code> برای درج نام اختصاصی هر کاربر استفاده کنید.</p>
                        </div>
                    </div>

                </Card>
            </div>

            {/* 🛑 ستون چپ: پنل تخمین و ارسال */}
            <div className="w-full lg:w-[350px] xl:w-[420px] flex flex-col gap-6 lg:mt-[68px]">
                
                {/* کارت تخمین مخاطبین */}
                <Card className="bg-gradient-to-br from-indigo-600 to-blue-700 border-0 text-white shadow-xl relative overflow-hidden rounded-3xl">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="flex items-center gap-4 mb-8 relative z-10">
                        <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md"><HiOutlineUsers className="text-2xl" /></div>
                        <div><h4 className="font-bold text-base">تخمین جامعه هدف</h4><span className="text-xs opacity-80">تعداد گیرندگان کمپین</span></div>
                    </div>
                    <div className="flex items-end gap-1.5 relative z-10">
                        <span className="text-5xl font-black tracking-tight">{estimatedReach.toLocaleString('fa-IR')}</span>
                        <span className="text-base opacity-90 mb-1.5">نفر</span>
                    </div>
                </Card>

                {/* کارت زمان‌بندی هوشمند */}
                <Card className="border-gray-200 dark:border-gray-700 flex flex-col gap-6 rounded-3xl shadow-sm">
                    <div className="flex flex-col gap-4">
                        <h4 className="text-base font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                            <HiOutlineClock className="text-indigo-500 text-xl" /> تعیین زمان اجرا
                        </h4>
                        
                        <div className="grid grid-cols-2 gap-3">
                            <div onClick={() => setSendTiming('now')} className={`flex flex-col items-center justify-center p-4 border-2 rounded-2xl cursor-pointer transition-all ${sendTiming === 'now' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-sm' : 'border-gray-100 dark:border-gray-700 hover:border-gray-300'}`}>
                                <HiOutlinePaperAirplane className={`text-2xl mb-2 ${sendTiming === 'now' ? 'text-indigo-600' : 'text-gray-400'}`} />
                                <span className={`text-sm font-bold ${sendTiming === 'now' ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-400'}`}>ارسال فوری</span>
                            </div>
                            
                            <div onClick={() => setSendTiming('scheduled')} className={`flex flex-col items-center justify-center p-4 border-2 rounded-2xl cursor-pointer transition-all ${sendTiming === 'scheduled' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-sm' : 'border-gray-100 dark:border-gray-700 hover:border-gray-300'}`}>
                                <HiOutlineCalendar className={`text-2xl mb-2 ${sendTiming === 'scheduled' ? 'text-indigo-600' : 'text-gray-400'}`} />
                                <span className={`text-sm font-bold ${sendTiming === 'scheduled' ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-400'}`}>زمان‌بندی آینده</span>
                            </div>
                        </div>

                        {/* 🌟 تقویم پاپ‌آپ هوشمند و محدود شده */}
                        {sendTiming === 'scheduled' && (
                            <div className="mt-2 animate-[fadeIn_0.3s_ease-out] relative" ref={datePickerRef}>
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 block">انتخاب تاریخ و زمان دقیق</label>
                                
                                <div 
                                    onClick={() => setIsPickerOpen(!isPickerOpen)} 
                                    className="w-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-4 flex justify-between items-center cursor-pointer hover:border-indigo-400 transition-colors shadow-sm"
                                >
                                    <div className="flex items-center gap-3 text-sm font-bold text-gray-800 dark:text-gray-200">
                                        <div className="p-1.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg"><HiOutlineCalendar className="text-indigo-600 text-lg" /></div>
                                        {scheduleDay.toLocaleString('fa-IR')} {jalaliMonths[scheduleMonth]} {scheduleYear.toLocaleString('fa-IR')}
                                    </div>
                                    <div className="flex items-center gap-3 text-sm font-bold text-gray-800 dark:text-gray-200 border-r border-gray-200 dark:border-gray-700 pr-4">
                                        <HiOutlineClock className="text-amber-500 text-xl" />
                                        {scheduleHour}:{scheduleMinute}
                                    </div>
                                </div>

                                {isPickerOpen && (
                                    <div className="absolute top-full right-0 mt-3 w-full bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-3xl shadow-2xl z-50 p-6 animate-[fadeIn_0.2s_ease-out]">
                                        
                                        <div className="flex justify-center gap-3 mb-5 pb-5 border-b border-gray-100 dark:border-gray-700">
                                            {availableYears.map(year => (
                                                <button key={year} onClick={() => setScheduleYear(year)} className={`px-5 py-2 rounded-xl text-sm font-bold transition-colors ${year === scheduleYear ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-50 dark:bg-gray-900 text-gray-600 hover:bg-gray-100'}`}>
                                                    سال {year.toLocaleString('fa-IR')}
                                                </button>
                                            ))}
                                        </div>

                                        <div className="grid grid-cols-3 gap-2 mb-6">
                                            {getAvailableMonths().map(month => (
                                                <button key={month.index} onClick={() => setScheduleMonth(month.index)} className={`py-2 rounded-xl text-xs font-bold transition-all border-2 ${month.index === scheduleMonth ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border-indigo-500' : 'bg-transparent text-gray-600 dark:text-gray-400 border-transparent hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                                                    {month.name}
                                                </button>
                                            ))}
                                        </div>

                                        <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl">
                                            <div className="grid grid-cols-7 gap-1">
                                                {getAvailableDays().map(day => (
                                                    <button key={day} onClick={() => setScheduleDay(day)} className={`w-9 h-9 mx-auto rounded-full text-sm font-bold flex items-center justify-center transition-all ${day === scheduleDay ? 'bg-indigo-600 text-white shadow-md transform scale-110' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                                                        {day.toLocaleString('fa-IR')}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-center gap-4 mt-6 pt-5 border-t border-gray-100 dark:border-gray-700">
                                            <div className="flex flex-col items-center gap-1.5">
                                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">ساعت</span>
                                                <select value={scheduleHour} onChange={(e) => setScheduleHour(e.target.value)} className="bg-gray-50 dark:bg-gray-900 border-none rounded-xl text-2xl font-black text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 outline-none text-center appearance-none px-4 py-2 cursor-pointer w-20 shadow-sm">
                                                    {Array.from({length: 24}, (_, i) => String(i).padStart(2, '0')).map(h => <option key={h} value={h}>{h}</option>)}
                                                </select>
                                            </div>
                                            <span className="text-2xl font-black text-gray-300 dark:text-gray-600 mb-1">:</span>
                                            <div className="flex flex-col items-center gap-1.5">
                                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">دقیقه</span>
                                                <select value={scheduleMinute} onChange={(e) => setScheduleMinute(e.target.value)} className="bg-gray-50 dark:bg-gray-900 border-none rounded-xl text-2xl font-black text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 outline-none text-center appearance-none px-4 py-2 cursor-pointer w-20 shadow-sm">
                                                    {Array.from({length: 60}, (_, i) => String(i).padStart(2, '0')).map(m => <option key={m} value={m}>{m}</option>)}
                                                </select>
                                            </div>
                                        </div>

                                        <Button size="md" variant="solid" className="w-full mt-6 bg-indigo-600 text-sm font-bold rounded-xl" onClick={() => setIsPickerOpen(false)}>
                                            تایید و ثبت زمان
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <Button variant="solid" size="lg" className="w-full bg-gray-900 hover:bg-black dark:bg-white dark:text-gray-900 font-bold shadow-xl rounded-2xl h-14" loading={isSubmitting} onClick={handleSendCampaign}>
                        {sendTiming === 'now' ? '🚀 اجرای کمپین (همین الان)' : '📅 ثبت در صف زمان‌بندی'}
                    </Button>
                    
                </Card>
            </div>
            <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
        </div>
    )
}

export default CampaignBuilder