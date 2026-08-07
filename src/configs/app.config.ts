export type AppConfig = {
  apiPrefix: string
  authenticatedEntryPath: string
  unAuthenticatedEntryPath: string
  locale: string
  accessTokenPersistStrategy: 'localStorage' | 'sessionStorage' | 'cookies'
  enableMock: boolean
}

const appConfig: AppConfig = {
  apiPrefix: 'http://192.168.1.24:5172',
  //apiPrefix: 'http://172.18.0.1:5172',
  authenticatedEntryPath: '/concepts/Dashboard',
  unAuthenticatedEntryPath: '/sign-in',
  accessTokenPersistStrategy: 'localStorage',
  locale: 'fa', // تنظیم زبان پیش‌فرض روی فارسی
  enableMock: false, // 🚀 بسیار مهم: غیرفعال کردن دیتای ساختگی
}



// const appConfig: AppConfig = {
//     apiPrefix: '/api',
//     authenticatedEntryPath: '/dashboards/ecommerce',
//     unAuthenticatedEntryPath: '/sign-in',
//     locale: 'en',
//     accessTokenPersistStrategy: 'localStorage',
//     enableMock: true,
// }

export default appConfig