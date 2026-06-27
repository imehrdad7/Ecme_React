import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/auth' 

const AuthorityGuard = ({ children }: { children: React.ReactNode }) => {
    const { authenticated, user } = useAuth()
    const location = useLocation()

    if (!authenticated) {
        return <Navigate to="/sign-in" replace />
    }

    // بررسی ایمن‌تر: اول چک می‌کنیم user وجود دارد، بعد آیدی را بررسی می‌کنیم
    const hasCompany = Boolean(
        user?.companyId && 
        user.companyId !== '00000000-0000-0000-0000-000000000000'
    ); 
    
    // اینجا از includes استفاده کردیم تا اگر کاربر در هر زیرمجموعه‌ای از تنظیمات بود، گیر نکند
    const isAlreadyOnSettingsPage = location.pathname.includes('/concepts/account/settings');

    if (!hasCompany && !isAlreadyOnSettingsPage) {
        // 👈 تغییر مهم: اضافه کردن /company به انتهای مسیر
        return <Navigate to="/concepts/account/settings?tab=companySetting" replace />
    }

    return <>{children}</>
}

export default AuthorityGuard