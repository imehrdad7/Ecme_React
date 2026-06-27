import Avatar from '@/components/ui/Avatar'
import Dropdown from '@/components/ui/Dropdown'
import withHeaderItem from '@/utils/hoc/withHeaderItem'
import { useSessionUser } from '@/store/authStore'
import { Link } from 'react-router-dom'
import { PiUserDuotone, PiGearDuotone, PiPulseDuotone, PiSignOutDuotone } from 'react-icons/pi'
import { useAuth } from '@/auth'
import appConfig from '@/configs/app.config'


type DropdownList = {
    label: string
    path: string
    icon: JSX.Element
}
const getFullAvatarUrl = (avatarPath?: string | null) => {
    if (!avatarPath) return '';
    
    // اگر آدرس از قبل کامل بود یا blob موقت بود، دست نزن
    if (avatarPath.startsWith('http') || avatarPath.startsWith('blob:')) {
        return avatarPath;
    }
    
    // تنظیم آی‌پی و پورت دقیق بک‌اند
    const backendBaseUrl = appConfig.apiPrefix; 
    const separator = avatarPath.startsWith('/') ? '' : '/';
    
    return `${backendBaseUrl}${separator}${avatarPath}`;
};

const dropdownItemList: DropdownList[] = [
    {
        label: 'پروفایل',
        path: '/concepts/account/settings',
        icon: <PiUserDuotone />,
    },
    {
        label: 'تنظیمات حساب',
        path: '/concepts/account/settings',
        icon: <PiGearDuotone />,
    },
    {
        label: 'لاگ فعالیت',
        path: '/concepts/account/activity-log',
        icon: <PiPulseDuotone />,
    },
]

const _UserDropdown = () => {
    const { avatarFileName, firstName,lastName, phoneNumber } = useSessionUser((state) => state.user)

    const { signOut } = useAuth()

    const handleSignOut = () => {
        signOut()
    }

    const avatarProps = {
        ...(avatarFileName ? { src: getFullAvatarUrl(avatarFileName) } : { icon: <PiUserDuotone /> }),
    }

    return (
        <Dropdown
            className="flex"
            toggleClassName="flex items-center"
            renderTitle={
                <div className="cursor-pointer flex items-center">
                    <Avatar size={32} {...avatarProps} />
                </div>
            }
            placement="bottom-end"
        >
            <Dropdown.Item variant="header">
                <div className="py-2 px-3 flex items-center gap-3">
                    <Avatar {...avatarProps} />
                    <div>
                        <div className="font-bold text-gray-900 dark:text-gray-100">
                            { firstName +' '+ lastName|| 'Anonymous'}
                        </div>
                        <div className="text-xs">
                            {phoneNumber || 'No Phone available'}
                        </div>
                    </div>
                </div>
            </Dropdown.Item>
            <Dropdown.Item variant="divider" />
            {dropdownItemList.map((item) => (
                <Dropdown.Item
                    key={item.label}
                    eventKey={item.label}
                    className="px-0"
                >
                    <Link className="flex h-full w-full px-2" to={item.path}>
                        <span className="flex gap-2 items-center w-full">
                            <span className="text-xl">{item.icon}</span>
                            <span>{item.label}</span>
                        </span>
                    </Link>
                </Dropdown.Item>
            ))}
            <Dropdown.Item variant="divider" />
            <Dropdown.Item
                eventKey="Sign Out"
                className="gap-2"
                onClick={handleSignOut}
            >
                <span className="text-xl">
                    <PiSignOutDuotone />
                </span>
                <span>خروج</span>
            </Dropdown.Item>
        </Dropdown>
    )
}

const UserDropdown = withHeaderItem(_UserDropdown)

export default UserDropdown
