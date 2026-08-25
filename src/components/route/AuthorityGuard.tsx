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

    if (authority.length > 0) {
        const userRoles = user?.authority || (user?.role ? [user.role] : []);
        const hasPermission = authority.some(allowedRole => userRoles.includes(allowedRole));

        if (!hasPermission) {
            return <Navigate to="/concepts/inbox" replace />
        }
    }

  
    const hasCompany = Boolean(
        user?.companyId && 
        user.companyId !== '00000000-0000-0000-0000-000000000000'
    ); 
    
    const isAlreadyOnSettingsPage = location.pathname.includes('/concepts/account/settings');

    if (!hasCompany && !isAlreadyOnSettingsPage) {
        return <Navigate to="/concepts/account/settings?tab=companySetting" replace />
    }

    return <>{children}</>
}

export default AuthorityGuard