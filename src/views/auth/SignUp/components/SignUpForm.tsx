import { useState } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { FormItem, Form } from '@/components/ui/Form'
import { useAuth } from '@/auth'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { ZodType } from 'zod'
import type { CommonProps } from '@/@types/common'
import { useNavigate } from 'react-router-dom'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'

interface SignUpFormProps extends CommonProps {
    disableSubmit?: boolean
    setMessage?: (message: string) => void
}

type SignUpFormSchema = {
    firstName: string
    lastName: string
    password: string
    phonenumber: string
    confirmPassword: string
}

const validationSchema: ZodType<SignUpFormSchema> = z
    .object({
        // 👈 تغییر ۱: اعتبارسنجی دقیق برای شماره موبایل ایران
        phonenumber: z
            .string({ required_error: 'لطفاً شماره موبایل خود را وارد کنید' })
            .regex(/^09\d{9}$/, { message: 'شماره موبایل باید ۱۱ رقم باشد و با 09 شروع شود' }),
            
        firstName: z.string({ required_error: 'لطفاً نام خود را وارد کنید' }),
        lastName: z.string({ required_error: 'لطفاً نام خانوادگی خود را وارد کنید' }),
        password: z.string({ required_error: 'رمز عبور الزامی است' }),
        confirmPassword: z.string({ required_error: 'تأیید رمز عبور الزامی است' }),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'رمز عبور مطابقت ندارد',
        path: ['confirmPassword'],
    })

const SignUpForm = (props: SignUpFormProps) => {
    const { disableSubmit = false, className, setMessage } = props

    const [isSubmitting, setSubmitting] = useState<boolean>(false)
    const [step, setStep] = useState<1 | 2>(1) 

    const { signUp } = useAuth()
    const navigate = useNavigate()
    const {
        handleSubmit,
        formState: { errors },
        control,
        trigger,
        setFocus,
        setError
    } = useForm<SignUpFormSchema>({
        resolver: zodResolver(validationSchema),
    })

    const handleNextStep = async () => {
        const isStep1Valid = await trigger(['phonenumber', 'firstName', 'lastName', 'password'])
        
        if (isStep1Valid) {
            setStep(2)
            setTimeout(() => setFocus('confirmPassword'), 400)
        }
    }

    const onSignUp = async (values: SignUpFormSchema) => {
    if (!disableSubmit) {
        setSubmitting(true)
        setMessage?.('')

        try {
            const result = await signUp({ 
                firstName: values.firstName, 
                lastName: values.lastName, 
                phonenumber: values.phonenumber,
                password: values.password 
            })
            if (result?.status === 'success') {
                toast.push(
                    <Notification title="ثبت‌نام موفقیت‌آمیز" type="success" duration={3000}>
                        {result.message || 'حساب کاربری شما ایجاد شد. در حال انتقال به صفحه ورود...'}
                    </Notification>,
                    { placement: 'top-center' }
                )
                setTimeout(() => {
                    navigate('/sign-in') 
                }, 1000)
                
                return; // خروج از تابع
            }
            
            // 🔴 حالت خطا: تفکیک خطاهای فیلدی و خطای عمومی
            else if (result?.status === 'failed') {
                
                if (result.errors) {
                    let hasStep1Error = false;
                    const step1Fields = ['phonenumber', 'firstName', 'lastName', 'password'];

                    Object.keys(result.errors).forEach((key) => {
                        // گرفتن اولین پیام خطای سرور برای آن فیلد
                        const errorMessage = result.errors![key][0];
                        
                        // هماهنگ‌سازی حروف (مثلا Phonenumber از سرور بشود phonenumber در ری‌اکت)
                        const fieldName = (key.charAt(0).toLowerCase() + key.slice(1)) as keyof SignUpFormSchema;
                        
                        // تزریق خطا مستقیماً به خود اینپوت (تا زیر فیلد قرمز شود)
                        setError(fieldName, {
                            type: 'server',
                            message: errorMessage
                        });

                        // بررسی اینکه آیا این خطا مربوط به فیلدهای مرحله ۱ است؟
                        if (step1Fields.includes(fieldName)) {
                            hasStep1Error = true;
                        }
                    });

                    // اگر کاربر در مرحله تایید رمز بود و خطایی مربوط به مرحله اول آمد، فرم را برگردان بالا
                    if (hasStep1Error) {
                        setStep(1);
                    }
                    
                } else {
                    // اگر دیکشنری ارورها نبود و فقط یک خطای عمومی (مثل "شماره مسدود است") داشتیم
                    setMessage?.(result.message)
                }
            }
                
        } catch (error: any) {
            console.error('Sign up error:', error)
            const errorMessage = 
                error?.response?.data?.message || 
                error?.message || 
                'مشکلی در برقراری ارتباط با سرور رخ داد. لطفاً مجدداً تلاش کنید.'
            
            setMessage?.(errorMessage)
        } finally {
            setSubmitting(false)
        }
    }
}

    return (
        <div className={className}>
            <Form onSubmit={handleSubmit(onSignUp)}>
                
                <div 
                    className={`transition-all duration-500 ease-in-out overflow-hidden ${
                        step === 1 
                            ? 'max-h-[600px] opacity-100 visible' 
                            : 'max-h-0 opacity-0 invisible pointer-events-none'
                    }`}
                >
                    <FormItem
                        label="شماره موبایل"
                        invalid={Boolean(errors.phonenumber)}
                        errorMessage={errors.phonenumber?.message}
                    >
                        <Controller
                            name="phonenumber"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    type="text"
                                    placeholder="09123456789"
                                    autoComplete="off"
                                    dir="ltr" // 👈 تغییر ۲: چپ‌چین کردن فیلد برای خوانایی بهتر اعداد
                                    // 👈 تغییر ۳: کنترل دقیق روی دیتای ورودی کاربر
                                    {...field}
                                    onChange={(e) => {
                                        // حذف هر چیزی که عدد نیست
                                        const onlyNums = e.target.value.replace(/[^0-9]/g, '');
                                        
                                        // فقط اگر طولش ۱۱ تا یا کمتر بود، اجازه بده تو فرم ثبت بشه
                                        if (onlyNums.length <= 11) {
                                            field.onChange(onlyNums);
                                        }
                                    }}
                                />
                            )}
                        />
                    </FormItem>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormItem
                            label="نام"
                            invalid={Boolean(errors.firstName)}
                            errorMessage={errors.firstName?.message}
                        >
                            <Controller
                                name="firstName"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        type="text"
                                        placeholder="نام"
                                        autoComplete="off"
                                        {...field}
                                    />
                                )}
                            />
                        </FormItem>
                        
                        <FormItem
                            label="نام خانوادگی"
                            invalid={Boolean(errors.lastName)}
                            errorMessage={errors.lastName?.message}
                        >
                            <Controller
                                name="lastName"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        type="text"
                                        placeholder="نام خانوادگی"
                                        autoComplete="off"
                                        {...field}
                                    />
                                )}
                            />
                        </FormItem>
                    </div>
                    
                    <FormItem
                        label="رمز عبور"
                        invalid={Boolean(errors.password)}
                        errorMessage={errors.password?.message}
                    >
                        <Controller
                            name="password"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    type="password"
                                    autoComplete="off"
                                    placeholder="رمز عبور خود را وارد کنید"
                                    {...field}
                                />
                            )}
                        />
                    </FormItem>
                </div>

                <div 
                    className={`transition-all duration-500 ease-in-out overflow-hidden ${
                        step === 2 
                            ? 'max-h-[200px] opacity-100 mt-2 visible' 
                            : 'max-h-0 opacity-0 invisible pointer-events-none'
                    }`}
                >
                    <FormItem
                        label="تأیید نهایی رمز عبور"
                        invalid={Boolean(errors.confirmPassword)}
                        errorMessage={errors.confirmPassword?.message}
                    >
                        <Controller
                            name="confirmPassword"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    type="password"
                                    autoComplete="off"
                                    placeholder="تأیید رمز عبور خود را مجدداً وارد کنید"
                                    className="border-indigo-500 ring-2 ring-indigo-500/20"
                                    {...field}
                                />
                            )}
                        />
                    </FormItem>
                </div>
                
                <div className="mt-6">
                    {step === 1 ? (
                        <Button
                            block
                            variant="solid"
                            type="button"
                            onClick={handleNextStep}
                        >
                            ادامه ثبت نام
                        </Button>
                    ) : (
                        <div className="flex gap-4">
                            <Button 
                                type="button" 
                                variant="default"
                                className="w-1/3"
                                onClick={() => setStep(1)}
                            >
                                بازگشت
                            </Button>
                            
                            <Button
                                className="w-2/3"
                                loading={isSubmitting}
                                variant="solid"
                                type="submit"
                            >
                                {isSubmitting ? 'در حال ایجاد حساب...' : 'تکمیل ثبت نام'}
                            </Button>
                        </div>
                    )}
                </div>
            </Form>
        </div>
    )
}

export default SignUpForm