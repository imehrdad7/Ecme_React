import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { HiArrowRight, HiOutlineSave, HiOutlineRefresh } from 'react-icons/hi'
import { FaTelegramPlane, FaInstagram, FaWhatsapp, FaGlobe, FaCommentDots, FaQrcode } from 'react-icons/fa'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { FormItem, Form } from '@/components/ui/Form'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { apiCreateBot, apiActivateBot, apiDeleteBot } from '@/services/botservice'
import { useBotSocket } from '@/utils/hooks/useBotSocket';
import { useSessionUser, getToken } from '@/store/authStore';



const PLATFORM_ENUMS: Record<string, number> = {
    'WhatsApp': 1,
    'Telegram': 2,
    'Instagram': 3,
    'Web': 4,
    'Rubika': 5,
    'Bale': 6
}

const BaleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1000 999.72"
        width="1em"
        height="1em"
        preserveAspectRatio="xMidYMid meet"
        {...props}
    >
        <defs>
            <linearGradient id="bale-gradient" x1="800.4" y1="93.39" x2="93.57" y2="800.23" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#46ce9e" />
                <stop offset="1" stopColor="#2a8365" />
            </linearGradient>
        </defs>
        <g id="File">
            <g>
                <path d="M1010.36,547.36c-.73,17.77-2.6,36-6.85,53.41-1.54,16.48-6.36,32.54-10.76,48.52-5.14,19.5-12.48,38.33-19.9,57.17-6.77,15.66-14.35,30.91-22.26,46.08C942.92,766,934.93,779.2,926.29,792q-14.32,21-30.5,40.45c-11.18,13.13-22.68,26.09-35.15,37.92a503.68,503.68,0,0,1-51.3,43.55,453.44,453.44,0,0,1-48.44,31.56C742.06,956.74,722.16,966,702,974.6a548,548,0,0,1-65.89,21.86c-19.49,4.32-39,9.21-58.88,10.76-37,5.71-74.86,5.79-112.13,2.2-33.6-2.61-66.87-9.78-99.25-19.32l-.08-.58C210.19,944.18,82.32,816.07,34.94,661.2c-10.36-33.35-17.62-67.93-20.31-102.83-3.83-33.85-2-68-2.2-102q-.37-40.74-.08-81.64-.26-41.83,0-83.83c-.17-24-.08-47.95-.08-71.93s-.17-48.19.16-72.25c-.33-23.82-.08-47.63-.16-71.44-1.64-17.94,4.24-36.7,17.86-48.85C44.48,13.44,65.68,8.55,84,14.91c11.09,3.75,20.71,10.6,30.58,16.72,36,23.4,70.54,48.85,104.71,74.78a86.74,86.74,0,0,0,10.68-6.77A426.86,426.86,0,0,1,272.58,73.3a483.59,483.59,0,0,1,45.75-22.1c16.39-6.85,33.19-12.8,50.15-18.1,18.1-5,36.29-10.11,55-12.72a392.65,392.65,0,0,1,61.82-7.26,451.46,451.46,0,0,1,76.41,1.71A413.36,413.36,0,0,1,619,24c128.53,27,244.08,108.3,314.46,219a493,493,0,0,1,66.47,159.76c4.73,20.95,8.48,42.32,9.7,63.77A411.89,411.89,0,0,1,1010.36,547.36Z" transform="translate(-12 -12.14)" fill="url(#bale-gradient)" />
                <path d="M705.69,273.2a107.59,107.59,0,0,1,62.37,1.3c25.62,9.82,46.29,29.94,57.5,54.9,8.34,22.86,9.31,48.42.91,71.44-6.06,16.2-16.76,30.09-29.4,41.74q-16.7,16.49-33.21,33.14c-11.79,11.79-23.64,23.5-35.33,35.35-11.3,11.28-22.62,22.49-33.85,33.81-12.32,12.34-24.68,24.61-36.95,37-14,14-28.06,27.94-42,42-13.24,13.29-26.55,26.49-39.8,39.78s-26.77,26.71-40.1,40.11c-12.27,11.85-23.51,24.94-37.35,35.06a106.69,106.69,0,0,1-57.95,16C417,753.28,393.79,744,376.87,727.33q-78.53-78.44-157-156.94c-12.82-12.66-21.38-29.07-26-46.38-4.75-23.86-1.94-49.51,10.31-70.75,9.37-16.54,23.79-29.65,40.19-39a107.52,107.52,0,0,1,57.86-9.73c21.38,3.21,42,13,56.91,28.76Q401.7,476,444.37,518.5c8.63-8.18,16.9-16.73,25.19-25.27q18-17.31,35.24-35.35c11.36-10.68,22.33-21.82,33.07-33.12,7.74-6.88,14.75-14.51,22.07-21.8,12-11.68,23.75-23.59,35.49-35.51,11.21-10.83,22.11-21.95,33.07-33,11.79-11.5,23.28-23.28,35-34.87a105.75,105.75,0,0,1,42.21-26.37Z" transform="translate(-12 -12.14)" fill="#fff" />
            </g>
        </g>
    </svg>
)

const validationSchema = z.object({
    channel: z.string({ required_error: 'انتخاب پلتفرم الزامی است' }),
    name: z.string({ required_error: 'لطفاً نام ربات را وارد کنید' })
        .min(3, { message: 'نام ربات باید حداقل ۳ کاراکتر باشد' }),
    token: z.string().optional(),
    description: z.string().optional(),
}).superRefine((data, ctx) => {
    const noTokenPlatforms = ['WhatsApp', 'Instagram'];
    if (!noTokenPlatforms.includes(data.channel) && (!data.token || data.token.length < 5)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'توکن وارد شده معتبر نیست',
            path: ['token'],
        });
    }
});

type BotCreateFormSchema = z.infer<typeof validationSchema>

const channelCards = [
    {
        value: 'Telegram', label: 'تلگرام', icon: FaTelegramPlane,
        color: 'text-sky-500 dark:text-sky-400',
        bg: 'bg-sky-100 dark:bg-sky-900/40',
        border: 'border-sky-300 dark:border-sky-600',
        containerBg: 'bg-sky-50/90 dark:bg-sky-900/20 border-sky-200 dark:border-sky-800/40',
        disabled: false
    },
    {
        value: 'Instagram', label: 'اینستاگرام', icon: FaInstagram,
        color: 'text-pink-600 dark:text-pink-400',
        bg: 'bg-gradient-to-tr from-amber-100 via-pink-100 to-fuchsia-100 dark:from-amber-900/40 dark:via-pink-900/40 dark:to-fuchsia-900/40',
        border: 'border-pink-300 dark:border-pink-600',
        containerBg: 'bg-gradient-to-br from-amber-50/80 via-pink-50/80 to-purple-50/80 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800/40',
        disabled: true
    },
    {
        value: 'WhatsApp', label: 'واتس‌اپ', icon: FaWhatsapp,
        color: 'text-green-500 dark:text-green-400',
        bg: 'bg-green-100 dark:bg-green-900/40',
        border: 'border-green-300 dark:border-green-600',
        containerBg: 'bg-green-50/90 dark:bg-green-900/20 border-green-200 dark:border-green-800/40',
        disabled: false
    },
    {
        value: 'Bale', label: 'بله', icon: BaleIcon,
        color: 'text-gray-400 dark:text-gray-500',
        bg: 'bg-gray-100 dark:bg-gray-800/30',
        border: 'border-gray-200 dark:border-gray-700',
        containerBg: '',
        disabled: false
    },
    {
        value: 'Rubika', label: 'روبیکا', icon: FaCommentDots,
        color: 'text-gray-400 dark:text-gray-500',
        bg: 'bg-gray-100 dark:bg-gray-800/30',
        border: 'border-gray-200 dark:border-gray-700',
        containerBg: '',
        disabled: true
    },
    {
        value: 'Web', label: 'ویجت سایت', icon: FaGlobe,
        color: 'text-indigo-500 dark:text-indigo-400',
        bg: 'bg-indigo-100 dark:bg-indigo-900/40',
        border: 'border-indigo-300 dark:border-indigo-600',
        containerBg: 'bg-indigo-50/90 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800/40',
        disabled: true
    },

]

const BotCreate = () => {
    const navigate = useNavigate()
    const [isSubmitting, setSubmitting] = useState<boolean>(false)
    const [qrCodeData, setQrCodeData] = useState<string | null>(null)
    const [resolvedToken, setResolvedToken] = useState<string | null>(null);
    const [timeLeft, setTimeLeft] = useState(17);
    const [isWaitingNextQr, setIsWaitingNextQr] = useState(false);
    const createdBotIdRef = useRef<string | null>(null);

    useEffect(() => {
        const fetchToken = async () => {
            const t = await getToken();
            setResolvedToken(t);
        };
        fetchToken();
    }, []);

    useEffect(() => {
        if (qrCodeData && qrCodeData !== "LOADING") {
            setTimeLeft(17);
            setIsWaitingNextQr(false);
        }
    }, [qrCodeData]);

    useEffect(() => {
        if (!qrCodeData || qrCodeData === "LOADING" || isWaitingNextQr) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setIsWaitingNextQr(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [qrCodeData, isWaitingNextQr]);

    const { isConnected } = useBotSocket({
        token: resolvedToken,
        onReceiveQrCode: (botId, qrBase64) => {
            setQrCodeData(qrBase64);
        },
        onReceiveWhatsAppStatus: (botId, status) => {
            debugger
            if (status === 'connected') {
                setQrCodeData(null);
                toast.push(
                    <Notification title="اتصال موفق" type="success" duration={4000}>
                        ربات واتس‌اپ با موفقیت متصل شد. در حال انتقال...
                    </Notification>,
                    { placement: 'top-center' }
                );

                setTimeout(() => {
                    navigate('/concepts/bots/bot-list');
                }, 1500);
            }
            else if (status === 'QrScanTimeout') {

                setQrCodeData(null);
                toast.push(
                    <Notification title="پایان مهلت اسکن" type="warning" duration={7000}>
                        شما ۵ بار فرصت اسکن داشتید اما اسکن انجام نشد. ارتباط موقتاً قطع شد، لطفاً چند دقیقه دیگر مجدداً تلاش کنید.
                    </Notification>,
                    { placement: 'top-center' }
                );
            }
            else if (status === 'disconnected') {
                setQrCodeData(null);

                // پیام مناسب بر اساس نوع قطعی
                const msgTitle = "ارتباط قطع شد";
                const msgBody = "ارتباط ربات با واتس‌اپ قطع شده است.";

                toast.push(
                    <Notification title={msgTitle} type="warning" duration={7000}>
                        {msgBody}
                    </Notification>,
                    { placement: 'top-center' }
                );
            }
        }
    });

    const {
        handleSubmit,
        formState: { errors },
        control,
        watch,
        setValue,
    } = useForm<BotCreateFormSchema>({
        resolver: zodResolver(validationSchema),
    })

    const selectedChannel = watch('channel')
    const activeCard = channelCards.find(c => c.value === selectedChannel)

    const handleSubmitData = async (values: BotCreateFormSchema) => {
        setSubmitting(true)
        try {
            const platformId = PLATFORM_ENUMS[values.channel];

            const result = await apiCreateBot({
                platform: platformId,
                name: values.name,
                token: ['WhatsApp', 'Instagram'].includes(values.channel) ? '' : values.token,
                description: values.description || ''
            });

            if (result) {
                const newBotId = result;
                if (newBotId) {
                    try {
                        createdBotIdRef.current = newBotId;

                        await apiActivateBot(newBotId);
                        if (values.channel === 'WhatsApp') {
                            setQrCodeData("LOADING");

                            toast.push(
                                <Notification title="در حال برقراری ارتباط" type="info" duration={5000}>
                                    در حال دریافت بارکد از سرور واتس‌اپ، لطفاً چند ثانیه صبر کنید...
                                </Notification>,
                                { placement: 'top-center' }
                            );
                        }
                        else {
                            toast.push(
                                <Notification title="موفقیت‌آمیز" type="success" duration={4000}>
                                    ربات {values.name} با موفقیت ایجاد و به پلتفرم متصل شد.
                                </Notification>,
                                { placement: 'top-center' }
                            )
                            setTimeout(() => {
                                navigate('/concepts/bots/bot-list')
                            }, 1000);
                        }
                    }

                    catch (activationError) {
                        toast.push(
                            <Notification title="ایجاد شد (بدون اتصال)" type="warning" duration={6000}>
                                ربات ساخته شد، اما در ارتباط اولیه با پلتفرم مشکلی پیش آمد. می‌توانید از لیست ربات‌ها مجدداً تلاش کنید.
                            </Notification>,
                            { placement: 'top-center' }
                        )
                        setTimeout(() => navigate('/concepts/bots/bot-list'), 1500);
                    }
                }
            }
        }
        catch (error: any) {
            console.error('Bot creation error:', error)
            const errorMessage =
                error?.response?.data?.message ||
                error?.message ||
                'مشکلی در برقراری ارتباط با سرور رخ داد. لطفاً مجدداً تلاش کنید.'

            toast.push(
                <Notification title="خطای ارتباطی" type="danger" duration={5000}>
                    {errorMessage}
                </Notification>,
                { placement: 'top-center' }
            )
        } finally {
            setSubmitting(false)
        }
    }
    const handleCancelScan = async () => {
        const targetBotId = createdBotIdRef.current;
        setQrCodeData("LOADING");
        setIsWaitingNextQr(true);
        debugger
        try {
            if (targetBotId) {
                await apiDeleteBot(targetBotId);
            }
        } catch (error) {
            console.error("خطا در توقف نشست واتس‌اپ:", error);
        } finally {
            navigate('/concepts/bots/bot-list');
        }
    };

    return (
        <div className="flex flex-col gap-6 relative pb-10">
            {!qrCodeData && (
                <div className="sticky top-[55px] md:top-[70px] z-30 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md shadow-sm border border-gray-100 dark:border-gray-700 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all mt-2">
                    <div className="flex items-center gap-4">
                        <Button
                            shape="circle"
                            variant="plain"
                            className="text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                            icon={<HiArrowRight className="text-xl" />}
                            onClick={() => navigate('/concepts/bots/bot-list')}
                        />
                        <div>
                            <h3 className="text-xl font-extrabold text-gray-800 dark:text-gray-100">
                                ایجاد ربات جدید
                            </h3>
                            <p className="text-gray-500 text-sm mt-0.5 hidden md:block">
                                مراحل اتصال ربات به پلتفرم را تکمیل کنید
                            </p>
                        </div>
                    </div>

                    {selectedChannel && activeCard && (
                        <div className="flex items-center gap-3 animate-[fadeSlideUp_0.3s_ease-out_forwards]">
                            <Button
                                type="button"
                                size="sm"
                                variant="default"
                                className="bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700"
                                onClick={() => navigate('/concepts/bots/bot-list')}
                                disabled={isSubmitting}
                            >
                                انصراف
                            </Button>
                            <Button
                                form="bot-create-form"
                                size="sm"
                                loading={isSubmitting}
                                variant="solid"
                                type="submit"
                                icon={<HiOutlineSave />}
                                className={`${activeCard.value === 'WhatsApp' ? 'bg-green-600 hover:bg-green-500 text-white border-0' : 'bg-purple-600 hover:bg-purple-500 text-white'}`}
                            >
                                ایجاد و اتصال
                            </Button>
                        </div>
                    )}
                </div>
            )}

            <Card className={`flex-1 w-full flex flex-col transition-colors duration-700 ease-in-out border ${activeCard ? activeCard.containerBg : 'bg-white dark:bg-gray-800 border-transparent'}`}>

                {/* 🌟 بخش نمایش QR Code (اگر وجود داشته باشد جایگزین فرم می‌شود) */}
                {qrCodeData ? (
                    // 🌟 تغییر کلیدی: flex-col-reverse باعث می‌شود اسکنر در موبایل بیاید بالای صفحه
                    <div className="flex flex-col-reverse lg:flex-row items-center justify-between gap-10 lg:gap-12 w-full max-w-5xl mx-auto py-4 lg:py-8 animate-[fadeIn_0.6s_ease-out_forwards]">

                        {/* ستون راست (در موبایل می‌رود پایین): متن‌ها و راهنما */}
                        <div className="flex-1 flex flex-col items-center lg:items-start w-full space-y-6 lg:space-y-8">
                            <div className="text-center lg:text-right w-full">
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs lg:text-sm font-bold mb-4 border border-green-200 dark:border-green-800/50 shadow-sm">
                                    <span className="relative flex h-2 w-2 lg:h-2.5 lg:w-2.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 lg:h-2.5 lg:w-2.5 bg-green-500"></span>
                                    </span>
                                    منتظر اسکن شما
                                </div>
                                <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-2 lg:mb-4 tracking-tight">
                                    اتصال به <span className="text-transparent bg-clip-text bg-gradient-to-l from-green-400 to-emerald-600">واتس‌اپ</span>
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-sm lg:text-lg max-w-sm mx-auto lg:mx-0">
                                    برای همگام‌سازی، این ۳ قدم ساده را طی کنید:
                                </p>
                            </div>

                            <div className="space-y-3 lg:space-y-4 w-full max-w-md">
                                <div className="flex items-center lg:items-start gap-3 lg:gap-4 p-3 lg:p-4 rounded-2xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-100 dark:border-gray-700 transition-all hover:border-green-300 dark:hover:border-green-700 hover:shadow-md">
                                    <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-xl bg-gray-100 dark:bg-gray-900 text-green-600 font-bold flex items-center justify-center flex-shrink-0 shadow-inner text-sm lg:text-base">۱</div>
                                    <p className="text-gray-700 dark:text-gray-300 text-xs lg:text-base font-medium flex-1 text-right">اپلیکیشن واتس‌اپ را روی گوشی باز کنید.</p>
                                </div>

                                <div className="flex items-center lg:items-start gap-3 lg:gap-4 p-3 lg:p-4 rounded-2xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-100 dark:border-gray-700 transition-all hover:border-green-300 dark:hover:border-green-700 hover:shadow-md">
                                    <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-xl bg-gray-100 dark:bg-gray-900 text-green-600 font-bold flex items-center justify-center flex-shrink-0 shadow-inner text-sm lg:text-base">۲</div>
                                    <p className="text-gray-700 dark:text-gray-300 text-xs lg:text-base font-medium leading-relaxed flex-1 text-right">
                                        به تنظیمات رفته و <strong className="text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-900 px-1.5 py-0.5 rounded text-[10px] lg:text-sm mx-1">Linked Devices</strong> را انتخاب کنید.
                                    </p>
                                </div>

                                <div className="flex items-center lg:items-start gap-3 lg:gap-4 p-3 lg:p-4 rounded-2xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-100 dark:border-gray-700 transition-all hover:border-green-300 dark:hover:border-green-700 hover:shadow-md">
                                    <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-xl bg-green-50 dark:bg-green-900/30 text-green-600 font-bold flex items-center justify-center flex-shrink-0 border border-green-200 dark:border-green-800/50 shadow-inner text-sm lg:text-base">۳</div>
                                    <p className="text-gray-700 dark:text-gray-300 text-xs lg:text-base font-medium flex-1 text-right">دوربین را روبه‌روی این بارکد بگیرید.</p>
                                </div>
                            </div>

                            <Button
                                variant="plain"
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 px-0 text-sm lg:text-base"
                                onClick={handleCancelScan}                            >
                                انصراف و بازگشت به لیست ربات‌ها
                            </Button>
                        </div>

                        {/* ستون چپ (در موبایل می‌آید بالا): اسکنر شیشه‌ای و مدرن */}
                        <div className="flex-1 flex justify-center w-full lg:justify-end">
                            <div className="relative p-0.5 lg:p-1 rounded-[2rem] lg:rounded-[2.5rem] bg-gradient-to-tr from-green-400/30 via-transparent to-emerald-600/30 shadow-[0_0_30px_rgba(16,185,129,0.15)] lg:shadow-[0_0_40px_rgba(16,185,129,0.15)] w-full max-w-[300px] sm:max-w-[340px] lg:max-w-none">

                                {/* پنل Glassmorphism */}
                                <div className="relative bg-white/70 dark:bg-gray-900/80 backdrop-blur-2xl border border-white/60 dark:border-gray-700/60 rounded-[2rem] p-6 lg:p-8 flex flex-col items-center">

                                    {/* گوشه‌های دوربین متناسب با موبایل و دسکتاپ */}
                                    <div className="absolute top-4 left-4 lg:top-6 lg:left-6 w-8 h-8 lg:w-10 lg:h-10 border-t-[3px] border-l-[3px] lg:border-t-4 lg:border-l-4 border-green-500 rounded-tl-xl lg:rounded-tl-2xl opacity-80"></div>
                                    <div className="absolute top-4 right-4 lg:top-6 lg:right-6 w-8 h-8 lg:w-10 lg:h-10 border-t-[3px] border-r-[3px] lg:border-t-4 lg:border-r-4 border-green-500 rounded-tr-xl lg:rounded-tr-2xl opacity-80"></div>
                                    <div className="absolute bottom-4 left-4 lg:bottom-6 lg:left-6 w-8 h-8 lg:w-10 lg:h-10 border-b-[3px] border-l-[3px] lg:border-b-4 lg:border-l-4 border-green-500 rounded-bl-xl lg:rounded-bl-2xl opacity-80"></div>
                                    <div className="absolute bottom-4 right-4 lg:bottom-6 lg:right-6 w-8 h-8 lg:w-10 lg:h-10 border-b-[3px] border-r-[3px] lg:border-b-4 lg:border-r-4 border-green-500 rounded-br-xl lg:rounded-br-2xl opacity-80"></div>

                                    {/* ۱. کادر سفید رنگ بارکد */}
                                    <div className="relative w-56 h-56 sm:w-64 sm:h-64 lg:w-[280px] lg:h-[280px] flex items-center justify-center overflow-hidden rounded-xl lg:rounded-2xl bg-white shadow-inner mb-5">

                                        {/* 🌟 شرط جدید: اگر در حال لود اولیه هستیم یا منتظر بارکد بعدی هستیم */}
                                        {(qrCodeData === "LOADING" || isWaitingNextQr) ? (
                                            <div className="flex flex-col items-center justify-center animate-[fadeIn_0.3s_ease-out]">
                                                <div className="relative flex justify-center items-center">
                                                    <div className="absolute w-16 h-16 lg:w-24 lg:h-24 border border-green-400/40 rounded-full animate-ping"></div>
                                                    <div className="absolute w-12 h-12 lg:w-16 lg:h-16 border-2 border-t-green-500 border-r-transparent border-b-green-500 border-l-transparent rounded-full animate-[spin_2s_linear_infinite]"></div>
                                                    <FaWhatsapp className="text-3xl lg:text-4xl text-green-500 relative z-10" />
                                                </div>
                                                <span className="mt-6 lg:mt-8 text-green-600 text-xs lg:text-sm font-bold tracking-wider animate-pulse text-center px-4">
                                                    {isWaitingNextQr ? "دریافت بارکد جدید از سرور..." : "در حال ارتباط..."}
                                                </span>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="absolute top-0 left-0 w-full h-[2px] bg-green-400 shadow-[0_0_15px_4px_rgba(74,222,128,0.5)] animate-[scanLine_2.5s_ease-in-out_infinite] z-10" />
                                                <img
                                                    src={qrCodeData.startsWith('data:image') ? qrCodeData : `data:image/png;base64,${qrCodeData}`}
                                                    alt="WhatsApp QR Code"
                                                    className="w-full h-full object-contain p-2 lg:p-3 relative z-0 animate-[fadeIn_0.3s_ease-out]"
                                                />
                                            </>
                                        )}
                                    </div>
                                    {/* پایان کادر سفید */}

                                    {/* ۲. نوار پیشرفت (کاملاً مجزا و زیر کادر سفید) */}
                                    {qrCodeData !== "LOADING" && qrCodeData && !isWaitingNextQr && (
                                        <div className="w-56 sm:w-64 lg:w-[280px] z-20 animate-[fadeIn_0.3s_ease-out]">
                                            <div className="flex justify-between text-[10px] md:text-xs text-gray-500 dark:text-gray-400 mb-1.5 font-medium px-1">
                                                <span>زمان اعتبار بارکد</span>
                                                <span className="text-gray-800 dark:text-gray-200">
                                                    <span className="inline-block w-4 text-center font-bold text-green-600 dark:text-green-400">{timeLeft}</span> ثانیه
                                                </span>
                                            </div>
                                            <div className="h-1.5 w-full bg-gray-200/50 dark:bg-gray-700/50 backdrop-blur-sm rounded-full overflow-hidden shadow-inner">
                                                <div
                                                    key={qrCodeData}
                                                    className="h-full rounded-full"
                                                    style={{ animation: 'shrinkBar 17s linear forwards' }}
                                                ></div>
                                            </div>
                                        </div>
                                    )}

                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* فرم اصلی در صورت عدم وجود QR */
                    <Form id="bot-create-form" onSubmit={handleSubmit(handleSubmitData)} className="flex flex-col max-w-4xl mx-auto w-full relative">

                        {!selectedChannel && (
                            <div className="animate-[fadeSlideUp_0.4s_ease-out_forwards] flex flex-col items-center justify-center py-8">
                                <h4 className="text-xl font-semibold text-center text-gray-700 dark:text-gray-200 mb-8">
                                    پلتفرم مورد نظر خود را انتخاب کنید
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-4 w-full max-w-5xl">
                                    {channelCards.map((card) => (
                                        <div
                                            key={card.value}
                                            onClick={() => !card.disabled && setValue('channel', card.value)}
                                            className={`
                                                relative h-40 md:h-48 border-2 rounded-3xl p-4 md:p-6 flex flex-col items-center justify-center transition-all duration-300 bg-white dark:bg-gray-800
                                                ${card.disabled
                                                    ? 'opacity-60 cursor-not-allowed border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50'
                                                    : 'cursor-pointer hover:-translate-y-2 hover:shadow-xl border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-500'
                                                }
                                            `}
                                        >
                                            {card.disabled && (
                                                <div className="absolute top-3 right-3 bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-xs font-bold px-2.5 py-1 rounded-full">
                                                    به زودی
                                                </div>
                                            )}

                                            <div className={`w-16 h-16 md:w-20 md:h-20 flex items-center justify-center rounded-2xl ${card.bg}`}>
                                                <card.icon className={`text-4xl md:text-5xl ${card.color} ${card.disabled ? 'opacity-50' : ''}`} />
                                            </div>
                                            <span className={`text-base md:text-lg font-bold mt-4 ${card.disabled ? 'text-gray-400 dark:text-gray-500' : 'text-gray-600 dark:text-gray-300'}`}>
                                                {card.label}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {selectedChannel && activeCard && (
                            <div className="flex flex-col flex-1 animate-[fadeSlideUp_0.4s_ease-out_forwards] pb-6">
                                <div className={`flex flex-col sm:flex-row sm:items-center justify-between p-5 mb-8 rounded-2xl border bg-white/50 dark:bg-gray-900/50 backdrop-blur-md shadow-sm ${activeCard.border} gap-4`}>
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-xl flex items-center justify-center ${activeCard.bg}`}>
                                            <activeCard.icon className={`text-3xl ${activeCard.color}`} />
                                        </div>
                                        <div>
                                            <h4 className={`font-bold text-lg ${activeCard.color}`}>
                                                اتصال به {activeCard.label}
                                            </h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                                                اطلاعات ارتباطی ربات خود را وارد کنید.
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="plain"
                                        className="bg-white/60 dark:bg-gray-800/60"
                                        icon={<HiOutlineRefresh className="text-lg" />}
                                        onClick={() => setValue('channel', '')}
                                    >
                                        تغییر پلتفرم
                                    </Button>
                                </div>

                                <div className="md:col-span-1">
                                    <FormItem
                                        label="نام ربات (برای نمایش در پنل)"
                                        invalid={Boolean(errors.name)}
                                        errorMessage={errors.name?.message}
                                    >
                                        <Controller
                                            name="name"
                                            control={control}
                                            render={({ field }) => (
                                                <Input
                                                    type="text"
                                                    placeholder={`مثال: دستیار فروش ${activeCard.label}`}
                                                    autoComplete="off"
                                                    className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border-white/50 dark:border-gray-700/50"
                                                    {...field}
                                                />
                                            )}
                                        />
                                    </FormItem>

                                    {!['WhatsApp', 'Instagram'].includes(selectedChannel) && (
                                        <FormItem
                                            label="توکن (Token) یا کلید دسترسی"
                                            invalid={Boolean(errors.token)}
                                            errorMessage={errors.token?.message}
                                        >
                                            <Controller
                                                name="token"
                                                control={control}
                                                render={({ field }) => (
                                                    <Input
                                                        type="text"
                                                        dir="ltr"
                                                        placeholder="مثال: 123456:ABC-DEF1234ghIkl-zyx"
                                                        autoComplete="off"
                                                        className="font-mono text-sm bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border-white/50 dark:border-gray-700/50 shadow-inner"
                                                        {...field}
                                                    />
                                                )}
                                            />
                                        </FormItem>
                                    )}

                                    <div className={`${['WhatsApp', 'Instagram'].includes(selectedChannel) ? 'md:col-span-1' : 'md:col-span-2'}`}>
                                        <FormItem
                                            label="توضیحات (اختیاری)"
                                            invalid={Boolean(errors.description)}
                                            errorMessage={errors.description?.message}
                                        >
                                            <Controller
                                                name="description"
                                                control={control}
                                                render={({ field }) => (
                                                    <Input
                                                        textArea
                                                        placeholder="توضیحات کوتاهی درباره وظیفه این ربات بنویسید..."
                                                        className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border-white/50 dark:border-gray-700/50 min-h-[120px]"
                                                        {...field}
                                                    />
                                                )}
                                            />
                                        </FormItem>
                                    </div>
                                </div>
                            </div>
                        )}
                    </Form>
                )}
            </Card>

            <style>{`
                @keyframes fadeSlideUp {
                    0% { opacity: 0; transform: translateY(15px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                @keyframes scanLine {
                    0% { transform: translateY(0); opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { transform: translateY(256px); opacity: 0; } /* 256px ≈ height of qr img */
                }
                @keyframes scanLine {
                    0% { transform: translateY(0); opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { transform: translateY(280px); opacity: 0; } 
                }
                @keyframes shrinkBar {
                    0% { width: 100%; background-color: #22c55e; box-shadow: 0 0 10px rgba(34, 197, 94, 0.5); } /* سبز */
                    60% { background-color: #eab308; box-shadow: 0 0 10px rgba(234, 179, 8, 0.5); } /* زرد */
                    100% { width: 0%; background-color: #ef4444; box-shadow: 0 0 10px rgba(239, 68, 68, 0.5); } /* قرمز */
                }
            `}</style>
        </div>
    )
}

export default BotCreate