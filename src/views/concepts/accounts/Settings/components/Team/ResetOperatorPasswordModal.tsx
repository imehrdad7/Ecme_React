import { useState } from 'react'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import Input from '@/components/ui/Input'
import { Form, FormItem } from '@/components/ui/Form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { HiOutlineEyeOff, HiOutlineEye } from 'react-icons/hi'
import { apiResetOperatorPassword } from '@/services/teamService'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { useSessionUser } from '@/store/authStore'

type ResetPasswordSchema = {
    newPassword: string
    confirmNewPassword: string
}

const validationSchema = z.object({
    newPassword: z
        .string({ required_error: 'لطفاً رمز عبور جدید را وارد کنید!' })
        .min(6, { message: 'رمز عبور باید حداقل ۶ کاراکتر باشد!' })
        .regex(/[A-Z]/, { message: 'حداقل یک حرف بزرگ (A-Z) نیاز است!' })
        .regex(/[a-z]/, { message: 'حداقل یک حرف کوچک (a-z) نیاز است!' })
        .regex(/[0-9]/, { message: 'حداقل یک عدد (0-9) نیاز است!' }),
    confirmNewPassword: z
        .string({ required_error: 'لطفاً رمز عبور را تأیید کنید!' })
        .min(1, { message: 'لطفاً رمز عبور را تأیید کنید!' }),
}).refine((data) => data.confirmNewPassword === data.newPassword, {
    message: 'رمز عبورها مطابقت ندارند!',
    path: ['confirmNewPassword'],
})

type Props = {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    member: any
}

export const ResetOperatorPasswordModal = ({ isOpen, onClose, onSuccess, member }: Props) => {
    const { user } = useSessionUser()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [newPwVisible, setNewPwVisible] = useState(false)
    const [confirmPwVisible, setConfirmPwVisible] = useState(false)

    const { handleSubmit, reset, formState: { errors }, control } = useForm<ResetPasswordSchema>({
        resolver: zodResolver(validationSchema),
        defaultValues: { newPassword: '', confirmNewPassword: '' }
    })

    const handleReset = () => {
        reset({ newPassword: '', confirmNewPassword: '' })
        setNewPwVisible(false)
        setConfirmPwVisible(false)
    }

    const onDialogClose = () => {
        handleReset()
        onClose()
    }

    const onSubmit = async (values: ResetPasswordSchema) => {
        if (!member?.id || !user?.companyId) return
        setIsSubmitting(true)
        try {
            
            await apiResetOperatorPassword({
                userId: member.id,
                companyId: user.companyId,
                newPassword: values.newPassword
            })
            onSuccess()
            onDialogClose()
        } catch (error: any) {
            const errorMsg = error?.response?.data?.message || 'خطا در تغییر رمز عبور.'
            toast.push(
                <Notification title="خطا" type="danger">{errorMsg}</Notification>,
                { placement: 'top-center' }
            )
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog
            isOpen={isOpen}
            onClose={onDialogClose}
            onRequestClose={onDialogClose}
        >
            <h5 className="mb-4">تغییر رمز عبور: {member?.firstName} {member?.lastName}</h5>
            <Form onSubmit={handleSubmit(onSubmit)}>
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
                                        className="cursor-pointer text-xl text-gray-500"
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
                                        className="cursor-pointer text-xl text-gray-500"
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
                <div className="text-right mt-6">
                    <Button
                        className="ltr:mr-2 rtl:ml-2"
                        variant="plain"
                        type="button"
                        onClick={onDialogClose}
                    >
                        انصراف
                    </Button>
                    <Button variant="solid" type="submit" loading={isSubmitting}>
                        تغییر رمز عبور
                    </Button>
                </div>
            </Form>
        </Dialog>
    )
}