import { useState, useEffect } from 'react';
import { HiOutlineX } from 'react-icons/hi';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { apiEditOperator, TeamMember } from '@/services/teamService';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    member: TeamMember | null;
}

export const EditOperatorModal = ({ isOpen, onClose, onSuccess, member }: Props) => {
    const [formData, setFormData] = useState({
        userId: '',
        firstName: '',
        lastName: '',
        email: '',
        isActive: true
    });
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null); 
    
    // State جدید برای خطاهای اعتبارسنجی هر فیلد
    const [fieldErrors, setFieldErrors] = useState({
        firstName: '',
        lastName: '',
        email: ''
    });

    useEffect(() => {
        if (member) {
            setFormData({
                userId: member.id || '',
                firstName: member.firstName || '',
                lastName: member.lastName || '',
                email: member.email || '',
                isActive: member.isActive
            });
            setErrorMessage(null); 
            setFieldErrors({ firstName: '', lastName: '', email: '' }); // ریست کردن ارورها
        }
    }, [member]);

    // تابع اعتبارسنجی
    const validateForm = () => {
        let isValid = true;
        const newErrors = { firstName: '', lastName: '', email: '' };

        // 1. ولیدیشن نام
        if (!formData.firstName.trim()) {
            newErrors.firstName = 'وارد کردن نام الزامی است.';
            isValid = false;
        }

        // 2. ولیدیشن نام خانوادگی
        if (!formData.lastName.trim()) {
            newErrors.lastName = 'وارد کردن نام خانوادگی الزامی است.';
            isValid = false;
        }

        // 3. ولیدیشن ایمیل (اختیاری است، اما اگر وارد شد باید درست باشد)
        if (formData.email.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email.trim())) {
                newErrors.email = 'فرمت ایمیل وارد شده نامعتبر است.';
                isValid = false;
            }
        }

        setFieldErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async () => {
        // قبل از هر کاری، فرم را ولیدیت کن
        if (!validateForm()) return;

        setIsLoading(true);
        setErrorMessage(null); 

        try {
            const payload = {
                userId: formData.userId,
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                email: formData.email.trim() === '' ? null : formData.email.trim(),
                isActive: formData.isActive
            };
            
            await apiEditOperator(payload);
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error("خطا در ویرایش اطلاعات:", error);
            const serverMessage = 
                error.response?.data?.Message || 
                error.response?.data?.message || 
                (typeof error.response?.data === 'string' ? error.response.data : "خطایی در ثبت اطلاعات رخ داد. لطفاً دوباره تلاش کنید.");
                
            setErrorMessage(serverMessage);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen || !member) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-3xl shadow-xl overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                    <h3 className="text-lg font-bold text-gray-800">ویرایش اطلاعات کاربر</h3>
                    <Button shape="circle" variant="plain" onClick={onClose} icon={<HiOutlineX className="text-xl" />} />
                </div>

                <div className="p-6 flex flex-col gap-4">
                    {/* فیلد نام */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                            نام <span className="text-red-500">*</span>
                        </label>
                        <Input 
                            value={formData.firstName} 
                            onChange={(e) => {
                                setFormData({...formData, firstName: e.target.value});
                                if (fieldErrors.firstName) setFieldErrors({...fieldErrors, firstName: ''}); // پاک کردن ارور هنگام تایپ
                            }} 
                            invalid={!!fieldErrors.firstName} // اگر کامپوننت Input شما از این پراپرتی پشتیبانی می‌کند
                        />
                        {fieldErrors.firstName && (
                            <p className="text-red-500 text-xs mt-1 font-medium">{fieldErrors.firstName}</p>
                        )}
                    </div>

                    {/* فیلد نام خانوادگی */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                            نام خانوادگی <span className="text-red-500">*</span>
                        </label>
                        <Input 
                            value={formData.lastName} 
                            onChange={(e) => {
                                setFormData({...formData, lastName: e.target.value});
                                if (fieldErrors.lastName) setFieldErrors({...fieldErrors, lastName: ''});
                            }} 
                        />
                        {fieldErrors.lastName && (
                            <p className="text-red-500 text-xs mt-1 font-medium">{fieldErrors.lastName}</p>
                        )}
                    </div>

                    {/* فیلد ایمیل */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                            ایمیل <span className="text-gray-400 text-xs font-normal">(اختیاری)</span>
                        </label>
                        <Input 
                            type="email"
                            value={formData.email} 
                            onChange={(e) => {
                                setFormData({...formData, email: e.target.value});
                                if (fieldErrors.email) setFieldErrors({...fieldErrors, email: ''});
                            }} 
                            dir="ltr"
                            className="text-left"
                        />
                        {fieldErrors.email && (
                            <p className="text-red-500 text-xs mt-1 font-medium">{fieldErrors.email}</p>
                        )}
                    </div>

                    {/* سوییچ وضعیت حساب */}
                    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl cursor-pointer" onClick={() => setFormData({...formData, isActive: !formData.isActive})}>
                        <span className="font-bold text-sm">وضعیت حساب</span>
                        <div className={`w-11 h-6 rounded-full relative transition-colors ${formData.isActive ? 'bg-emerald-500' : 'bg-gray-300'}`}>
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.isActive ? 'left-6' : 'left-1'}`}></div>
                        </div>
                    </div>
                </div>

                {errorMessage && (
                    <div className="mx-6 mb-2 px-4 py-3 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm font-medium">
                        {errorMessage}
                    </div>
                )}

                <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 mt-2">
                    <Button variant="plain" onClick={onClose} disabled={isLoading}>انصراف</Button>
                    <Button className="bg-indigo-600 text-white" onClick={handleSubmit} loading={isLoading}>ذخیره تغییرات</Button>
                </div>
            </div>
        </div>
    );
};