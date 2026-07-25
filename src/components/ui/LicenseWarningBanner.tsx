import { useSessionUser } from '@/store/authStore'
import { Link } from 'react-router-dom'

const LicenseWarningBanner = () => {
    // گرفتن اطلاعات کاربر از استور (فرض بر این است که بک‌اند فیلدی مثل subscriptionEndDate را برمی‌گرداند)
    const user = useSessionUser((state) => state.user)

    if (!user || !user.subscriptionEndDate) return null

    // محاسبه تعداد روزهای باقیمانده
    const endDate = new Date(user.subscriptionEndDate)
    const today = new Date()
    const diffTime = endDate.getTime() - today.getTime()
    const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    // اگر بیشتر از 7 روز مانده، یا اگر لایسنس تمام شده (روز 0 یا منفی)، این نوار را نشان نده
    // (چون اگر تمام شده باشد، آن مودال قرمز رنگی که قبلاً ساختیم وسط صفحه ظاهر می‌شود)
    if (daysLeft > 7 || daysLeft <= 0) return null

    return (
        <div className="relative z-40 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    
                    {/* بخش متن پیام */}
                    <div className="flex items-center gap-3">
                        <span className="flex p-2 bg-white/20 rounded-lg">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </span>
                        <p className="font-medium text-sm sm:text-base">
                            <strong className="font-bold">توجه:</strong> فقط <span className="inline-flex items-center justify-center bg-white text-orange-600 font-bold px-2 py-0.5 rounded-md mx-1">{daysLeft} روز</span> تا پایان لایسنس AnyBot شما باقی مانده است.
                        </p>
                    </div>

                    {/* دکمه تمدید */}
                    <div className="flex-shrink-0 w-full sm:w-auto">
                        <Link
                            to="/pricing"
                            className="flex items-center justify-center w-full px-4 py-2 text-sm font-bold text-orange-600 bg-white border border-transparent rounded-xl shadow-sm hover:bg-orange-50 transition-colors active:scale-95"
                        >
                            تمدید زودهنگام
                        </Link>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default LicenseWarningBanner