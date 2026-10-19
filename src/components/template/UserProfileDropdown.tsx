import Avatar from '@/components/ui/Avatar'
import Dropdown from '@/components/ui/Dropdown'
import withHeaderItem from '@/utils/hoc/withHeaderItem'
import { useSessionUser } from '@/store/authStore'
import { Link } from 'react-router-dom'
import { PiUserDuotone, PiKeyDuotone, PiPulseDuotone, PiSignOutDuotone } from 'react-icons/pi'
import { useAuth } from '@/auth'
import appConfig from '@/configs/app.config'
import { TbBrandTeams, TbBrandOffice, TbUserSquare, TbFileDollar } from 'react-icons/tb'
import { SuperAdmin, ADMIN, USER } from '@/constants/roles.constant'

type DropdownList = {
    label: string
    path: string
    icon: JSX.Element
    authority?: string[]
}

const getFullAvatarUrl = (avatarPath?: string | null) => {
    if (!avatarPath) return '';

    if (avatarPath.startsWith('http') || avatarPath.startsWith('blob:')) {
        return avatarPath;
    }

    const backendBaseUrl = appConfig.apiPrefix;
    const separator = avatarPath.startsWith('/') ? '' : '/';

    return `${backendBaseUrl}${separator}${avatarPath}`;
};

const dropdownItemList: DropdownList[] = [
    {
        label: 'پروفایل',
        path: '/concepts/account/settings?tab=profile',
        icon: <TbUserSquare />,
        authority: [SuperAdmin, ADMIN, USER],
    },
    {
        label: 'تنظیمات شرکت',
        path: '/concepts/account/settings?tab=companySetting',
        icon: <TbBrandOffice />,
        authority: [SuperAdmin, ADMIN],
    },
    {
        label: 'مدیریت تیم',
        path: '/concepts/account/settings?tab=teamManagement',
        icon: <TbBrandTeams />,
        authority: [SuperAdmin, ADMIN],
    },
    {
        label: 'اشتراک من',
        path: '/concepts/account/settings?tab=subscription',
        icon: <TbFileDollar />,
        authority: [SuperAdmin, ADMIN],
    },
    {
        label: 'مدیریت کلید API',
        path: '/concepts/account/settings?tab=ApiTokenManager',
        icon: <PiKeyDuotone />,
        authority: [SuperAdmin, ADMIN],
    },
    {
        label: 'لاگ فعالیت',
        path: '/concepts/account/activity-log',
        icon: <PiPulseDuotone />,
        authority: [SuperAdmin, ADMIN, USER],
    },
]

const _UserDropdown = () => {
    const { avatarFileName, firstName, lastName, phoneNumber, authority, role } = useSessionUser((state) => state.user)

    const { signOut } = useAuth()

    const handleSignOut = () => {
        signOut()
    }

    const avatarProps = {
        ...(avatarFileName ? { src: getFullAvatarUrl(avatarFileName) } : { icon: <PiUserDuotone /> }),
    }

    const userRoles = authority || (role ? [role] : []);

    const visibleDropdownItems = dropdownItemList.filter(item => {
        if (!item.authority || item.authority.length === 0) return true;
        return item.authority.some(allowedRole => userRoles.includes(allowedRole));
    });

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
                            {[firstName, lastName].filter(Boolean).join(' ') || 'کاربر ناشناس'}
                        </div>
                        <div className="text-xs">
                            {phoneNumber || 'شماره‌ای ثبت نشده'}
                        </div>
                    </div>
                </div>
            </Dropdown.Item>

            <Dropdown.Item variant="divider" />

            {visibleDropdownItems.map((item) => (
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