import { useSessionUser, setToken } from '@/store/authStore'
import { useGlobalErrorModal } from '@/store/modalStore' // 👈 ایمپورت استور جدید
import type { AxiosError } from 'axios'

const unauthorizedCode = [401, 419, 440]
const paymentRequiredCode = [402]

const AxiosResponseInterceptorErrorCallback = (error: AxiosError<any>) => {
    const { response } = error

    if (response) {
        // ۱. توکن نامعتبر
        if (unauthorizedCode.includes(response.status)) {
            setToken('')
            useSessionUser.getState().clearSession()
            if (window.location.pathname !== '/login') {
                window.location.href = '/login'
            }
        }

        // ۲. خطای 402 (اتمام اشتراک)
        if (paymentRequiredCode.includes(response.status)) {
            const errorMessage = response.data?.message || 'لایسنس AnyBot شما به پایان رسیده است. برای جلوگیری از قطعی ربات‌ها تمدید کنید.'
            
            if (window.location.pathname !== '/pricing') {
                // 👈 این خط، مودال جذابِ ما را باز می‌کند
                useGlobalErrorModal.getState().openModal('⚠️ اتمام لایسنس', errorMessage)
            }
        }
        
    }
    return Promise.reject(error)
}

export default AxiosResponseInterceptorErrorCallback