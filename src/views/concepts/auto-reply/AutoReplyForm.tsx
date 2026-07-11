import { useState, useEffect } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useSessionUser } from '@/store/authStore' 
import { 
    HiArrowRight, HiOutlineSave, HiOutlineTrash, HiOutlineEye, HiPlus, HiX,
    HiOutlinePhotograph, HiOutlineVideoCamera, HiOutlineMicrophone, HiOutlineDocumentText, HiOutlineMenuAlt2, HiOutlineRefresh, HiArrowLeft
} from 'react-icons/hi'
import { FaTelegramPlane, FaInstagram, FaWhatsapp, FaGlobe, FaCloudUploadAlt, FaPlayCircle, FaRobot ,FaFilePdf, FaFileWord, FaFileExcel, FaFileArchive, FaFileAlt} from 'react-icons/fa' 
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { FormItem, Form } from '@/components/ui/Form'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import Spinner from '@/components/ui/Spinner'
import { apiGetActiveBotsByPlatform } from '@/services/botService'
import { apiCreateAutoReplies, apiGetAutoReply ,apiUpdateAutoReply} from '@/services/autoReplyService'
import { apiUploadMedia , apiDeleteMedia } from '@/services/mediaService'
import appConfig from '@/configs/app.config'


const ALLOWED_EXTENSIONS: Record<ReplyType, string[]> = {
    text: [],
    image: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    video: ['.mp4', '.mov', '.avi', '.mkv'],
    voice: ['.mp3', '.wav', '.ogg', '.m4a'],
    file: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt', '.zip', '.rar']
};

const getFileIconDetail = (fileName?: string) => {
    const ext = fileName?.split('.').pop()?.toLowerCase() || '';

    switch (ext) {
        case 'pdf': 
            return { icon: FaFilePdf, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/30' };
        case 'doc':
        case 'docx': 
            return { icon: FaFileWord, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/30' };
        case 'xls':
        case 'xlsx': 
            return { icon: FaFileExcel, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/30' };
        case 'zip':
        case 'rar': 
            return { icon: FaFileArchive, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/30' };
        default: 
            return { icon: FaFileAlt, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/30' };
    }
}

const getAcceptAttribute = (type: ReplyType) => {
    switch (type) {
        case 'image': return 'image/*';
        case 'video': return 'video/*';
        case 'voice': return 'audio/*';
        case 'file': return ALLOWED_EXTENSIONS.file.join(',');
        default: return '*';
    }
};

const validationSchema = z.object({
    title: z.string({ required_error: 'عنوان الزامی است' }).min(3, 'حداقل ۳ کاراکتر'),
    botId: z.string().optional(), // در حالت سراسری می‌تواند خالی باشد
    priority: z.number().min(0, 'اولویت باید عدد مثبت باشد').default(0)
})

type AutoReplyFormSchema = z.infer<typeof validationSchema>

type TriggerItem = {
    id: string;
    value: string;
    matchType: 'contains' | 'exact';
}

type ReplyType = 'text' | 'image' | 'video' | 'voice' | 'file'
type ReplyMessage = { 
    id: string; 
    type: ReplyType; 
    content: string ; 
    fileName?: string; 
    fileSize?: number;
    caption?: string; 
    isUploading?: boolean;
}

const PLATFORM_ENUMS: Record<string, number> = {
    'WhatsApp': 1, 'Telegram': 2, 'Instagram': 3, 'Web': 4, 'Rubika': 5, 'Bale': 6
}

const TRIGGER_TYPE_MAP: Record<string, number> = { 'exact': 1, 'contains': 2 }
const REPLY_TYPE_MAP: Record<string, number> = { 'text': 1, 'image': 2, 'video': 3, 'file': 4, 'voice': 5 }

// مپ معکوس برای بازگرداندن اعداد سرور به استرینگ‌های فرانت‌اند
const REVERSE_TRIGGER_MAP: Record<number, 'exact' | 'contains'> = { 1: 'exact', 2: 'contains' }
const REVERSE_REPLY_MAP: Record<number, ReplyType> = { 1: 'text', 2: 'image', 3: 'video', 4: 'file', 5: 'voice' }

const platforms = [
    { id: 'Telegram', name: 'تلگرام', icon: FaTelegramPlane, color: 'text-sky-500', bg: 'bg-sky-50 dark:bg-sky-900/20', border: 'border-sky-200 dark:border-sky-800' },
    { id: 'WhatsApp', name: 'واتس‌اپ', icon: FaWhatsapp, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-200 dark:border-green-800' },
    { id: 'Instagram', name: 'اینستاگرام', icon: FaInstagram, color: 'text-pink-600', bg: 'bg-pink-50 dark:bg-pink-900/20', border: 'border-pink-200 dark:border-pink-800' },
    { id: 'Web', name: 'وب‌سایت', icon: FaGlobe, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/20', border: 'border-indigo-200 dark:border-indigo-800' },
]

const replyTypes = [
    { value: 'text', label: 'متن', icon: HiOutlineMenuAlt2 },
    { value: 'image', label: 'تصویر', icon: HiOutlinePhotograph },
    { value: 'video', label: 'ویدیو', icon: HiOutlineVideoCamera },
    { value: 'voice', label: 'صدا', icon: HiOutlineMicrophone },
    { value: 'file', label: 'فایل', icon: HiOutlineDocumentText },
]

const getPlatformIconAndColors = (channel?: string) => {
    switch (channel) {
        case 'Telegram': return { icon: FaTelegramPlane, color: 'text-sky-500', bg: 'bg-sky-100', border: 'border-sky-200' }
        case 'Web': return { icon: FaGlobe, color: 'text-indigo-500', bg: 'bg-indigo-100', border: 'border-indigo-200' }
        case 'Instagram': return { icon: FaInstagram, color: 'text-pink-600', bg: 'bg-pink-100', border: 'border-pink-200' }
        case 'WhatsApp': return { icon: FaWhatsapp, color: 'text-green-500', bg: 'bg-green-100', border: 'border-green-200' }
        default: return { icon: FaGlobe, color: 'text-gray-500', bg: 'bg-gray-100', border: 'border-gray-200' }
    }
}
// این آدرس را بر اساس پورت بک‌اند خودت تنظیم کن (یا از فایل env. بخوان)
debugger
const backendBaseUrl = appConfig.apiPrefix; 

const getFullMediaUrl = (url: string | File) => {
    if (!url || typeof url !== 'string') return '';
    if (url.startsWith('http') || url.startsWith('blob:')) return url;
    
    // اگر آدرس نسبی بود، بک‌اند را به آن می‌چسبانیم
    return `${backendBaseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
};

const AutoReplyForm = () => {
    const navigate = useNavigate()
    const { id } = useParams() 
    const location = useLocation()
    const isEditMode = Boolean(id)
    const { user, setUser } = useSessionUser() 
    const passedState = location.state as { botPlatform?: string, botName?: string } | null;

    const [isLoading, setIsLoading] = useState<boolean>(isEditMode)
    const [isSubmitting, setSubmitting] = useState<boolean>(false)
    
    const [selectedPlatform, setSelectedPlatform] = useState<string>('')
    const [fetchedBots, setFetchedBots] = useState<any[]>([])
    const [isFetchingBots, setIsFetchingBots] = useState<boolean>(false)

    const [triggers, setTriggers] = useState<TriggerItem[]>([])
    const [keywordInput, setKeywordInput] = useState<string>('')
    const [currentMatchType, setCurrentMatchType] = useState<'contains' | 'exact'>('contains')
    const [keywordError, setKeywordError] = useState<string>('')

    const [replies, setReplies] = useState<ReplyMessage[]>([{ id: Date.now().toString(), type: 'text', content: '' , fileName:'' , caption:''}])
    const [repliesError, setRepliesError] = useState<string>('')
    const [previewMessage, setPreviewMessage] = useState<ReplyMessage | null>(null)

    const { handleSubmit, formState: { errors }, control, reset, watch, setValue } = useForm<AutoReplyFormSchema>({
        resolver: zodResolver(validationSchema),
        defaultValues: { botId: '', priority: 0 } 
    })

    const selectedBotId = watch('botId')
    const activeBot = fetchedBots.find(b => b.id === selectedBotId)

    const [previewFile, setPreviewFile] = useState<{
        file: File | null;
        previewUrl: string;
        replyId: string;
        type: ReplyType;
        isViewMode?: boolean;
        fileName?: string;
        fileSize?: number;
        caption?: string;
    } | null>(null);

    const [isUploadingToCloud, setIsUploadingToCloud] = useState(false);

    useEffect(() => {
        if (!selectedPlatform) {
            setFetchedBots([])
            return
        }
        if (isEditMode && selectedBotId) return

        const fetchBotsForPlatform = async () => {
            setIsFetchingBots(true)
            try {
                const platform = PLATFORM_ENUMS[selectedPlatform];
                const response = await apiGetActiveBotsByPlatform(platform)
                const platformBots = response
                    .filter((b: any) => b.platformName === selectedPlatform && b.isActive)
                    .map((b: any) => ({ ...b, ...getPlatformIconAndColors(b.platformName) }))
                setFetchedBots(platformBots)
            } catch (error) {
                toast.push(<Notification title="خطا" type="danger">خطا در دریافت لیست ربات‌ها.</Notification>, { placement: 'top-center' })
            } finally {
                setIsFetchingBots(false)
            }
        }
        fetchBotsForPlatform()
    }, [selectedPlatform, isEditMode, selectedBotId])

    useEffect(() => {
        if (isEditMode && id) {
            const fetchRuleDetails = async () => {
                setIsLoading(true)
                try {
                    const ruleData: any = await apiGetAutoReply(id)

                    // مپ کردن کلمات کلیدی
                    if (ruleData.triggers && ruleData.triggers.length > 0) {
                        setTriggers(ruleData.triggers.map((t: any) => ({
                            id: t.id,
                            value: t.value,
                            matchType: REVERSE_TRIGGER_MAP[t.matchType] || 'contains'
                        })))
                    } else {
                        setTriggers([])
                    }

                    // مپ کردن پاسخ‌ها
                    if (ruleData.responses && ruleData.responses.length > 0) {
                        debugger
                        setReplies(ruleData.responses.map((r: any) => ({
                            id: r.id,
                            type: REVERSE_REPLY_MAP[r.replyType] || 'text',
                            content: r.content,
                            fileName: r.fileName === null ? 'فایل پیوست شده' : r.fileName,
                            fileSize: r.fileSize || undefined,
                            caption: r.caption || undefined
                        })))
                    } else {
                        setReplies([{ id: Date.now().toString(), type: 'text', content: '' }])
                    }

                    if (ruleData.botId) {
                        const platformToSet = ruleData.botPlatform || passedState?.botPlatform;
                        const botNameToSet = ruleData.botName || passedState?.botName || 'ربات متصل';
                        if (platformToSet) {
                            setSelectedPlatform(platformToSet);
                            setFetchedBots(prev => {
                                if (!prev.find(b => b.id === ruleData.botId)) {
                                    return [...prev, {
                                        id: ruleData.botId,
                                        name: botNameToSet,
                                        channel: platformToSet,
                                        ...getPlatformIconAndColors(platformToSet)
                                    }]
                                }
                                return prev
                            });
                        }
                    } else {
                        // اگر سراسری بود، پلتفرم و ربات خالی می‌ماند
                        setSelectedPlatform('') 
                    }

                    // پر کردن مقادیر فرم
                    reset({ 
                        title: ruleData.name || ruleData.title || '', 
                        botId: ruleData.botId || '', 
                        priority: ruleData.priority || 0 
                    })

                } catch (error) {
                    toast.push(<Notification title="خطا" type="danger">خطا در دریافت اطلاعات قانون.</Notification>, { placement: 'top-center' })
                    navigate('/concepts/auto-reply/list')
                } finally {
                    setIsLoading(false)
                }
            }
            fetchRuleDetails()
        }
    }, [id, isEditMode, reset, navigate])

    const handleAddTrigger = () => {
        const trimmed = keywordInput.trim()
        if (!trimmed) return
        if (triggers.some(t => t.value === trimmed)) return setKeywordError('این کلمه قبلاً اضافه شده است')
        
        setTriggers([...triggers, { id: Date.now().toString(), value: trimmed, matchType: currentMatchType }])
        setKeywordInput('')
        setKeywordError('')
    }
    const handleRemoveTrigger = (idToRemove: string) => setTriggers(triggers.filter(t => t.id !== idToRemove))

    const updateReply = (replyId: string, updates: Partial<ReplyMessage>) => {
        setReplies(prev => prev.map(r => r.id === replyId ? { ...r, ...updates } : r))
        setRepliesError('')
    }

    const handleAddReply = () => setReplies([...replies, { id: Date.now().toString(), type: 'text', content: '' }])
    const handleRemoveReply = (replyId: string) => {
        setReplies(replies.filter(r => r.id !== replyId));
    };
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, replyId: string, type: ReplyType) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
        const allowedList = ALLOWED_EXTENSIONS[type];
        if (allowedList && !allowedList.includes(fileExtension)) {
            // نمایش پیام خطا به کاربر
            toast.push(
                <Notification title="فرمت غیرمجاز" type="danger">
                    فرمت {fileExtension} برای پیام از نوع «{type === 'image' ? 'تصویر' : type === 'video' ? 'ویدیو' : type === 'voice' ? 'صدا' : 'فایل'}» مجاز نیست.
                    پسوندهای مجاز: {allowedList.join(', ')}
                </Notification>, 
                { placement: 'top-center' }
            );
            e.target.value = ''; // ریست کردن اینپوت
            return; // توقف عملیات و باز نشدن مودال
        }


        // ساخت یک URL موقت در مرورگر کاربر برای نمایش عکس
        const previewUrl = URL.createObjectURL(file);
        
        // باز کردن مودال با تنظیم استیت
        setPreviewFile({ file, previewUrl, replyId, type, isViewMode: false });        
        // ریست کردن اینپوت برای اینکه کاربر بتونه دوباره همون فایل رو انتخاب کنه
        e.target.value = ''; 
    }
    const confirmAndUploadFile = async () => {
        if (!previewFile || !previewFile.file) return;
        const { file, replyId } = previewFile;

        setIsUploadingToCloud(true);
        updateReply(replyId, { isUploading: true, fileName: 'در حال آپلود...' });

        try {
            const formData = new FormData();
            formData.append('file', file);
            
            // فراخوانی سرویس آپلود
            const response = await apiUploadMedia(formData);
            const uploadedUrl: string = response.url || (response as any).data?.url || '';

            if (!uploadedUrl) throw new Error("آدرسی از سمت سرور دریافت نشد");

            updateReply(replyId, { 
                content: uploadedUrl, 
                fileName: file.name, 
                fileSize:file.size,
                isUploading: false 
            });

            toast.push(<Notification title="آپلود موفق" type="success">فایل با موفقیت آپلود شد.</Notification>, { placement: 'top-center' });
            
            // بستن مودال و پاک کردن URL موقت از مموری
            URL.revokeObjectURL(previewFile.previewUrl);
            setPreviewFile(null);
        } catch (error) {
            updateReply(replyId, { isUploading: false, fileName: '' });
            toast.push(<Notification title="خطا در آپلود" type="danger">مشکلی در آپلود فایل پیش آمد.</Notification>, { placement: 'top-center' });
        } finally {
            setIsUploadingToCloud(false);
        }
    }
    
    const cancelUpload = () => {
        if (previewFile) URL.revokeObjectURL(previewFile.previewUrl);
        setPreviewFile(null);
    }
    const handleRemoveSavedFile = async () => {
        if (!previewFile) return;
        
        const oldUrl = previewFile.previewUrl;
        if (oldUrl && typeof oldUrl === 'string' && !oldUrl.startsWith('blob:')) {
            try {
                if (user?.companyId) {
                    await apiDeleteMedia(user.companyId, oldUrl);
                }
            } catch (error) {
                console.error("خطا در حذف فایل از سرور:", error);
            }
        }

        updateReply(previewFile.replyId, { content: '', fileName: '', fileSize: undefined });
        cancelUpload();
        toast.push(<Notification title="حذف موفق" type="success">فایل پاک شد.</Notification>, { placement: 'top-center' });
    }
    // 🌟 ذخیره فرم (ایجاد یا ویرایش)
    const onSubmit = async (values: AutoReplyFormSchema) => {
        if (triggers.length === 0) return setKeywordError('لطفاً حداقل یک کلمه کلیدی وارد کنید.')
     
        if (replies.some(r => r.isUploading)) {
            return setRepliesError('لطفاً تا پایان آپلود فایل‌ها صبر کنید.')
        }

        if (replies.some(r => !r.content || !r.content.trim())) {
            return setRepliesError('لطفاً محتوای تمام پیام‌ها را تکمیل کنید یا فایل‌های لازم را آپلود نمایید.')
        }
        setSubmitting(true)
        try {
           const mappedResponses = replies.map(r => ({
                content: r.content, // 👈 اینجا همیشه رشته است (متن یا URL)
                type: REPLY_TYPE_MAP[r.type] || 1 ,
                fileName: r.type !== 'text' ? r.fileName : undefined ,
                fileSize: r.type !== 'text' ? r.fileSize : undefined ,
                caption: r.type !== 'text' ? r.caption : undefined 
            }))

            const mappedTriggers = triggers.map(t => ({
                value: t.value,
                type: TRIGGER_TYPE_MAP[t.matchType] || 2
            }))
            debugger
            const payload = {
                id: isEditMode ? id : undefined, // در صورت نیاز برای آپدیت
                companyId:  user?.companyId||'',
                botId: selectedBotId || null,
                name: values.title,
                priority: values.priority,
                triggers: mappedTriggers,
                responses: mappedResponses
            }

            if (isEditMode && id) {
                await apiUpdateAutoReply(id, payload);
                toast.push(<Notification title="موفقیت" type="success">تغییرات با موفقیت ذخیره شد.</Notification>, { placement: 'top-center' })
            } else {
                await apiCreateAutoReplies(payload);
                toast.push(<Notification title="موفقیت" type="success">پاسخ خودکار ذخیره شد.</Notification>, { placement: 'top-center' })
            }
            
            navigate('/concepts/auto-reply/list')
        } catch {
            toast.push(<Notification title="خطا" type="danger">خطا در ذخیره‌سازی اطلاعات.</Notification>, { placement: 'top-center' })
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="flex flex-col h-full w-full pb-8">
            <div className="sticky top-20 z-30 mb-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800 shadow-sm rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 transition-all">                <div className="flex items-center gap-3">
                    <Button shape="circle" variant="plain" icon={<HiArrowRight className="text-xl" />} onClick={() => navigate('/concepts/auto-reply/list')}/>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                        {isEditMode ? 'ویرایش پاسخ خودکار' : 'تنظیم پاسخ خودکار'}
                    </h3>
                </div>
                
                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    <Button type="button" onClick={() => navigate('/concepts/auto-reply/list')}>انصراف</Button>
                    <Button loading={isSubmitting} type="button" variant="solid" icon={<HiOutlineSave />} onClick={handleSubmit(onSubmit)}>
                        {isEditMode ? 'ثبت تغییرات' : 'ذخیره قانون'}
                    </Button>
                </div>
            </div>

            <Card className="flex-1 w-full flex flex-col">
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <Spinner size="40px" />
                    </div>
                ) : (
                    <Form className="h-full flex flex-col max-w-4xl mx-auto w-full relative">
                        {!selectedPlatform && !selectedBotId && (
                            <div className="animate-[fadeSlideUp_0.4s_ease-out_forwards] flex flex-col items-center justify-center py-10">
                                <h4 className="text-xl font-semibold text-center text-gray-700 dark:text-gray-200 mb-8">
                                    مرحله ۱: پلتفرم مورد نظر خود را انتخاب کنید
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 w-full">
                                    {platforms.map((plat) => (
                                        <div key={plat.id} onClick={() => setSelectedPlatform(plat.id)} className={`h-36 border-2 rounded-2xl p-5 cursor-pointer transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg bg-white dark:bg-gray-800 flex flex-col items-center justify-center text-center hover:border-indigo-400 ${plat.border}`}>
                                            <div className={`w-14 h-14 flex items-center justify-center rounded-xl ${plat.bg} mb-3`}><plat.icon className={`text-3xl ${plat.color}`} /></div>
                                            <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{plat.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {selectedPlatform && !selectedBotId && (
                            <div className="animate-[fadeSlideUp_0.4s_ease-out_forwards] flex flex-col items-center justify-center py-10">
                                <div className="w-full flex items-center justify-between mb-8 pb-4 border-b border-gray-100 dark:border-gray-800">
                                    <div className="flex flex-col">
                                        <h4 className="text-xl font-semibold text-gray-700 dark:text-gray-200">
                                            مرحله ۲: ربات مورد نظر را انتخاب کنید
                                        </h4>
                                    </div>
                                    <Button size="sm" variant="default" icon={<HiArrowLeft />} onClick={() => setSelectedPlatform('')}>تغییر پلتفرم</Button>
                                </div>
                                {isFetchingBots ? (
                                    <div className="flex flex-col items-center justify-center h-40 gap-3">
                                        <Spinner size="30px" />
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 w-full">
                                        {fetchedBots.map((bot) => {
                                            const Icon = bot.icon || FaGlobe;
                                            return (
                                                <div key={bot.id} onClick={() => setValue('botId', bot.id, { shouldValidate: true })} className="h-32 border-2 rounded-2xl p-4 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-md border-gray-100 dark:border-gray-800 hover:border-indigo-400 bg-white dark:bg-gray-800 flex items-center gap-4">
                                                    <div className={`w-12 h-12 flex items-center justify-center rounded-xl ${bot.bg || 'bg-gray-100'} flex-shrink-0`}><Icon className={`text-2xl ${bot.color || 'text-gray-500'}`} /></div>
                                                    <div className="flex flex-col text-right">
                                                        <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{bot.name}</span>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                                {errors.botId && <span className="text-red-500 text-sm mt-4">{errors.botId.message}</span>}
                            </div>
                        )}

                        {selectedBotId && activeBot && (
                            <div className="flex flex-col flex-1 animate-[fadeSlideUp_0.4s_ease-out_forwards]">
                                <div className={`flex flex-col sm:flex-row sm:items-center justify-between p-5 mb-8 rounded-2xl border bg-gray-50 dark:bg-gray-900/30 ${activeBot.border} gap-4`}>
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-xl flex items-center justify-center ${activeBot.bg}`}><activeBot.icon className={`text-3xl ${activeBot.color}`} /></div>
                                        <div>
                                            <h4 className="font-bold text-gray-800 dark:text-gray-100">تنظیم پاسخ برای: {activeBot.name}</h4>
                                            <p className="text-xs text-gray-500 mt-0.5 uppercase tracking-wider">پلتفرم: {activeBot.channel}</p>
                                        </div>
                                    </div>
                                    <Button size="sm" variant="plain" icon={<HiOutlineRefresh className="text-lg" />} onClick={() => { setValue('botId', ''); setFetchedBots([]); setSelectedPlatform(''); }}>تغییر ربات/پلتفرم</Button>
                                </div>

                                <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormItem label="عنوان قانون (برای نمایش در لیست)" invalid={Boolean(errors.title)} errorMessage={errors.title?.message}>
                                        <Controller name="title" control={control} render={({ field }) => <Input placeholder="مثال: استعلام قیمت" {...field} />} />
                                    </FormItem>
                                    <FormItem label="اولویت اجرا (عدد بزرگتر = اولویت بالاتر)" invalid={Boolean(errors.priority)} errorMessage={errors.priority?.message}>
                                        <Controller name="priority" control={control} render={({ field }) => <Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} />} />
                                    </FormItem>
                                </div>

                                <hr className="border-gray-100 dark:border-gray-800 mb-8" />

                                <div className="mb-10">
                                    <div className="mb-4">
                                        <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100">شرایط اجرا (Trigger)</h4>
                                        <p className="text-sm text-gray-500 mt-1">کلمه کلیدی را بنویسید، شرایط آن را انتخاب کرده و دکمه افزودن را بزنید.</p>
                                    </div>

                                    <FormItem invalid={Boolean(keywordError)} errorMessage={keywordError}>
                                        <div className="flex flex-col md:flex-row gap-3 mb-4 items-start md:items-center bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-200 dark:border-gray-700">
                                            <Input className="flex-1 w-full" type="text" placeholder="مثال: قیمت محصولات..." value={keywordInput} onChange={(e) => setKeywordInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTrigger() } }} />
                                            
                                            <div className="flex items-center bg-gray-200 dark:bg-gray-700 p-1 rounded-lg w-full md:w-auto">
                                                <button type="button" onClick={() => setCurrentMatchType('contains')} className={`flex-1 md:flex-none px-4 py-2 text-sm font-medium rounded-md transition-colors ${currentMatchType === 'contains' ? 'bg-white dark:bg-gray-600 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-300'}`}>شامل کلمات</button>
                                                <button type="button" onClick={() => setCurrentMatchType('exact')} className={`flex-1 md:flex-none px-4 py-2 text-sm font-medium rounded-md transition-colors ${currentMatchType === 'exact' ? 'bg-white dark:bg-gray-600 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-300'}`}>دقیقاً یکسان</button>
                                            </div>

                                            <Button type="button" className="w-full md:w-auto" icon={<HiPlus />} variant="solid" onClick={handleAddTrigger}>افزودن کلمه</Button>
                                        </div>

                                        <div className="flex flex-wrap gap-2 p-4 min-h-[70px] rounded-xl border border-dashed border-gray-300 dark:border-gray-600 bg-gray-50/30 dark:bg-gray-800/10">
                                            {triggers.length > 0 ? (
                                                triggers.map((trigger) => (
                                                    <div key={trigger.id} className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm font-medium pl-2 pr-3 py-1.5 rounded-xl">
                                                        <span className="text-gray-800 dark:text-gray-200 text-sm">{trigger.value}</span>
                                                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${trigger.matchType === 'exact' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'}`}>
                                                            {trigger.matchType === 'exact' ? 'دقیق' : 'شامل'}
                                                        </span>
                                                        <button type="button" onClick={() => handleRemoveTrigger(trigger.id)} className="text-gray-400 hover:text-red-500 transition-colors mr-1 border-r border-gray-200 dark:border-gray-700 pr-2"><HiX className="text-sm" /></button>
                                                    </div>
                                                ))
                                            ) : <span className="text-sm text-gray-400 my-auto text-center w-full">هیچ کلمه‌ای اضافه نشده است.</span>}
                                        </div>
                                    </FormItem>
                                </div>

                                <hr className="border-gray-100 dark:border-gray-800 mb-8" />

                                <div>
                                    <div className="mb-4">
                                        <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100">محتوای پاسخ</h4>
                                        <p className="text-sm text-gray-500 mt-1">ربات در جواب کلمات بالا، چه پیام‌هایی را ارسال کند؟</p>
                                    </div>

                                    <div className="flex flex-col gap-5">
                                        {replies.map((reply, index) => (
                                            <div key={reply.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800 gap-3">
                                                    <span className="font-semibold text-sm text-gray-600 px-2">پیام {index + 1}</span>
                                                    <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
                                                        <div className="flex bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-1 mr-2">
                                                            {replyTypes.map(type => (
                                                                <button key={type.value} type="button" title={type.label} onClick={() => updateReply(reply.id, { type: type.value as ReplyType, content: '', fileName: '' })} className={`px-3 py-1.5 rounded-md text-sm transition-colors flex items-center gap-1.5 ${reply.type === type.value ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 font-medium' : 'text-gray-500 hover:text-gray-800'}`}>
                                                                    <type.icon className="text-lg" />
                                                                    <span className="hidden md:inline">{type.label}</span>
                                                                </button>
                                                            ))}
                                                        </div>
                                                        <button type="button" onClick={() => handleRemoveReply(reply.id)} disabled={replies.length === 1} title="حذف پیام" className="text-gray-400 hover:text-red-500 disabled:opacity-30 p-2 transition-colors bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"><HiOutlineTrash className="text-lg" /></button>
                                                    </div>
                                                </div>
                                                <div className="p-4">
                                                {reply.type === 'text' ? (
                                                    <Input 
                                                        textArea 
                                                        rows={3} 
                                                        placeholder="متن پیام را بنویسید..." 
                                                        value={reply.content as string} 
                                                        onChange={(e) => updateReply(reply.id, { content: e.target.value })} 
                                                        className="bg-gray-50/50 dark:bg-gray-900/50" 
                                                    />
                                                ) : (
                                                    <div className="flex flex-col gap-3">
                                                        {reply.content && reply.content.trim() !== '' && !reply.isUploading ? (
                                                            <div 
                                                                onClick={() => setPreviewFile({ file: null as any, previewUrl: reply.content, replyId: reply.id, type: reply.type, isViewMode: true ,fileName: reply.fileName ,fileSize: reply.fileSize})}
                                                                className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-2 flex items-center gap-3 cursor-pointer hover:border-indigo-400 transition-colors bg-white dark:bg-gray-800"
                                                            >
                                                                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                                                                    {reply.type === 'image' && (
                                                                        <img src={getFullMediaUrl(reply.content)} alt="thumb" className="w-full h-full object-cover" />
                                                                    )}
                                                                    
                                                                    {reply.type === 'video' && (
                                                                        <div className="w-full h-full flex items-center justify-center bg-rose-50 dark:bg-rose-900/30">
                                                                            <FaPlayCircle className="text-3xl text-rose-500" />
                                                                        </div>
                                                                    )}
                                                                    
                                                                    {reply.type === 'voice' && (
                                                                        <div className="w-full h-full flex items-center justify-center bg-amber-50 dark:bg-amber-900/30">
                                                                            <HiOutlineMicrophone className="text-3xl text-amber-500" />
                                                                        </div>
                                                                    )}
                                                                    
                                                                   {reply.type === 'file' && (() => {
                                                                        const FileIcon = getFileIconDetail(reply.fileName);
                                                                        return (
                                                                            <div className={`w-full h-full flex items-center justify-center ${FileIcon.bg}`}>
                                                                                <FileIcon.icon className={`text-3xl ${FileIcon.color}`} />
                                                                            </div>
                                                                        );
                                                                    })()}
                                                                </div>
                                                                <div className="flex flex-col">
                                                                    <span className="text-sm font-bold text-gray-700 dark:text-gray-200 truncate max-w-[150px]" dir="ltr">
                                                                        {reply.fileName || 'فایل ذخیره شده'}
                                                                    </span>
                                                                    <span className="text-xs text-indigo-500 font-medium mt-1">مشاهده فایل</span>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <label className={`border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/30 transition-colors p-6 flex flex-col items-center justify-center group ${reply.isUploading ? 'cursor-not-allowed opacity-70' : 'cursor-pointer hover:bg-gray-100'}`}>
                                                                
                                                                {!reply.isUploading && (
                                                                    <input 
                                                                        type="file" 
                                                                        className="hidden" 
                                                                        accept={getAcceptAttribute(reply.type)} 
                                                                        onChange={(e) => handleFileSelect(e, reply.id, reply.type)} 
                                                                    />
                                                                )}

                                                                {reply.isUploading ? (
                                                                    <div className="flex flex-col items-center justify-center gap-3">
                                                                        <Spinner size="30px" />
                                                                        <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">در حال آماده‌سازی...</p>
                                                                    </div>
                                                                ) : (
                                                                    <>
                                                                        <FaCloudUploadAlt className="text-3xl text-gray-400 mb-3 group-hover:scale-110 transition-transform" />
                                                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                                                            {reply.fileName || 'برای انتخاب و آپلود فایل کلیک کنید'}
                                                                        </p>
                                                                    </>
                                                                )}
                                                            </label>
                                                        )}
                                                        <div className="mt-1">
                                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">
                                                                متن همراه فایل (کپشن):
                                                            </label>
                                                            <input
                                                                type="text"
                                                                className="w-full text-sm bg-gray-50/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl p-3 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-gray-700 dark:text-gray-200 placeholder-gray-400"
                                                                placeholder="متن توضیحات این فایل را بنویسید..."
                                                                value={reply.caption || ''}
                                                                onChange={(e) => updateReply(reply.id, { caption: e.target.value })}
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            </div>
                                        ))}

                                        {repliesError && <span className="text-red-500 text-sm">{repliesError}</span>}

                                        <Button type="button" variant="dashed" onClick={handleAddReply} className="w-full py-6 mt-2 border-2 border-gray-200 text-gray-500 hover:border-indigo-300 hover:text-indigo-600 transition-colors">
                                            + افزودن پیام جدید
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </Form>
                )}
            </Card>
            {previewFile && (() => {
                debugger
                let fileSizeMB = '0.00';
                if (previewFile.file) {
                    fileSizeMB = (previewFile.file.size / (1024 * 1024)).toFixed(2);
                } else if (previewFile.fileSize) {
                    fileSizeMB = (previewFile.fileSize / (1024 * 1024)).toFixed(2);
                }

                const maxAllowedMB = previewFile.type === 'image' ? 2 : 50;
                const isSizeInvalid = previewFile.file ? parseFloat(fileSizeMB) > maxAllowedMB : false;

                return (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
                        <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-[fadeSlideUp_0.3s_ease-out]">
                            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
                                <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">پیش‌نمایش فایل</h3>
                                <button onClick={cancelUpload} disabled={isUploadingToCloud} className="text-gray-400 hover:text-red-500 transition-colors p-1">
                                    <HiX className="text-xl" />
                                </button>
                            </div>

                            <div className="p-5 flex flex-col items-center">
                                {previewFile.type === 'image' && (
                                <div className="w-full h-48 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 mb-4 bg-gray-50 dark:bg-gray-900 flex items-center justify-center relative">
                                    <img src={getFullMediaUrl(previewFile.previewUrl)} alt="Preview" className="w-full h-full object-contain" />
                                </div>
                                )}

                                {previewFile.type === 'video' && (
                                <div className="w-full rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 mb-4 bg-black flex items-center justify-center shadow-inner">
                                    <video src={getFullMediaUrl(previewFile.previewUrl)} controls className="w-full max-h-64 outline-none" />
                                </div>
                                )}

                                {previewFile.type === 'voice' && (
                                <div className="w-full rounded-2xl p-4 border border-gray-200 dark:border-gray-700 mb-4 bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                                    <audio src={getFullMediaUrl(previewFile.previewUrl)} controls className="w-full outline-none" />
                                </div>
                                )}

                                {previewFile.type === 'file' && (() => {
                                    const currentFileName = previewFile.isViewMode ? previewFile.fileName : previewFile.file?.name;
                                    const FileIcon = getFileIconDetail(currentFileName);
                                    return (
                                        <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-4 ${FileIcon.bg}`}>
                                            <FileIcon.icon className={`text-5xl ${FileIcon.color}`} />
                                        </div>
                                    );
                                })()}

                                <div className="w-full space-y-3 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500 dark:text-gray-400">نام فایل:</span>
                                        <span className="font-medium text-gray-800 dark:text-gray-200 truncate max-w-[200px]" dir="ltr">
                                            {previewFile.isViewMode ? previewFile.fileName : previewFile.file?.name}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500 dark:text-gray-400">حجم فایل:</span>
                                        <span className={`font-bold ${isSizeInvalid ? 'text-red-500' : 'text-emerald-500'}`}>
                                            {fileSizeMB} مگابایت
                                        </span>
                                    </div>
                                </div>

                                {/* نمایش هشدار در صورت غیرمجاز بودن حجم */}
                                {isSizeInvalid && (
                                    <div className="w-full mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-xl text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
                                        <HiX className="text-lg flex-shrink-0" />
                                        <span>حجم فایل بیشتر از حد مجاز ({maxAllowedMB} مگابایت) است. لطفاً فایل سبک‌تری انتخاب کنید.</span>
                                    </div>
                                )}
                            </div>

                            {/* فوتر و دکمه‌ها */}
                            <div className="p-5 border-t border-gray-100 dark:border-gray-700 flex items-center gap-3 bg-gray-50/50 dark:bg-gray-800/30">
                                {!previewFile.isViewMode ? (
                                    // 🌟 دکمه‌های حالت آپلود جدید
                                    <div className="p-5 border-t border-gray-100 dark:border-gray-700 flex items-center gap-3 bg-gray-50/50 dark:bg-gray-800/30">
                                        <Button className="flex-1" type="button" onClick={cancelUpload} disabled={isUploadingToCloud}>
                                            انصراف
                                        </Button>
                                        <Button 
                                            className="flex-1" 
                                            type="button" 
                                            variant="solid" 
                                            disabled={isSizeInvalid || isUploadingToCloud}
                                            loading={isUploadingToCloud}
                                            onClick={confirmAndUploadFile}
                                            icon={<FaCloudUploadAlt />}
                                        >
                                            {isUploadingToCloud ? 'در حال آپلود...' : 'تایید و آپلود'}
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="p-5 border-t border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-3 bg-gray-50/50 dark:bg-gray-800/30">
                                        <div className="flex items-center gap-2 w-full sm:w-auto">
                                            <Button 
                                                type="button" 
                                                variant="plain" 
                                                className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" 
                                                icon={<HiOutlineTrash />} 
                                                onClick={handleRemoveSavedFile}
                                            >
                                                حذف
                                            </Button>
                                            
                                            {/* دکمه جایگزینی با استفاده از input مخفی */}
                                            <label className="cursor-pointer w-full sm:w-auto">
                                                <input 
                                                    type="file" 
                                                    className="hidden" 
                                                    accept={getAcceptAttribute(previewFile.type)} 
                                                    onChange={(e) => handleFileSelect(e, previewFile.replyId, previewFile.type)} 
                                                />
                                                <div className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-medium text-sm rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors flex items-center justify-center gap-2">
                                                    <HiOutlineRefresh className="text-lg" />
                                                    <span>جایگزینی فایل</span>
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                )}
                                {previewFile.isViewMode && (
                                    <div className="p-5 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                                        <Button variant="plain" onClick={cancelUpload}>بستن</Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })()}
            <style>{`
                @keyframes fadeSlideUp { 0% { opacity: 0; transform: translateY(15px); } 100% { opacity: 1; transform: translateY(0); } }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    )
}

export default AutoReplyForm