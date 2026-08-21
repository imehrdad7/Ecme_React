import { Button } from '@/components/ui'
import { HiOutlineExclamation } from 'react-icons/hi'
import { ReactNode } from 'react'

interface DeleteConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isLoading?: boolean;
    title?: string;
    message?: string | ReactNode;
}

const DeleteConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    isLoading = false,
    title = 'حذف اطلاعات',
    message = 'آیا از حذف این مورد اطمینان دارید؟ این عمل غیرقابل بازگشت است.'
}: DeleteConfirmModalProps) => {
    
    // اگر مودال بسته بود، اصلاً رندر نمی‌شود
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm transition-opacity">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-sm p-6 transform transition-all scale-100">
                <div className="flex flex-col items-center text-center">
                    
                    {/* آیکون هشدار */}
                    <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-5">
                        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center">
                            <HiOutlineExclamation className="text-3xl text-red-600 dark:text-red-500" />
                        </div>
                    </div>
                    
                    {/* متن‌ها (پویا شدند) */}
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {title}
                    </h3>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                        {message}
                    </div>
                    
                    {/* دکمه‌ها */}
                    <div className="flex items-center gap-3 w-full">
                        <Button 
                            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 border-none rounded-xl"
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            انصراف
                        </Button>
                        <Button 
                            variant="solid"
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg shadow-red-200 dark:shadow-none"
                            loading={isLoading}
                            onClick={onConfirm}
                        >
                            حذف شود
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmModal;