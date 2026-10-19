import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/auth' 

type AuthorityGuardProps = {
    children: React.ReactNode
    authority?: string[] 
}

const AuthorityGuard = ({ children, authority = [] }: AuthorityGuardProps) => {
    const { authenticated, user } = useAuth()
    const location = useLocation()
    if (!authenticated) {
        return <Navigate to="/sign-in" replace />
    }

    const userRoles = user?.authority || (user?.role ? [user.role] : [])

    if (authority.length > 0) {
        const hasPermission = authority.some(allowedRole => userRoles.includes(allowedRole))

        if (!hasPermission) {
            return <Navigate to="/concepts/inbox" replace />
        }
    }
  
    const hasCompany = Boolean(
        user?.companyId && 
        user.companyId !== '00000000-0000-0000-0000-000000000000'
    )
    
    const isSettingsPage = location.pathname.includes('/concepts/account/settings')
    const currentTab = new URLSearchParams(location.search).get('tab')
    
    const isAdmin = userRoles.includes('Admin') || userRoles.includes('SuperAdmin')

    if (!hasCompany) {
        if (isAdmin) {
            const isAllowedTab = isSettingsPage && (currentTab === 'companySetting' || currentTab === 'profile')
            if (!isAllowedTab) {
                return <Navigate to="/concepts/account/settings?tab=companySetting" replace />
            }
        } else {
            const isAllowedTab = isSettingsPage && currentTab === 'profile'
            if (!isAllowedTab) {
                return <Navigate to="/concepts/account/settings?tab=profile" replace />
            }
        }
    }

    return <>{children}</>
}

export default AuthorityGuard