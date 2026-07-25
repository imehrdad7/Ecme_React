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

if (appConfig.enableMock) {
    import('./mock')
}

if (import.meta.env?.DEV) { 
    new VConsole()
}

function App() {
    return (
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
    )
}

export default App