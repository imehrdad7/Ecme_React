import ApiService from './ApiService'

// ==========================================
// Types
// ==========================================

export type CreateBotRequest = {
    platform: number;
    name: string;
    token: string;
    description?: string;
};

export type UpdateBotRequest = {
    id: string;
    name?: string;
    token?: string;
    description?: string;
};

export type BotResponse = {
    id: string;
    platform: string;
    name: string;
    description?: string;
    isActive: boolean;
    createdAt: string;
};

// ==========================================
// API Functions
// ==========================================

export async function apiCreateBot(data: CreateBotRequest) {
    return ApiService.fetchDataWithAxios<string>({
        url: `/api/v1/Bots`,
        method: 'post',
        data
    });
}

export async function apiUpdateBot(id: string, data: UpdateBotRequest) {   
    return ApiService.fetchDataWithAxios({
        url: `/api/v1/Bots/${id}`,
        method: 'put',
        data
    });
}

export async function apiGetBot(id: string) {   
    return ApiService.fetchDataWithAxios<BotResponse>({
        url: `/api/v1/Bots/${id}`,
        method: 'get'
    });
}

export async function apiGetBots() {   
    // این متد برای گرفتن لیست تمام ربات‌ها در صفحه bot-list کاربرد دارد
    return ApiService.fetchDataWithAxios<BotResponse[]>({
        url: `/api/v1/Bots`,
        method: 'get'
    });
}

export async function apiActivateBot(id: string) {   
    return ApiService.fetchDataWithAxios({
        url: `/api/v1/Bots/${id}/activate`,
        method: 'patch'
    });
}

export async function apiDeactivateBot(id: string) {   
    return ApiService.fetchDataWithAxios({
        url: `/api/v1/Bots/${id}/deactivate`,
        method: 'patch'
    });
}

export async function apiDeleteBot(id: string) {   
    return ApiService.fetchDataWithAxios({
        url: `/api/v1/Bots/${id}`,
        method: 'delete'
    });
}