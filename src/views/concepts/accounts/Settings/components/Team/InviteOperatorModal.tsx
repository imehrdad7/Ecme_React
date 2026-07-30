import { useState } from 'react';
import { HiOutlineX, HiOutlineShieldCheck, HiOutlineChatAlt2 } from 'react-icons/hi';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { apiInviteOperator } from '@/services/teamService';
import { useSessionUser } from '@/store/authStore' 


interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const InviteOperatorModal = ({ isOpen, onClose, onSuccess }: Props) => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [role, setRole] = useState<'Admin' | 'User'>('User');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { user, setUser } = useSessionUser() 


    if (!isOpen) return null;

    const handleSubmit = async () => {
        // اعتبارسنجی ساده شماره موبایل
        if (!phoneNumber || phoneNumber.length < 10) {
            setError('لطفاً یک شماره تماس معتبر وارد کنید.');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            if (user?.companyId) {
                await apiInviteOperator({
                    companyId: user?.companyId,
                    phoneNumber: phoneNumber,
                    role: role
                });
                
                // در صورت موفقیت
                setPhoneNumber('');
                setRole('User');
                onSuccess();
                onClose();
        }
        } catch (err) {
            setError('خطا در ارسال دعوت‌نامه. لطفاً دوباره تلاش کنید.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
            <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-3xl shadow-xl overflow-hidden animate-[slideInUp_0.3s_ease-out]">
                
                {/* هدر مودال */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">افزودن همکار جدید</h3>
                    <Button shape="circle" variant="plain" size="sm" onClick={onClose} icon={<HiOutlineX className="text-xl" />} />
                </div>

                {/* بدنه مودال */}
                <div className="p-6 flex flex-col gap-6">
                    
                    {/* فیلد شماره تماس */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                            شماره موبایل همکار
                        </label>
                        <Input
                            placeholder="مثال: 09123456789"
                            value={phoneNumber}
                            maxLength={11}
                            onChange={(e) => {
                                setPhoneNumber(e.target.value);
                                setError('');
                            }}
                            className="font-mono text-left"
                            dir="ltr"
                        />
                        {error && <span className="text-xs text-red-500 mt-2 block">{error}</span>}
                    </div>

                    {/* انتخاب نقش (Role) */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                            سطح دسترسی (نقش)
                        </label>
                        <div className="grid grid-cols-1 gap-3">
                            
                            {/* کارت انتخاب اپراتور */}
                            <div 
                                onClick={() => setRole('User')}
                                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                                    role === 'User' 
                                    ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20' 
                                    : 'border-gray-100 dark:border-gray-800 hover:border-gray-200'
                                }`}
                            >
                                <HiOutlineChatAlt2 className={`text-2xl mb-2 ${role === 'User' ? 'text-indigo-600' : 'text-gray-400'}`} />
                                <h4 className={`font-bold text-sm mb-1 ${role === 'User' ? 'text-indigo-700 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-300'}`}>
                                    اپراتور چت
                                </h4>
                                <p className="text-[10px] text-gray-500 leading-relaxed">
                                    دسترسی به صندوق پیام‌ها و پاسخ‌گویی به مشتریان
                                </p>
                            </div>

                            {/* کارت انتخاب مدیر */}
                            {/* <div 
                                onClick={() => setRole('Admin')}
                                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                                    role === 'Admin' 
                                    ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-900/20' 
                                    : 'border-gray-100 dark:border-gray-800 hover:border-gray-200'
                                }`}
                            >
                                <HiOutlineShieldCheck className={`text-2xl mb-2 ${role === 'Admin' ? 'text-purple-600' : 'text-gray-400'}`} />
                                <h4 className={`font-bold text-sm mb-1 ${role === 'Admin' ? 'text-purple-700 dark:text-purple-400' : 'text-gray-700 dark:text-gray-300'}`}>
                                    مدیر کل
                                </h4>
                                <p className="text-[10px] text-gray-500 leading-relaxed">
                                    دسترسی کامل به چت‌ها، تنظیمات ربات و مدیریت مالی
                                </p>
                            </div> */}

                        </div>
                    </div>

                </div>

                {/* فوتر مودال */}
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
                    <Button variant="plain" onClick={onClose} disabled={isLoading}>
                        انصراف
                    </Button>
                    <Button 
                        className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[120px]" 
                        onClick={handleSubmit}
                        loading={isLoading}
                    >
                       ایجاد همکار
                    </Button>
                </div>

            </div>
        </div>
    );
};