import { useEffect } from 'react'
import Dialog from '@/components/ui/Dialog'
import CreatePlanForm from './CreatePlanForm'

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const CreatePlanModal = ({ isOpen, onClose, onSuccess }: Props) => {
    
    useEffect(() => {
        if (isOpen) {
            document.body.classList.add('overflow-hidden');
        } else {
            document.body.classList.remove('overflow-hidden');
        }

        return () => {
            document.body.classList.remove('overflow-hidden');
        };
    }, [isOpen]);

    return (
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            width={900}
        >
            <h5 className="mb-4">تعریف پلن جدید</h5>
            
            <CreatePlanForm 
                onSuccess={() => {
                    onSuccess();
                    onClose();
                }} 
            />
        </Dialog>
    )
}

export default CreatePlanModal