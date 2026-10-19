import { useState, useEffect } from 'react'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
// اگر کامپوننت‌های Log و LogAction را نیاز دارید، باید آن‌ها را هم بر اساس دیتای جدید آپدیت کنید
// اما در اینجا من ساختار یکپارچه‌ای بر اساس NotificationDto برای شما آماده کرده‌ام
import { apiGetNotificationList } from '@/services/NotificationService'
import NotificationAvatar from '@/components/template/Notification/NotificationAvatar'
import Spinner from '@/components/ui/Spinner'
import Button from '@/components/ui/Button'
import classNames from 'classnames'

// تایپ داده‌های بک‌اند ما
export type NotificationDto = {
    id: string
    title: string
    message: string
    type: number // 1: Info, 2: Success, 3: Warning, 4: Error
    actionUrl: string | null
    isRead: boolean
    createdAt: string
}

const ActivityLog = () => {
    const [isLoading, setIsLoading] = useState(false)
    const [hasMore, setHasMore] = useState(true)
    const [notifications, setNotifications] = useState<NotificationDto[]>([])
    const [pageNumber, setPageNumber] = useState(1)
    
    // فیلتر بر اساس نوع پیام (۱ تا ۴)
    const [selectedTypes, setSelectedTypes] = useState<number[]>([1, 2, 3, 4])

    // دریافت داده‌ها از بک‌اند
    const fetchLogs = async (page: number, isNewFilter = false) => {
        setIsLoading(true)
        try {
            const resp: any = await apiGetNotificationList({ pageNumber: page, pageSize: 15 })
            const newItems: NotificationDto[] = resp?.data?.items ?? resp?.items ?? []
            const totalCount: number = resp?.data?.totalCount ?? resp?.totalCount ?? 0

            if (isNewFilter) {
                setNotifications(newItems)
            } else {
                setNotifications((prev) => [...prev, ...newItems])
            }

            // بررسی اینکه آیا صفحه دیگری هم وجود دارد یا خیر
            setHasMore(isNewFilter ? newItems.length < totalCount : notifications.length + newItems.length < totalCount)
        } catch (error) {
            console.error("خطا در دریافت تاریخچه فعالیت‌ها", error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchLogs(1, true)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleLoadMore = () => {
        const nextPage = pageNumber + 1
        setPageNumber(nextPage)
        fetchLogs(nextPage)
    }

    // فیلتر کردن کلاینت‌ساید (یا می‌توانید به بک‌اند پاس دهید)
    const filteredNotifications = notifications.filter(notif => selectedTypes.includes(notif.type))

    const toggleFilter = (type: number) => {
        setSelectedTypes(prev => 
            prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
        )
    }

    return (
        <AdaptiveCard>
            <div className="max-w-[800px] mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <h3 className="font-bold text-xl">تاریخچه کامل فعالیت‌ها</h3>
                    
                    {/* فیلترهای سریع */}
                    <div className="flex gap-2">
                        <Button size="sm" variant={selectedTypes.includes(1) ? 'solid' : 'default'} onClick={() => toggleFilter(1)}>اطلاعات</Button>
                        <Button size="sm" variant={selectedTypes.includes(2) ? 'solid' : 'default'} onClick={() => toggleFilter(2)} className={selectedTypes.includes(2) ? 'bg-emerald-500 hover:bg-emerald-600' : ''}>موفقیت</Button>
                        <Button size="sm" variant={selectedTypes.includes(3) ? 'solid' : 'default'} onClick={() => toggleFilter(3)} className={selectedTypes.includes(3) ? 'bg-amber-500 hover:bg-amber-600' : ''}>هشدار</Button>
                        <Button size="sm" variant={selectedTypes.includes(4) ? 'solid' : 'default'} onClick={() => toggleFilter(4)} className={selectedTypes.includes(4) ? 'bg-rose-500 hover:bg-rose-600' : ''}>خطا</Button>
                    </div>
                </div>

                {/* لیست فعالیت‌ها */}
                <div className="relative">
                    {/* خط تایم‌لاین پس‌زمینه */}
                    <div className="absolute top-0 bottom-0 left-5 md:left-1/2 w-0.5 bg-gray-200 dark:bg-gray-700 transform -translate-x-1/2 rounded-full" />

                    {filteredNotifications.map((item, index) => (
                        <div key={`${item.id}-${index}`} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group mb-8">
                            
                            {/* آیکون وسط */}
                            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-gray-900 bg-white dark:bg-gray-800 z-10 md:absolute md:left-1/2 md:transform md:-translate-x-1/2 shadow-sm">
                                <NotificationAvatar type={item.type} />
                            </div>

                            {/* باکس محتوا */}
                            <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-2">
                                    <h6 className="font-semibold text-gray-800 dark:text-gray-100">{item.title}</h6>
                                    <span className="text-xs text-gray-400 font-medium bg-white dark:bg-gray-700 px-2 py-1 rounded-md shadow-sm">
                                        {new Date(item.createdAt).toLocaleDateString('fa-IR')}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                                    {item.message}
                                </p>
                                {item.actionUrl && (
                                    <a href={item.actionUrl} className="inline-block mt-3 text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">
                                        مشاهده جزئیات &rarr;
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* بخش لودینگ و دکمه بارگذاری بیشتر */}
                <div className="flex justify-center mt-8">
                    {isLoading ? (
                        <Spinner size={40} />
                    ) : hasMore ? (
                        <Button variant="plain" onClick={handleLoadMore} className="text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-800">
                            بارگذاری فعالیت‌های قدیمی‌تر
                        </Button>
                    ) : (
                        <span className="text-gray-400 text-sm">پایان تاریخچه</span>
                    )}
                </div>
            </div>
        </AdaptiveCard>
    )
}

export default ActivityLog