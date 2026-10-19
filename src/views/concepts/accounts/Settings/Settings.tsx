import { lazy, Suspense, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth'
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
const ApiTokenManager = lazy(() => import('./components/Company/ApiTokenManager'))

const Settings = () => {
    const { currentView, setCurrentView } = useSettingsStore()
    const { smaller, larger } = useResponsive()
    
    const location = useLocation()
    const navigate = useNavigate()
    const { user } = useAuth()

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search)
        const tab = searchParams.get('tab')
        
        const adminOnlyTabs = ['teamManagement', 'TeamManagement', 'team', 'companySetting', 'ApiTokenManager', 'apikeys', 'api']
        
        const userRoles = user?.authority || (user?.role ? [user.role] : [])
        const isAdmin = userRoles.includes('Admin') || userRoles.includes('SuperAdmin')
        if (tab && adminOnlyTabs.includes(tab) && !isAdmin) {
            navigate('/concepts/account/settings?tab=profile', { replace: true })
            return
        }

        if (tab && setCurrentView) {
            if (tab === 'teamManagement' || tab === 'TeamManagement') {
                setCurrentView('TeamManagement' as any)
            }
            else if (tab === 'companySetting') {
                setCurrentView('companySetting' as any)
            }
            else if (tab === 'subscription' || tab === 'SettingSubscription') {
                setCurrentView('SettingSubscription' as any)
            }
            else if (tab === 'ApiTokenManager' || tab === 'apikeys' || tab === 'api') {
                setCurrentView('ApiTokenManager' as any)
            }
            else {
                setCurrentView(tab as any)
            }
        }
    }, [location.search, setCurrentView, navigate, user])

    return (
        <AdaptiveCard className="h-full">
            <div className="flex flex-auto h-full">
                {larger.lg && (
                    <div className="w-[200px] xl:w-[280px]">
                        <SettingsMenu />
                    </div>
                )}
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
                        {currentView === 'ApiTokenManager' && <ApiTokenManager />}
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