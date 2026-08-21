import { useState, useRef, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom'
import { 
    HiOutlineUsers, HiOutlineSearch, HiCheckCircle, 
    HiOutlineTag, HiCheck, HiOutlineCheck, HiOutlinePhone,
    HiChevronDown, HiOutlineX, HiOutlineFilter } from 'react-icons/hi'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { ContactDto } from './types'
import { apiAddContactsToCampaign, apiGetCampaignById, apiGetCampaignContactIds } from '@/services/CampaignService'
import { apiGetTags, apiGetContacts } from '@/services/ContactService'
import { useSessionUser } from '@/store/authStore' 
import { Platform } from '@/views/concepts/contacts/types'

const avatarColors = [
    'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
    'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
    'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400',
];

const mapPlatformToEnum = (platform: Platform | 'All'): number | undefined => {
    switch (platform) {
        case 'WhatsApp': return 1;
        case 'Telegram': return 2;
        case 'Instagram': return 3;
        case 'Web': return 4;
        case 'All': 
        default: return undefined; 
    }
}

const CampaignContacts = () => {
    const { campaignId } = useParams<{ campaignId: string }>()
    const navigate = useNavigate()
    const { user } = useSessionUser() 

    const [tags, setTags] = useState<any[]>([])
    const [contacts, setContacts] = useState<ContactDto[]>([]) 
    const [campaignPlatform, setCampaignPlatform] = useState<Platform | 'All'>('All')    
    
    const [activeFilters, setActiveFilters] = useState<string[]>(['all'])
    const [selectedContactIds, setSelectedContactIds] = useState<Set<string>>(new Set()) 
    const [isSelectAllEntireList, setIsSelectAllEntireList] = useState(false)
    
    const [searchTerm, setSearchTerm] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    
    const [currentPage, setCurrentPage] = useState(1)
    const [totalItems, setTotalItems] = useState(0)
    const pageSize = 10;

    const tableRef = useRef<HTMLDivElement>(null)
    const selectedCount = isSelectAllEntireList ? totalItems : selectedContactIds.size;

    const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);
    const [tagSearchQuery, setTagSearchQuery] = useState('');
    const tagDropdownRef = useRef<HTMLDivElement>(null);
    
    const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                if(!campaignId) return;
                const campaignRes: any = await apiGetCampaignById(campaignId);
                setCampaignPlatform(campaignRes?.platformBotName || 'All');
                
                const contactIdsRes: any = await apiGetCampaignContactIds(campaignId);
                const existingIds = contactIdsRes?.data || contactIdsRes || [];

                if (Array.isArray(existingIds) && existingIds.length > 0) {
                    const normalizedIds = existingIds.map((id: string) => id.toLowerCase());
                    setSelectedContactIds(new Set(normalizedIds));
                }

                const tagsResult: any = await apiGetTags()
                setTags(tagsResult || []);
            } catch (error) {
                console.error("خطا در دریافت اطلاعات اولیه", error)
            }
        }
        fetchInitialData()
    }, [campaignId])

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        setIsSelectAllEntireList(false);
        setCurrentPage(1);
    }, [debouncedSearch]);

    useEffect(() => {
        const fetchFilteredContacts = async () => {
            if (activeFilters.length === 0 && !debouncedSearch) {
                setContacts([]);
                setTotalItems(0);
                return; 
            }
            setIsLoading(true)
            try {
                const queryParams = {
                    CompanyId: user?.companyId,
                    SearchTerm: debouncedSearch || undefined,
                    PlatformFilter: mapPlatformToEnum(campaignPlatform),
                    Page: currentPage,
                    PageSize: pageSize,
                    TagIdsFilter: activeFilters.filter(t => t !== 'no-tag' && t !== 'all'),
                    HasNoTags: activeFilters.includes('no-tag') ? true : undefined
                };
                
                const contactsResult: any = await apiGetContacts(queryParams)
                setContacts(contactsResult?.items || contactsResult?.data || []);
                setTotalItems(contactsResult?.totalCount || 0);
            } catch (error) {
                console.error("خطا در واکشی مخاطبین", error)
            } finally {
                setIsLoading(false)
            }
        }
        
        fetchFilteredContacts()
    }, [user?.companyId, campaignPlatform, activeFilters, debouncedSearch, currentPage]);

    useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (tagDropdownRef.current && !tagDropdownRef.current.contains(event.target as Node)) {
            setIsTagDropdownOpen(false);
        }
    };
    if (isTagDropdownOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isTagDropdownOpen]);

    const filteredTagsList = useMemo(() => {
        if (!tagSearchQuery.trim()) return tags;
        return tags.filter(tag => tag.name.toLowerCase().includes(tagSearchQuery.toLowerCase()));
    }, [tags, tagSearchQuery]);

    const selectedTagsCount = activeFilters.filter(t => t !== 'all' && t !== 'no-tag').length;

    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const startIndex = (currentPage - 1) * pageSize;
    
    const handleNextPage = () => { if (currentPage < totalPages) setCurrentPage(p => p + 1); };
    const handlePrevPage = () => { if (currentPage > 1) setCurrentPage(p => p - 1); };
    
    const handleToggleTableFilter = (tagId: string) => {
        setCurrentPage(1);
        setIsSelectAllEntireList(false);
        
        if (tagId === 'all') {
            setActiveFilters(['all']);
        } 
        else if (tagId === 'no-tag') {
            setActiveFilters(['no-tag']);
        } 
        else {
            let updatedFilters = activeFilters.filter(t => t !== 'all' && t !== 'no-tag');
            
            if (updatedFilters.includes(tagId)) {
                updatedFilters = updatedFilters.filter(t => t !== tagId);
            } else {
                updatedFilters.push(tagId);
            }
            
            if (updatedFilters.length === 0) {
                setActiveFilters(['all']);
            } else {
                setActiveFilters(updatedFilters);
            }
        }

        setTimeout(() => {
            tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
    }

    const handleToggleSelectContact = (contactId: string) => {
        const normalizedId = contactId.toLowerCase();

        if (isSelectAllEntireList) {
            setIsSelectAllEntireList(false);
            const newSelected = new Set(contacts.map(c => c.id));
            newSelected.delete(normalizedId);
            setSelectedContactIds(newSelected);
            return;
        }

        const newSelected = new Set(selectedContactIds)
        if (newSelected.has(normalizedId)) newSelected.delete(normalizedId)
        else newSelected.add(normalizedId)
        setSelectedContactIds(newSelected)
    }

    const handleToggleAllVisible = () => {
        const isAllVisibleSelected = contacts.length > 0 && contacts.every(c => selectedContactIds.has(c.id));
        
        if (isAllVisibleSelected) {
            setIsSelectAllEntireList(false);
            const newSelected = new Set(selectedContactIds);
            contacts.forEach(c => newSelected.delete(c.id.toLowerCase()));          
            setSelectedContactIds(newSelected);
        } else {
            const newSelected = new Set(selectedContactIds);
            contacts.forEach(c => newSelected.add(c.id.toLowerCase()));
            setSelectedContactIds(newSelected);
        }
    }

    const handleSubmit = async () => {
        if (!campaignId) return;

        if (!isSelectAllEntireList && selectedContactIds.size === 0) {
            return toast.push(<Notification type="warning" title="توجه">لطفاً حداقل یک مخاطب را انتخاب کنید.</Notification>, { placement: 'top-center' })
        }

        setIsSubmitting(true)
        try {
            await apiAddContactsToCampaign(campaignId, {
                campaignId: campaignId,
                companyId: user?.companyId ?? '',
                contactIds: isSelectAllEntireList ? [] : Array.from(selectedContactIds),
                tagIds: isSelectAllEntireList ? activeFilters.filter(t => t !== 'all' && t !== 'no-tag') : [],
                sendToAll: isSelectAllEntireList && activeFilters.includes('all'),
                includeUntagged: isSelectAllEntireList && activeFilters.includes('no-tag')
            });
            
            toast.push(<Notification type="success" title="عملیات موفق">گیرندگان کمپین با موفقیت ثبت شدند.</Notification>, { placement: 'top-center' })
            navigate('/concepts/CampaignList')
        } catch (error: any) {
            toast.push(<Notification type="danger" title="خطا">{error?.response?.data?.Message || 'خطا در ثبت گیرندگان'}</Notification>, { placement: 'top-center' })
        } finally {
            setIsSubmitting(false)
        }
    }

    const isAllOnPageSelected = contacts.length > 0 && contacts.every(c => selectedContactIds.has(String(c.id).toLowerCase().trim()) || isSelectAllEntireList);
    const canSelectEntireList = isAllOnPageSelected && totalItems > contacts.length && !debouncedSearch;

 return (
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 w-full h-full pb-40 lg:pb-8 animate-[fadeIn_0.3s_ease-out]" dir="rtl">
            
            {/* 🌟 بخش اصلی فیلترها و جدول */}
            <div className="flex-1 flex flex-col min-w-0 gap-5 lg:gap-6">
                
                <div className="flex flex-col items-start gap-3">
                    <div>
                        <h3 className="text-xl lg:text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                            <HiOutlineUsers className="text-indigo-600" /> انتخاب گیرندگان
                        </h3>
                        <p className="text-xs lg:text-sm text-gray-500 mt-1">مرحله ۲ از ۲: با انتخاب گروه‌ها یا افراد خاص، مخاطبین کمپین را نهایی کنید.</p>
                    </div>
                </div>

                <Card className="border-gray-200 dark:border-gray-700 lg:p-6 bg-white dark:bg-gray-900 shadow-sm rounded-2xl lg:rounded-3xl">
                    
                    {/* ======================================= */}
                    {/* 📱 حالت موبایل (بسیار مینیمال و تک‌خطی) */}
                    {/* ======================================= */}
                    <div className="flex lg:hidden items-center justify-between bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-gray-700/50 -mb-2">
                        <div className="flex items-center gap-2 overflow-hidden">
                            <HiOutlineFilter className="text-lg text-indigo-500 shrink-0" />
                            <span className="text-sm text-gray-500 dark:text-gray-400 shrink-0">فیلتر:</span>
                            <span className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate">
                                {activeFilters.length === 0 ? 'هیچکدام' : 
                                activeFilters.includes('all') ? 'کل مخاطبین' : 
                                activeFilters.includes('no-tag') ? 'بدون تگ' : 
                                `${tags.find(t => t.id === activeFilters[0])?.name || ''} ${activeFilters.length > 1 ? `(و ${activeFilters.length - 1} مورد دیگر)` : ''}`}
                            </span>
                        </div>
                        
                        <button 
                            onClick={() => setIsMobileSheetOpen(true)}
                            className="shrink-0 px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-bold active:scale-95 transition-transform"
                        >
                            تغییر
                        </button>
                    </div>


                    {/* ======================================= */}
                    {/* 💻 حالت وب (دقیقاً کدهای اورجینال شما) */}
                    {/* ======================================= */}
                    <div className="hidden lg:flex flex-col gap-3">
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                            <HiOutlineTag className="text-lg" /> فیلتر مخاطبین (دسته‌بندی‌ها)
                        </label>
                        <p className="text-xs text-gray-500 mb-2">برای انتخاب کل اعضای یک گروه، ابتدا آن را فیلتر کنید.</p>
                        
                        {tags.length === 0 ? (
                            <div className="text-sm text-gray-500 animate-pulse">در حال دریافت تگ‌ها...</div>
                        ) : (
                           <div className="flex flex-wrap items-center gap-3">
                                <button
                                    onClick={() => { handleToggleTableFilter('all'); setIsTagDropdownOpen(false); }}
                                    className={`relative flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold transition-all duration-300 border-2
                                        ${activeFilters.includes('all')
                                            ? 'bg-gray-900 border-gray-900 text-white dark:bg-gray-100 dark:border-gray-100 dark:text-gray-900 shadow-lg shadow-gray-900/20'
                                            : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400'
                                        }`}
                                >
                                    {activeFilters.includes('all') ? <HiCheckCircle className="text-lg" /> : <HiOutlineUsers className="text-lg opacity-60" />}
                                    کل مخاطبین
                                </button>

                                <button
                                    onClick={() => { handleToggleTableFilter('no-tag'); setIsTagDropdownOpen(false); }}
                                    className={`relative flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold transition-all duration-300 border-2
                                        ${activeFilters.includes('no-tag')
                                            ? 'bg-gray-900 border-gray-900 text-white dark:bg-gray-100 dark:border-gray-100 dark:text-gray-900 shadow-lg shadow-gray-900/20'
                                            : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400'
                                        }`}
                                >
                                    {activeFilters.includes('no-tag') ? <HiCheckCircle className="text-lg" /> : <HiOutlineTag className="text-lg opacity-60" />}
                                    بدون تگ
                                </button>

                                {tags.length > 0 && <div className="hidden sm:block w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600 mx-1"></div>}

                                {tags.length > 0 && (
                                    <div className="relative" ref={tagDropdownRef}>
                                        <button
                                            onClick={() => setIsTagDropdownOpen(!isTagDropdownOpen)}
                                            className={`relative flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold transition-all duration-300 border-2
                                                ${selectedTagsCount > 0
                                                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-700 dark:text-indigo-300'
                                                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400'
                                                }`}
                                        >
                                            <HiOutlineTag className="text-lg opacity-70" />
                                            فیلتر تگ‌ها
                                            {selectedTagsCount > 0 && (
                                                <span className="flex items-center justify-center bg-indigo-600 text-white text-[10px] w-5 h-5 rounded-full ms-1 animate-[pop_0.2s_ease-out]">
                                                    {selectedTagsCount}
                                                </span>
                                            )}
                                            <HiChevronDown className={`text-lg opacity-50 ms-1 transition-transform duration-300 ${isTagDropdownOpen ? 'rotate-180' : ''}`} />
                                        </button>

                                        {isTagDropdownOpen && (
                                            <div className="absolute top-full mt-2 right-0 w-64 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-100 dark:border-gray-700 shadow-2xl rounded-2xl z-50 overflow-hidden animate-[fadeIn_0.15s_ease-out] ring-1 ring-black/5">
                                                <div className="sticky top-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md p-3 border-b border-gray-100 dark:border-gray-800 z-10">
                                                    <div className="relative">
                                                        <HiOutlineSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                                                        <input 
                                                            type="text"
                                                            placeholder="جستجوی تگ..."
                                                            value={tagSearchQuery}
                                                            onChange={(e) => setTagSearchQuery(e.target.value)}
                                                            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl py-2 pr-9 pl-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-gray-700 dark:text-gray-200"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="max-h-60 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">
                                                    {filteredTagsList.length === 0 ? (
                                                        <div className="p-4 text-center text-sm text-gray-400">تگی یافت نشد.</div>
                                                    ) : (
                                                        filteredTagsList.map(tag => {
                                                            const isActive = activeFilters.includes(tag.id);
                                                            return (
                                                                <div 
                                                                    key={tag.id}
                                                                    onClick={() => handleToggleTableFilter(tag.id)}
                                                                    className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-colors mb-1
                                                                        ${isActive ? 'bg-indigo-50 dark:bg-indigo-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}
                                                                    `}
                                                                >
                                                                    <div className="flex items-center gap-2.5">
                                                                        <span className={`w-3 h-3 rounded-full shadow-sm ${tag.colorHex}`}></span>
                                                                        <span className={`text-sm font-medium ${isActive ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-300'}`}>
                                                                            {tag.name}
                                                                        </span>
                                                                    </div>
                                                                    {isActive && <HiCheck className="text-indigo-600 dark:text-indigo-400 text-lg" />}
                                                                </div>
                                                            )
                                                        })
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </Card>

                <div ref={tableRef} className="scroll-mt-20"></div>

                <Card className="border-gray-200 dark:border-gray-700 p-0 overflow-hidden bg-white dark:bg-gray-900 shadow-sm flex flex-col relative rounded-2xl lg:rounded-3xl">
                    {isSelectAllEntireList && <div className="absolute inset-0 bg-indigo-50/10 dark:bg-indigo-900/10 z-10 pointer-events-none"></div>}
                    
                    <div className="p-4 lg:p-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                        <Input 
                            type="text" placeholder="جستجوی سریع در بین افراد..." 
                            className="w-full bg-white dark:bg-gray-900 shadow-sm rounded-xl text-sm lg:text-base" 
                            prefix={<HiOutlineSearch className="text-lg text-gray-400" />} 
                            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} 
                            disabled={activeFilters.length === 0 || isSelectAllEntireList} 
                        />
                    </div>

                    {canSelectEntireList && !isSelectAllEntireList && (
                        <div className="bg-indigo-50/80 dark:bg-indigo-900/30 py-3 px-4 text-center border-b border-indigo-100 dark:border-indigo-800 animate-[fadeIn_0.3s_ease-out]">
                            <span className="text-xs lg:text-sm text-indigo-800 dark:text-indigo-300 block sm:inline">
                                تمامی <b>{contacts.length}</b> مخاطب در این صفحه انتخاب شدند.
                            </span>
                            <button onClick={() => setIsSelectAllEntireList(true)} className="mt-2 sm:mt-0 mx-2 text-xs lg:text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 underline underline-offset-4 decoration-indigo-300 transition-colors">
                                انتخاب هر {totalItems} مخاطب این لیست
                            </button>
                        </div>
                    )}
                    {isSelectAllEntireList && (
                        <div className="bg-indigo-600 text-white py-3 px-4 text-center shadow-inner animate-[fadeIn_0.3s_ease-out]">
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                                <div className="flex items-center gap-1">
                                    <HiOutlineCheck className="text-lg" />
                                    <span className="text-xs lg:text-sm font-bold">تمامی {totalItems} مخاطب با موفقیت انتخاب شدند.</span>
                                </div>
                                <button onClick={() => setIsSelectAllEntireList(false)} className="text-xs lg:text-sm font-bold text-indigo-200 hover:text-white underline underline-offset-4 transition-colors mt-1 sm:mt-0">
                                    لغو انتخاب سراسری
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="flex-1 min-h-[300px] max-h-[55vh] overflow-y-auto overflow-x-hidden lg:overflow-x-auto custom-scrollbar relative">
                        <table className="w-full text-sm text-right border-collapse block lg:table">
                            <thead className="block lg:table-header-group sticky top-0 z-20 bg-gray-50/95 lg:bg-white/70 dark:bg-gray-800/95 dark:lg:bg-gray-900/70 backdrop-blur-lg shadow-sm border-b border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 transition-all">
                                <tr className="flex items-center justify-between p-3 lg:p-0 lg:table-row">
                                    <th className="w-full lg:w-16 px-2 lg:px-6 py-1 lg:py-4 flex items-center gap-3 lg:gap-0 lg:table-cell font-semibold">
                                        <label className="relative flex items-center justify-center cursor-pointer group">
                                            <input type="checkbox" className="peer sr-only" checked={isAllOnPageSelected} onChange={handleToggleAllVisible} disabled={contacts.length === 0} />
                                            <div className={`w-5 h-5 rounded-md lg:rounded-lg border-2 transition-all duration-200 flex items-center justify-center ${isAllOnPageSelected ? 'bg-indigo-500 border-indigo-500' : 'border-gray-300 dark:border-gray-600 group-hover:border-indigo-400'}`}>
                                                <HiOutlineCheck className={`text-white text-xs lg:text-sm transition-transform duration-200 ${isAllOnPageSelected ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`} />
                                            </div>
                                        </label>
                                        <span className="lg:hidden text-xs font-bold text-gray-700 dark:text-gray-300">انتخاب تمامی افراد این صفحه</span>
                                    </th>
                                    <th className="hidden lg:table-cell px-4 lg:px-6 py-3 lg:py-4 font-semibold">مخاطب</th>
                                    <th className="hidden lg:table-cell px-4 lg:px-6 py-3 lg:py-4 font-semibold">شماره تماس / شناسه</th>
                                    <th className="hidden lg:table-cell px-4 lg:px-6 py-3 lg:py-4 font-semibold">دسته‌بندی‌ها</th>
                                </tr>
                            </thead>
                            
                            <tbody className="block lg:table-row-group divide-y divide-gray-100 dark:divide-gray-800/50">
                                {isLoading ? (
                                    <tr><td colSpan={4} className="text-center py-16 block lg:table-cell"><div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div><span className="text-gray-500 font-medium">در حال ارتباط با سرور...</span></td></tr>
                                ) : activeFilters.length === 0 && !debouncedSearch ? (
                                    <tr><td colSpan={4} className="text-center py-20 block lg:table-cell"><div className="flex flex-col items-center justify-center text-gray-400"><HiOutlineTag className="text-4xl lg:text-5xl mb-3 opacity-50" /><p className="font-medium text-sm lg:text-base text-gray-500 mt-2">ابتدا یک دسته‌بندی را از بالا انتخاب کنید.</p></div></td></tr>
                                ) : contacts.length > 0 ? (
                                    contacts.map((contact, index) => {
                                        const safeId = String(contact.id).toLowerCase().trim();
                                        const isSelected = selectedContactIds.has(safeId) || isSelectAllEntireList;
                                        const hasName = !!(contact.fullName || contact.firstName);
                                        const displayName = contact.fullName || `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || 'بدون نام';
                                        const initial = hasName ? displayName.substring(0, 1) : '?';
                                        const colorClass = avatarColors[index % avatarColors.length];

                                        return (
                                            <tr key={contact.id} className={`flex lg:table-row items-center p-2 lg:p-0 transition-colors group hover:bg-gray-50/80 dark:hover:bg-gray-800/30 ${isSelected ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : ''}`}>
                                               <td className="w-10 lg:w-16 px-1 lg:px-6 py-2 lg:py-3.5 flex justify-center shrink-0 lg:table-cell">
                                                    <label className="relative flex items-center justify-center cursor-pointer lg:group-hover:scale-110 transition-transform">
                                                        <input type="checkbox" className="peer sr-only" checked={isSelected} onChange={() => handleToggleSelectContact(safeId)} />
                                                        <div className={`w-4 h-4 lg:w-5 lg:h-5 rounded-md lg:rounded-lg border-2 transition-all duration-200 flex items-center justify-center ${isSelected ? 'bg-indigo-500 border-indigo-500' : 'border-gray-300 dark:border-gray-600 group-hover:border-indigo-400'}`}>
                                                            <HiOutlineCheck className={`text-white text-[10px] lg:text-sm transition-transform duration-200 ${isSelected ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`} />
                                                        </div>
                                                    </label>
                                                </td>
                                                <td className="flex-1 lg:w-auto px-2 lg:px-6 py-2 lg:py-3.5 flex min-w-0 lg:table-cell">
                                                    <div className="flex items-center gap-2.5 lg:gap-3 w-full">
                                                        
                                                        {/* 💡 آواتار: فقط در دسکتاپ نمایش داده می‌شود */}
                                                        <div className={`hidden lg:flex w-10 h-10 rounded-full items-center justify-center font-bold text-sm shadow-sm shrink-0 ${colorClass}`}>
                                                            {initial}
                                                        </div>

                                                        {/* 🌟 جادوی جدید: تگ‌ها جایگزین آواتار در موبایل */}
                                                        <div className="flex lg:hidden flex-col gap-1 shrink-0 w-[65px]">
                                                            {!contact.tags || contact.tags.length === 0 
                                                                ? <span className="text-[9px] text-gray-400 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 px-1 py-0.5 rounded text-center truncate">بدون تگ</span> 
                                                                : contact.tags.slice(0, 2).map(tag => (
                                                                    <span key={tag.id} className={`text-[9px] font-bold px-1.5 py-0.5 rounded border shadow-sm ${tag.colorHex} text-center truncate`}>
                                                                        {tag.name}
                                                                    </span>
                                                                ))
                                                            }
                                                            {/* نمایش پلاس اگر بیشتر از 2 تگ داشت */}
                                                            {contact.tags && contact.tags.length > 2 && (
                                                                <span className="text-[8px] text-gray-500 font-bold text-center">+{contact.tags.length - 2}</span>
                                                            )}
                                                        </div>
                                                        
                                                        {/* اطلاعات کاربر */}
                                                        <div className="flex flex-col flex-1 min-w-0">
                                                            <span className={`font-bold text-sm lg:text-base truncate ${hasName ? 'text-gray-800 dark:text-gray-200' : 'text-gray-400 italic'}`}>
                                                                {displayName}
                                                            </span>
                                                            {/* شماره تماس: در موبایل زیر اسم نمایش داده می‌شود */}
                                                            <span className="lg:hidden font-mono text-gray-500 dark:text-gray-400 text-[11px] mt-0.5 truncate text-right" dir="ltr">
                                                                {contact.userNameInPlatform || contact.phoneNumber}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="hidden lg:table-cell px-4 lg:px-6 py-3 lg:py-3.5" dir="ltr">
                                                    <div className="inline-flex items-center gap-1.5 lg:gap-2 px-2 lg:px-3 py-1 lg:py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 transition-colors">
                                                        <HiOutlinePhone className="text-gray-400 text-xs lg:text-sm" />
                                                        <span className="font-mono text-gray-700 dark:text-gray-300 tracking-wider font-medium text-xs lg:text-sm whitespace-nowrap">
                                                            {contact.userNameInPlatform || contact.phoneNumber}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="hidden lg:table-cell px-4 lg:px-6 py-3 lg:py-3.5">
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {!contact.tags || contact.tags.length === 0 
                                                            ? <span className="text-[10px] lg:text-xs text-gray-400 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 px-2 py-1 rounded-md">بدون تگ</span> 
                                                            : contact.tags.map(tag => <span key={tag.id} className={`text-[10px] lg:text-[11px] font-bold px-2 py-1 rounded-md border shadow-sm ${tag.colorHex}`}>{tag.name}</span>)
                                                        }
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })
                                ) : (
                                    <tr><td colSpan={4} className="text-center py-16 text-gray-500 font-medium block lg:table-cell">هیچ مخاطبی یافت نشد.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* فوتر جدول */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 lg:gap-0 px-4 lg:px-6 py-3 lg:py-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 relative z-20">
                        <span className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 font-medium">نمایش <span className="font-bold text-gray-800 dark:text-gray-200">{startIndex + 1}</span> تا <span className="font-bold text-gray-800 dark:text-gray-200">{Math.min(startIndex + pageSize, totalItems)}</span> از <span className="font-bold text-gray-800 dark:text-gray-200">{totalItems}</span></span>
                        <div className="flex items-center justify-between sm:justify-center w-full sm:w-auto gap-2">
                            <Button size="sm" variant="plain" disabled={currentPage <= 1 || isLoading} onClick={handlePrevPage} className="text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800">قبلی</Button>
                            <div className="flex items-center justify-center px-3 lg:px-4 py-1.5 text-xs lg:text-sm font-bold bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">{currentPage} / {totalPages}</div>
                            <Button size="sm" variant="plain" disabled={currentPage >= totalPages || isLoading} onClick={handleNextPage} className="text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800">بعدی</Button>
                        </div>
                    </div>
                </Card>
                
            </div>

            {/* 🌟 باکس خلاصه وضعیت (بدون دستکاری در وب، چسبان در موبایل) */}
            <div className="w-full lg:w-[350px] xl:w-[420px] flex flex-col gap-6 lg:mt-[80px]">
                
                <Card className="
                    fixed bottom-0 left-0 right-0 z-50 p-4 rounded-t-3xl border-t border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-[0_-15px_40px_rgba(0,0,0,0.1)] flex flex-col gap-3 
                    lg:sticky lg:top-24 lg:z-30 lg:p-6 lg:rounded-3xl lg:border lg:bg-white lg:dark:bg-gray-900 lg:backdrop-blur-none lg:shadow-sm lg:gap-6 lg:bottom-auto lg:left-auto lg:right-auto
                ">
                    <div className="hidden lg:flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-4">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center">
                            <HiOutlineCheck className="text-xl" />
                        </div>
                        <div>
                            <h4 className="text-base font-bold text-gray-800 dark:text-gray-100">خلاصه وضعیت</h4>
                            <p className="text-xs text-gray-500 mt-0.5">تعداد نهایی گیرندگان این کمپین</p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 lg:gap-4">
                        <div className={`flex justify-between items-center p-3 lg:p-4 rounded-xl border transition-colors ${selectedCount > 0 ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-800/50' : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}>
                            <span className={`text-xs lg:text-sm font-bold ${selectedCount > 0 ? 'text-indigo-700 dark:text-indigo-400' : 'text-gray-500'}`}>نفرات انتخاب شده:</span>
                            <div className="flex items-center gap-2">
                                <span key={selectedCount} className={`text-xl lg:text-2xl font-black inline-block animate-[pop_0.3s_ease-out] ${selectedCount > 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}`}>
                                    {selectedCount}
                                </span>
                                <span className={`text-xs ${selectedCount > 0 ? 'text-indigo-500' : 'text-gray-400'}`}>نفر</span>
                            </div>
                        </div>
                        {isSelectAllEntireList && (
                            <div className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold text-center animate-pulse">
                                ارسال به تمامی اعضای دسته‌بندی‌های انتخاب شده
                            </div>
                        )}
                    </div>
                    
                    <div className="flex flex-row lg:flex-col gap-2 lg:gap-3 mt-1 lg:mt-2">
                        <Button variant="solid" size="lg" className="flex-1 lg:w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-200 dark:shadow-none rounded-xl lg:rounded-2xl h-12 lg:h-14 text-sm lg:text-base" loading={isSubmitting} onClick={handleSubmit} icon={<HiOutlineCheck className="text-xl" />}>
                            تایید نهایی و پایان
                        </Button>
                        <div className="flex flex-col lg:contents gap-2 w-1/3 lg:w-full">
                            <Button variant="plain" size="lg" onClick={() => navigate(`/concepts/campaigns/${campaignId}/edit`)} className="w-full text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/30 font-bold h-12 lg:h-14 rounded-xl lg:rounded-2xl text-xs lg:text-sm px-1 lg:px-4">
                                بازگشت به ویرایش پیام
                            </Button>
                            <Button variant="plain" size="lg" onClick={() => navigate('/concepts/CampaignList')} 
                                    className="hidden lg:flex items-center justify-center w-full text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800/50 font-bold h-11 lg:h-14 rounded-xl lg:rounded-2xl text-[11px] lg:text-sm px-1 lg:px-4">
                                بازگشت به لیست کمپین‌ها
                            </Button>
                        </div>
                    </div>

                    <div className="hidden lg:block bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800/50 mt-4">
                        <h5 className="text-sm font-bold text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2">💡 نکته مهم</h5>
                        <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-2 leading-relaxed">
                            <li>• فقط مخاطبینی که شماره معتبر دارند پیام را دریافت می‌کنند.</li>
                            <li>• برای ارسال به کل یک گروه، تیکِ <b>انتخاب سراسری</b> را بزنید.</li>
                        </ul>
                    </div>
                </Card>
            </div>

            {/* ======================================= */}
            {/* 📱 مُدالِ باتم‌شیتِ فیلترها (ویژه موبایل) */}
            {/* ======================================= */}
            {isMobileSheetOpen && (
                <>
                    <div 
                        className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm lg:hidden animate-[fadeIn_0.2s_ease-out]"
                        onClick={() => setIsMobileSheetOpen(false)}
                    ></div>
                    
                    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 z-[101] rounded-t-3xl flex flex-col max-h-[85vh] lg:hidden animate-[slideUp_0.3s_ease-out] shadow-[0_-20px_40px_rgba(0,0,0,0.2)]">
                        <div className="w-full flex justify-center pt-3 pb-1">
                            <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
                        </div>
                        
                        <div className="flex items-center justify-between px-5 pb-4 border-b border-gray-100 dark:border-gray-800">
                            <h3 className="font-bold text-lg text-gray-800 dark:text-white flex items-center gap-2">
                                <HiOutlineFilter className="text-indigo-600" /> فیلتر مخاطبین
                            </h3>
                            <button onClick={() => setIsMobileSheetOpen(false)} className="p-2 bg-gray-50 dark:bg-gray-800 rounded-full text-gray-500">
                                <HiOutlineX className="text-lg" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-6">
                            <div className="flex flex-col gap-3">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">دسته‌بندی‌های اصلی</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => handleToggleTableFilter('all')}
                                        className={`relative flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border-2 transition-all ${activeFilters.includes('all') ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-500 dark:text-indigo-300' : 'bg-gray-50 border-transparent text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}
                                    >
                                        <HiOutlineUsers className={`text-2xl ${activeFilters.includes('all') ? 'text-indigo-600' : 'opacity-50'}`} />
                                        <span className="text-sm font-bold">کل مخاطبین</span>
                                        {activeFilters.includes('all') && <HiCheckCircle className="absolute top-2 right-2 text-indigo-600 text-lg" />}
                                    </button>
                                    <button
                                        onClick={() => handleToggleTableFilter('no-tag')}
                                        className={`relative flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border-2 transition-all ${activeFilters.includes('no-tag') ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-500 dark:text-indigo-300' : 'bg-gray-50 border-transparent text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}
                                    >
                                        <HiOutlineTag className={`text-2xl ${activeFilters.includes('no-tag') ? 'text-indigo-600' : 'opacity-50'}`} />
                                        <span className="text-sm font-bold">بدون تگ</span>
                                        {activeFilters.includes('no-tag') && <HiCheckCircle className="absolute top-2 right-2 text-indigo-600 text-lg" />}
                                    </button>
                                </div>
                            </div>

                            {tags.length > 0 && (
                                <div className="flex flex-col gap-3">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">تگ‌های اختصاصی</h4>
                                    <div className="relative">
                                        <HiOutlineSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                                        <input 
                                            type="text"
                                            placeholder="جستجوی تگ..."
                                            value={tagSearchQuery}
                                            onChange={(e) => setTagSearchQuery(e.target.value)}
                                            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl py-3 pr-10 pl-3 text-sm focus:outline-none focus:border-indigo-500 transition-all text-gray-700 dark:text-gray-200"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2 mt-2 pb-6">
                                        {filteredTagsList.length === 0 ? (
                                            <div className="p-4 text-center text-sm text-gray-400">تگی یافت نشد.</div>
                                        ) : (
                                            filteredTagsList.map(tag => {
                                                const isActive = activeFilters.includes(tag.id);
                                                return (
                                                    <button 
                                                        key={tag.id}
                                                        onClick={() => handleToggleTableFilter(tag.id)}
                                                        className={`flex items-center justify-between p-3.5 rounded-xl border-2 transition-all w-full text-right ${isActive ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800' : 'bg-transparent border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <span className={`w-3 h-3 rounded-full shadow-sm ${tag.colorHex}`}></span>
                                                            <span className={`text-sm font-bold ${isActive ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-300'}`}>
                                                                {tag.name}
                                                            </span>
                                                        </div>
                                                        {isActive && <HiCheck className="text-indigo-600 dark:text-indigo-400 text-xl" />}
                                                    </button>
                                                )
                                            })
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                            <button 
                                onClick={() => setIsMobileSheetOpen(false)}
                                className="w-full py-3.5 bg-indigo-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-indigo-200 dark:shadow-none active:scale-[0.98] transition-transform"
                            >
                                تایید و مشاهده مخاطبین
                            </button>
                        </div>
                    </div>
                </>
            )}
            
            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes pop { 0% { transform: scale(0.8) translateY(2px); opacity: 0.5; } 50% { transform: scale(1.3) translateY(-2px); } 100% { transform: scale(1) translateY(0); opacity: 1; } }
                @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
            `}</style>
        </div>
    )
}

export default CampaignContacts