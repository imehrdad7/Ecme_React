import { useState, useEffect } from 'react'
import Button from '@/components/ui/Button'
import Tag from '@/components/ui/Tag'
import Avatar from '@/components/ui/Avatar'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import BillingHistory from './BillingHistory'
import { useNavigate } from 'react-router-dom'
// 🚀 آیکون تقویم برای نمایش پلن رزرو شده اضافه شد
import { PiLightningFill, PiRobotFill, PiChatCircleTextFill, PiCalendarCheckFill } from 'react-icons/pi'
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

    // 🚀 پیدا کردن پلنی که رزرو شده است (وضعیت 2 یعنی Reserved)
    const reservedPlan = dashboardData.history?.find((p: any) => p.status === 2);

    return (
        <div>
            <h4 className="mb-6">صورتحساب و اشتراک شما</h4>
            
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm rounded-xl p-6">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                    <div className="flex items-start gap-4 w-full">
                        <Avatar className="bg-emerald-500 mt-1" shape="circle" size="lg" icon={<PiLightningFill />} />
                        
                        {dashboardData.currentPlan ? (
                            <div className="w-full">
                                <div className="flex items-center gap-3 mb-2">
                                    <h5 className="font-bold text-lg">
                                        {dashboardData.currentPlan.planName}
                                    </h5>
                                    <Tag className="bg-success-subtle text-success rounded-md border-0 font-bold">
                                        فعال
                                    </Tag>
                                </div>
                                
                                <p className="text-gray-500 dark:text-gray-400 text-sm font-semibold mb-6">
                                    {daysRemaining > 0 ? (
                                        <span>این اشتراک <strong className="text-emerald-600">{daysRemaining} روز دیگر</strong> در تاریخ {moment(dashboardData.currentPlan.endDate).locale('fa').format('YYYY/MM/DD')} به پایان می‌رسد.</span>
                                    ) : (
                                        <span className="text-red-500">این اشتراک امروز به پایان می‌رسد. لطفاً تمدید کنید.</span>
                                    )}
                                </p>

                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full lg:w-3/4">
                                    <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-xs text-gray-500 flex items-center gap-1 font-semibold">
                                                <PiChatCircleTextFill className="text-blue-500 text-base" /> پیام‌های ماهانه
                                            </span>
                                            <span className="text-xs font-bold text-gray-700 dark:text-gray-200">
                                                {dashboardData.currentPlan.currentMonthMessageCount} / {dashboardData.currentPlan.maxMessagesPerMonth === 0 ? 'نامحدود' : dashboardData.currentPlan.maxMessagesPerMonth}
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5 mt-2 overflow-hidden">
                                            <div 
                                                className="bg-blue-500 h-1.5 rounded-full" 
                                                style={{ width: `${Math.min((dashboardData.currentPlan.currentMonthMessageCount / (dashboardData.currentPlan.maxMessagesPerMonth || 1)) * 100, 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-xs text-gray-500 flex items-center gap-1 font-semibold">
                                                <PiRobotFill className="text-purple-500 text-base" /> ظرفیت ربات‌ها
                                            </span>
                                            <span className="text-xs font-bold text-gray-700 dark:text-gray-200">
                                                {dashboardData.currentPlan.currentBotsCount || 0} / {dashboardData.currentPlan.maxBots === 0 ? 'نامحدود' : (dashboardData.currentPlan.maxBots || '-')}
                                            </span>
                                        </div>
                                         <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5 mt-2 overflow-hidden">
                                            <div 
                                                className="bg-purple-500 h-1.5 rounded-full" 
                                                style={{ width: `${Math.min(((dashboardData.currentPlan.currentBotsCount || 0) / (dashboardData.currentPlan.maxBots || 1)) * 100, 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>

                                {/* 🚀 باکس هشدار برای نمایش پلن رزرو شده (فقط در صورتی که وجود داشته باشد رندر می‌شود) */}
                                {reservedPlan && (
                                    <div className="mt-8 p-5 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg flex items-center gap-4 w-full">
                                        <div className="p-2.5 bg-indigo-100 dark:bg-indigo-800/60 rounded-md shrink-0">
                                            <PiCalendarCheckFill className="text-indigo-600 dark:text-indigo-400 text-2xl" />
                                        </div>
                                        <div className="text-sm">
                                            <span className="font-bold text-indigo-900 dark:text-indigo-100 block mb-1">
                                                طرح رزرو شده برای دوره آینده
                                            </span>
                                            <span className="text-indigo-800 dark:text-indigo-300 leading-relaxed">
                                                اشتراک <strong>{reservedPlan.planName}</strong> با موفقیت در سیستم ثبت شده است. این طرح به منظور جلوگیری از وقفه در سرویس‌دهی، پس از پایان اعتبار اشتراک فعلی در تاریخ <strong>{moment(reservedPlan.startDate).locale('fa').format('YYYY/MM/DD')}</strong> به صورت خودکار فعال خواهد شد.
                                            </span>
                                        </div>
                                    </div>
                                )}

                            </div>
                        ) : (
                            <div>
                                <h6 className="font-bold text-gray-500">بدون اشتراک فعال</h6>
                                <div className="font-semibold text-sm mt-1 text-gray-500">
                                    شما در حال حاضر هیچ پلن فعالی ندارید. برای استفاده از امکانات ربات، یک طرح تهیه کنید.
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <div className="flex mt-4 lg:mt-0 shrink-0">
                        <Button size="sm" variant="solid" onClick={handleChangePlan}>
                            {dashboardData.currentPlan ? 'ارتقاء یا تمدید طرح' : 'خرید طرح جدید'}
                        </Button>
                    </div>
                </div>
            </div>
            
           <div className="mt-10">
                {/* کانتینر فلکس برای قرار دادن عنوان و دکمه روبه‌روی هم */}
                <div className="flex items-center justify-between mb-4">
                    <h5 className="mb-0">تاریخچه اشتراک‌ها</h5>
                    
                    <Button 
                        size="sm" 
                        variant="plain" 
                        className="flex items-center gap-2 text-indigo-600 hover:bg-indigo-50 transition-colors"
                        onClick={() => navigate('/concepts/InvoiceList')} // 👈 مسیر صفحه پرداخت‌ها را اینجا قرار دهید
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