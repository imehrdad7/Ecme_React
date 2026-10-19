import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { FormItem, Form } from '@/components/ui/Form';
import toast from '@/components/ui/toast';
import Notification from '@/components/ui/Notification';
import { HiArrowRight, HiOutlineSave, HiOutlineCloudUpload, HiOutlineCheck, HiOutlinePhotograph, HiOutlineX, HiOutlineDocumentText } from 'react-icons/hi';
import { FaTelegramPlane, FaInstagram, FaWhatsapp, FaGlobe, FaCommentDots } from 'react-icons/fa';
import { PiRobot } from 'react-icons/pi';
import { BsBroadcast } from 'react-icons/bs';
import appConfig from '@/configs/app.config'
import { apiGetBots, BotResponse } from '@/services/botservice';
import { apiCreateBroadcast } from '@/services/broadcastService';
import { CreateBroadcastRequest } from './types';
import { apiUploadMedia, apiDeleteMedia } from '@/services/mediaService';
import { useSessionUser } from '@/store/authStore';

// آیکون اختصاصی بله
const BaleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 999.72" width="1em" height="1em" preserveAspectRatio="xMidYMid meet" {...props}>
        <defs>
            <linearGradient id="bale-gradient" x1="800.4" y1="93.39" x2="93.57" y2="800.23" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#46ce9e" />
                <stop offset="1" stopColor="#2a8365" />
            </linearGradient>
        </defs>
        <path d="M1010.36,547.36c-.73,17.77-2.6,36-6.85,53.41-1.54,16.48-6.36,32.54-10.76,48.52-5.14,19.5-12.48,38.33-19.9,57.17-6.77,15.66-14.35,30.91-22.26,46.08C942.92,766,934.93,779.2,926.29,792q-14.32,21-30.5,40.45c-11.18,13.13-22.68,26.09-35.15,37.92a503.68,503.68,0,0,1-51.3,43.55,453.44,453.44,0,0,1-48.44,31.56C742.06,956.74,722.16,966,702,974.6a548,548,0,0,1-65.89,21.86c-19.49,4.32-39,9.21-58.88,10.76-37,5.71-74.86,5.79-112.13,2.2-33.6-2.61-66.87-9.78-99.25-19.32l-.08-.58C210.19,944.18,82.32,816.07,34.94,661.2c-10.36-33.35-17.62-67.93-20.31-102.83-3.83-33.85-2-68-2.2-102q-.37-40.74-.08-81.64-.26-41.83,0-83.83c-.17-24-.08-47.95-.08-71.93s-.17-48.19.16-72.25c-.33-23.82-.08-47.63-.16-71.44-1.64-17.94,4.24-36.7,17.86-48.85C44.48,13.44,65.68,8.55,84,14.91c11.09,3.75,20.71,10.6,30.58,16.72,36,23.4,70.54,48.85,104.71,74.78a86.74,86.74,0,0,0,10.68-6.77A426.86,426.86,0,0,1,272.58,73.3a483.59,483.59,0,0,1,45.75-22.1c16.39-6.85,33.19-12.8,50.15-18.1,18.1-5,36.29-10.11,55-12.72a392.65,392.65,0,0,1,61.82-7.26,451.46,451.46,0,0,1,76.41,1.71A413.36,413.36,0,0,1,619,24c128.53,27,244.08,108.3,314.46,219a493,493,0,0,1,66.47,159.76c4.73,20.95,8.48,42.32,9.7,63.77A411.89,411.89,0,0,1,1010.36,547.36Z" transform="translate(-12 -12.14)" fill="url(#bale-gradient)" />
        <path d="M705.69,273.2a107.59,107.59,0,0,1,62.37,1.3c25.62,9.82,46.29,29.94,57.5,54.9,8.34,22.86,9.31,48.42.91,71.44-6.06,16.2-16.76,30.09-29.4,41.74q-16.7,16.49-33.21,33.14c-11.79,11.79-23.64,23.5-35.33,35.35-11.3,11.28-22.62,22.49-33.85,33.81-12.32,12.34-24.68,24.61-36.95,37-14,14-28.06,27.94-42,42-13.24,13.29-26.55,26.49-39.8,39.78s-26.77,26.71-40.1,40.11c-12.27,11.85-23.51,24.94-37.35,35.06a106.69,106.69,0,0,1-57.95,16C417,753.28,393.79,744,376.87,727.33q-78.53-78.44-157-156.94c-12.82-12.66-21.38-29.07-26-46.38-4.75-23.86-1.94-49.51,10.31-70.75,9.37-16.54,23.79-29.65,40.19-39a107.52,107.52,0,0,1,57.86-9.73c21.38,3.21,42,13,56.91,28.76Q401.7,476,444.37,518.5c8.63-8.18,16.9-16.73,25.19-25.27q18-17.31,35.24-35.35c11.36-10.68,22.33-21.82,33.07-33.12,7.74-6.88,14.75-14.51,22.07-21.8,12-11.68,23.75-23.59,35.49-35.51,11.21-10.83,22.11-21.95,33.07-33,11.79-11.5,23.28-23.28,35-34.87a105.75,105.75,0,0,1,42.21-26.37Z" transform="translate(-12 -12.14)" fill="#fff" />
    </svg>
);

const backendBaseUrl = appConfig.apiPrefix;

const getFullMediaUrl = (url: string | File) => {
    if (!url || typeof url !== 'string') return '';
    if (url.startsWith('http') || url.startsWith('blob:')) return url;
    return `${backendBaseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
};

const getPlatformDetails = (platformName: string) => {
    const name = platformName || '';
    switch (name) {
        case 'Telegram': return { icon: FaTelegramPlane, color: 'text-sky-500', bg: 'bg-sky-100 dark:bg-sky-900/40', border: 'border-sky-300' }
        case 'Instagram': return { icon: FaInstagram, color: 'text-pink-600', bg: 'bg-pink-100 dark:bg-pink-900/40', border: 'border-pink-300' }
        case 'WhatsApp': return { icon: FaWhatsapp, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/40', border: 'border-green-300' }
        case 'Web': return { icon: FaGlobe, color: 'text-indigo-500', bg: 'bg-indigo-100 dark:bg-indigo-900/40', border: 'border-indigo-300' }
        case 'Rubika': return { icon: FaCommentDots, color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/40', border: 'border-orange-300' }
        case 'Bale': return { icon: BaleIcon, color: 'text-teal-500', bg: 'bg-teal-100 dark:bg-teal-900/40', border: 'border-teal-300' }
        default: return { icon: PiRobot, color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-800/40', border: 'border-gray-300' }
    }
}

// شمای اعتبارسنجی فرم
const validationSchema = z.object({
    title: z.string({ required_error: 'عنوان پیام الزامی است' }).min(3, 'عنوان پیام بسیار کوتاه است'),
    content: z.string().optional(), // متن پیام دیگر اجباریِ مطلق نیست
    mediaUrl: z.string().optional(),
    selectedBots: z.array(z.object({
        botId: z.string(),
        targetChannelId: z.string().optional()
    })).min(1, 'انتخاب حداقل یک ربات فرستنده الزامی است')
}).superRefine((data, ctx) => {
    // 🎯 شرط هوشمند: اگر هم متن خالی بود و هم فایلی آپلود نشده بود، ارور بده
    const hasText = data.content && data.content.trim().length > 0;
    const hasMedia = data.mediaUrl && data.mediaUrl.trim().length > 0;

    if (!hasText && !hasMedia) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'باید حداقل متن پیام را بنویسید یا یک فایل آپلود کنید.',
            path: ['content'], // ارور را زیر کادر متن نشان می‌دهد
        });
    }
});

type BroadcastCreateFormSchema = z.infer<typeof validationSchema>;

const isImageUrl = (url: string) => {
    if (!url) return false;
    const lowerUrl = url.toLowerCase();
    return lowerUrl.endsWith('.jpg') || lowerUrl.endsWith('.jpeg') || lowerUrl.endsWith('.png') || lowerUrl.endsWith('.webp') || lowerUrl.endsWith('.gif');
}

const BroadcastCreate = () => {
    const navigate = useNavigate();
    const { user } = useSessionUser();
    const [isSubmitting, setSubmitting] = useState<boolean>(false);
    const [isUploading, setIsUploading] = useState<boolean>(false);

    const [bots, setBots] = useState<BotResponse[]>([]);
    const [isLoadingBots, setIsLoadingBots] = useState(true);

    const {
        handleSubmit,
        formState: { errors },
        control,
        setValue,
        watch
    } = useForm<BroadcastCreateFormSchema>({
        resolver: zodResolver(validationSchema),
        defaultValues: {
            title: '',
            content: '',
            mediaUrl: '',
            selectedBots: []
        }
    });

    const currentMediaUrl = watch('mediaUrl');

    useEffect(() => {
        const fetchBots = async () => {
            try {
                const result: any = await apiGetBots();
                const fetchedItems: BotResponse[] = result?.items || result?.data?.items || [];
                setBots(fetchedItems.filter(b => b.isActive));
            } catch (error) {
                toast.push(
                    <Notification title="خطا" type="danger">دریافت لیست ربات‌ها با خطا مواجه شد.</Notification>,
                    { placement: 'top-center' }
                );
            } finally {
                setIsLoadingBots(false);
            }
        };
        fetchBots();
    }, []);

    // متد آپلود فایل
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // بررسی حجم فایل (اختیاری - حداکثر 10 مگابایت)
        if (file.size > 10 * 1024 * 1024) {
            toast.push(<Notification title="خطا" type="warning">حجم فایل نباید بیشتر از 10 مگابایت باشد.</Notification>, { placement: 'top-center' });
            return;
        }

        setIsUploading(true);

        try {
            const formData = new FormData();
            formData.append('file', file);
            
            // 🚀 فراخوانی سرویس آپلود دقیقاً مشابه الگوی شما
            const response: any = await apiUploadMedia(formData);
            const uploadedUrl: string = response.url || response.data?.url || '';

            if (!uploadedUrl) throw new Error("آدرسی از سمت سرور دریافت نشد");

            // ذخیره آدرس آپلود شده در فرم
            setValue('mediaUrl', uploadedUrl, { shouldValidate: true });

            toast.push(<Notification title="آپلود موفق" type="success">فایل با موفقیت آپلود شد.</Notification>, { placement: 'top-center' });

        } catch (error) {
            toast.push(<Notification title="خطا در آپلود" type="danger">مشکلی در آپلود فایل پیش آمد.</Notification>, { placement: 'top-center' });
        } finally {
            setIsUploading(false);
            e.target.value = ''; // ریست کردن اینپوت برای امکان انتخاب مجدد همان فایل
        }
    };

    const handleRemoveFile = async () => {
        const currentUrl = currentMediaUrl; // مقداری که از watch('mediaUrl') می‌آید

        if (!currentUrl) return;

        // اگر آدرس یک فایل واقعی روی سرور است (و مثلا blob مرورگر نیست)
        if (typeof currentUrl === 'string' && !currentUrl.startsWith('blob:')) {
            try {
                if (user?.companyId) {
                    await apiDeleteMedia(user.companyId, currentUrl);
                }
            } catch (error) {
                console.error("خطا در حذف فایل از سرور:", error);
                // معمولاً حتی اگر پاک کردن از سرور خطا داد، ما از UI حذفش می‌کنیم تا کاربر کارش قفل نشود
            }
        }

        // پاک کردن آدرس از فرم
        setValue('mediaUrl', '', { shouldValidate: true });

        toast.push(
            <Notification title="حذف موفق" type="success">فایل با موفقیت پاک شد.</Notification>,
            { placement: 'top-center' }
        );
    };

    const handleSubmitData = async (values: BroadcastCreateFormSchema) => {
        setSubmitting(true);
        try {
            const payload: CreateBroadcastRequest = {
                title: values.title,
                content: values.content || '',
                mediaUrl: values.mediaUrl || null,
                destinations: values.selectedBots.map(b => ({
                    botId: b.botId,
                    targetChannelId: b.targetChannelId || null
                }))
            };

            await apiCreateBroadcast(payload);

            toast.push(
                <Notification title="در صف ارسال" type="success" duration={4000}>
                    پیام شما با موفقیت در صف پردازش قرار گرفت.
                </Notification>,
                { placement: 'top-center' }
            );
            navigate('/concepts/BroadcastList');
        } catch (error: any) {
            toast.push(
                <Notification title="خطای ارتباطی" type="danger" duration={5000}>
                    {error?.response?.data?.Message || error?.message || 'خطا در ارتباط با سرور.'}
                </Notification>,
                { placement: 'top-center' }
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col gap-4 md:gap-6 relative pb-8 md:pb-10 w-full h-full">

            {/* Header Sticky */}
            <div className="sticky top-[55px] md:top-[70px] z-30 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md shadow-sm border border-gray-100 dark:border-gray-700 rounded-xl md:rounded-2xl p-3 md:p-4 flex flex-row items-center justify-between transition-all mt-2">
                <div className="flex items-center gap-2 md:gap-4">
                    <Button
                        shape="circle"
                        variant="plain"
                        className="text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 w-8 h-8 md:w-10 md:h-10 min-w-[32px]"
                        icon={<HiArrowRight className="text-lg md:text-xl" />}
                        onClick={() => navigate('/concepts/BroadcastList')}
                    />
                    <div>
                        <h3 className="text-sm md:text-xl font-extrabold text-gray-800 dark:text-gray-100">
                            ایجاد پیام همگانی
                        </h3>
                        <p className="text-gray-500 text-[10px] md:text-sm mt-0.5 hidden sm:block">
                            ارسال پیام یکپارچه به تمامی پلتفرم‌ها
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 md:gap-3 animate-[fadeIn_0.3s_ease-out]">
                    <Button
                        type="button"
                        size="sm"
                        variant="default"
                        className="bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 text-xs md:text-sm px-2 md:px-4"
                        onClick={() => navigate('/concepts/broadcasts/list')}
                        disabled={isSubmitting}
                    >
                        انصراف
                    </Button>
                    <Button
                        form="broadcast-create-form"
                        size="sm"
                        loading={isSubmitting}
                        variant="solid"
                        type="submit"
                        icon={<HiOutlineSave />}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white border-0 text-xs md:text-sm px-2 md:px-4 shadow-md shadow-indigo-200 dark:shadow-none"
                    >
                        <span className="hidden sm:inline">قرارگیری در صف</span>
                        <span className="inline sm:hidden">ثبت</span>
                    </Button>
                </div>
            </div>

            <Card className="flex-1 w-full flex flex-col transition-colors duration-700 ease-in-out border bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 p-4 md:p-8 rounded-2xl">

                <Form id="broadcast-create-form" onSubmit={handleSubmit(handleSubmitData)} className="flex flex-col w-full relative gap-8 animate-[fadeIn_0.3s_ease-out]">

                    {/* Section 1: Content */}
                    <div className="flex flex-col gap-5">
                        <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-3">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 flex items-center justify-center">
                                <BsBroadcast className="text-lg" />
                            </div>
                            <h4 className="text-base font-bold text-gray-800 dark:text-gray-200">
                                اطلاعات پیام
                            </h4>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            <FormItem
                                label="عنوان پیام (برای پیگیری در پنل)"
                                invalid={Boolean(errors.title)}
                                errorMessage={errors.title?.message}
                                className="text-sm"
                            >
                                <Controller
                                    name="title"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            type="text"
                                            placeholder="مثلاً: اطلاعیه قطعی سرور"
                                            autoComplete="off"
                                            className="bg-gray-50/50 dark:bg-gray-900/50"
                                            {...field}
                                        />
                                    )}
                                />
                            </FormItem>

                            <FormItem
                                label="متن ارسالی به کاربران"
                                invalid={Boolean(errors.content)}
                                errorMessage={errors.content?.message}
                                className="text-sm"
                            >
                                <Controller
                                    name="content"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            textArea
                                            placeholder="متن پیام خود را بنویسید..."
                                            className="bg-gray-50/50 dark:bg-gray-900/50 min-h-[120px] resize-y"
                                            {...field}
                                        />
                                    )}
                                />
                            </FormItem>

                            <FormItem
                                label="پیوست مدیا (تصویر، ویدیو یا فایل)"
                                invalid={Boolean(errors.mediaUrl)}
                                errorMessage={errors.mediaUrl?.message}
                                className="text-sm"
                            >
                                <div className="flex flex-col gap-3">
                                    <input
                                        type="file"
                                        id="file-upload"
                                        className="hidden"
                                        onChange={handleFileUpload}
                                        accept="image/*,video/*,.pdf,.doc,.docx"
                                    />

                                    {!currentMediaUrl ? (
                                        <label
                                            htmlFor="file-upload"
                                            className={`w-full h-28 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${isUploading ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-300 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                                        >
                                            {isUploading ? (
                                                <>
                                                    <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">در حال آپلود فایل...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="w-10 h-10 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center shadow-sm">
                                                        <HiOutlineCloudUpload className="text-xl text-indigo-500" />
                                                    </div>
                                                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">برای آپلود فایل اینجا کلیک کنید (حداکثر ۱۰ مگابایت)</span>
                                                </>
                                            )}
                                        </label>
                                    ) : (
                                        <div className="relative w-fit group">
                                            <div className="w-32 h-32 md:w-40 md:h-40 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-gray-100 dark:bg-gray-800 shadow-sm flex items-center justify-center">
                                                {isImageUrl(currentMediaUrl) ? (
                                                    <img
                                                        src={getFullMediaUrl(currentMediaUrl)} // 👈 استفاده از متد آدرس کامل
                                                        alt="پیوست آپلود شده"
                                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                    />
                                                ) : (
                                                    <div className="flex flex-col items-center gap-2 text-indigo-500">
                                                        <HiOutlineDocumentText className="text-4xl" />
                                                        <span className="text-[11px] font-bold">فایل پیوست شد</span>
                                                    </div>
                                                )}
                                            </div>

                                            <button
                                                type="button"
                                                onClick={handleRemoveFile}
                                                className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow-lg transform transition-transform hover:scale-110"
                                                title="حذف فایل"
                                            >
                                                <HiOutlineX className="text-sm" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </FormItem>
                        </div>
                    </div>

                    <div className="flex flex-col gap-5 pt-4">
                        <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 flex items-center justify-center">
                                <PiRobot className="text-xl" />
                            </div>
                            <div className="flex flex-1 items-center justify-between">
                                <h4 className="text-base font-bold text-gray-800 dark:text-gray-200">
                                    ربات‌های فرستنده
                                </h4>
                                {errors.selectedBots && (
                                    <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded-md">
                                        {errors.selectedBots.message}
                                    </span>
                                )}
                            </div>
                        </div>

                        {isLoadingBots ? (
                            <div className="flex flex-col items-center justify-center py-8 gap-3">
                                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-gray-500 text-sm">در حال بارگذاری ربات‌ها...</span>
                            </div>
                        ) : bots.length > 0 ? (
                            <Controller
                                name="selectedBots"
                                control={control}
                                render={({ field }) => {
                                    const toggleBot = (botId: string) => {
                                        const currentSelected = field.value || [];
                                        const exists = currentSelected.find((b: any) => b.botId === botId);

                                        if (exists) {
                                            // اگر تیک داشت، برش می‌داریم
                                            field.onChange(currentSelected.filter((b: any) => b.botId !== botId));
                                        } else {
                                            // اگر تیک نداشت، اضافه‌اش می‌کنیم
                                            field.onChange([...currentSelected, { botId, targetChannelId: '' }]);
                                        }
                                    };

                                    const updateChannelId = (botId: string, channelId: string) => {
                                        const currentSelected = field.value || [];
                                        const updated = currentSelected.map((b: any) =>
                                            b.botId === botId ? { ...b, targetChannelId: channelId } : b
                                        );
                                        field.onChange(updated);
                                    };

                                    return (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                                            {bots.map(bot => {
                                                const selectedItem = (field.value || []).find((b: any) => b.botId === bot.id);
                                                const isSelected = !!selectedItem;
                                                const platformNameStr = (bot as any).platformName;
                                                const platform = getPlatformDetails(platformNameStr);
                                                const PlatformIcon = platform.icon;

                                                // پلتفرم‌هایی که معمولاً نیاز به گرفتن آیدی کانال از کاربر دارند
                                                const needsChannelInput = ['Telegram', 'Bale', 'Rubika'].includes(platformNameStr);

                                                return (
                                                    <div key={bot.id} className={`flex flex-col gap-2 p-3 md:p-4 rounded-xl border-2 transition-all duration-300 ${isSelected ? `${platform.border}${platform.bg} shadow-md` : 'border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30 hover:border-gray-300'}`}>
                                                        <div className="relative cursor-pointer flex items-center gap-3" onClick={() => toggleBot(bot.id)}>
                                                            {isSelected && (
                                                                <div className="absolute top-0 left-0 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center text-white shadow-sm">
                                                                    <HiOutlineCheck className="text-sm" />
                                                                </div>
                                                            )}
                                                            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-white dark:bg-gray-800 shadow-sm`}>
                                                                <PlatformIcon className={`text-xl md:text-2xl ${platform.color}`} />
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className={`font-bold text-sm md:text-base ${isSelected ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                                                                    {bot.name}
                                                                </span>
                                                                <span className="text-xs text-gray-500 mt-0.5">پلتفرم: {platformNameStr}</span>
                                                            </div>
                                                        </div>

                                                        {/* 🎯 اگر ربات انتخاب شد و نیاز به آیدی کانال داشت، اینپوت باز می‌شود */}
                                                        {/* 🎯 اگر ربات انتخاب شد و نیاز به آیدی کانال داشت، اینپوت باز می‌شود */}
                                                        {isSelected && needsChannelInput && (
                                                            <div
                                                                className="mt-3 flex flex-col gap-1.5 animate-[fadeIn_0.3s_ease-out]"
                                                                onClick={(e) => e.stopPropagation()} // جلوگیری از برداشته شدن تیک هنگام کلیک روی اینپوت یا متن زیرش
                                                            >
                                                                <input
                                                                    type="text"
                                                                    dir="ltr"
                                                                    placeholder="آیدی کانال (مثلا Bamasan@)"
                                                                    value={selectedItem.targetChannelId || ''}
                                                                    onChange={(e) => updateChannelId(bot.id, e.target.value)}
                                                                    className="w-full h-9 px-3 text-xs md:text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                                                                />
                                                                <span className="text-[10px] md:text-[11px] text-gray-500 dark:text-gray-400 font-medium leading-relaxed pr-1">
                                                                    * برای ارسال گروهی به تمام کاربران در <strong className="text-gray-700 dark:text-gray-200">PV</strong>، این کادر را خالی بگذارید.
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    );
                                }}
                            />
                        ) : (
                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 flex flex-col items-center justify-center text-center border border-gray-100 dark:border-gray-800">
                                <PiRobot className="text-3xl text-gray-400 mb-2" />
                                <span className="font-bold text-gray-700 dark:text-gray-300">هیچ ربات فعالی یافت نشد!</span>
                                <span className="text-sm text-gray-500 mt-1">از بخش مدیریت، حداقل یک ربات را فعال کنید.</span>
                            </div>
                        )}
                    </div>
                </Form>
            </Card>

            <style>{`
                @keyframes fadeIn {
                    0% { opacity: 0; transform: translateY(10px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default BroadcastCreate;