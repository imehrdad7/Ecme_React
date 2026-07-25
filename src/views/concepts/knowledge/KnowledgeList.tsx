import { useEffect, useState } from 'react'
import { 
    apiGetKnowledgeDocuments, 
    apiDeleteKnowledgeDocument , 
    apiGetKnowledgeDocumentContent , 
    apiDownloadKnowledgeDocument 
} from '@/services/KnowledgeService'

import Button from '@/components/ui/Button'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import Dialog from '@/components/ui/Dialog'
import Tabs from '@/components/ui/Tabs'
import Tooltip from '@/components/ui/Tooltip' // 👈 تول‌تیپ ایمپورت شد
import { 
    HiOutlineTrash, 
    HiOutlineDocumentText, 
    HiOutlineGlobeAlt, 
    HiExclamationCircle,
    HiPlus,
    HiOutlineDocumentReport,
    HiOutlineTable,
    HiOutlinePhotograph,
    HiOutlineCode,
    HiOutlineDocument,
    HiOutlineEye,
    HiOutlineDownload,
    HiX,
    HiOutlineLink
} from 'react-icons/hi'
import { useSessionUser } from '@/store/authStore'

interface DocumentItem {
    id: string;
    title: string;
    sourceType: number; 
    isProcessed: boolean;
    createdAt?: string;
    contentUri?: string;
}

interface KnowledgeListProps {
    onAddClick: () => void;
}

const { TabNav, TabList } = Tabs

const KnowledgeList = ({ onAddClick }: KnowledgeListProps) => {
    const [documents, setDocuments] = useState<DocumentItem[]>([])
    const [isLoading, setIsLoading] = useState(true)
    
    // استیت‌های مودال حذف
    const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false)
    const [docToDelete, setDocToDelete] = useState<string | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    
    // استیت‌های مودال نمایش
    const [viewModalIsOpen, setViewModalIsOpen] = useState(false)
    const [selectedDocTitle, setSelectedDocTitle] = useState('')
    const [docContent, setDocContent] = useState('')
    const [isLoadingContent, setIsLoadingContent] = useState(false)

    const [activeTab, setActiveTab] = useState('text')
    
    const { user } = useSessionUser()
    const companyId = user?.companyId || ''

    const fetchDocs = async () => {
        setIsLoading(true)
        try {
            const res = await apiGetKnowledgeDocuments<any>(companyId)
            const docs = Array.isArray(res) ? res : res?.data || []
            debugger
            setDocuments(docs)
        } catch (error) {
            console.error("Failed to fetch documents", error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchDocs()
    }, [])

    const documentToDeleteObj = documents.find(d => d.id === docToDelete)
    const isCurrentlyProcessing = documentToDeleteObj && !documentToDeleteObj.isProcessed

    // توابع حذف
    const requestDelete = (id: string) => {
        setDocToDelete(id)
        setDeleteModalIsOpen(true)
    }

    const confirmDelete = async () => {
        if (!docToDelete) return;
        setIsDeleting(true)
        try {
            await apiDeleteKnowledgeDocument(companyId, docToDelete)
            toast.push(<Notification title="موفق" type="success">سند با موفقیت حذف شد.</Notification>, { placement: 'top-center' })
            fetchDocs()
        } catch (error) {
            toast.push(<Notification title="خطا" type="danger">حذف سند با خطا مواجه شد.</Notification>, { placement: 'top-center' })
        } finally {
            setIsDeleting(false)
            setDeleteModalIsOpen(false)
            setDocToDelete(null)
        }
    }

    // تابع نمایش محتوا
    const openViewModal = async (docId: string, docTitle: string) => {
        setSelectedDocTitle(docTitle)
        setViewModalIsOpen(true)
        setIsLoadingContent(true)
        setDocContent('')

        try {
            const response = await apiGetKnowledgeDocumentContent(companyId, docId);
            setDocContent(response.content);            
            setTimeout(() => {
                setIsLoadingContent(false);
            }, 1000);

        } catch (error) {
            setDocContent('خطا در دریافت محتوای سند.');
            setIsLoadingContent(false);
        }
    }

    // تابع دانلود فایل
    const handleDownload = async (docId: string, docTitle: string) => {
        toast.push(
            <Notification title="شروع دانلود" type="info">
                در حال آماده‌سازی فایل "{docTitle}" برای دانلود...
            </Notification>, 
            { placement: 'top-center' }
        )
        try {
            const response = await apiDownloadKnowledgeDocument(companyId,docId);
            
            const url = window.URL.createObjectURL(new Blob([response]));
            const link = document.createElement('a');
            link.href = url;
            
            link.setAttribute('download', docTitle); 
            
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            
        } catch (error) {
            console.error("Error downloading file:", error);
            toast.push(
                <Notification title="خطا" type="danger">
                    دانلود فایل با مشکل مواجه شد.
                </Notification>, 
                { placement: 'top-center' }
            )
        }
    }

    // فیلتر کردن اسناد
    const filteredDocuments = documents.filter(doc => {
        if (activeTab === 'text') return doc.sourceType === 1;
        if (activeTab === 'website') return doc.sourceType === 3 || doc.sourceType === 6;
        if (activeTab === 'file') return doc.sourceType !== 1 && doc.sourceType !== 3 && doc.sourceType !== 6; 
        return true;
    });

    // انتخاب آیکون بر اساس پسوند و نوع
    const getIconForDocument = (type: number, title: string) => {
        if (type === 3 || type === 6) return <HiOutlineGlobeAlt className="text-2xl text-teal-500" />;
        if (type === 1) return <HiOutlineDocumentText className="text-2xl text-blue-500" />;

        const lowerTitle = (title || '').toLowerCase();

        if (lowerTitle.endsWith('.pdf')) return <HiOutlineDocumentReport className="text-2xl text-red-500" />;
        if (lowerTitle.endsWith('.csv') || lowerTitle.endsWith('.xlsx') || lowerTitle.endsWith('.xls')) return <HiOutlineTable className="text-2xl text-emerald-500" />;
        if (lowerTitle.endsWith('.jpg') || lowerTitle.endsWith('.jpeg') || lowerTitle.endsWith('.png')) return <HiOutlinePhotograph className="text-2xl text-amber-500" />;
        if (lowerTitle.endsWith('.json') || lowerTitle.endsWith('.xml') || lowerTitle.endsWith('.html')) return <HiOutlineCode className="text-2xl text-purple-500" />;
        if (lowerTitle.endsWith('.txt') || lowerTitle.endsWith('.doc') || lowerTitle.endsWith('.docx')) return <HiOutlineDocumentText className="text-2xl text-indigo-500" />;

        return <HiOutlineDocument className="text-2xl text-gray-500" />;
    }

    const renderList = () => {
        if (isLoading) return <div className="text-center py-12 text-gray-500 animate-pulse">در حال دریافت پایگاه دانش...</div>
        if (filteredDocuments.length === 0) return (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <div className="w-16 h-16 bg-gray-50 dark:bg-gray-700/50 rounded-full flex items-center justify-center mb-4">
                    <HiOutlineDocumentText className="text-3xl text-gray-300 dark:text-gray-500" />
                </div>
                <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">سندی یافت نشد</h4>
                <p className="text-sm">در این بخش هنوز اطلاعاتی ثبت نکرده‌اید.</p>
            </div>
        )

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDocuments.map((doc) => (
                    <div key={doc.id} className="group relative flex flex-col p-5 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 rounded-xl bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center">
                                {getIconForDocument(doc.sourceType, doc.title)}
                            </div>
                            
                            {/* دکمه‌های عملیاتی (نمایش، دانلود، حذف) */}
                            <div className="absolute top-4 left-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-50/90 dark:bg-gray-900/90 rounded-full px-1 py-1 shadow-sm border border-gray-100 dark:border-gray-700">
                                
                                {/* 👈 جایگزین شدن title با کامپوننت Tooltip */}
                                <Tooltip title={doc.isProcessed ? "نمایش محتوا" : "سند در حال پردازش است..."} placement="top">
                                    {/* تگ span به این خاطر اضافه شد که در برخی کتابخانه‌ها، Tooltip روی دکمه‌های disabled عمل نمی‌کند */}
                                    <span className="inline-block">
                                        <Button 
                                            shape="circle" variant="plain" size="sm" 
                                            className={`text-gray-400 transition-colors ${doc.isProcessed ? 'hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30' : 'opacity-40 cursor-not-allowed'}`}
                                            onClick={() => doc.isProcessed && openViewModal(doc.id, doc.title)}
                                            disabled={!doc.isProcessed}
                                        >
                                            <HiOutlineEye className="text-lg" />
                                        </Button>
                                    </span>
                                </Tooltip>

                                <Tooltip title={doc.isProcessed ? "دانلود سند" : "سند در حال پردازش است..."} placement="top">
                                    <span className="inline-block">
                                        <Button 
                                            shape="circle" variant="plain" size="sm" 
                                            className={`text-gray-400 transition-colors ${doc.isProcessed ? 'hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/30' : 'opacity-40 cursor-not-allowed'}`}
                                            onClick={() => doc.isProcessed && handleDownload(doc.id, doc.title)}
                                            disabled={!doc.isProcessed}
                                        >
                                            <HiOutlineDownload className="text-lg" />
                                        </Button>
                                    </span>
                                </Tooltip>

                                <Tooltip title={doc.isProcessed ? "حذف سند" : "توقف پردازش و حذف"} placement="top">
                                    <Button 
                                        shape="circle" variant="plain" size="sm" 
                                        className="text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30"
                                        onClick={() => requestDelete(doc.id)}
                                    >
                                        <HiOutlineTrash className="text-lg" />
                                    </Button>
                                </Tooltip>
                            </div>
                        </div>
                        
                        {/* تول‌تیپ برای عنوان سند در صورتی که طولانی باشد */}
                        <Tooltip title={doc.title || 'سند بدون عنوان'} placement="top">
                            <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-base mb-1 line-clamp-2">
                                {doc.title || 'سند بدون عنوان'}
                            </h3>
                           {(doc.sourceType === 3 || doc.sourceType === 6) && (
                                    <div className="flex items-center gap-2 bg-blue-50/80 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 rounded-lg px-2.5 py-1.5 mt-1 transition-colors hover:bg-blue-100 dark:hover:bg-blue-900/40">                                        <div className="w-5 h-5 rounded-md bg-blue-100 dark:bg-blue-800/50 flex items-center justify-center shrink-0">
                                            <HiOutlineLink className="text-blue-600 dark:text-blue-400 text-xs" />
                                        </div>
                                        <span className="text-xs font-medium text-blue-600 dark:text-blue-400 truncate text-left w-full font-sans tracking-wide" dir="ltr">                                            {doc.contentUri || 'آدرس سایت ثبت نشده'}
                                        </span>
                                    </div>
                                )}
                        </Tooltip>

                        <div className="mt-auto pt-4 flex items-center justify-between">
                            <span className={`text-[11px] font-medium px-2.5 py-1 rounded-md ${doc.isProcessed ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'}`}>
                                {doc.isProcessed ? 'آماده پاسخگویی' : 'در حال پردازش...'}
                            </span>
                            <span className="text-xs text-gray-400 dark:text-gray-500 font-sans">
                                {doc.createdAt 
                                    ? new Date(doc.createdAt).toLocaleDateString('fa-IR', { 
                                        year: 'numeric', month: 'long', day: 'numeric' 
                                      }) 
                                    : 'تاریخ نامشخص'}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6 w-full p-4 md:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">اسناد آموزش داده شده</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">مدیریت اطلاعاتی که ربات برای پاسخگویی استفاده می‌کند.</p>
                </div>
                <Button variant="solid" icon={<HiPlus />} onClick={onAddClick} className="bg-indigo-600 hover:bg-indigo-700">
                    افزودن دانش جدید
                </Button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 md:p-6">
                <Tabs defaultValue="text" onChange={val => setActiveTab(val)}>
                    <TabList className="flex justify-center mb-8 border-b border-gray-200 dark:border-gray-700 pb-px">
                        <div className="flex gap-2 sm:gap-6">
                            <TabNav value="text">متن مستقیم</TabNav>
                            <TabNav value="file">فایل‌های آپلود شده</TabNav>
                            <TabNav value="website">سایت و لینک</TabNav>
                        </div>
                    </TabList>
                    
                    <div className="mt-4">
                        {renderList()}
                    </div>
                </Tabs>
            </div>

            {/* مودال حذف */}
            <Dialog isOpen={deleteModalIsOpen} onClose={() => !isDeleting && setDeleteModalIsOpen(false)} className="max-w-sm">
                <div className="flex flex-col items-center text-center pt-4 pb-2">
                    <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                        <HiExclamationCircle className="text-4xl text-red-600 dark:text-red-500" />
                    </div>
                    <h5 className="mb-2 text-gray-900 dark:text-white font-bold">
                        {isCurrentlyProcessing ? 'توقف پردازش و حذف' : 'حذف اطلاعات دانش'}
                    </h5>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                        {isCurrentlyProcessing 
                            ? 'این سند در حال پردازش است. آیا از حذف و توقف عملیات پردازش آن اطمینان دارید؟'
                            : 'آیا از حذف این سند اطمینان دارید؟ ربات دیگر به این اطلاعات دسترسی نخواهد داشت.'}
                    </p>
                </div>
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <Button variant="plain" onClick={() => setDeleteModalIsOpen(false)} disabled={isDeleting} className="text-gray-600">انصراف</Button>
                    <Button variant="solid" color="red-600" onClick={confirmDelete} loading={isDeleting} className="bg-red-600 hover:bg-red-700">بله، حذف شود</Button>
                </div>
            </Dialog>

            {/* مودال نمایش محتوا */}
            <Dialog isOpen={viewModalIsOpen} onClose={() => setViewModalIsOpen(false)} className="max-w-2xl">
                <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-4 mb-4">
                    <h5 className="text-lg font-bold text-gray-900 dark:text-white truncate pr-4">
                        محتوای: <span className="text-indigo-600 font-normal">{selectedDocTitle}</span>
                    </h5>
                    <button onClick={() => setViewModalIsOpen(false)} className="text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-full p-1.5 transition-colors">
                        <HiX className="text-xl" />
                    </button>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 h-[400px] overflow-y-auto border border-gray-200 dark:border-gray-800 custom-scrollbar">
                    {isLoadingContent ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                            در حال دریافت محتوا از سرور...
                        </div>
                    ) : (
                        <pre className="text-sm text-gray-700 dark:text-gray-300 font-sans whitespace-pre-wrap leading-relaxed">
                            {docContent}
                        </pre>
                    )}
                </div>
                
                <div className="flex justify-end mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <Button variant="solid" onClick={() => setViewModalIsOpen(false)} className="bg-gray-800 hover:bg-gray-900 text-white">بستن پنجره</Button>
                </div>
            </Dialog>
        </div>
    )
}

export default KnowledgeList