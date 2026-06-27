import { useEffect, useState } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Form, FormItem } from '@/components/ui/Form'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import sleep from '@/utils/sleep'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import type { ZodType } from 'zod'
import { useSessionUser } from '@/store/authStore' 
import { apiGetUserProfile } from '@/services/AuthService'
import Switcher from '@/components/ui/Switcher'
import { apiCreateCompany, apiUpdateCompany, apiGetCompany ,apiAssignCompanyToUser,apiDeactivateCompany,apiActivateCompany} from '@/services/CompanyService'

type CompanySchema = {
    companyName: string
    isActive: boolean 
}

const validationSchema: ZodType<CompanySchema> = z.object({
    companyName: z.string().min(1, { message: 'نام شرکت الزامی است' }),
    isActive: z.boolean(),
})

const SettingsCompany = () => {
    const { user, setUser } = useSessionUser() 
    
    // یک استیت برای نمایش حالت لودینگ هنگام دریافت اولیه اطلاعات شرکت
    const [isLoadingData, setIsLoadingData] = useState(false)
    const [initialStatus, setInitialStatus] = useState<boolean>(true)

    const {
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
        control,
        watch
    } = useForm<CompanySchema>({
        resolver: zodResolver(validationSchema),
        defaultValues: {
            companyName: '', 
            isActive: false
        }
    })

    const currentStatus = watch('isActive')

    useEffect(() => {
        const fetchCompanyData = async () => {
            if (user?.companyId) {
                setIsLoadingData(true)
                try {
                    if(user.companyId=="00000000-0000-0000-0000-000000000000")return;
                    const response = await apiGetCompany(user.companyId)
                    if (response) {

                        const fetchedStatus = response.isActive ?? true;
                        setInitialStatus(fetchedStatus)

                        reset({
                            companyName: response.name || '',
                            isActive: response.isActive ?? true,
                        })
                    }
                } catch (error) {
                    console.error('خطا در دریافت اطلاعات شرکت:', error)
                    toast.push(
                        <Notification title="خطا" type="danger">
                            مشکلی در دریافت اطلاعات شرکت به وجود آمد.
                        </Notification>,
                        { placement: 'top-center' }
                    )
                } finally {
                    setIsLoadingData(false)
                }
            }
        }

        fetchCompanyData()
    }, [user?.companyId, reset])

    const onSubmit = async (values: CompanySchema) => {
        try {
            await sleep(500) 
           
            debugger
            const hasCompany = !!user?.companyId && user?.companyId !="00000000-0000-0000-0000-000000000000"
            if (hasCompany && user?.companyId) {
                await apiUpdateCompany(user.companyId, { 
                    id: user.companyId, 
                    name: values.companyName,
                });
                if (values.isActive !== initialStatus) {
                    if (values.isActive) {
                        await apiActivateCompany(user.companyId);
                    } else {
                        await apiDeactivateCompany(user.companyId);
                    }
                    // آپدیت کردن وضعیت اولیه بعد از موفقیت‌آمیز بودن تغییر
                    setInitialStatus(true);
                }
            } else {
                const companyId = await apiCreateCompany({ name: values.companyName })
                if (companyId) {
                    await apiAssignCompanyToUser({
                        userId: user.id,
                        companyId: companyId
                    });
                    
                    setInitialStatus(values.isActive);

                    // به‌روزرسانی اطلاعات کاربر...
                    const phone = user?.phoneNumber || user?.userName
                    if (phone) {
                        try {
                            const profileResp = await apiGetUserProfile(phone)
                            if (profileResp) {
                                setUser(profileResp) 
                            }
                        } catch (profileError) {
                            console.error(profileError)
                        }
                    }
                }
            }
            toast.push(
                <Notification title="موفقیت" type="success">
                    اطلاعات شرکت با موفقیت ذخیره شد.
                </Notification>,
                { placement: 'top-center' }
            )
        } catch (error) {
            toast.push(
                <Notification title="خطا" type="danger">
                    مشکلی در ذخیره اطلاعات شرکت به وجود آمد.
                </Notification>,
                { placement: 'top-center' }
            )
        }
    
    }
    return (
        <Form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex items-center justify-between mb-8 border-b border-gray-200 dark:border-gray-700 pb-4">
                <h4 className="mb-0">اطلاعات شرکت</h4>
                <div className="flex items-center gap-2 mr-4 border-r border-gray-200 pr-4">
                    {user?.companyId && (
                    <div className="flex items-center gap-2 mr-4 border-r border-gray-200 pr-4">
                        <span className={`font-semibold ${currentStatus ? 'text-green-600' : 'text-red-600'}`}>
                            {currentStatus ? 'فعال' : 'غیرفعال'}
                        </span>
                        <Controller
                            name="isActive"
                            control={control}
                            render={({ field }) => (
                                <Switcher 
                                    checked={field.value}
                                    onChange={(checked) => field.onChange(checked)}
                                    disabled={isLoadingData}
                                />
                            )}
                        />
                    </div>
                    )}
                </div>
                <Button
                    variant="solid"
                    type="submit"
                    loading={isSubmitting || isLoadingData}
                >
                    ذخیره تغییرات
                </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                <FormItem
                    label="نام شرکت"
                    invalid={Boolean(errors.companyName)}
                    errorMessage={errors.companyName?.message}
                >
                    <Controller
                        name="companyName"
                        control={control}
                        render={({ field }) => (
                            <Input
                                type="text"
                                autoComplete="off"
                                placeholder="مثلاً: توسعه‌دهندگان پیشرو"
                                disabled={isLoadingData} // تا زمان دریافت اطلاعات، اینپوت غیرفعال باشد
                                {...field}
                            />
                        )}
                    />
                </FormItem>
            </div>
        </Form>
    )
}

export default SettingsCompany