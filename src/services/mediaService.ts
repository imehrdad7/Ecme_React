import ApiService from './ApiService'

export type UploadMediaResponse = {
    url: string;
    fileName?: string;
    size?: number;
};


export async function apiUploadMedia(data: FormData) {
    return ApiService.fetchDataWithAxios<UploadMediaResponse>({
        url: `/api/v1/Media/Upload`,
        method: 'post',
        // 🌟 دور زدن خطای تایپ‌اسکریپت برای ارسال FormData
        data: data as any, 
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
}

export async function apiDeleteMedia(companyId: string, fileUrl: string) {
    return ApiService.fetchDataWithAxios({
        url: `/api/v1/Media/delete?companyId=${companyId}&fileUrl=${encodeURIComponent(fileUrl)}`,
        method: 'delete'
    });
}