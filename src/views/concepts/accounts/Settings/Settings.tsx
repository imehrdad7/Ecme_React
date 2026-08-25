import { lazy, Suspense, useEffect } from 'react' // 👈 useEffect اضافه شد
import { useLocation } from 'react-router-dom' // 👈 useLocation اضافه شد
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import SettingsMenu from './components/SettingsMenu'
import SettingMobileMenu from './components/SettingMobileMenu'
import useResponsive from '@/utils/hooks/useResponsive'
import { useSettingsStore } from './store/settingsStore'

const Profile = lazy(() => import('./components/SettingsProfile'))
const SettingsCompany = lazy(() => import('./components/Company/SettingsCompany'))
const SettingSubscription = lazy(() => import('./components/SettingSubscription'))
const TeamManagement = lazy(() => import('./components/Team/TeamManagement'))
const Security = lazy(() => import('./components/SettingsSecurity'))
const Notification = lazy(() => import('./components/SettingsNotification'))
const Billing = lazy(() => import('./components/SettingsBilling'))

const Settings = () => {
    const { currentView, setCurrentView } = useSettingsStore() 

    const { smaller, larger } = useResponsive()
    const location = useLocation() // 👈 خواندن آدرس فعلی

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search)
        const tab = searchParams.get('tab')

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
                        {currentView === 'SettingSubscription' && <SettingSubscription />}
                        {currentView === 'TeamManagement' && <TeamManagement />}
                        {currentView === 'security' && <Security />}
                        {currentView === 'notification' && <Notification />}
                        {currentView === 'billing' && <Billing />}
                    </Suspense>
                </div>
            </div>
        </AdaptiveCard>
    )
}

export default Settings