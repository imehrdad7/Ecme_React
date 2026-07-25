import ApiService from './ApiService'

export type PurchasePlanRequest = {
    planId: string;
    callbackUrl: string;
    idempotencyKey: string;
    durationInMonths: number;
};

export type PurchasePlanResponse = {
    invoiceId: string;
    paymentUrl: string;
};

export async function apiPurchasePlan(data: PurchasePlanRequest) {
    return ApiService.fetchDataWithAxios<PurchasePlanResponse>({
        url: '/api/v1/billing/purchase',
        method: 'post',
        data
    });
}





// این تایپ‌ها را به فایل اضافه کنید
export type VerifyPaymentRequest = {
    authority: string;
};

export type VerifyPaymentResponse = {
    isSuccess: boolean;
    message: string;
    referenceNumber?: string;
};

// این متد را به بخش توابع اضافه کنید
export async function apiVerifyPayment(data: VerifyPaymentRequest) {
    return ApiService.fetchDataWithAxios<VerifyPaymentResponse>({
        url: '/api/v1/billing/verify-payment',
        method: 'post',
        data
    });
}