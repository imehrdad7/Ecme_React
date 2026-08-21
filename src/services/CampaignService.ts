import ApiService from './ApiService'
import {
    PagedResult, 
    CampaignListItemDto, 
    CampaignDetailsDto,
    SearchCampaignsRequest,
    CreateCampaignRequest,
    RescheduleCampaignRequest,
    CloneCampaignRequest,
    AddContactsToCampaignRequest,
    RemoveContactsFromCampaignRequest
} from '@/views/concepts/campaigns/types';

export async function apiSearchCampaigns(params: SearchCampaignsRequest) {
    return ApiService.fetchDataWithAxios<PagedResult<CampaignListItemDto>>({
        url: `/api/v1/Campaigns`,
        method: 'get',
        params
    });
}

export async function apiGetCampaignById(id: string) {   
    return ApiService.fetchDataWithAxios<CampaignDetailsDto>({
        url: `/api/v1/Campaigns/${id}`,
        method: 'get'
    });
}

export async function apiGetCampaignContactIds(id: string) {   
    return ApiService.fetchDataWithAxios<string[]>({
        url: `/api/v1/Campaigns/${id}/contact-ids`,
        method: 'get'
    });
}

export async function apiCreateCampaign(data: CreateCampaignRequest) {
    return ApiService.fetchDataWithAxios<string>({
        url: `/api/v1/Campaigns`,
        method: 'post',
        data
    });
}

export async function apiUpdateCampaign(id: string, data: CreateCampaignRequest) {
    return ApiService.fetchDataWithAxios<void>({
        url: `/api/v1/Campaigns/${id}`,
        method: 'put',
        data: data
    });
}

export async function apiDeleteCampaign(id: string) {
    return ApiService.fetchDataWithAxios<void>({
        url: `/api/v1/Campaigns/${id}`,
        method: 'delete'
    });
}

export async function apiStartCampaign(id: string) {   
    return ApiService.fetchDataWithAxios({
        url: `/api/v1/Campaigns/${id}/start`,
        method: 'post'
    });
}

export async function apiPauseCampaign(id: string) {   
    return ApiService.fetchDataWithAxios({
        url: `/api/v1/Campaigns/${id}/pause`,
        method: 'post'
    });
}

export async function apiCancelCampaign(id: string) {   
    return ApiService.fetchDataWithAxios({
        url: `/api/v1/Campaigns/${id}/cancel`,
        method: 'post'
    });
}

export async function apiRescheduleCampaign(id: string, data: RescheduleCampaignRequest) {   
    return ApiService.fetchDataWithAxios({
        url: `/api/v1/Campaigns/${id}/reschedule`,
        method: 'post',
        data
    });
}

export async function apiCloneCampaign(id: string, data: CloneCampaignRequest) {   
    return ApiService.fetchDataWithAxios<string>({
        url: `/api/v1/Campaigns/${id}/clone`,
        method: 'post',
        data
    });
}

export async function apiAddContactsToCampaign(id: string, data: AddContactsToCampaignRequest) {   
    return ApiService.fetchDataWithAxios({
        url: `/api/v1/Campaigns/${id}/contacts`,
        method: 'post',
        data
    });
}


export async function apiRemoveContactsFromCampaign(id: string, data: RemoveContactsFromCampaignRequest) {   
    return ApiService.fetchDataWithAxios({
        url: `/api/v1/Campaigns/${id}/contacts`,
        method: 'delete',
        data
    });
}

export async function apiRetryFailedCampaignMessages(id: string) {   
    return ApiService.fetchDataWithAxios({
        url: `/api/v1/Campaigns/${id}/retry-failed`,
        method: 'post'
    });
}

export async function apiExecuteCampaignAction(campaignId: string, action: 'start' | 'pause' | 'cancel') {
    return ApiService.fetchDataWithAxios({
        url: `/api/v1/Campaigns/${campaignId}/${action}`,
        method: 'post'
    });
}

export async function apiGetCampaignReport(campaignId: string) {
    return ApiService.fetchDataWithAxios({
        url: `/api/v1/Campaigns/${campaignId}/messages`,
        method: 'get',
    })
}

export async function apiRetryFailedMessages(campaignId: string) {
    return ApiService.fetchDataWithAxios({
        url: `/api/v1/Campaigns/${campaignId}/retry-failed`,
        method: 'post',
    })
}

export async function apiGetCampaignContactsDetails(id: string) {   
    return ApiService.fetchDataWithAxios<any[]>({
        url: `/api/v1/Campaigns/${id}/contacts-details`,
        method: 'get'
    });
}