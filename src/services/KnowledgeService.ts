import ApiService from './ApiService'

// ۱. دریافت لیست تمام داکیومنت‌های ذخیره شده در پایگاه دانش
export async function apiGetKnowledgeDocuments<T>(companyId: string) {
        return ApiService.fetchDataWithAxios<T>({
        url: `/api/v1/Knowledge?companyId=${companyId}`,
        method: 'get',
    })
}

// ۲. آپلود فایل (PDF, Word, Excel, TXT)
export async function apiUploadKnowledgeFile<T>(data: FormData) {
        return ApiService.fetchDataWithAxios<T>({
        url: '/api/v1/Knowledge/file',
        method: 'post',
        data: data as any,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
}

// ۳. افزودن دانش به صورت متن خام
export async function apiAddKnowledgeText<T>(companyId: string, data: { title: string; textContent: string }) {
    return ApiService.fetchDataWithAxios<T>({
        url: `/api/v1/knowledge/text?companyId=${companyId}`,
        method: 'post',
        data,
    })
}

// ۴. افزودن دانش از طریق آدرس وب‌سایت (Scraping)
export async function apiAddKnowledgeWebsite<T>(data: {companyId: string, title: string; url: string }) {
    return ApiService.fetchDataWithAxios<T>({
        url: '/api/v1/knowledge/website',
        method: 'post',
        data,
    })
}

// ۵. دریافت جزئیات یک داکیومنت خاص (در صورت نیاز)
export async function apiGetKnowledgeDocumentDetails<T>({ id }: { id: string }) {
    return ApiService.fetchDataWithAxios<T>({
        url: `/api/v1/knowledge/${id}`,
        method: 'get',
    })
}

// ۶. حذف یک داکیومنت از پایگاه دانش
export async function apiDeleteKnowledgeDocument<T>(companyId: string, id: string) {
    return ApiService.fetchDataWithAxios<T>({
        url: `/api/v1/knowledge/${id}`,
        method: 'delete',
        params: { companyId }
    })
}

// دریافت متن کامل برای مودال نمایش
export async function apiGetKnowledgeDocumentContent(companyId: string, docId: string) {
    return ApiService.fetchDataWithAxios<{ content: string }>({
        url: `/api/v1/knowledge/${companyId}/${docId}/content`,
        method: 'get',
    })
}

// دانلود فایل یا خروجی متنی
export async function apiDownloadKnowledgeDocument(companyId: string, docId: string) {
    return ApiService.fetchDataWithAxios<Blob>({
        url: `/api/v1/knowledge/${companyId}/${docId}/download`,
        method: 'get',
        responseType: 'blob', // 👈 این خط برای دریافت فایل بسیار مهم است
    })
}