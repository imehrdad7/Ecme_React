import { useState, useEffect } from 'react'
import Dialog from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { apiGetPlanSubscribers, PlanSubscriberDto } from '@/services/PlanService'

interface Props {
    planId: string | null;
    isOpen: boolean;
    onClose: () => void;
}

const PlanSubscribersModal = ({ planId, isOpen, onClose }: Props) => {
    const [subscribers, setSubscribers] = useState<PlanSubscriberDto[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [pageNumber, setPageNumber] = useState(1)
    const [totalCount, setTotalCount] = useState(0)
    const pageSize = 10

    // 👈 جلوگیری از اسکرول خوردن پس‌زمینه در زمان باز بودن مودال
    useEffect(() => {
        if (isOpen) {
            document.body.classList.add('overflow-hidden')
        } else {
            document.body.classList.remove('overflow-hidden')
        }
        return () => document.body.classList.remove('overflow-hidden')
    }, [isOpen])

    useEffect(() => {
        if (isOpen && planId) {
            fetchSubscribers()
        } else {
            // ریست کردن استیت‌ها هنگام بسته شدن
            setSubscribers([])
            setPageNumber(1)
            setTotalCount(0)
        }
    }, [isOpen, planId, pageNumber])

    const fetchSubscribers = async () => {
        setIsLoading(true)
        try {
            const res = await apiGetPlanSubscribers({
                planId: planId!,
                pageNumber,
                pageSize
            })
            if (res) {
                setSubscribers(res.items)
                setTotalCount(res.totalCount)
            }
        } catch (error) {
            toast.push(<Notification title="خطا" type="danger">مشکلی در دریافت لیست مشترکین پیش آمد.</Notification>, { placement: 'top-center' })
            onClose()
        } finally {
            setIsLoading(false)
        }
    }

    // تابع کمکی برای نمایش خوانای تاریخ
    const formatDate = (dateString: string) => {
        return new Intl.DateTimeFormat('fa-IR').format(new Date(dateString))
    }

    // 👈 تابع جدید برای نمایش وضعیت بر اساس Enum بک‌اند
    const renderStatusBadge = (status: number) => {
        switch (status) {
            case 1: // Active
                return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">فعال</span>;
            case 2: // Reserved
                return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">رزرو شده</span>;
            case 3: // Expired
                return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">منقضی شده</span>;
            case 4: // Canceled
                return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">لغو شده</span>;
            default:
                return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-200">نامشخص</span>;
        }
    }

    const totalPages = Math.ceil(totalCount / pageSize)

    return (
        <Dialog isOpen={isOpen} onClose={onClose} width={750}>
            <h5 className="mb-4">لیست مشترکین پلن</h5>
            
            <div className="flex flex-col gap-4">
                <div className="overflow-x-auto border rounded-lg min-h-[200px]">
                    <table className="min-w-full divide-y divide-gray-200 text-right">
                        <thead className="bg-gray-50 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            <tr>
                                <th className="p-4">نام شرکت</th>
                                <th className="p-4">تاریخ شروع</th>
                                <th className="p-4">تاریخ انقضا</th>
                                <th className="p-4 text-center">وضعیت</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200 text-sm">
                            {isLoading ? (
                                <tr><td colSpan={4} className="p-8 text-center text-gray-400">در حال دریافت داده‌ها...</td></tr>
                            ) : subscribers.length === 0 ? (
                                <tr><td colSpan={4} className="p-8 text-center text-gray-400">تا کنون شرکتی این پلن را خریداری نکرده است.</td></tr>
                            ) : (
                                subscribers.map((sub) => (
                                    <tr key={sub.subscriptionId} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4 font-medium text-gray-900">{sub.companyName}</td>
                                        <td className="p-4 text-gray-600">{formatDate(sub.startDate)}</td>
                                        <td className="p-4 text-gray-600">{formatDate(sub.endDate)}</td>
                                        {/* 👈 استفاده از تابع رندر وضعیت */}
                                        <td className="p-4 text-center">
                                            {renderStatusBadge(sub.status)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* بخش صفحه‌بندی (Pagination) */}
                {totalCount > pageSize && (
                    <div className="flex justify-between items-center pt-2">
                        <span className="text-sm text-gray-500">
                            نمایش {(pageNumber - 1) * pageSize + 1} تا {Math.min(pageNumber * pageSize, totalCount)} از {totalCount} مشترک
                        </span>
                        <div className="flex gap-2">
                            <Button 
                                size="sm" 
                                variant="plain" 
                                disabled={pageNumber === 1 || isLoading}
                                onClick={() => setPageNumber(prev => prev - 1)}
                            >
                                قبلی
                            </Button>
                            <Button 
                                size="sm" 
                                variant="plain" 
                                disabled={pageNumber >= totalPages || isLoading}
                                onClick={() => setPageNumber(prev => prev + 1)}
                            >
                                بعدی
                            </Button>
                        </div>
                    </div>
                )}

                <div className="flex justify-end pt-4 border-t border-gray-100">
                    <Button variant="solid" className="bg-gray-800 hover:bg-gray-700" onClick={onClose}>
                        بستن
                    </Button>
                </div>
            </div>
        </Dialog>
    )
}

export default PlanSubscribersModal