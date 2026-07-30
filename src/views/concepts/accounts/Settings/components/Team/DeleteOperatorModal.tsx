import { HiOutlineExclamationCircle } from 'react-icons/hi';
import Button from '@/components/ui/Button';
import { apiDeleteOperator, TeamMember } from '@/services/teamService';
import { useState } from 'react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    member: TeamMember | null;
}

export const DeleteOperatorModal = ({ isOpen, onClose, onSuccess, member }: Props) => {
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen || !member) return null;

    const handleDelete = async () => {
        setIsLoading(true);
        try {
            await apiDeleteOperator(member.id);
            onSuccess();
            onClose();
        } catch (error) {
            console.error("خطا در حذف همکار");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
            <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-3xl shadow-xl overflow-hidden animate-[slideInUp_0.3s_ease-out]">
                <div className="p-6 flex flex-col items-center text-center gap-4">
                    <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mb-2">
                        <HiOutlineExclamationCircle className="text-4xl" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">حذف همکار</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                        آیا از حذف دسترسی <span className="font-bold text-gray-800 dark:text-gray-200">{member.firstName + " " + member.lastName || member.phoneNumber}</span> اطمینان دارید؟ این عمل غیرقابل بازگشت است.
                    </p>
                </div>
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 flex justify-center gap-3 w-full">
                    <Button className="flex-1" variant="plain" onClick={onClose} disabled={isLoading}>انصراف</Button>
                    <Button className="flex-1 bg-red-500 hover:bg-red-600 text-white" onClick={handleDelete} loading={isLoading}>بله، حذف شود</Button>
                </div>
            </div>
        </div>
    );
};