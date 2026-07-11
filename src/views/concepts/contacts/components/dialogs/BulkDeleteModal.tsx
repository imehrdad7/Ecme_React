import React from 'react';
import Dialog from '@/components/ui/Dialog';
import Button from '@/components/ui/Button';

type BulkDeleteModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isDeleting: boolean;
    selectedCount: number;
}

const BulkDeleteModal: React.FC<BulkDeleteModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    isDeleting,
    selectedCount
}) => {
    return (
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            onRequestClose={onClose}
        >
            <div className="flex flex-col gap-4">
                <h4 className="text-lg font-bold text-red-600">حذف گروهی مخاطبین</h4>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    آیا از حذف <strong>{selectedCount}</strong> مخاطب انتخاب شده اطمینان دارید؟ 
                    <br />
                    <span className="text-sm text-red-500 mt-2 block">
                        این عملیات غیرقابل بازگشت است و تمام تاریخچه تعاملات این کاربران پاک خواهد شد.
                    </span>
                </p>
                <div className="flex justify-end gap-3 mt-4">
                    <Button 
                        variant="plain" 
                        onClick={onClose}
                        disabled={isDeleting}
                    >
                        انصراف
                    </Button>
                    <Button 
                        variant="solid" 
                        className="bg-red-600 hover:bg-red-700 text-white"
                        loading={isDeleting}
                        onClick={onConfirm}
                    >
                        بله، حذف کن
                    </Button>
                </div>
            </div>
        </Dialog>
    );
};

export default BulkDeleteModal;