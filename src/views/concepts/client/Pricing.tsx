import { useState, useEffect } from 'react'
import Button from '@/components/ui/Button'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { apiSearchPlans, PlanListItemDto } from '@/services/PlanService'
import { apiPurchasePlan } from '@/services/BillingService'
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';
import { TbTable } from 'react-icons/tb'; // 👈 اضافه شدن آیکون برای بنر مقایسه

const Pricing = () => {
    const [plans, setPlans] = useState<PlanListItemDto[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [purchasingPlanId, setPurchasingPlanId] = useState<string | null>(null)
    const [billingCycle, setBillingCycle] = useState<1 | 3 | 12>(1)
    
    const navigate = useNavigate();

    useEffect(() => {
        loadPublicPlans()
    }, [])

    const loadPublicPlans = async () => {
        setIsLoading(true)
        try {
            const data = await apiSearchPlans({ 
                pageNumber: 1, 
                pageSize: 20,
                onlyActive: true, 
                onlyPublic: true 
            })
            if (data) {
                // مرتب‌سازی بر اساس DisplayOrder (اعداد کوچکتر اول نمایش داده می‌شوند)
                const sortedPlans = data.items.sort((a, b) => {
                    // اگر null بود، عدد بزرگی در نظر می‌گیریم تا برود انتهای لیست
                    const orderA = a.displayOrder != null ? a.displayOrder : 999;
                    const orderB = b.displayOrder != null ? b.displayOrder : 999;
                    return orderB - orderA;
                });
                setPlans(sortedPlans)
            }
        } catch (error) {
            toast.push(<Notification title="خطا" type="danger">خطا در دریافت پلن‌ها</Notification>, { placement: 'top-center' })
        } finally {
            setIsLoading(false)
        }
    }

    const handlePurchase = async (planId: string) => {
        setPurchasingPlanId(planId)
        try {
            const currentOrigin = window.location.origin
            const callbackUrl = `${currentOrigin}/billing/verify`
            const response = await apiPurchasePlan({
                planId: planId,
                callbackUrl: callbackUrl,
                idempotencyKey: uuidv4(),
                durationInMonths: billingCycle
            })
            if (response && response.paymentUrl) window.location.href = response.paymentUrl
        } catch (error) {
            toast.push(<Notification title="خطا" type="danger">خطا در درگاه پرداخت.</Notification>, { placement: 'top-center' })
            setPurchasingPlanId(null)
        }
    }

    const getPlanFeatures = (plan: PlanListItemDto) => {
        return [
            { text: `تا ${plan.maxBots} ربات فعال`, included: plan.maxBots > 0 },
            { text: `تا ${plan.maxOperators} اپراتور پشتیبان`, included: plan.maxOperators > 0 },
            { text: `سقف ${plan.maxAutomatedFlows} فلو خودکار`, included: plan.maxAutomatedFlows > 0 },
            { text: `${plan.maxBroadcastsPerMonth} پیام برودکست در ماه`, included: plan.maxBroadcastsPerMonth > 0 },
            { text: `${plan.allocatedAiTokens?.toLocaleString()} توکن هوش مصنوعی`, included: (plan.allocatedAiTokens || 0) > 0 },
            { text: 'فضای ابری اختصاصی', included: plan.hasCloudStorage },
            { text: 'حذف لوگوی AnyBot', included: plan.removeBranding },
            { text: 'دسترسی به API', included: plan.hasApiAccess },
            { text: 'پشتیبانی ویژه (VIP)', included: plan.hasPremiumSupport },
        ]
    }

    if (isLoading) {
        return <div className="flex justify-center items-center h-96"><span className="text-gray-400 font-medium">در حال دریافت پلن‌ها...</span></div>
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center mb-10">
                <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">پلن‌های اشتراک AnyBot</h1>
                <p className="mt-4 text-xl text-gray-600">پکیج مناسب کسب‌وکار خود را انتخاب کنید.</p>
            </div>

            {/* 👈 بخش هدایت به جدول مقایسه کامل (طراحی جدید و بنری) */}
            <div className="flex justify-center mb-10 px-4">
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-5 max-w-4xl w-full shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4 w-full">
                        <div className="bg-indigo-100 p-3 rounded-xl text-indigo-600 shrink-0">
                            <TbTable className="text-2xl" />
                        </div>
                        <div className="text-right flex-grow">
                            <h4 className="text-indigo-900 font-bold text-sm sm:text-base">نیاز به بررسی دقیق‌تری دارید؟</h4>
                            <p className="text-indigo-700/80 text-xs sm:text-sm mt-1 font-medium">جدول جامع مقایسه امکانات و محدودیت‌های تمام پلن‌ها را مشاهده کنید.</p>
                        </div>
                    </div>
                    <Button 
                        variant="solid" 
                        onClick={() => navigate('/concepts/PricingCompare')} 
                        className="bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold px-6 py-2.5 rounded-xl w-full sm:w-auto shrink-0 shadow-sm shadow-indigo-200"
                    >
                        مشاهده جدول مقایسه
                    </Button>
                </div>
            </div>

            {/* تب‌های انتخاب دوره صورتحساب */}
            <div className="mb-12 flex justify-center">
                <div className="relative flex p-1.5 bg-gray-100/80 rounded-2xl shadow-inner border border-gray-200">
                    {[
                        { value: 1, label: 'ماهانه' },
                        { value: 3, label: 'سه‌ماهه (۵٪ تخفیف)' },
                        { value: 12, label: 'سالانه (۱۵٪ تخفیف)' }
                    ].map((cycle) => (
                        <button
                            key={cycle.value}
                            onClick={() => setBillingCycle(cycle.value as 1 | 3 | 12)}
                            className={`px-6 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 ${
                                billingCycle === cycle.value ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-gray-200/50 scale-[1.02]' : 'text-gray-500 hover:text-gray-800'
                            }`}
                        >
                            {cycle.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* کارت‌های قیمت‌گذاری */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
                {plans.map((plan) => {
                    const topFeatures = getPlanFeatures(plan).filter(f => f.included).slice(0, 5);

                    return (
                        <div key={plan.id} 
                        className={`relative w-full max-w-[380px] min-w-[280px] sm:min-w-[320px] mx-auto flex flex-col p-8 bg-white rounded-3xl shadow-sm border transition-all duration-300 hover:shadow-xl ${plan.isRecommended ? 'ring-2 ring-indigo-600 border-indigo-600 lg:scale-105 z-10' : 'border-gray-200'}`}>
                            
                            {plan.isRecommended && (
                                <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2">
                                    <span className="bg-indigo-600 text-white px-4 py-1.5 rounded-full text-[11px] font-extrabold tracking-widest shadow-md">پيشنهاد ويژه</span>
                                </div>
                            )}

                            {/* 👈 کانتینر با ارتفاع ثابت برای جلوگیری از پرش ارتفاع باکس */}
                            <div className="mb-6 border-b border-gray-100 pb-6 flex-grow-0 min-h-[120px] flex flex-col justify-center">
                                <h3 className="text-xl font-extrabold text-gray-900 mb-3">{plan.name}</h3>
                                <div className="flex items-baseline text-gray-900 gap-1.5 flex-wrap">
                                    <span className="text-4xl font-black tracking-tight">
                                        {plan.price === 0 ? 'رایگان' : (plan.price * billingCycle).toLocaleString()}
                                    </span>
                                    {plan.price > 0 && <span className="text-sm font-bold text-gray-400">تومان / {billingCycle === 1 ? 'ماهانه' : billingCycle === 3 ? 'سه‌ماهه' : 'سالانه'}</span>}
                                </div>
                            </div>

                            <ul className="flex-1 space-y-4 mb-8">
                                {topFeatures.map((feature, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <span className="text-indigo-500 font-bold mt-0.5">✓</span>
                                        <span className="text-sm leading-relaxed text-gray-700 font-semibold">{feature.text}</span>
                                    </li>
                                ))}
                            </ul>

                            <Button
                                variant={plan.price === 0 ? "dashed" : "solid"}
                                className={`w-full py-4 text-base font-bold rounded-xl transition-all ${plan.isRecommended ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200' : plan.price > 0 ? 'bg-gray-900 hover:bg-gray-800 text-white' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                                loading={purchasingPlanId === plan.id}
                                disabled={purchasingPlanId !== null && purchasingPlanId !== plan.id}
                                onClick={() => handlePurchase(plan.id)}
                            >
                                {plan.price === 0 ? 'پلن فعلی شما' : 'انتخاب و ادامه'}
                            </Button>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default Pricing