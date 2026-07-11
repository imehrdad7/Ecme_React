import React from 'react'
import Dialog from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'
import { HiOutlineExclamationCircle, HiOutlineTrash } from 'react-icons/hi'

type DeleteConfirmModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isDeleting: boolean;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
    isOpen, onClose, onConfirm, isDeleting
}) => {
    return (
        <Dialog 
            isOpen={isOpen} 
            onClose={onClose} 
            closable={false} 
            width={400} 
            contentClassName="p-0 border-0 bg-white dark:bg-gray-900 shadow-2xl rounded-2xl overflow-hidden"
        >
            <div className="flex flex-col items-center text-center p-8">
                {/* آیکون هشدار با انیمیشن ملایم */}
                <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mb-5 relative">
                    <div className="absolute inset-0 bg-red-100 dark:bg-red-900/30 rounded-full animate-ping opacity-70"></div>
                    <HiOutlineExclamationCircle className="text-5xl relative z-10" />
                </div>
                
                <h4 className="text-lg font-black text-gray-800 dark:text-gray-100 mb-2">حذف مخاطب</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                    آیا از حذف این مخاطب اطمینان دارید؟ 
                    <br/>
                    بسته به سطح دسترسی شما، این عملیات ممکن است غیرقابل بازگشت باشد.
                </p>
                
                <div className="flex w-full gap-3">
                    <Button 
                        className="flex-1 font-bold bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700" 
                        onClick={onClose} 
                        disabled={isDeleting}
                    >
                        انصراف
                    </Button>
                    <Button 
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold shadow-lg shadow-red-200 dark:shadow-none" 
                        loading={isDeleting} 
                        onClick={onConfirm} 
                        icon={<HiOutlineTrash />}
                    >
                        بله، حذف کن
                    </Button>
                </div>
            </div>
        </Dialog>
    )
}

export default DeleteConfirmModal;