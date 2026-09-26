import { useState, useEffect } from 'react'
import Button from '@/components/ui/Button'
import Tag from '@/components/ui/Tag'
import Avatar from '@/components/ui/Avatar'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import BillingHistory from './BillingHistory'
import { useNavigate } from 'react-router-dom'
import {
    PiLightningFill, PiCalendarCheckFill, PiCheckCircleFill, PiXCircleFill
} from 'react-icons/pi'
import moment from 'jalali-moment'
import { useSessionUser } from '@/store/authStore'
import { apiGetSubscriptionDashboard } from '@/services/AccontsService'

const SettingSubscription = () => {
    const navigate = useNavigate()
    const { user } = useSessionUser()

    const companyId = user.companyId;

    const [isLoading, setIsLoading] = useState(true)
    const [dashboardData, setDashboardData] = useState<any>({
        currentPlan: null,
        history: [],
    })

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!companyId) return;

            try {
                setIsLoading(true)
                const data = await apiGetSubscriptionDashboard<any>(companyId)

                if (data) {
                    setDashboardData({
                        currentPlan: data.currentPlan || null,
                        history: data.history || [],
                    })
                }
            } catch (error) {
                toast.push(
                    <Notification title="خطا" type="danger">
                        خطا در بارگذاری اطلاعات صورتحساب
                    </Notification>,
                    { placement: 'top-center' }
                )
            } finally {
                setIsLoading(false)
            }
        }

        fetchDashboardData()
    }, [companyId])

    const handleChangePlan = () => {
        navigate('/concepts/Pricing')
    }

    if (isLoading) {
        return <div className="text-center py-8 font-semibold text-gray-500">در حال بارگذاری اطلاعات صورتحساب...</div>
    }

    let daysRemaining = 0;
    if (dashboardData.currentPlan?.endDate) {
        const end = moment(dashboardData.currentPlan.endDate);
        const today = moment();
        daysRemaining = end.diff(today, 'days');
    }

    const reservedPlan = dashboardData.history?.find((p: any) => p.status === 2);
    const plan = dashboardData.currentPlan;

    const planLimits = plan ? [
        { id: 'messages', label: 'پیام‌ها', current: plan.currentMonthMessageCount, max: plan.maxMessagesPerMonth },
        { id: 'bots', label: 'ربات‌ها', current: plan.currentBotsCount, max: plan.maxBots },
        { id: 'operators', label: 'اپراتورها', current: plan.currentOperatorsCount, max: plan.maxOperators },
        { id: 'contacts', label: 'مخاطبین', current: plan.currentContactsCount, max: plan.maxContacts },
        { id: 'broadcasts', label: 'ارسال انبوه', current: plan.currentBroadcastsCount, max: plan.maxBroadcastsPerMonth },
        { id: 'aiTokens', label: 'توکن هوش‌مصنوعی', current: plan.currentAiTokens, max: plan.allocatedAiTokens },
    ].filter(item => item.max !== undefined) : [];

    const planFeatures = plan ? [
        { id: 'api', label: 'دسترسی به API', active: plan.hasApiAccess },
        { id: 'whitelabel', label: 'حذف نام برند', active: plan.removeBranding },
        { id: 'domain', label: 'دامنه اختصاصی', active: plan.hasCustomDomain },
        { id: 'premiumSupport', label: 'پشتیبانی ویژه', active: plan.hasPremiumSupport },
    ].filter(item => item.active !== undefined) : [];

    return (
        <div className="pb-8">
            <h4 className="mb-4 sm:mb-6 text-lg md:text-xl">صورتحساب و اشتراک شما</h4>

            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm rounded-xl p-4 md:p-6">
                
                {plan ? (
                    <div className="flex flex-col gap-6">
                        
                        {/* 🚀 هدر: طراحی کاملاً شناور با flex-wrap */}
                        <div className="flex flex-wrap justify-between items-center gap-4">
                            <div className="flex items-center gap-3 min-w-[240px] flex-1">
                                <Avatar className="bg-emerald-500 shrink-0" shape="circle" size="md" icon={<PiLightningFill />} />
                                <div className="flex flex-wrap items-center gap-2">
                                    <h5 className="font-bold text-base md:text-lg mb-0">{plan.planName}</h5>
                                    <Tag className="bg-success-subtle text-success rounded-md border-0 font-bold px-2 py-0.5 text-xs shrink-0">
                                        فعال
                                    </Tag>
                                </div>
                            </div>

                            {/* این دکمه در موبایل اتوماتیک به خط پایین می‌رود و کل عرض را می‌گیرد */}
                            <Button className="w-full sm:w-auto shrink-0" size="sm" variant="solid" onClick={handleChangePlan}>
                                ارتقاء یا تمدید طرح
                            </Button>
                        </div>

                        {/* 🚀 متن انقضا */}
                        <div className="text-gray-500 dark:text-gray-400 text-sm font-semibold">
                            {daysRemaining > 0 ? (
                                <span>این اشتراک <strong className="text-emerald-600">{daysRemaining} روز دیگر</strong> در تاریخ {moment(plan.endDate).locale('fa').format('YYYY/MM/DD')} به پایان می‌رسد.</span>
                            ) : (
                                <span className="text-red-500">این اشتراک امروز به پایان می‌رسد. لطفاً تمدید کنید.</span>
                            )}
                        </div>

                        <div className="w-full">
                            {/* 🚀 گرید محدودیت‌ها */}
                            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
                                {planLimits.map((limit) => {
                                    const isUnlimited = limit.max === 0;
                                    const maxDisplay = isUnlimited ? 'نامحدود' : limit.max;
                                    const currentDisplay = limit.current || 0;

                                    return (
                                        <div 
                                            key={limit.id} 
                                            className="bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-xl p-3 flex flex-col items-center justify-center text-center transition-colors hover:border-indigo-200 dark:hover:border-indigo-600"
                                        >
                                            <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold mb-2 whitespace-nowrap">
                                                {limit.label}
                                            </span>
                                            <div className="flex items-baseline gap-1.5" dir="ltr">
                                                <span className="text-base font-black text-gray-900 dark:text-white">
                                                    {currentDisplay}
                                                </span>
                                                <span className="text-gray-400 font-medium text-xs">/</span>
                                                <span className={`text-xs font-bold ${isUnlimited ? 'text-emerald-500' : 'text-indigo-600 dark:text-indigo-400'}`}>
                                                    {maxDisplay}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* 🚀 گرید امکانات و دسترسی‌ها */}
                            {planFeatures.length > 0 && (
                                <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-700/50">
                                    <h6 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-4">امکانات این طرح:</h6>
                                    
                                    <div className="grid grid-cols-1 min-[500px]:grid-cols-2 lg:grid-cols-4 gap-3">
                                        {planFeatures.map(feature => (
                                            <div 
                                                key={feature.id} 
                                                className={`flex items-start gap-2.5 p-3 rounded-xl border transition-all ${
                                                    feature.active 
                                                    ? 'bg-emerald-50/50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800/50' 
                                                    : 'bg-rose-50/50 border-rose-200 dark:bg-rose-900/20 dark:border-rose-800/50'
                                                }`}
                                            >
                                                <div className="mt-0.5 shrink-0">
                                                    {feature.active ? (
                                                        <PiCheckCircleFill className="text-lg text-emerald-500" />
                                                    ) : (
                                                        <PiXCircleFill className="text-lg text-rose-500" />
                                                    )}
                                                </div>
                                                <span className={`text-sm font-bold leading-tight mt-0.5 ${
                                                    feature.active 
                                                    ? 'text-emerald-900 dark:text-emerald-200' 
                                                    : 'text-rose-900 dark:text-rose-200'
                                                }`}>
                                                    {feature.label}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 🚀 باکس هشدار پلن رزرو شده */}
                        {reservedPlan && (
                            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50 rounded-xl flex items-start sm:items-center gap-3 w-full">
                                <div className="p-2 bg-indigo-100 dark:bg-indigo-800/60 rounded-md shrink-0">
                                    <PiCalendarCheckFill className="text-indigo-600 dark:text-indigo-400 text-xl" />
                                </div>
                                <div className="text-sm flex-1">
                                    <span className="font-bold text-indigo-900 dark:text-indigo-100 block mb-1">
                                        طرح رزرو شده
                                    </span>
                                    <span className="text-indigo-800 dark:text-indigo-300 leading-relaxed">
                                        اشتراک <strong>{reservedPlan.planName}</strong> رزرو شده و در <strong>{moment(reservedPlan.startDate).locale('fa').format('YYYY/MM/DD')}</strong> فعال می‌شود.
                                    </span>
                                </div>
                            </div>
                        )}

                    </div>
                ) : (
                    <div className="flex flex-wrap items-center justify-between gap-4 text-center sm:text-right">
                        <div>
                            <h6 className="font-bold text-gray-500 mb-1">بدون اشتراک فعال</h6>
                            <div className="font-semibold text-sm text-gray-400">
                                شما در حال حاضر هیچ پلن فعالی ندارید.
                            </div>
                        </div>
                        <Button className="w-full sm:w-auto" size="sm" variant="solid" onClick={handleChangePlan}>
                            خرید طرح جدید
                        </Button>
                    </div>
                )}
            </div>

            <div className="mt-8 sm:mt-10">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <h5 className="mb-0 text-base md:text-lg">تاریخچه اشتراک‌ها</h5>

                    <Button
                        size="sm"
                        variant="plain"
                        className="w-full sm:w-auto flex items-center justify-center gap-2 text-indigo-600 hover:bg-indigo-50 transition-colors"
                        onClick={() => navigate('/concepts/InvoiceList')}
                    >
                        تاریخچه پرداخت‌ها
                    </Button>
                </div>

                <BillingHistory
                    className="mt-4"
                    data={dashboardData.history}
                />
            </div>
        </div>
    )
}

export default SettingSubscription