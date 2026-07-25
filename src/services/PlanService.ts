import ApiService from './ApiService'

// ==========================================
// Types
// ==========================================

export type PagedResult<T> = {
    items: T[];
    totalCount: number;
    page: number;
    pageSize: number;
};

export type PlanListItemDto = {
    id: string;
    name: string;
    price: number;
    isActive: boolean;
    isPublic: boolean;
    displayOrder: number;
    isRecommended: boolean;
    // --- محدودیت‌های عددی ---
    maxOperators: number;
    maxBots: number;
    maxAutomatedFlows: number;
    maxBroadcastsPerMonth: number;
    allocatedAiTokens: number;

    // --- دسترسی‌های پولی (Features) ---
    hasCloudStorage: boolean;
    removeBranding: boolean;
    hasApiAccess: boolean;
    hasPremiumSupport: boolean;
    hasPremiumAiModels: boolean;
    allowInChatPayments: boolean;
    hasCustomDomain: boolean;
};

export type PlanDetailsDto = {
    id: string;
    name: string;
    price: number;
    displayOrder: number;
    isRecommended: boolean;
    // --- محدودیت‌های عددی -

    // --- محدودیت‌ها ---
    maxBots: number;
    maxContacts: number;
    maxMessagesPerMonth: number;
    allocatedAiTokens: number;
    maxOperators: number;
    maxBroadcastsPerMonth: number;
    dataRetentionDays: number;
    maxAutomatedFlows: number;
    maxAttachmentSizeMB: number;
    // --- وضعیت ---
    isActive: boolean;
    isPublic: boolean;
    // --- ویژگی‌ها ---
    hasCloudStorage: boolean;
    removeBranding: boolean;
    hasApiAccess: boolean;
    hasPremiumSupport: boolean;
    hasPremiumAiModels: boolean;
    allowInChatPayments: boolean;
    hasPremiumChannels: boolean;
    hasHumanHandoff: boolean;
    hasCustomDomain: boolean;
    hasABTesting: boolean;
    hasMultiLanguage: boolean;
    
    createdAt: string;
    updatedAt?: string;
};

export type PlanStatisticsDto = {
    planId: string;
    planName: string;
    totalSubscriptions: number;
    activeSubscriptions: number;
    estimatedMonthlyRevenue: number;
};

export type SearchPlansRequest = {
    searchTerm?: string;
    onlyActive?: boolean;
    onlyPublic?: boolean;
    pageNumber?: number;
    pageSize?: number;
};

export type CreatePlanRequest = {
    name: string;
    price: number;
    displayOrder?: number | null; 
    isRecommended: boolean;
    // --- محدودیت‌ها ---
    maxBots: number;
    maxContacts: number;
    maxMessagesPerMonth: number;
    allocatedAiTokens: number;
    maxOperators: number;
    maxBroadcastsPerMonth: number;
    dataRetentionDays: number;
    maxAutomatedFlows: number;
    maxAttachmentSizeMB: number;
    // --- ویژگی‌ها ---
    hasCloudStorage: boolean;
    removeBranding: boolean;
    hasApiAccess: boolean;
    hasPremiumSupport: boolean;
    hasPremiumAiModels: boolean;
    allowInChatPayments: boolean;
    hasPremiumChannels: boolean;
    hasHumanHandoff: boolean;
    hasCustomDomain: boolean;
    hasABTesting: boolean;
    hasMultiLanguage: boolean;
};

export type UpdatePlanRequest = {
    id: string;
    name: string;
    price: number;
    displayOrder?: number | null; 
    isRecommended: boolean;
};

export type UpdatePlanLimitsRequest = {
    planId: string;
    maxBots: number;
    maxContacts: number;
    maxMessagesPerMonth: number;
    allocatedAiTokens: number;
    // --- محدودیت‌های جدید ---
    maxOperators: number;
    maxBroadcastsPerMonth: number;
    dataRetentionDays: number;
    maxAutomatedFlows: number;
    maxAttachmentSizeMB: number;
};

// **توجه**: اگر بعداً برای ویرایش ویژگی‌ها یک اندپوینت جدا (مثلاً UpdatePlanFeatures) زدید، 
// می‌توانید تایپ و متد مربوط به آن را اینجا اضافه کنید.

export type IdResponse = {
    id: string;
};

export type PlanSubscriberDto = {
    subscriptionId: string;
    companyId: string;
    companyName: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
    isExpired: boolean;
    isCanceled: boolean;
    status: number;
};

export type GetPlanSubscribersRequest = {
    planId: string;
    pageNumber?: number;
    pageSize?: number;
};

// ==========================================
// API Functions
// ==========================================

// ------------------------------------------
// Plan Queries
// ------------------------------------------

export async function apiSearchPlans(params: SearchPlansRequest) {   
    return ApiService.fetchDataWithAxios<PagedResult<PlanListItemDto>>({
        url: `/api/v1/plans`,
        method: 'get',
        params
    });
}

export async function apiGetAllPlans() {   
    return ApiService.fetchDataWithAxios<PlanListItemDto[]>({
        url: `/api/v1/plans/all`,
        method: 'get'
    });
}

export async function apiGetPlanById(id: string) {   
    return ApiService.fetchDataWithAxios<PlanDetailsDto>({
        url: `/api/v1/plans/${id}`,
        method: 'get'
    });
}

export async function apiGetPlanStatistics(id: string) {   
    return ApiService.fetchDataWithAxios<PlanStatisticsDto>({
        url: `/api/v1/plans/${id}/statistics`,
        method: 'get'
    });
}

// ------------------------------------------
// Plan Commands
// ------------------------------------------

export async function apiCreatePlan(data: CreatePlanRequest) {   
    return ApiService.fetchDataWithAxios<string>({
        url: `/api/v1/plans`,
        method: 'post',
        data
    });
}

export async function apiUpdatePlan(id: string, data: UpdatePlanRequest) {   
    return ApiService.fetchDataWithAxios({
        url: `/api/v1/plans/${id}`,
        method: 'put',
        data
    });
}

export async function apiUpdatePlanLimits(id: string, data: UpdatePlanLimitsRequest) {   
    return ApiService.fetchDataWithAxios({
        url: `/api/v1/plans/${id}/limits`,
        method: 'put',
        data
    });
}

export async function apiDeletePlan(id: string) {   
    return ApiService.fetchDataWithAxios({
        url: `/api/v1/plans/${id}`,
        method: 'delete'
    });
}

export async function apiActivatePlan(id: string) {   
    return ApiService.fetchDataWithAxios({
        url: `/api/v1/plans/${id}/activate`,
        method: 'patch'
    });
}

export async function apiDeactivatePlan(id: string) {   
    return ApiService.fetchDataWithAxios({
        url: `/api/v1/plans/${id}/deactivate`,
        method: 'patch'
    });
}

export async function apiTogglePlanVisibility(id: string) {   
    return ApiService.fetchDataWithAxios({
        url: `/api/v1/plans/${id}/toggle-visibility`,
        method: 'patch'
    });
}

export async function apiClonePlan(id: string) {   
    return ApiService.fetchDataWithAxios<IdResponse>({
        url: `/api/v1/plans/${id}/clone`,
        method: 'post'
    });
}

export async function apiGetPlanSubscribers(params: GetPlanSubscribersRequest) {   
    return ApiService.fetchDataWithAxios<PagedResult<PlanSubscriberDto>>({
        url: `/api/v1/plans/${params.planId}/subscribers`,
        method: 'get',
        params: {
            pageNumber: params.pageNumber,
            pageSize: params.pageSize
        }
    });
}