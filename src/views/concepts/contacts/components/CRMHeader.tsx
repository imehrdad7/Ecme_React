import React from 'react'
import Button from '@/components/ui/Button'
import { HiOutlineTag, HiOutlineUpload, HiOutlineDownload, HiOutlinePlus, HiOutlineTrash } from 'react-icons/hi'

type CRMHeaderProps = {
    setIsTagModalOpen: (val: boolean) => void;
    setIsImportModalOpen: (val: boolean) => void;
    isExporting: boolean;
    handleExportCSV: () => void;
    setIsAddModalOpen: (val: boolean) => void;
    
    // 🌟 پراپ‌های مربوط به حذف گروهی اضافه شدند
    selectedContactIds: string[];
    setIsDeleteModalOpen: (val: boolean) => void;
}

const CRMHeader: React.FC<CRMHeaderProps> = ({
    setIsTagModalOpen,
    setIsImportModalOpen,
    isExporting,
    handleExportCSV,
    setIsAddModalOpen,
    selectedContactIds,
    setIsDeleteModalOpen
}) => {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">مدیریت مخاطبین</h3>
                <p className="text-sm text-gray-500 mt-1">دیتابیس یکپارچه کاربران از تمامی کانال‌های ارتباطی</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
                {selectedContactIds.length > 0 && (
                    <Button 
                        variant="plain" 
                        onClick={() => setIsDeleteModalOpen(true)} 
                        icon={<HiOutlineTrash />}
                        className="font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 border border-red-100 dark:border-red-900/50"
                    >
                        حذف ({selectedContactIds.length}) مورد
                    </Button>
                )}

                <Button variant="plain" onClick={() => setIsTagModalOpen(true)} className="font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-indigo-100 dark:border-indigo-900/50" icon={<HiOutlineTag />}>
                    مدیریت برچسب‌ها
                </Button>
                
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
    )
}

export default CRMHeader;