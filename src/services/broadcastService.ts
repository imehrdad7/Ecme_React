import ApiService from './ApiService'; // آدرس import را بر اساس ساختار پروژه خود تنظیم کنید
import {
    PagedResult,
    BroadcastDto,
    BroadcastDetailDto,
    SearchBroadcastsRequest,
    CreateBroadcastRequest,
    UpdateBroadcastRequest
} from '@/views/concepts/broadcasts/types';

const API_BASE_URL = '/api/Broadcasts'; // اگر در بک‌اند از v1 استفاده کردید، آن را به /api/v1/Broadcasts تغییر دهید

export async function apiSearchBroadcasts(params: SearchBroadcastsRequest) {
    return ApiService.fetchDataWithAxios<PagedResult<BroadcastDto>>({
        url: API_BASE_URL,
        method: 'get',
        params
    });
}

export async function apiGetBroadcastById(id: string) {
    return ApiService.fetchDataWithAxios<BroadcastDetailDto>({
        url: `${API_BASE_URL}/${id}`,
        method: 'get'
    });
}

export async function apiCreateBroadcast(data: CreateBroadcastRequest) {
    // طبق کنترلر ما در بک‌اند، خروجی شامل یک آبجکت حاوی Id و Message است
    return ApiService.fetchDataWithAxios<{ id: string; message: string }>({
        url: API_BASE_URL,
        method: 'post',
        data: data as unknown as Record<string, unknown> // 👈 اصلاح خطای نوع داده
    });
}

export async function apiUpdateBroadcast(id: string, data: UpdateBroadcastRequest) {
    return ApiService.fetchDataWithAxios<{ message: string }>({
        url: `${API_BASE_URL}/${id}`,
        method: 'put',
        data: data as unknown as Record<string, unknown> // 👈 اصلاح خطای نوع داده
    });
}

export async function apiDeleteBroadcast(id: string) {
    return ApiService.fetchDataWithAxios<{ message: string }>({
        url: `${API_BASE_URL}/${id}`,
        method: 'delete'
    });
}

export async function apiRetryBroadcast(id: string) {
    return ApiService.fetchDataWithAxios<{ message: string }>({
        url: `${API_BASE_URL}/${id}/retry`,
        method: 'post'
    });
}