import { useState } from 'react'
import Button from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import Switcher from '@/components/ui/Switcher' // استفاده از Switcher استاندارد
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { apiCreatePlan } from '@/services/PlanService'

interface Props {
    onSuccess: () => void;
}

const CreatePlanForm = ({ onSuccess }: Props) => {
    // --- فیلدهای پایه ---
    const [name, setName] = useState('')
    const [price, setPrice] = useState('')

    const [displayOrder, setDisplayOrder] = useState<string>('');
    const [isRecommended, setIsRecommended] = useState<boolean>(false);
    
    const [allocatedAiTokens, setAllocatedAiTokens] = useState('')
    
    // --- محدودیت‌ها (Limits) ---
    const [maxBots, setMaxBots] = useState('')
    const [maxContacts, setMaxContacts] = useState('')
    const [maxMessagesPerMonth, setMaxMessagesPerMonth] = useState('')
    const [maxOperators, setMaxOperators] = useState('')
    const [maxBroadcastsPerMonth, setMaxBroadcastsPerMonth] = useState('')
    const [dataRetentionDays, setDataRetentionDays] = useState('')
    const [maxAutomatedFlows, setMaxAutomatedFlows] = useState('')
    const [maxAttachmentSizeMB, setMaxAttachmentSizeMB] = useState('')

    // --- ویژگی‌ها (Features) ---
    const [features, setFeatures] = useState({
        hasCloudStorage: false,
        removeBranding: false,
        hasApiAccess: false,
        hasPremiumSupport: false,
        hasPremiumAiModels: false,
        allowInChatPayments: false,
        hasPremiumChannels: false,
        hasHumanHandoff: false,
        hasCustomDomain: false,
        hasABTesting: false,
        hasMultiLanguage: false
    })
    
    const [isLoading, setIsLoading] = useState(false)

    const handleFeatureChange = (featureName: keyof typeof features) => {
        setFeatures(prev => ({ ...prev, [featureName]: !prev[featureName] }))
    }

    const handleSubmit = async () => {
        if (!name.trim() || !price || !allocatedAiTokens) {
            toast.push(
                <Notification title="خطا" type="danger">
                    لطفاً نام پلن، قیمت و سهمیه توکن هوش مصنوعی را وارد کنید.
                </Notification>, 
                { placement: 'top-center' }
            )
            return
        }

        setIsLoading(true)
        try {
            await apiCreatePlan({ 
                name, 
                price: Number(price), 
                allocatedAiTokens: Number(allocatedAiTokens),
                isRecommended: Boolean(isRecommended),
                displayOrder: displayOrder ? Number(displayOrder) : null,

                // محدودیت‌ها
                maxBots: Number(maxBots) || 1, 
                maxContacts: Number(maxContacts) || 0, 
                maxMessagesPerMonth: Number(maxMessagesPerMonth) || 0,
                maxOperators: Number(maxOperators) || 0,
                maxBroadcastsPerMonth: Number(maxBroadcastsPerMonth) || 0,
                dataRetentionDays: Number(dataRetentionDays) || 0,
                maxAutomatedFlows: Number(maxAutomatedFlows) || 0,
                maxAttachmentSizeMB: Number(maxAttachmentSizeMB) || 0,

                // ویژگی‌ها (پخش کردن شیء features)
                ...features
            })
            
            toast.push(
                <Notification title="موفق" type="success">
                    پلن جدید با موفقیت در سیستم تعریف شد.
                </Notification>, 
                { placement: 'top-center' }
            )
            
            onSuccess()
        } catch (error) {
            toast.push(
                <Notification title="خطا" type="danger">
                    مشکلی در ثبت پلن به وجود آمد. لطفاً دوباره تلاش کنید.
                </Notification>, 
                { placement: 'top-center' }
            )
        } finally {
            setIsLoading(false)
        }
    }

    return (
        /* 👈 استایل‌های اسکرول‌بار باریک و جهت چپ‌چین (برای قرارگیری اسکرول در راست) */
        <div 
            dir="ltr"
            className="flex flex-col max-h-[70vh] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full"
        >
            {/* 👈 کانتینر اصلی که جهت محتوا را به راست‌چین (RTL) برمی‌گرداند */}
            <div dir="rtl" className="flex flex-col gap-6 pl-2 pr-1 pb-1">
                
                {/* بخش ۱: اطلاعات پایه */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 shadow-sm">
                    <h6 className="mb-4 text-indigo-700 border-b border-gray-200 pb-2">اطلاعات پایه</h6>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-1">نام پلن <span className="text-red-500">*</span></label>
                            <Input placeholder="مثال: پلن سازمانی" value={name} onChange={(e) => setName(e.target.value)} disabled={isLoading} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">قیمت (تومان) <span className="text-red-500">*</span></label>
                            <Input placeholder="0" type="number" value={price} onChange={(e) => setPrice(e.target.value)} disabled={isLoading} className="dir-ltr text-left" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">سهمیه توکن AI <span className="text-red-500">*</span></label>
                            <Input placeholder="مثال: 500000" type="number" value={allocatedAiTokens} onChange={(e) => setAllocatedAiTokens(e.target.value)} disabled={isLoading} className="dir-ltr text-left border-indigo-200" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">اولویت نمایش (اختیاری)</label>
                            <Input 
                                placeholder="خالی = انتقال به انتهای لیست" 
                                type="number" 
                                value={displayOrder} 
                                onChange={(e) => setDisplayOrder(e.target.value)} 
                                disabled={isLoading} 
                                className="dir-ltr text-left" 
                            />
                        </div>

                        {/* استفاده از Switcher استاندارد قالب */}
                        <div className="flex items-center md:mt-6">
                            <span className="flex items-center justify-between group hover:bg-gray-100 p-4 -mx-2 rounded transition-colors">نمایش "پیشنهاد ویژه"</span>
                            <Switcher 
                                checked={isRecommended} 
                                onChange={() => setIsRecommended(!isRecommended)} 
                                disabled={isLoading}
                            />
                        </div>
                    </div>
                </div>

                {/* بخش ۲: محدودیت‌های منابع */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 shadow-sm">
                    <h6 className="mb-4 text-indigo-700 border-b border-gray-200 pb-2">محدودیت‌های منابع (0 = نامحدود)</h6>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-600">حداکثر ربات‌ها</label>
                            <Input placeholder="1" type="number" value={maxBots} onChange={(e) => setMaxBots(e.target.value)} disabled={isLoading} className="dir-ltr text-left" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-600">مخاطبین مجاز</label>
                            <Input placeholder="0" type="number" value={maxContacts} onChange={(e) => setMaxContacts(e.target.value)} disabled={isLoading} className="dir-ltr text-left" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-600">پیام در ماه</label>
                            <Input placeholder="0" type="number" value={maxMessagesPerMonth} onChange={(e) => setMaxMessagesPerMonth(e.target.value)} disabled={isLoading} className="dir-ltr text-left" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-600">تعداد اپراتورها</label>
                            <Input placeholder="0" type="number" value={maxOperators} onChange={(e) => setMaxOperators(e.target.value)} disabled={isLoading} className="dir-ltr text-left" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-600">فلوهای خودکار</label>
                            <Input placeholder="0" type="number" value={maxAutomatedFlows} onChange={(e) => setMaxAutomatedFlows(e.target.value)} disabled={isLoading} className="dir-ltr text-left" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-600">نگهداری داده (روز)</label>
                            <Input placeholder="0" type="number" value={dataRetentionDays} onChange={(e) => setDataRetentionDays(e.target.value)} disabled={isLoading} className="dir-ltr text-left" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-600">پیام برودکست (ماهانه)</label>
                            <Input placeholder="0" type="number" value={maxBroadcastsPerMonth} onChange={(e) => setMaxBroadcastsPerMonth(e.target.value)} disabled={isLoading} className="dir-ltr text-left" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-600">حجم پیوست (MB)</label>
                            <Input placeholder="0" type="number" value={maxAttachmentSizeMB} onChange={(e) => setMaxAttachmentSizeMB(e.target.value)} disabled={isLoading} className="dir-ltr text-left" />
                        </div>
                    </div>
                </div>

                {/* بخش ۳: امکانات ویژه (Features) */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 shadow-sm">
                    <h6 className="mb-4 text-indigo-700 border-b border-gray-200 pb-2">امکانات ویژه (Enterprise Features)</h6>
                    {/* 👈 تغییر به گرید ۳ ستونه (md:grid-cols-3) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-6 mt-2">
                        {[
                            { key: 'hasCloudStorage', label: 'فضای ابری اختصاصی' },
                            { key: 'removeBranding', label: 'حذف لوگوی AnyBot (White-label)' },
                            { key: 'hasApiAccess', label: 'دسترسی به API برنامه‌نویسان' },
                            { key: 'hasPremiumSupport', label: 'پشتیبانی ویژه (Premium)' },
                            { key: 'hasPremiumAiModels', label: 'دسترسی به مدل‌های AI پیشرفته' },
                            { key: 'allowInChatPayments', label: 'درگاه پرداخت درون‌چت' },
                            { key: 'hasPremiumChannels', label: 'کانال‌های اتصال پرمیوم' },
                            { key: 'hasHumanHandoff', label: 'انتقال چت به اپراتور انسانی' },
                            { key: 'hasCustomDomain', label: 'اتصال دامنه اختصاصی' },
                            { key: 'hasABTesting', label: 'تست A/B برای فلوها' },
                            { key: 'hasMultiLanguage', label: 'پشتیبانی چندزبانه ربات' }
                        ].map((feature) => (
                            <div key={feature.key} className="flex items-center justify-between group hover:bg-gray-100 p-2 -mx-2 rounded transition-colors">
                                <span className="text-sm text-gray-700 font-medium">{feature.label}</span>
                                <Switcher 
                                    checked={features[feature.key as keyof typeof features]} 
                                    onChange={() => handleFeatureChange(feature.key as keyof typeof features)} 
                                    disabled={isLoading}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end mt-2 pt-4 border-t sticky bottom-0 bg-white z-10">
                    <Button 
                        variant="solid" 
                        className="bg-indigo-600 hover:bg-indigo-500 w-full md:w-auto" 
                        loading={isLoading} 
                        onClick={handleSubmit}
                    >
                        ذخیره پلن جدید
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default CreatePlanForm