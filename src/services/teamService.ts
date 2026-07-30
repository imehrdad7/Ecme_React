import ApiService from './ApiService';

export type InviteOperatorPayload = {
    companyId: string;
    phoneNumber: string;
    role: 'Admin' | 'User';
};

// فراخوانی Invite API برای دعوت اپراتور جدید
export async function apiInviteOperator<T>(data: InviteOperatorPayload) {
    return ApiService.fetchDataWithAxios<T>({
        url: '/api/v1/Users/invite',
        method: 'post',
        data: data
    });
}



export type TeamMember = {
    id: string;
    phoneNumber: string;
    role: string; 
    isActive: boolean;
    firstName: string;  
    lastName: string;
    email: string;
};


// متد جدید: دریافت لیست اعضای تیم
export async function apiGetTeamMembers<T>(companyId: string) {
    // آدرسی که در کنترلر فرستادید: /api/v1/team/company/{companyId}
    return ApiService.fetchDataWithAxios<T>({
        url: `/api/v1/Users/UsersCompany/${companyId}`,
        method: 'get'
    });
}

export type EditOperatorPayload = {
    userId: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    isActive: boolean;
};

// ویرایش اطلاعات/دسترسی اپراتور
export async function apiEditOperator<T>(data: EditOperatorPayload) {
    return ApiService.fetchDataWithAxios<T>({
        url: `/api/v1/Users/UpdateUsersCompany/${data.userId}`,
        method: 'put',
        data: { 
            userId: data.userId, 
            firstName: data.firstName, 
            lastName: data.lastName, 
            email: data.email, 
            isActive: data.isActive 
        }
    });
}
// حذف (اخراج) اپراتور از شرکت
export async function apiDeleteOperator<T>(userId: string) {
    return ApiService.fetchDataWithAxios<T>({
        url: `/api/v1/Users/${userId}/remove-company`,
        method: 'delete'
    });
} 