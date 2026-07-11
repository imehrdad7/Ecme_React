import React from 'react'
import Card from '@/components/ui/Card'
import Avatar from '@/components/ui/Avatar'
import Tooltip from '@/components/ui/Tooltip'
import { HiOutlineEye , HiChevronLeft, HiChevronRight, HiOutlineTrash } from 'react-icons/hi'
import { LuUserSquare2 } from 'react-icons/lu';
import { Contact, Platform, availableTagThemes } from '../types'

type ContactTableProps = {
    paginatedContacts: Contact[];
    appTags: any; 
    renderPlatformIcon: (platform: Platform, sizeClass?: string) => React.ReactNode;
    setSelectedUser: (user: Contact | null) => void;
    pageSize: number;
    setPageSize: (size: number) => void;
    onDeleteContact: (id: string) => void;
    currentPage: number;
    setCurrentPage: (page: number | ((prev: number) => number)) => void;
    totalItems: number;
    totalPages: number;
    
    // 🌟 پراپ‌های جدید برای مدیریت چک‌باکس‌ها
    selectedContactIds: string[];
    setSelectedContactIds: React.Dispatch<React.SetStateAction<string[]>>;
}

const getRelativeTime = (dateString?: string) => {
    if (!dateString) return 'نامشخص';

    const localDateString = dateString
        .split('+')[0]
        .replace('Z', '')
        .trim()
        .replace(' ', 'T');

    const past = new Date(localDateString).getTime();
    const now = Date.now();

    const diffMs = Math.max(now - past, 0);

    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    const rtf = new Intl.RelativeTimeFormat('fa-IR', { numeric: 'auto' });

    if (diffDays > 0) {
        return rtf.format(-diffDays, 'day');
    } else if (diffHours > 0) {
        return rtf.format(-diffHours, 'hour');
    } else if (diffMinutes > 0) {
        return rtf.format(-diffMinutes, 'minute');
    } else {
        return 'همین الان';
    }
};

const ContactTable: React.FC<ContactTableProps> = ({
    paginatedContacts,
    appTags,
    renderPlatformIcon,
    setSelectedUser,
    onDeleteContact,
    pageSize,
    setPageSize,
    currentPage,
    setCurrentPage,
    totalItems,
    totalPages,
    selectedContactIds,
    setSelectedContactIds
}) => {
    
    // 🌟 لاجیک مربوط به انتخاب همه در این صفحه
    const isAllOnPageSelected = paginatedContacts.length > 0 && paginatedContacts.every(c => selectedContactIds.includes(c.id));
    
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = e.target.checked;
        if (isChecked) {
            const newIds = paginatedContacts.map(c => c.id).filter(id => !selectedContactIds.includes(id));
            setSelectedContactIds([...selectedContactIds, ...newIds]);
        } else {
            const pageIds = paginatedContacts.map(c => c.id);
            setSelectedContactIds(selectedContactIds.filter(id => !pageIds.includes(id)));
        }
    };

    // 🌟 لاجیک مربوط به انتخاب یک سطر
    const handleSelectRow = (id: string, isChecked: boolean) => {
        if (isChecked) {
            setSelectedContactIds([...selectedContactIds, id]);
        } else {
            setSelectedContactIds(selectedContactIds.filter(selectedId => selectedId !== id));
        }
    };

    return (
        <Card className="border-gray-100 dark:border-gray-800 shadow-sm p-0 overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse">
                    <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                        <tr>
                            {/* 🌟 هدر چک‌باکس انتخاب همه */}
                            <th className="p-4 w-[5%] text-center">
                                <input 
                                    type="checkbox" 
                                    checked={isAllOnPageSelected}
                                    onChange={handleSelectAll}
                                    className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 cursor-pointer bg-white dark:bg-gray-700 dark:border-gray-600" 
                                />
                            </th>
                            <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-[10%] text-center">کانال</th>
                            <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-[25%]">مشخصات مخاطب</th>
                            <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-[35%]">برچسب‌ها</th>
                            <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-[15%]">آخرین تعامل</th>
                            <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-[10%] text-center">عملیات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
                        {paginatedContacts.length > 0 ? paginatedContacts.map((contact) => {
                            const isSelected = selectedContactIds.includes(contact.id);
                            
                            return (
                                // 🌟 اگر سطر انتخاب شده بود، بک‌گراند آبی ملایم بگیرد
                                <tr 
                                    key={contact.id} 
                                    className={`transition-colors group ${isSelected ? 'bg-indigo-50/40 dark:bg-indigo-900/20' : 'hover:bg-gray-50/50 dark:hover:bg-gray-800/30'}`}
                                >
                                    {/* 🌟 چک‌باکس این سطر */}
                                    <td className="p-4 text-center align-middle">
                                        <input 
                                            type="checkbox" 
                                            checked={isSelected}
                                            onChange={(e) => handleSelectRow(contact.id, e.target.checked)}
                                            className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 cursor-pointer bg-white dark:bg-gray-700 dark:border-gray-600" 
                                        />
                                    </td>
                                    
                                    <td className="p-4 text-center align-middle">
                                        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto border border-gray-200 dark:border-gray-700">
                                            {renderPlatformIcon(contact.platformName as Platform)}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div 
                                            className="flex items-center gap-3 cursor-pointer p-2 -ml-2 rounded-xl hover:bg-white dark:hover:bg-gray-800 transition-colors group"
                                            onClick={() => setSelectedUser(contact)}
                                        >
                                            <Avatar size={40} shape="circle" className="bg-indigo-50 text-indigo-600 font-bold border border-indigo-100 dark:border-indigo-900 group-hover:scale-105 transition-transform">
                                                {contact.fullName ? contact.fullName.charAt(0) : '؟'}
                                            </Avatar>                       
                                            <div className="flex flex-col">
                                                <span className="font-bold text-sm text-gray-800 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                    {contact.fullName || 'کاربر ناشناس'}
                                                </span>
                                                
                                                {contact.phoneNumber && (
                                                    <span className="text-[10px] text-gray-400 mt-0.5">
                                                    موبایل: <span dir="ltr">{contact.phoneNumber}</span>
                                                    </span>
                                                )}
                                                
                                                {contact.userNameInPlatform && (
                                                    <span className="text-[10px] text-gray-400 mt-0.5">
                                                        آیدی: <span dir="ltr">{contact.userNameInPlatform}</span>
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-wrap gap-1.5">
                                            {contact.tags && contact.tags.length > 0 ? (
                                                contact.tags.map((tag: any) => (
                                                    <span 
                                                        key={tag.id} 
                                                        className={`text-[10px] font-bold px-2 py-1 rounded-lg border ${tag.color || availableTagThemes[6].class}`}
                                                    >
                                                        {tag.name}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-[10px] text-gray-400">بدون برچسب</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                            {contact.lastActivity && (
                                                <span className="text-[10px] text-gray-500 block mt-1">
                                                    {getRelativeTime(contact.lastActivity)}
                                                </span>
                                            )}                                    
                                        </div>
                                    </td>
                                    <td className="p-4 text-center">
                                        <Tooltip title="حذف مخاطب" placement="top">
                                            <button 
                                                onClick={() => onDeleteContact(contact.id)}
                                                className="p-2 text-red-500 bg-red-50 hover:bg-red-500 hover:text-white dark:bg-red-900/20 dark:hover:bg-red-600 rounded-lg transition-colors"
                                            >
                                                <HiOutlineTrash className="text-lg" />
                                            </button>
                                        </Tooltip>

                                        <Tooltip title="مشاهده پروفایل" placement="top">
                                            <button
                                                onClick={() => setSelectedUser(contact)}
                                                className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50/80 dark:hover:bg-emerald-900/30 rounded-xl transition-all duration-300"
                                            >
                                                <LuUserSquare2 className="text-[1.3rem]" />
                                            </button>   
                                        </Tooltip>
                                    </td>
                                </tr>
                            )
                        }) : (
                            <tr>
                                <td colSpan={7} className="p-10 text-center text-gray-400 text-sm">
                                    مخاطبی یافت نشد.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* صفحه‌بندی (بدون تغییر) */}
            <div className="flex flex-col sm:flex-row items-center justify-between p-4 gap-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20">
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <span>نمایش</span>
                    <select 
                        value={pageSize} 
                        onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-1 font-bold text-gray-700 dark:text-gray-200 focus:outline-none cursor-pointer"
                    >
                        {[5, 10, 25, 50].map(size => (
                            <option key={size} value={size}>
                                {new Intl.NumberFormat('fa-IR').format(size)}
                            </option>
                        ))}
                    </select>
                    <span>رکورد از مجموع <span className="font-bold text-gray-700 dark:text-gray-200">{new Intl.NumberFormat('fa-IR').format(totalItems)}</span> مخاطب</span>
                </div>

                <div className="flex items-center gap-1.5" dir="ltr">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className={`p-2 rounded-xl border text-lg transition-all ${currentPage === 1 ? 'bg-gray-100 border-gray-100 text-gray-400 dark:bg-gray-800/40 dark:border-transparent dark:text-gray-600 cursor-not-allowed' : 'bg-white border-gray-200 text-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                    >
                        <HiChevronLeft />
                    </button>
                    <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${currentPage === page ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                            >
                                {new Intl.NumberFormat('fa-IR').format(page)}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className={`p-2 rounded-xl border text-lg transition-all ${currentPage === totalPages ? 'bg-gray-100 border-gray-100 text-gray-400 dark:bg-gray-800/40 dark:border-transparent dark:text-gray-600 cursor-not-allowed' : 'bg-white border-gray-200 text-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                    >
                        <HiChevronRight />
                    </button>
                </div>
            </div>
        </Card>
    )
}

export default ContactTable;