import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { HiArrowRight, HiOutlineSave, HiOutlineRefresh } from 'react-icons/hi'
import { FaTelegramPlane, FaInstagram, FaWhatsapp, FaGlobe, FaCommentDots, FaCommentAlt } from 'react-icons/fa' 
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { FormItem, Form } from '@/components/ui/Form'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { apiCreateBot, apiActivateBot } from '@/services/botservice'

const PLATFORM_ENUMS: Record<string, number> = {
    'WhatsApp': 1,
    'Telegram': 2,
    'Instagram': 3,
    'Web': 4,
    'Rubika': 5,
    'Bale': 6
}

const validationSchema = z.object({
    channel: z.string({ required_error: 'انتخاب پلتفرم الزامی است' }),
    name: z.string({ required_error: 'لطفاً نام ربات را وارد کنید' })
        .min(3, { message: 'نام ربات باید حداقل ۳ کاراکتر باشد' }),
    token: z.string({ required_error: 'توکن یا کلید ارتباطی الزامی است' })
        .min(10, { message: 'توکن وارد شده معتبر نیست' }),
    description: z.string().optional(),
})

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
        disabled: false
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
        value: 'Web', label: 'ویجت سایت', icon: FaGlobe, 
        color: 'text-indigo-500 dark:text-indigo-400', 
        bg: 'bg-indigo-100 dark:bg-indigo-900/40', 
        border: 'border-indigo-300 dark:border-indigo-600',
        containerBg: 'bg-indigo-50/90 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800/40',
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
        value: 'Bale', label: 'بله', icon: FaCommentAlt, 
        color: 'text-gray-400 dark:text-gray-500', 
        bg: 'bg-gray-100 dark:bg-gray-800/30', 
        border: 'border-gray-200 dark:border-gray-700',
        containerBg: '', 
        disabled: true
    },
]

const BotCreate = () => {
    const navigate = useNavigate()
    const [isSubmitting, setSubmitting] = useState<boolean>(false)

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
                token: values.token,
                description: values.description || ''
            });
            
            if (result) {
                const newBotId = result;
                if (newBotId) {
                    try {
                            await apiActivateBot(newBotId);
                            toast.push(
                                <Notification title="موفقیت‌آمیز" type="success" duration={4000}>
                                    ربات {values.name} با موفقیت ایجاد و به پلتفرم متصل شد.
                                </Notification>,
                                { placement: 'top-center' }
                            )
                        }
                    
                    catch (activationError) {
                        toast.push(
                            <Notification title="ایجاد شد (بدون اتصال)" type="warning" duration={6000}>
                                ربات ساخته شد، اما در ارتباط اولیه با پلتفرم مشکلی پیش آمد. می‌توانید از لیست ربات‌ها مجدداً تلاش کنید.
                            </Notification>,
                            { placement: 'top-center' }
                        )
                    }
                } 
                else {
                        // اگر سرور ID برنگرداند، فقط پیام موفقیت ساخت را می‌دهیم
                        toast.push(
                            <Notification title="ایجاد موفقیت‌آمیز" type="success" duration={3000}>
                                ربات {values.name} با موفقیت ثبت شد.
                            </Notification>,
                            { placement: 'top-center' }
                        )
                    }

                setTimeout(() => {
                    navigate('/concepts/bots/bot-list')
                }, 1000)

                return;
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

    return (
        <div className="flex flex-col gap-6 relative pb-10">
            
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
                        <h3 className="text-xl font-extrabold text-gray-800 dark:text-gray-100">ایجاد ربات جدید</h3>
                        <p className="text-gray-500 text-sm mt-0.5 hidden md:block">مراحل اتصال ربات به پلتفرم را تکمیل کنید</p>
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
                            className={`${activeCard.value === 'Instagram' ? 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 border-0' : 'bg-purple-600 hover:bg-purple-500 text-white'}`}
                        >
                            ایجاد و اتصال
                        </Button>
                    </div>
                )}
            </div>

            <Card 
                className={`
                    flex-1 w-full flex flex-col 
                    transition-colors duration-700 ease-in-out border
                    ${activeCard ? activeCard.containerBg : 'bg-white dark:bg-gray-800 border-transparent'}
                `}
            >
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

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 flex-1">
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

                                <div className="md:col-span-2">
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
            </Card>

            <style>{`
                @keyframes fadeSlideUp {
                    0% { opacity: 0; transform: translateY(15px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    )
}

export default BotCreate