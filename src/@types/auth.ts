export type SignInCredential = {
    phonenumber: string;
    password: string;
}

export type SignInResponse = {
    token: {
        token:string
        refreshToken:string
    };
    // user: {
    //     userId: string
    //     userName: string
    //     authority: string[]
    //     avatar: string
    //     email: string
    // }
}

export type SignUpResponse = SignInResponse

export type SignUpCredential = {
    firstName: string
    lastName: string
    phonenumber: string
    password: string
}

export type ForgotPassword = {
    email: string
}

export type ResetPassword = {
    password: string
}

export type AuthRequestStatus = 'success' | 'failed' | ''

export type AuthResult = Promise<{
    status: AuthRequestStatus
    message: string
    errors?: Record<string, string[]>

}>

export type SignUpResult = {
    status: 'success' | 'failed'
    message: string
    errors?: Record<string, string[]> 
}

export type User = {
    id: string 
    avatarFileName?: string | null
    firstName?: string | null
    lastName?: string | null
    userName?: string | null
    phoneNumber?: string | null
    email?: string | null
    authority?: string[]
    companyId?: string
    companyName?: string

}

export type Token = {
    accessToken: string
    refereshToken?: string
}

export type OauthSignInCallbackPayload = {
    onSignIn: (tokens: Token, user?: User) => void
    redirect: () => void
}
