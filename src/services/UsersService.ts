import ApiService from './ApiService';

export type ChangePasswordPayload = {
    userId: string;
    currentPassword: string;
    newPassword: string;
};

export async function apiChangePassword<T>(data: ChangePasswordPayload) {
    return ApiService.fetchDataWithAxios<T>({
        url: `/api/v1/Users/${data.userId}/change-password`, 
        method: 'patch', 
        data: {
            userId: data.userId,
            currentPassword: data.currentPassword,
            newPassword: data.newPassword
        }
    });
}