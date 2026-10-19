import React from 'react'
import classNames from 'classnames'
import { 
    HiOutlineInformationCircle, 
    HiOutlineCheckCircle, 
    HiOutlineExclamation, 
    HiOutlineXCircle 
} from 'react-icons/hi'

// مشخص کردن تایپ ورودی: این کامپوننت حالا فقط یک عدد (type) می‌گیرد
interface NotificationAvatarProps {
    type: number
}

const NotificationAvatar: React.FC<NotificationAvatarProps> = ({ type }) => {
    
    // تابعی برای تعیین رنگ و آیکون بر اساس نوع نوتیفیکیشن
    const getAvatarConfig = () => {
        switch (type) {
            case 1: // Info (اطلاعات عمومی)
                return {
                    icon: <HiOutlineInformationCircle className="text-blue-500 dark:text-blue-400 text-xl" />,
                    bgClass: 'bg-blue-100/50 dark:bg-blue-500/20 text-blue-600',
                }
            case 2: // Success (موفقیت‌آمیز)
                return {
                    icon: <HiOutlineCheckCircle className="text-emerald-500 dark:text-emerald-400 text-xl" />,
                    bgClass: 'bg-emerald-100/50 dark:bg-emerald-500/20 text-emerald-600',
                }
            case 3: // Warning (هشدار)
                return {
                    icon: <HiOutlineExclamation className="text-amber-500 dark:text-amber-400 text-xl" />,
                    bgClass: 'bg-amber-100/50 dark:bg-amber-500/20 text-amber-600',
                }
            case 4: // Error (خطا)
                return {
                    icon: <HiOutlineXCircle className="text-rose-500 dark:text-rose-400 text-xl" />,
                    bgClass: 'bg-rose-100/50 dark:bg-rose-500/20 text-rose-600',
                }
            default: // حالت ناشناس
                return {
                    icon: <HiOutlineInformationCircle className="text-gray-500 dark:text-gray-400 text-xl" />,
                    bgClass: 'bg-gray-100 dark:bg-gray-700',
                }
        }
    }

    const { icon, bgClass } = getAvatarConfig()

    return (
        <div
            className={classNames(
                'flex items-center justify-center w-10 h-10 rounded-full',
                bgClass
            )}
        >
            {icon}
        </div>
    )
}

export default NotificationAvatar