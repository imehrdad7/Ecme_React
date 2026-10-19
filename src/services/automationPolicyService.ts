import ApiService from './ApiService';

// اگر تایپ‌های ریسپانس را در فایل جداگانه‌ای دارید می‌توانید ایمپورت کنید
// در اینجا من اینترفیس‌ها را برای نمونه قرار دادم
export interface AutomationPolicyResponse {
    id: string;
    companyId: string;
    returnToBotAfterInactivityMinutes: number;
    handoffTriggerKeywords: string[];
    // ... سایر فیلدها
}

// کلمه interface به type تغییر کرد
export type UpdateHandoffSettingsPayload = {
    companyId: string;
    handoffTriggerKeywords: string;
    silenceBotDuringHandoff: boolean;
    botResponseDelaySeconds: number;
    returnToBotAfterInactivityMinutes: number;
    stopOnImageReceived: boolean;
    stopOnDocumentReceived: boolean;
    fallbackLimit: number;
    holdingMessage?: string;
    targetRole: number;
    notifyChannels: number;
};

// 1. متد دریافت تنظیمات یک شرکت
export async function apiGetCompanyPolicy(companyId: string) {
    return ApiService.fetchDataWithAxios<AutomationPolicyResponse>({
        url: `/api/v1/AutomationPolicies/company/${companyId}`,
        method: 'get'
    });
}

// 2. متد بروزرسانی یا ایجاد تنظیمات Handoff
export async function apiUpdateHandoffSettings(data: UpdateHandoffSettingsPayload) {
    return ApiService.fetchDataWithAxios<boolean>({
        url: `/api/v1/AutomationPolicies/handoff-settings`,
        method: 'put',
        data
    });
}