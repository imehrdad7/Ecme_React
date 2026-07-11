import { useRef, useImperativeHandle, forwardRef } from 'react'
import AuthContext from './AuthContext'
import appConfig from '@/configs/app.config'
import { useSessionUser, useToken } from '@/store/authStore'
import { apiSignIn, apiSignOut, apiSignUp ,apiGetUserProfile} from '@/services/AuthService'
import { REDIRECT_URL_KEY } from '@/constants/app.constant'
import { useNavigate } from 'react-router-dom'
import type {
    SignInCredential,
    SignUpCredential,
    SignUpResult,
    AuthResult,
    OauthSignInCallbackPayload,
    User,
    Token,
} from '@/@types/auth'
import type { ReactNode } from 'react'
import type { NavigateFunction } from 'react-router-dom'

type AuthProviderProps = { children: ReactNode }

export type IsolatedNavigatorRef = {
    navigate: NavigateFunction
}

const IsolatedNavigator = forwardRef<IsolatedNavigatorRef>((_, ref) => {
    const navigate = useNavigate()

    useImperativeHandle(
        ref,
        () => {
            return {
                navigate,
            }
        },
        [navigate],
    )

    return <></>
})

function AuthProvider({ children }: AuthProviderProps) {
    const signedIn = useSessionUser((state) => state.session.signedIn)
    const user = useSessionUser((state) => state.user)
    const setUser = useSessionUser((state) => state.setUser)
    const setSessionSignedIn = useSessionUser(
        (state) => state.setSessionSignedIn,
    )
    const { token, setToken } = useToken()

    const authenticated = Boolean(token && signedIn)

    const navigatorRef = useRef<IsolatedNavigatorRef>(null)

    const redirect = () => {
        const search = window.location.search
        const params = new URLSearchParams(search)
        const redirectUrl = params.get(REDIRECT_URL_KEY)

        navigatorRef.current?.navigate(
            redirectUrl ? redirectUrl : appConfig.authenticatedEntryPath,
        )
    }

    const handleSignIn = (tokens: Token, user?: User) => {
        setToken(tokens.accessToken)
        setSessionSignedIn(true)

        if (user) {
            setUser(user)
        }
    }

    const handleSignOut = () => {
        setToken('')
       // setUser({})
        setSessionSignedIn(false)
    }

const signIn = async (values: SignInCredential): AuthResult => {
            try {
            const resp = await apiSignIn(values)
            if (resp) {
                const tokenData: Token = typeof resp.token === 'string'
                ? { accessToken: resp.token }
                : { 
                    accessToken: resp.token.token
                };
                handleSignIn(tokenData)

                const phone = values.phonenumber;
                try {
                    const profileResp = await apiGetUserProfile(phone)
                    if (profileResp) {
                        // ذخیره اطلاعات کاربر در استیت سراسری سیستم
                        setUser(profileResp) 
                    }
                } catch (profileError) {
                    console.error('خطا در دریافت اطلاعات کاربر:', profileError)
                    // در صورت نیاز می‌توانید خطا را اینجا مدیریت کنید
                }



                redirect()
                return {
                    status: 'success',
                    message: '',
                }
            }
            return {
                status: 'failed',
                message: 'Unable to sign in',
            }
            // eslint-disable-next-line  @typescript-eslint/no-explicit-any
        } catch (errors: any) {
            return {
                status: 'failed',
                message: errors?.response?.data?.Message || errors.toString(),
            }
        }
    }

    const signUp = async (values: SignUpCredential) => {
        try {
            const resp = await apiSignUp(values); // یا هر تابع API که دارید
            
            if (resp) {
                // 🌟 استفاده از 'as const' برای اینکه TS بفهمد این یک استرینگ معمولی نیست
                return {
                    status: 'success' as const, 
                    message: 'ثبت‌نام با موفقیت انجام شد'
                };
            }
            
            // 🌟 جلوگیری از بازگشت undefined در صورتی که resp.data وجود نداشت
            return {
                status: 'failed' as const,
                message: 'خطایی در دریافت اطلاعات رخ داد'
            };

        } catch (error: any) {
            // 🌟 ساختاردهی دقیق خروجی خطا برای جلب رضایت تایپ‌اسکریپت
            return {
                status: 'failed' as const,
                message: error?.response?.data?.message || 'خطا در ارتباط با سرور',
                // اگر بک‌اند شما ارورهای فیلدها را برمی‌گرداند، آن را اینطور پاس بدهید:
                errors: error?.response?.data?.errors as Record<string, string[]> | undefined
            };
        }
    };
    
    const signOut = async () => {
        try {
            await apiSignOut()
        } finally {
            handleSignOut()
            navigatorRef.current?.navigate(appConfig.unAuthenticatedEntryPath)
        }
    }
    const oAuthSignIn = (
        callback: (payload: OauthSignInCallbackPayload) => void,
    ) => {
        callback({
            onSignIn: handleSignIn,
            redirect,
        })
    }

    return (
        <AuthContext.Provider
            value={{
                authenticated,
                user,
                signIn,
                signUp,
                signOut,
                oAuthSignIn,
            }}
        >
            {children}
            <IsolatedNavigator ref={navigatorRef} />
        </AuthContext.Provider>
    )
}

IsolatedNavigator.displayName = 'IsolatedNavigator'

export default AuthProvider
