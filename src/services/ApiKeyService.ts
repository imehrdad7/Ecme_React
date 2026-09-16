import ApiService from './ApiService';

// ==========================================
// Types & Interfaces
// ==========================================

export type ApiKeyDto = {
    id: string;
    name: string;
    prefix: string;
    scopes: string;
    isActive: boolean;
    createdAt: string;
    lastUsedAt?: string | null;
};

export type GenerateApiKeyRequest = {
    name: string;
    scopes: string;
};

export type GenerateApiKeyResponse = {
    apiKey: string;
    message?: string;
};

export type RevokeApiKeyResponse = {
    message?: string;
};

// ==========================================
// API Services
// ==========================================

// ۱. دریافت لیست کلیدها
export const apiGetApiKeys = async () => {
    return ApiService.fetchDataWithAxios<ApiKeyDto[]>({
        url: '/api/v1/api-keys',
        method: 'get'
    });
};

// ۲. تولید کلید جدید
export const apiGenerateApiKey = async (data: GenerateApiKeyRequest) => {
    return ApiService.fetchDataWithAxios<GenerateApiKeyResponse>({
        url: '/api/v1/api-keys/generate',
        method: 'post',
        data
    });
};

// ۳. ابطال کلید
export const apiRevokeApiKey = async (keyId: string) => {
    return ApiService.fetchDataWithAxios<RevokeApiKeyResponse>({
        url: `/api/v1/api-keys/${keyId}/revoke`,
        method: 'delete'
    });
};