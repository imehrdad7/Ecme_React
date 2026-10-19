import ApiService from './ApiService'

// ۱. دریافت تعداد اعلانات خوانده‌نشده
export async function apiGetNotificationCount<T>() {
    return ApiService.fetchDataWithAxios<T>({
        url: '/api/v1/notifications/unread-count',
        method: 'get',
    })
}

// ۲. دریافت لیست اعلانات (با پشتیبانی از صفحه‌بندی)
export async function apiGetNotificationList<T>(params?: { pageNumber?: number; pageSize?: number }) {
    return ApiService.fetchDataWithAxios<T>({
        url: '/api/v1/notifications',
        method: 'get',
        params,
    })
}

// ۳. مارک کردن یک اعلان خاص به عنوان خوانده‌شده
export async function apiMarkAsRead<T>({ id }: { id: string }) {
    return ApiService.fetchDataWithAxios<T>({
        url: `/api/v1/notifications/${id}/read`,
        method: 'put',
    })
}

// ۴. مارک کردن تمامی اعلانات به عنوان خوانده‌شده
export async function apiMarkAllAsRead<T>() {
    return ApiService.fetchDataWithAxios<T>({
        url: '/api/v1/notifications/read-all',
        method: 'put',
    })
}