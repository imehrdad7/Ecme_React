import ApiService from './ApiService'

// ۱. اضافه کردن این تایپ جنریک برای خروجی‌های صفحه‌بندی شده
export type PagedResult<T> = {
    items: T[];
    totalCount: number;
    page: number;
    pageSize: number;
};

// ۲. تایپ آیتم‌های فاکتور
export type InvoiceListItemDto = {
    id: string;
    companyName: string;
    planName: string;
    amount: number;
    isSuccessful: boolean;
    referenceNumber: string | null;
    createdAt: string;
};

// ۳. تابع فراخوانی API
export async function apiGetAdminInvoices(params: { pageNumber: number; pageSize: number }) {
    return ApiService.fetchDataWithAxios<PagedResult<InvoiceListItemDto>>({
        url: '/api/v1/admin/invoices',
        method: 'get',
        params
    });
}