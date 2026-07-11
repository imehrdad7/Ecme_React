import ApiService from './ApiService' // مسیر را بر اساس پوشه‌بندی خود تنظیم کنید


export type GetContactsParams =  {
    CompanyId?: string;
    SearchTerm?: string;
    PhoneNumber?: string;
    PlatformFilter?: number;
    TagFilter?: string;
    Page?: number;
    PageSize?: number;
};

// ۱. دریافت لیست همه مخاطبین
export async function apiGetContacts<T>(params: GetContactsParams) {
        return ApiService.fetchDataWithAxios<T>({
        url: '/api/v1/Contacts',
        method: 'get',
        params
    })
}

// ۲. ایجاد مخاطب جدید
export async function apiCreateContact<T, U extends Record<string, unknown>>(data: U) {
    return ApiService.fetchDataWithAxios<T>({
        url: '/api/v1/Contacts',
        method: 'post',
        data,
    })
}

// ۳. دریافت مشخصات یک مخاطب خاص با آیدی
export async function apiGetContactById<T>(id: string) {
    return ApiService.fetchDataWithAxios<T>({
        url: `/api/v1/Contacts/${id}`,
        method: 'get',
    })
}

// ۴. ویرایش کامل مشخصات یک مخاطب
export async function apiUpdateContact<T, U extends Record<string, unknown>>(id: string, data: U) {
    return ApiService.fetchDataWithAxios<T>({
        url: `/api/v1/Contacts/${id}`,
        method: 'put',
        data: data,
    })
}

export async function apiDeleteContact<T>(id: string) {
    return ApiService.fetchDataWithAxios<T>({
        url: `/api/v1/Contacts/${id}`,
        method: 'delete',
    })
}

// ۵. مسدود کردن مخاطب (بلاک)
export async function apiBlockContact<T>(id: string) {
    return ApiService.fetchDataWithAxios<T>({
        url: `/api/v1/Contacts/${id}/block`,
        method: 'patch',
    })
}

// ۶. تخصیص یا ویرایش تگ‌های مخاطب
export async function apiUpdateContactTags<T>(id: string, data: { tags: string[] }) {
    return ApiService.fetchDataWithAxios<T>({
        url: `/api/v1/Contacts/${id}/tags`,
        method: 'post',
        data,
    })
}

// --- اضافه کردن این متدها به فایل سرویس ---

// ۱. خواندن همه برچسب‌ها
export async function apiGetTags<T>() {
    return ApiService.fetchDataWithAxios<T>({
        url: '/api/v1/Tags',
        method: 'get',
    })
}

// ۲. ساخت برچسب جدید
export async function apiCreateTag<T>(data: { name: string; colorHex: string , companyId: string }) {
    return ApiService.fetchDataWithAxios<T>({
        url: '/api/v1/Tags',
        method: 'post',
        data,
    })
}

// ۳. ویرایش برچسب
export async function apiUpdateTag<T>(id: string, data: { name: string; color: string }) {
    return ApiService.fetchDataWithAxios<T>({
        url: `/api/v1/Tags/${id}`,
        method: 'put',
        data,
    })
}

// ۴. حذف برچسب
export async function apiDeleteTag<T>(id: string) {
    return ApiService.fetchDataWithAxios<T>({
        url: `/api/v1/Tags/${id}`,
        method: 'delete',
    })
}

export async function apiExportContacts<T = Blob>(companyId: string, platformFilter?: number) {
    return ApiService.fetchDataWithAxios<T>({
        url: '/api/v1/Contacts/export',
        method: 'get',
        params: {
            CompanyId: companyId,
            PlatformFilter: platformFilter
        },
        responseType: 'blob', 
    })
}

export interface ImportFinalPayload {
    FullName: string;
    PhoneNumber: string;
    PlatformUserName?: string;
    Email?: string;
    Note?: string;
    Platform: string;
    Tags: string[];
}

export async function apiSubmitParsedContacts<T>(companyId: string, contacts: ImportFinalPayload[]) {
    return ApiService.fetchDataWithAxios<T>({
        url: '/api/v1/Contacts/import-json',
        method: 'post',
        data: {
            companyId,
            contacts
        }
    });
}

export async function apiBulkDeleteContacts<T>(contactIds: string[]) {
    return ApiService.fetchDataWithAxios<T>({
        url: '/api/v1/Contacts/bulk',
        method: 'delete',
        data: contactIds as any 
    });
}