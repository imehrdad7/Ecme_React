import React, { useEffect, useState } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Avatar from '@/components/ui/Avatar'
import { 
    HiX, HiOutlinePhone, HiOutlineDeviceMobile, 
    HiOutlineTag, HiOutlinePencil, HiOutlineUser, HiOutlineCamera, HiOutlineSave
} from 'react-icons/hi'
import { Contact, Platform, ServerTag } from '../types'

type ContactDrawerProps = {
    selectedUser: Contact | null;
    setSelectedUser: (user: Contact | null) => void;
    getPlatformTheme: (platform: Platform) => string | undefined;
    renderPlatformIcon: (platform: Platform, sizeClass?: string) => React.ReactNode;
    fileInputRef: React.RefObject<HTMLInputElement>;
    handleAvatarUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isEditingDrawerTags: boolean;
    setIsEditingDrawerTags: (val: boolean) => void;
    serverTags: ServerTag[]; // 🌟 تغییر پراپ به لیست کامل تگ‌ها
    onSaveContact?: (updatedData: any) => void; 
}

const getRelativeTime = (dateString?: string) => {
    if (!dateString) return 'نامشخص';
    const localDateString = dateString.split('+')[0].replace('Z', '').trim().replace(' ', 'T');
    const past = new Date(localDateString).getTime();
    const diffMs = Math.max(Date.now() - past, 0);
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const rtf = new Intl.RelativeTimeFormat('fa-IR', { numeric: 'auto' });

    if (diffDays > 0) return rtf.format(-diffDays, 'day');
    if (diffHours > 0) return rtf.format(-diffHours, 'hour');
    if (diffMinutes > 0) return rtf.format(-diffMinutes, 'minute');
    return 'همین الان';
};

const ContactDrawer: React.FC<ContactDrawerProps> = ({
    selectedUser,
    setSelectedUser,
    getPlatformTheme,
    renderPlatformIcon,
    fileInputRef,
    handleAvatarUpload,
    isEditingDrawerTags,
    setIsEditingDrawerTags,
    serverTags, // 🌟 دریافت استیت سرور تگ‌ها
    onSaveContact
}) => {
    // 🌟 استیت tags فقط آیدی‌ها (string) را نگه می‌دارد
    const [formData, setFormData] = useState<{
        fullName: string;
        phoneNumber: string;
        notes: string;
        tags: string[];
    }>({ fullName: '', phoneNumber: '', notes: '', tags: [] });

    const [phoneError, setPhoneError] = useState<string>('');

    useEffect(() => {
        if (selectedUser) {
            document.body.style.overflow = 'hidden';
            setPhoneError(''); 
            const initialTagIds = (selectedUser.tags || []).map((t: any) => t.id || t);

            setFormData({
                fullName: selectedUser.fullName || '',
                phoneNumber: selectedUser.phoneNumber || '',
                notes: selectedUser.note || '',
                tags: initialTagIds
            });

        } else {
            document.body.style.overflow = 'unset';
            setIsEditingDrawerTags(false);
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [selectedUser]);

    // 🌟 تابع هندل کردن انتخاب/حذف تگ‌ها (بر اساس آیدی)
    const handleToggleTag = (tagId: string) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.includes(tagId) 
                ? prev.tags.filter(id => id !== tagId) 
                : [...prev.tags, tagId] 
        }));
    };

    const handleSaveChanges = () => {
        if (selectedUser && onSaveContact) {
            const phone = formData.phoneNumber.trim();
            const mobileRegex = /^09\d{9}$/;

            if (phone && !mobileRegex.test(phone)) {
                setPhoneError('شماره موبایل معتبر نیست. باید با 09 شروع شده و 11 رقم باشد.');
                return;
            }
            setPhoneError('');
            const payload = {
                id: selectedUser.id,
                fullName: formData.fullName,
                phoneNumber: formData.phoneNumber.trim(),
                note: formData.notes,
                companyId: selectedUser.companyId,
                // 🌟 چون formData.tags خودش آرایه‌ای از آیدی‌هاست، مستقیم ارسال می‌کنیم
                tagIds: formData.tags 
            };

            // برای آپدیت سریع رابط کاربری (Optimistic UI)
            const updatedUser = {
                ...selectedUser,
                fullName: formData.fullName,
                phoneNumber: formData.phoneNumber.trim(),
                note: formData.notes,
                tags: formData.tags.map(id => serverTags.find(t => t.id === id)).filter(Boolean) as ServerTag[]
            };

            setSelectedUser(updatedUser);

            onSaveContact(payload);
            
            setIsEditingDrawerTags(false);
        }
    };

    return (
        <div className={`fixed inset-0 z-50 flex justify-start transition-all duration-300 ${selectedUser ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
            <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={() => setSelectedUser(null)}></div>
            <div className={`relative w-full max-w-md h-full bg-white dark:bg-gray-900 shadow-2xl flex flex-col transform transition-transform duration-500 ease-in-out ${selectedUser ? 'translate-x-0' : '-translate-x-full'}`}>
                {selectedUser && (
                    <>
                        {/* هدر رنگی */}
                        <div className={`h-32 w-full bg-gradient-to-br ${getPlatformTheme(selectedUser.platformName as Platform)} relative flex-shrink-0`}>
                            {/* دکمه خروج */}
                            <button onClick={() => setSelectedUser(null)} className="absolute top-4 left-4 w-8 h-8 rounded-full bg-black/20 text-white flex items-center justify-center hover:bg-black/40 backdrop-blur-md transition-colors border border-white/10 z-10">
                                <HiX className="text-lg" />
                            </button>
                            <div className="absolute -bottom-4 -right-4 opacity-20 transform rotate-12 scale-150 text-white mix-blend-overlay">{renderPlatformIcon(selectedUser.platformName as Platform, 'text-9xl')}</div>
                        </div>

                        <div className="px-6 relative flex-shrink-0">
                            {/* آواتار */}
                            <div className="absolute -top-12 group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                <input type="file" ref={fileInputRef} accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                                <Avatar src={selectedUser.avatar} size={90} shape="circle" className="bg-white dark:bg-gray-800 text-indigo-600 font-black text-5xl border-4 border-white dark:border-gray-900 shadow-lg object-cover">
                                    {!selectedUser.avatar && (formData.fullName ? formData.fullName.charAt(0) : '؟')}
                                </Avatar>
                                <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border-4 border-transparent">
                                    <HiOutlineCamera className="text-white text-2xl" />
                                </div>
                            </div>
                            
                            {/* دکمه ذخیره */}
                            <div className="absolute left-6 -top-5 z-20">
                                <Button 
                                    size="sm" 
                                    onClick={handleSaveChanges} 
                                    className="bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-gray-700 shadow-xl border border-gray-100 dark:border-gray-700 rounded-full font-extrabold px-5 py-2 flex items-center gap-2 transform transition-all hover:-translate-y-1"
                                >
                                    <HiOutlineSave className="text-xl" />
                                    ذخیره تغییرات
                                </Button>
                            </div>

                            {/* بخش ویرایش اطلاعات اصلی */}
                            <div className="mt-16 mb-6 flex flex-col gap-3">
                                <div>
                                    <label className="text-[11px] text-gray-400 font-bold mb-1 block">نام و نام خانوادگی</label>
                                    <Input 
                                        size="sm"
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                                        placeholder="نام مخاطب"
                                        className="font-bold text-gray-800 dark:text-gray-100 bg-gray-50 dark:bg-gray-800/50"
                                    />
                                </div>
                                
                                <div>
                                    <label className="text-[11px] text-gray-400 font-bold mb-1 block">شماره موبایل</label>
                                    <Input 
                                        size="sm"
                                        dir="ltr"
                                        maxLength={11}
                                        value={formData.phoneNumber}
                                        onChange={(e) => {
                                            const onlyNumbers = e.target.value.replace(/\D/g, '');
                                            
                                            setFormData({...formData, phoneNumber: onlyNumbers});
                                            if(phoneError) setPhoneError(''); 
                                        }}
                                        placeholder="مثال: 09120000000"
                                        className="text-left font-mono text-gray-600 bg-gray-50 dark:bg-gray-800/50"
                                    />
                                    {phoneError && (
                                        <p className="text-red-500 text-[10px] font-bold mt-1 animate-[fadeIn_0.2s_ease-out]">
                                            {phoneError}
                                        </p>
                                    )}
                                </div>

                                {!formData.phoneNumber && (selectedUser.userNameInPlatform) && (
                                    <p className="text-xs text-gray-400 mt-1" dir="ltr">
                                        ID: {selectedUser.userNameInPlatform}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto px-6 pb-6 flex flex-col gap-8 custom-scrollbar">
                            
                            <div className="flex gap-3">
                                <Button variant="solid" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm" icon={renderPlatformIcon(selectedUser.platformName as Platform)}>
                                    ارسال پیام
                                </Button>
                                <Button variant="plain" title="تماس صوتی" className="w-12 h-12 flex-shrink-0 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"><HiOutlinePhone className="text-xl" /></Button>
                                <Button variant="plain" title="ارسال پیامک (SMS)" className="w-12 h-12 flex-shrink-0 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"><HiOutlineDeviceMobile className="text-xl" /></Button>
                            </div>

                            <div className="bg-gray-50/50 dark:bg-gray-800/30 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1"><span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">تاریخ عضویت</span><span className="text-sm font-bold text-gray-800 dark:text-gray-100">{selectedUser.joinDate || 'نامشخص'}</span></div>
                                <div className="flex flex-col gap-1"><span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">تعداد نشست‌ها</span><span className="text-sm font-bold text-gray-800 dark:text-gray-100">{selectedUser.sessionCount || 0} مکالمه</span></div>
                                <div className="flex flex-col gap-1 col-span-2"><span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">آخرین بازدید</span><span className="text-sm font-bold text-gray-800 dark:text-gray-100">{getRelativeTime(selectedUser.lastActivity)}</span></div>
                            </div>

                            {/* بخش برچسب‌ها */}
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-bold text-gray-800 dark:text-gray-100 flex items-center gap-1.5"><HiOutlineTag className="text-lg text-indigo-500" /> دسته‌بندی و تگ‌ها</h4>
                                    <button onClick={() => setIsEditingDrawerTags(!isEditingDrawerTags)} className={`text-xs font-bold px-2 py-1 rounded-md transition-colors ${isEditingDrawerTags ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:bg-gray-100'}`}>
                                        {isEditingDrawerTags ? 'بستن ویرایشگر' : 'ویرایش تگ‌ها'} <HiOutlinePencil className="inline mb-0.5 ml-1"/>
                                    </button>
                                </div>
                                
                                {isEditingDrawerTags ? (
                                    <div className="flex flex-wrap gap-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800 animate-[fadeIn_0.2s_ease-out]">
                                        {/* 🌟 رندر لیست تگ‌ها از روی serverTags */}
                                        {serverTags.map(tagData => {
                                            const isSelected = formData.tags.includes(tagData.id);
                                            return (
                                                <button 
                                                    key={tagData.id} 
                                                    onClick={() => handleToggleTag(tagData.id)} 
                                                    className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all duration-200 ${isSelected ? `${tagData.color} shadow-sm ring-2 ring-indigo-500/20 scale-105` : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                                                >
                                                    {tagData.name}
                                                </button>
                                            )
                                        })}
                                    </div>
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {/* 🌟 پیدا کردن اطلاعات تگ از سرورتگ برای نمایش */}
                                        {formData.tags.map(tagId => {
                                            const tagData = serverTags.find(t => t.id === tagId);
                                            if (!tagData) return null;
                                            return (
                                                <span key={tagId} className={`text-xs font-bold px-3 py-1.5 rounded-lg border ${tagData.color}`}>
                                                    {tagData.name}
                                                </span>
                                            )
                                        })}
                                        {formData.tags.length === 0 && <span className="text-xs text-gray-400">بدون برچسب</span>}  
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col gap-3">
                                <h4 className="text-sm font-bold text-gray-800 dark:text-gray-100 flex items-center gap-1.5"><HiOutlineUser className="text-lg text-indigo-500" /> اطلاعات تکمیلی (CRM)</h4>
                                <Input 
                                    textArea 
                                    rows={3} 
                                    value={formData.notes}
                                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                                    placeholder="یادداشتی درباره این مخاطب بنویسید (با زدن دکمه ذخیره بالا، ثبت می‌شود)..." 
                                    className="bg-gray-50/50 text-sm focus:bg-white" 
                                />
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

export default ContactDrawer;