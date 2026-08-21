import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
    HiOutlineArrowRight, 
    HiOutlineChartPie, 
    HiOutlineCheckCircle, 
    HiOutlineXCircle, 
    HiOutlineClock,
    HiOutlineRefresh,
    HiOutlineChatAlt2,
    HiOutlinePause,
    HiOutlinePlay
} from 'react-icons/hi'
import Button from '@/components/ui/Button'
import Table from '@/components/ui/Table'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { apiGetCampaignReport, apiRetryFailedMessages } from '@/services/CampaignService'

const { Tr, Th, Td, THead, TBody } = Table

enum CampaignMessageStatus {
    Pending = 1,
    Processing = 2,
    Sent = 3,
    Failed = 4
}

enum CampaignOverallStatus {
    Draft = 1,
    Scheduled = 2,
    InProgress = 3,
    Completed = 4,
    Paused = 5,
    Canceled = 6,
    Retrying = 7
}

type CampaignMessageDto = {
    id: string;
    contactName: string;
    phoneNumber: string;
    status: CampaignMessageStatus;
    retryCount: number;
    errorMessage?: string;
    sentAt?: string;
}


const CampaignReport = () => {
    const { campaignId } = useParams<{ campaignId: string }>()
    const navigate = useNavigate()

    const [isLoading, setIsLoading] = useState(true)
    const [isRetrying, setIsRetrying] = useState(false)
    const [messages, setMessages] = useState<CampaignMessageDto[]>([])
    const [campaignName, setCampaignName] = useState<string>('گزارش زنده کمپین')
    const [refreshTrigger, setRefreshTrigger] = useState(0)
    const [campaignStatus, setCampaignStatus] = useState<CampaignOverallStatus | null>(null)
    
    const [activeTab, setActiveTab] = useState<'all' | 'failed'>('all')

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;
        let isMounted = true; // برای جلوگیری از آپدیت استیت وقتی کاربر از صفحه خارج شده
        debugger
        const fetchReport = async (isBackground = false) => {
            debugger
            if (!campaignId) return;
            
            if (!isBackground) setIsLoading(true);
            
            try {
                const response: any = await apiGetCampaignReport(campaignId);
                const fetchedMessages: CampaignMessageDto[] = response?.data?.messages || [];
                const currentStatus = response?.data?.status;
                
                if (isMounted) {
                    setMessages(fetchedMessages);
                    setCampaignStatus(currentStatus);
                    setCampaignName(response?.data?.campaignName || 'گزارش زنده کمپین');

                    // 🌟 1. بررسی اینکه آیا پیامی برای ارسال باقی مانده است؟ (Pending یا Processing)
                    const hasUnresolvedMessages = fetchedMessages.some(
                        m => m.status === CampaignMessageStatus.Pending || m.status === CampaignMessageStatus.Processing
                    );

                    // 🌟 2. منطق هوشمند توقف یا ادامه رفرش
                    const isScheduled = currentStatus === CampaignOverallStatus.Scheduled;
                    const isInProgress = currentStatus === CampaignOverallStatus.InProgress;
                    const isRetrying = currentStatus === CampaignOverallStatus.Retrying;

                    // فقط در این دو حالت رفرش می‌کنیم:
                    // حالت الف: کمپین زمان‌بندی شده (هنوز شروع نشده پس منتظریم)
                    // حالت ب: کمپین در حال اجراست وَ هنوز پیامی در صف وجود دارد
                    if (isScheduled || ((isInProgress|| isRetrying) && hasUnresolvedMessages)) {
                        timeoutId = setTimeout(() => fetchReport(true), 10000);
                    }
                }
            } catch (error) {
                console.error("خطا در دریافت گزارش:", error);
            } finally {
                if (isMounted && !isBackground) setIsLoading(false);
            }
        }
        
        fetchReport(false);

        return () => {
            isMounted = false;
            if (timeoutId) clearTimeout(timeoutId);
        }
    }, [campaignId, refreshTrigger])

    const stats = useMemo(() => {
        const total = messages.length;
        const sent = messages.filter(m => m.status === CampaignMessageStatus.Sent).length;
        const failed = messages.filter(m => m.status === CampaignMessageStatus.Failed).length;
        const pending = messages.filter(m => m.status === CampaignMessageStatus.Pending || m.status === CampaignMessageStatus.Processing).length;
        
        const completed = sent + failed;
        const progressPercentage = total === 0 ? 0 : Math.round((completed / total) * 100);

        return { total, sent, failed, pending, progressPercentage };
    }, [messages])

    const tableData = useMemo(() => {
        if (activeTab === 'failed') return messages.filter(m => m.status === CampaignMessageStatus.Failed)
        return messages
    }, [messages, activeTab])

    const handleRetryFailed = async () => {
        if (!campaignId) return;
        
        setIsRetrying(true)
        try {
            await apiRetryFailedMessages(campaignId);
            
            toast.push(<Notification type="success" title="عملیات موفق">پیام‌های خطا خورده به صف انتظار برگشتند.</Notification>, { placement: 'top-center' })
            
            setMessages(prev => prev.map(m => m.status === CampaignMessageStatus.Failed ? { ...m, status: CampaignMessageStatus.Pending, errorMessage: undefined } : m))
            setActiveTab('all')
            
            if (campaignStatus === CampaignOverallStatus.Paused || campaignStatus === CampaignOverallStatus.Completed || campaignStatus === CampaignOverallStatus.Canceled) {
                setCampaignStatus(CampaignOverallStatus.Retrying);
            }
            setRefreshTrigger(prev => prev + 1)
            
        } catch (error: any) {
            toast.push(
                <Notification type="danger" title="خطا">
                    {error?.response?.data?.Message || "بازگردانی پیام‌ها به صف با مشکل مواجه شد."}
                </Notification>, 
                { placement: 'top-center' }
            );
        } finally {
            setIsRetrying(false)
        }
    }

    // 🌟 رندر وضعیت کلی کمپین (تگ بالای صفحه)
    const renderCampaignStatusBadge = () => {
        switch (campaignStatus) {
            case CampaignOverallStatus.Retrying:
                return (
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800 shadow-[0_0_10px_rgba(59,130,246,0.3)]">
                        <HiOutlineRefresh className="animate-spin text-base" /> 
                        در حال تلاش مجدد...
                    </span>
                );
                case CampaignOverallStatus.InProgress:
                return <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 animate-pulse"><HiOutlinePlay /> در حال اجرا</span>
            case CampaignOverallStatus.Paused:
                return <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"><HiOutlinePause /> متوقف شده</span>
            case CampaignOverallStatus.Completed:
                return <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"><HiOutlineCheckCircle /> پایان یافته</span>
            case CampaignOverallStatus.Canceled:
                return <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300"><HiOutlineXCircle /> لغو شده</span>
            case CampaignOverallStatus.Scheduled:
                return <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300"><HiOutlineClock /> زمان‌بندی شده</span>
            default:
                return null;
        }
    }

        const getHeaderTheme = () => {
        switch (campaignStatus) {
            case CampaignOverallStatus.Retrying: 
            case CampaignOverallStatus.InProgress:
                // بک‌گراند گرادیان آبی زنده با بوردر درخشان
                return "bg-gradient-to-br from-blue-50/50 to-indigo-50/50 border-blue-200 dark:from-blue-900/10 dark:to-indigo-900/10 dark:border-blue-800 shadow-[0_0_15px_rgba(59,130,246,0.1)]";
                
            case CampaignOverallStatus.Completed:
                // بک‌گراند سبز ملایم
                return "bg-gradient-to-br from-emerald-50/50 to-teal-50/50 border-emerald-200 dark:from-emerald-900/10 dark:to-teal-900/10 dark:border-emerald-800";
                
            case CampaignOverallStatus.Paused:
                // تم هشدار نارنجی ملایم
                return "bg-gradient-to-br from-amber-50/50 to-orange-50/50 border-amber-200 dark:from-amber-900/10 dark:to-orange-900/10 dark:border-amber-800";
                
            case CampaignOverallStatus.Canceled:
                // حالت مرده (خاکستری و کدر)
                return "bg-gray-50 border-gray-200 grayscale-[0.8] opacity-80 dark:bg-gray-800 dark:border-gray-700";
                
            default:
                // حالت پیش‌فرض (زمان‌بندی شده یا درفت)
                return "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800";
        }
    }










    const renderStatusBadge = (status: CampaignMessageStatus) => {
        switch (status) {
            case CampaignMessageStatus.Pending: return <span className="text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs font-bold">در صف</span>
            case CampaignMessageStatus.Processing: return <span className="text-blue-500 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded text-xs font-bold animate-pulse">در حال ارسال...</span>
            case CampaignMessageStatus.Sent: return <span className="text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded text-xs font-bold">ارسال موفق</span>
            case CampaignMessageStatus.Failed: return <span className="text-red-500 bg-red-50 dark:bg-red-900/30 px-2 py-1 rounded text-xs font-bold">خطا</span>
            default: return null
        }
    }

    return (
        <div className="w-full max-w-5xl mx-auto pb-12 animate-[fadeIn_0.3s_ease-out]" dir="rtl">
            
            <button onClick={() => navigate('/concepts/CampaignList')} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-indigo-600 transition-colors mb-6">
                <HiOutlineArrowRight className="text-lg" /> بازگشت به لیست کمپین‌ها
            </button>

            <div className={`rounded-[2rem] shadow-sm border p-6 sm:p-10 flex flex-col gap-8 mb-8 transition-all duration-500 ${getHeaderTheme()}`}>                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-gray-100">
                                {campaignName}
                            </h2>
                            {renderCampaignStatusBadge()}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-500 font-medium mt-1">
                            <span className="flex items-center gap-1.5">
                                {(campaignStatus === CampaignOverallStatus.InProgress || campaignStatus === CampaignOverallStatus.Retrying) ? (
                                    <span className="relative flex w-2 h-2 ml-0.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full w-2 h-2 bg-emerald-500"></span>
                                    </span>
                                ) : (
                                    <HiOutlineChatAlt2 className="text-gray-400" />
                                )}
                                اطلاعات لحظه‌ای وضعیت ارسال
                            </span>
                        </div>
                    </div>
                    {stats.failed > 0 && (
                        <Button size="sm" variant="solid" className="bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/20 dark:hover:bg-red-900/40 dark:text-red-400 font-bold border border-red-200 dark:border-red-800" icon={<HiOutlineRefresh className="text-lg" />} onClick={handleRetryFailed} loading={isRetrying}>
                            تلاش مجدد خطادارها ({stats.failed})
                        </Button>
                    )}
                </div>

                <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-end mb-1">
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">پیشرفت کلی ارسال</span>
                        <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{stats.progressPercentage}%</span>
                    </div>
                    <div dir="rtl" className="w-full h-3.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden flex shadow-inner">
                        <div 
                            title={`خطا: ${stats.failed} پیام`}
                            style={{ width: `${stats.total === 0 ? 0 : (stats.failed / stats.total) * 100}%` }} 
                            className="h-full bg-red-500 transition-all duration-700 ease-out hover:brightness-110 cursor-help"
                        ></div>

                        <div 
                            title={`موفق: ${stats.sent} پیام`}
                            style={{ width: `${stats.total === 0 ? 0 : (stats.sent / stats.total) * 100}%` }} 
                            className="h-full bg-emerald-500 transition-all duration-700 ease-out hover:brightness-110 cursor-help"
                        ></div>

                        <div 
                            title={`در صف: ${stats.pending} پیام`}
                            style={{ width: `${stats.total === 0 ? 0 : (stats.pending / stats.total) * 100}%` }} 
                            className="h-full bg-blue-400 opacity-80 animate-pulse transition-all duration-700 ease-out hover:opacity-100 cursor-help"
                        ></div>

                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex flex-col gap-1 border-r border-gray-100 dark:border-gray-800 pr-4 first:border-0 first:pr-0">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1"><HiOutlineChartPie /> کل پیام‌ها</span>
                        <span className="text-2xl font-black text-gray-800 dark:text-gray-200">{stats.total}</span>
                    </div>
                    <div className="flex flex-col gap-1 border-r border-gray-100 dark:border-gray-800 pr-4">
                        <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-1"><HiOutlineCheckCircle /> موفق</span>
                        <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{stats.sent}</span>
                    </div>
                    <div className="flex flex-col gap-1 border-r border-gray-100 dark:border-gray-800 pr-4">
                        <span className="text-xs font-bold text-red-500 uppercase tracking-wider flex items-center gap-1"><HiOutlineXCircle /> خطا خورده</span>
                        <span className="text-2xl font-black text-red-600 dark:text-red-400">{stats.failed}</span>
                    </div>
                    <div className="flex flex-col gap-1 border-r border-gray-100 dark:border-gray-800 pr-4">
                        <span className="text-xs font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1"><HiOutlineClock /> در صف</span>
                        <span className="text-2xl font-black text-amber-600 dark:text-amber-400">{stats.pending}</span>
                    </div>
                </div>
            </div>

            {/* ... بقیه کدهای جدول تغییری نکرده ... */}
            <div className="flex flex-col gap-4">
                <div className="flex gap-2">
                    <button onClick={() => setActiveTab('all')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'all' ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-md' : 'bg-transparent text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                        لیست کامل گیرندگان
                    </button>
                    <button onClick={() => setActiveTab('failed')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-1.5 ${activeTab === 'failed' ? 'bg-red-500 text-white shadow-md' : 'bg-transparent text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                        فقط خطاها {stats.failed > 0 && <span className="bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300 px-1.5 py-0.5 rounded text-[10px]">{stats.failed}</span>}
                    </button>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <Table>
                            <THead className="bg-gray-50/50 dark:bg-gray-800/30">
                                <Tr>
                                    <Th>گیرنده</Th>
                                    <Th>شناسه / موبایل</Th>
                                    <Th className="text-center">وضعیت</Th>
                                    <Th>زمان/لاگ</Th>
                                </Tr>
                            </THead>
                            <TBody>
                                {isLoading ? (
                                    <Tr><Td colSpan={4} className="text-center py-12 text-gray-400">در حال دریافت اطلاعات از سرور...</Td></Tr>
                                ) : tableData.length > 0 ? (
                                    tableData.map((msg) => (
                                        <Tr key={msg.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors border-b border-gray-50 dark:border-gray-800 last:border-0">
                                            <Td><span className="font-bold text-gray-800 dark:text-gray-200">{msg.contactName}</span></Td>
                                            <Td><span className="font-mono text-xs text-gray-500 tracking-wider" dir="ltr">{msg.phoneNumber}</span></Td>
                                            <Td className="text-center">{renderStatusBadge(msg.status)}</Td>
                                            <Td>
                                                {msg.status === CampaignMessageStatus.Sent && <span className="text-xs text-gray-400">{msg.sentAt}</span>}
                                                {msg.status === CampaignMessageStatus.Failed && (
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-bold text-red-500">{msg.errorMessage}</span>
                                                        <span className="text-[10px] text-gray-400">تلاش‌های مجدد: {msg.retryCount}</span>
                                                    </div>
                                                )}
                                                {(msg.status === CampaignMessageStatus.Pending || msg.status === CampaignMessageStatus.Processing) && <span className="text-xs text-gray-400">-</span>}
                                            </Td>
                                        </Tr>
                                    ))
                                ) : (
                                    <Tr><Td colSpan={4} className="text-center py-12 text-gray-400 font-medium">هیچ پیامی یافت نشد.</Td></Tr>
                                )}
                            </TBody>
                        </Table>
                    </div>
                </div>
            </div>
            
            <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
        </div>
    )
}

export default CampaignReport