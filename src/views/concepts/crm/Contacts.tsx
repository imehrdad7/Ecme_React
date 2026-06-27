import { useState, useMemo, useRef } from 'react'
import { 
    HiOutlineSearch, HiOutlineFilter, HiOutlineDownload, 
    HiOutlineUser, HiOutlineTag, HiX, HiOutlinePhone, 
    HiOutlineClock, HiOutlinePlus, HiOutlineSave,
    HiChevronRight, HiChevronLeft, HiOutlineTrash, HiCheck,
    HiOutlineUpload, HiOutlineDocumentDownload, HiOutlineDocumentText, HiCheckCircle,
    HiOutlineCamera, HiOutlineDeviceMobile, HiOutlinePencil
} from 'react-icons/hi'
import { FaTelegramPlane, FaInstagram, FaWhatsapp, FaGlobe } from 'react-icons/fa'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Avatar from '@/components/ui/Avatar'
import Dialog from '@/components/ui/Dialog'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { useEffect } from 'react'

type Platform = 'Telegram' | 'Instagram' | 'WhatsApp' | 'Web'

type Contact = {
    id: string
    name: string
    handle: string
    platform: Platform
    tags: string[]
    lastActive: string
    joinDate: string
    sessionCount: number
    avatar?: string // 🌟 اضافه شدن آواتار اختصاصی
}

// دیتای اولیه
const initialContacts: Contact[] = [
    { id: 'usr-101', name: 'مهرداد نصیری', handle: '@Mehrdad_Dev', platform: 'Telegram', tags: ['مشتری وفادار', 'توسعه‌دهنده'], lastActive: '۱۰ دقیقه پیش', joinDate: '۱۴۰۳/۰۱/۱۵', sessionCount: 42 },
    { id: 'usr-102', name: 'پشتیبانی باماسان', handle: 'info@bamasan.ir', platform: 'Web', tags: ['B2B', 'لید داغ'], lastActive: '۲ ساعت پیش', joinDate: '۱۴۰۳/۰۲/۲۰', sessionCount: 8 },
    { id: 'usr-103', name: 'سارا احمدی', handle: '+989123456789', platform: 'WhatsApp', tags: ['نیاز به پیگیری'], lastActive: 'دیروز', joinDate: '۱۴۰۳/۰۳/۰۵', sessionCount: 3 },
    { id: 'usr-104', name: 'کاربر مهمان ۵۴۲', handle: 'IP: 185.12.44.1', platform: 'Web', tags: ['بازدیدکننده'], lastActive: '۳ روز پیش', joinDate: '۱۴۰۳/۰۳/۱۰', sessionCount: 1 },
    { id: 'usr-105', name: 'علی رضایی', handle: '@ali_rezaei_design', platform: 'Instagram', tags: ['همکاری'], lastActive: 'هفته پیش', joinDate: '۱۴۰۲/۱۱/۲۵', sessionCount: 15 },
]

// پالت رنگی استاندارد برای تگ‌ها
const availableTagThemes = [
    { id: 'emerald', class: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800', color: '#10b981' },
    { id: 'indigo', class: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800', color: '#6366f1' },
    { id: 'blue', class: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800', color: '#3b82f6' },
    { id: 'rose', class: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 border-rose-200 dark:border-rose-800', color: '#f43f5e' },
    { id: 'amber', class: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800', color: '#f59e0b' },
    { id: 'purple', class: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-800', color: '#a855f7' },
    { id: 'gray', class: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700', color: '#6b7280' },
]

const initialTagColors: Record<string, string> = {
    'مشتری وفادار': availableTagThemes[0].class,
    'توسعه‌دهنده': availableTagThemes[1].class,
    'B2B': availableTagThemes[2].class,
    'لید داغ': availableTagThemes[3].class,
    'نیاز به پیگیری': availableTagThemes[4].class,
    'همکاری': availableTagThemes[5].class,
    'بازدیدکننده': availableTagThemes[6].class,
}

const ContactsCRM = () => {
    // استیت‌های دیتابیس کاربران و فیلترها
    const [contacts, setContacts] = useState<Contact[]>(initialContacts)
    const [searchQuery, setSearchQuery] = useState('')
    const [filterPlatform, setFilterPlatform] = useState<Platform | 'All'>('All')
    const [selectedUser, setSelectedUser] = useState<Contact | null>(null)
    const [isExporting, setIsExporting] = useState(false)
    const [filterTag, setFilterTag] = useState<string | 'All'>('All') // 🌟 استیت جدید برای فیلتر تگ

    // استیت‌های صفحه‌بندی
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)

    // استیت‌های سیستم مدیریت برچسب‌ها
    const [appTags, setAppTags] = useState<Record<string, string>>(initialTagColors)
    const [isTagModalOpen, setIsTagModalOpen] = useState(false)
    const [newTagName, setNewTagName] = useState('')
    const [selectedThemeId, setSelectedThemeId] = useState(availableTagThemes[1].id)

    // استیت‌های مودال افزودن دستی
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isAdding, setIsAdding] = useState(false)
    const [newContactData, setNewContactData] = useState({ name: '', handle: '', platform: 'WhatsApp' as Platform, tags: [] as string[] })

    // 🌟 استیت‌های سیستم ایمپورت (Import)
    const [isImportModalOpen, setIsImportModalOpen] = useState(false)
    const [importStep, setImportStep] = useState<1 | 2>(1)
    const [isImporting, setIsImporting] = useState(false)
    const [importedPreviewData, setImportedPreviewData] = useState<{name: string, handle: string}[]>([])
    const [bulkPlatform, setBulkPlatform] = useState<Platform>('WhatsApp')
    const [bulkTags, setBulkTags] = useState<string[]>([])
    const [isEditingDrawerTags, setIsEditingDrawerTags] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    // محاسبه فیلترها
   // 🌟 محاسبه فیلترها (ارتقا یافته با فیلتر تگ)
    const filteredContacts = useMemo(() => {
        return contacts.filter(contact => {
            const matchesSearch = contact.name.includes(searchQuery) || contact.handle.includes(searchQuery)
            const matchesPlatform = filterPlatform === 'All' || contact.platform === filterPlatform
            const matchesTag = filterTag === 'All' || contact.tags.includes(filterTag)
            
            return matchesSearch && matchesPlatform && matchesTag
        })
    }, [contacts, searchQuery, filterPlatform, filterTag])
    // محاسبه رکوردهای صفحه‌بندی
    const totalItems = filteredContacts.length
    const totalPages = Math.ceil(totalItems / pageSize) || 1
    const paginatedContacts = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize
        return filteredContacts.slice(startIndex, startIndex + pageSize)
    }, [filteredContacts, currentPage, pageSize])

    const handleSearchChange = (value: string) => {
        setSearchQuery(value)
        setCurrentPage(1)
    }

    const handlePlatformChange = (plat: Platform | 'All') => {
        setFilterPlatform(plat)
        setCurrentPage(1)
    }

    // 🌟 هندلر تغییر فیلتر تگ
    const handleTagFilterChange = (tag: string | 'All') => {
        setFilterTag(tag)
        setCurrentPage(1)
    }
    const handleExportCSV = async () => {
        setIsExporting(true)
        await new Promise(resolve => setTimeout(resolve, 1500))
        setIsExporting(false)
        toast.push(<Notification type="success" title="موفقیت‌آمیز">فایل اکسل مخاطبین آماده دانلود است.</Notification>, { placement: 'top-center' })
    }

    // --- منطق مدیریت تگ‌ها ---
    const handleCreateAppTag = () => {
        const trimmedName = newTagName.trim()
        if (!trimmedName) return toast.push(<Notification type="danger" title="خطا">نام تگ نمی‌تواند خالی باشد.</Notification>, { placement: 'top-center' })
        if (appTags[trimmedName]) return toast.push(<Notification type="warning" title="تکراری">این تگ قبلاً ایجاد شده است.</Notification>, { placement: 'top-center' })

        const themeClass = availableTagThemes.find(t => t.id === selectedThemeId)?.class || availableTagThemes[6].class
        setAppTags(prev => ({ ...prev, [trimmedName]: themeClass }))
        setNewTagName('')
        toast.push(<Notification type="success" title="موفقیت">تگ جدید ایجاد شد.</Notification>, { placement: 'top-center' })
    }

    const handleDeleteAppTag = (tagName: string) => {
        const newTags = { ...appTags }
        delete newTags[tagName]
        setAppTags(newTags)
        
        setContacts(prev => prev.map(c => ({ ...c, tags: c.tags.filter(t => t !== tagName) })))
        if(selectedUser) {
            setSelectedUser({ ...selectedUser, tags: selectedUser.tags.filter(t => t !== tagName) })
        }
    }

    // --- منطق افزودن کاربر جدید ---
    const toggleContactTag = (tag: string) => {
        if (isAdding) return;
        setNewContactData(prev => {
            const tags = prev.tags.includes(tag) ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag]
            return { ...prev, tags }
        })
    }

    const toggleDrawerTag = (tag: string) => {
        if (!selectedUser) return;
        const newTags = selectedUser.tags.includes(tag) 
            ? selectedUser.tags.filter(t => t !== tag) 
            : [...selectedUser.tags, tag];
            
        const updatedUser = { ...selectedUser, tags: newTags };
        setSelectedUser(updatedUser);
        setContacts(prev => prev.map(c => c.id === updatedUser.id ? updatedUser : c));
    }
    // 🌟 آپلود آواتار مخاطب
    const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !selectedUser) return;
        
        const imageUrl = URL.createObjectURL(file);
        const updatedUser = { ...selectedUser, avatar: imageUrl };
        setSelectedUser(updatedUser);
        setContacts(prev => prev.map(c => c.id === updatedUser.id ? updatedUser : c));
        toast.push(<Notification type="success" title="آواتار تغییر کرد">عکس پروفایل مخاطب با موفقیت به‌روزرسانی شد.</Notification>, { placement: 'top-center' })
    }
    
    const handleAddNewContact = async () => {
        if (!newContactData.name.trim() || !newContactData.handle.trim()) {
            return toast.push(<Notification type="danger" title="خطا">لطفاً نام و آیدی/شماره مخاطب را وارد کنید.</Notification>, { placement: 'top-center' })
        }
        setIsAdding(true)
        try {
            await new Promise(resolve => setTimeout(resolve, 1000))
            const newContact: Contact = {
                id: `usr-${Date.now().toString().slice(-4)}`,
                name: newContactData.name, handle: newContactData.handle, platform: newContactData.platform,
                tags: newContactData.tags.length > 0 ? newContactData.tags : [],
                lastActive: 'همین الان', joinDate: new Date().toLocaleDateString('fa-IR'), sessionCount: 0
            }
            setContacts([newContact, ...contacts])
            setIsAddModalOpen(false)
            setNewContactData({ name: '', handle: '', platform: 'WhatsApp', tags: [] })
            toast.push(<Notification type="success" title="موفقیت">مخاطب جدید اضافه شد.</Notification>, { placement: 'top-center' })
        } finally { setIsAdding(false) }
    }

    // 🌟 منطق ایمپورت فایل اکسل
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsImporting(true)
        // شبیه‌سازی خواندن فایل اکسل و استخراج داده‌ها
        setTimeout(() => {
            setImportedPreviewData([
                { name: 'علی کریمی', handle: '09121111111' },
                { name: 'شرکت آلفا', handle: 'alpha_co@gmail.com' },
                { name: 'زهرا موسوی', handle: '@zahra_m' },
                { name: 'رضا احمدی', handle: '09350000000' },
                { name: 'لید نمایشگاه', handle: '02188888888' },
            ])
            setImportStep(2)
            setIsImporting(false)
        }, 1500)
    }

    const toggleBulkTag = (tag: string) => {
        setBulkTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])
    }

    const handleSubmitImport = async () => {
        setIsImporting(true)
        try {
            await new Promise(resolve => setTimeout(resolve, 1200)) // شبیه‌سازی ذخیره در دیتابیس
            const newContacts: Contact[] = importedPreviewData.map((d, index) => ({
                id: `usr-imp-${Date.now().toString().slice(-4)}-${index}`,
                name: d.name,
                handle: d.handle,
                platform: bulkPlatform,
                tags: bulkTags.length > 0 ? bulkTags : [],
                lastActive: 'همین الان',
                joinDate: new Date().toLocaleDateString('fa-IR'),
                sessionCount: 0
            }))

            setContacts(prev => [...newContacts, ...prev])
            toast.push(<Notification type="success" title="ایمپورت موفق">تعداد {newContacts.length} مخاطب با موفقیت به سیستم اضافه شد.</Notification>, { placement: 'top-center' })
            
            // ریست کردن مودال
            setIsImportModalOpen(false)
            setTimeout(() => {
                setImportStep(1)
                setImportedPreviewData([])
                setBulkTags([])
            }, 300)

        } finally {
            setIsImporting(false)
        }
    }

    const renderPlatformIcon = (platform: Platform, sizeClass: string = 'text-lg') => {
        switch (platform) {
            case 'Telegram': return <FaTelegramPlane className={`${sizeClass} text-sky-500`} />
            case 'Instagram': return <FaInstagram className={`${sizeClass} text-pink-600`} />
            case 'WhatsApp': return <FaWhatsapp className={`${sizeClass} text-green-500`} />
            case 'Web': return <FaGlobe className={`${sizeClass} text-indigo-500`} />
        }
    }

    const getPlatformTheme = (platform: Platform) => {
        switch (platform) {
            case 'Telegram': return 'from-sky-400 to-blue-600'
            case 'WhatsApp': return 'from-green-400 to-emerald-600'
            case 'Instagram': return 'from-purple-500 via-pink-500 to-orange-400'
            case 'Web': return 'from-indigo-400 to-violet-600'
        }
    }

    return (
        <div className="flex flex-col gap-6 w-full h-full pb-8 relative animate-[fadeIn_0.3s_ease-out]" dir="rtl">
            
            {/* هدر */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">مدیریت مخاطبین</h3>
                    <p className="text-sm text-gray-500 mt-1">دیتابیس یکپارچه کاربران از تمامی کانال‌های ارتباطی</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <Button variant="plain" onClick={() => setIsTagModalOpen(true)} className="font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50" icon={<HiOutlineTag />}>
                        مدیریت برچسب‌ها
                    </Button>
                    {/* 🌟 دکمه ایمپورت اضافه شد */}
                    <Button variant="plain" icon={<HiOutlineUpload />} onClick={() => setIsImportModalOpen(true)} className="font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700">
                        ایمپورت Excel
                    </Button>
                    <Button variant="plain" icon={<HiOutlineDownload />} loading={isExporting} onClick={handleExportCSV} className="font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700">
                        خروجی Excel
                    </Button>
                    <Button variant="solid" onClick={() => setIsAddModalOpen(true)} className="bg-gray-900 hover:bg-black dark:bg-white dark:text-gray-900 font-bold shadow-md" icon={<HiOutlinePlus />}>
                        افزودن دستی
                    </Button>
                </div>
            </div>

            {/* فیلترها */}
            <Card className="p-4 border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
                <div className="flex flex-col md:flex-row items-center gap-4 w-full">
                    <div className="flex-1 w-full relative">
                        <Input 
                            placeholder="جستجوی نام، آیدی، شماره موبایل..." 
                            value={searchQuery}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            prefix={<HiOutlineSearch className="text-lg text-gray-400" />}
                            className="bg-gray-50 dark:bg-gray-800/50"
                        />
                    </div>
                    
                    <div className="w-full md:w-auto flex items-center gap-3 overflow-x-auto pb-2 md:pb-0 custom-scrollbar">
                        {/* 🌟 بخش فیلتر تگ‌ها (جدید) */}
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-400 ml-1 whitespace-nowrap"><HiOutlineTag className="inline mr-1"/> برچسب:</span>
                            <select
                                value={filterTag}
                                onChange={(e) => handleTagFilterChange(e.target.value)}
                                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none  min-w-[120px] cursor-pointer"
                            >
                                <option 
                                    value="All" 
                                    className="bg-white text-gray-700 dark:bg-gray-800 dark:text-gray-200"
                                >
                                    همه برچسب‌ها
                                </option>
                                
                                {Object.keys(appTags).map(tag => (
                                    <option 
                                        key={tag} 
                                        value={tag} 
                                        className="bg-white text-gray-700 dark:bg-gray-800 dark:text-gray-200"
                                    >
                                        {tag}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* بخش فیلتر پلتفرم‌ها */}
                        <div className="flex items-center gap-2 border-r border-gray-200 dark:border-gray-700 pr-3">
                            <span className="text-xs font-bold text-gray-400 ml-1 whitespace-nowrap"><HiOutlineFilter className="inline mr-1"/> پلتفرم:</span>
                            {['All', 'Telegram', 'WhatsApp', 'Instagram', 'Web'].map((plat) => (
                                <button
                                    key={plat}
                                    onClick={() => handlePlatformChange(plat as Platform | 'All')}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border whitespace-nowrap ${filterPlatform === plat ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-transparent border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                                >
                                    {plat === 'All' ? 'همه' : plat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </Card>

            {/* جدول داده‌ها */}
            <Card className="border-gray-100 dark:border-gray-800 shadow-sm p-0 overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-right border-collapse">
                        <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                            <tr>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-10 text-center">کانال</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">مشخصات مخاطب</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">آیدی / شماره</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">برچسب‌ها</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">آخرین تعامل</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">عملیات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
                            {paginatedContacts.length > 0 ? paginatedContacts.map((contact) => (
                                <tr key={contact.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors group">
                                    <td className="p-4 text-center align-middle">
                                        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto border border-gray-200 dark:border-gray-700">
                                            {renderPlatformIcon(contact.platform)}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <Avatar size={40} shape="circle" className="bg-indigo-50 text-indigo-600 font-bold border border-indigo-100 dark:border-indigo-900">{contact.name[0]}</Avatar>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-sm text-gray-800 dark:text-gray-100">{contact.name}</span>
                                                <span className="text-[10px] text-gray-400">شناسه: {contact.id}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="text-sm font-mono text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 px-2 py-1 rounded-md border border-gray-100 dark:border-gray-800" dir="ltr">
                                            {contact.handle}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-wrap gap-1.5">
                                            {contact.tags.map(tag => (
                                                <span key={tag} className={`text-[10px] font-bold px-2 py-1 rounded-lg border ${appTags[tag] || availableTagThemes[6].class}`}>
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                            <HiOutlineClock className="text-base" /> {contact.lastActive}
                                        </div>
                                    </td>
                                    <td className="p-4 text-center">
                                        <Button size="sm" variant="plain" onClick={() => setSelectedUser(contact)} className="text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity font-bold bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50">
                                            مشاهده پروفایل
                                        </Button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="p-10 text-center text-gray-400 text-sm">
                                        مخاطبی یافت نشد.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* صفحه‌بندی */}
                <div className="flex flex-col sm:flex-row items-center justify-between p-4 gap-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20">
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <span>نمایش</span>
                        <select 
                            value={pageSize} 
                            onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-1 font-bold text-gray-700 dark:text-gray-200 focus:outline-none"
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

            {/* 🌟 مودال جدید: ایمپورت مخاطبین (Import Excel/CSV) */}
            <Dialog
                isOpen={isImportModalOpen}
                onClose={() => !isImporting && setIsImportModalOpen(false)}
                closable={false}
                width={550}
                contentClassName="p-0 border-0 bg-white dark:bg-gray-900 shadow-2xl rounded-3xl overflow-hidden"
            >
                <div className="flex flex-col">
                    <div className="relative bg-emerald-50 dark:bg-emerald-900/20 border-b border-emerald-100 dark:border-emerald-800/30 p-6 flex items-center gap-4">
                        <button onClick={() => setIsImportModalOpen(false)} disabled={isImporting} className="absolute top-5 left-5 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                            <HiX className="text-xl" />
                        </button>
                        <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-800/50 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center flex-shrink-0">
                            <HiOutlineUpload className="text-2xl" />
                        </div>
                        <div>
                            <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100">ایمپورت مخاطبین</h4>
                            <p className="text-xs text-gray-500 mt-1">
                                {importStep === 1 ? 'فایل اکسل مخاطبین خود را بارگذاری کنید.' : 'پیش‌نمایش داده‌ها و تعیین گروه‌بندی'}
                            </p>
                        </div>
                    </div>

                    <div className="p-6 flex flex-col gap-6" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
                        {importStep === 1 && (
                            <div className="flex flex-col gap-6 animate-[fadeIn_0.3s_ease-out]">
                                {/* دانلود نمونه فایل */}
                                <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl flex items-center justify-center shadow-sm text-emerald-500">
                                            <HiOutlineDocumentText className="text-xl" />
                                        </div>
                                        <div>
                                            <span className="block text-sm font-bold text-gray-800 dark:text-gray-200">فایل نمونه استاندارد</span>
                                            <span className="text-xs text-gray-500">برای مشاهده ساختار ستون‌ها دانلود کنید.</span>
                                        </div>
                                    </div>
                                    <Button size="sm" variant="plain" icon={<HiOutlineDocumentDownload />} className="font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400">
                                        دانلود فایل
                                    </Button>
                                </div>

                                {/* باکس آپلود */}
                                <div className="relative border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 rounded-3xl p-10 flex flex-col items-center justify-center text-center transition-colors hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 group cursor-pointer">
                                    <input 
                                        type="file" 
                                        accept=".xlsx, .xls, .csv" 
                                        onChange={handleFileUpload}
                                        disabled={isImporting}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" 
                                    />
                                    {isImporting ? (
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-500 rounded-full animate-spin"></div>
                                            <span className="text-sm font-bold text-gray-600 dark:text-gray-300">در حال پردازش فایل...</span>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="w-16 h-16 bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-700 rounded-full flex items-center justify-center mb-4 text-gray-400 group-hover:text-emerald-500 transition-colors">
                                                <HiOutlineUpload className="text-3xl" />
                                            </div>
                                            <h5 className="font-bold text-gray-800 dark:text-gray-100 text-base">فایل خود را اینجا رها کنید</h5>
                                            <p className="text-xs text-gray-500 mt-2">پشتیبانی از فرمت‌های XLSX و CSV (حداکثر ۵ مگابایت)</p>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        {importStep === 2 && (
                            <div className="flex flex-col gap-6 animate-[fadeIn_0.3s_ease-out]">
                                {/* خلاصه وضعیت */}
                                <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/30 p-4 rounded-xl flex items-center gap-3">
                                    <HiCheckCircle className="text-2xl flex-shrink-0" />
                                    <p className="text-sm font-bold leading-relaxed">
                                        فایل با موفقیت بررسی شد. <br />
                                        <span className="text-lg text-emerald-600 dark:text-emerald-400 mx-1">{importedPreviewData.length}</span> ردیف (مخاطب) آماده ورود به دیتابیس است.
                                    </p>
                                </div>

                                {/* پیش‌نمایش جدول */}
                                <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-inner">
                                    <div className="bg-gray-50 dark:bg-gray-800/50 p-2 text-xs font-bold text-gray-500 border-b border-gray-200 dark:border-gray-700 text-center">
                                        پیش‌نمایش ۵ رکورد اول
                                    </div>
                                    <div className="max-h-40 overflow-y-auto custom-scrollbar bg-white dark:bg-gray-900 p-2">
                                        {importedPreviewData.map((d, i) => (
                                            <div key={i} className="flex justify-between items-center p-2 text-sm border-b border-gray-100 dark:border-gray-800 last:border-0">
                                                <span className="font-bold text-gray-800 dark:text-gray-200">{d.name}</span>
                                                <span className="text-gray-500 font-mono text-xs" dir="ltr">{d.handle}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* تنظیمات گروه‌بندی (پلتفرم) */}
                                <div className="flex flex-col gap-3">
                                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1">پلتفرم ورودی برای همه این مخاطبین</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {['WhatsApp', 'Telegram', 'Instagram', 'Web'].map(plat => (
                                            <div 
                                                key={plat}
                                                onClick={() => !isImporting && setBulkPlatform(plat as Platform)}
                                                className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${bulkPlatform === plat ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 shadow-sm' : 'border-gray-100 dark:border-gray-800 text-gray-500 hover:border-gray-200 dark:hover:bg-gray-800/50'}`}
                                            >
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${bulkPlatform === plat ? 'bg-emerald-100 dark:bg-emerald-900/50' : 'bg-gray-100 dark:bg-gray-800'}`}>
                                                    {renderPlatformIcon(plat as Platform, 'text-lg')}
                                                </div>
                                                <span className="text-sm font-bold">{plat}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* اختصاص تگ گروهی */}
                                <div className="flex flex-col gap-3">
                                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1">افزودن برچسب (Tag) به همه مخاطبین لیست</label>
                                    <div className="flex flex-wrap gap-2">
                                        {Object.keys(appTags).map(tag => {
                                            const isSelected = bulkTags.includes(tag);
                                            return (
                                                <button
                                                    key={tag}
                                                    onClick={() => toggleBulkTag(tag)}
                                                    disabled={isImporting}
                                                    className={`text-xs font-bold px-3 py-2 rounded-lg border transition-all duration-200 ${
                                                        isSelected 
                                                            ? `${appTags[tag]} shadow-sm ring-2 ring-emerald-500/20 scale-105` 
                                                            : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                                                    }`}
                                                >
                                                    {tag}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>

                            </div>
                        )}
                    </div>

                    {/* فوتر مودال */}
                    {importStep === 2 && (
                        <div className="p-5 border-t border-gray-100 dark:border-gray-800 flex gap-3 bg-gray-50/50 dark:bg-gray-800/20">
                            <Button className="flex-1 font-bold" onClick={() => setImportStep(1)} disabled={isImporting}>بازگشت</Button>
                            <Button className="flex-[2] bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md" loading={isImporting} onClick={handleSubmitImport} icon={<HiOutlineSave />}>
                                تایید و ورود اطلاعات به دیتابیس
                            </Button>
                        </div>
                    )}
                </div>
            </Dialog>

            {/* بقیه مودال‌ها (مودال افزودن دستی، مدیریت تگ‌ها، کشوی پروفایل) به دلیل طولانی نشدن در اینجا خلاصه شده است، اما با کدهای قبلی شما دقیقاً یکسان است. فقط جایگذاری کنید. */}
            
            {/* مودال مدیریت تگ‌ها */}
            <Dialog isOpen={isTagModalOpen} onClose={() => setIsTagModalOpen(false)} closable={false} width={500} contentClassName="p-0 border-0 bg-white dark:bg-gray-900 shadow-2xl rounded-2xl overflow-hidden">
                <div className="flex flex-col">
                    <div className="relative bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800/80 p-6 flex items-center gap-4">
                        <button onClick={() => setIsTagModalOpen(false)} className="absolute top-5 left-5 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-200 transition-colors">
                            <HiX className="text-xl" />
                        </button>
                        <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center flex-shrink-0">
                            <HiOutlineTag className="text-2xl" />
                        </div>
                        <div>
                            <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100">مدیریت برچسب‌ها (Tags)</h4>
                            <p className="text-xs text-gray-500 mt-1">ساخت و حذف برچسب برای دسته‌بندی بهتر مخاطبین</p>
                        </div>
                    </div>

                    <div className="p-6 flex flex-col gap-6 custom-scrollbar" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
                        <div className="bg-gray-50/50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800 p-4 rounded-2xl flex flex-col gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1">نام برچسب جدید</label>
                                <div className="flex gap-2">
                                    <Input placeholder="مثال: مشتری VIP" value={newTagName} onChange={(e) => setNewTagName(e.target.value)} className="bg-white dark:bg-gray-900 flex-1" onKeyDown={(e) => e.key === 'Enter' && handleCreateAppTag()} />
                                    <Button variant="solid" className="bg-indigo-600 hover:bg-indigo-700 font-bold" onClick={handleCreateAppTag}>افزودن</Button>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1">رنگ برچسب</label>
                                <div className="flex items-center gap-2 flex-wrap">
                                    {availableTagThemes.map(theme => (
                                        <button key={theme.id} onClick={() => setSelectedThemeId(theme.id)} style={{ backgroundColor: theme.color }} className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110 ${selectedThemeId === theme.id ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-900 ring-indigo-500' : ''}`}>
                                            {selectedThemeId === theme.id && <HiCheck className="text-white text-sm drop-shadow-md" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <h5 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-1 border-b border-gray-100 dark:border-gray-800 pb-2">لیست برچسب‌های فعلی</h5>
                            {Object.entries(appTags).map(([tagName, themeClass]) => (
                                <div key={tagName} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                                    <span className={`text-xs font-bold px-3 py-1.5 rounded-lg border ${themeClass}`}>{tagName}</span>
                                    <button onClick={() => handleDeleteAppTag(tagName)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 p-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
                                        <HiOutlineTrash className="text-lg" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </Dialog>

            {/* مودال افزودن دستی کاربر */}
            <Dialog isOpen={isAddModalOpen} onClose={() => !isAdding && setIsAddModalOpen(false)} closable={false} width={500} contentClassName="p-0 border-0 bg-white dark:bg-gray-900 shadow-2xl rounded-2xl overflow-hidden">
                <div className="flex flex-col">
                    <div className="relative bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800/80 p-6 flex items-center gap-4">
                        <button onClick={() => setIsAddModalOpen(false)} disabled={isAdding} className="absolute top-5 left-5 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"><HiX className="text-xl" /></button>
                        <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center flex-shrink-0"><HiOutlineUser className="text-2xl" /></div>
                        <div><h4 className="text-lg font-bold text-gray-800 dark:text-gray-100">افزودن مخاطب جدید</h4><p className="text-xs text-gray-500 mt-1">مشخصات لید یا مشتری جدید را وارد کنید.</p></div>
                    </div>

                    <div className="p-6 flex flex-col gap-6 custom-scrollbar" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                        <div className="flex flex-col gap-2"><label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1">نام کامل مخاطب <span className="text-red-500">*</span></label><Input placeholder="مثال: علی رضایی" value={newContactData.name} onChange={(e) => setNewContactData({ ...newContactData, name: e.target.value })} disabled={isAdding} className="bg-gray-50/50 dark:bg-gray-800/50" /></div>
                        <div className="flex flex-col gap-2"><label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1">شماره موبایل، آیدی یا ایمیل <span className="text-red-500">*</span></label><Input placeholder="مثال: 09123456789" value={newContactData.handle} onChange={(e) => setNewContactData({ ...newContactData, handle: e.target.value })} disabled={isAdding} dir="ltr" className="bg-gray-50/50 dark:bg-gray-800/50 text-left" /></div>
                        
                        <div className="flex flex-col gap-3">
                            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1">پلتفرم ارتباطی</label>
                            <div className="grid grid-cols-2 gap-3">
                                {['WhatsApp', 'Telegram', 'Instagram', 'Web'].map(plat => (
                                    <div key={plat} onClick={() => !isAdding && setNewContactData({ ...newContactData, platform: plat as Platform })} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${newContactData.platform === plat ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 shadow-sm' : 'border-gray-100 dark:border-gray-800 text-gray-500 hover:border-gray-200 dark:hover:bg-gray-800/50'}`}>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${newContactData.platform === plat ? 'bg-indigo-100 dark:bg-indigo-900/50' : 'bg-gray-100 dark:bg-gray-800'}`}>{renderPlatformIcon(plat as Platform, 'text-lg')}</div>
                                        <span className="text-sm font-bold">{plat}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1 flex justify-between items-center"><span>برچسب‌ها (Tags)</span></label>
                            <div className="flex flex-wrap gap-2">
                                {Object.keys(appTags).map(tag => {
                                    const isSelected = newContactData.tags.includes(tag);
                                    return (
                                        <button key={tag} onClick={() => toggleContactTag(tag)} disabled={isAdding} className={`text-xs font-bold px-3 py-2 rounded-lg border transition-all duration-200 ${isSelected ? `${appTags[tag]} shadow-sm ring-2 ring-indigo-500/20 scale-105` : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                                            {tag}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="p-5 border-t border-gray-100 dark:border-gray-800 flex gap-3 bg-gray-50/50 dark:bg-gray-800/20">
                        <Button className="flex-1 font-bold" onClick={() => setIsAddModalOpen(false)} disabled={isAdding}>انصراف</Button>
                        <Button className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md" loading={isAdding} onClick={handleAddNewContact} icon={<HiOutlineSave />}>ذخیره در دیتابیس</Button>
                    </div>
                </div>
            </Dialog>

            {/* کشوی پروفایل */}
            <div className={`fixed inset-0 z-50 flex justify-start transition-all duration-300 ${selectedUser ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
                <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={() => setSelectedUser(null)}></div>
                <div className={`relative w-full max-w-md h-full bg-white dark:bg-gray-900 shadow-2xl flex flex-col transform transition-transform duration-500 ease-in-out ${selectedUser ? 'translate-x-0' : '-translate-x-full'}`}>
                    {selectedUser && (
                        <>
                            <div className={`h-32 w-full bg-gradient-to-br ${getPlatformTheme(selectedUser.platform)} relative flex-shrink-0`}>
                                <button onClick={() => setSelectedUser(null)} className="absolute top-4 left-4 w-8 h-8 rounded-full bg-black/20 text-white flex items-center justify-center hover:bg-black/40 backdrop-blur-md transition-colors border border-white/10 z-10"><HiX className="text-lg" /></button>
                                <div className="absolute -bottom-4 -right-4 opacity-20 transform rotate-12 scale-150 text-white mix-blend-overlay">{renderPlatformIcon(selectedUser.platform, 'text-9xl')}</div>
                            </div>

                            <div className="px-6 relative flex-shrink-0">
                                {/* 🌟 آواتار با قابلیت آپلود (هاور برای ویرایش) */}
                                <div className="absolute -top-12 group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                    <input type="file" ref={fileInputRef} accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                                    <Avatar src={selectedUser.avatar} size={90} shape="circle" className="bg-white dark:bg-gray-800 text-indigo-600 font-black text-3xl border-4 border-white dark:border-gray-900 shadow-lg object-cover">
                                        {!selectedUser.avatar && selectedUser.name[0]}
                                    </Avatar>
                                    <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border-4 border-transparent">
                                        <HiOutlineCamera className="text-white text-2xl" />
                                    </div>
                                </div>
                                
                                <div className="absolute top-4 left-[90px] w-7 h-7 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-md border border-gray-100 dark:border-gray-700">{renderPlatformIcon(selectedUser.platform, 'text-sm')}</div>
                                <div className="mt-14 mb-6">
                                    <h2 className="text-2xl font-black text-gray-800 dark:text-gray-100">{selectedUser.name}</h2>
                                    <p className="text-sm text-gray-500 mt-1 font-mono" dir="ltr">{selectedUser.handle}</p>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto px-6 pb-6 flex flex-col gap-8 custom-scrollbar">
                                
                                {/* 🌟 دکمه‌های اکشن بهینه‌شده و مرتبط با CRM */}
                                <div className="flex gap-3">
                                    <Button variant="solid" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm" icon={renderPlatformIcon(selectedUser.platform)}>
                                        ارسال پیام ({selectedUser.platform})
                                    </Button>
                                    <Button variant="plain" title="تماس صوتی" className="w-12 h-12 flex-shrink-0 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"><HiOutlinePhone className="text-xl" /></Button>
                                    <Button variant="plain" title="ارسال پیامک (SMS)" className="w-12 h-12 flex-shrink-0 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"><HiOutlineDeviceMobile className="text-xl" /></Button>
                                </div>

                                <div className="bg-gray-50/50 dark:bg-gray-800/30 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 grid grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-1"><span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">تاریخ عضویت</span><span className="text-sm font-bold text-gray-800 dark:text-gray-100">{selectedUser.joinDate}</span></div>
                                    <div className="flex flex-col gap-1"><span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">تعداد نشست‌ها</span><span className="text-sm font-bold text-gray-800 dark:text-gray-100">{selectedUser.sessionCount} مکالمه</span></div>
                                    <div className="flex flex-col gap-1 col-span-2"><span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">آخرین بازدید</span><span className="text-sm font-bold text-gray-800 dark:text-gray-100">{selectedUser.lastActive}</span></div>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-bold text-gray-800 dark:text-gray-100 flex items-center gap-1.5"><HiOutlineTag className="text-lg text-indigo-500" /> دسته‌بندی و تگ‌ها</h4>
                                        <button onClick={() => setIsEditingDrawerTags(!isEditingDrawerTags)} className={`text-xs font-bold px-2 py-1 rounded-md transition-colors ${isEditingDrawerTags ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:bg-gray-100'}`}>
                                            {isEditingDrawerTags ? 'بستن ویرایشگر' : 'ویرایش تگ‌ها'} <HiOutlinePencil className="inline mb-0.5 ml-1"/>
                                        </button>
                                    </div>
                                    
                                    {/* نمایش حالت ویرایش تگ‌ها */}
                                    {isEditingDrawerTags ? (
                                        <div className="flex flex-wrap gap-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800 animate-[fadeIn_0.2s_ease-out]">
                                            {Object.keys(appTags).map(tag => {
                                                const isSelected = selectedUser.tags.includes(tag);
                                                return (
                                                    <button key={tag} onClick={() => toggleDrawerTag(tag)} className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all duration-200 ${isSelected ? `${appTags[tag]} shadow-sm ring-2 ring-indigo-500/20 scale-105` : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                                                        {tag}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    ) : (
                                        <div className="flex flex-wrap gap-2">
                                            {selectedUser.tags.map(tag => (
                                                <span key={tag} className={`text-xs font-bold px-3 py-1.5 rounded-lg border ${appTags[tag] || availableTagThemes[6].class}`}>{tag}</span>
                                            ))}
                                            {selectedUser.tags.length === 0 && <span className="text-xs text-gray-400">بدون برچسب</span>}
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col gap-3">
                                    <h4 className="text-sm font-bold text-gray-800 dark:text-gray-100 flex items-center gap-1.5"><HiOutlineUser className="text-lg text-indigo-500" /> اطلاعات تکمیلی (CRM)</h4>
                                    <Input textArea rows={3} placeholder="یادداشتی درباره این لید بنویسید..." className="bg-gray-50/50 text-sm" />
                                    <Button size="sm" className="w-full mt-2" variant="dashed">ذخیره اطلاعات تکمیلی</Button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                .custom-scrollbar::-webkit-scrollbar { height: 4px; width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 4px; }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #374151; }
            `}</style>
        </div>
    )
}

export default ContactsCRM