import ApiService from './ApiService';

// ==========================================
// 1. Types & Interfaces
// ==========================================

export interface ChartDataPoint {
    time: string;
    totalIncoming: number;
    botResolved: number;
}

export interface PlatformDistribution {
    platform: string;
    count: number;
}

export interface CampaignPerformance {
    name: string;
    sent: number;
    pending: number;
}

export interface DashboardMetrics {
    totalMessages: number;
    botRate: number;
    avgTime: string;
    handovers: number;
    chartData: ChartDataPoint[];
    platformData: PlatformDistribution[];
    campaignData: CampaignPerformance[];
}

export interface BotListItem {
    id: string;
    name: string;
    platform: number | string;
    isActive: boolean;
}

export interface PagedResult<T> {
    items: T[];
    totalCount: number;
    page: number;
    pageSize: number;
}

export interface CampaignSummary {
    id: string;
    title: string;
    platform: string | number; // برای نمایش آیکون (واتس‌اپ، تلگرام و...)
    status: 'Running' | 'Completed' | 'Draft' | 'Paused';
    sentCount: number;
    targetCount: number; // کل مخاطبین هدف
    createdAt: string;
}

export interface ManagementOverview {
    subscriptionPlan: string;
    daysRemaining: number;
    remainingAiTokens: number;
    allocatedAiTokens: number;
    totalKnowledgeDocuments: number;
    processedKnowledgeDocuments: number;
    failedKnowledgeDocuments: number;
    activeBotsCount: number;
    maxBotsLimit: number;
    activePlatforms: number[];
    currentContactsCount: number;
    maxContactsLimit: number;
    currentOperatorsCount: number;
    maxOperatorsLimit: number;
    usedStorageBytes: number;
    maxAttachmentSizeMB: number;
    autoRepliesCount: number;
    companyName: string;
    hasApiAccess: boolean;
    anactiveBotsCount: number;
}

// ==========================================
// 2. API Methods
// ==========================================

export async function apiGetDashboardMetrics<T = DashboardMetrics>(
    companyId: string, 
    timeframe: string = '7d', 
    botId: string = 'all'
) {
    const params = new URLSearchParams({ timeframe });
    if (botId !== 'all') {
        params.append('botId', botId);
    }

    return ApiService.fetchDataWithAxios<T>({
        url: `/api/v1/dashboard/company/${companyId}/metrics?${params.toString()}`,
        method: 'get',
    });
}


export async function apiGetCompanyBots<T = PagedResult<BotListItem>>() {
    return ApiService.fetchDataWithAxios<T>({
        url: `/api/v1/bots?pageSize=50`, 
        method: 'get',
    });
}

export async function apiGetManagementOverview<T = ManagementOverview>(companyId: string) {
    return ApiService.fetchDataWithAxios<T>({
        url: `/api/v1/dashboard/company/${companyId}/overview`,
        method: 'get',
    });
}