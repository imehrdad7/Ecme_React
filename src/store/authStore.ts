import cookiesStorage from '@/utils/cookiesStorage'
import appConfig from '@/configs/app.config'
import { TOKEN_NAME_IN_STORAGE } from '@/constants/api.constant'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { User } from '@/@types/auth'

type Session = {
    signedIn: boolean
}   

type AuthState = {
    session: Session
    user: User
}

type AuthAction = {
    setSessionSignedIn: (payload: boolean) => void
    setUser: (payload: Partial<User>) => void // ✨ تغییر به Partial برای رفع خطاهای TS و آپدیت راحت‌تر
    clearSession: () => void // ✨ متد استاندارد برای خروج از حساب
}

const getPersistStorage = () => {
    if (appConfig.accessTokenPersistStrategy === 'localStorage') {
        return localStorage
    }

    if (appConfig.accessTokenPersistStrategy === 'sessionStorage') {
        return sessionStorage
    }

    return cookiesStorage
}

const initialState: AuthState = {
    session: {
        signedIn: false,
    },
    user: {
        id: '',
        avatarFileName: '',
        userName: '',
        phoneNumber: '',
        email: '',
        authority: [],
    },
}

export const useSessionUser = create<AuthState & AuthAction>()(
    persist(
        (set) => ({
            ...initialState,
            
            setSessionSignedIn: (payload) =>
                set((state) => ({
                    session: {
                        ...state.session,
                        signedIn: payload,
                    },
                })),
                
            setUser: (payload) =>
                set((state) => ({
                    user: {
                        ...state.user,
                        ...payload,
                    },
                })),
                
            // متد جادویی و تمیز برای ریست کردن کامل وضعیت به حالت اولیه
            clearSession: () => set(() => ({ ...initialState })),
        }),
        { name: 'sessionUser', storage: createJSONStorage(() => localStorage) },
    ),
)

// ==========================================
// ✨ مدیریت توکن (خارج کردن از حالت هوک ریکت)
// ==========================================

// حالا این توابع را می‌توان در هر فایل جاوااسکریپتی (حتی خارج از کامپوننت‌ها) صدا زد
export const getToken = () => {
    const storage = getPersistStorage()
    return storage.getItem(TOKEN_NAME_IN_STORAGE)
}

export const setToken = (token: string) => {
    const storage = getPersistStorage()
    storage.setItem(TOKEN_NAME_IN_STORAGE, token)
}

// برای حفظ سازگاری با کدهای قبلی شما در کامپوننت‌ها، هوک را هم نگه می‌داریم
export const useToken = () => {
    return {
        setToken,
        token: getToken(),
    }
}