import React from 'react'
import Dialog from '@/components/ui/Dialog'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { 
    HiX, HiOutlineUserAdd, HiOutlineSave, 
    HiOutlinePhone, HiOutlineMail, HiOutlineIdentification, HiOutlineDocumentText,
    HiChevronDown, HiChevronUp 
} from 'react-icons/hi'
import { Platform } from '../../types'

type AddContactModalProps = {
    isOpen: boolean;
    onClose: () => void;
    isAdding: boolean;
    newContactData: { 
        name: string; 
        phoneNumber: string; 
        platformId: string; 
        email: string;
        note: string;
        platform: Platform; 
        tags: string[] 
    };
    setNewContactData: React.Dispatch<React.SetStateAction<any>>;
    toggleContactTag: (tag: string) => void;
    appTags: Record<string, { color: string; id: string }>;
    renderPlatformIcon: (platform: Platform, sizeClass?: string) => React.ReactNode;
    handleAddNewContact: () => void;
}

const AddContactModal: React.FC<AddContactModalProps> = ({
    isOpen, onClose, isAdding, newContactData, setNewContactData, 
    toggleContactTag, appTags, renderPlatformIcon, handleAddNewContact
}) => {
    const [isContactInfoOpen, setIsContactInfoOpen] = React.useState(true);
    // هندل کردن فقط اعداد برای شماره موبایل
    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const onlyNumbers = e.target.value.replace(/\D/g, '');
        setNewContactData({ ...newContactData, phoneNumber: onlyNumbers });
    };

    return (
        <Dialog isOpen={isOpen} onClose={onClose} closable={false} width={600} contentClassName="p-0 border-0 bg-white dark:bg-gray-900 shadow-2xl rounded-2xl overflow-hidden">
            <div className="flex flex-col h-full max-h-[85vh]">
                
                {/* هدر جذاب */}
                <div className="relative bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-800/50 border-b border-gray-100 dark:border-gray-800 p-6 flex items-center gap-4 flex-shrink-0">
                    <button onClick={onClose} disabled={isAdding} className="absolute top-5 left-5 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
                        <HiX className="text-xl" />
                    </button>
                    <div className="w-12 h-12 bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none rounded-2xl flex items-center justify-center flex-shrink-0 transform -rotate-3">
                        <HiOutlineUserAdd className="text-2xl" />
                    </div>
                    <div>
                        <h4 className="text-lg font-black text-gray-800 dark:text-gray-100 tracking-tight">ثبت مخاطب جدید</h4>
                        <p className="text-xs font-bold text-gray-500 mt-1">اطلاعات مشتری یا لید جدید را با دقت وارد کنید.</p>
                    </div>
                </div>

                {/* بدنه فرم */}
                <div className="p-6 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
                    
                    {/* بخش اول: اطلاعات پایه و ربات */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1">نام و نام خانوادگی <span className="text-red-500">*</span></label>
                            <Input 
                                placeholder="مثال: علی رضایی" 
                                value={newContactData.name} 
                                onChange={(e) => setNewContactData({ ...newContactData, name: e.target.value })} 
                                disabled={isAdding} 
                                className="bg-gray-50/50 dark:bg-gray-800/50 font-bold focus:bg-white" 
                            />
                        </div>
                        
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1">انتخاب ربات / کانال هدف <span className="text-red-500">*</span></label>
                            <div className="relative">
                                {/* در آینده می‌توانید این بخش را به یک Select/Dropdown متصل به لیست ربات‌های بک‌اِند تبدیل کنید */}
                                <select 
                                    value={newContactData.platform}
                                    onChange={(e) => setNewContactData({ ...newContactData, platform: e.target.value as Platform })}
                                    disabled={isAdding}
                                    className="w-full h-11 pl-4 pr-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 text-sm font-bold text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 appearance-none outline-none transition-all"
                                >
                                    <option value="WhatsApp">شماره واتساپ پشتیبانی</option>
                                    <option value="Telegram">ربات تلگرام فروش</option>
                                    <option value="Instagram">دایرکت اینستاگرام</option>
                                    <option value="Web">چت‌بات وب‌سایت</option>
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                    {renderPlatformIcon(newContactData.platform, 'text-lg')}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* بخش دوم: اطلاعات تماس (گروه‌بندی شده) */}
                    <div className="bg-blue-50/40 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-2xl flex flex-col relative overflow-hidden flex-shrink-0">
                        {/* خط آبی رنگ دکوری سمت راست */}
                        <div className="absolute top-0 right-0 w-1.5 h-full bg-blue-400 dark:bg-blue-600"></div>
                        
                        {/* هدر قابل کلیک */}
                        <div 
                            className="p-4 flex items-center justify-between cursor-pointer hover:bg-blue-100/40 dark:hover:bg-blue-900/40 transition-colors select-none"
                            onClick={() => setIsContactInfoOpen(!isContactInfoOpen)}
                        >
                            <h5 className="text-xs font-black text-blue-800 dark:text-blue-400 flex items-center gap-1.5">
                                <HiOutlineIdentification className="text-lg" /> جزئیات ارتباطی
                            </h5>
                            {isContactInfoOpen ? <HiChevronUp className="text-blue-600 text-lg" /> : <HiChevronDown className="text-blue-600 text-lg" />}
                        </div>

                        {/* محتویات (فقط در صورت باز بودن رندر می‌شود) */}
                        {isContactInfoOpen && (
                            <div className="p-5 pt-0 grid grid-cols-1 md:grid-cols-2 gap-4 animate-[fadeIn_0.2s_ease-out]">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                        <HiOutlinePhone /> شماره موبایل
                                    </label>
                                    <Input 
                                        placeholder="09120000000" 
                                        value={newContactData.phoneNumber} 
                                        onChange={handlePhoneChange} 
                                        disabled={isAdding} 
                                        dir="ltr" 
                                        maxLength={11}
                                        className="bg-white dark:bg-gray-900 text-left font-mono focus:border-blue-400" 
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                        {renderPlatformIcon(newContactData.platform, 'text-[10px]')} آیدی در پلتفرم
                                    </label>
                                    <Input 
                                        placeholder="ali_rezaei@" 
                                        value={newContactData.platformId} 
                                        onChange={(e) => setNewContactData({ ...newContactData, platformId: e.target.value })} 
                                        disabled={isAdding} 
                                        dir="ltr" 
                                        className="bg-white dark:bg-gray-900 text-left font-mono focus:border-blue-400" 
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5 md:col-span-2">
                                    <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                        <HiOutlineMail /> آدرس ایمیل (اختیاری)
                                    </label>
                                    <Input 
                                        placeholder="example@gmail.com" 
                                        value={newContactData.email} 
                                        onChange={(e) => setNewContactData({ ...newContactData, email: e.target.value })} 
                                        disabled={isAdding} 
                                        dir="ltr" 
                                        className="bg-white dark:bg-gray-900 text-left font-mono focus:border-blue-400" 
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* بخش سوم: CRM (یادداشت و تگ‌ها) */}
                    <div className="flex flex-col gap-5">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1 flex items-center gap-1">
                                <HiOutlineDocumentText className="text-gray-400" /> یادداشت سیستم (CRM Note)
                            </label>
                            <Input 
                                textArea
                                rows={3}
                                placeholder="توضیحات، سابقه پیگیری یا یادداشتی درباره این مخاطب بنویسید..." 
                                value={newContactData.note} 
                                onChange={(e) => setNewContactData({ ...newContactData, note: e.target.value })} 
                                disabled={isAdding} 
                                className="bg-gray-50/50 dark:bg-gray-800/50 focus:bg-white text-sm" 
                            />
                        </div>

                        <div className="flex flex-col gap-3">
                            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1">دسته‌بندی و برچسب‌ها</label>
                            <div className="flex flex-wrap gap-2 bg-gray-50 dark:bg-gray-800/30 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                                {Object.keys(appTags).map(tag => {
                                    const isSelected = newContactData.tags.includes(tag);
                                    // 🌟 رفع باگ رندر کردن آبجکت: استفاده از appTags[tag]?.color
                                    const tagColorClass = appTags[tag]?.color || 'bg-gray-100 text-gray-700'; 
                                    
                                    return (
                                        <button 
                                            key={tag} 
                                            type="button"
                                            onClick={() => toggleContactTag(tag)} 
                                            disabled={isAdding} 
                                            className={`text-[11px] font-bold px-3 py-1.5 rounded-lg border transition-all duration-200 select-none ${
                                                isSelected 
                                                    ? `${tagColorClass} shadow-sm ring-2 ring-indigo-500/20 scale-[1.03]` 
                                                    : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                                            }`}
                                        >
                                            {tag}
                                        </button>
                                    )
                                })}
                                {Object.keys(appTags).length === 0 && (
                                    <span className="text-xs text-gray-400 w-full text-center py-2">هیچ برچسبی تعریف نشده است.</span>
                                )}
                            </div>
                        </div>
                    </div>

                </div>

                {/* فوتر دکمه‌ها */}
                <div className="p-5 border-t border-gray-100 dark:border-gray-800 flex gap-3 bg-gray-50/80 dark:bg-gray-800/40 flex-shrink-0">
                    <Button className="flex-1 font-bold bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700" onClick={onClose} disabled={isAdding}>
                        انصراف
                    </Button>
                    <Button className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-200 dark:shadow-none" loading={isAdding} onClick={handleAddNewContact} icon={<HiOutlineSave />}>
                        ثبت نهایی مخاطب
                    </Button>
                </div>

            </div>
        </Dialog>
    )
}

export default AddContactModal;