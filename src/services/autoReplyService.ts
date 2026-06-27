import ApiService from './ApiService'

export type AutoReplyResponse = {
    id: string;
    title: string;
    keywords: string[];
    matchType: 'contains' | 'exact'; // بسته به دیتای بک‌اند
    bots: string[]; // لیست نام پلتفرم‌ها مثلاً ['Telegram', 'Instagram']
    isActive: boolean; 
}

export type GetAutoRepliesParams = {
    CompanyId?: string;
    BotId?: string;
}

export async function apiGetAutoReplies(params?: GetAutoRepliesParams) {   
    return ApiService.fetchDataWithAxios<AutoReplyResponse[]>({
        url: `/api/v1/AutoReplies`,
        method: 'get',
        params: params
    });
}

export async function apiDeleteAutoReply(id: string) {   
    return ApiService.fetchDataWithAxios({
        url: `/api/v1/AutoReplies/${id}`,
        method: 'delete'
    });
}

// برای استفاده‌های بعدی (فعال/غیرفعال کردن)
export async function apiToggleAutoReply(id: string, isActive: boolean) {
    return ApiService.fetchDataWithAxios({
        url: `/api/v1/AutoReplies/${id}/${isActive ? 'activate' : 'deactivate'}`,
        method: 'patch'
    });
}