import { useState, useEffect } from 'react'
import { apiSearchPlans, PlanListItemDto } from '@/services/PlanService'
import Button from '@/components/ui/Button'
import { useNavigate } from 'react-router-dom'

const PricingCompare = () => {
    const [plans, setPlans] = useState<PlanListItemDto[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const data = await apiSearchPlans({ pageNumber: 1, pageSize: 10, onlyActive: true, onlyPublic: true })
                if (data) {
                    setPlans(data.items.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)))
                }
            } finally {
                setIsLoading(false)
            }
        }
        fetchPlans()
    }, [])

    if (isLoading) return <div className="text-center py-20 text-gray-500">در حال دریافت اطلاعات...</div>
    
    if (plans.length === 0) return <></>

    // کامپوننت‌های کمکی برای رندر تیک و ضربدر
    const Check = () => <span className="text-green-500 font-bold text-xl">✓</span>
    const Cross = () => <span className="text-gray-300 font-bold text-xl">✕</span>

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="mb-8">
                <Button variant="plain" onClick={() => navigate(-1)} className="text-indigo-600 mb-4">
                    ← بازگشت به پلن‌ها
                </Button>
                <h1 className="text-3xl font-extrabold text-gray-900">مقایسه جامع امکانات</h1>
                <p className="mt-2 text-gray-600">جزئیات دقیق و محدودیت‌های هر پلن را در جدول زیر بررسی کنید.</p>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
                <table className="w-full text-right text-sm text-gray-700 whitespace-nowrap">
                    {/* هدر جدول (نام و قیمت پلن‌ها) */}
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-900">
                        <tr>
                            <th className="p-6 font-bold text-lg w-1/4">امکانات و ویژگی‌ها</th>
                            {plans.map(plan => (
                                <th key={plan.id} className="p-6 w-1/4 text-center border-r border-gray-200">
                                    <div className="text-lg font-bold mb-1">{plan.name}</div>
                                    <div className="text-gray-500 font-normal">
                                        {plan.price === 0 ? 'رایگان' : `${plan.price.toLocaleString()} تومان`}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100 bg-white">
                        {/* دسته‌بندی: محدودیت‌های سیستمی */}
                        <tr className="bg-gray-50/50"><td colSpan={plans.length + 1} className="p-3 font-semibold text-gray-900">محدودیت‌های حساب</td></tr>
                        <tr>
                            <td className="p-4 font-medium border-l border-gray-100">تعداد ربات‌های فعال</td>
                            {plans.map(p => <td key={p.id} className="p-4 text-center">{p.maxBots > 0 ? p.maxBots : <Cross/>}</td>)}
                        </tr>
                        <tr>
                            <td className="p-4 font-medium border-l border-gray-100">تعداد اپراتور متصل</td>
                            {plans.map(p => <td key={p.id} className="p-4 text-center">{p.maxOperators > 0 ? p.maxOperators : <Cross/>}</td>)}
                        </tr>
                        <tr>
                            <td className="p-4 font-medium border-l border-gray-100">تعداد فلوهای خودکار</td>
                            {plans.map(p => <td key={p.id} className="p-4 text-center">{p.maxAutomatedFlows > 0 ? p.maxAutomatedFlows : <Cross/>}</td>)}
                        </tr>
                        <tr>
                            <td className="p-4 font-medium border-l border-gray-100">ارسال برودکست (ماهانه)</td>
                            {plans.map(p => <td key={p.id} className="p-4 text-center">{p.maxBroadcastsPerMonth > 0 ? p.maxBroadcastsPerMonth.toLocaleString() : <Cross/>}</td>)}
                        </tr>
                        <tr>
                            <td className="p-4 font-medium border-l border-gray-100">توکن هوش مصنوعی (ماهانه)</td>
                            {plans.map(p => <td key={p.id} className="p-4 text-center">{p.allocatedAiTokens > 0 ? p.allocatedAiTokens.toLocaleString() : <Cross/>}</td>)}
                        </tr>

                        {/* دسته‌بندی: دسترسی‌ها و قابلیت‌ها */}
                        <tr className="bg-gray-50/50"><td colSpan={plans.length + 1} className="p-3 font-semibold text-gray-900 mt-4">قابلیت‌های پیشرفته</td></tr>
                        <tr>
                            <td className="p-4 font-medium border-l border-gray-100">فضای ابری اختصاصی</td>
                            {plans.map(p => <td key={p.id} className="p-4 text-center">{p.hasCloudStorage ? <Check/> : <Cross/>}</td>)}
                        </tr>
                        <tr>
                            <td className="p-4 font-medium border-l border-gray-100">دسترسی به API</td>
                            {plans.map(p => <td key={p.id} className="p-4 text-center">{p.hasApiAccess ? <Check/> : <Cross/>}</td>)}
                        </tr>
                        <tr>
                            <td className="p-4 font-medium border-l border-gray-100">حذف لوگوی سازنده (AnyBot)</td>
                            {plans.map(p => <td key={p.id} className="p-4 text-center">{p.removeBranding ? <Check/> : <Cross/>}</td>)}
                        </tr>
                        <tr>
                            <td className="p-4 font-medium border-l border-gray-100">مدل‌های پریمیوم AI</td>
                            {plans.map(p => <td key={p.id} className="p-4 text-center">{p.hasPremiumAiModels ? <Check/> : <Cross/>}</td>)}
                        </tr>
                        <tr>
                            <td className="p-4 font-medium border-l border-gray-100">درگاه پرداخت درون‌چت</td>
                            {plans.map(p => <td key={p.id} className="p-4 text-center">{p.allowInChatPayments ? <Check/> : <Cross/>}</td>)}
                        </tr>
                        <tr>
                            <td className="p-4 font-medium border-l border-gray-100">اتصال دامنه اختصاصی</td>
                            {plans.map(p => <td key={p.id} className="p-4 text-center">{p.hasCustomDomain ? <Check/> : <Cross/>}</td>)}
                        </tr>
                        <tr>
                            <td className="p-4 font-medium border-l border-gray-100">پشتیبانی ویژه</td>
                            {plans.map(p => <td key={p.id} className="p-4 text-center">{p.hasPremiumSupport ? <Check/> : <Cross/>}</td>)}
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default PricingCompare