import { BrowserRouter } from 'react-router-dom'
import Theme from '@/components/template/Theme'
import Layout from '@/components/layouts'
import { AuthProvider } from '@/auth'
import Views from '@/views'
import appConfig from './configs/app.config'
import './locales'
import VConsole from 'vconsole'

if (appConfig.enableMock) {
    import('./mock')
}

// ۲. فعال‌سازی vConsole فقط در محیط برنامه‌نویسی
if (import.meta.env?.DEV) { 
    new VConsole()
}

function App() {
    return (
        <Theme>
            <BrowserRouter>
                <AuthProvider>
                    <Layout>
                        <Views />
                    </Layout>
                </AuthProvider>
            </BrowserRouter>
        </Theme>
    )
}

export default App