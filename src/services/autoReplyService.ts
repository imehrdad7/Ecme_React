import ApiService from './ApiService'

export type CreateAutoRepliesParams = {
    id?: string;
    companyId: string;
    botId: string | null;
    name: string;
    priority: number;
    triggers: { value: string; type: number }[];
    responses: { content: string; type: number; fileName?: string }[];};

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

export async function apiCreateAutoReplies(data?: CreateAutoRepliesParams) {   
    return ApiService.fetchDataWithAxios<string>({
        url: `/api/v1/AutoReplies`,
        method: 'post',
        data
    });
}

export async function apiGetAutoReplies(params?: GetAutoRepliesParams) {   
    return ApiService.fetchDataWithAxios<AutoReplyResponse[]>({
        url: `/api/v1/AutoReplies`,
        method: 'get',
        params: params
    });
}

export async function apiGetAutoReply(id: string, params?: GetAutoRepliesParams) {   
    return ApiService.fetchDataWithAxios<AutoReplyResponse>({ 
        url: `/api/v1/AutoReplies/${id}`,
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

export async function apiToggleAutoReply(id: string) {
    return ApiService.fetchDataWithAxios({
        url: `/api/v1/AutoReplies/${id}/toggle-status`,
        method: 'patch'
    });
}

export async function apiUpdateAutoReply(id: string, data: any) {
    return ApiService.fetchDataWithAxios({
        url: `/api/v1/AutoReplies/${id}`,
        method: 'put',
        data: data
    });
}