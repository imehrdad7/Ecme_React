import { BrowserRouter } from 'react-router-dom'
import Theme from '@/components/template/Theme'
import Layout from '@/components/layouts'
import { AuthProvider } from '@/auth'
import Views from '@/views'
import appConfig from './configs/app.config'
import './locales'
import VConsole from 'vconsole'

import GlobalErrorModal from '@/components/ui/GlobalErrorModal' 
import LicenseWarningBanner from '@/components/ui/LicenseWarningBanner'

// ۱. اضافه کردن ایمپورت‌های React Query
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

if (appConfig.enableMock) {
    import('./mock')
}

if (import.meta.env?.DEV) { 
    //new VConsole()
}

// ۲. ساخت نمونه QueryClient دقیقاً بیرون از کامپوننت
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false, // جلوگیری از رفرش خودکار با جابجایی تب مرورگر
            retry: 1, // فقط یک بار تلاش مجدد در صورت خطای شبکه
        },
    },
})

function App() {
    return (
        // ۳. احاطه کردن کل ساختار با پروایدر
        <QueryClientProvider client={queryClient}>
            <Theme>
                <BrowserRouter>
                    <AuthProvider>
                        <LicenseWarningBanner />
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