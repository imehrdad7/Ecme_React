import { lazy, Suspense, useEffect } from 'react' // 👈 useEffect اضافه شد
import { useLocation } from 'react-router-dom' // 👈 useLocation اضافه شد
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import SettingsMenu from './components/SettingsMenu'
import SettingMobileMenu from './components/SettingMobileMenu'
import useResponsive from '@/utils/hooks/useResponsive'
import { useSettingsStore } from './store/settingsStore'

const Profile = lazy(() => import('./components/SettingsProfile'))
const SettingsCompany = lazy(() => import('./components/SettingsCompany'))
const Security = lazy(() => import('./components/SettingsSecurity'))
const Notification = lazy(() => import('./components/SettingsNotification'))
const Billing = lazy(() => import('./components/SettingsBilling'))
const Integration = lazy(() => import('./components/SettingIntegration'))

const Settings = () => {
    // 👈 تابع تغییر استیت (setCurrentView) را هم از استور استخراج می‌کنیم
    const { currentView, setCurrentView } = useSettingsStore() 

    const { smaller, larger } = useResponsive()
    const location = useLocation() // 👈 خواندن آدرس فعلی

    // 🌟 این افکت بررسی می‌کند که اگر ریدایرکت شده‌ایم، تب را عوض کند
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search)
        const tab = searchParams.get('tab')

        // اگر در URL نوشته بود tab=companySetting، استیت را تغییر بده
        if (tab === 'companySetting' && setCurrentView) {
            setCurrentView('companySetting')
        }
    }, [location.search, setCurrentView])

    return (
        <AdaptiveCard className="h-full">
            <div className="flex flex-auto h-full">
                {larger.lg && (
                    <div className="w-[200px] xl:w-[280px]">
                        <SettingsMenu />
                    </div>
                )}
                {/* کلاس‌های RTL به درستی رعایت شده‌اند */}
                <div className="ltr:xl:pl-6 rtl:xl:pr-6 flex-1 py-2"> 
                    {smaller.lg && (
                        <div className="mb-6">
                            <SettingMobileMenu />
                        </div>
                    )}
                    <Suspense fallback={<></>}>
                        {currentView === 'profile' && <Profile />}
                        {currentView === 'companySetting' && <SettingsCompany />}
                        {currentView === 'security' && <Security />}
                        {currentView === 'notification' && <Notification />}
                        {currentView === 'billing' && <Billing />}
                        {currentView === 'integration' && <Integration />}
                    </Suspense>
                </div>
            </div>
        </AdaptiveCard>
    )
}

export default Settings