export type AppConfig = {
    apiPrefix: string
    authenticatedEntryPath: string
    unAuthenticatedEntryPath: string
    locale: string
    accessTokenPersistStrategy: 'localStorage' | 'sessionStorage' | 'cookies'
    enableMock: boolean
}

const appConfig: AppConfig = {
    apiPrefix: 'https://localhost:7288/',
    authenticatedEntryPath: '/home',
    unAuthenticatedEntryPath: '/sign-in',
    accessTokenPersistStrategy: 'localStorage',
    locale: 'fa', // تنظیم زبان پیش‌فرض روی فارسی
    enableMock: false, // 🚀 بسیار مهم: غیرفعال کردن دیتای ساختگی
}

export default appConfig
