import { useEffect } from 'react'
import Button from '@/components/ui/Button'
import Upload from '@/components/ui/Upload'
import Input from '@/components/ui/Input'
import Avatar from '@/components/ui/Avatar'
import { Form, FormItem } from '@/components/ui/Form'
import NumericInput from '@/components/shared/NumericInput'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import sleep from '@/utils/sleep'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { HiOutlineUser, HiCamera, HiPencil, HiTrash } from 'react-icons/hi'
import type { ZodType } from 'zod'
import { useSessionUser } from '@/store/authStore'
import { apiGetUserProfile,apiUpdateUserProfile} from '@/services/AuthService'
import appConfig from '@/configs/app.config'

type ProfileSchema = {
    firstName: string
    lastName: string
    email: string
    phoneNumber: string
    img: string
}
const getFullAvatarUrl = (avatarPath?: string | null) => {
    if (!avatarPath) return '';
    
    // اگر آدرس از قبل کامل بود یا blob موقت بود، دست نزن
    if (avatarPath.startsWith('http') || avatarPath.startsWith('blob:')) {
        return avatarPath;
    }
    
    // تنظیم آی‌پی و پورت دقیق بک‌اند
    const backendBaseUrl = appConfig.apiPrefix; 
    const separator = avatarPath.startsWith('/') ? '' : '/';
    
    return `${backendBaseUrl}${separator}${avatarPath}`;
};

const validationSchema: ZodType<ProfileSchema> = z.object({
    firstName: z.string().min(1, { message: 'نام لازم است' }),
    lastName: z.string().min(1, { message: 'نام خانوادگی لازم است' }),
    email: z
        .string()
        .min(1, { message: 'ایمیل لازم است' })
        .email({ message: 'ایمیل نامعتبر است' }),
    phoneNumber: z.string(),
    img: z.string(),
})

const SettingsProfile = () => {
    
    const { user, setUser } = useSessionUser()

    const beforeUpload = (files: FileList | null) => {
        let valid: string | boolean = true

        const allowedFileType = ['image/jpeg', 'image/png']
        if (files) {
            for (const file of files) {
                if (!allowedFileType.includes(file.type)) {
                    valid = 'لطفاً فقط فایل‌های png یا jpeg آپلود کنید!'
                }
            }
        }

        return valid
    }

    const {
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
        control,
    } = useForm<ProfileSchema>({
        resolver: zodResolver(validationSchema),
        defaultValues: {
            firstName: user?.firstName || '',
            lastName: user?.lastName || '',
            email: user?.email || '',
            phoneNumber: user?.phoneNumber || user?.userName || '', 
            img: getFullAvatarUrl(user.avatarFileName),    
        }
    })
    useEffect(() => {
        if (user) {
            reset({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                phoneNumber: user.phoneNumber || user.userName || '',
                img: user.avatarFileName || '',
            })
        }
    }, [user, reset])

    const onSubmit = async (values: ProfileSchema) => {
        
        try {
            await sleep(500) 
            const formData = new FormData();
            formData.append('UserId', user.id);
            formData.append('FirstName', values.firstName || '');
            formData.append('LastName', values.lastName || '');
            formData.append('Email', values.email || '');
            if (values.img === '') {
                formData.append('DeleteAvatar', 'true');
            } 
            else if (values.img.startsWith('blob:')) {
                const response = await fetch(values.img);
                const blobData = await response.blob();
                formData.append('AvatarFile', blobData, 'avatar.jpg');
                formData.append('DeleteAvatar', 'false');
            } 
            else {
                formData.append('DeleteAvatar', 'false');
            }

            await apiUpdateUserProfile(user.id, formData)
            
            const phone = user.phoneNumber;
            try {
                const profileResp = await apiGetUserProfile(phone?? "")
                if (profileResp) {
                    setUser(profileResp) 
                }
            } 
            catch (profileError) {
                console.error('خطا در دریافت اطلاعات کاربر:', profileError)
            }

            toast.push(
                <Notification title="موفقیت" type="success">
                    اطلاعات پروفایل با موفقیت بروزرسانی شد.
                </Notification>,
                { placement: 'top-center' }
            )
        } catch (error) {
            toast.push(
                <Notification title="خطا" type="danger">
                    مشکلی در ذخیره اطلاعات به وجود آمد.
                </Notification>,
                { placement: 'top-center' }
            )
        }
    }

    return (
        <Form onSubmit={handleSubmit(onSubmit)}>
            {/* هدر با دکمه ذخیره در روبه‌رو */}
            <div className="flex items-center justify-between mb-8 border-b border-gray-200 dark:border-gray-700 pb-4">
                <h4 className="mb-0">اطلاعات شخصی</h4>
                <Button
                    variant="solid"
                    type="submit"
                    loading={isSubmitting}
                >
                    ذخیره تغییرات
                </Button>
            </div>

            <Controller
                name="img"
                control={control}
                render={({ field }) => (
                    <div className="flex items-center mb-8">
                        {!field.value ? (
                            /* حالت بدون عکس: خود آواتار دکمه آپلود است */
                            <Upload
                                showList={false}
                                uploadLimit={1}
                                beforeUpload={beforeUpload}
                                onChange={(files) => {
                                    if (files.length > 0) {
                                        field.onChange(URL.createObjectURL(files[0]))
                                    }
                                }}
                            >
                                <div className="relative group cursor-pointer rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-100 flex items-center justify-center" style={{ width: 90, height: 90 }}>
                                    <HiOutlineUser className="text-4xl text-gray-300 group-hover:opacity-0 transition-opacity duration-300" />
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 transition-all duration-300">
                                        <HiCamera className="text-2xl text-white" />
                                    </div>
                                </div>
                            </Upload>
                        ) : (
                            /* حالت دارای عکس: دو دکمه آیکونی کوچک و شیک در کنار عکس */
                            <div className="flex items-center gap-4">
                                <Avatar
                                    size={90}
                                    className="border-4 border-white shadow-lg"
                                    src={getFullAvatarUrl(field.value)}
                                />
                                <div className="flex gap-2">
                                    <Upload
                                        showList={false}
                                        uploadLimit={1}
                                        beforeUpload={beforeUpload}
                                        onChange={(files) => {
                                            if (files.length > 0) {
                                                field.onChange(URL.createObjectURL(files[0]))
                                            }
                                        }}
                                    >
                                        <Button
                                            size="sm"
                                            type="button"
                                            icon={<HiPencil />}
                                            className="text-gray-500 hover:text-blue-500 hover:bg-blue-50"
                                        />
                                    </Upload>
                                    <Button
                                        size="sm"
                                        type="button"
                                        className="text-gray-500 hover:text-red-500 hover:bg-red-50"
                                        icon={<HiTrash />}
                                        onClick={() => field.onChange('')}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                )}
            />

            <div className="grid md:grid-cols-2 gap-4">
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
                                autoComplete="off"
                                placeholder="نام"
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
                                autoComplete="off"
                                placeholder="نام خانوادگی"
                                {...field}
                            />
                        )}
                    />
                </FormItem>
            </div>
            
            <FormItem
                label="ایمیل"
                invalid={Boolean(errors.email)}
                errorMessage={errors.email?.message}
            >
                <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                        <Input
                            type="email"
                            autoComplete="off"
                            placeholder="ایمیل"
                            {...field}
                        />
                    )}
                />
            </FormItem>

            <FormItem
                className="w-full mb-6"
                invalid={Boolean(errors.phoneNumber)}
                errorMessage={errors.phoneNumber?.message}
            >
                <label className="form-label mb-2">شماره موبایل (نام کاربری)</label>
                <Controller
                    name="phoneNumber"
                    control={control}
                    render={({ field }) => (
                        <NumericInput
                            autoComplete="off"
                            placeholder="شماره موبایل"
                            disabled={true}
                            dir="ltr"
                            className="text-left font-mono text-lg"
                            value={field.value}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                        />
                    )}
                />
            </FormItem>
        </Form>
    )
}

export default SettingsProfile