import { useState, useEffect } from 'react'
import Dialog from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import Switcher from '@/components/ui/Switcher'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { apiGetPlanById, apiUpdatePlanLimits } from '@/services/PlanService'

interface Props {
    planId: string | null;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const PlanLimitsModal = ({ planId, isOpen, onClose, onSuccess }: Props) => {
    // --- Stateهای اصلی (محدودیت‌ها) ---
    const [allocatedAiTokens, setAllocatedAiTokens] = useState('')
    const [maxBots, setMaxBots] = useState('')
    const [maxContacts, setMaxContacts] = useState('')
    const [maxMessagesPerMonth, setMaxMessagesPerMonth] = useState('')
    const [maxOperators, setMaxOperators] = useState('')
    const [maxBroadcastsPerMonth, setMaxBroadcastsPerMonth] = useState('')
    const [dataRetentionDays, setDataRetentionDays] = useState('')
    const [maxAutomatedFlows, setMaxAutomatedFlows] = useState('')
    const [maxAttachmentSizeMB, setMaxAttachmentSizeMB] = useState('')
    
    // --- State امکانات ویژه (Features) ---
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

    const [isFetching, setIsFetching] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (isOpen && planId) {
            document.body.classList.add('overflow-hidden');
            fetchPlanDetails()
        } else {
            document.body.classList.remove('overflow-hidden');
        }

        return () => {
            document.body.classList.remove('overflow-hidden');
        };
    }, [isOpen, planId])

    const fetchPlanDetails = async () => {
        setIsFetching(true)
        try {
            const res = await apiGetPlanById(planId!)
            if (res) {
                setMaxBots(String(res.maxBots))
                setMaxContacts(String(res.maxContacts))
                setMaxMessagesPerMonth(String(res.maxMessagesPerMonth))
                setAllocatedAiTokens(String(res.allocatedAiTokens))
                setMaxOperators(String(res.maxOperators))
                setMaxBroadcastsPerMonth(String(res.maxBroadcastsPerMonth))
                setDataRetentionDays(String(res.dataRetentionDays))
                setMaxAutomatedFlows(String(res.maxAutomatedFlows))
                setMaxAttachmentSizeMB(String(res.maxAttachmentSizeMB))
                
                setFeatures({
                    hasCloudStorage: res.hasCloudStorage || false,
                    removeBranding: res.removeBranding || false,
                    hasApiAccess: res.hasApiAccess || false,
                    hasPremiumSupport: res.hasPremiumSupport || false,
                    hasPremiumAiModels: res.hasPremiumAiModels || false,
                    allowInChatPayments: res.allowInChatPayments || false,
                    hasPremiumChannels: res.hasPremiumChannels || false,
                    hasHumanHandoff: res.hasHumanHandoff || false,
                    hasCustomDomain: res.hasCustomDomain || false,
                    hasABTesting: res.hasABTesting || false,
                    hasMultiLanguage: res.hasMultiLanguage || false
                })
            }
        } catch (error) {
            toast.push(<Notification title="خطا" type="danger">خطا در دریافت اطلاعات محدودیت‌های پلن</Notification>, { placement: 'top-center' })
            onClose()
        } finally {
            setIsFetching(false)
        }
    }

    const handleFeatureChange = (featureName: keyof typeof features) => {
        setFeatures(prev => ({ ...prev, [featureName]: !prev[featureName] }))
    }

    const handleSubmit = async () => {
        if (!planId) return

        setIsLoading(true)
        try {
            await apiUpdatePlanLimits(planId, {
                planId,
                maxBots: Number(maxBots) || 1,
                maxContacts: Number(maxContacts) || 0,
                maxMessagesPerMonth: Number(maxMessagesPerMonth) || 0,
                allocatedAiTokens: Number(allocatedAiTokens) || 0,
                maxOperators: Number(maxOperators) || 0,
                maxBroadcastsPerMonth: Number(maxBroadcastsPerMonth) || 0,
                dataRetentionDays: Number(dataRetentionDays) || 0,
                maxAutomatedFlows: Number(maxAutomatedFlows) || 0,
                maxAttachmentSizeMB: Number(maxAttachmentSizeMB) || 0,
                ...features
            })

            toast.push(<Notification title="موفق" type="success">محدودیت‌ها و امکانات پلن به‌روزرسانی شد.</Notification>, { placement: 'top-center' })
            onSuccess()
            onClose()
        } catch (error) {
            toast.push(<Notification title="خطا" type="danger">مشکلی در ویرایش پیش آمد.</Notification>, { placement: 'top-center' })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog isOpen={isOpen} onClose={onClose} width={900}>
            {isFetching ? (
                <div className="p-8 text-center text-gray-500">در حال بارگذاری اطلاعات...</div>
            ) : (
                /* 👈 کانتینر اصلی اسکرول: dir="ltr" اسکرول را به راست می‌برد، کلاس‌های سفارشی آن را باریک می‌کنند */
                <div 
                    dir="ltr" 
                    className="max-h-[75vh] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full"
                >
                    {/* 👈 کانتینر محتوا: دوباره راست‌چین می‌شود تا متون به هم نریزند */}
                    <div dir="rtl" className="flex flex-col gap-4 pl-2 pr-1">
                        
                        <div className="mb-2">
                            <h5 className="text-gray-800">محدودیت‌ها و امکانات پلن</h5>
                            <p className="text-sm text-gray-500 mt-1">مقدار صفر (0) به معنای نامحدود بودن آن منبع است.</p>
                        </div>

                        {/* 👈 گرید ۳ ستونه برای محدودیت‌ها */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-indigo-600">سهمیه توکن AI (ماهانه)</label>
                                <Input type="number" value={allocatedAiTokens} onChange={(e) => setAllocatedAiTokens(e.target.value)} disabled={isLoading} className="dir-ltr text-left border-indigo-200" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">حداکثر ربات‌ها</label>
                                <Input type="number" value={maxBots} onChange={(e) => setMaxBots(e.target.value)} disabled={isLoading} className="dir-ltr text-left" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">حداکثر مخاطبین مجاز</label>
                                <Input type="number" value={maxContacts} onChange={(e) => setMaxContacts(e.target.value)} disabled={isLoading} className="dir-ltr text-left" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">حداکثر پیام (ماهانه)</label>
                                <Input type="number" value={maxMessagesPerMonth} onChange={(e) => setMaxMessagesPerMonth(e.target.value)} disabled={isLoading} className="dir-ltr text-left" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">حجم هر پیوست (مگابایت)</label>
                                <Input type="number" value={maxAttachmentSizeMB} onChange={(e) => setMaxAttachmentSizeMB(e.target.value)} disabled={isLoading} className="dir-ltr text-left" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">حداکثر اپراتورها</label>
                                <Input type="number" value={maxOperators} onChange={(e) => setMaxOperators(e.target.value)} disabled={isLoading} className="dir-ltr text-left" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">پیام‌های برودکست (ماهانه)</label>
                                <Input type="number" value={maxBroadcastsPerMonth} onChange={(e) => setMaxBroadcastsPerMonth(e.target.value)} disabled={isLoading} className="dir-ltr text-left" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">نگهداری تاریخچه (روز)</label>
                                <Input type="number" value={dataRetentionDays} onChange={(e) => setDataRetentionDays(e.target.value)} disabled={isLoading} className="dir-ltr text-left" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">فلوهای خودکار</label>
                                <Input type="number" value={maxAutomatedFlows} onChange={(e) => setMaxAutomatedFlows(e.target.value)} disabled={isLoading} className="dir-ltr text-left" />
                            </div>
                        </div>

                        {/* 👈 گرید ۳ ستونه برای امکانات ویژه */}
                        <div className="mt-4 bg-gray-50 p-5 rounded-lg border border-gray-100 shadow-sm">
                            <h6 className="mb-4 text-sm font-bold text-indigo-700 border-b border-gray-200 pb-3">
                                امکانات ویژه (Enterprise Features)
                            </h6>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-6">
                                {[
                                    { key: 'hasCloudStorage', label: 'فضای ابری اختصاصی' },
                                    { key: 'removeBranding', label: 'حذف لوگوی AnyBot' },
                                    { key: 'hasApiAccess', label: 'دسترسی به API' },
                                    { key: 'hasPremiumSupport', label: 'پشتیبانی ویژه' },
                                    { key: 'hasPremiumAiModels', label: 'مدل‌های AI پیشرفته' },
                                    { key: 'allowInChatPayments', label: 'درگاه پرداخت درون‌چت' },
                                    { key: 'hasPremiumChannels', label: 'کانال‌های پرمیوم' },
                                    { key: 'hasHumanHandoff', label: 'انتقال به اپراتور انسانی' },
                                    { key: 'hasCustomDomain', label: 'اتصال دامنه اختصاصی' },
                                    { key: 'hasABTesting', label: 'تست A/B فلوها' },
                                    { key: 'hasMultiLanguage', label: 'پشتیبانی چندزبانه' }
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

                        {/* دکمه‌های تایید و انصراف (استیکی در پایین) */}
                        <div className="flex justify-end gap-2 mt-4 pt-4 border-t sticky bottom-0 bg-white z-10">
                            <Button variant="plain" onClick={onClose} disabled={isLoading}>انصراف</Button>
                            <Button variant="solid" className="bg-indigo-600 hover:bg-indigo-500" loading={isLoading} onClick={handleSubmit}>
                                ذخیره تغییرات
                            </Button>
                        </div>

                    </div>
                </div>
            )}
        </Dialog>
    )
}

export default PlanLimitsModal