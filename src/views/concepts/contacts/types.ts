export type Platform = 'Telegram' | 'Instagram' | 'WhatsApp' | 'Web'

export type ServerTag = {
    id: string; 
    name: string;
    color: string;
}


export type Contact = {
    id: string
    fullName: string
    companyId: string
    platformName: Platform
    tags?: ServerTag[]
    lastActivity: string
    joinDate: string
    sessionCount: number
    avatar?: string
    userNameInPlatform ?: string
    phoneNumber ?: string
    note ?: string
}

export const availableTagThemes = [
    { id: 'emerald', class: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800', color: '#10b981' },
    { id: 'indigo', class: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800', color: '#6366f1' },
    { id: 'blue', class: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800', color: '#3b82f6' },
    { id: 'rose', class: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 border-rose-200 dark:border-rose-800', color: '#f43f5e' },
    { id: 'amber', class: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800', color: '#f59e0b' },
    { id: 'purple', class: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-800', color: '#a855f7' },
    { id: 'gray', class: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700', color: '#6b7280' },
]

