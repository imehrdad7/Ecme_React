import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
    HiArrowRight, HiOutlineSave, HiOutlineTrash, HiOutlineEye, HiPlus, HiX,
    HiOutlinePhotograph, HiOutlineVideoCamera, HiOutlineMicrophone, HiOutlineDocumentText, HiOutlineMenuAlt2, HiOutlineRefresh
} from 'react-icons/hi'
import { FaTelegramPlane, FaInstagram, FaWhatsapp, FaGlobe, FaCloudUploadAlt, FaPlayCircle } from 'react-icons/fa' 
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Radio from '@/components/ui/Radio'
import Dialog from '@/components/ui/Dialog'
import { FormItem, Form } from '@/components/ui/Form'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import Spinner from '@/components/ui/Spinner'

const validationSchema = z.object({
    title: z.string({ required_error: 'عنوان الزامی است' }).min(3, 'حداقل ۳ کاراکتر'),
    botId: z.string({ required_error: 'لطفاً یک ربات را entertainer انتخاب کنید' }).min(1, 'انتخاب ربات الزامی است'),
    matchType: z.enum(['contains', 'exact']),
})

type AutoReplyFormSchema = z.infer<typeof validationSchema>

type ReplyType = 'text' | 'image' | 'video' | 'voice' | 'file'
type ReplyMessage = { 
    id: string; 
    type: ReplyType; 
    content: string | File; 
    fileName?: string; 
    caption?: string; 
}

const userCreatedBots = [
    { id: 'bot-101', name: 'ربات پشتیبانی فروش', channel: 'Telegram', icon: FaTelegramPlane, color: 'text-sky-500', bg: 'bg-sky-100', border: 'border-sky-200' },
    { id: 'bot-102', name: 'دستیار هوشمند سایت', channel: 'Web', icon: FaGlobe, color: 'text-indigo-500', bg: 'bg-indigo-100', border: 'border-indigo-200' },
    { id: 'bot-103', name: 'پاسخگوی دایرکت', channel: 'Instagram', icon: FaInstagram, color: 'text-pink-600', bg: 'bg-pink-100', border: 'border-pink-200' },
    { id: 'bot-104', name: 'واتس‌اپ پشتیبانی', channel: 'WhatsApp', icon: FaWhatsapp, color: 'text-green-500', bg: 'bg-green-100', border: 'border-green-200' },
]

const replyTypes = [
    { value: 'text', label: 'متن', icon: HiOutlineMenuAlt2 },
    { value: 'image', label: 'تصویر', icon: HiOutlinePhotograph },
    { value: 'video', label: 'ویدیو', icon: HiOutlineVideoCamera },
    { value: 'voice', label: 'صدا', icon: HiOutlineMicrophone },
    { value: 'file', label: 'فایل', icon: HiOutlineDocumentText },
]

const AutoReplyForm = () => {
    const navigate = useNavigate()
    const { id } = useParams() 
    const isEditMode = Boolean(id)

    const [isLoading, setIsLoading] = useState<boolean>(isEditMode)
    const [isSubmitting, setSubmitting] = useState<boolean>(false)
    
    const [keywords, setKeywords] = useState<string[]>([])
    const [keywordInput, setKeywordInput] = useState<string>('')
    const [keywordError, setKeywordError] = useState<string>('')

    const [replies, setReplies] = useState<ReplyMessage[]>([{ id: Date.now().toString(), type: 'text', content: '' }])
    const [repliesError, setRepliesError] = useState<string>('')
    const [previewMessage, setPreviewMessage] = useState<ReplyMessage | null>(null)

    const { handleSubmit, formState: { errors }, control, reset, watch, setValue } = useForm<AutoReplyFormSchema>({
        resolver: zodResolver(validationSchema),
        defaultValues: { botId: '', matchType: 'contains' } 
    })

    const selectedBotId = watch('botId')
    const activeBot = userCreatedBots.find(b => b.id === selectedBotId)

    useEffect(() => {
        if (isEditMode) {
            const fetchRule = async () => {
                try {
                    await new Promise(resolve => setTimeout(resolve, 600))
                    setReplies([{ id: '1', type: 'text', content: 'سلام! به پشتیبانی خوش آمدید.' }])
                    setKeywords(['قیمت', 'تعرفه'])
                    reset({ title: 'پیام خوش‌آمدگویی', botId: 'bot-101', matchType: 'contains' })
                } catch {
                    toast.push(<Notification title="خطا" type="danger">خطا در دریافت اطلاعات</Notification>, { placement: 'top-center' })
                } finally {
                    setIsLoading(false)
                }
            }
            fetchRule()
        }
    }, [id, isEditMode, reset])

    const handleAddKeyword = () => {
        const trimmed = keywordInput.trim()
        if (!trimmed) return
        if (keywords.includes(trimmed)) return setKeywordError('این کلمه قبلاً اضافه شده است')
        setKeywords([...keywords, trimmed])
        setKeywordInput('')
        setKeywordError('')
    }
    const handleRemoveKeyword = (index: number) => setKeywords(keywords.filter((_, i) => i !== index))

    const updateReply = (replyId: string, updates: Partial<ReplyMessage>) => {
        setReplies(prev => prev.map(r => r.id === replyId ? { ...r, ...updates } : r))
        setRepliesError('')
    }

    const handleAddReply = () => setReplies([...replies, { id: Date.now().toString(), type: 'text', content: '' }])
    const handleRemoveReply = (replyId: string) => replies.length > 1 && setReplies(replies.filter(r => r.id !== replyId))

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, replyId: string, type: ReplyType) => {
        const file = e.target.files?.[0]
        if (!file) return

        const fileSizeInMB = file.size / (1024 * 1024)

        if (type === 'image' && fileSizeInMB > 2) return toast.push(<Notification type="danger" title="حجم غیرمجاز">حداکثر ۲ مگابایت</Notification>, { placement: 'top-center' })
        if (type === 'video' && fileSizeInMB > 50) return toast.push(<Notification type="danger" title="حجم غیرمجاز">حداکثر ۵۰ مگابایت</Notification>, { placement: 'top-center' })
        if (fileSizeInMB > 50) return toast.push(<Notification type="danger" title="حجم غیرمجاز">حداکثر ۵۰ مگابایت</Notification>, { placement: 'top-center' })

        updateReply(replyId, { content: file, fileName: file.name })
    }

    const onSubmit = async (values: AutoReplyFormSchema) => {
        if (keywords.length === 0) return setKeywordError('لطفاً حداقل یک کلمه کلیدی وارد کنید.')

        if (replies.some(r => !r.content || (typeof r.content === 'string' && !r.content.trim()))) {
            return setRepliesError('لطفاً محتوای تمام پیام‌ها را تکمیل کنید یا فایل‌های لازم را آپلود نمایید.')
        }

        setSubmitting(true)
        try {
            await new Promise(resolve => setTimeout(resolve, 1500))
            console.log('Submitted Payload:', { ...values, keywords, replies })
            toast.push(<Notification title="موفقیت" type="success">پاسخ خودکار ذخیره شد.</Notification>, { placement: 'top-center' })
            navigate('/concepts/auto-reply/list')
        } catch {
            toast.push(<Notification title="خطا" type="danger">خطا در ارتباط با سرور.</Notification>, { placement: 'top-center' })
        } finally {
            setSubmitting(false)
        }
    }

    const renderPreviewBubbleContent = (msg: ReplyMessage) => {
        if (msg.type === 'text') return <p className="whitespace-pre-wrap leading-relaxed text-[13px]">{msg.content as string || 'بدون متن...'}</p>
        
        const hasFile = Boolean(msg.fileName)
        if (!hasFile) {
            return (
                <div className="flex flex-col items-center justify-center p-4 bg-black/5 rounded-xl border border-dashed border-black/10 w-[200px]">
                    <span className="text-[11px] text-gray-500 font-medium">هیچ فایلی انتخاب نشده</span>
                </div>
            )
        }

        const displayFileName = msg.fileName || ''

        if (msg.type === 'voice') {
            const waveHeights = [20, 40, 70, 40, 80, 50, 30, 90, 60, 40, 20, 50]
            return (
                <div className="flex flex-col gap-1 w-full min-w-[220px]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                            <FaPlayCircle className="text-2xl" />
                        </div>
                        <div className="flex-1 h-6 flex items-center gap-0.5 opacity-60">
                            {waveHeights.map((h, i) => (
                                <div key={i} className="w-1 bg-current rounded-full" style={{ height: `${h}%` }}></div>
                            ))}
                        </div>
                    </div>
                    <span className="text-[10px] opacity-70 mt-1 pl-1">0:12</span>
                    {msg.caption && <p className="text-[13px] mt-1.5">{msg.caption}</p>}
                </div>
            )
        }

        if (msg.type === 'file') {
            return (
                <div className="flex flex-col gap-2 w-full min-w-[220px]">
                    <div className="flex items-center gap-3 bg-black/5 p-3 rounded-xl">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                            <HiOutlineDocumentText className="text-2xl" />
                        </div>
                        <div className="flex flex-col flex-1 overflow-hidden">
                            <span className="text-[13px] font-bold truncate block w-full" dir="ltr">{displayFileName}</span>
                            <span className="text-[10px] opacity-70 mt-0.5">1.5 MB • Document</span>
                        </div>
                    </div>
                    {msg.caption && <p className="text-[13px]">{msg.caption}</p>}
                </div>
            )
        }

        return (
            <div className="flex flex-col gap-2 w-full min-w-[220px] max-w-[250px]">
                <div className={`w-full h-40 rounded-xl flex flex-col items-center justify-center relative overflow-hidden shadow-sm ${msg.type === 'video' ? 'bg-slate-800' : 'bg-gradient-to-tr from-gray-200 to-gray-300'}`}>
                    {msg.type === 'image' && <HiOutlinePhotograph className="text-6xl text-black/10" />}
                    {msg.type === 'video' && (
                        <>
                            <FaPlayCircle className="text-5xl text-white/80 z-10 drop-shadow-lg" />
                            <span className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded backdrop-blur-sm">0:45</span>
                        </>
                    )}
                    <div className="absolute top-0 inset-x-0 bg-gradient-to-b from-black/60 to-transparent p-2.5 pb-4">
                        <span className="text-white text-[11px] truncate block drop-shadow-md w-full text-left" dir="ltr">
                            {displayFileName}
                        </span>
                    </div>
                </div>
                {msg.caption && <p className="text-[13px] mt-1">{msg.caption}</p>}
            </div>
        )
    }

    const getPlatformStyles = (channel?: string) => {
        switch (channel) {
            case 'WhatsApp': return { bg: 'bg-[#efeae2]', bubble: 'bg-white text-gray-800 rounded-2xl rounded-tr-sm shadow-sm', header: 'bg-[#075e54] text-white' }
            case 'Telegram': return { bg: 'bg-[#9dbad3]', bubble: 'bg-white text-gray-900 rounded-2xl rounded-bl-sm shadow-sm', header: 'bg-[#179cde] text-white' }
            case 'Instagram': return { bg: 'bg-black', bubble: 'bg-gradient-to-tr from-purple-600 to-pink-500 text-white rounded-3xl', header: 'bg-zinc-900 border-b border-zinc-800 text-white' }
            default: return { bg: 'bg-gray-50', bubble: 'bg-indigo-600 text-white rounded-2xl rounded-br-sm shadow-md', header: 'bg-white border-b text-gray-800' }
        }
    }

    const renderReplyContent = (reply: ReplyMessage) => {
        if (reply.type === 'text') {
            return <Input textArea rows={3} placeholder="متن پیام را بنویسید..." value={reply.content as string} onChange={(e) => updateReply(reply.id, { content: e.target.value })} className="bg-gray-50/50 dark:bg-gray-900/50 border-gray-200" />
        }
        return (
            <div className="flex flex-col gap-3">
                <label className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/30 hover:bg-gray-100 transition-colors p-6 flex flex-col items-center justify-center cursor-pointer group">
                    <input type="file" className="hidden" accept={reply.type === 'image' ? 'image/*' : reply.type === 'video' ? 'video/*' : reply.type === 'voice' ? 'audio/*' : '*'} onChange={(e) => handleFileUpload(e, reply.id, reply.type)} />
                    <FaCloudUploadAlt className="text-3xl text-gray-400 mb-3 group-hover:scale-110 transition-transform" />
                    {reply.fileName ? (
                        <div className="flex flex-col items-center text-center">
                            <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{reply.fileName}</span>
                            <span className="text-xs text-gray-400 mt-1">برای تغییر فایل مجدداً کلیک کنید</span>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center text-center">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">برای آپلود فایل کلیک کنید</p>
                            <p className="text-xs text-gray-400 mt-1">
                                {reply.type === 'image' && 'حداکثر حجم مجاز: ۲ مگابایت'}
                                {reply.type === 'video' && 'حداکثر حجم مجاز: ۵۰ مگابایت'}
                                {reply.type !== 'image' && reply.type !== 'video' && 'فرمت استاندارد (حداکثر ۵۰ مگابایت)'}
                            </p>
                        </div>
                    )}
                </label>
                {(reply.type === 'image' || reply.type === 'video' || reply.type === 'voice' || reply.type === 'file') && <Input placeholder="کپشن یا توضیحات زیر فایل (اختیاری)..." value={reply.caption || ''} onChange={(e) => updateReply(reply.id, { caption: e.target.value })} />}
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full w-full pb-8">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Button shape="circle" variant="plain" icon={<HiArrowRight className="text-xl" />} onClick={() => navigate('/concepts/auto-reply/list')}/>
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                        {isEditMode ? 'ویرایش پاسخ خودکار' : 'تنظیم پاسخ خودکار'}
                    </h3>
                </div>
            </div>

            <Card className="flex-1 w-full flex flex-col">
                {isLoading ? (
                    <div className="flex justify-center items-center h-64"><Spinner size="40px" /></div>
                ) : (
                    <Form onSubmit={handleSubmit(onSubmit)} className="h-full flex flex-col max-w-4xl mx-auto w-full relative">
                        
                        {!selectedBotId && (
                            <div className="animate-[fadeSlideUp_0.4s_ease-out_forwards] flex flex-col items-center justify-center py-10">
                                <h4 className="text-xl font-semibold text-center text-gray-700 dark:text-gray-200 mb-8">
                                    ربات مورد نظر را برای تنظیم پاسخ خودکار انتخاب کنید
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 w-full">
                                    {userCreatedBots.map((bot) => (
                                        <div key={bot.id} onClick={() => setValue('botId', bot.id, { shouldValidate: true })} className="h-36 border-2 rounded-2xl p-5 cursor-pointer transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg border-gray-100 dark:border-gray-800 hover:border-indigo-300 bg-white dark:bg-gray-800 flex flex-col items-center justify-center text-center">
                                            <div className={`w-14 h-14 flex items-center justify-center rounded-xl ${bot.bg} mb-3`}><bot.icon className={`text-3xl ${bot.color}`} /></div>
                                            <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{bot.name}</span>
                                            <span className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">{bot.channel}</span>
                                        </div>
                                    ))}
                                </div>
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
                                            <p className="text-xs text-gray-500 mt-0.5">پلتفرم: {activeBot.channel}</p>
                                        </div>
                                    </div>
                                    <Button size="sm" variant="plain" icon={<HiOutlineRefresh className="text-lg" />} onClick={() => setValue('botId', '')}>تغییر ربات</Button>
                                </div>

                                <div className="mb-8">
                                    <FormItem label="عنوان (برای نمایش در لیست)" invalid={Boolean(errors.title)} errorMessage={errors.title?.message}>
                                        <Controller name="title" control={control} render={({ field }) => <Input placeholder="مثال: پاسخ به استعلام قیمت" {...field} />} />
                                    </FormItem>
                                </div>

                                <hr className="border-gray-100 dark:border-gray-800 mb-8" />

                                <div className="mb-10">
                                    <div className="mb-4">
                                        <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100">شرایط اجرا (Trigger)</h4>
                                        <p className="text-sm text-gray-500 mt-1">کاربر چه کلماتی را ارسال کند تا این پاسخ‌ها برایش ارسال شود؟</p>
                                    </div>

                                    <div className="grid grid-cols-1 gap-6">
                                        <FormItem label="نوع تطابق" invalid={Boolean(errors.matchType)} errorMessage={errors.matchType?.message}>
                                            <Controller name="matchType" control={control} render={({ field }) => (
                                                <Radio.Group value={field.value} onChange={field.onChange} className="flex gap-6 mt-1">
                                                    <Radio value="contains"><span className="text-sm">شامل کلمات باشد</span></Radio>
                                                    <Radio value="exact"><span className="text-sm">دقیقاً یکسان باشد</span></Radio>
                                                </Radio.Group>
                                            )}/>
                                        </FormItem>

                                        <FormItem label="کلمات کلیدی محرک (پس از نوشتن هر کلمه دکمه + یا Enter را بزنید)" invalid={Boolean(keywordError)} errorMessage={keywordError}>
                                            <div className="flex gap-2 mb-3">
                                                <Input type="text" placeholder="مثال: قیمت" value={keywordInput} onChange={(e) => setKeywordInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddKeyword() } }} />
                                                <Button type="button" icon={<HiPlus />} onClick={handleAddKeyword} />
                                            </div>
                                            <div className="flex flex-wrap gap-2 p-3 min-h-[52px] rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30">
                                                {keywords.length > 0 ? (
                                                    keywords.map((word, idx) => (
                                                        <span key={idx} className="flex items-center gap-1.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-medium text-xs pl-2 pr-2.5 py-1.5 rounded-lg">
                                                            {word}
                                                            <button type="button" onClick={() => handleRemoveKeyword(idx)} className="hover:text-red-500 transition-colors"><HiX className="text-xs" /></button>
                                                        </span>
                                                    ))
                                                ) : <span className="text-xs text-gray-400 my-auto">هیچ کلمه‌ای اضافه نشده است.</span>}
                                            </div>
                                        </FormItem>
                                    </div>
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
                                                        <button type="button" onClick={() => setPreviewMessage(reply)} title="پیش‌نمایش پیام" className="text-gray-400 hover:text-indigo-600 p-2 transition-colors bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"><HiOutlineEye className="text-lg" /></button>
                                                        <button type="button" onClick={() => handleRemoveReply(reply.id)} disabled={replies.length === 1} title="حذف پیام" className="text-gray-400 hover:text-red-500 disabled:opacity-30 p-2 transition-colors bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"><HiOutlineTrash className="text-lg" /></button>
                                                    </div>
                                                </div>
                                                <div className="p-4">{renderReplyContent(reply)}</div>
                                            </div>
                                        ))}

                                        {repliesError && <span className="text-red-500 text-sm">{repliesError}</span>}

                                        <Button type="button" variant="dashed" onClick={handleAddReply} className="w-full py-6 mt-2 border-2 border-gray-200 text-gray-500 hover:border-indigo-300 hover:text-indigo-600 transition-colors">
                                            + افزودن پیام جدید به این پاسخ
                                        </Button>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 mt-10 pt-6 border-t border-gray-100 dark:border-gray-800">
                                    <Button type="button" onClick={() => navigate('/concepts/auto-reply/list')}>انصراف</Button>
                                    <Button loading={isSubmitting} type="submit" variant="solid" icon={<HiOutlineSave />}>ذخیره قانون</Button>
                                </div>
                            </div>
                        )}
                    </Form>
                )}
            </Card>

            {/* 🌟 پاپ‌آپ اصلاح‌شده پیش‌نمایش همراه با دکمه بستن لمسی و شیشه‌ای ارگونومیک */}
            <Dialog isOpen={Boolean(previewMessage)} onClose={() => setPreviewMessage(null)} closable={false} contentClassName="p-0 border-0 bg-transparent shadow-none">
                {previewMessage && activeBot && (
                    <div className="flex flex-col items-center mt-6 pb-8 max-h-[95vh] overflow-y-auto no-scrollbar">
                        <div className={`w-full max-w-[320px] h-[520px] flex flex-col rounded-[2.5rem] border-[8px] border-gray-900 shadow-2xl overflow-hidden relative ${getPlatformStyles(activeBot.channel).bg}`}>
                            <div className="absolute top-0 inset-x-0 h-6 bg-gray-900 rounded-b-xl w-32 mx-auto z-20"></div>
                            <div className={`flex items-center gap-3 px-4 pt-8 pb-3 z-10 shadow-sm ${getPlatformStyles(activeBot.channel).header}`}>
                                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0"><activeBot.icon className="text-lg" /></div>
                                <div className="flex flex-col"><span className="font-bold text-sm truncate">{activeBot.name}</span><span className="text-[10px] opacity-80">آنلاین</span></div>
                            </div>
                            <div className="flex-1 p-4 flex flex-col overflow-y-auto">
                                <div className="self-end max-w-[80%] mb-4">
                                    <div className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-900 dark:text-indigo-100 p-3 rounded-2xl rounded-tl-sm text-[13px] shadow-sm">
                                        {keywords.length > 0 ? keywords[0] : 'کلمه کلیدی فرضی...'}
                                    </div>
                                </div>
                                <div className="self-start max-w-[85%] flex items-end gap-2 animate-[fadeSlideUp_0.3s_ease-out]">
                                    {activeBot.channel === 'Instagram' && <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex-shrink-0 mb-1"></div>}
                                    <div className={`p-3 ${getPlatformStyles(activeBot.channel).bubble}`}>
                                        {renderPreviewBubbleContent(previewMessage)}
                                        <div className="text-[9px] opacity-60 text-right mt-1.5 w-full">همین الان</div>
                                    </div>
                                </div>
                            </div>
                            <div className={`h-14 mt-auto border-t flex items-center px-4 ${activeBot.channel === 'Instagram' ? 'border-zinc-800 bg-black' : 'border-black/5 bg-white'}`}>
                                <div className="w-full h-9 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center px-3 text-xs text-gray-400">پیام خود را بنویسید...</div>
                            </div>
                        </div>
                        
                        {/* 🌟 دکمه بستن عریض شیشه‌ای در منطقه امن شست دست (Thumb Zone) */}
                        <button 
                            type="button" 
                            onClick={() => setPreviewMessage(null)}
                            className="mt-5 w-full max-w-[320px] h-11 bg-white/10 hover:bg-white/20 text-white font-bold text-sm rounded-xl border border-white/10 backdrop-blur-md shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95 group"
                        >
                            <HiX className="text-lg group-hover:rotate-90 transition-transform" />
                            <span>بستن پیش‌نمایش ({activeBot.channel})</span>
                        </button>
                    </div>
                )}
            </Dialog>
            <style>{`
                @keyframes fadeSlideUp { 0% { opacity: 0; transform: translateY(15px); } 100% { opacity: 1; transform: translateY(0); } }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    )
}

export default AutoReplyForm