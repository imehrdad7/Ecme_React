import { useState, useEffect } from 'react'
import Button from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import Dialog from '@/components/ui/Dialog'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { TbFilter, TbX, TbSearch, TbAdjustmentsHorizontal } from 'react-icons/tb' // 👈 آیکون‌های جدید اضافه شدند
import { PlanListItemDto } from '@/services/PlanService'
import { 
    apiSearchPlans, 
    apiTogglePlanVisibility, 
    apiClonePlan, 
    apiDeletePlan, 
    apiActivatePlan, 
    apiDeactivatePlan 
} from '@/services/PlanService'
import CreatePlanModal from './CreatePlanModal'
import PlanLimitsModal from './PlanLimitsModal'
import UpdatePlanModal from './UpdatePlanModal'
import PlanSubscribersModal from './PlanSubscribersModal'

const PlanList = () => {
    const [plans, setPlans] = useState<PlanListItemDto[]>([])
    const [isLoading, setIsLoading] = useState(false)
    
    // 👈 اضافه شدن استیت برای باز و بسته کردن پنل فیلتر پیشرفته
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
    
    // --- استیت‌های فیلتر و صفحه‌بندی ---
    const [pageNumber, setPageNumber] = useState(1)
    const pageSize = 50 
    const [filters, setFilters] = useState({
        searchTerm: '',
        minPrice: '',
        maxPrice: '',
        isRecommended: 'all',
        onlyActive: 'all',
        onlyPublic: 'all'
    })

    // محاسبه تعداد فیلترهای فعالی که ادمین انتخاب کرده (برای نمایش روی دکمه فیلتر)
    const activeFiltersCount = [
        filters.minPrice,
        filters.maxPrice,
        filters.onlyActive !== 'all' ? true : false,
        filters.onlyPublic !== 'all' ? true : false,
        filters.isRecommended !== 'all' ? true : false,
    ].filter(Boolean).length;

    // بقیه استیت‌های قبلی...
    const [sortBy, setSortBy] = useState<'name' | 'price'>('price')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
    const [openMenuId, setOpenMenuId] = useState<string | null>(null)
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [isLimitsOpen, setIsLimitsOpen] = useState(false)
    const [isUpdateOpen, setIsUpdateOpen] = useState(false)
    const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)
    const [isSubscribersOpen, setIsSubscribersOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [planToDelete, setPlanToDelete] = useState<string | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    useEffect(() => {
        loadPlans()
    }, [pageNumber])

    const loadPlans = async () => {
        setIsLoading(true)
        try {
            const queryParams = {
                pageNumber,
                pageSize,
                searchTerm: filters.searchTerm || undefined,
                minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
                maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
                isRecommended: filters.isRecommended !== 'all' ? filters.isRecommended === 'true' : undefined,
                onlyActive: filters.onlyActive !== 'all' ? filters.onlyActive === 'true' : undefined,
                onlyPublic: filters.onlyPublic !== 'all' ? filters.onlyPublic === 'true' : undefined,
            }

            const data = await apiSearchPlans(queryParams)
            if (data) setPlans(data.items)
        } catch (error) {
            toast.push(<Notification title="خطا" type="danger">خطا در بارگذاری لیست پلن‌ها</Notification>, { placement: 'top-center' })
        } finally {
            setIsLoading(false)
        }
    }

    const handleFilterChange = (key: keyof typeof filters, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }))
    }

    const clearFilters = () => {
        setFilters({
            searchTerm: filters.searchTerm, // معمولا کلمه جستجو را پاک نمی‌کنند
            minPrice: '',
            maxPrice: '',
            isRecommended: 'all',
            onlyActive: 'all',
            onlyPublic: 'all'
        })
        setPageNumber(1)
        setTimeout(() => loadPlans(), 50) 
    }

    const applyFilters = () => {
        setPageNumber(1) 
        loadPlans()
    }

    const toggleMenu = (id: string) => { setOpenMenuId(openMenuId === id ? null : id) }
    const handleSort = (column: 'name' | 'price') => {
        if (sortBy === column) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
        else { setSortBy(column); setSortOrder('asc') }
    }

    const sortedPlans = [...plans].sort((a, b) => {
        if (a.isRecommended !== b.isRecommended) return a.isRecommended ? -1 : 1;
        const orderA = a.displayOrder || 0;
        const orderB = b.displayOrder || 0;
        if (orderA !== orderB) return orderB - orderA;
        if (sortBy === 'price') return sortOrder === 'asc' ? a.price - b.price : b.price - a.price;
        if (sortBy === 'name') return sortOrder === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
        return 0;
    });

    const confirmDelete = (id: string) => { setPlanToDelete(id); setIsDeleteModalOpen(true) }

    const executeDelete = async () => {
        if (!planToDelete) return
        setIsDeleting(true)
        try {
            await apiDeletePlan(planToDelete)
            toast.push(<Notification title="موفق" type="success">پلن با موفقیت حذف شد.</Notification>, { placement: 'top-center' })
            setIsDeleteModalOpen(false)
            setPlanToDelete(null)
            loadPlans()
        } catch (error) {
            toast.push(<Notification title="خطا" type="danger">حذف پلن امکان‌پذیر نیست (احتمالاً مشترک فعال دارد).</Notification>, { placement: 'top-center' })
        } finally {
            setIsDeleting(false)
        }
    }

    const handleToggleActive = async (id: string, currentlyActive: boolean) => {
        try {
            if (currentlyActive) await apiDeactivatePlan(id)
            else await apiActivatePlan(id)
            loadPlans()
        } catch (error) { toast.push(<Notification title="خطا" type="danger">مشکلی رخ داد.</Notification>, { placement: 'top-center' }) }
    }

    const handleToggleVisibility = async (id: string) => {
        try {
            await apiTogglePlanVisibility(id)
            loadPlans()
        } catch (error) { toast.push(<Notification title="خطا" type="danger">مشکلی رخ داد.</Notification>, { placement: 'top-center' }) }
    }

    const handleClone = async (id: string) => {
        try {
            await apiClonePlan(id)
            toast.push(<Notification title="موفق" type="success">پلن شبیه‌سازی شد.</Notification>, { placement: 'top-center' })
            loadPlans()
        } catch (error) { toast.push(<Notification title="خطا" type="danger">خطا در شبیه‌سازی پلن.</Notification>, { placement: 'top-center' }) }
    }

    const openLimitsModal = (id: string) => { setSelectedPlanId(id); setIsLimitsOpen(true); }
    const openUpdateModal = (id: string) => { setSelectedPlanId(id); setIsUpdateOpen(true); }
    const openSubscribers = (id: string) => { setSelectedPlanId(id); setIsSubscribersOpen(true); }

    return (
        <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
            {/* --- هدر اصلی --- */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                <div>
                    <h4 className="text-gray-900 font-bold text-xl">مدیریت پلن‌های اشتراکی</h4>
                    <p className="text-sm text-gray-500 mt-1">لیست پلن‌ها، قیمت‌گذاری و محدودیت‌های سیستم را از اینجا مدیریت کنید.</p>
                </div>
                <Button variant="solid" className="bg-indigo-600 hover:bg-indigo-500 w-full md:w-auto shadow-md shadow-indigo-200" onClick={() => setIsCreateOpen(true)}>
                    + تعریف پلن جدید
                </Button>
            </div>

            {/* --- نوار ابزار اصلی (Main Toolbar) --- */}
            <div className="flex flex-col md:flex-row gap-3 mb-4">
                {/* بخش جستجوی سریع */}
                <div className="relative flex-grow">
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <TbSearch className="text-xl" />
                    </div>
                    <Input 
                        placeholder="جستجوی سریع در نام پلن..." 
                        value={filters.searchTerm} 
                        onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                        className="pr-10 w-full bg-gray-50/50 focus:bg-white transition-colors"
                    />
                </div>
                
                {/* دکمه‌های جستجو و فیلتر پیشرفته */}
                <div className="flex gap-2">
                    <Button variant="solid" className="bg-gray-800 hover:bg-gray-700 whitespace-nowrap" onClick={applyFilters} loading={isLoading}>
                        جستجو
                    </Button>
                    
                    <Button 
                        variant="plain" 
                        className={`flex items-center gap-2 border transition-all ${showAdvancedFilters ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                        onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    >
                        <TbAdjustmentsHorizontal className="text-lg" />
                        <span>فیلتر پیشرفته</span>
                        {/* نمایش نشانگر تعداد فیلتر فعال */}
                        {activeFiltersCount > 0 && (
                            <span className="flex items-center justify-center w-5 h-5 bg-indigo-600 text-white text-[10px] font-bold rounded-full ml-1 shadow-sm">
                                {activeFiltersCount}
                            </span>
                        )}
                    </Button>
                </div>
            </div>

            {/* --- پنل کشویی فیلترهای پیشرفته (Advanced Filters Panel) --- */}
            <div 
                className={`transition-all duration-400 ease-in-out overflow-hidden ${
                    showAdvancedFilters ? 'max-h-[500px] opacity-100 mb-6' : 'max-h-0 opacity-0 mb-0'
                }`}
            >
                <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                        <div>
                            <label className="block text-xs font-semibold mb-1.5 text-gray-600">حداقل قیمت (تومان)</label>
                            <Input type="number" placeholder="بدون کف قیمت" value={filters.minPrice} onChange={(e) => handleFilterChange('minPrice', e.target.value)} className="dir-ltr text-left bg-white" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold mb-1.5 text-gray-600">حداکثر قیمت (تومان)</label>
                            <Input type="number" placeholder="بدون سقف قیمت" value={filters.maxPrice} onChange={(e) => handleFilterChange('maxPrice', e.target.value)} className="dir-ltr text-left bg-white" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold mb-1.5 text-gray-600">وضعیت نمایش در سایت</label>
                            <select 
                                className="w-full border border-gray-300 rounded-md p-2.5 text-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                                value={filters.onlyPublic} 
                                onChange={(e) => handleFilterChange('onlyPublic', e.target.value)}
                            >
                                <option value="all">همه موارد</option>
                                <option value="true">نمایش در ویترین</option>
                                <option value="false">مخفی (لینک مستقیم)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold mb-1.5 text-gray-600">وضعیت فروش</label>
                            <select 
                                className="w-full border border-gray-300 rounded-md p-2.5 text-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                                value={filters.onlyActive} 
                                onChange={(e) => handleFilterChange('onlyActive', e.target.value)}
                            >
                                <option value="all">همه موارد</option>
                                <option value="true">فعال (قابل خرید)</option>
                                <option value="false">غیرفعال (توقف فروش)</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-between items-center mt-5 pt-4 border-t border-gray-200">
                        <span className="text-xs text-gray-500">پس از انتخاب فیلترها، روی اعمال فیلتر کلیک کنید.</span>
                        <div className="flex gap-2">
                            <Button variant="plain" size="sm" className="text-gray-500 hover:text-gray-800" onClick={clearFilters} disabled={isLoading}>
                                پاک کردن فرم
                            </Button>
                            <Button variant="solid" size="sm" className="bg-indigo-600 hover:bg-indigo-500" onClick={applyFilters} loading={isLoading}>
                                اعمال تنظیمات
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- جدول --- */}
            <div className="overflow-x-auto border rounded-xl shadow-sm">
                <table className="min-w-full divide-y divide-gray-200 text-right">
                    <thead className="bg-gray-50/80 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        <tr>
                            <th className="p-4 cursor-pointer hover:bg-gray-200 transition-colors select-none group" onClick={() => handleSort('name')}>
                                نام و وضعیت پلن 
                                <span className="mr-1 text-gray-400 group-hover:text-gray-600">{sortBy === 'name' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}</span>
                            </th>
                            <th className="p-4 cursor-pointer hover:bg-gray-200 transition-colors select-none group" onClick={() => handleSort('price')}>
                                قیمت 
                                <span className="mr-1 text-gray-400 group-hover:text-gray-600">{sortBy === 'price' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}</span>
                            </th>
                            <th className="p-4 text-center">عملیات</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100 text-sm">
                        {isLoading ? (
                            <tr><td colSpan={3} className="p-12 text-center text-gray-400">در حال دریافت داده‌ها...</td></tr>
                        ) : sortedPlans.length === 0 ? (
                            <tr><td colSpan={3} className="p-12 text-center text-gray-400">هیچ پلنی با این مشخصات یافت نشد.</td></tr>
                        ) : (
                            sortedPlans.map((plan) => {
                                const isFreeSystemPlan = plan.price === 0;
                                const isMenuOpen = openMenuId === plan.id;

                                return (
                                    <tr key={plan.id} className="hover:bg-gray-50 transition-colors group">
                                       <td className="p-4 align-top">
                                            <div className="flex flex-col gap-2">
                                                <span 
                                                    className={`font-semibold text-base flex items-center gap-2 ${!isFreeSystemPlan ? 'text-indigo-600 cursor-pointer hover:underline' : 'text-gray-800'}`}
                                                    onClick={() => !isFreeSystemPlan && openUpdateModal(plan.id)}
                                                    title={!isFreeSystemPlan ? "برای ویرایش پایه کلیک کنید" : ""}
                                                >
                                                    {plan.name}
                                                    {isFreeSystemPlan && <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs rounded-full">پلن پایه سیستمی</span>}
                                                </span>
                                                
                                                <div className="flex items-center gap-3 text-xs font-medium">
                                                    <span className={`flex items-center gap-1.5 ${plan.isActive ? 'text-green-600' : 'text-red-500'}`}>
                                                        <span className={`w-2 h-2 rounded-full ${plan.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                                        {plan.isActive ? 'فعال (خرید باز است)' : 'غیرفعال (توقف فروش)'}
                                                    </span>

                                                    <span className={`flex items-center gap-1.5 border-r border-gray-200 pr-4 ${plan.isPublic ? 'text-blue-600' : 'text-amber-500'}`}>
                                                        {plan.isPublic ? 'نمایش در ویترین سایت' : 'مخفی (فقط با لینک)'}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-3 text-xs font-medium">
                                                    <span className={`flex items-center gap-1.5  ${plan.isRecommended ? 'text-purple-600 font-bold' : 'text-gray-400'}`}>
                                                        {plan.isRecommended ? (
                                                            <>
                                                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                                                                پیشنهاد ویژه
                                                            </>
                                                        ) : (
                                                            <>
                                                                <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                                                                پلن عادی
                                                            </>
                                                        )}
                                                    </span>

                                                   <span className="flex items-center gap-1.5 text-gray-500 border-r border-gray-200 pr-4">
                                                        اولویت نمایش:
                                                        <span className="bg-gray-100 border border-gray-200 text-gray-800 px-1.5 py-0.5 rounded text-[11px] font-extrabold min-w-[20px] text-center shadow-sm">
                                                            {plan.displayOrder != null ? plan.displayOrder : '-'}
                                                        </span>
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        
                                        <td className="p-5 font-bold text-gray-700 align-top">
                                            {plan.price === 0 ? (
                                                <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">رایگان</span>
                                            ) : (
                                                `${plan.price.toLocaleString()} تومان`
                                            )}
                                        </td>
                                        
                                        <td className="p-5 align-top">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="flex justify-center items-center gap-2">
                                                    <Button size="sm" variant="plain" className="bg-blue-50 text-blue-700 hover:bg-blue-100" onClick={() => openSubscribers(plan.id)}>
                                                        مشترکین
                                                    </Button>

                                                    <Button size="sm" variant="plain" className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100" onClick={() => openLimitsModal(plan.id)}>
                                                        محدودیت‌ها
                                                    </Button>
                                                    
                                                    {!isFreeSystemPlan ? (
                                                        <Button 
                                                            size="sm" 
                                                            variant="plain" 
                                                            className={`text-gray-700 bg-white border hover:bg-gray-50 transition-all ${isMenuOpen ? 'border-gray-400 shadow-sm' : 'border-gray-200'}`}
                                                            onClick={() => toggleMenu(plan.id)}
                                                        >
                                                            عملیات {isMenuOpen ? '▴' : '▾'}
                                                        </Button>
                                                    ) : (
                                                        <span className="text-[11px] text-gray-400 border-r border-gray-200 pr-3 font-medium">غیرقابل تغییر</span>
                                                    )}
                                                </div>

                                                {!isFreeSystemPlan && (
                                                    <div 
                                                        className={`w-full overflow-hidden transition-all duration-300 ease-in-out ${
                                                            isMenuOpen ? 'max-h-24 opacity-100 mt-2' : 'max-h-0 opacity-0'
                                                        }`}
                                                    >
                                                        <div className="flex justify-center items-center gap-1.5 p-2 bg-gray-50 rounded-lg border border-gray-200 flex-wrap">
                                                            <button 
                                                                className="px-2.5 py-1 text-xs font-medium rounded bg-white text-gray-700 hover:bg-gray-100 border border-transparent hover:border-gray-300 transition-all"
                                                                onClick={() => { handleClone(plan.id); setOpenMenuId(null); }}
                                                            >
                                                                کپی
                                                            </button>
                                                            
                                                            <button 
                                                                className={`px-2.5 py-1 text-xs font-medium rounded bg-white border border-transparent hover:border-gray-300 transition-all ${plan.isActive ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
                                                                onClick={() => { handleToggleActive(plan.id, plan.isActive); setOpenMenuId(null); }}
                                                            >
                                                                {plan.isActive ? 'غیرفعال کن' : 'فعال کن'}
                                                            </button>
                                                            
                                                            <button 
                                                                className="px-2.5 py-1 text-xs font-medium rounded bg-white text-gray-700 hover:bg-gray-100 border border-transparent hover:border-gray-300 transition-all"
                                                                onClick={() => { handleToggleVisibility(plan.id); setOpenMenuId(null); }}
                                                            >
                                                                {plan.isPublic ? 'مخفی کن' : 'نمایش بده'}
                                                            </button>
                                                            
                                                            <button 
                                                                className="px-2.5 py-1 text-xs font-medium rounded bg-white text-gray-700 hover:bg-gray-100 border border-transparent hover:border-gray-300 transition-all"
                                                                onClick={() => { openUpdateModal(plan.id); setOpenMenuId(null); }}
                                                            >
                                                                ویرایش
                                                            </button>

                                                            <button 
                                                                className="px-2.5 py-1 text-xs font-medium rounded bg-white text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all"
                                                                onClick={() => { confirmDelete(plan.id); setOpenMenuId(null); }}
                                                            >
                                                                حذف
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* مودال‌های فرم */}
            <CreatePlanModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} onSuccess={loadPlans} />
            <PlanLimitsModal planId={selectedPlanId} isOpen={isLimitsOpen} onClose={() => { setIsLimitsOpen(false); setSelectedPlanId(null); }} onSuccess={loadPlans} />
            <UpdatePlanModal planId={selectedPlanId} isOpen={isUpdateOpen} onClose={() => { setIsUpdateOpen(false); setSelectedPlanId(null); }} onSuccess={loadPlans} />
            <PlanSubscribersModal planId={selectedPlanId} isOpen={isSubscribersOpen} onClose={() => { setIsSubscribersOpen(false); setSelectedPlanId(null); }} />
            
            {/* مودال تایید حذف */}
            <Dialog isOpen={isDeleteModalOpen} onClose={() => { setIsDeleteModalOpen(false); setPlanToDelete(null); }} width={400}>
                <h5 className="mb-4 text-red-600">تایید حذف پلن</h5>
                <p className="mb-6 text-gray-700 text-sm leading-relaxed">
                    آیا از حذف این پلن مطمئن هستید؟ در صورتی که شرکتی در حال حاضر این اشتراک را فعال داشته باشد، عملیات حذف انجام نخواهد شد.
                </p>
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <Button variant="plain" onClick={() => { setIsDeleteModalOpen(false); setPlanToDelete(null); }} disabled={isDeleting}>
                        انصراف
                    </Button>
                    <Button variant="solid" className="bg-red-600 hover:bg-red-500" loading={isDeleting} onClick={executeDelete}>
                        بله، حذف شود
                    </Button>
                </div>
            </Dialog>
        </div>
    )
}

export default PlanList