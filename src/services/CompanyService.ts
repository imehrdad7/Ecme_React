import ApiService from './ApiService'

type CreateCompanyRequest = {
    name: string;
};

export async function apiCreateCompany(data: CreateCompanyRequest) {
    return ApiService.fetchDataWithAxios<string>({
        url: `/api/v1/Companies`,
        method: 'post',
        data
    })
}


type UpdateCompanyRequest = {
    id: string;
    name: string;
};

export async function apiUpdateCompany(id: string, data: UpdateCompanyRequest) {   
    return ApiService.fetchDataWithAxios({
        url: `/api/v1/Companies/${id}`,
        method: 'put',
        data
    });
}
type CompanyResponse = {
    id: string;
    name: string;
    isActive : boolean;
};
export async function apiGetCompany(id: string) {   
    return ApiService.fetchDataWithAxios<CompanyResponse>({
        url: `/api/v1/Companies/${id}`,
        method: 'get'
    });
}


export type AssignCompanyRequest = {
    userId: string;
    companyId: string;
};

export async function apiAssignCompanyToUser(data: AssignCompanyRequest) {   
    return ApiService.fetchDataWithAxios({
        url: `/api/v1/Users/${data.userId}/assign-company`,
        method: 'post',
        data
    });
}


export async function apiActivateCompany(id: string) {   
    return ApiService.fetchDataWithAxios({
        url: `/api/v1/Companies/${id}/activate`,
        method: 'patch'
    });
}

export async function apiDeactivateCompany(id: string) {   
    return ApiService.fetchDataWithAxios({
        url: `/api/v1/Companies/${id}/deactivate`,
        method: 'patch'
    });
}