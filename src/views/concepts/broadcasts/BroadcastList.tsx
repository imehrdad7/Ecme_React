import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Table from '@/components/ui/Table'
import Dialog from '@/components/ui/Dialog'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { HiOutlineSearch, HiPlus, HiOutlineTrash, HiExclamation, HiOutlineRefresh, HiOutlineX, HiOutlineEye, HiOutlineRefresh as HiRetry } from 'react-icons/hi'
import { BsBroadcast } from 'react-icons/bs'
import { useSessionUser } from '@/store/authStore'
import { SuperAdmin, ADMIN } from '@/constants/roles.constant'
import { apiSearchBroadcasts, apiDeleteBroadcast, apiRetryBroadcast } from '@/services/broadcastService'
import { BroadcastDto, BroadcastStatus } from './types'

const { Tr, Th, Td, THead, TBody } = Table

// متد فرمت تاریخ دقیقاً مشابه سیستم شما
const formatPersianDate = (dateString: string) => {
    if (!dateString) return '-';
    try {
        return new Intl.DateTimeFormat('fa-IR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(dateString));
    } catch {
        return dateString;
    }
}

// استایل‌دهی به وضعیت‌های مختلف پیام
const getStatusDetails = (status: any) => {
    // تبدیل مقدار به عدد (اگر به صورت عدد از بک‌اند آمده باشد) یا چک کردن متن آن
    if (status === 2 || status === 'Completed' || status === 'completed')
        return { color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-500/20', label: 'ارسال موفق' };

    if (status === 0 || status === 'Pending' || status === 'pending')
        return { color: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-500/20', label: 'در صف انتظار' };

    if (status === 1 || status === 'Processing' || status === 'processing')
        return { color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-500/20', label: 'در حال ارسال...' };

    if (status === 4 || status === 'Failed' || status === 'failed')
        return { color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-500/20', label: 'خطا در ارسال' };

    if (status === 3 || status === 'Partial' || status === 'partial')
        return { color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-500/20', label: 'ارسال ناقص' };

    return { color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-800', label: 'نامشخص' };
}

const BroadcastList = () => {
    const { user } = useSessionUser()
    const userRoles = user?.authority || (user?.role ? [user.role] : [])
    const canCreate = [SuperAdmin, ADMIN, 'User'].some(allowedRole => userRoles.includes(allowedRole))

    const [isSearchOpen, setIsSearchOpen] = useState(false)
    const searchInputRef = useRef<HTMLInputElement>(null)
    const navigate = useNavigate()

    const [searchText, setSearchText] = useState('')
    const [broadcasts, setBroadcasts] = useState<BroadcastDto[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [isRetryingId, setIsRetryingId] = useState<string | null>(null)

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [selectedBroadcast, setSelectedBroadcast] = useState<BroadcastDto | null>(null)

    const fetchBroadcasts = async () => {
        setIsLoading(true)
        try {
            // در صورت نیاز به صفحه‌بندی کامل، مقادیر pageNumber و pageSize به استیت متصل شوند
            const result: any = await apiSearchBroadcasts({ pageNumber: 1, pageSize: 50, search: searchText })
            const fetchedItems = result?.items || result?.data?.items || []
            setBroadcasts(fetchedItems)
        } catch (error: any) {
            toast.push(
                <Notification title="خطا در دریافت اطلاعات" type="danger" duration={5000}>
                    {error?.response?.data?.Message || 'مشکلی در ارتباط با سرور پیش آمد.'}
                </Notification>,
                { placement: 'top-center' }
            )
        } finally {
            setIsLoading(false)
        }
    }

    // فراخوانی اولیه و هنگام تغییر متن جستجو (با کمی تاخیر در سیستم‌های واقعی بهتر است)
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchBroadcasts()
        }, 500)
        return () => clearTimeout(timeoutId)
    }, [searchText])


    const openDeleteDialog = (broadcast: BroadcastDto) => {
        setSelectedBroadcast(broadcast)
        setIsDeleteDialogOpen(true)
    }

    const closeDeleteDialog = () => {
        setIsDeleteDialogOpen(false)
        setSelectedBroadcast(null)
    }

    const handleDeleteConfirm = async () => {
        if (!selectedBroadcast) return
        setIsDeleting(true)
        try {
            await apiDeleteBroadcast(selectedBroadcast.id)
            setBroadcasts(broadcasts.filter(b => b.id !== selectedBroadcast.id))
            toast.push(
                <Notification title="حذف موفقیت‌آمیز" type="success" duration={3000}>
                    پیام همگانی با موفقیت حذف شد.
                </Notification>,
                { placement: 'top-center' }
            )
            closeDeleteDialog()
        } catch (error: any) {
            toast.push(
                <Notification title="خطا در حذف" type="danger" duration={5000}>
                    {error?.response?.data?.Message || 'مشکلی در حذف پیام پیش آمد.'}
                </Notification>,
                { placement: 'top-center' }
            )
        } finally {
            setIsDeleting(false)
        }
    }

    const handleRetry = async (id: string) => {
        setIsRetryingId(id)
        try {
            await apiRetryBroadcast(id)
            toast.push(
                <Notification title="درخواست ثبت شد" type="success" duration={3000}>
                    تلاش مجدد برای ارسال‌های ناموفق در صف پردازش قرار گرفت.
                </Notification>,
                { placement: 'top-center' }
            )
            fetchBroadcasts() // به‌روزرسانی لیست برای نمایش وضعیت Pending
        } catch (error: any) {
            toast.push(
                <Notification title="خطا" type="danger" duration={5000}>
                    {error?.response?.data?.Message || 'مشکلی در ثبت درخواست پیش آمد.'}
                </Notification>,
                { placement: 'top-center' }
            )
        } finally {
            setIsRetryingId(null)
        }
    }

    return (
        <div className="flex flex-col gap-4 h-full">
            <Card className="flex-1 shadow-sm border-0 rounded-2xl overflow-hidden">
                {/* 🎯 Header */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 md:mb-8">
                    <div className="flex items-center justify-center sm:justify-start gap-3 md:gap-4 w-full sm:w-auto text-right">
                        <div className="w-12 h-12 md:w-14 md:h-14 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center rounded-xl flex-shrink-0">
                            <BsBroadcast className="text-2xl" />
                        </div>
                        <div className="flex flex-col">
                            <h3 className="text-lg md:text-2xl font-extrabold text-gray-800 dark:text-gray-100">
                                پیام‌های همگانی (Broadcast)
                            </h3>
                            <p className="text-[11px] md:text-sm text-gray-500 mt-0.5">
                                ارسال یک پیام به چندین پلتفرم و کانال
                            </p>
                        </div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
                        <div className="flex items-center justify-end gap-2 w-full md:w-auto">
                            {/* Search */}
                            <div
                                className={`relative flex items-center transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] h-11 ${isSearchOpen || searchText
                                    ? 'flex-1 md:flex-none md:w-[24rem] bg-white dark:bg-gray-800 rounded-xl border-indigo-500 shadow-indigo-100 dark:shadow-indigo-900/20 shadow-md'
                                    : 'w-11 bg-gray-50 dark:bg-gray-900/40 rounded-full border-transparent hover:border-indigo-300 dark:hover:border-indigo-500 shadow-sm cursor-pointer'
                                    } border`}
                                onClick={() => {
                                    if (!isSearchOpen && !searchText) {
                                        setIsSearchOpen(true)
                                        setTimeout(() => searchInputRef.current?.focus(), 50)
                                    }
                                }}
                            >
                                <div className={`absolute right-0 w-11 h-11 flex items-center justify-center transition-transform duration-500 ${isSearchOpen || searchText ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 hover:scale-110'}`}>
                                    <HiOutlineSearch className="text-xl" />
                                </div>
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    placeholder="جستجوی عنوان پیام..."
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                    onBlur={() => { if (!searchText) setIsSearchOpen(false) }}
                                    className={`w-full h-full bg-transparent outline-none pr-12 pl-10 transition-all duration-500 text-gray-800 dark:text-gray-100 text-[15px] md:text-base ${isSearchOpen || searchText ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                                />
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSearchText('');
                                        setIsSearchOpen(false);
                                    }}
                                    className={`absolute left-2 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-300 ${isSearchOpen || searchText ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-50 invisible'}`}
                                >
                                    <HiOutlineX className="text-base" />
                                </button>
                            </div>

                            {/* Refresh */}
                            <button
                                type="button"
                                onClick={fetchBroadcasts}
                                disabled={isLoading}
                                className="flex-shrink-0 w-11 h-11 flex items-center justify-center rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-indigo-600 hover:border-indigo-300 shadow-sm transition-all"
                            >
                                <HiOutlineRefresh className={`text-xl ${isLoading ? 'animate-spin text-indigo-500' : ''}`} />
                            </button>
                        </div>

                        {/* Create Button */}
                        {canCreate && (
                            <Button
                                variant="solid"
                                icon={<HiPlus className="text-xl" />}
                                className="w-full md:w-auto h-11 rounded-xl shadow-md shadow-indigo-200 dark:shadow-none font-bold"
                                onClick={() => navigate('/concepts/broadcasts/create')} // به آدرس صفحه ساخت متصل کنید
                            >
                                پیام همگانی جدید
                            </Button>
                        )}
                    </div>
                </div>

                {/* 🖥️ Desktop Table */}
                <div className="hidden md:block overflow-auto max-h-[calc(100vh-250px)] rounded-xl border border-gray-200 dark:border-gray-800 relative bg-white dark:bg-gray-900 shadow-sm [scrollbar-width:thin]">
                    <table className="w-full text-right border-collapse relative">
                        <thead className="sticky top-0 z-30">
                            <tr className="bg-gray-100 dark:bg-gray-800 shadow-[0_2px_4px_-1px_rgba(0,0,0,0.05)]">
                                <th className="py-3.5 px-4 text-[15px] font-bold text-gray-800 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700">عنوان پیام</th>
                                <th className="text-center py-3.5 px-4 text-[15px] font-bold text-gray-800 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700">وضعیت</th>
                                <th className="text-center py-3.5 px-4 text-[15px] font-bold text-gray-800 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700">تاریخ ثبت</th>
                                <th className="text-center py-3.5 px-4 text-[15px] font-bold text-gray-800 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 w-48">عملیات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={4} className="text-center py-12">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                            <span className="text-gray-500 font-medium">در حال بارگذاری اطلاعات...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : broadcasts.length > 0 ? (
                                broadcasts.map((item) => {
                                    const statusBadge = getStatusDetails(item.status);
                                    return (
                                        <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors group border-b border-gray-100 dark:border-gray-800 last:border-0">
                                            <td className="py-3 px-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-[15px] text-gray-800 dark:text-gray-100">{item.title}</span>
                                                    <span className="text-sm text-gray-500 truncate max-w-xs">{item.content}</span>
                                                </div>
                                            </td>
                                            <td className="text-center py-3 px-4">
                                                <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold ${statusBadge.bg} ${statusBadge.color}`}>
                                                    {statusBadge.label}
                                                </span>
                                            </td>
                                            <td className="text-center text-gray-500 dark:text-gray-400 font-medium text-sm py-3 px-4">
                                                <span dir="rtl">{formatPersianDate(item.createdAt)}</span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    {(item.status === BroadcastStatus.Failed || item.status === BroadcastStatus.Partial) && (
                                                        <button
                                                            disabled={isRetryingId === item.id}
                                                            className="text-orange-500 hover:text-white hover:bg-orange-500 p-2 rounded-lg transition-all"
                                                            onClick={() => handleRetry(item.id)}
                                                            title="تلاش مجدد برای خطادارها"
                                                        >
                                                            <HiRetry className={`text-lg ${isRetryingId === item.id ? 'animate-spin' : ''}`} />
                                                        </button>
                                                    )}
                                                    <button className="text-blue-500 hover:text-white hover:bg-blue-500 p-2 rounded-lg transition-all" onClick={() => navigate(`/concepts/broadcasts/detail/${item.id}`)} title="مشاهده جزئیات">
                                                        <HiOutlineEye className="text-lg" />
                                                    </button>
                                                    <button className="text-red-500 hover:text-white hover:bg-red-500 p-2 rounded-lg transition-all" onClick={() => openDeleteDialog(item)} title="حذف پیام">
                                                        <HiOutlineTrash className="text-lg" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })
                            ) : (
                                <tr>
                                    <td colSpan={4} className="text-center py-16 text-gray-500">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-2 shadow-inner">
                                                <BsBroadcast className="text-3xl text-gray-300 dark:text-gray-600" />
                                            </div>
                                            <span className="font-bold text-lg text-gray-700 dark:text-gray-300">هیچ پیامی یافت نشد</span>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* 📱 Mobile Cards */}
                <div className="md:hidden flex flex-col gap-4 pb-6">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-3 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100">
                            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-gray-500 font-medium">در حال بارگذاری...</span>
                        </div>
                    ) : broadcasts.length > 0 ? (
                        broadcasts.map((item) => {
                            const statusBadge = getStatusDetails(item.status);
                            return (
                                <div key={item.id} className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col gap-3 relative overflow-hidden">
                                    <div className="flex items-start justify-between">
                                        <div className="flex flex-col">
                                            <span className="font-extrabold text-base text-gray-900 dark:text-white">{item.title}</span>
                                            <span className="text-xs text-gray-500 mt-1 line-clamp-1">{item.content}</span>
                                        </div>
                                        <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold shrink-0 ${statusBadge.bg} ${statusBadge.color}`}>
                                            {statusBadge.label}
                                        </span>
                                    </div>

                                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-3 flex items-center justify-between border border-gray-100 dark:border-gray-800">
                                        <span className="text-[11px] font-medium text-gray-500" dir="rtl">
                                            {formatPersianDate(item.createdAt)}
                                        </span>
                                        <div className="flex gap-2">
                                            {(item.status === BroadcastStatus.Failed || item.status === BroadcastStatus.Partial) && (
                                                <button disabled={isRetryingId === item.id} className="w-8 h-8 rounded-lg flex items-center justify-center text-orange-500 border border-orange-200 bg-orange-50" onClick={() => handleRetry(item.id)}>
                                                    <HiRetry className={isRetryingId === item.id ? 'animate-spin' : ''} />
                                                </button>
                                            )}
                                            <button className="w-8 h-8 rounded-lg flex items-center justify-center text-blue-500 border border-blue-200 bg-blue-50" onClick={() => navigate(`/concepts/broadcasts/detail/${item.id}`)}>
                                                <HiOutlineEye />
                                            </button>
                                            <button className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 border border-red-200 bg-red-50" onClick={() => openDeleteDialog(item)}>
                                                <HiOutlineTrash />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    ) : (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 flex flex-col items-center text-center gap-3 border border-gray-100 shadow-sm">
                            <BsBroadcast className="text-4xl text-gray-300" />
                            <span className="font-bold text-gray-700">هیچ پیامی یافت نشد</span>
                        </div>
                    )}
                </div>
            </Card>

            {/* 🗑️ Delete Dialog */}
            <Dialog isOpen={isDeleteDialogOpen} onClose={closeDeleteDialog} closable={!isDeleting}>
                <div className="flex flex-col gap-4 mt-8">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0">
                            <HiExclamation className="text-2xl" />
                        </div>
                        <div className="flex-1 mt-1">
                            <h5 className="text-lg font-bold text-gray-900 mb-2">حذف پیام همگانی</h5>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                آیا از حذف پیام <span className="font-bold text-gray-800">"{selectedBroadcast?.title}"</span> مطمئن هستید؟
                            </p>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-6 pt-5 border-t border-gray-100">
                        <Button variant="default" disabled={isDeleting} onClick={closeDeleteDialog}>انصراف</Button>
                        <Button loading={isDeleting} variant="solid" className="bg-red-600 hover:bg-red-500 text-white border-0" onClick={handleDeleteConfirm}>
                            {isDeleting ? 'در حال حذف...' : 'بله، حذف شود'}
                        </Button>
                    </div>
                </div>
            </Dialog>
        </div>
    )
}

export default BroadcastList