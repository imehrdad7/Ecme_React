export type AppConfig = {
  apiPrefix: string
  authenticatedEntryPath: string
  unAuthenticatedEntryPath: string
  locale: string
  accessTokenPersistStrategy: 'localStorage' | 'sessionStorage' | 'cookies'
  enableMock: boolean
}

const appConfig: AppConfig = {
  apiPrefix: 'http://192.168.1.24:5172', // اسلش اضافه حذف و پورت صحیح جایگزین شد
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