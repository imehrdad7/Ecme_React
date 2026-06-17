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

interface SignUpFormProps extends CommonProps {
    disableSubmit?: boolean
    setMessage?: (message: string) => void
}

type SignUpFormSchema = {
    fullname: string
    password: string
    phonenumber: string
    confirmPassword: string
}

const validationSchema: ZodType<SignUpFormSchema> = z
    .object({
        phonenumber: z.string({ required_error: 'لطفاً شماره موبایل خود را وارد کنید' }),
        fullname: z.string({ required_error: 'لطفاً نام و نام خانوادگی خود را وارد کنید' }),
        password: z.string({ required_error: 'رمز عبور الزامی است' }),
        confirmPassword: z.string({
            required_error: 'تأیید رمز عبور الزامی است',
        }),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'رمز عبور مطابقت ندارد',
        path: ['confirmPassword'],
    })

const SignUpForm = (props: SignUpFormProps) => {
    const { disableSubmit = false, className, setMessage } = props

    const [isSubmitting, setSubmitting] = useState<boolean>(false)

    const { signUp } = useAuth()

    const {
        handleSubmit,
        formState: { errors },
        control,
    } = useForm<SignUpFormSchema>({
        resolver: zodResolver(validationSchema),
    })

    const onSignUp = async (values: SignUpFormSchema) => {
        const {phonenumber, fullname, password } = values

        if (!disableSubmit) {
            setSubmitting(true)
            const result = await signUp({ phonenumber, fullname, password })

            if (result?.status === 'failed') {
                setMessage?.(result.message)
            }

            setSubmitting(false)
        }
    }

    return (
        <div className={className}>
            <Form onSubmit={handleSubmit(onSignUp)}>
                <FormItem
                    label="شماره موبایل"
                    invalid={Boolean(errors.fullname)}
                    errorMessage={errors.fullname?.message}
                >
                    <Controller
                        name="phonenumber"
                        control={control}
                        render={({ field }) => (
                            <Input
                                type="text"
                                placeholder="شماره موبایل همان نام کاربری است"
                                autoComplete="off"
                                {...field}
                            />
                        )}
                    />
                </FormItem>
                
                { <FormItem
                    label="نام و نام خانوادگی"
                    invalid={Boolean(errors.fullname)}
                    errorMessage={errors.fullname?.message}
                >
                    <Controller
                        name="fullname"
                        control={control}
                        render={({ field }) => (
                            <Input
                                type="text"
                                placeholder="نام و نام خانوادگی خود را وارد کنید"
                                autoComplete="off"
                                {...field}
                            />
                        )}
                    />
                </FormItem> }
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
                <FormItem
                    label="تأیید رمز عبور"
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
                                placeholder="تأیید رمز عبور خود را وارد کنید"
                                {...field}
                            />
                        )}
                    />
                </FormItem>
                <Button
                    block
                    loading={isSubmitting}
                    variant="solid"
                    type="submit"
                >
                    {isSubmitting ? 'در حال ایجاد حساب کاربری...' : 'ثبت نام'}
                </Button>
            </Form>
        </div>
    )
}

export default SignUpForm
