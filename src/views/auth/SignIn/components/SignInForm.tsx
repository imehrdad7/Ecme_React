import { useState } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { FormItem, Form } from '@/components/ui/Form'
import PasswordInput from '@/components/shared/PasswordInput'
import classNames from '@/utils/classNames'
import { useAuth } from '@/auth'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { ZodType } from 'zod'
import type { CommonProps } from '@/@types/common'
import type { ReactNode } from 'react'

interface SignInFormProps extends CommonProps {
    disableSubmit?: boolean
    passwordHint?: string | ReactNode
    setMessage?: (message: string) => void
}

type SignInFormSchema = {
    phonenumber: string
    password: string
}

const validationSchema: ZodType<SignInFormSchema> = z.object({
    phonenumber: z
        .string({ required_error: 'لطفا شماره موبایل خود را وارد کنید' })
        .min(1, { message: 'لطفا شماره موبایل خود را وارد کنید' }),
    password: z
        .string({ required_error: 'لطفا رمز عبور خود را وارد کنید' })
        .min(1, { message: 'لطفا رمز عبور خود را وارد کنید' }),
})

const SignInForm = (props: SignInFormProps) => {
    const [isSubmitting, setSubmitting] = useState<boolean>(false)

    const { disableSubmit = false, className, setMessage, passwordHint } = props

    const {
        handleSubmit,
        formState: { errors },
        control,
    } = useForm<SignInFormSchema>({
        resolver: zodResolver(validationSchema),
    })

    const { signIn } = useAuth()

    const onSignIn = async (values: SignInFormSchema) => {
        const { phonenumber, password } = values

        if (!disableSubmit) {
            setSubmitting(true)

            const result = await signIn({ phonenumber, password })

            if (result?.status === 'failed') {
                setMessage?.(result.message)
            }
        }

        setSubmitting(false)
    }

    return (
        <div className={className} >
            <Form onSubmit={handleSubmit(onSignIn)}>
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
                                type="number"
                                placeholder="شماره موبایل"
                                autoComplete="off"
                                {...field}
                            />
                        )}
                    />
                </FormItem>
                <FormItem
                    label="رمز عبور"
                    invalid={Boolean(errors.password)}
                    errorMessage={errors.password?.message}
                    className={classNames(
                        passwordHint && 'mb-0',
                        errors.password?.message && 'mb-8',
                    )}
                >
                    <Controller
                        name="password"
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                            <PasswordInput
                                type="text"
                                placeholder="رمز عبور"
                                autoComplete="off"
                                {...field}
                            />
                        )}
                    />
                </FormItem>
                {passwordHint}
                <Button
                    block
                    loading={isSubmitting}
                    variant="solid"
                    type="submit"
                >
                    {isSubmitting ? 'در حال ورود...' : 'ورود'}
                </Button>
            </Form>
        </div>
    )
}

export default SignInForm
