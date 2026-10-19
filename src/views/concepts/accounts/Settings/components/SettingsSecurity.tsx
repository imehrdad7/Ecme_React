import { useState, useRef } from 'react'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { Form, FormItem } from '@/components/ui/Form'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import classNames from '@/utils/classNames'
import isLastChild from '@/utils/isLastChild'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import type { ZodType } from 'zod'
import { useSessionUser } from '@/store/authStore'
import { apiChangePassword } from '@/services/UsersService'
import { HiOutlineEyeOff, HiOutlineEye } from 'react-icons/hi'

type PasswordSchema = {
    currentPassword: string
    newPassword: string
    confirmNewPassword: string
}

const authenticatorList = [
    {
        label: 'Google Authenticator',
        value: 'googleAuthenticator',
        img: '/img/others/google.png',
        desc: 'با استفاده از اپلیکیشن Google Authenticator کدهای حساس به زمان برای ورود امن تولید می‌شود.',
    },
    {
        label: 'Okta Verify',
        value: 'oktaVerify',
        img: '/img/others/okta.png',
        desc: 'دریافت اعلان‌های فشاری از اپلیکیشن Okta Verify روی گوشی شما برای تأیید سریع ورود.',
    },
    {
        label: 'تأیید ایمیل',
        value: 'emailVerification',
        img: '/img/others/email.png',
        desc: 'کدهای یکتایی که برای تأیید ورود به ایمیل شما ارسال می‌شود.',
    },
]

const validationSchema: ZodType<PasswordSchema> = z
    .object({
        currentPassword: z
            .string({ required_error: 'لطفاً رمز عبور فعلی خود را وارد کنید!' })
            .min(1, { message: 'لطفاً رمز عبور فعلی خود را وارد کنید!' }),

        newPassword: z
            .string({ required_error: 'لطفاً رمز عبور جدید خود را وارد کنید!' })
            .min(6, { message: 'رمز عبور جدید باید حداقل ۶ کاراکتر باشد!' })
            .regex(/[A-Z]/, { message: 'رمز عبور باید شامل حداقل یک حرف بزرگ (A-Z) باشد!' })
            .regex(/[a-z]/, { message: 'رمز عبور باید شامل حداقل یک حرف کوچک (a-z) باشد!' })
            .regex(/[0-9]/, { message: 'رمز عبور باید شامل حداقل یک عدد (0-9) باشد!' }),

        confirmNewPassword: z
            .string({ required_error: 'لطفاً رمز عبور جدید خود را تأیید کنید!' })
            .min(1, { message: 'لطفاً رمز عبور جدید خود را تأیید کنید!' }),
    })
    .refine((data) => data.confirmNewPassword === data.newPassword, {
        message: 'رمز عبورها با هم مطابقت ندارند!',
        path: ['confirmNewPassword'],
    })

const SettingsSecurity = () => {
    const { user } = useSessionUser()

    const [selected2FaType, setSelected2FaType] = useState('googleAuthenticator')
    const [confirmationOpen, setConfirmationOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [pwVisible, setPwVisible] = useState(false)
    const [newPwVisible, setNewPwVisible] = useState(false)
    const [confirmPwVisible, setConfirmPwVisible] = useState(false)

    const formRef = useRef<HTMLFormElement>(null)

    const {
        getValues,
        handleSubmit,
        reset,
        formState: { errors },
        control,
    } = useForm<PasswordSchema>({
        resolver: zodResolver(validationSchema),
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmNewPassword: ''
        }
    })

    const handlePostSubmit = async () => {
        if (!user?.id) return

        setIsSubmitting(true)

        try {
            const values = getValues()

            await apiChangePassword({
                userId: user.id,
                currentPassword: values.currentPassword,
                newPassword: values.newPassword
            })

            toast.push(
                <Notification title="موفقیت" type="success">
                    رمز عبور شما با موفقیت تغییر یافت.
                </Notification>,
                { placement: 'top-center' }
            )

            setConfirmationOpen(false)
            reset({
                currentPassword: '',
                newPassword: '',
                confirmNewPassword: ''
            })

            // مخفی کردن مجدد چشم‌ها بعد از ریست شدن فرم
            setPwVisible(false)
            setNewPwVisible(false)
            setConfirmPwVisible(false)

        } catch (error: any) {
            const errorMsg = error?.response?.data?.message || 'خطایی در تغییر رمز عبور رخ داد.'
            toast.push(
                <Notification title="خطا" type="danger">
                    {errorMsg}
                </Notification>,
                { placement: 'top-center' }
            )
        } finally {
            setIsSubmitting(false)
        }
    }

    const onSubmit = async () => {
        setConfirmationOpen(true)
    }

    return (
        <div>
            <div className="mb-8">
                <h4>رمز عبور</h4>
                <p>
                    به یاد داشته باشید، رمز عبور شما کلید دیجیتالی حساب شماست.
                    آن را امن و محفوظ نگه دارید!
                </p>
            </div>
            <Form
                ref={formRef}
                className="mb-8"
                onSubmit={handleSubmit(onSubmit)}
            >
                <FormItem
                    label="رمز عبور فعلی"
                    invalid={Boolean(errors.currentPassword)}
                    errorMessage={errors.currentPassword?.message}
                >
                    <Controller
                        name="currentPassword"
                        control={control}
                        render={({ field }) => (
                            <Input
                                type={pwVisible ? 'text' : 'password'} // 👈 تغییر تایپ
                                autoComplete="off"
                                placeholder="•••••••••"
                                // 👇 افزودن دکمه چشم در انتهای اینپوت
                                suffix={
                                    <span
                                        className="cursor-pointer text-xl text-gray-500 hover:text-gray-700 transition-colors"
                                        onClick={() => setPwVisible(!pwVisible)}
                                    >
                                        {pwVisible ? <HiOutlineEyeOff /> : <HiOutlineEye />}
                                    </span>
                                }
                                {...field}
                            />
                        )}
                    />
                </FormItem>
                <FormItem
                    label="رمز عبور جدید"
                    invalid={Boolean(errors.newPassword)}
                    errorMessage={errors.newPassword?.message}
                >
                    <Controller
                        name="newPassword"
                        control={control}
                        render={({ field }) => (
                            <Input
                                type={newPwVisible ? 'text' : 'password'}
                                autoComplete="off"
                                placeholder="•••••••••"
                                suffix={
                                    <span
                                        className="cursor-pointer text-xl text-gray-500 hover:text-gray-700 transition-colors"
                                        onClick={() => setNewPwVisible(!newPwVisible)}
                                    >
                                        {newPwVisible ? <HiOutlineEyeOff /> : <HiOutlineEye />}
                                    </span>
                                }
                                {...field}
                            />
                        )}
                    />
                </FormItem>
                <FormItem
                    label="تأیید رمز عبور جدید"
                    invalid={Boolean(errors.confirmNewPassword)}
                    errorMessage={errors.confirmNewPassword?.message}
                >
                    <Controller
                        name="confirmNewPassword"
                        control={control}
                        render={({ field }) => (
                            <Input
                                type={confirmPwVisible ? 'text' : 'password'}
                                autoComplete="off"
                                placeholder="•••••••••"
                                suffix={
                                    <span
                                        className="cursor-pointer text-xl text-gray-500 hover:text-gray-700 transition-colors"
                                        onClick={() => setConfirmPwVisible(!confirmPwVisible)}
                                    >
                                        {confirmPwVisible ? <HiOutlineEyeOff /> : <HiOutlineEye />}
                                    </span>
                                }
                                {...field}
                            />
                        )}
                    />
                </FormItem>
                <div className="flex justify-end">
                    <Button variant="solid" type="submit">
                        به‌روزرسانی
                    </Button>
                </div>
            </Form>

            <ConfirmDialog
                isOpen={confirmationOpen}
                type="warning"
                title="تأیید تغییر رمز عبور"
                confirmButtonProps={{
                    loading: isSubmitting,
                    onClick: handlePostSubmit,
                }}
                onClose={() => setConfirmationOpen(false)}
                onRequestClose={() => setConfirmationOpen(false)}
                onCancel={() => setConfirmationOpen(false)}
            >
                <p>آیا مطمئن هستید که می‌خواهید رمز عبور خود را تغییر دهید؟</p>
            </ConfirmDialog>

            {/* <div className="mb-8">
                <h4>تأیید دو مرحله‌ای</h4>
                <p>
                    حساب شما برای هکرها ارزشمند است. تأیید دو مرحله‌ای را فعال کنید
                    تا حساب خود را ایمن کنید!
                </p>
                <div className="mt-8">
                    {authenticatorList.map((authOption, index) => (
                        <div
                            key={authOption.value}
                            className={classNames(
                                'py-6 border-gray-200 dark:border-gray-600',
                                !isLastChild(authenticatorList, index) &&
                                'border-b',
                            )}
                        >
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <Avatar
                                        size={35}
                                        className="bg-transparent"
                                        src={authOption.img}
                                    />
                                    <div>
                                        <h6>{authOption.label}</h6>
                                        <span>{authOption.desc}</span>
                                    </div>
                                </div>
                                <div>
                                    {selected2FaType === authOption.value ? (
                                        <Button
                                            size="sm"
                                            customColorClass={() =>
                                                'border-success ring-1 ring-success text-success hover:border-success hover:ring-success hover:text-success bg-transparent'
                                            }
                                            onClick={() =>
                                                setSelected2FaType('')
                                            }
                                        >
                                            فعال شده
                                        </Button>
                                    ) : (
                                        <Button
                                            size="sm"
                                            onClick={() =>
                                                setSelected2FaType(
                                                    authOption.value,
                                                )
                                            }
                                        >
                                            فعال‌سازی
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div> */}
        </div>
    )
}

export default SettingsSecurity