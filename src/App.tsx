import { useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import Theme from '@/components/template/Theme'
import Layout from '@/components/layouts'
import { AuthProvider, useAuth } from '@/auth'
import Views from '@/views'
import appConfig from './configs/app.config'
import './locales'
import VConsole from 'vconsole'

import GlobalErrorModal from '@/components/ui/GlobalErrorModal'
import LicenseWarningBanner from '@/components/ui/LicenseWarningBanner'
import SystemBotConnectBanner from '@/components/ui/SystemBotConnectBanner'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// 👇 اضافه کردن ایمپورت‌های سوکت و توست
import { socketManager } from '@/utils/SocketManager'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'

if (appConfig.enableMock) {
    import('./mock')
}

if (import.meta.env?.DEV) {
    //new VConsole()
}

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
        },
    },
})

const GlobalSocketListener = () => {
    const { signOut } = useAuth()

    useEffect(() => {
        let isMounted = true
        let connection = socketManager.getConnection()

        const handleForceLogout = (message: string) => {
            console.log("🚨 سیگنال ForceLogout از سرور دریافت شد!", message);
            toast.push(
                <Notification title="خروج اجباری" type="danger" duration={6000}>
                    {message}
                </Notification>,
                { placement: 'top-center' }
            )
            signOut()

            setTimeout(() => {
                window.location.href = '/sign-in'
            }, 1500);
        }

        const checkConnection = setInterval(() => {
            connection = socketManager.getConnection()
            if (connection && isMounted) {
                connection.on("ForceLogout", handleForceLogout)
                clearInterval(checkConnection)
            }
        }, 500)

        return () => {
            isMounted = false
            clearInterval(checkConnection)
            if (connection) {
                connection.off("ForceLogout", handleForceLogout)
            }
        }
    }, [signOut])

    return null
}


function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <Theme>
                <BrowserRouter>
                    <AuthProvider>
                        <GlobalSocketListener />
                        
                        <LicenseWarningBanner />
                        <SystemBotConnectBanner />
                        <Layout>
                            <Views />
                        </Layout>
                    </AuthProvider>

                    <GlobalErrorModal />

                </BrowserRouter>
            </Theme>
        </QueryClientProvider>
    )
}

export default App