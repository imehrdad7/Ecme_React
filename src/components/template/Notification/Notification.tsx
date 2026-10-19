import { useEffect, useState, useRef } from 'react'
import classNames from 'classnames'
import withHeaderItem from '@/utils/hoc/withHeaderItem'
import Dropdown from '@/components/ui/Dropdown'
import ScrollBar from '@/components/ui/ScrollBar'
import Spinner from '@/components/ui/Spinner'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Tooltip from '@/components/ui/Tooltip'
import NotificationAvatar from './NotificationAvatar'
import NotificationToggle from './NotificationToggle'
import { HiOutlineMailOpen, HiOutlineBell } from 'react-icons/hi'
import isLastChild from '@/utils/isLastChild'
import useResponsive from '@/utils/hooks/useResponsive'
import { useNavigate } from 'react-router-dom'
import toast from '@/components/ui/toast'
import NotificationUI from '@/components/ui/Notification'
import {
    apiGetNotificationList,
    apiGetNotificationCount,
    apiMarkAsRead,
    apiMarkAllAsRead
} from '@/services/NotificationService'

import { socketManager } from '@/utils/SocketManager'

import type { DropdownRef } from '@/components/ui/Dropdown'

export type NotificationDto = {
    id: string
    title: string
    message: string
    type: number
    actionUrl: string | null
    isRead: boolean
    createdAt: string
}

const notificationHeight = 'h-[280px]'

const _Notification = ({ className }: { className?: string }) => {
    const [notificationList, setNotificationList] = useState<NotificationDto[]>([])
    const [unreadCount, setUnreadCount] = useState<number>(0)
    const [noResult, setNoResult] = useState(false)
    const [loading, setLoading] = useState(false)

    const { larger } = useResponsive()
    const navigate = useNavigate()
    const notificationDropdownRef = useRef<DropdownRef>(null)

    const fetchNotificationCount = async () => {
        try {
            const resp: any = await apiGetNotificationCount()
            const count = resp?.data?.unreadCount ?? resp?.unreadCount ?? 0
            setUnreadCount(count)

            if (count === 0 && notificationList.length === 0) {
                setNoResult(true)
            } else {
                setNoResult(false)
            }
        } catch (error) {
            console.error("خطا در دریافت تعداد اعلانات", error)
        }
    }

    useEffect(() => {
        fetchNotificationCount()
    }, [])

    // --- اتصال مقاوم به سوکت ---
    useEffect(() => {
        let isMounted = true;
        let connection = socketManager.getConnection();

        const handleSystemNotification = (newNotif: NotificationDto) => {
            setUnreadCount(prev => prev + 1);
            setNotificationList(prev => [newNotif, ...prev]);
            setNoResult(false);
            toast.push(
                <NotificationUI title="اعلان جدید" type="info">
                    {newNotif.title}
                </NotificationUI>,
                { placement: 'top-start' }
            );
        };

        // حلقه انتظار برای اطمینان از وصل شدن سوکت در پس‌زمینه
        const checkConnection = setInterval(() => {
            connection = socketManager.getConnection();
            if (connection && isMounted) {
                // اگر اتصال برقرار بود، گوش‌کننده را ثبت کن و حلقه را ببند
                connection.on("ReceiveSystemNotification", handleSystemNotification);
                clearInterval(checkConnection);
            }
        }, 500);

        return () => {
            isMounted = false;
            clearInterval(checkConnection); // پاک کردن تایمر
            if (connection) {
                connection.off("ReceiveSystemNotification", handleSystemNotification);
            }
        };
    }, []);

    const onNotificationOpen = async () => {
        if (notificationList.length === 0) {
            setLoading(true)
            try {
                const resp: any = await apiGetNotificationList({ pageNumber: 1, pageSize: 10 })
                const items = resp?.data?.items ?? resp?.items ?? []

                setNotificationList(items)
                setNoResult(items.length === 0)
            } catch (error) {
                console.error("خطا در دریافت لیست اعلانات", error)
            } finally {
                setLoading(false)
            }
        }
    }

    const handleMarkAllAsRead = async () => {
        if (unreadCount === 0) return;
        try {
            await apiMarkAllAsRead()
            const updatedList = notificationList.map(item => ({ ...item, isRead: true }))
            setNotificationList(updatedList)
            setUnreadCount(0)
        } catch (error) {
            console.error("خطا در خواندن همه اعلانات", error)
        }
    }

    const handleMarkAsRead = async (item: NotificationDto) => {
        if (!item.isRead) {
            try {
                await apiMarkAsRead({ id: item.id })
                const updatedList = notificationList.map((n) =>
                    n.id === item.id ? { ...n, isRead: true } : n
                )
                setNotificationList(updatedList)
                setUnreadCount(prev => Math.max(0, prev - 1))
            } catch (error) {
                console.error("خطا در خواندن اعلان", error)
            }
        }

        if (item.actionUrl) {
            navigate(item.actionUrl)
            notificationDropdownRef.current?.handleDropdownClose()
        }
    }

    const handleViewAllActivity = () => {
        navigate('/concepts/account/activity-log')
        notificationDropdownRef.current?.handleDropdownClose()
    }

    return (
        <Dropdown
            ref={notificationDropdownRef}
            renderTitle={
                <NotificationToggle
                    dot={unreadCount > 0}
                    className={className}
                />
            }
            menuClass="min-w-[280px] md:min-w-[340px]"
            placement={larger.md ? 'bottom-end' : 'bottom'}
            onOpen={onNotificationOpen}
        >
            <Dropdown.Item variant="header">
                <div className="dark:border-gray-700 px-2 flex items-center justify-between mb-1">
                    <h6>اعلانات سیستم</h6>
                    <Tooltip title="همه را به عنوان خوانده شده علامت بزن">
                        <Button
                            variant="plain"
                            shape="circle"
                            size="sm"
                            icon={<HiOutlineMailOpen className="text-xl" />}
                            onClick={handleMarkAllAsRead}
                        />
                    </Tooltip>
                </div>
            </Dropdown.Item>

            <ScrollBar className={classNames('overflow-y-auto', notificationHeight)}>
                {notificationList.length > 0 &&
                    notificationList.map((item, index) => (
                        <div key={item.id}>
                            <div
                                className={`relative rounded-xl flex px-4 py-3 cursor-pointer transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 ${!item.isRead ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''}`}
                                onClick={() => handleMarkAsRead(item)}
                            >
                                <div>
                                    <NotificationAvatar type={item.type} />
                                </div>
                                <div className="mx-3 flex-1">
                                    <div>
                                        <span className="font-bold text-sm text-slate-800 dark:text-slate-100 block mb-1">
                                            {item.title}
                                        </span>
                                        <span className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                                            {item.message}
                                        </span>
                                    </div>
                                    <span className="text-[10px] text-gray-400 mt-2 block">
                                        {new Date(item.createdAt).toLocaleDateString('fa-IR')} - {new Date(item.createdAt).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                {!item.isRead && (
                                    <Badge
                                        className="absolute top-4 ltr:right-4 rtl:left-4 mt-1.5 animate-pulse"
                                        innerClass="bg-primary"
                                    />
                                )}
                            </div>
                            {!isLastChild(notificationList, index) && (
                                <div className="border-b border-gray-100 dark:border-gray-700 my-1 mx-4" />
                            )}
                        </div>
                    ))}

                {loading && (
                    <div className={classNames('flex items-center justify-center', notificationHeight)}>
                        <Spinner size={40} />
                    </div>
                )}

                {noResult && !loading && (
                    <div className={classNames('flex items-center justify-center', notificationHeight)}>
                        <div className="text-center">
                            <div className="mx-auto mb-4 w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                                <HiOutlineBell className="text-4xl text-gray-400 dark:text-gray-500" />
                            </div>
                            <h6 className="font-semibold text-gray-600 dark:text-gray-300">اعلانی وجود ندارد!</h6>
                            <p className="mt-1 text-sm text-gray-400">سیستم در وضعیت آرام است</p>
                        </div>
                    </div>
                )}
            </ScrollBar>

            <Dropdown.Item variant="header">
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700 mt-2">
                    <Button block variant="solid" size="sm" onClick={handleViewAllActivity}>
                        مشاهده تاریخچه کامل
                    </Button>
                </div>
            </Dropdown.Item>
        </Dropdown>
    )
}

const Notification = withHeaderItem(_Notification)

export default Notification