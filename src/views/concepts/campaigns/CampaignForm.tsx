import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { 
    HiOutlinePaperAirplane, HiOutlineClock, HiOutlineChatAlt2,
    HiOutlineDocumentText, HiOutlinePhotograph, HiOutlineVideoCamera, 
    HiOutlineMicrophone, HiOutlineDocument, HiOutlineLocationMarker, HiOutlineViewGridAdd,
    HiOutlineArrowRight, HiOutlineCalendar
} from 'react-icons/hi'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'

import { apiCreateCampaign, apiUpdateCampaign, apiGetCampaignById } from '@/services/CampaignService'
import { apiGetBots, BotResponse } from '@/services/botservice'
import { MessageType } from './types'
import MediaUploader from './components/MediaUploader'
import { useSessionUser } from '@/store/authStore' 
import ModernDropdown from '@/components/ui/ModernDropDown/ModernDropdown'

const platformCapabilities: Record<string, MessageType[]> = {
    telegram: [1, 2, 3, 4, 5, 6, 8],
    whatsapp: [1, 2, 3, 4, 5, 6, 7, 8],
    instagram: [1, 2, 3],
    bale: [1, 2, 3, 4, 5],
    rubika: [1, 2, 3, 4, 5],
    web: [1, 2, 3]
}

const jalaliMonths = [
    { value: 1, label: 'فروردین' }, { value: 2, label: 'اردیبهشت' }, { value: 3, label: 'خرداد' },
    { value: 4, label: 'تیر' }, { value: 5, label: 'مرداد' }, { value: 6, label: 'شهریور' },
    { value: 7, label: 'مهر' }, { value: 8, label: 'آبان' }, { value: 9, label: 'آذر' },
    { value: 10, label: 'دی' }, { value: 11, label: 'بهمن' }, { value: 12, label: 'اسفند' }
];

const gregorianToJalali = (gy: number, gm: number, gd: number) => {
    const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
    const gy2 = (gm > 2) ? (gy + 1) : gy;
    let days = 355666 + (365 * gy) + Math.floor((gy2 + 3) / 4) - Math.floor((gy2 + 99) / 100) + Math.floor((gy2 + 399) / 400) + gd + g_d_m[gm - 1];
    let jy = -1595 + (33 * Math.floor(days / 12053));
    days %= 12053;
    jy += 4 * Math.floor(days / 1461);
    days %= 1461;
    if (days > 365) { jy += Math.floor((days - 1) / 365); days = (days - 1) % 365; }
    let jm = (days < 186) ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30);
    let jd = 1 + ((days < 186) ? (days % 31) : ((days - 186) % 30));
    return { jy, jm, jd };
}

const messageTypeConfigs = [
    { id: MessageType.Text, label: 'متن ساده', icon: HiOutlineDocumentText, color: 'text-gray-600', activeBg: 'bg-gray-100 dark:bg-gray-800' },
    { id: MessageType.Image, label: 'تصویر', icon: HiOutlinePhotograph, color: 'text-blue-500', activeBg: 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800' },
    { id: MessageType.Video, label: 'ویدیو', icon: HiOutlineVideoCamera, color: 'text-rose-500', activeBg: 'bg-rose-50 dark:bg-rose-900/30 border-rose-200 dark:border-rose-800' },
    { id: MessageType.Audio, label: 'صوت (Voice)', icon: HiOutlineMicrophone, color: 'text-amber-500', activeBg: 'bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800' },
    { id: MessageType.Document, label: 'فایل سند', icon: HiOutlineDocument, color: 'text-emerald-500', activeBg: 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800' },
    // { id: MessageType.Location, label: 'موقعیت مکانی', icon: HiOutlineLocationMarker, color: 'text-red-500', activeBg: 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800' },
    // { id: MessageType.Interactive, label: 'دکمه‌دار', icon: HiOutlineViewGridAdd, color: 'text-indigo-500', activeBg: 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800' },
]

const jalaliToGregorian = (jy: number, jm: number, jd: number) => { 
    const jDaysInMonth = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];
    let gy = jy + 621; let days = 0;
    for (let i = 0; i < jm - 1; i++) days += jDaysInMonth[i];
    days += jd;
    let leapYear = (gy % 4 === 0 && gy % 100 !== 0) || (gy % 400 === 0);
    const gDaysInMonth = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    let gm = 0, gd = 0; let remain = days + 79;
    if (remain > (leapYear ? 366 : 365)) { remain -= (leapYear ? 366 : 365); gy++; }
    for (let i = 0; i < 12; i++) { if (remain <= gDaysInMonth[i]) { gm = i + 1; gd = remain; break; } remain -= gDaysInMonth[i]; }
    return new Date(gy, gm - 1, gd);
}

const CampaignCreate = () => {
    const navigate = useNavigate()
    const { user } = useSessionUser() 
    const { id } = useParams()
    const isEditMode = !!id
    const companyId = user.companyId ?? ''

    const [formData, setFormData] = useState({
        campaignName: '',
        selectedBotId: '',
        messageType: MessageType.Text,
        mediaUrl: '',
        messageText: ''
    })
    
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [bots, setBots] = useState<BotResponse[]>([])
    const [isLoadingData, setIsLoadingData] = useState(true)
    const [isFetchingData, setIsFetchingData] = useState(isEditMode)

    const today = new Date();
    const todayJalali = gregorianToJalali(today.getFullYear(), today.getMonth() + 1, today.getDate());

    const [sendTiming, setSendTiming] = useState<'now' | 'scheduled'>('now')
    const [scheduleYear] = useState<number>(todayJalali.jy) // سال پویا
    const [scheduleDay, setScheduleDay] = useState<number>(todayJalali.jd)
    const [scheduleMonth, setScheduleMonth] = useState<number>(todayJalali.jm)
    const [scheduleHour, setScheduleHour] = useState<string>(String(today.getHours()).padStart(2, '0'))
    const [scheduleMinute, setScheduleMinute] = useState<string>(String(today.getMinutes()).padStart(2, '0'))


    useEffect(() => {
        const fetchBots = async () => {
            setIsLoadingData(true)
            try {
                const botsResult: any = await apiGetBots()
                const activeBots = (botsResult?.items || botsResult?.data || []).filter((b: any) => b.isActive);
                setBots(activeBots);
                if (activeBots.length > 0) updateField('selectedBotId', activeBots[0].id);
            } catch (error) {
                console.error("خطا", error)
            } finally {
                setIsLoadingData(false)
            }
        }
        fetchBots()
    }, [])

    // تشخیص پلتفرم ربات انتخاب شده برای محدودسازی نوع پیام
    const activeBotPlatform = useMemo(() => {
        const bot = bots.find(b => b.id === formData.selectedBotId);
        
        // اگر رباتی پیدا نشد، unknown برگردان
        if (!bot) return 'unknown';

        const rawPlatform = bot.platform;

        // اگر پلتفرم به صورت کلمه متنی انگلیسی آمده بود
        if (typeof rawPlatform === 'string' && isNaN(Number(rawPlatform))) {
            return rawPlatform.toLowerCase();
        }

        // تبدیل ایمن به عدد برای جلوگیری از خطای تایپ‌اسکریپت
        const platformId = Number(rawPlatform);

        // 🌟 تطابق دقیق با Enum بک‌اند شما (PlatformType)
        switch (platformId) {
            case 1: return 'whatsapp';
            case 2: return 'telegram';
            case 3: return 'instagram';
            case 4: return 'web';
            case 5: return 'rubika';
            case 6: return 'bale';
            default: return 'unknown';
        }
    }, [bots, formData.selectedBotId])


    const supportedMessageTypes = useMemo(() => {
        return platformCapabilities[activeBotPlatform] || [MessageType.Text];
    }, [activeBotPlatform])

    // اگر ربات تغییر کرد و نوع پیام فعلی پشتیبانی نمی‌شد، برگرد روی متن ساده
    useEffect(() => {
        if (!supportedMessageTypes.includes(formData.messageType)) {
            updateField('messageType', MessageType.Text)
        }
    }, [activeBotPlatform, supportedMessageTypes, formData.messageType])


    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                // ۱. گرفتن لیست ربات‌ها
                const botsResult: any = await apiGetBots()
                const activeBots = (botsResult?.items || botsResult?.data || []).filter((b: any) => b.isActive);
                setBots(activeBots);

                // ۲. اگر حالت ویرایش است، دیتای کمپین را بگیر و فرم را پر کن
                if (isEditMode) {
                    const campaignResponse: any = await apiGetCampaignById(id);
                    const campaign = campaignResponse?.data || campaignResponse;

                    setFormData({
                        campaignName: campaign.name || '',
                        selectedBotId: campaign.botId || '',
                        messageType: campaign.messageType || MessageType.Text,
                        mediaUrl: campaign.mediaUrl || '',
                        messageText: campaign.textContent || ''
                    });

                    if (campaign.scheduledAt) {
                        setSendTiming('scheduled');
                        const dateObj = new Date(campaign.scheduledAt);
                        const jDate = gregorianToJalali(dateObj.getFullYear(), dateObj.getMonth() + 1, dateObj.getDate());
                        
                        setScheduleDay(jDate.jd);
                        setScheduleMonth(jDate.jm);
                        setScheduleHour(String(dateObj.getHours()).padStart(2, '0'));
                        setScheduleMinute(String(dateObj.getMinutes()).padStart(2, '0'));
                    }
                } else {
                    if (activeBots.length > 0) updateField('selectedBotId', activeBots[0].id);
                }
            } catch (error) {
                toast.push(<Notification type="danger" title="خطا">خطا در دریافت اطلاعات</Notification>, { placement: 'top-center' })
            } finally {
                setIsFetchingData(false)
            }
        }
        
        fetchInitialData()
    }, [id, isEditMode])

    const updateField = (field: string, value: any) => setFormData(prev => ({ ...prev, [field]: value }))

    const handleSubmit = async () => {
        const { campaignName, selectedBotId, messageType, messageText, mediaUrl } = formData;

        if (!campaignName.trim() || !selectedBotId) {
            return toast.push(<Notification type="danger" title="خطا">لطفاً نام کمپین و فرستنده را مشخص کنید.</Notification>, { placement: 'top-center' })
        }

        if (messageType !== MessageType.Text && !mediaUrl.trim()) {
            return toast.push(<Notification type="warning" title="توجه">لطفاً لینک فایل/مدیا را وارد کنید.</Notification>, { placement: 'top-center' })
        }

        let finalScheduledAt = null;
        if (sendTiming === 'scheduled') {
        const gDate = jalaliToGregorian(scheduleYear, scheduleMonth, scheduleDay);
            gDate.setHours(parseInt(scheduleHour, 10));
            gDate.setMinutes(parseInt(scheduleMinute, 10));
            finalScheduledAt = gDate.toISOString();
        }

        setIsSubmitting(true)
        try {
            if(!companyId) return;
            const payload = {
                companyId,
                botId: selectedBotId, name: campaignName,
                messageType: messageType,
                textContent: messageText || null, 
                mediaUrl: mediaUrl || null,
                scheduledAt: finalScheduledAt
            };
            if (isEditMode) {
                await apiUpdateCampaign(id, payload);
                toast.push(<Notification type="success" title="موفق">تغییرات کمپین ذخیره شد.</Notification>, { placement: 'top-center' })
                navigate(`/concepts/campaigns/${id}/contacts`); // هدایت به مرحله ۲
            } 
            else {
                const result = await apiCreateCampaign(payload);
                const newCampaignId = (result as any)?.data || result;
                
                toast.push(<Notification type="success" title="پیش‌نویس ذخیره شد">در مرحله بعد گیرندگان را مشخص کنید.</Notification>, { placement: 'top-center' })
                navigate(`/concepts/campaigns/${newCampaignId}/contacts`);
            }
        } catch (error: any) {
            const validationErrors = error?.response?.data?.errors;
            let errorMessage = error?.response?.data?.Message || 'خطا در ارتباط با سرور';

            if (validationErrors) {
                // استخراج تمام مقادیر از دیکشنری errors و چسباندن آن‌ها به هم
                errorMessage = Object.values(validationErrors).flat().join('\n');
            }

            toast.push(
                <Notification type="danger" title="خطا در اطلاعات ورودی">
                    {/* استفاده از whitespace-pre-line برای نمایش اینترها (خطوط جدید) در متن ارور */}
                    <div className="whitespace-pre-line text-sm leading-relaxed mt-1 font-bold">
                        {errorMessage}
                    </div>
                </Notification>, 
                { placement: 'top-center' }
            )
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="w-full max-w-4xl mx-auto pb-12 animate-[fadeIn_0.3s_ease-out]" dir="rtl">
            <div className="bg-white dark:bg-gray-900 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800 p-6 sm:p-10 flex flex-col gap-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                            {isEditMode ? 'ویرایش تنظیمات پیام' : 'ایجاد کمپین جدید'}
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            مرحله اول: تنظیمات پایه و محتوای پیام را مشخص کنید.
                        </p>
                    </div>

                    <Button 
                        variant="plain" 
                        icon={<HiOutlineArrowRight className="text-xl" />} 
                        onClick={() => navigate('/concepts/CampaignList')} // آدرس لیست کمپین‌ها
                        className="text-gray-500 hover:text-gray-800 hover:bg-gray-100 dark:hover:text-white dark:hover:bg-gray-800 font-bold"
                    >
                        بازگشت به لیست
                    </Button>
                </div>

                {/* بخش ۱: نام کمپین */}
                <div>
                    <input 
                        type="text" 
                        placeholder="نام کمپین خود را بنویسید (مثلاً: تخفیف پاییزه)..." 
                        value={formData.campaignName}
                        onChange={(e) => updateField('campaignName', e.target.value)}
                        className="w-full text-2xl sm:text-4xl font-black text-gray-900 dark:text-gray-100 placeholder-gray-300 dark:placeholder-gray-700 bg-transparent border-none outline-none focus:ring-0 p-0"
                    />
                </div>

                {/* بخش ۲: تنظیمات پایه (ربات و زمان) */}
                <div className="flex flex-col gap-4 bg-gray-50 dark:bg-gray-800/50 p-4 sm:p-5 rounded-3xl border border-gray-100 dark:border-gray-700/50">
                    <div className="flex items-start gap-3 bg-white dark:bg-gray-900 px-5 py-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                        <HiOutlineChatAlt2 className="text-2xl text-indigo-500 flex-shrink-0 mt-1" />
                        <div className="flex flex-col w-full">
                            <span className="text-[10px] font-bold text-gray-400 tracking-wider mb-1 px-2">فرستنده پیام</span>
                            {isLoadingData ? (
                                <span className="text-sm font-bold text-gray-500 px-2 mt-1.5">در حال دریافت...</span>
                            ) : (
                                <div className="w-full mt-1">
                                    <ModernDropdown 
                                        align="right" // 🌟 فقط همین یک خط را به اینجا اضافه کنید
                                        value={formData.selectedBotId || ''}
                                        onChange={(val) => updateField('selectedBotId', val)}
                                        options={
                                            bots.length > 0 
                                            ? bots.map(b => ({ 
                                                value: b.id, 
                                                label: `${b.name} (${b.platform === '1' ? 'واتساپ' : b.platform === '2' ? 'تلگرام' : b.platform === '3' ? 'اینستاگرام' : b.platform})`
                                            }))
                                            : [{ value: '', label: 'بدون ربات مجاز' }]
                                        }
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col bg-white dark:bg-gray-900 px-5 py-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 transition-all">
                        <div className="flex items-start gap-3">
                            <HiOutlineClock className="text-3xl text-amber-500 flex-shrink-0 mt-1" />
                            <div className="flex flex-col w-full justify-center">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-gray-400 tracking-wider">زمان اجرا</span>
                                    <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-800/50 p-1 rounded-xl border border-gray-100 dark:border-gray-700/50">
                                        <button 
                                            type="button"
                                            onClick={() => setSendTiming('now')} 
                                            className={`text-sm font-bold px-4 py-1.5 rounded-lg transition-all ${sendTiming === 'now' ? 'bg-white shadow-sm text-gray-900 dark:bg-gray-700 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                                        >
                                            فوری
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => setSendTiming('scheduled')} 
                                            className={`text-sm font-bold px-4 py-1.5 rounded-lg transition-all ${sendTiming === 'scheduled' ? 'bg-white shadow-sm text-gray-900 dark:bg-gray-700 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                                        >
                                            زمان‌بندی
                                        </button>
                                    </div>
                                </div>
                                
                                {/* متن کوتاه وقتی روی فوری است */}
                                {sendTiming === 'now' && (
                                    <span className="text-sm font-bold text-gray-800 dark:text-gray-200 mt-2">ارسال بلافاصله پس از تایید گیرندگان و شروع کمپین</span>
                                )}
                            </div>
                        </div>

                        {sendTiming === 'scheduled' && (
                            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 animate-[fadeIn_0.3s_ease-out]">
                                <div className="flex flex-col sm:flex-row gap-4">
                                    
                                    {/* انتخاب تاریخ */}
                                    <div className="flex-1">
                                        <label className="flex items-center gap-1.5 text-xs font-bold text-gray-500 mb-2">
                                            <HiOutlineCalendar className="text-indigo-500 text-lg" />
                                            تاریخ ارسال
                                        </label>
                                        <div className="flex items-center bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-1.5 border border-gray-200 dark:border-gray-700 transition-colors">
                                            <ModernDropdown 
                                                className="flex-1"
                                                value={scheduleDay} 
                                                onChange={(val) => setScheduleDay(Number(val))} 
                                                options={Array.from({length: 31}, (_, i) => ({ value: i + 1, label: i + 1 }))}
                                            />
                                            <span className="text-gray-300 dark:text-gray-600 px-1">/</span>
                                            <ModernDropdown 
                                                className="flex-[1.5]"
                                                value={scheduleMonth} 
                                                onChange={(val) => setScheduleMonth(Number(val))} 
                                                options={jalaliMonths}
                                            />
                                        </div>
                                    </div>

                                    {/* انتخاب ساعت */}
                                    <div className="flex-1">
                                        <label className="flex items-center gap-1.5 text-xs font-bold text-gray-500 mb-2">
                                            <HiOutlineClock className="text-amber-500 text-lg" />
                                            ساعت ارسال
                                        </label>
                                        <div className="flex items-center bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-1.5 border border-gray-200 dark:border-gray-700 transition-colors" dir="ltr">
                                            <ModernDropdown 
                                                className="flex-1"
                                                value={scheduleHour} 
                                                onChange={(val) => setScheduleHour(String(val))} 
                                                options={Array.from({length: 24}, (_, i) => ({ value: String(i).padStart(2, '0'), label: String(i).padStart(2, '0') }))}
                                            />
                                            <span className="text-gray-400 font-black animate-pulse px-1">:</span>
                                            <ModernDropdown 
                                                className="flex-1"
                                                value={scheduleMinute} 
                                                onChange={(val) => setScheduleMinute(String(val))} 
                                                options={Array.from({length: 60}, (_, i) => ({ value: String(i).padStart(2, '0'), label: String(i).padStart(2, '0') }))}
                                            />
                                        </div>
                                    </div>

                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col gap-4 mt-2">
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100">طراحی محتوای پیام</h4>
                        
                        {formData.mediaUrl && formData.messageType !== MessageType.Text && (
                            <span className="text-xs font-bold bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 px-3 py-1 rounded-lg">
                                فایل ضمیمه شد
                            </span>
                        )}
                    </div>
                    
                    {!formData.mediaUrl && (
                        <div className="flex flex-wrap gap-2 animate-[fadeIn_0.3s_ease-out]">
                            {messageTypeConfigs.map(config => {
                                const isSupported = supportedMessageTypes.includes(config.id);
                                const isActive = formData.messageType === config.id;
                                const Icon = config.icon;

                                if (!isSupported) return null;

                                return (
                                    <button
                                        key={config.id}
                                        type="button"
                                        onClick={() => updateField('messageType', config.id)}
                                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                                            isActive 
                                            ? `border-transparent shadow-sm ${config.activeBg} ${config.color}`
                                            : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300 dark:hover:border-gray-600'
                                        }`}
                                    >
                                        <Icon className="text-lg" />
                                        {config.label}
                                    </button>
                                )
                            })}
                        </div>
                    )}

                    {/* ورودی داینامیک مدیا و متن کپشن */}
                    <div className="mt-2">
                        <MediaUploader 
                            companyId={companyId}
                            messageType={formData.messageType}
                            mediaUrl={formData.mediaUrl}
                            setMediaUrl={(url) => updateField('mediaUrl', url)}
                        />
                        
                        <Input 
                            textArea 
                            rows={formData.messageType === MessageType.Text ? 8 : 4}
                            placeholder={formData.messageType === MessageType.Text ? "سلام {name} عزیز! متن پیام خود را اینجا بنویسید..." : "کپشن یا توضیحات فایل را اینجا بنویسید (اختیاری)..."} 
                            value={formData.messageText} 
                            onChange={(e) => updateField('messageText', e.target.value)} 
                            className="bg-gray-50 dark:bg-gray-800 border-none shadow-inner text-sm leading-relaxed resize-none p-5" 
                        />
                    </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-800 mt-2">
                    <Button 
                        variant="solid" 
                        size="lg" 
                        className="w-full sm:w-auto px-10 bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-200 dark:shadow-none rounded-2xl h-14" 
                        loading={isSubmitting} 
                        onClick={handleSubmit} 
                        icon={<HiOutlinePaperAirplane className="rotate-90 text-xl" />}
                    >
                        {isEditMode ? 'بروزرسانی و ویرایش گیرندگان' : 'ذخیره و انتخاب گیرندگان'}
                    </Button>

                    <Button 
                        variant="plain" size="lg" 
                        onClick={() => navigate('/concepts/CampaignList')}
                        className="w-full sm:w-auto px-6 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 font-bold h-14 rounded-2xl"
                    >
                        انصراف
                    </Button>
                </div>

            </div>
        </div>
    )
}

export default CampaignCreate