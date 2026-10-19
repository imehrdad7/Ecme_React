import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSessionUser } from '@/store/authStore';
import {
    HiOutlineSave, HiPlus, HiX, HiOutlineLightningBolt,
    HiOutlinePhotograph, HiOutlineBell, HiOutlineChatAlt2,
    HiOutlineInformationCircle
} from 'react-icons/hi';
import { FaUserNinja } from 'react-icons/fa';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Switcher from '@/components/ui/Switcher';
import { FormItem, Form } from '@/components/ui/Form';
import toast from '@/components/ui/toast';
import Notification from '@/components/ui/Notification';
import Spinner from '@/components/ui/Spinner';
import { apiGetCompanyPolicy, apiUpdateHandoffSettings } from '@/services/automationPolicyService';

const InfoTooltip = ({ text }: { text: string }) => (
    <div className="relative group inline-flex items-center mx-2 cursor-help outline-none">
        <HiOutlineInformationCircle className="text-gray-400 hover:text-indigo-500 transition-colors text-xl outline-none" />
        <div className="absolute z-[9999] invisible opacity-0 group-hover:visible group-hover:opacity-100 group-focus:visible group-focus:opacity-100 transition-all duration-200 top-full right-0 mt-2 w-[260px] bg-gray-800 text-white text-[13px] p-3.5 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] leading-relaxed text-right pointer-events-none break-words whitespace-normal">
            {text}
            <div className="absolute bottom-full right-3 border-4 border-transparent border-b-gray-800"></div>
        </div>
    </div>
);

// 🌟 فیلد اضافی حذف و فیلد مجازیِ enableHoldingMessage فقط برای کنترل رابط کاربری اضافه شد
const validationSchema = z.object({
    returnToBotAfterInactivityMinutes: z.number().min(0),
    botResponseDelaySeconds: z.number().min(0),
    stopOnImageReceived: z.boolean(),
    stopOnDocumentReceived: z.boolean(),
    fallbackLimit: z.number().min(0),
    holdingMessage: z.string().optional(),
    targetRole: z.number(),
    silenceBotDuringHandoff: z.boolean(),
    enableHoldingMessage: z.boolean() // فقط برای مدیریت سوییچ روی صفحه
});

type HandoffFormSchema = z.infer<typeof validationSchema>;

const HandoffSettingsForm = () => {
    const { user } = useSessionUser();
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isSubmitting, setSubmitting] = useState<boolean>(false);
    const [keywords, setKeywords] = useState<string[]>([]);
    const [keywordInput, setKeywordInput] = useState<string>('');

    const [selectedChannels, setSelectedChannels] = useState<{ inApp: boolean, systemBot: boolean, sms: boolean }>({
        inApp: true, systemBot: false, sms: false
    });

    const { handleSubmit, control, reset } = useForm<HandoffFormSchema>({
        resolver: zodResolver(validationSchema),
        defaultValues: {
            returnToBotAfterInactivityMinutes: 10,
            botResponseDelaySeconds: 0,
            stopOnImageReceived: false,
            stopOnDocumentReceived: false,
            fallbackLimit: 3,
            holdingMessage: 'در حال اتصال به اپراتور، لطفاً منتظر بمانید...',
            targetRole: 3,
            silenceBotDuringHandoff: false,
            enableHoldingMessage: true
        }
    });

    useEffect(() => {
        const fetchSettings = async () => {
            if (!user?.companyId) return;
            setIsLoading(true);
            try {
                const result: any = await apiGetCompanyPolicy(user.companyId);
                if (result) {
                    setKeywords(result.handoffTriggerKeywords ? result.handoffTriggerKeywords.split(',').filter(Boolean) : []);

                    const channels = result.notifyChannels || 1;
                    setSelectedChannels({
                        inApp: (channels & 1) === 1,
                        systemBot: (channels & 2) === 2,
                        sms: (channels & 4) === 4
                    });

                    const msg = result.holdingMessage || '';
                    
                    reset({
                        returnToBotAfterInactivityMinutes: result.returnToBotAfterInactivityMinutes || 0,
                        botResponseDelaySeconds: result.botResponseDelaySeconds || 0,
                        stopOnImageReceived: result.stopOnImageReceived || false,
                        stopOnDocumentReceived: result.stopOnDocumentReceived || false,
                        fallbackLimit: result.fallbackLimit || 0,
                        holdingMessage: msg,
                        targetRole: result.targetRole || 3,
                        silenceBotDuringHandoff: result.silenceBotDuringHandoff ?? false,
                        enableHoldingMessage: msg.length > 0 // 🌟 اگر متن داشت روشن، در غیر این‌صورت خاموش
                    });
                }
            } catch (error) {
                toast.push(<Notification title="خطا" type="danger">خطا در دریافت اطلاعات.</Notification>, { placement: 'top-center' });
            } finally {
                setIsLoading(false);
            }
        };
        fetchSettings();
    }, [user?.companyId, reset]);

    const handleAddKeyword = () => {
        const trimmed = keywordInput.trim();
        if (!trimmed) return;
        if (keywords.includes(trimmed)) {
            toast.push(
                <Notification title="کلمه تکراری" type="danger">
                    این کلمه کلیدی قبلاً اضافه شده است!
                </Notification>,
                { placement: 'top-center' }
            );
            return;
        }
        setKeywords([...keywords, trimmed]);
        setKeywordInput('');
    };

    const onSubmit = async (values: HandoffFormSchema) => {
        if (!user?.companyId) return;
        setSubmitting(true);

        let channelsVal = 0;
        if (selectedChannels.inApp) channelsVal += 1;
        if (selectedChannels.systemBot) channelsVal += 2;
        if (selectedChannels.sms) channelsVal += 4;

        try {
            await apiUpdateHandoffSettings({
                companyId: user.companyId,
                handoffTriggerKeywords: keywords.join(','),
                silenceBotDuringHandoff: values.silenceBotDuringHandoff,
                botResponseDelaySeconds: values.botResponseDelaySeconds,
                returnToBotAfterInactivityMinutes: values.returnToBotAfterInactivityMinutes,
                stopOnImageReceived: values.stopOnImageReceived,
                stopOnDocumentReceived: values.stopOnDocumentReceived,
                fallbackLimit: values.fallbackLimit,
                holdingMessage: values.enableHoldingMessage ? values.holdingMessage : '',
                targetRole: values.targetRole,
                notifyChannels: channelsVal
            });
            toast.push(<Notification title="موفقیت" type="success">تنظیمات با موفقیت ذخیره شد.</Notification>, { placement: 'top-center' });
        } catch (error) {
            toast.push(<Notification title="خطا" type="danger">خطا در ذخیره‌سازی.</Notification>, { placement: 'top-center' });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-80px)] md:h-[calc(100vh-110px)] w-full overflow-hidden bg-gray-50/50 dark:bg-gray-950">
            <div className="flex-shrink-0 z-30 mb-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-rose-50 dark:bg-rose-900/30 text-rose-600 flex items-center justify-center rounded-xl">
                        <FaUserNinja className="text-2xl" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">تنظیمات واگذاری گفتگو</h3>
                        <p className="text-xs text-gray-500 mt-1">مدیریت هوشمند توقف ربات و انتقال یکپارچه چت به اپراتور انسانی</p>
                    </div>
                </div>
                <Button loading={isSubmitting} variant="solid" icon={<HiOutlineSave />} onClick={handleSubmit(onSubmit)} className="bg-indigo-600">
                    ذخیره تغییرات
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto pb-10 scroll-smooth [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 dark:[&::-webkit-scrollbar-thumb]:bg-gray-700 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-300 dark:hover:[&::-webkit-scrollbar-thumb]:bg-gray-600">
                <Card className="p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm min-h-full bg-white dark:bg-gray-900">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64"><Spinner size="40px" className="text-indigo-500" /></div>
                    ) : (
                        <Form className="max-w-4xl mx-auto space-y-8 animate-[fadeIn_0.3s_ease-out]">

                            {/* بخش اول: شرایط توقف */}
                            <div className="bg-gray-50/50 dark:bg-gray-800/30 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 transition-colors hover:border-gray-200 dark:hover:border-gray-700">
                                <h4 className="flex items-center text-lg font-bold mb-6 text-gray-800 dark:text-gray-100">
                                    <HiOutlineLightningBolt className="text-amber-500 ml-2 text-xl" /> شرایط توقف ربات
                                    <InfoTooltip text="اینجا به ربات می‌گیم کی دست از کار بکشه! اگه مشتری کلمه خاصی گفت (مثل پشتیبانی)، یا فایلی فرستاد که ربات نمی‌فهمید، یا حتی اگه ربات چند بار متوالی جواب نامربوط داد، بلافاصله متوقف می‌شه تا شما وارد عمل بشید." />
                                </h4>

                                <div className="mb-6">
                                    <label className="text-sm font-medium mb-2 block text-gray-700 dark:text-gray-300">کلمات کلیدی (مثل: رسید، پرداخت، پشتیبانی)</label>
                                    <div className="flex gap-2 mb-3">
                                        <Input className="flex-1 rounded-xl" type="text" placeholder="کلمه جدید را بنویسید و اینتر بزنید..." value={keywordInput} onChange={(e) => setKeywordInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddKeyword() } }} />
                                        <Button type="button" className="rounded-xl" icon={<HiPlus />} onClick={handleAddKeyword}>افزودن</Button>
                                    </div>
                                    <div className="flex flex-wrap gap-2 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl min-h-[60px]">
                                        {keywords.map((word, i) => (
                                            <div key={i} className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-3 py-1.5 rounded-lg text-sm font-medium transition-all hover:bg-indigo-100">
                                                {word} <HiX className="cursor-pointer hover:text-red-500 transition-colors" onClick={() => setKeywords(keywords.filter(w => w !== word))} />
                                            </div>
                                        ))}
                                        {keywords.length === 0 && <span className="text-gray-400 text-sm italic my-auto mx-2">هنوز کلمه‌ای اضافه نشده است...</span>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Controller name="stopOnImageReceived" control={control} render={({ field }) => (
                                        <div className="flex items-center justify-between bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-sm transition-all">
                                            <div className="flex items-center gap-3">
                                                <HiOutlinePhotograph className="text-2xl text-blue-500" />
                                                <span className="text-sm font-medium">توقف در صورت ارسال عکس</span>
                                            </div>
                                            <Switcher checked={field.value} onChange={(val) => field.onChange(val)} />
                                        </div>
                                    )} />
                                    <Controller name="stopOnDocumentReceived" control={control} render={({ field }) => (
                                        <div className="flex items-center justify-between bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-sm transition-all">
                                            <div className="flex items-center gap-3">
                                                <HiOutlinePhotograph className="text-2xl text-emerald-500" />
                                                <span className="text-sm font-medium">توقف در صورت ارسال فایل</span>
                                            </div>
                                            <Switcher checked={field.value} onChange={(val) => field.onChange(val)} />
                                        </div>
                                    )} />
                                </div>

                                <div className="mt-6 w-full md:w-1/2">
                                    <div className="flex items-center mb-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            تعداد مجاز خطای ربات (0 = غیرفعال)
                                        </label>
                                        <InfoTooltip text="اگه ربات چند بار پشت سر هم جواب نامربوط بده یا منظور مشتری رو نفهمه، حسابی روی اعصاب می‌ره! اینجا تعیین می‌کنید بعد از چند تا سوتی متوالی، ربات مودبانه کنار بکشه و کار رو بسپاره به شما. عدد صفر هم یعنی این قابلیت کلاً خاموش بشه." />
                                    </div>
                                    <Controller name="fallbackLimit" control={control} render={({ field }) => (
                                        <Input className="rounded-xl" type="number" min={0} {...field} onChange={e => field.onChange(Number(e.target.value))} />
                                    )} />
                                </div>
                            </div>

                            {/* بخش دوم: هویت پنهان و تاخیر */}
                            <div className="bg-gray-50/50 dark:bg-gray-800/30 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 transition-colors hover:border-gray-200 dark:hover:border-gray-700">
                                <h4 className="flex items-center text-lg font-bold mb-6 text-gray-800 dark:text-gray-100">
                                    <HiOutlineChatAlt2 className="text-blue-500 ml-2 text-xl" /> کنترل رفتار ربات (Stealth Mode)
                                    <InfoTooltip text="در این بخش می‌توانید رفتار ربات را در زمانی که مشتری منتظر اپراتور است، مدیریت کنید." />
                                </h4>

                                {/* ۱. سکوت ربات در زمان انتظار */}
                                <Controller name="silenceBotDuringHandoff" control={control} render={({ field }) => (
                                    <div className="flex items-center justify-between bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700 mb-6 hover:shadow-sm transition-all">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">سکوت مطلق ربات در صف انتظار</span>
                                            <InfoTooltip text="اگر روشن باشد، ربات در مدتی که چت در لیست نیازمند بررسی است هیچ پاسخی به پیام‌های مشتری نمی‌دهد. اگر خاموش باشد، ربات تا رسیدن شما سعی می‌کند به سوالات مشتری جواب دهد." />
                                        </div>
                                        <Switcher checked={field.value} onChange={(val) => field.onChange(val)} />
                                    </div>
                                )} />

                                {/* ۲. کلید روشن/خاموش کردن ارسال پیام انتظار */}
                                <Controller name="enableHoldingMessage" control={control} render={({ field: switchField }) => (
                                    <div className="mb-6">
                                        <div className="flex items-center justify-between bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-sm transition-all">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">ارسال پیام «لطفاً منتظر بمانید» به مشتری</span>
                                                <InfoTooltip text="اگر این گزینه روشن باشد، به محض درخواست پشتیبانی، یک پیام خودکار برای مشتری ارسال می‌شود تا بداند درخواستش در حال پیگیری است." />
                                            </div>
                                            <Switcher checked={switchField.value} onChange={(val) => switchField.onChange(val)} />
                                        </div>

                                        {/* ۳. متن پیام انتظار (فقط وقتی سوییچ بالا روشن باشد نمایش داده می‌شود) */}
                                        {switchField.value && (
                                            <div className="mt-4 ml-2 animate-[fadeIn_0.3s_ease-out]">
                                                <div className="flex items-center mb-2">
                                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        متن پیام انتظار
                                                    </label>
                                                </div>
                                                <Controller name="holdingMessage" control={control} render={({ field }) => (
                                                    <Input textArea rows={2} className="rounded-xl resize-none border-indigo-200 focus:ring-indigo-500" placeholder="مثال: همکاران ما در حال بررسی موضوع هستند، لطفاً منتظر بمانید..." {...field} />
                                                )} />
                                            </div>
                                        )}
                                    </div>
                                )} />

                                {/* ۴. بازگشت خودکار */}
                                <div className="w-full border-t border-gray-200 dark:border-gray-700 pt-6">
                                    <div className="flex items-center mb-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            بازگشت خودکار کنترل به ربات بعد از سکوت اپراتور (دقیقه)
                                        </label>
                                        <InfoTooltip text="اگر مثلاً ۱۰ دقیقه نه شما پیامی دادید و نه مشتری، سیستم فرض می‌کند چت تمام شده و ربات خودش بی‌سروصدا دوباره فعال می‌شود." />
                                    </div>
                                    <Controller name="returnToBotAfterInactivityMinutes" control={control} render={({ field }) => (
                                        <Input type="number" className="w-full rounded-xl" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                                    )} />
                                </div>
                            </div>

                            {/* بخش سوم: اطلاع‌رسانی */}
                            <div className="bg-gray-50/50 dark:bg-gray-800/30 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 transition-colors hover:border-gray-200 dark:hover:border-gray-700">
                                <h4 className="flex items-center text-lg font-bold mb-6 text-gray-800 dark:text-gray-100">
                                    <HiOutlineBell className="text-rose-500 ml-2 text-xl" /> تنظیمات هشدار
                                    <InfoTooltip text="وقتی مشتری گیر افتاد و چت نیازمند بررسی شد، چطوری بهتون خبر بدیم؟" />
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <FormItem label="چه کسانی مطلع شوند؟">
                                        <Controller name="targetRole" control={control} render={({ field }) => (
                                            <div className="flex flex-col gap-3 mt-1">
                                                {[
                                                    { value: 1, title: 'فقط مدیران (Admins)', desc: 'ارسال هشدار فقط برای دسترسی‌های مدیریت' },
                                                    { value: 2, title: 'فقط اپراتورها (Operators)', desc: 'اطلاع‌رسانی اختصاصی به اپراتورهای پاسخگو' },
                                                    { value: 3, title: 'همه (All)', desc: 'ارسال هشدار برای تمامی اعضای سیستم' }
                                                ].map((option) => (
                                                    <label
                                                        key={option.value}
                                                        className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all duration-200 ${field.value === option.value
                                                            ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20 dark:border-indigo-400'
                                                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                                            }`}
                                                    >
                                                        <input
                                                            type="radio"
                                                            className="form-radio text-indigo-600 focus:ring-indigo-500 h-4 w-4 mt-0.5 transition-colors cursor-pointer"
                                                            checked={field.value === option.value}
                                                            onChange={() => field.onChange(option.value)}
                                                        />
                                                        <div className="flex flex-col">
                                                            <span className={`text-sm font-bold ${field.value === option.value
                                                                ? 'text-indigo-700 dark:text-indigo-400'
                                                                : 'text-gray-700 dark:text-gray-300'
                                                                }`}>
                                                                {option.title}
                                                            </span>
                                                            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                                {option.desc}
                                                            </span>
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                        )} />
                                    </FormItem>

                                    <div>
                                        <label className="text-sm font-medium mb-3 block text-gray-700 dark:text-gray-300">نحوه اطلاع‌رسانی</label>
                                        <div className="space-y-4">
                                            <label className="flex items-center gap-3 cursor-pointer group">
                                                <input type="checkbox" checked={selectedChannels.inApp} onChange={e => setSelectedChannels({ ...selectedChannels, inApp: e.target.checked })} className="form-checkbox text-indigo-600 rounded-md h-5 w-5 border-gray-300 transition-colors" />
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 transition-colors">نوتیفیکیشن داخل پنل (In-App)</span>
                                            </label>
                                            <label className="flex items-center gap-3 cursor-pointer group">
                                                <input type="checkbox" checked={selectedChannels.systemBot} onChange={e => setSelectedChannels({ ...selectedChannels, systemBot: e.target.checked })} className="form-checkbox text-indigo-600 rounded-md h-5 w-5 border-gray-300 transition-colors" />
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 transition-colors">ربات سیستمی پیام‌رسان‌ها (System Bot)</span>
                                            </label>
                                            <label className="flex items-center gap-3 cursor-pointer group">
                                                <input type="checkbox" checked={selectedChannels.sms} onChange={e => setSelectedChannels({ ...selectedChannels, sms: e.target.checked })} className="form-checkbox text-indigo-600 rounded-md h-5 w-5 border-gray-300 transition-colors" />
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 transition-colors">پیامک (SMS)</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Form>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default HandoffSettingsForm;