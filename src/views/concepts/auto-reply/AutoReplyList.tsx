import { useState, useEffect, useRef, Fragment } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import Tag from '@/components/ui/Tag'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import Card from '@/components/ui/Card'
import { TbMessageBolt } from 'react-icons/tb'
import {
    FaRobot,
    FaGlobe,
    FaTelegramPlane,
    FaInstagram,
    FaWhatsapp,
    FaImage,
    FaVideo,
    FaFileAlt
} from 'react-icons/fa'
import {
    HiOutlineSearch,
    HiPlus,
    HiOutlinePencil,
    HiOutlineTrash,
    HiExclamation,
    HiOutlineChatAlt2,
    HiOutlineLightningBolt,
    HiOutlineTrendingUp,
    HiX,
    HiChevronUp,
    HiChevronDown,
    HiOutlineRefresh
} from 'react-icons/hi'
import { PiLightning } from 'react-icons/pi'
import { apiGetAutoReplies, apiDeleteAutoReply, apiToggleAutoReply } from '@/services/autoReplyService'
import { useSessionUser } from '@/store/authStore'

export interface AutoReplyListDto {
    id: string;
    name?: string;
    title?: string;
    priority: number;
    matchCount: number;
    isActive: boolean;
    triggersCount: number;
    responsesCount: number;
    botId?: string | null;
    botName?: string;
    botPlatform?: string;
    triggers?: { id: string; value: string; matchType: number }[];
    responses?: { id: string; content: string; replyType: number }[];
}

const BaleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 999.72" width="1em" height="1em" preserveAspectRatio="xMidYMid meet" {...props}>
        <defs>
            <linearGradient id="bale-gradient" x1="800.4" y1="93.39" x2="93.57" y2="800.23" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#46ce9e" />
                <stop offset="1" stopColor="#2a8365" />
            </linearGradient>
        </defs>
        <g id="File"><g>
            <path d="M1010.36,547.36c-.73,17.77-2.6,36-6.85,53.41-1.54,16.48-6.36,32.54-10.76,48.52-5.14,19.5-12.48,38.33-19.9,57.17-6.77,15.66-14.35,30.91-22.26,46.08C942.92,766,934.93,779.2,926.29,792q-14.32,21-30.5,40.45c-11.18,13.13-22.68,26.09-35.15,37.92a503.68,503.68,0,0,1-51.3,43.55,453.44,453.44,0,0,1-48.44,31.56C742.06,956.74,722.16,966,702,974.6a548,548,0,0,1-65.89,21.86c-19.49,4.32-39,9.21-58.88,10.76-37,5.71-74.86,5.79-112.13,2.2-33.6-2.61-66.87-9.78-99.25-19.32l-.08-.58C210.19,944.18,82.32,816.07,34.94,661.2c-10.36-33.35-17.62-67.93-20.31-102.83-3.83-33.85-2-68-2.2-102q-.37-40.74-.08-81.64-.26-41.83,0-83.83c-.17-24-.08-47.95-.08-71.93s-.17-48.19.16-72.25c-.33-23.82-.08-47.63-.16-71.44-1.64-17.94,4.24-36.7,17.86-48.85C44.48,13.44,65.68,8.55,84,14.91c11.09,3.75,20.71,10.6,30.58,16.72,36,23.4,70.54,48.85,104.71,74.78a86.74,86.74,0,0,0,10.68-6.77A426.86,426.86,0,0,1,272.58,73.3a483.59,483.59,0,0,1,45.75-22.1c16.39-6.85,33.19-12.8,50.15-18.1,18.1-5,36.29-10.11,55-12.72a392.65,392.65,0,0,1,61.82-7.26,451.46,451.46,0,0,1,76.41,1.71A413.36,413.36,0,0,1,619,24c128.53,27,244.08,108.3,314.46,219a493,493,0,0,1,66.47,159.76c4.73,20.95,8.48,42.32,9.7,63.77A411.89,411.89,0,0,1,1010.36,547.36Z" transform="translate(-12 -12.14)" fill="url(#bale-gradient)" />
            <path d="M705.69,273.2a107.59,107.59,0,0,1,62.37,1.3c25.62,9.82,46.29,29.94,57.5,54.9,8.34,22.86,9.31,48.42.91,71.44-6.06,16.2-16.76,30.09-29.4,41.74q-16.7,16.49-33.21,33.14c-11.79,11.79-23.64,23.5-35.33,35.35-11.3,11.28-22.62,22.49-33.85,33.81-12.32,12.34-24.68,24.61-36.95,37-14,14-28.06,27.94-42,42-13.24,13.29-26.55,26.49-39.8,39.78s-26.77,26.71-40.1,40.11c-12.27,11.85-23.51,24.94-37.35,35.06a106.69,106.69,0,0,1-57.95,16C417,753.28,393.79,744,376.87,727.33q-78.53-78.44-157-156.94c-12.82-12.66-21.38-29.07-26-46.38-4.75-23.86-1.94-49.51,10.31-70.75,9.37-16.54,23.79-29.65,40.19-39a107.52,107.52,0,0,1,57.86-9.73c21.38,3.21,42,13,56.91,28.76Q401.7,476,444.37,518.5c8.63-8.18,16.9-16.73,25.19-25.27q18-17.31,35.24-35.35c11.36-10.68,22.33-21.82,33.07-33.12,7.74-6.88,14.75-14.51,22.07-21.8,12-11.68,23.75-23.59,35.49-35.51,11.21-10.83,22.11-21.95,33.07-33,11.79-11.5,23.28-23.28,35-34.87a105.75,105.75,0,0,1,42.21-26.37Z" transform="translate(-12 -12.14)" fill="#fff" />
        </g></g>
    </svg>
);

const AutoReplyList = () => {
    const navigate = useNavigate()
    const { user } = useSessionUser()

    // States
    const [rules, setRules] = useState<AutoReplyListDto[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [searchText, setSearchText] = useState('')
    const [isSearchOpen, setIsSearchOpen] = useState(false)
    const searchInputRef = useRef<HTMLInputElement>(null)

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [selectedRule, setSelectedRule] = useState<AutoReplyListDto | null>(null)
    const [togglingId, setTogglingId] = useState<string | null>(null)

    const [expandedRowId, setExpandedRowId] = useState<string | null>(null)
    const [expandedType, setExpandedType] = useState<'triggers' | 'responses' | null>(null)

    const [selectedPlatform, setSelectedPlatform] = useState<string>('All')

    // Fetch Data with Minimum Loading Time for UX
    const fetchRules = async () => {
        if (!user || !user.companyId) return;

        setIsLoading(true)
        try {
            const currentCompanyId = user.companyId
            const result: any = await apiGetAutoReplies({ CompanyId: currentCompanyId })
            setRules(result || [])
        } catch (error: any) {
            toast.push(<Notification title="خطا" type="danger">مشکلی در ارتباط با سرور پیش آمد.</Notification>, { placement: 'top-center' })
        } finally {
            setIsLoading(false)
        }

    }

    useEffect(() => {
        fetchRules()
    }, [user?.companyId])

    const filteredRules = rules.filter(rule => {
        // ۱. بررسی جستجوی متنی
        let matchesSearch = true;
        if (searchText) {
            const searchLower = searchText.toLowerCase();
            const targetName = (rule.name || rule.title || '').toLowerCase();
            const hasKeyword = rule.triggers?.some(t => t.value.toLowerCase().includes(searchLower));
            matchesSearch = targetName.includes(searchLower) || !!hasKeyword;
        }

        // ۲. بررسی فیلتر پلتفرم
        let matchesPlatform = true;
        if (selectedPlatform !== 'All') {
            if (selectedPlatform === 'Global') {
                matchesPlatform = !rule.botId;
            } else {
                matchesPlatform = rule.botPlatform?.includes(selectedPlatform) ?? false;
            }
        }

        return matchesSearch && matchesPlatform;
    });

    const handleDeleteConfirm = async () => {
        if (!selectedRule) return
        setIsDeleting(true)
        try {
            await apiDeleteAutoReply(selectedRule.id)
            setRules(rules.filter(r => r.id !== selectedRule.id))
            toast.push(<Notification title="موفقیت" type="success">قانون با موفقیت حذف شد.</Notification>, { placement: 'top-center' })
            setIsDeleteDialogOpen(false)
            setSelectedRule(null)
        } catch {
            toast.push(<Notification title="خطا" type="danger">خطا در حذف قانون.</Notification>, { placement: 'top-center' })
        } finally {
            setIsDeleting(false)
        }
    }

    const handleToggleStatus = async (ruleId: string, currentStatus: boolean) => {
        if (togglingId) return;
        setTogglingId(ruleId);

        try {
            await apiToggleAutoReply(ruleId);
            setRules(rules.map(r => r.id === ruleId ? { ...r, isActive: !currentStatus } : r));
            toast.push(
                <Notification title="موفقیت" type="success">
                    {currentStatus ? 'قانون غیرفعال شد.' : 'قانون فعال شد.'}
                </Notification>,
                { placement: 'top-center' }
            );
        } catch (error) {
            toast.push(<Notification title="خطا" type="danger">تغییر وضعیت انجام نشد.</Notification>, { placement: 'top-center' });
        } finally {
            setTogglingId(null);
        }
    }

    const toggleExpand = (ruleId: string, type: 'triggers' | 'responses') => {
        if (expandedRowId === ruleId && expandedType === type) {
            setExpandedRowId(null)
            setExpandedType(null)
        } else {
            setExpandedRowId(ruleId)
            setExpandedType(type)
        }
    }

    const getPlatformInfo = (platform?: string) => {
        if (!platform) return { icon: FaGlobe, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/30' };
        if (platform.includes('Telegram')) return { icon: FaTelegramPlane, color: 'text-sky-500', bg: 'bg-sky-50 dark:bg-sky-900/30' };
        if (platform.includes('Instagram')) return { icon: FaInstagram, color: 'text-pink-600', bg: 'bg-pink-50 dark:bg-pink-900/30' };
        if (platform.includes('WhatsApp')) return { icon: FaWhatsapp, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/30' };
        if (platform.includes('Bale')) return { icon: BaleIcon, color: '', bg: 'bg-emerald-50 dark:bg-emerald-900/30' };
        return { icon: FaRobot, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/30' };
    }

    const renderExpandedContent = (rule: AutoReplyListDto) => (
        <div className="p-4 md:p-6 bg-gray-50/50 dark:bg-gray-800/30 shadow-inner rounded-b-xl md:rounded-none animate-[fadeSlideDown_0.2s_ease-out_forwards]">
            {expandedType === 'triggers' && (
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500 border-b border-gray-200 dark:border-gray-700 pb-2">
                        <HiOutlineLightningBolt className="text-lg" />
                        <h4 className="font-bold text-sm">لیست کلمات کلیدی این قانون</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {rule.triggers && rule.triggers.length > 0 ? (
                            rule.triggers.map(t => (
                                <div key={t.id} className="flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 pl-2 pr-3 py-1.5 rounded-xl shadow-sm">
                                    <span className="text-gray-800 dark:text-gray-200 text-sm font-medium">{t.value}</span>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${t.matchType === 1 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'}`}>
                                        {t.matchType === 1 ? 'دقیق' : 'شامل'}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <span className="text-sm text-gray-400">کلمه‌ای یافت نشد.</span>
                        )}
                    </div>
                </div>
            )}

            {expandedType === 'responses' && (
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-500 border-b border-gray-200 dark:border-gray-700 pb-2">
                        <HiOutlineChatAlt2 className="text-lg" />
                        <h4 className="font-bold text-sm">پیام‌های ارسال‌شونده</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {rule.responses && rule.responses.length > 0 ? (
                            rule.responses.map((res, index) => (
                                <div key={res.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-3 rounded-xl flex items-start gap-3 shadow-sm">
                                    <div className="mt-1 flex-shrink-0 text-gray-400">
                                        {res.replyType === 1 && <HiOutlineChatAlt2 className="text-lg" />}
                                        {res.replyType === 2 && <FaImage className="text-lg" />}
                                        {res.replyType === 3 && <FaVideo className="text-lg" />}
                                        {res.replyType === 4 && <FaFileAlt className="text-lg" />}
                                    </div>
                                    <div className="flex flex-col flex-1 overflow-hidden">
                                        <span className="text-[10px] text-gray-400 font-bold mb-1 border-b border-gray-100 dark:border-gray-800 pb-1 w-full">پیام {index + 1}</span>
                                        {res.replyType === 1 ? (
                                            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{res.content}</p>
                                        ) : (
                                            <a href={res.content} target="_blank" rel="noreferrer" className="text-sm text-blue-500 hover:underline truncate w-full block" dir="ltr">مشاهده فایل پیوست</a>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <span className="text-sm text-gray-400">پیامی یافت نشد.</span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div className="flex flex-col gap-4 h-full">
            <Card className="flex-1 shadow-sm border-0 rounded-2xl overflow-hidden flex flex-col min-h-0">
                {/* ========================================== */}
                {/* 🎯 هدر ریسپانسیو (طراحی App-Like برای موبایل) */}
                {/* ========================================== */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 md:mb-8">
                    <div className="flex items-center justify-center sm:justify-start gap-3 md:gap-4 w-full sm:w-auto text-right">
                        <div className="w-12 h-12 md:w-14 md:h-14 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center rounded-xl flex-shrink-0">
                            <TbMessageBolt className="text-[26px]" />
                        </div>
                        <div className="flex flex-col">
                            <h3 className="text-lg md:text-2xl font-extrabold text-gray-800 dark:text-gray-100">
                                قوانین پاسخ‌دهی
                            </h3>
                            <p className="text-[11px] md:text-sm text-gray-500 mt-0.5">
                                مدیریت واکنش‌های خودکار ربات‌ها
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">

                        <div className="flex items-center justify-end gap-2 w-full md:w-auto">

                            {/* 🔍 کانتینر سرچ‌بار */}
                            <div
                                className={`relative flex items-center transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] h-11 ${isSearchOpen || searchText
                                    ? 'flex-1 md:flex-none md:w-[28rem] bg-white dark:bg-gray-800 rounded-xl border-indigo-500 shadow-indigo-100 dark:shadow-indigo-900/20 shadow-md'
                                    : 'w-11 bg-gray-50 dark:bg-gray-900/40 rounded-full border-transparent hover:border-indigo-300 dark:hover:border-indigo-500 shadow-sm cursor-pointer'
                                    } border`}
                                onClick={() => {
                                    if (!isSearchOpen && !searchText) {
                                        setIsSearchOpen(true);
                                        setTimeout(() => searchInputRef.current?.focus(), 50);
                                    }
                                }}
                            >
                                <div className={`absolute right-0 w-11 h-11 flex items-center justify-center transition-transform duration-500 ${isSearchOpen || searchText ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 hover:scale-110'}`}>
                                    <HiOutlineSearch className="text-xl" />
                                </div>

                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    placeholder="جستجو در عنوان یا کلمات کلیدی..."
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                    onBlur={() => {
                                        if (!searchText) setIsSearchOpen(false);
                                    }}
                                    className={`w-full h-full bg-transparent outline-none pr-12 pl-10 transition-all duration-500 text-gray-800 dark:text-gray-100 text-[15px] md:text-base ${isSearchOpen || searchText ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                                        }`}
                                />

                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSearchText('');
                                        setIsSearchOpen(false);
                                    }}
                                    className={`absolute left-2 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-300 ${isSearchOpen || searchText ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-50 invisible'}`}
                                    title="بستن جستجو"
                                >
                                    <HiX className="text-base" />
                                </button>
                            </div>

                            {/* 🔄 دکمه رفرش */}
                            <button
                                type="button"
                                onClick={fetchRules}
                                disabled={isLoading}
                                className="flex-shrink-0 w-11 h-11 flex items-center justify-center rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 hover:border-indigo-300 dark:hover:border-indigo-600 shadow-sm transition-all duration-300 active:scale-95 disabled:opacity-50"
                                title="به‌روزرسانی لیست"
                            >
                                <HiOutlineRefresh className={`text-xl ${isLoading ? 'animate-spin text-indigo-500' : ''}`} />
                            </button>
                        </div>

                        <div className="w-full sm:w-auto flex justify-center sm:justify-end">
                            <Button
                                variant="solid"
                                className="w-full sm:w-auto"
                                onClick={() => navigate('/concepts/auto-reply/create')}
                            >
                                + قانون جدید
                            </Button>
                        </div>
                    </div>
                </div>
                {/* ========================================== */}
                {/* 🎛️ نوار فیلتر پلتفرم‌ها (App-Like & Touch Optimized) */}
                {/* ========================================== */}
                <div className="mb-4 md:mb-6 -mt-1 md:-mt-2">
                    {/* 🌟 جادوی موبایل: استفاده از margin منفی برای کشیده شدن تا لبه صفحه و snap برای اسکرول نرم */}
                    <div className="flex items-center gap-2.5 overflow-x-auto pb-4 pt-1 px-1 md:px-0 -mx-4 md:mx-0 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

                        {/* 🌟 فاصله دهنده اولیه برای موبایل که اسکرول از لبه صفحه شروع بشه */}
                        <div className="w-1 md:hidden flex-shrink-0"></div>

                        {/* دکمه "همه" */}
                        <button
                            onClick={() => setSelectedPlatform('All')}
                            className={`flex items-center justify-center h-10 px-5 rounded-xl text-sm font-bold transition-all whitespace-nowrap flex-shrink-0 snap-start border ${selectedPlatform === 'All'
                                ? 'bg-gray-800 text-white border-transparent dark:bg-gray-100 dark:text-gray-900 shadow-md'
                                : 'bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
                                }`}
                        >
                            همه قوانین
                        </button>

                        {/* دکمه "سراسری" */}
                        {/* <button
                            onClick={() => setSelectedPlatform('Global')}
                            className={`flex items-center justify-center gap-2 h-10 px-4 rounded-xl text-sm font-bold transition-all whitespace-nowrap flex-shrink-0 snap-start border ${selectedPlatform === 'Global'
                                    ? 'bg-emerald-500 text-white border-transparent shadow-md shadow-emerald-500/20'
                                    : 'bg-emerald-50/50 dark:bg-emerald-900/10 text-gray-600 dark:text-gray-300 border-emerald-100 dark:border-emerald-800/30 hover:bg-emerald-50 dark:hover:bg-emerald-900/30'
                                }`}
                        >
                            <FaGlobe className={`text-lg ${selectedPlatform === 'Global' ? 'text-white' : 'text-emerald-500'}`} />
                            سراسری
                        </button> */}

                        {/* دکمه "تلگرام" */}
                        <button
                            onClick={() => setSelectedPlatform('Telegram')}
                            className={`flex items-center justify-center gap-2 h-10 px-4 rounded-xl text-sm font-bold transition-all whitespace-nowrap flex-shrink-0 snap-start border ${selectedPlatform === 'Telegram'
                                ? 'bg-sky-500 text-white border-transparent shadow-md shadow-sky-500/20'
                                : 'bg-sky-50/50 dark:bg-sky-900/10 text-gray-600 dark:text-gray-300 border-sky-100 dark:border-sky-800/30 hover:bg-sky-50 dark:hover:bg-sky-900/30'
                                }`}
                        >
                            <FaTelegramPlane className={`text-lg ${selectedPlatform === 'Telegram' ? 'text-white' : 'text-sky-500'}`} />
                            تلگرام
                        </button>

                        {/* دکمه "اینستاگرام" */}
                        <button
                            onClick={() => setSelectedPlatform('Instagram')}
                            className={`flex items-center justify-center gap-2 h-10 px-4 rounded-xl text-sm font-bold transition-all whitespace-nowrap flex-shrink-0 snap-start border ${selectedPlatform === 'Instagram'
                                ? 'bg-pink-600 text-white border-transparent shadow-md shadow-pink-600/20'
                                : 'bg-pink-50/50 dark:bg-pink-900/10 text-gray-600 dark:text-gray-300 border-pink-100 dark:border-pink-800/30 hover:bg-pink-50 dark:hover:bg-pink-900/30'
                                }`}
                        >
                            <FaInstagram className={`text-lg ${selectedPlatform === 'Instagram' ? 'text-white' : 'text-pink-600'}`} />
                            اینستاگرام
                        </button>

                        {/* دکمه "واتس‌اپ" */}
                        <button
                            onClick={() => setSelectedPlatform('WhatsApp')}
                            className={`flex items-center justify-center gap-2 h-10 px-4 rounded-xl text-sm font-bold transition-all whitespace-nowrap flex-shrink-0 snap-start border ${selectedPlatform === 'WhatsApp'
                                ? 'bg-green-500 text-white border-transparent shadow-md shadow-green-500/20'
                                : 'bg-green-50/50 dark:bg-green-900/10 text-gray-600 dark:text-gray-300 border-green-100 dark:border-green-800/30 hover:bg-green-50 dark:hover:bg-green-900/30'
                                }`}
                        >
                            <FaWhatsapp className={`text-lg ${selectedPlatform === 'WhatsApp' ? 'text-white' : 'text-green-500'}`} />
                            واتس‌اپ
                        </button>

                        {/* دکمه "بله" */}
                        <button
                            onClick={() => setSelectedPlatform('Bale')}
                            className={`flex items-center justify-center gap-2 h-10 px-4 rounded-xl text-sm font-bold transition-all whitespace-nowrap flex-shrink-0 snap-start border ${selectedPlatform === 'Bale'
                                ? 'bg-emerald-500 text-white border-transparent shadow-md shadow-emerald-500/20'
                                : 'bg-emerald-50/50 dark:bg-emerald-900/10 text-gray-600 dark:text-gray-300 border-emerald-100 dark:border-emerald-800/30 hover:bg-emerald-50 dark:hover:bg-emerald-900/30'
                                }`}
                        >
                            <BaleIcon className={`text-xl transition-all ${selectedPlatform === 'Bale' ? '' : 'grayscale opacity-80'}`} />
                            بله
                        </button>

                        {/* 🌟 فاصله دهنده انتهایی برای موبایل */}
                        <div className="w-1 md:hidden flex-shrink-0"></div>

                    </div>
                </div>
                {/* ========================================== */}
                {/* 🖥️ بخش نمایش دسکتاپ (جدول کلاسیک و حرفه‌ای) */}
                {/* ========================================== */}
                <div className="hidden md:block overflow-y-auto max-h-[calc(100vh-340px)] rounded-b-2xl relative bg-white dark:bg-gray-900 shadow-sm 
    [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-gray-700 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-400 dark:hover:[&::-webkit-scrollbar-thumb]:bg-gray-600 [scrollbar-width:thin]">
                    <table className="w-full text-right border-collapse relative">
                        <thead className="sticky top-0 z-30">
                            <tr className="bg-gray-100 dark:bg-gray-800 shadow-[0_2px_4px_-1px_rgba(0,0,0,0.05)]">
                                <th className="py-3.5 px-4 text-[15px] font-bold text-gray-800 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700">عنوان قانون</th>
                                <th className="text-center py-3.5 px-4 text-[15px] font-bold text-gray-800 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700">کلمات کلیدی</th>
                                <th className="text-center py-3.5 px-4 text-[15px] font-bold text-gray-800 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700">محتوای پیام‌ها</th>
                                <th className="text-center py-3.5 px-4 text-[15px] font-bold text-gray-800 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700">کارکرد / اولویت</th>
                                <th className="py-3.5 px-4 text-[15px] font-bold text-gray-800 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700">ربات متصل</th>
                                <th className="text-center py-3.5 px-4 text-[15px] font-bold text-gray-800 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 w-48">عملیات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-16">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                            <span className="text-gray-500 font-medium">در حال دریافت قوانین...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredRules.length > 0 ? (
                                filteredRules.map((rule) => {
                                    const platInfo = getPlatformInfo(rule.botPlatform);
                                    const ruleTitle = rule.name || rule.title || 'بدون عنوان';
                                    const isExpanded = expandedRowId === rule.id;

                                    return (
                                        <Fragment key={rule.id}>
                                            <tr className={`transition-colors group border-b border-gray-100 dark:border-gray-800 ${isExpanded ? 'bg-gray-50/80 dark:bg-gray-800/50 relative z-10' : 'hover:bg-gray-50 dark:hover:bg-gray-800/60'}`}>
                                                <td className="py-3 px-4">
                                                    <div className="flex flex-col gap-1.5">
                                                        <span className={`font-bold text-[15px] ${isExpanded ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-800 dark:text-gray-100'}`}>
                                                            {ruleTitle}
                                                        </span>
                                                    </div>
                                                </td>

                                                <td className="text-center py-3 px-4">
                                                    <button onClick={() => toggleExpand(rule.id, 'triggers')} className="group relative outline-none">
                                                        <Tag className={`gap-1.5 cursor-pointer transition-all shadow-sm border ${isExpanded && expandedType === 'triggers' ? 'bg-amber-500 text-white border-amber-600' : 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-400'}`}>
                                                            <HiOutlineLightningBolt className="text-sm" />
                                                            <span className="font-bold">{rule.triggersCount}</span> کلمه
                                                            {isExpanded && expandedType === 'triggers' ? <HiChevronUp className="ml-1" /> : <HiChevronDown className="ml-1 opacity-50" />}
                                                        </Tag>
                                                    </button>
                                                </td>

                                                <td className="text-center py-3 px-4">
                                                    <button onClick={() => toggleExpand(rule.id, 'responses')} className="group relative outline-none">
                                                        <Tag className={`gap-1.5 cursor-pointer transition-all shadow-sm border ${isExpanded && expandedType === 'responses' ? 'bg-blue-500 text-white border-blue-600' : 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400'}`}>
                                                            <HiOutlineChatAlt2 className="text-sm" />
                                                            <span className="font-bold">{rule.responsesCount}</span> پیام
                                                            {isExpanded && expandedType === 'responses' ? <HiChevronUp className="ml-1" /> : <HiChevronDown className="ml-1 opacity-50" />}
                                                        </Tag>
                                                    </button>
                                                </td>

                                                <td className="text-center py-3 px-4">
                                                    <div className="flex flex-col items-center gap-1 text-xs">
                                                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md w-max">
                                                            <span className="opacity-70">اولویت:</span> <span className="font-bold">{rule.priority}</span>
                                                        </div>
                                                        {rule.matchCount > 0 && <div className="text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1"><HiOutlineTrendingUp /> {rule.matchCount} بار استفاده</div>}
                                                    </div>
                                                </td>

                                                <td className="py-3 px-4">
                                                    {rule.botId ? (
                                                        <Tag className={`${platInfo.bg} ${platInfo.color} border-0 flex items-center gap-1.5 max-w-[150px]`}>
                                                            <platInfo.icon className="text-sm flex-shrink-0" />
                                                            <span className="truncate" title={rule.botName}>{rule.botName || 'مختص یک ربات'}</span>
                                                        </Tag>
                                                    ) : (
                                                        <Tag className="bg-emerald-50 text-emerald-600 border-0 dark:bg-emerald-900/30 dark:text-emerald-400 flex items-center gap-1">
                                                            <FaGlobe /> سراسری
                                                        </Tag>
                                                    )}
                                                </td>

                                                <td className="py-3 px-4">
                                                    <div className="flex items-center justify-center gap-3">
                                                        <button type="button" onClick={() => handleToggleStatus(rule.id, rule.isActive)} disabled={togglingId === rule.id} className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none disabled:opacity-60 disabled:cursor-wait shadow-inner ${rule.isActive ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'}`} dir="ltr" title={rule.isActive ? 'غیرفعال کردن' : 'فعال‌سازی'}>
                                                            <span className={`pointer-events-none flex h-5 w-5 transform items-center justify-center rounded-full bg-white shadow-md ring-0 transition duration-300 ease-in-out ${rule.isActive ? 'translate-x-5' : 'translate-x-0'}`}>
                                                                {togglingId === rule.id && <div className={`w-3 h-3 border-2 border-t-transparent rounded-full animate-spin ${rule.isActive ? 'border-emerald-500' : 'border-gray-400'}`}></div>}
                                                            </span>
                                                        </button>
                                                        <div className="w-[1px] h-5 bg-gray-200 dark:bg-gray-700"></div>
                                                        <div className="flex items-center gap-1">
                                                            <button className="text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 p-2 rounded-lg transition-all flex items-center justify-center" onClick={() => navigate(`/concepts/auto-reply/edit/${rule.id}`, { state: { botPlatform: rule.botPlatform, botName: rule.botName } })} title="ویرایش"><HiOutlinePencil className="text-[1.2rem]" /></button>
                                                            <button className="text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 p-2 rounded-lg transition-all flex items-center justify-center" onClick={() => { setSelectedRule(rule); setIsDeleteDialogOpen(true) }} title="حذف"><HiOutlineTrash className="text-[1.2rem]" /></button>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>

                                            {/* نمایش بخش بازشونده در دسکتاپ */}
                                            {isExpanded && (
                                                <tr className="bg-gray-50/50 dark:bg-gray-800/30">
                                                    <td colSpan={6} className="p-0 border-b-2 border-indigo-200 dark:border-indigo-800">
                                                        {renderExpandedContent(rule)}
                                                    </td>
                                                </tr>
                                            )}
                                        </Fragment>
                                    )
                                })
                            ) : (
                                <tr>
                                    <td colSpan={6} className="text-center py-16 text-gray-500">
                                        هیچ قانون پاسخ خودکاری یافت نشد. همین الان برای ایجاد اولین قانون اقدام کنید.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* ========================================== */}
                {/* 📱 بخش نمایش موبایل (کارت‌های اپلیکیشنی مدرن) */}
                {/* ========================================== */}
                <div className="md:hidden flex flex-col gap-4 pb-6 overflow-y-auto max-h-[calc(100vh-320px)] px-1">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-3 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-gray-500 font-medium">در حال بارگذاری اطلاعات...</span>
                        </div>
                    ) : filteredRules.length > 0 ? (
                        filteredRules.map((rule) => {
                            const platInfo = getPlatformInfo(rule.botPlatform);
                            const ruleTitle = rule.name || rule.title || 'بدون عنوان';
                            const isExpanded = expandedRowId === rule.id;

                            return (
                                <div key={rule.id} className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm border ${rule.isActive ? 'border-gray-200 dark:border-gray-700' : 'border-gray-100 dark:border-gray-800 opacity-80'} flex flex-col relative transition-all`}>
                                    <div className={`absolute right-0 top-0 bottom-0 w-1 rounded-r-2xl ${rule.isActive ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>

                                    <div className="p-4 flex flex-col gap-4">
                                        <div className="flex items-start justify-between pl-1 pr-3">
                                            <div className="flex flex-col gap-1.5">
                                                <span className={`font-extrabold text-base ${rule.isActive ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                                                    {ruleTitle}
                                                </span>
                                                <div className="flex items-center gap-2 flex-wrap mt-1">
                                                    {rule.botId ? (
                                                        <Tag className={`${platInfo.bg} ${platInfo.color} border-0 flex items-center gap-1 text-xs px-2 py-0.5`}>
                                                            <platInfo.icon /> <span className="truncate max-w-[100px]">{rule.botName}</span>
                                                        </Tag>
                                                    ) : (
                                                        <Tag className="bg-emerald-50 text-emerald-600 border-0 dark:bg-emerald-900/30 dark:text-emerald-400 flex items-center gap-1 text-xs px-2 py-0.5">
                                                            <FaGlobe /> سراسری
                                                        </Tag>
                                                    )}
                                                    <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">
                                                        اولویت: {rule.priority}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 mt-1">
                                            <button onClick={() => toggleExpand(rule.id, 'triggers')} className="flex-1">
                                                <Tag className={`w-full justify-center gap-1.5 cursor-pointer transition-all border ${isExpanded && expandedType === 'triggers' ? 'bg-amber-500 text-white border-amber-600' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>
                                                    <HiOutlineLightningBolt /> {rule.triggersCount} کلمه
                                                </Tag>
                                            </button>
                                            <button onClick={() => toggleExpand(rule.id, 'responses')} className="flex-1">
                                                <Tag className={`w-full justify-center gap-1.5 cursor-pointer transition-all border ${isExpanded && expandedType === 'responses' ? 'bg-blue-500 text-white border-blue-600' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>
                                                    <HiOutlineChatAlt2 /> {rule.responsesCount} پیام
                                                </Tag>
                                            </button>
                                        </div>
                                    </div>

                                    {/* نمایش بخش بازشونده در موبایل */}
                                    {isExpanded && renderExpandedContent(rule)}

                                    {/* فوتر اکشن‌ها در موبایل */}
                                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-b-2xl p-3 flex items-center justify-between border-t border-gray-100 dark:border-gray-800 mx-px mb-px">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-gray-600 dark:text-gray-400 mr-1">وضعیت:</span>
                                            <button type="button" onClick={() => handleToggleStatus(rule.id, rule.isActive)} disabled={togglingId === rule.id} className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none shadow-inner ${rule.isActive ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'}`} dir="ltr">
                                                <span className={`pointer-events-none flex h-5 w-5 transform items-center justify-center rounded-full bg-white shadow-md ring-0 transition duration-300 ease-in-out ${rule.isActive ? 'translate-x-5' : 'translate-x-0'}`}>
                                                    {togglingId === rule.id && <div className={`w-3 h-3 border-2 border-t-transparent rounded-full animate-spin ${rule.isActive ? 'border-emerald-500' : 'border-gray-400'}`}></div>}
                                                </span>
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm active:scale-95 transition-all" onClick={() => navigate(`/concepts/auto-reply/edit/${rule.id}`, { state: { botPlatform: rule.botPlatform, botName: rule.botName } })}>
                                                <HiOutlinePencil className="text-lg" />
                                            </button>
                                            <button className="flex items-center justify-center w-8 h-8 rounded-lg text-red-500 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm active:scale-95 transition-all" onClick={() => { setSelectedRule(rule); setIsDeleteDialogOpen(true) }}>
                                                <HiOutlineTrash className="text-lg" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    ) : (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 border border-gray-100 dark:border-gray-700 shadow-sm">
                            <div className="w-16 h-16 bg-gray-50 dark:bg-gray-900/50 rounded-full flex items-center justify-center mb-2"><PiLightning className="text-3xl text-gray-300 dark:text-gray-600" /></div>
                            <span className="font-bold text-lg text-gray-700 dark:text-gray-300">قانونی یافت نشد</span>
                        </div>
                    )}
                </div>
            </Card>

            <Dialog isOpen={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)} closable={!isDeleting} contentClassName="pb-0">
                <div className="flex flex-col gap-4 mt-8">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/30 text-red-600 flex items-center justify-center flex-shrink-0">
                            <HiExclamation className="text-2xl" />
                        </div>
                        <div className="flex-1 mt-1">
                            <h5 className="text-lg font-bold mb-2">حذف پاسخ خودکار</h5>
                            <p className="text-sm text-gray-500 leading-relaxed">آیا از حذف این قانون مطمئن هستید؟ این عمل غیرقابل بازگشت است.</p>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-6 pt-5 pb-6 border-t border-gray-100 dark:border-gray-800">
                        <Button type="button" disabled={isDeleting} onClick={() => setIsDeleteDialogOpen(false)}>انصراف</Button>
                        <Button loading={isDeleting} variant="solid" className="bg-red-600 hover:bg-red-500 border-0 text-white" onClick={handleDeleteConfirm}>بله، حذف شود</Button>
                    </div>
                </div>
            </Dialog>

            <style>{`
                @keyframes fadeSlideDown { 
                    0% { opacity: 0; transform: translateY(-10px); } 
                    100% { opacity: 1; transform: translateY(0); } 
                }
            `}</style>
        </div>
    )
}

export default AutoReplyList