import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { HiArrowRight, HiOutlineSave } from 'react-icons/hi'
import { FaTelegramPlane, FaInstagram, FaWhatsapp, FaGlobe, FaCommentDots, FaCommentAlt } from 'react-icons/fa' 
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { FormItem, Form } from '@/components/ui/Form'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import Spinner from '@/components/ui/Spinner'
// 🌟 ایمپورت متدهای API
import { apiGetBot, apiUpdateBot } from '@/services/botservice'

const validationSchema = z.object({
    name: z.string({ required_error: 'لطفاً نام ربات را وارد کنید' })
        .min(3, { message: 'نام ربات باید حداقل ۳ کاراکتر باشد' }),
    token: z.string({ required_error: 'توکن یا کلید ارتباطی الزامی است' })
        .min(10, { message: 'توکن وارد شده معتبر نیست' }),
    description: z.string().optional(),
})

type BotEditFormSchema = z.infer<typeof validationSchema>

const channelCards = [
    { 
        value: 'Telegram', label: 'تلگرام', icon: FaTelegramPlane, 
        color: 'text-sky-500 dark:text-sky-400', 
        bg: 'bg-sky-100 dark:bg-sky-900/40', 
        border: 'border-sky-300 dark:border-sky-600',
        containerBg: 'bg-sky-50/90 dark:bg-sky-900/20 border-sky-200 dark:border-sky-800/40' 
    },
    { 
        value: 'Instagram', label: 'اینستاگرام', icon: FaInstagram, 
        color: 'text-pink-600 dark:text-pink-400', 
        bg: 'bg-gradient-to-tr from-amber-100 via-pink-100 to-fuchsia-100 dark:from-amber-900/40 dark:via-pink-900/40 dark:to-fuchsia-900/40', 
        border: 'border-pink-300 dark:border-pink-600',
        containerBg: 'bg-gradient-to-br from-amber-50/80 via-pink-50/80 to-purple-50/80 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800/40' 
    },
    { 
        value: 'WhatsApp', label: 'واتس‌اپ', icon: FaWhatsapp, 
        color: 'text-green-500 dark:text-green-400', 
        bg: 'bg-green-100 dark:bg-green-900/40', 
        border: 'border-green-300 dark:border-green-600',
        containerBg: 'bg-green-50/90 dark:bg-green-900/20 border-green-200 dark:border-green-800/40' 
    },
    { 
        value: 'Web', label: 'ویجت سایت', icon: FaGlobe, 
        color: 'text-indigo-500 dark:text-indigo-400', 
        bg: 'bg-indigo-100 dark:bg-indigo-900/40', 
        border: 'border-indigo-300 dark:border-indigo-600',
        containerBg: 'bg-indigo-50/90 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800/40' 
    },
    { 
        value: 'Rubika', label: 'روبیکا', icon: FaCommentDots, 
        color: 'text-orange-500 dark:text-orange-400', 
        bg: 'bg-orange-100 dark:bg-orange-900/40', 
        border: 'border-orange-300 dark:border-orange-600',
        containerBg: 'bg-orange-50/90 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800/40' 
    },
    { 
        value: 'Bale', label: 'بله', icon: FaCommentAlt, 
        color: 'text-teal-500 dark:text-teal-400', 
        bg: 'bg-teal-100 dark:bg-teal-900/40', 
        border: 'border-teal-300 dark:border-teal-600',
        containerBg: 'bg-teal-50/90 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800/40' 
    }
]

const BotEdit = () => {
    const navigate = useNavigate()
    const { id } = useParams() 
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [isSubmitting, setSubmitting] = useState<boolean>(false)
    const [botChannel, setBotChannel] = useState<string>('')

    const {
        handleSubmit,
        formState: { errors },
        control,
        reset, 
    } = useForm<BotEditFormSchema>({
        resolver: zodResolver(validationSchema),
    })

    const activeCard = channelCards.find(c => c.value === botChannel)

    // 🌟 دریافت اطلاعات واقعی از سرور
    useEffect(() => {
        const fetchBotData = async () => {
            if (!id) return;
            try {
                const result: any = await apiGetBot(id)
                const data = result?.data || result; // بسته به خروجی axios
debugger
                // تنظیم پلتفرم برای رنگ‌آمیزی کارت (با فرض اینکه سرور platformName را برمی‌گرداند)
                if (data.platformName) {
                    setBotChannel(data.platformName)
                }

                reset({
                    name: data.name || '',
                    token: data.token || '',
                    description: data.description || ''
                })
                
            } catch (error: any) {
                console.error('Fetch bot error:', error)
                toast.push(
                    <Notification title="خطا" type="danger" duration={5000}>
                        {error?.response?.data?.message || 'دریافت اطلاعات ربات با مشکل مواجه شد.'}
                    </Notification>, 
                    { placement: 'top-center' }
                )
                // اگر ربات پیدا نشد کاربر را برگردانیم به لیست
                navigate('/concepts/bots/bot-list')
            } finally {
                setIsLoading(false)
            }
        }

        fetchBotData()
    }, [id, reset, navigate])

    // 🌟 ذخیره اطلاعات در سرور
    const onSubmit = async (values: BotEditFormSchema) => {
        if (!id) return;
        setSubmitting(true)
        
        try {
            await apiUpdateBot(id, {
                id: id,
                name: values.name,
                token: values.token,
                description: values.description || ''
            })
            
            toast.push(
                <Notification title="ویرایش موفق" type="success" duration={3000}>
                    تغییرات ربات با موفقیت ذخیره شد.
                </Notification>,
                { placement: 'top-center' }
            )
            navigate('/concepts/bots/bot-list')
            
        } catch (error: any) {
            console.error('Update bot error:', error)
            toast.push(
                <Notification title="خطا" type="danger" duration={5000}>
                    {error?.response?.data?.message || 'مشکلی در ذخیره تغییرات پیش آمد.'}
                </Notification>, 
                { placement: 'top-center' }
            )
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="flex flex-col gap-6 relative h-full pb-10">
            
            {/* 🌟 هدر استیکی رسپانسیو (منطبق با صفحه ایجاد) */}
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

            <Card 
                className={`
                    flex-1 w-full flex flex-col 
                    transition-colors duration-1000 ease-in-out border
                    ${activeCard && !isLoading ? activeCard.containerBg : 'bg-white dark:bg-gray-800 border-transparent'}
                `}
            >
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center flex-1 h-64 opacity-60">
                        <Spinner size="40px" className="text-indigo-500" />
                        <span className="mt-4 text-gray-600 dark:text-gray-400 font-medium">در حال دریافت اطلاعات ربات...</span>
                    </div>
                ) : (
                    <Form id="bot-edit-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col max-w-4xl mx-auto w-full animate-[fadeIn_0.5s_ease-out]">
                        
                        {activeCard ? (
                            <div className={`flex items-center p-5 mb-8 rounded-2xl border ${activeCard.bg} ${activeCard.border}`}>
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
                            <div className="p-5 mb-8 rounded-2xl border bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                                <p className="text-gray-500 dark:text-gray-400">پلتفرم نامشخص</p>
                            </div>
                        )}

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
                                                className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border-white/50 dark:border-gray-700/50 min-h-[120px]"
                                                {...field}
                                            />
                                        )}
                                    />
                                </FormItem>
                            </div>
                        </div>
                    </Form>
                )}
            </Card>

            <style>{`
                @keyframes fadeSlideUp {
                    0% { opacity: 0; transform: translateY(15px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeIn {
                    0% { opacity: 0; transform: translateY(10px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    )
}

export default BotEdit