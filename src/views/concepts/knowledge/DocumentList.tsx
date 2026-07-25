import { useEffect, useState } from 'react'
import { apiGetKnowledgeDocuments, apiDeleteKnowledgeDocument } from '@/services/KnowledgeService'
import Button from '@/components/ui/Button'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import Dialog from '@/components/ui/Dialog'
import Tabs from '@/components/ui/Tabs'
import { HiOutlineTrash, HiOutlineDocumentText, HiOutlineGlobeAlt, HiOutlineFolderDownload, HiExclamationCircle } from 'react-icons/hi'
import { useSessionUser } from '@/store/authStore'

interface DocumentItem {
    id: string;
    title: string;
    sourceType: 1 | 2 | 3; // فرض بر این است: 1: متن مستقیم, 2: فایل, 3: سایت
    isProcessed: boolean;
    createdAt: string;
}

interface Props {
    refreshTrigger: number;
}

const { TabNav, TabList, TabContent } = Tabs

const DocumentList = ({ refreshTrigger }: Props) => {
    const [documents, setDocuments] = useState<DocumentItem[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false)
    const [docToDelete, setDocToDelete] = useState<string | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const documentToDeleteObj = documents.find(d => d.id === docToDelete);
    const isCurrentlyProcessing = documentToDeleteObj && !documentToDeleteObj.isProcessed;
    const [activeTab, setActiveTab] = useState('text') // تب پیش فرض روی متن مستقیم

    const { user } = useSessionUser();
    const companyId = user?.companyId || '';

    const fetchDocs = async () => {
        setIsLoading(true)
        try {
            const res = await apiGetKnowledgeDocuments<any>(companyId)
            const docs = Array.isArray(res) ? res : res?.data || []
            setDocuments(docs)
        } catch (error) {
            console.error("Failed to fetch documents", error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchDocs()
    }, [refreshTrigger])

    // هندلر باز کردن مودال حذف
    const requestDelete = (id: string) => {
        setDocToDelete(id)
        setDeleteModalIsOpen(true)
    }

    // هندلر تایید حذف نهایی
    const confirmDelete = async () => {
        if (!docToDelete) return;
        
        setIsDeleting(true)
        try {
            await apiDeleteKnowledgeDocument(companyId, docToDelete)
            toast.push(<Notification title="موفق" type="success">سند با موفقیت حذف شد.</Notification>, { placement: 'top-center' })
            fetchDocs()
        } catch (error) {
            toast.push(<Notification title="خطا" type="danger">متاسفانه حذف سند با خطا مواجه شد.</Notification>, { placement: 'top-center' })
        } finally {
            setIsDeleting(false)
            setDeleteModalIsOpen(false)
            setDocToDelete(null)
        }
    }

    // فیلتر کردن اسناد بر اساس تب فعال (این منطق نیازمند تطبیق با sourceType بک‌اند شماست)
    const filteredDocuments = documents.filter(doc => {
        if (activeTab === 'text') return doc.sourceType === 1; // فرض: 1 برای متن
        if (activeTab === 'file') return doc.sourceType === 2; // فرض: 2 برای فایل
        if (activeTab === 'website') return doc.sourceType === 3; // فرض: 3 برای سایت
        return true;
    });

    const getIconForType = (type: number) => {
        switch (type) {
            case 1: return <HiOutlineDocumentText className="text-xl text-blue-500" />;
            case 2: return <HiOutlineFolderDownload className="text-xl text-purple-500" />;
            case 3: return <HiOutlineGlobeAlt className="text-xl text-teal-500" />;
            default: return <HiOutlineDocumentText className="text-xl text-gray-500" />;
        }
    }

    // رندر کردن لیست فیلتر شده
    const renderList = () => {
        if (isLoading) return <div className="text-center py-12 text-gray-500 animate-pulse">در حال دریافت پایگاه دانش...</div>
        if (filteredDocuments.length === 0) return (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400 border border-dashed rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30">
                <HiOutlineDocumentText className="text-4xl mb-3 opacity-50" />
                <p>هیچ سندی در این بخش یافت نشد.</p>
            </div>
        )

        return (
            <div className="flex flex-col gap-4">
                {filteredDocuments.map((doc) => (
                    <div key={doc.id} className="group flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md hover:border-indigo-100 dark:hover:border-indigo-900/50 transition-all duration-200">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-gray-700/50 flex items-center justify-center">
                                {getIconForType(doc.sourceType)}
                            </div>
                            <div>
                                <p className="font-semibold text-gray-800 dark:text-gray-100 truncate max-w-xs md:max-w-md">{doc.title || 'سند بدون عنوان'}</p>
                                <div className="flex items-center gap-2 mt-1.5">
                                    <span className={`text-[11px] font-medium px-2.5 py-1 rounded-md ${doc.isProcessed ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'}`}>
                                        {doc.isProcessed ? 'آماده پاسخگویی' : 'در حال پردازش...'}
                                    </span>
                                    <span className="text-xs text-gray-400 dark:text-gray-500">
                                        {new Date(doc.createdAt).toLocaleDateString('fa-IR')}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <Button 
                            shape="circle" 
                            variant="plain" 
                            size="sm" 
                            className="text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 opacity-0 group-hover:opacity-100 transition-opacity" 
                            onClick={() => requestDelete(doc.id)}
                        >
                            <HiOutlineTrash className="text-xl" />
                        </Button>
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div className="w-full">
            <Tabs defaultValue="text" onChange={val => setActiveTab(val)}>
                <TabList className="mb-6 border-b border-gray-200 dark:border-gray-700 pb-px">
                    <TabNav value="text">متن مستقیم</TabNav>
                    <TabNav value="file">آپلود فایل</TabNav>
                    <TabNav value="website">سایت / لینک</TabNav>
                </TabList>
                
                <div className="mt-4">
                    {/* به دلیل ساختار فیلتر، ما محتوا را مستقل از TabContent رندر میکنیم تا ترانزیشن بهتری داشته باشیم */}
                    {renderList()}
                </div>
            </Tabs>

            {/* مودال تایید حذف */}
           <Dialog
                isOpen={deleteModalIsOpen}
                onClose={() => !isDeleting && setDeleteModalIsOpen(false)}
                className="max-w-sm"
            >
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
                            : 'آیا از حذف این سند اطمینان دارید؟ هوش مصنوعی دیگر در پاسخ‌های خود به این اطلاعات دسترسی نخواهد داشت.'}
                    </p>
                </div>
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <Button variant="plain" onClick={() => setDeleteModalIsOpen(false)} disabled={isDeleting} className="text-gray-600">
                        انصراف
                    </Button>
                    <Button variant="solid" color="red-600" onClick={confirmDelete} loading={isDeleting} className="bg-red-600 hover:bg-red-700">
                        بله، حذف شود
                    </Button>
                </div>
            </Dialog>
        </div>
    )
}

export default DocumentList