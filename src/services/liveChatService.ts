import ApiService from './ApiService'

// ۱. دریافت لیست مکالمات (صندوق پیام‌ها) با امکان جستجو، فیلتر (باز/بسته) و صفحه‌بندی
export async function apiSearchConversations<T>(params: { 
    companyId: string; 
    searchTerm?: string; 
    isActive?: boolean; 
    pageNumber?: number; 
    pageSize?: number 
}) {
    return ApiService.fetchDataWithAxios<T>({
        url: `/api/v1/conversations/search`,
        method: 'get',
        params
    })
}

// ۲. دریافت تاریخچه پیام‌های یک مکالمه خاص
export async function apiGetConversationMessages<T>(
    conversationId: string, 
    params: { companyId: string; pageNumber?: number; pageSize?: number }
) {
    return ApiService.fetchDataWithAxios<T>({
        url: `/api/v1/messages/conversation/${conversationId}`,
        method: 'get',
        params
    })
}

// ۳. ارسال پیام خروجی (از سمت اپراتور به کاربر)
export async function apiSendOutgoingMessage<T>(data: { 
    conversationId: string; 
    companyId: string; 
    senderUserId: string; 
    messageType: number; // 1 = متن، 2 = تصویر، و...
    textContent?: string; 
    mediaUrl?: string 
}) {
    return ApiService.fetchDataWithAxios<T>({
        url: '/api/v1/messages/send',
        method: 'post',
        data
    })
}

// ۴. تغییر وضعیت پیام‌های یک مکالمه به "خوانده شده"
export async function apiMarkMessagesAsRead<T>(data: { conversationId: string; companyId: string }) {
    return ApiService.fetchDataWithAxios<T>({
        url: '/api/v1/messages/read',
        method: 'post',
        data
    })
}

// ۵. بستن یک مکالمه
export async function apiCloseConversation<T>(data: { conversationId: string; companyId: string }) {
    return ApiService.fetchDataWithAxios<T>({
        url: `/api/v1/conversations/${data.conversationId}/close`,
        method: 'post',
        data
    })
}

// ۶. باز کردن مجدد یک مکالمه بسته شده
export async function apiReopenConversation<T>(data: { conversationId: string; companyId: string }) {
    return ApiService.fetchDataWithAxios<T>({
        url: `/api/v1/conversations/${data.conversationId}/reopen`,
        method: 'post',
        data
    })
}

// ۷. ارجاع مکالمه به یک اپراتور خاص
export async function apiAssignConversation<T>(data: { 
    conversationId: string; 
    assigneeUserId: string; 
    assignedByUserId: string; 
    companyId: string 
}) {
    return ApiService.fetchDataWithAxios<T>({
        url: `/api/v1/conversations/${data.conversationId}/assign`,
        method: 'post',
        data
    })
}

// ۸. دریافت جزئیات دقیق یک مکالمه (در صورت نیاز به نمایش در سایدبار)
export async function apiGetConversationDetails<T>(conversationId: string, companyId: string) {
    return ApiService.fetchDataWithAxios<T>({
        url: `/api/v1/conversations/${conversationId}`,
        method: 'get',
        params: { companyId }
    })
}

// اگر این اینترفیس را نساخته‌اید، حتماً بسازید تا با خروجی سی‌شارپ مچ باشد:
export interface UploadMediaResponse {
    url: string;
    fileName: string;
    size: number;
}

export async function apiUploadMedia(data: FormData) {
    return ApiService.fetchDataWithAxios<UploadMediaResponse>({
        url: `/api/v1/Media/Upload`,
        method: 'post',
        data: data as any
    });
}

export async function apiDeleteMedia(companyId: string, fileUrl: string) {
    return ApiService.fetchDataWithAxios({
        url: `/api/v1/Media/delete?companyId=${companyId}&fileUrl=${encodeURIComponent(fileUrl)}`,
        method: 'delete'
    });
}