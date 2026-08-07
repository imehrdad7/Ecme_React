import { useEffect, useState } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Form, FormItem } from '@/components/ui/Form'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import type { ZodType } from 'zod'
import { useSessionUser } from '@/store/authStore'
import { apiGetCompany , apiUpdateCompanySettings } from '@/services/CompanyService'

type AdvancedSettingsSchema = {
    autoGoodbyeMessage: string
}

const validationSchema: ZodType<AdvancedSettingsSchema> = z.object({
    autoGoodbyeMessage: z.string(), 
})

const AdvancedCompanySettings = ({ onBack }: { onBack: () => void }) => {
    const { user, setUser } = useSessionUser() 
    const [isLoadingData, setIsLoadingData] = useState(false)

    const {
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
        control,
    } = useForm<AdvancedSettingsSchema>({
        resolver: zodResolver(validationSchema),
        defaultValues: {
            autoGoodbyeMessage: user?.company?.autoGoodbyeMessage || '',
        }
    })

    useEffect(() => {
        if (user && user.company) {
            reset({
                autoGoodbyeMessage: user.company.autoGoodbyeMessage || '',
            });
        }
    }, [user?.company?.autoGoodbyeMessage, reset]);

    const onSubmit = async (values: AdvancedSettingsSchema) => {
        try {
           if (!user?.companyId) return;

            await apiUpdateCompanySettings({
                autoGoodbyeMessage: values.autoGoodbyeMessage
            });

            if (user && user.company) {
                setUser({
                    ...user,
                    company: {
                        ...user.company,
                        autoGoodbyeMessage: values.autoGoodbyeMessage
                    }
                });
            }

            toast.push(
                <Notification title="موفقیت" type="success">
                    تنظیمات پیشرفته با موفقیت ذخیره شد.
                </Notification>,
                { placement: 'top-center' }
            )
        } catch (error) {
            toast.push(
                <Notification title="خطا" type="danger">
                    مشکلی در ذخیره تنظیمات پیشرفته به وجود آمد.
                </Notification>,
                { placement: 'top-center' }
            )
        }
    }

    return (
        <div className="animate-[fadeIn_0.3s_ease-out]">
            <div className="mb-6 flex items-center">
                <Button 
                    size="sm" 
                    variant="plain" 
                    onClick={onBack}
                    icon={<i className="text-xl">←</i>}
                >
                    بازگشت به اطلاعات شرکت
                </Button>
            </div>

            <Form onSubmit={handleSubmit(onSubmit)}>
                <div className="flex items-center justify-between mb-8 border-b border-gray-200 dark:border-gray-700 pb-4">
                    <div>
                        <h4 className="mb-1">تنظیمات پیشرفته</h4>
                        <p className="text-gray-500 text-sm">مدیریت اتوماسیون‌ها و پیام‌های خودکار سیستم</p>
                    </div>
                    <Button
                        variant="solid"
                        type="submit"
                        loading={isSubmitting || isLoadingData}
                    >
                        ذخیره تغییرات
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2 lg:col-span-1">
                        <FormItem
                            label="پیام پایان مکالمه (خداحافظی خودکار)"
                            invalid={Boolean(errors.autoGoodbyeMessage)}
                            errorMessage={errors.autoGoodbyeMessage?.message}
                        >
                            <Controller
                                name="autoGoodbyeMessage"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        textArea // در اکثر قالب‌های ری‌اکتی این پراپ برای تکست‌اریا استفاده می‌شود (یا type="textarea" / as="textarea")
                                        autoComplete="off"
                                        placeholder="مثال: گفتگوی شما با پشتیبانی پایان یافت. در صورت داشتن سوال جدید پیام دهید."
                                        disabled={isLoadingData} 
                                        className="min-h-[120px] resize-y" // ارتفاع پیش‌فرض
                                        {...field}
                                    />
                                )}
                            />
                            <p className="text-xs text-gray-500 mt-2">
                                این پیام بلافاصله پس از اینکه اپراتور وضعیت گفتگو را به «بسته» تغییر دهد، برای مشتری در شبکه‌های اجتماعی ارسال می‌شود.
                            </p>
                        </FormItem>
                    </div>
                </div>
            </Form>
        </div>
    )
}

export default AdvancedCompanySettings