import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { HiArrowRight, HiOutlineSave, HiOutlineRefresh } from 'react-icons/hi'
import {
    FaTelegramPlane,
    FaInstagram,
    FaWhatsapp,
    FaGlobe,
    FaCommentDots,
    FaCommentAlt,
    FaQrcode
} from 'react-icons/fa'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { FormItem, Form } from '@/components/ui/Form'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import Spinner from '@/components/ui/Spinner'
import { apiGetBot, apiUpdateBot, apiActivateBot, apiDeactivateBot } from '@/services/botservice'
import { useBotSocket } from '@/utils/hooks/useBotSocket';
import { useSessionUser, getToken } from '@/store/authStore';

const validationSchema = z.object({
    name: z.string({ required_error: 'لطفاً نام ربات را وارد کنید' }).min(3, { message: 'نام ربات باید حداقل ۳ کاراکتر باشد' }),
    token: z.string().optional(),
    description: z.string().optional(),
})

type BotEditFormSchema = z.infer<typeof validationSchema>

const channelCards = [
    { value: 'Telegram', label: 'تلگرام', icon: FaTelegramPlane, color: 'text-sky-500 dark:text-sky-400', bg: 'bg-sky-100 dark:bg-sky-900/40', border: 'border-sky-300 dark:border-sky-600', containerBg: 'bg-sky-50/90 dark:bg-sky-900/20 border-sky-200 dark:border-sky-800/40' },
    { value: 'Instagram', label: 'اینستاگرام', icon: FaInstagram, color: 'text-pink-600 dark:text-pink-400', bg: 'bg-gradient-to-tr from-amber-100 via-pink-100 to-fuchsia-100 dark:from-amber-900/40 dark:via-pink-900/40 dark:to-fuchsia-900/40', border: 'border-pink-300 dark:border-pink-600', containerBg: 'bg-gradient-to-br from-amber-50/80 via-pink-50/80 to-purple-50/80 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800/40' },
    { value: 'WhatsApp', label: 'واتس‌اپ', icon: FaWhatsapp, color: 'text-green-500 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/40', border: 'border-green-300 dark:border-green-600', containerBg: 'bg-green-50/90 dark:bg-green-900/20 border-green-200 dark:border-green-800/40' },
    { value: 'Web', label: 'ویجت سایت', icon: FaGlobe, color: 'text-indigo-500 dark:text-indigo-400', bg: 'bg-indigo-100 dark:bg-indigo-900/40', border: 'border-indigo-300 dark:border-indigo-600', containerBg: 'bg-indigo-50/90 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800/40' },
    { value: 'Rubika', label: 'روبیکا', icon: FaCommentDots, color: 'text-orange-500 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900/40', border: 'border-orange-300 dark:border-orange-600', containerBg: 'bg-orange-50/90 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800/40' },
    { value: 'Bale', label: 'بله', icon: FaCommentAlt, color: 'text-teal-500 dark:text-teal-400', bg: 'bg-teal-100 dark:bg-teal-900/40', border: 'border-teal-300 dark:border-teal-600', containerBg: 'bg-teal-50/90 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800/40' }
]

const BotEdit = () => {
    const navigate = useNavigate()
    const { id } = useParams()

    // استیت‌های پایه
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [isSubmitting, setSubmitting] = useState<boolean>(false)
    const [botChannel, setBotChannel] = useState<string>('')
    const [isBotActive, setIsBotActive] = useState<boolean>(false)

    // 🌟 استیت‌های مربوط به اسکنر واتس‌اپ
    const [qrCodeData, setQrCodeData] = useState<string | null>(null)
    const [isWaitingNextQr, setIsWaitingNextQr] = useState(false)
    const [timeLeft, setTimeLeft] = useState(17)

    const isScanningRef = useRef(false) // برای تله خروج کاربر

    const { handleSubmit, formState: { errors }, control, reset, setError } = useForm<BotEditFormSchema>({
        resolver: zodResolver(validationSchema),
    })

    const activeCard = channelCards.find(c => c.value === botChannel)
    const isTokenlessPlatform = ['WhatsApp', 'Instagram'].includes(activeCard?.value || '')
    const [resolvedToken, setResolvedToken] = useState<string | null>(null);

    // همگام‌سازی Ref برای تله خروج از صفحه
    useEffect(() => {
        isScanningRef.current = !!qrCodeData;
    }, [qrCodeData])

    useEffect(() => {
        const fetchToken = async () => {
            const t = await getToken();
            setResolvedToken(t);
        };
        fetchToken();
    }, []);

    // ==========================================
    // 🌟 مدیریت اتصال زنده به نود جی‌اس (Socket)
    // ==========================================
    useBotSocket({
        token: resolvedToken,
        onReceiveQrCode: (receivedBotId, qrBase64) => {
            debugger
            const extractedBotId = receivedBotId.split('_').pop()?.toLowerCase();
            const currentBotId = id?.replace(/-/g, '').toLowerCase();
            if (extractedBotId === currentBotId) setQrCodeData(qrBase64);
        },
        onReceiveWhatsAppStatus: async (receivedBotId, status, data) => {
            debugger
            const rawReceivedId = receivedBotId.split('_').pop() || '';

            // ۲. 🌟 حذف خط تیره‌ها از هر دو طرف تا دقیقاً مثل هم شوند
            const extractedBotId = rawReceivedId.replace(/-/g, '').toLowerCase();
            const currentBotId = id?.replace(/-/g, '').toLowerCase();

            if (extractedBotId !== currentBotId) return;

            if (status === 'qr' && data) {
                setQrCodeData(data);
            }
            else if (status === 'connected') {
                setQrCodeData(null);
                setIsBotActive(true);

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
            else if (status === 'QrScanTimeout' || status === 'disconnected') {
                setQrCodeData(null);
                setIsBotActive(false);

                const msgTitle = status === 'QrScanTimeout' ? "پایان مهلت اسکن" : "ارتباط قطع شد";
                const msgBody = status === 'QrScanTimeout'
                    ? "مهلت اسکن بارکد به پایان رسید. برای اتصال مجدداً تلاش کنید."
                    : "ارتباط ربات با واتس‌اپ قطع شده است.";

                toast.push(
                    <Notification title={msgTitle} type="warning" duration={7000}>
                        {msgBody}
                    </Notification>,
                    { placement: 'top-center' }
                );
            }
        }
    });

    // ==========================================
    // 🌟 متدهای درخواست و توقف اسکن
    // ==========================================

    // متد شروع اسکن (دکمه داخل فرم)
    const handleStartScan = async () => {
        if (!id) return;
        setQrCodeData("LOADING");
        setIsWaitingNextQr(true);
        try {
            await apiActivateBot(id); // دستور استارت به سی‌شارپ و نود جی‌اس
            toast.push(
                <Notification title="در حال برقراری ارتباط" type="info" duration={4000}>
                    در حال دریافت بارکد از سرور واتس‌اپ، لطفاً کمی صبر کنید...
                </Notification>,
                { placement: 'top-center' }
            );
        } catch (error) {
            console.error(error);
            setQrCodeData(null);
            toast.push(<Notification type="danger">خطا در برقراری ارتباط با سرور</Notification>);
        }
    };

    // متد انصراف کاربر
    const handleCancelScan = async (isTimeout = false) => {
        if (!id) return;
        setQrCodeData("LOADING"); // نمایش لودینگ کوتاه قبل از خروج
        setIsWaitingNextQr(true);
        try {
            await apiDeactivateBot(id); // دستور استاپ به سرور
            if (!isTimeout) {
                toast.push(<Notification type="info">عملیات اتصال به واتس‌اپ لغو شد.</Notification>);
            }
        } catch (error) {
            console.error("Error cancelling scan:", error);
        } finally {
            setQrCodeData(null);
        }
    };

    // ==========================================
    // 🌟 مدیریت تایمر ۱۵/۱۷ ثانیه‌ای
    // ==========================================
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

    // تله خروج: خاموش کردن ربات در صورت ترک صفحه وسط اسکن
    useEffect(() => {
        return () => {
            if (isScanningRef.current && id) {
                apiDeactivateBot(id).catch(() => { });
            }
        };
    }, [id]);

    // ==========================================
    // دریافت و ثبت اطلاعات فرم
    // ==========================================
    useEffect(() => {
        const fetchBotData = async () => {
            if (!id) return;
            try {
                const result: any = await apiGetBot(id)
                const data = result?.data || result;
                if (data.platformName) setBotChannel(data.platformName)
                setIsBotActive(data.isActive === true)
                reset({
                    name: data.name || '',
                    token: data.token || '',
                    description: data.description || ''
                })
            } catch (error: any) {
                toast.push(<Notification title="خطا" type="danger">{error?.response?.data?.message || 'دریافت اطلاعات ربات با مشکل مواجه شد.'}</Notification>)
                navigate('/concepts/bots/bot-list')
            } finally {
                setIsLoading(false)
            }
        }
        fetchBotData()
    }, [id, reset, navigate])

    const onSubmit = async (values: BotEditFormSchema) => {
        if (!id) return;
        if (!isTokenlessPlatform && (!values.token || values.token.length < 5)) {
            setError('token', { type: 'manual', message: 'برای این پلتفرم، وارد کردن توکن معتبر الزامی است.' });
            return;
        }
        setSubmitting(true)
        try {
            await apiUpdateBot(id, {
                id: id,
                name: values.name,
                token: isTokenlessPlatform ? '' : values.token,
                description: values.description || ''
            })
            toast.push(<Notification title="ویرایش موفق" type="success" duration={3000}>تغییرات ربات ذخیره شد.</Notification>, { placement: 'top-center' })
            navigate('/concepts/bots/bot-list')
        } catch (error: any) {
            toast.push(<Notification title="خطا" type="danger">{error?.response?.data?.message || 'مشکلی در ذخیره تغییرات پیش آمد.'}</Notification>)
        } finally {
            setSubmitting(false)
        }
    }

    // ==========================================
    // رندر رابط کاربری
    // ==========================================
    return (
        <div className="flex flex-col gap-6 relative h-full pb-10">
            {/* هدر استیکی صفحه که هنگام نمایش بارکد پنهان می‌شود */}
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
                            <h3 className="text-xl font-extrabold text-gray-800 dark:text-gray-100">ویرایش پیکربندی ربات</h3>
                            <p className="text-gray-500 text-sm mt-0.5 hidden md:block">بروزرسانی توکن و اطلاعات پایه‌ای ربات</p>
                        </div>
                    </div>

                    {!isLoading && (
                        <div className="flex items-center gap-2 sm:gap-3 animate-[fadeSlideUp_0.3s_ease-out_forwards]">
                            <Button
                                type="button"
                                size="sm"
                                variant="default"
                                className="bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 flex-1 sm:flex-none"
                                onClick={() => navigate('/concepts/bots/bot-list')}
                                disabled={isSubmitting}
                            >
                                انصراف
                            </Button>
                            <Button
                                form="bot-edit-form"
                                size="sm"
                                loading={isSubmitting}
                                variant="solid"
                                type="submit"
                                icon={<HiOutlineSave />}
                                className={`flex-1 sm:flex-none ${activeCard?.value === 'Instagram' ? 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 border-0' : 'bg-indigo-600 hover:bg-indigo-500 text-white'}`}
                            >
                                ذخیره تغییرات
                            </Button>
                        </div>
                    )}
                </div>
            )}

            {/* کانتینر اصلی: تغییر دینامیک بین فرم ویرایش و اسکنر واتس‌اپ */}
            <Card className={`flex-1 w-full flex flex-col transition-colors duration-700 ease-in-out border ${activeCard ? activeCard.containerBg : 'bg-white dark:bg-gray-800 border-transparent'}`}>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center flex-1 h-64 opacity-60">
                        <Spinner size="40px" className="text-indigo-500" />
                        <span className="mt-4 text-gray-600 dark:text-gray-400 font-medium">در حال دریافت اطلاعات ربات...</span>
                    </div>
                ) : qrCodeData ? (
                    /* 🌟 پنل اسکنر شیشه‌ای واتس‌اپ (به محض دریافت بارکد جایگزین فرم می‌شود) */
                    <div className="flex flex-col-reverse lg:flex-row items-center justify-between gap-10 lg:gap-12 w-full max-w-5xl mx-auto py-4 lg:py-8 animate-[fadeIn_0.6s_ease-out_forwards]">

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
                                    اتصال مجدد به <span className="text-transparent bg-clip-text bg-gradient-to-l from-green-400 to-emerald-600">واتس‌اپ</span>
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-sm lg:text-lg max-w-sm mx-auto lg:mx-0">
                                    برای همگام‌سازی، این ۳ قدم ساده را طی کنید:
                                </p>
                            </div>

                            <div className="space-y-3 lg:space-y-4 w-full max-w-md">
                                <div className="flex items-center lg:items-start gap-3 lg:gap-4 p-3 lg:p-4 rounded-2xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-100 dark:border-gray-700">
                                    <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-xl bg-gray-100 dark:bg-gray-900 text-green-600 font-bold flex items-center justify-center flex-shrink-0 text-sm lg:text-base">۱</div>
                                    <p className="text-gray-700 dark:text-gray-300 text-xs lg:text-base font-medium flex-1 text-right">اپلیکیشن واتس‌اپ را روی گوشی باز کنید.</p>
                                </div>
                                <div className="flex items-center lg:items-start gap-3 lg:gap-4 p-3 lg:p-4 rounded-2xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-100 dark:border-gray-700">
                                    <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-xl bg-gray-100 dark:bg-gray-900 text-green-600 font-bold flex items-center justify-center flex-shrink-0 text-sm lg:text-base">۲</div>
                                    <p className="text-gray-700 dark:text-gray-300 text-xs lg:text-base font-medium flex-1 text-right">به تنظیمات رفته و گزینه Linked Devices را انتخاب کنید.</p>
                                </div>
                                <div className="flex items-center lg:items-start gap-3 lg:gap-4 p-3 lg:p-4 rounded-2xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-100 dark:border-gray-700">
                                    <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-xl bg-green-50 dark:bg-green-900/30 text-green-600 font-bold flex items-center justify-center flex-shrink-0 text-sm lg:text-base">۳</div>
                                    <p className="text-gray-700 dark:text-gray-300 text-xs lg:text-base font-medium flex-1 text-right">دوربین را روبه‌روی این بارکد بگیرید.</p>
                                </div>
                            </div>

                            <Button
                                variant="plain"
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 px-0 text-sm lg:text-base"
                                onClick={() => handleCancelScan(false)} // 🌟 اتصال دکمه انصراف
                            >
                                انصراف و بازگشت به لیست ربات‌ها
                            </Button>
                        </div>

                        {/* ستون چپ: اسکنر شیشه‌ای همراه با تایمر */}
                        <div className="flex-1 flex justify-center w-full lg:justify-end">
                            <div className="relative p-0.5 lg:p-1 rounded-[2rem] lg:rounded-[2.5rem] bg-gradient-to-tr from-green-400/30 via-transparent to-emerald-600/30 shadow-[0_0_30px_rgba(16,185,129,0.15)] w-full max-w-[300px] sm:max-w-[340px] lg:max-w-none">
                                <div className="relative bg-white/70 dark:bg-gray-900/80 backdrop-blur-2xl border border-white/60 dark:border-gray-700/60 rounded-[2rem] p-6 lg:p-8 flex flex-col items-center">

                                    <div className="absolute top-4 left-4 lg:top-6 lg:left-6 w-8 h-8 lg:w-10 lg:h-10 border-t-[3px] border-l-[3px] border-green-500 rounded-tl-xl opacity-80"></div>
                                    <div className="absolute top-4 right-4 lg:top-6 lg:right-6 w-8 h-8 lg:w-10 lg:h-10 border-t-[3px] border-r-[3px] border-green-500 rounded-tr-xl opacity-80"></div>
                                    <div className="absolute bottom-4 left-4 lg:bottom-6 lg:left-6 w-8 h-8 lg:w-10 lg:h-10 border-b-[3px] border-l-[3px] border-green-500 rounded-bl-xl opacity-80"></div>
                                    <div className="absolute bottom-4 right-4 lg:bottom-6 lg:right-6 w-8 h-8 lg:w-10 lg:h-10 border-b-[3px] border-r-[3px] border-green-500 rounded-br-xl opacity-80"></div>

                                    <div className="relative w-56 h-56 sm:w-64 sm:h-64 lg:w-[280px] lg:h-[280px] flex items-center justify-center overflow-hidden rounded-xl lg:rounded-2xl bg-white shadow-inner mb-5">
                                        {(qrCodeData === "LOADING" || isWaitingNextQr) ? (
                                            <div className="flex flex-col items-center justify-center animate-[fadeIn_0.3s_ease-out]">
                                                <div className="relative flex justify-center items-center">
                                                    <div className="absolute w-16 h-16 border border-green-400/40 rounded-full animate-ping"></div>
                                                    <div className="absolute w-12 h-12 border-2 border-t-green-500 border-r-transparent border-b-green-500 border-l-transparent rounded-full animate-[spin_2s_linear_infinite]"></div>
                                                    <FaWhatsapp className="text-3xl text-green-500 relative z-10" />
                                                </div>
                                                <span className="mt-6 text-green-600 text-xs font-bold tracking-wider animate-pulse text-center px-4">
                                                    {isWaitingNextQr ? "دریافت بارکد جدید..." : "در حال ارتباط..."}
                                                </span>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="absolute top-0 left-0 w-full h-[2px] bg-green-400 shadow-[0_0_15px_4px_rgba(74,222,128,0.5)] animate-[scanLine_2.5s_ease-in-out_infinite] z-10" />
                                                <img
                                                    src={qrCodeData.startsWith('data:image') ? qrCodeData : `data:image/png;base64,${qrCodeData}`}
                                                    alt="WhatsApp QR Code"
                                                    className="w-full h-full object-contain p-2 relative z-0 animate-[fadeIn_0.3s_ease-out]"
                                                />
                                            </>
                                        )}
                                    </div>

                                    {qrCodeData !== "LOADING" && qrCodeData && !isWaitingNextQr && (
                                        <div className="w-56 sm:w-64 lg:w-[280px] z-20 animate-[fadeIn_0.3s_ease-out]">
                                            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1.5 font-medium px-1">
                                                <span>زمان اعتبار بارکد</span>
                                                <span className="text-gray-800 dark:text-gray-200">
                                                    <span className="inline-block w-4 text-center font-bold text-green-600">{timeLeft}</span> ثانیه
                                                </span>
                                            </div>
                                            <div className="h-1.5 w-full bg-gray-200/50 dark:bg-gray-700/50 rounded-full overflow-hidden shadow-inner">
                                                <div key={qrCodeData} className="h-full rounded-full bg-green-500" style={{ animation: 'shrinkBar 17s linear forwards' }}></div>
                                            </div>
                                        </div>
                                    )}

                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* فرم اصلی ویرایش */
                    <Form id="bot-edit-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col max-w-4xl mx-auto w-full animate-[fadeIn_0.5s_ease-out]">

                        {activeCard ? (
                            <div className={`flex items-center p-5 rounded-2xl border ${activeCard.bg} ${activeCard.border} mb-6`}>
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-white/80 dark:bg-gray-900/80 rounded-xl shadow-sm backdrop-blur-sm">
                                        <activeCard.icon className={`text-3xl ${activeCard.color}`} />
                                    </div>
                                    <div>
                                        <h4 className={`font-bold text-lg ${activeCard.color}`}>
                                            پلتفرم متصل: {activeCard.label}
                                        </h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                            پلتفرم (کانال) ربات پس از ایجاد قابل تغییر نیست.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="p-5 rounded-2xl border bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 mb-6">
                                <p className="text-gray-500 dark:text-gray-400">پلتفرم نامشخص</p>
                            </div>
                        )}

                        {/* بخش مدیریت اتصال واتس‌اپ درون فرم ویرایش */}
                        {activeCard?.value === 'WhatsApp' && (
                            <div className="mb-6 md:col-span-2">
                                {!isBotActive ? (
                                    <div className="p-5 border border-amber-200 bg-amber-50/80 dark:bg-amber-900/20 dark:border-amber-800/50 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6 backdrop-blur-sm shadow-sm">
                                        <div className="flex items-center gap-4">
                                            <div className="p-4 bg-amber-100 dark:bg-amber-800 text-amber-600 dark:text-amber-300 rounded-full text-2xl shadow-inner">
                                                <FaQrcode />
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-bold text-amber-900 dark:text-amber-100">نیاز به راه‌اندازی یا اسکن مجدد</h4>
                                                <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                                                    اگر ارتباط این ربات قطع شده یا به تازگی ساخته‌اید، روی <strong>اسکن بارکد</strong> کلیک کنید.
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="solid"
                                            className="bg-amber-500 hover:bg-amber-600 text-white w-full sm:w-auto flex-shrink-0 border-0"
                                            icon={<FaQrcode />}
                                            onClick={handleStartScan} // 🌟 فراخوانی متد استارت اسکن
                                        >
                                            اسکن بارکد و اتصال
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="p-5 border border-green-200 bg-green-50/80 dark:bg-green-900/20 dark:border-green-800/50 rounded-2xl flex items-center gap-4 backdrop-blur-sm shadow-sm">
                                        <div className="p-4 bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-300 rounded-full text-2xl shadow-inner">
                                            <FaWhatsapp />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold text-green-900 dark:text-green-100">ربات فعال و متصل است</h4>
                                            <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                                                واتس‌اپ در حال حاضر روشن است. برای تغییر شماره، ابتدا باید ربات را از «لیست ربات‌ها» خاموش کنید.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 flex-1">
                            <div className={isTokenlessPlatform ? 'md:col-span-2' : ''}>
                                <FormItem label="نام ربات (برای نمایش در پنل)" invalid={Boolean(errors.name)} errorMessage={errors.name?.message}>
                                    <Controller
                                        name="name"
                                        control={control}
                                        render={({ field }) => (
                                            <Input type="text" autoComplete="off" className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border-white/50 dark:border-gray-700/50" {...field} />
                                        )}
                                    />
                                </FormItem>
                            </div>

                            {!isTokenlessPlatform && (
                                <FormItem label="توکن (Token) یا کلید دسترسی" invalid={Boolean(errors.token)} errorMessage={errors.token?.message}>
                                    <Controller
                                        name="token"
                                        control={control}
                                        render={({ field }) => (
                                            <Input type="text" dir="ltr" autoComplete="off" className="font-mono text-sm bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border-white/50 dark:border-gray-700/50 shadow-inner" {...field} />
                                        )}
                                    />
                                </FormItem>
                            )}

                            <div className="md:col-span-2">
                                <FormItem label="توضیحات (اختیاری)" invalid={Boolean(errors.description)} errorMessage={errors.description?.message}>
                                    <Controller
                                        name="description"
                                        control={control}
                                        render={({ field }) => (
                                            <Input textArea className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border-white/50 dark:border-gray-700/50 min-h-[120px]" {...field} />
                                        )}
                                    />
                                </FormItem>
                            </div>
                        </div>
                    </Form>
                )}
            </Card>

            <style>{`
                @keyframes fadeSlideUp { 0% { opacity: 0; transform: translateY(15px); } 100% { opacity: 1; transform: translateY(0); } }
                @keyframes fadeIn { 0% { opacity: 0; transform: translateY(10px); } 100% { opacity: 1; transform: translateY(0); } }
                @keyframes scanLine { 0% { top: 0%; opacity: 0.8; } 50% { opacity: 1; } 100% { top: 100%; opacity: 0.8; } }
                @keyframes shrinkBar { 0% { width: 100%; background-color: #22c55e; } 70% { background-color: #eab308; } 100% { width: 0%; background-color: #ef4444; } }
            `}</style>
        </div>
    )
}

export default BotEdit