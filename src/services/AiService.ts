import ApiService from './ApiService'

// ==========================================
// Types
// ==========================================

export type AiConfigurationResponse = {
    id: string;
    companyId: string;
    selectedModel: number; // 0: Gpt4o, 1: Gpt4oMini, 2: DeepSeekChat, 3: Claude35Sonnet
    temperature: number;
    systemPrompt: string;
    promptVariablesJson: string;
    isActive: boolean;
    role?: string;
    tone?: string;
    businessRules?: string;
    fallbackMessage?: string;
};

export type UpsertAiConfigurationRequest = {
    companyId: string;
    selectedModel: number;
    temperature: number;
    systemPrompt: string;
    promptVariablesJson: string;
    isActive: boolean;
};

export type KnowledgeDocumentResponse = {
    id: string;
    companyId: string;
    title: string;
    sourceType: number; // 0: RawText, 1: Pdf, 2: Word
    contentUri: string;
    createdAt: string;
};

export type AddKnowledgeDocumentRequest = {
    companyId: string;
    title: string;
    sourceType: number; 
    content: string; // متن خام یا مسیر فایل آپلود شده
};

export type IdResponse = {
    id: string;
};

// ==========================================
// API Functions
// ==========================================

// ------------------------------------------
// Ai Configuration (Persona & Settings)
// ------------------------------------------

export async function apiGetAiConfiguration(companyId: string) {   
    return ApiService.fetchDataWithAxios<AiConfigurationResponse>({
        url: `/api/v1/ai-configurations/company/${companyId}`,
        method: 'get'
    });
}

export async function apiUpsertAiConfiguration(data: UpsertAiConfigurationRequest) {   
    return ApiService.fetchDataWithAxios<IdResponse>({
        url: `/api/v1/ai-configurations`,
        method: 'post',
        data
    });
}

// ------------------------------------------
// Knowledge Base (RAG Documents)
// ------------------------------------------

export async function apiGetKnowledgeDocuments(companyId: string) {   
    return ApiService.fetchDataWithAxios<KnowledgeDocumentResponse[]>({
        url: `/api/v1/knowledge/company/${companyId}`,
        method: 'get'
    });
}

export async function apiAddKnowledgeDocument(data: AddKnowledgeDocumentRequest) {   
    return ApiService.fetchDataWithAxios<IdResponse>({
        url: `/api/v1/knowledge`,
        method: 'post',
        data
    });
}

export async function apiDeleteKnowledgeDocument(id: string, companyId: string) {   
    return ApiService.fetchDataWithAxios({
        url: `/api/v1/knowledge/${id}/company/${companyId}`,
        method: 'delete'
    });
}