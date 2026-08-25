// ==========================================
// Enums
// ==========================================

export enum CampaignStatus {
    Draft = 1,
    Scheduled = 2,
    InProgress = 3,
    Completed = 4,
    Paused = 5,
    Cancelled = 6,
    Retrying = 7
}


export enum MessageType {
    Unknown = 0,
    Text = 1,
    Image = 2,
    Video = 3,
    Document = 4,
    Audio = 5,
    Location = 6,
    Template = 7,
    Interactive = 8
}



// ==========================================
// Types
// ==========================================

export type PagedResult<T> = {
    items: T[];
    totalCount: number;
    page: number;
    pageSize: number;
};

export type CampaignListItemDto = {
    id: string;
    name: string;
    status: CampaignStatus;
    statusName: string;
    messageType: MessageType;
    messageTypeName: string;
    scheduledAt?: string | null;
    createdAt: string;
};

export type CampaignDetailsDto = {
    companyId: string;
    id: string;
    botId: string;
    name: string;
    status: CampaignStatus;
    statusName: string;
    messageType: MessageType;
    textContent?: string | null;
    mediaUrl?: string | null;
    scheduledAt?: string | null;
    startedAt?: string | null;
    completedAt?: string | null;
    createdAt: string;
    totalRecipients: number;
    sentCount: number;
    failedCount: number;
    pendingCount: number;
};

export type CampaignDto = {
    id: string;
    name: string;
    botName: string;
    status: CampaignStatus;
    scheduledAt: string | null;
    startedAt: string | null;
    contactsCount: number;
    createdAt: string;
    totalRecipients: number;
};

export type ContactDto = {
    id: string;
    firstName: string;
    lastName: string;
    fullName: string;
    userNameInPlatform: string;
    phoneNumber: string;
    tags: { id: string; name: string; colorHex: string }[];
}
// --- Request Models ---

export type SearchCampaignsRequest = {
    companyId: string;
    searchTerm?: string;
    statusFilter?: CampaignStatus | null;
    pageNumber?: number;
    pageSize?: number;
};

export type CreateCampaignRequest = {
    companyId: string;
    botId: string;
    name: string;
    messageType: MessageType;
    textContent?: string | null;
    mediaUrl?: string | null;
    scheduledAt?: string | null;
};

export type RescheduleCampaignRequest = {
    campaignId: string;
    companyId: string;
    newScheduledAt: string;
};

export type CloneCampaignRequest = {
    campaignId: string;
    companyId: string;
};

export type AddContactsToCampaignRequest = {
    campaignId: string;
    companyId: string;
    contactIds: string[];
    tagIds?: string[];
    sendToAll?: boolean;
    includeUntagged?: boolean;

};

export type RemoveContactsFromCampaignRequest = {
    campaignId: string;
    companyId: string;
    contactIds: string[];
};