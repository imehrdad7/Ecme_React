// Enum برای وضعیت‌های پیام
export enum BroadcastStatus {
    Pending = 0,     // در صف انتظار
    Processing = 1,  // در حال پردازش
    Completed = 2,   // ارسال موفق
    Partial = 3,     // ارسال ناقص
    Failed = 4       // خطا در ارسال
}

// ساختار مقصدهای ارسالی برای زمان ساخت پیام
export interface BroadcastDestinationRequest {
    botId: string;
    targetChannelId?: string | null;
}

// درخواست ساخت پیام جدید
export interface CreateBroadcastRequest {
    title: string;
    content: string;
    mediaUrl?: string | null;
    destinations: BroadcastDestinationRequest[];
}

// درخواست ویرایش پیام
export interface UpdateBroadcastRequest {
    title: string;
    content: string;
    mediaUrl?: string | null;
}

// پارامترهای جستجو و صفحه‌بندی در جدول
export interface SearchBroadcastsRequest {
    pageNumber?: number;
    pageSize?: number;
    status?: BroadcastStatus;
    search?: string;
}

// مدل داده‌ای لیست پیام‌ها (برای نمایش در DataGrid)
export interface BroadcastDto {
    id: string;
    title: string;
    content: string;
    mediaUrl?: string | null;
    status: BroadcastStatus;
    createdAt: string;
}

// مدل وضعیت هر مقصد پس از ارسال
export interface BroadcastDestinationDto {
    botId: string;
    targetChannelId?: string | null;
    isSent: boolean;
    errorMessage?: string | null;
    platformPostId?: string | null;
}

// جزئیات کامل یک پیام (برای نمایش در مودال یا صفحه جزئیات)
export interface BroadcastDetailDto extends BroadcastDto {
    destinations: BroadcastDestinationDto[];
}

// اگر PagedResult را به صورت عمومی (Global) دارید از همان استفاده کنید، در غیر این صورت:
export interface PagedResult<T> {
    items: T[];
    totalCount: number;
    page: number;
    pageSize: number;
}