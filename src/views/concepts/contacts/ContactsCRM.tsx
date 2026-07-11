import React, { useState, useEffect, useMemo, useRef } from 'react'
import { FaTelegramPlane, FaInstagram, FaWhatsapp, FaGlobe } from 'react-icons/fa'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'

// تایپ‌ها
import { Contact, Platform, availableTagThemes, ServerTag } from './types'

// کامپوننت‌ها
import CRMHeader from './components/CRMHeader'
import CRMFilters from './components/CRMFilters'
import ContactTable from './components/ContactTable'
import ContactDrawer from './components/ContactDrawer'
import TagManagementModal from './components/dialogs/TagManagementModal'
import AddContactModal from './components/dialogs/AddContactModal'
import DeleteConfirmModal from './components/dialogs/DeleteConfirmModal'
import BulkDeleteModal from './components/dialogs/BulkDeleteModal'
import ImportModal from './components/dialogs/ImportModal'
import { useSessionUser } from '@/store/authStore' 

// سرویس API
import { 
    apiGetContacts, 
    apiCreateContact, 
    apiUpdateContact,
    apiDeleteContact,
    apiExportContacts,
    apiSubmitParsedContacts,
    apiBulkDeleteContacts,
    apiGetTags, 
    apiCreateTag, 
    apiDeleteTag
} from '@/services/ContactService' 

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


const ContactsCRM = () => {
    // استیت‌های اصلی دیتابیس
    const [contacts, setContacts] = useState<Contact[]>([])
    const [isLoadingData, setIsLoadingData] = useState(true)

    // استیت‌های فیلتر و جستجو
    const [searchQuery, setSearchQuery] = useState('')
    const [filterPlatform, setFilterPlatform] = useState<Platform | 'All'>('All')
    const [filterTag, setFilterTag] = useState<string | 'All'>('All')
    const [selectedUser, setSelectedUser] = useState<Contact | null>(null)
    const [isExporting, setIsExporting] = useState(false)

    // استیت‌های صفحه‌بندی
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [totalItems, setTotalItems] = useState(0);

    // استیت‌های تگ‌ها
    const [serverTags, setServerTags] = useState<ServerTag[]>([]);
    const [isLoadingTags, setIsLoadingTags] = useState(false);  

    // استیت‌های حذف مخاطب
    const [contactToDelete, setContactToDelete] = useState<string | null>(null);
    const [isDeletingContact, setIsDeletingContact] = useState(false);
    
    const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const fetchContactsData = async () => {
     setIsLoadingData(true)
        try {
            const queryParams = {
                CompanyId: user?.companyId,
                SearchTerm: searchQuery.trim() !== '' ? searchQuery : undefined,
                PlatformFilter: mapPlatformToEnum(filterPlatform),
                Page: currentPage,
                PageSize: pageSize,
                TagFilter : ''
            };
            if (filterTag && filterTag !== 'All') {
                queryParams.TagFilter = appTags[filterTag]?.id; 
            }

            const response: any = await apiGetContacts(queryParams);
            const data = response.data || response;
            
            const normalizeContactTags = (contactsArray: any[]) => {
                return contactsArray.map(contact => ({
                    ...contact,
                    tags: (contact.tags || []).map((t: any) => ({
                        id: t?.id || t?.Id,
                        name: t.name || t.Name,
                        // کلیدهای مختلفی که ممکن است بک‌اند بفرستد را چک می‌کنیم تا حتماً color پر شود
                        color: t.colorHex || t.Color || t.color || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200'
                    }))
                }));
            };

            if (data.items) {
                setContacts(normalizeContactTags(data.items));
                setTotalItems(data.totalCount || 0);
            } else {
                const rawContacts = Array.isArray(data) ? data : [];     
                setContacts(normalizeContactTags(rawContacts));
            }

        } catch (error) {
            toast.push(<Notification type="danger" title="خطا">دریافت لیست مخاطبین با مشکل مواجه شد.</Notification>, { placement: 'top-center' })
        } finally {
            setIsLoadingData(false)
        }
    }
    // حفظ appTags برای کامپوننت‌های فیلتر و مودال‌ها
    const appTags = useMemo(() => {
        return serverTags.reduce((acc, tag) => {
            acc[tag.name] = { 
                color: tag.color, 
                id: tag.id 
            };
            return acc;
        }, {} as Record<string, { color: string; id: string }>);
    }, [serverTags]);

    const [isTagModalOpen, setIsTagModalOpen] = useState(false)
    const [newTagName, setNewTagName] = useState('')
    const [selectedThemeId, setSelectedThemeId] = useState(availableTagThemes[1].id)

    const [isDeleting, setIsDeleting] = useState(false);

    // استیت‌های افزودن دستی
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isAdding, setIsAdding] = useState(false)
    const [newContactData, setNewContactData] = useState({ 
        name: '', 
        companyId: '',
        phoneNumber: '', 
        platformId: '',
        email: '',
        note: '',
        platform: 'WhatsApp' as Platform, 
        tags: [] as string[] 
    });

    // استیت‌های ایمپورت
    const [isImportModalOpen, setIsImportModalOpen] = useState(false)
    const [importStep, setImportStep] = useState<1 | 2>(1)
    const [isImporting, setIsImporting] = useState(false)
    const [importedPreviewData, setImportedPreviewData] = useState<{name: string, companyId: string}[]>([])
    const [bulkPlatform, setBulkPlatform] = useState<Platform>('WhatsApp')
    const [bulkTags, setBulkTags] = useState<string[]>([])
    
    // استیت‌های کشو (Drawer)
    const [isEditingDrawerTags, setIsEditingDrawerTags] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const { user, setUser } = useSessionUser() 
    
    // ==========================================
    // 🌟 اتصال به API (چرخه حیات کامپوننت)
    // ==========================================
    useEffect(() => {
        const fetchTags = async () => {
            try {
                const response: any = await apiGetTags();
                const data = response.data || response;
                
                const normalizedTags = (Array.isArray(data) ? data : []).map((tag: any) => ({
                    id: tag.id || tag.Id,
                    name: tag.name || tag.Name,
                    color: tag.colorHex || tag.Color || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200' 
                }));
                
                setServerTags(normalizedTags);
            } catch (error) {
                toast.push(<Notification type="danger">خطا در دریافت لیست برچسب‌ها.</Notification>, { placement: 'top-center' });
            }
        };
        fetchTags();
    }, []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
           fetchContactsData();
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, filterPlatform, filterTag, currentPage, pageSize, user?.companyId]); 

    const totalPages = Math.ceil(totalItems / pageSize) || 1;

    // ==========================================
    // منطق فیلترها و صفحه‌بندی
    // ==========================================
    const handleSearchChange = (value: string) => { setSearchQuery(value); setCurrentPage(1); }
    const handlePlatformChange = (plat: Platform | 'All') => { setFilterPlatform(plat); setCurrentPage(1); }
    const handleTagFilterChange = (tag: string | 'All') => { setFilterTag(tag); setCurrentPage(1); }

    // ==========================================
    // هندلرهای عملیاتی سیستم
    // ==========================================
   const handleExportCSV = async () => {
        if (!user?.companyId) {
            return toast.push(
                <Notification type="danger" title="خطا">شناسه شرکت یافت نشد.</Notification>, 
                { placement: 'top-center' }
            );
        }

        setIsExporting(true);

        try {
            const platformEnum = mapPlatformToEnum(filterPlatform); 

            const response: any = await apiExportContacts(user.companyId, platformEnum);

            const fileData = response.data ?? response;

            const blob = new Blob([fileData], { type: 'text/csv;charset=utf-8;' });

            const url = window.URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            
            const dateStr = new Date().toISOString().slice(0, 10); // نمونه: 2026-07-09
            link.setAttribute('download', `Contacts_Export_${dateStr}.csv`);
            
            document.body.appendChild(link);
            link.click();
            link.remove();
            
            window.URL.revokeObjectURL(url);

            toast.push(
                <Notification type="success" title="موفقیت‌آمیز">
                    فایل اکسل مخاطبین با موفقیت تولید و دانلود شد.
                </Notification>, 
                { placement: 'top-center' }
            );

        } catch (error) {
            console.error("خطا در خروجی گرفتن اکسل مخاطبین:", error);
            toast.push(
                <Notification type="danger" title="خطا">
                    دریافت فایل اکسل با خطا مواجه شد. لطفا مجدداً تلاش کنید.
                </Notification>, 
                { placement: 'top-center' }
            );
        } finally {
            setIsExporting(false);
        }
    };

    const handleCreateAppTag = async () => {
        const trimmedName = newTagName.trim()
        if (!trimmedName) return toast.push(<Notification type="danger">نام تگ نمی‌تواند خالی باشد.</Notification>, { placement: 'top-center' })
        if (appTags[trimmedName]) return toast.push(<Notification type="warning">این تگ قبلاً ایجاد شده است.</Notification>, { placement: 'top-center' })
        if (!user?.companyId) {
            return toast.push(<Notification type="danger">خطا: شناسه شرکت (Company ID) یافت نشد.</Notification>, { placement: 'top-center' })
        }
        const themeClass = availableTagThemes.find(t => t.id === selectedThemeId)?.class || availableTagThemes[6].class
        
        try {
            const response: any = await apiCreateTag({ name: trimmedName, colorHex: themeClass, companyId: user.companyId, });
            const rawTag = response.data || response;
            
            const newNormalizedTag = {
                id: rawTag.id || rawTag.Id, 
                name: rawTag.name || rawTag.Name || trimmedName,
                color: rawTag.colorHex || rawTag.colorHex || themeClass,
            };

            setServerTags(prev => [...prev, newNormalizedTag]);
            setNewTagName('');
            toast.push(<Notification type="success">تگ جدید ایجاد شد.</Notification>, { placement: 'top-center' })

        } catch (error) {
            const err = error as any; 
            const serverMessage = err.response?.data?.Message || err.response?.data?.message || (typeof err.response?.data === 'string' ? err.response.data : null);
            const displayMessage = serverMessage || "خطا در ارتباط با سرور و ساخت تگ.";

            toast.push(
                <Notification type="danger" title="خطای ثبت">
                    {displayMessage}
                </Notification>, 
                { placement: 'top-center' }
            )
        }
    }

    const handleDeleteAppTag = async (tagName: string) => {
        const tagToDelete = serverTags.find(t => t.name === tagName);
        if (!tagToDelete) return;

        try {
            await apiDeleteTag(tagToDelete.id);

            setServerTags(prev => prev.filter(t => t.id !== tagToDelete.id));
            
            setContacts(prev => prev.map(c => ({ 
                ...c, 
                tags: (c.tags || []).filter((t: any) => t.id !== tagToDelete.id) 
            })));
            
            if (selectedUser) {
                setSelectedUser({ 
                    ...selectedUser, 
                    tags: (selectedUser.tags || []).filter((t: any) => t.id !== tagToDelete.id) 
                });
            }
            
             const delayDebounceFn = setTimeout(async () => {
                fetchContactsData();
            }, 500);

            toast.push(<Notification type="success">تگ با موفقیت حذف شد.</Notification>, { placement: 'top-center' })
        } catch (error) {
            toast.push(<Notification type="danger">خطا در حذف تگ.</Notification>, { placement: 'top-center' })
        }
    }

    const toggleContactTag = (tag: string) => {
        if (isAdding) return;
        setNewContactData(prev => {
            const tags = prev.tags.includes(tag) ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag]
            return { ...prev, tags }
        })
    }

    const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !selectedUser) return;
        
        const imageUrl = URL.createObjectURL(file);
        const updatedUser = { ...selectedUser, avatar: imageUrl };
        setSelectedUser(updatedUser);
        setContacts(prev => prev.map(c => c.id === updatedUser.id ? updatedUser : c));
        toast.push(<Notification type="success" title="آواتار تغییر کرد">عکس پروفایل به‌روزرسانی شد.</Notification>, { placement: 'top-center' })
    }

    // 🌟 نسخه جدید دکمه ذخیره هماهنگ با ContactDrawer
    const handleSaveContact = async (updatedData: any) => {
        if (!updatedData.id) {
            console.error("آیدی کاربر برای آپدیت مشخص نیست!");
            return;
        }

        try {
            updatedData.companyId = user?.companyId;

            // ارسال دیتا به بک‌اِند (کشو قبلاً tagIds را به درستی آماده کرده است)
            await apiUpdateContact(updatedData.id.toString(), updatedData);

            // تبدیل آیدی‌ها به آبجکتِ کامل ServerTag برای نمایش لحظه‌ای در جدول 
            const updatedTagsForUI = (updatedData.tagIds || [])
                .map((id: string) => serverTags.find(t => t.id === id))
                .filter(Boolean);

            // بروزرسانی جدول (آپدیت نام، شماره، یادداشت و تگ‌های جدید)
            setContacts(prevContacts => 
                prevContacts.map(contact => 
                    contact.id === updatedData.id 
                        ? { 
                            ...contact, 
                            fullName: updatedData.fullName,
                            phoneNumber: updatedData.phoneNumber,
                            note: updatedData.note,
                            tags: updatedTagsForUI 
                          } 
                        : contact
                )
            );
            setSelectedUser(null);

            toast.push(<Notification type="success" title="موفقیت">تغییرات با موفقیت ذخیره شد</Notification>, { placement: 'top-center' })

        } catch (error) {
            console.error("خطا در ذخیره اطلاعات مخاطب:", error);
            toast.push(<Notification type="danger" title="خطا">ثبت مخاطب با خطا مواجه شد.</Notification>, { placement: 'top-center' })
        }
    };
  
    const handleAddNewContact = async () => {

    if (!newContactData.name.trim()) {
            return toast.push(<Notification type="danger" title="خطا">لطفاً نام مخاطب را وارد کنید.</Notification>, { placement: 'top-center' })
        }
        
        if (!newContactData.phoneNumber && !newContactData.platformId) {
            return toast.push(<Notification type="danger" title="خطا">باید حداقل شماره موبایل یا آیدی (Username) را وارد کنید.</Notification>, { placement: 'top-center' })
        }

        setIsAdding(true)
        try {
            const payload = {
                fullName: newContactData.name,
                phoneNumber: newContactData.phoneNumber,
                userNameInPlatform: newContactData.platformId,
                note: newContactData.note,
                email: newContactData.email,
                platform: mapPlatformToEnum(newContactData.platform),
                companyId: user?.companyId,
                tagIds: newContactData.tags.map(tagName => {
                    const foundTag = serverTags.find(t => t.name === tagName);
                    return foundTag ? foundTag.id : null;
                }).filter(Boolean)
            };

            // ارسال ریکوئست به بک‌اِند
            const response: any = await apiCreateContact(payload);
            const returnedData = response.data || response;
            
            const newContactForUI = {
                id: returnedData.id || returnedData, // هندل کردن حالتی که بک‌اند فقط آیدی برگرداند
                fullName: newContactData.name,
                phoneNumber: newContactData.phoneNumber,
                userNameInPlatform: newContactData.platformId,
                note: newContactData.note,
                companyId: user?.companyId,
                
                // 👇 این خط دقیقاً مشکل آیکون را حل می‌کند
                platformName: newContactData.platform, 
                
                // مقداردهی اولیه برای نمایش در جدول
                lastActivity: new Date().toISOString(), 
                sessionCount: 0,
                
                // تبدیل نام تگ‌ها به آبجکت کامل برای نمایش رنگِ تگ‌ها در ردیفِ جدید
                tags: newContactData.tags.map(tagName => serverTags.find(t => t.name === tagName)).filter(Boolean)
            };
            
            // اضافه کردن مخاطب جدید به بالای جدول
            setContacts(prev => [newContactForUI as any, ...prev]);
            setTotalItems(prev => prev + 1);
            
            // بستن مودال و ریست کردن فرم برای دفعات بعدی
            setIsAddModalOpen(false)
            setNewContactData({ name: '', companyId: '', phoneNumber: '', platformId: '', email: '', note: '', platform: 'WhatsApp', tags: [] })
            
            toast.push(<Notification type="success" title="موفقیت">مخاطب جدید با موفقیت در سیستم ثبت شد.</Notification>, { placement: 'top-center' })
            
        } catch (error) {
            console.error("خطا در ایجاد مخاطب:", error);
            toast.push(<Notification type="danger" title="خطا">ثبت مخاطب با خطا مواجه شد. ارتباط با سرور را بررسی کنید.</Notification>, { placement: 'top-center' })
        } finally { 
            setIsAdding(false) 
        }
    }

    const handleConfirmBulkDelete = async () => {
        setIsDeleting(true);
        try {
             await apiBulkDeleteContacts(selectedContactIds); 
            
            toast.push(
                <Notification type="success" title="موفقیت">
                    {selectedContactIds.length} مخاطب با موفقیت حذف شدند.
                </Notification>, { placement: 'top-center' }
            );
            
            fetchContactsData(); // رفرش کردن جدول
            setSelectedContactIds([]); // خالی کردن تیک چک‌باکس‌ها
            setIsDeleteModalOpen(false); // بستن مودال
            
        } catch (error) {
            toast.push(
                <Notification type="danger" title="خطا">حذف با مشکل مواجه شد.</Notification>, { placement: 'top-center' }
            );
        } finally {
            setIsDeleting(false);
        }
    };

    // ==========================================
    // متدهای رندرینگ بصری (پلتفرم‌ها)
    // ==========================================
    const renderPlatformIcon = (platform: Platform, sizeClass: string = 'text-lg') => {
        switch (platform) {
            case 'Telegram': return <FaTelegramPlane className={`${sizeClass} text-sky-500`} />
            case 'Instagram': return <FaInstagram className={`${sizeClass} text-pink-600`} />
            case 'WhatsApp': return <FaWhatsapp className={`${sizeClass} text-green-500`} />
            case 'Web': return <FaGlobe className={`${sizeClass} text-indigo-500`} />
            default: return <FaGlobe className={`${sizeClass} text-gray-400`} />
        }
    }

    // 🌟 تابع نهایی دریافت لیست تمیز از مودال و ارسال به بک‌اِند
    const handleFinalImportSubmit = async (finalPayload: any[]) => {
        try {
            // ۱. دریافت شناسه شرکت (این بخش را با توجه به استیت مدیریت کاربران خودت تنظیم کن)
            // اگر از Context یا Redux استفاده می‌کنی، شناسه را از آنجا بخوان
            const companyId = user?.companyId || "00000000-0000-0000-0000-000000000000"; 
            
            // ۲. ارسال درخواست به سرور
            await apiSubmitParsedContacts(companyId, finalPayload);

            // ۳. نمایش پیغام موفقیت به اپراتور
            toast.push(
                <Notification type="success" title="عملیات موفق">
                    تعداد {finalPayload.length} مخاطب با موفقیت پردازش و به سیستم افزوده شد.
                </Notification>,
                { placement: 'top-center' }
            );

             fetchContactsData(); 

        } catch (error: any) {
            console.error("خطا در ارسال فایل نهایی به سرور AnyBot:", error);
            
            // استخراج پیام خطای بک‌اِند (اگر از سمت دات‌نت خطایی مثل 400 BadRequest برگردد)
            const errorMessage = error?.response?.data?.message || "ذخیره مخاطبین با مشکل مواجه شد. لطفا مجددا تلاش کنید.";
            
            toast.push(
                <Notification type="danger" title="خطای سرور">
                    {errorMessage}
                </Notification>,
                { placement: 'top-center' }
            );
            
            // 🌟 بسیار مهم: پرتاب مجدد خطا (Throw) به سمت مودال
            // این کار باعث می‌شود بلاک try/catch داخل مودال متوجه خطا شود،
            // حالت لودینگ دکمه سبز رنگ متوقف شود و مودال بسته نشود تا کاربر بتواند دوباره تلاش کند.
            throw error; 
        }
    };

    const getPlatformTheme = (platform: Platform) => {
        switch (platform) {
            case 'Telegram': return 'from-sky-400 to-blue-600'
            case 'WhatsApp': return 'from-green-400 to-emerald-600'
            case 'Instagram': return 'from-purple-500 via-pink-500 to-orange-400'
            case 'Web': return 'from-indigo-400 to-violet-600'
            default: return 'from-gray-400 to-gray-600'
        }
    }

    // ۱. این تابع فقط مودال را باز می‌کند و آیدی مخاطب را نگه می‌دارد
    const handleDeleteContactClick = (contactId: string) => {
        setContactToDelete(contactId);
    };

    // ۲. این تابع وقتی دکمه "بله، حذف کن" در مودال زده شد اجرا می‌شود
    const confirmDeleteContact = async () => {
        if (!contactToDelete) return;
        
        setIsDeletingContact(true);
        try {
            await apiDeleteContact(contactToDelete); 
            
            // پاک کردن مخاطب از جدول
            setContacts(prev => prev.filter(c => c.id !== contactToDelete));
            setTotalItems(prev => Math.max(0, prev - 1));
            
            toast.push(<Notification type="success" title="موفقیت">مخاطب با موفقیت حذف شد.</Notification>, { placement: 'top-center' });
        } catch (error) {
            console.error("خطا در حذف مخاطب:", error);
            toast.push(<Notification type="danger" title="خطا">حذف مخاطب با مشکل مواجه شد.</Notification>, { placement: 'top-center' });
        } finally {
            setIsDeletingContact(false);
            setContactToDelete(null); // بستن مودال در هر صورت
        }
    };

    
    return (
        <div className="flex flex-col gap-6 w-full h-full pb-8 relative animate-[fadeIn_0.3s_ease-out]" dir="rtl">
            
            <CRMHeader 
                setIsTagModalOpen={setIsTagModalOpen}
                setIsImportModalOpen={setIsImportModalOpen}
                isExporting={isExporting}
                handleExportCSV={handleExportCSV}
                setIsAddModalOpen={setIsAddModalOpen}
                selectedContactIds={selectedContactIds}
                setIsDeleteModalOpen={setIsDeleteModalOpen}
            />

            <CRMFilters 
                searchQuery={searchQuery}
                handleSearchChange={handleSearchChange}
                filterTag={filterTag}
                handleTagFilterChange={handleTagFilterChange}
                appTags={appTags}
                filterPlatform={filterPlatform}
                handlePlatformChange={handlePlatformChange}
            />

            {isLoadingData ? (
                <div className="flex flex-col items-center justify-center p-20 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                    <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                    <p className="mt-4 text-sm font-bold text-gray-500">در حال دریافت لیست مخاطبین...</p>
                </div>
            ) : (
               <ContactTable 
                    paginatedContacts={contacts}
                    appTags={appTags}
                    renderPlatformIcon={renderPlatformIcon}
                    setSelectedUser={setSelectedUser}
                    pageSize={pageSize}
                    setPageSize={setPageSize}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    totalItems={totalItems}
                    totalPages={totalPages}
                    onDeleteContact={handleDeleteContactClick} 
                    selectedContactIds={selectedContactIds}
                    setSelectedContactIds={setSelectedContactIds}
                />
            )}

            <ImportModal 
                isOpen={isImportModalOpen} // یا هر اسمی که برای استیت باز بودن مودال در این فایل دارید
                onClose={() => setIsImportModalOpen(false)}
                appTags={appTags}
                renderPlatformIcon={renderPlatformIcon}
                onSubmitFinalData={handleFinalImportSubmit}
            />

            <TagManagementModal 
                isOpen={isTagModalOpen} onClose={() => setIsTagModalOpen(false)}
                appTags={appTags} newTagName={newTagName} setNewTagName={setNewTagName}
                selectedThemeId={selectedThemeId} setSelectedThemeId={setSelectedThemeId}
                handleCreateAppTag={handleCreateAppTag} handleDeleteAppTag={handleDeleteAppTag}
            />

            <AddContactModal 
                isOpen={isAddModalOpen} onClose={() => !isAdding && setIsAddModalOpen(false)}
                isAdding={isAdding} newContactData={newContactData} setNewContactData={setNewContactData}
                toggleContactTag={toggleContactTag} appTags={appTags} renderPlatformIcon={renderPlatformIcon}
                handleAddNewContact={handleAddNewContact}
            />

            <ContactDrawer
                selectedUser={selectedUser}
                setSelectedUser={setSelectedUser}
                getPlatformTheme={getPlatformTheme}
                renderPlatformIcon={renderPlatformIcon}
                fileInputRef={fileInputRef}
                handleAvatarUpload={handleAvatarUpload}
                isEditingDrawerTags={isEditingDrawerTags}
                setIsEditingDrawerTags={setIsEditingDrawerTags}
                serverTags={serverTags} // 🌟 پاس دادن لیست کامل تگ‌ها به جای appTags
                onSaveContact={handleSaveContact} // 🌟 دکمه ذخیره جدید
            />

            <DeleteConfirmModal 
                isOpen={!!contactToDelete} 
                onClose={() => !isDeletingContact && setContactToDelete(null)}
                onConfirm={confirmDeleteContact}
                isDeleting={isDeletingContact}
            />

            <BulkDeleteModal 
                isOpen={isDeleteModalOpen} 
                onClose={() => setIsDeleteModalOpen(false)} 
                onConfirm={handleConfirmBulkDelete} 
                isDeleting={isDeleting} 
                selectedCount={selectedContactIds.length} 
            />

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

export default ContactsCRM;