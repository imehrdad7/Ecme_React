import React, { useRef, useState, useEffect } from 'react';
import Dialog from '@/components/ui/Dialog';
import Button from '@/components/ui/Button';
import Notification from '@/components/ui/Notification';
import toast from '@/components/ui/toast';
import { 
    HiX, HiOutlineUpload, HiOutlineDocumentText, 
    HiOutlineDocumentDownload, HiOutlineSave,
    HiChevronDown, HiCheck, HiMinusCircle
} from 'react-icons/hi';
import { Platform } from '../../types';
import Papa from 'papaparse';

// ==========================================
// ۱. اینترفیس‌ها و هوک‌های کمکی
// ==========================================
export interface EditableContactRow {
    id: string;
    fullName: string;
    phoneNumber: string;
    email: string;
    note: string;
    platformUserName: string;
    platform: Platform; 
    tags: string[];     
    isValid: boolean;
    errors: string[];
    isSelected: boolean;
}
    const showErrorDetails = (errors: string[]) => {
        toast.push(
            <Notification type="danger" title="ایرادات این سطر">
                <ul className="list-disc pr-4 mt-2 text-xs space-y-1 text-gray-700 dark:text-gray-200">
                    {errors.map((err, idx) => (
                        <li key={idx}>{err}</li>
                    ))}
                </ul>
            </Notification>, 
            { placement: 'top-center' }
        );
    };

function useOutsideClick(ref: React.RefObject<HTMLDivElement>, callback: () => void) {
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                callback();
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [ref, callback]);
}

// ==========================================
// ۲. کامپوننت‌های دراپ‌دان سفارشی
// ==========================================
const CustomPlatformSelect = ({ value, onChange, renderIcon }: { value: Platform, onChange: (val: Platform) => void, renderIcon: any }) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    useOutsideClick(ref, () => setIsOpen(false));

    const platforms: Platform[] = ['WhatsApp', 'Telegram', 'Instagram', 'Web'];

    return (
        <div ref={ref} className="relative w-full">
            <div 
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 cursor-pointer hover:border-emerald-400 transition-colors shadow-sm"
            >
                <div className="flex items-center gap-2">
                    <span className="text-gray-500">{renderIcon(value, 'text-sm')}</span>
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-200">{value}</span>
                </div>
                <HiChevronDown className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>
            {isOpen && (
                <div className="absolute top-full left-0 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden py-1">
                    {platforms.map(plat => (
                        <div 
                            key={plat} onClick={() => { onChange(plat); setIsOpen(false); }}
                            className={`flex items-center gap-2 px-3 py-2 text-xs cursor-pointer transition-colors ${value === plat ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 font-bold' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                        >
                            {renderIcon(plat, 'text-sm')}
                            <span>{plat}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const CustomTagSelect = ({ selectedTags, onChange, appTags }: { selectedTags: string[], onChange: (tags: string[]) => void, appTags: Record<string, { color: string; id: string }> }) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    useOutsideClick(ref, () => setIsOpen(false));

    const toggleTag = (tagName: string) => {
        if (selectedTags.includes(tagName)) {
            onChange(selectedTags.filter(t => t !== tagName));
        } else {
            onChange([...selectedTags, tagName]);
        }
    };

    return (
        <div ref={ref} className="relative w-full">
            <div 
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between min-h-[34px] w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 cursor-pointer hover:border-emerald-400 transition-colors shadow-sm"
            >
                <div className="flex flex-wrap gap-1 items-center">
                    {selectedTags.length === 0 ? (
                        <span className="text-[11px] text-gray-400">انتخاب برچسب...</span>
                    ) : (
                        selectedTags.map(tag => (
                            <span key={tag} className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold truncate max-w-[80px] ${appTags[tag]?.color || 'bg-gray-200 text-gray-700'}`}>
                                {tag}
                            </span>
                        ))
                    )}
                </div>
                <HiChevronDown className={`text-gray-400 text-sm flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            {isOpen && (
                <div className="absolute top-full right-0 w-48 mt-1 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden flex flex-col max-h-48">
                    <div className="p-2 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                        <span className="text-[10px] font-bold text-gray-500">لیست برچسب‌های سیستم</span>
                    </div>
                    <div className="overflow-y-auto custom-scrollbar p-1">
                        {Object.keys(appTags).map(tagName => {
                            const isSelected = selectedTags.includes(tagName);
                            return (
                                <div 
                                    key={tagName} onClick={() => toggleTag(tagName)}
                                    className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer group"
                                >
                                    <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${isSelected ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 group-hover:border-emerald-400'}`}>
                                        {isSelected && <HiCheck className="text-xs" />}
                                    </div>
                                    <span className={`text-[11px] font-bold ${appTags[tagName]?.color.split(' ')[1] || 'text-gray-600 dark:text-gray-300'}`}>
                                        {tagName}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

// ==========================================
// ۳. کامپوننت اصلی مودال
// ==========================================
type ImportModalProps = {
    isOpen: boolean;
    onClose: () => void;
    appTags: Record<string, { color: string; id: string }>;
    renderPlatformIcon: (platform: Platform, sizeClass?: string) => React.ReactNode;
    onSubmitFinalData: (data: any[]) => Promise<void>; 
}

const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, appTags, renderPlatformIcon, onSubmitFinalData }) => {
    const [importStep, setImportStep] = useState<1 | 2>(1);
    const [isParsing, setIsParsing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [parsedData, setParsedData] = useState<EditableContactRow[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 🌟 استیت‌های ابزار گروهی (Bulk)
    const [bulkPlatform, setBulkPlatform] = useState<Platform>('WhatsApp');
    const [bulkTags, setBulkTags] = useState<string[]>([]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
            // ریست کردن استیت‌ها هنگام بسته شدن مودال
            setBulkPlatform('WhatsApp');
            setBulkTags([]);
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const handleSelectAll = (select: boolean) => {
        setParsedData(prev => prev.map(row => {
            if (!row.isValid) return row; 
            return { ...row, isSelected: select };
        }));
    };

    // 🌟 توابع اعمال گروهی روی تمام سطرها
    const handleBulkPlatformChange = (plat: Platform) => {
        setBulkPlatform(plat);
        setParsedData(prev => prev.map(row => ({ ...row, platform: plat })));
        toast.push(<Notification type="info" title="به‌روزرسانی گروهی">پلتفرم {plat} برای همه مخاطبین تنظیم شد.</Notification>, { placement: 'top-center' });
    };

    const handleBulkTagChange = (tags: string[]) => {
        setBulkTags(tags);
        setParsedData(prev => prev.map(row => ({ ...row, tags: tags })));
    };

    const downloadSampleCsv = () => {
        const headers = "نام و نام خانوادگی,شماره موبایل,ای دی پلتفرم,ادرس ایمیل,یادداشت\n";
        const sampleData = "مهرداد نصیری,09123456789,mehrdad_ns,mehrdad@example.com,مشتری VIP\nسارا رضایی,,sara_rz,,نیاز به پیگیری";
        const blob = new Blob(["\uFEFF" + headers + sampleData], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.setAttribute("download", "AnyBot_Sample.csv");
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsParsing(true);
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const rows: EditableContactRow[] = [];
                const uniqueTracker = new Set<string>();
                let duplicateCount = 0;

                results.data.forEach((rawRow: any) => {
                    const fullName = rawRow['نام و نام خانوادگی']?.trim() || '';
                    const phoneNumber = rawRow['شماره موبایل']?.trim() || '';
                    const platformUserName = rawRow['ای دی پلتفرم']?.trim() || ''; 
                    const email = rawRow['ادرس ایمیل']?.trim() || '';
                    const note = rawRow['یادداشت']?.trim() || '';

                    const uniqueIdentifier = `${phoneNumber}-${platformUserName}`.toLowerCase();
                    if (uniqueIdentifier !== '-') {
                        if (uniqueTracker.has(uniqueIdentifier)) {
                            duplicateCount++;
                            return; 
                        }
                        uniqueTracker.add(uniqueIdentifier);
                    }

                    const errors: string[] = [];
                    if (!fullName) errors.push('نام کامل الزامی است');
                    if (phoneNumber) {
                        const phoneRegex = /^09\d{9}$/;
                        if (!phoneRegex.test(phoneNumber)) {
                            errors.push('فرمت شماره موبایل اشتباه است (باید ۱۱ رقم و با 09 شروع شود)');
                        }
                    } else if (!platformUserName) {
                        errors.push('شماره موبایل یا آیدی پلتفرم الزامی است');
                    }
                    const isValid = errors.length === 0;
                    
                    rows.push({
                        id: (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') 
                            ? crypto.randomUUID() : `id-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                        fullName, phoneNumber, platformUserName, email, note,
                        platform: bulkPlatform, // استفاده از پلتفرم گروهی انتخابی در لحظه پارس
                        tags: [...bulkTags],                         
                        isValid, errors, isSelected: isValid
                    });
                });
                
                if (duplicateCount > 0) {
                    toast.push(<Notification type="info" title="حذف تکراری‌ها">{duplicateCount} رکورد تکراری در فایل شما پیدا و حذف شد.</Notification>, { placement: 'top-center' });
                }

                if (rows.length > 2000) {
                    toast.push(<Notification type="warning" title="محدودیت حجم">حداکثر ۲۰۰۰ مخاطب مجاز است.</Notification>, { placement: 'top-center' });
                } else if (rows.length > 0) {
                    setParsedData(rows);
                    setImportStep(2); 
                } else {
                    toast.push(<Notification type="danger" title="خطا">فایل تهی است.</Notification>, { placement: 'top-center' });
                }

                setIsParsing(false);
                if (fileInputRef.current) fileInputRef.current.value = '';
            },
            error: () => {
                toast.push(<Notification type="danger" title="خطا">مشکل در خواندن فایل.</Notification>, { placement: 'top-center' });
                setIsParsing(false);
            }
        });
    };

    const handleRowChange = (id: string, field: keyof EditableContactRow, value: any) => {
        setParsedData(prev => prev.map(row => {
            if (row.id !== id) return row;
            const updatedRow = { ...row, [field]: value };
            
            if (field !== 'isSelected') {
                const errors = [];
                if (!updatedRow.fullName) errors.push('نام الزامی است');
                if (!updatedRow.phoneNumber && !updatedRow.platformUserName) errors.push('شماره موبایل یا آیدی الزامی است');
                
                updatedRow.errors = errors;
                updatedRow.isValid = errors.length === 0;
                if (updatedRow.phoneNumber) {
                    const phoneRegex = /^09\d{9}$/;
                    if (!phoneRegex.test(updatedRow.phoneNumber)) {
                        errors.push('شماره نامعتبر (۱۱ رقم با 09)');
                    }
                } else if (!updatedRow.platformUserName) {
                    errors.push('شماره موبایل یا آیدی الزامی است');
                }
            }
            return updatedRow;
        }));
    };

    const handleSubmitImport = async () => {
        const validContacts = parsedData.filter(r => r.isValid && r.isSelected);
        if (validContacts.length === 0) {
            return toast.push(<Notification type="warning" title="هشدار">هیچ ردیف سالمی انتخاب نشده است.</Notification>, { placement: 'top-center' });
        }

        setIsSubmitting(true);
        try {

            const platformEnumMap: Record<string, number> = {
                'Unknown': 0,
                'WhatsApp': 1,
                'Telegram': 2,
                'Instagram': 3,
                'Web': 4,
                'Rubika': 5,
                'Bale': 6
            };

            const finalPayload = validContacts.map(r => ({
                FullName: r.fullName, PhoneNumber: r.phoneNumber, PlatformUserName: r.platformUserName,
                Email: r.email, Note: r.note, Platform: platformEnumMap[r.platform] ?? 0, TagIds: r.tags.map(tagName => appTags[tagName]?.id).filter(Boolean)        
            }));

            await onSubmitFinalData(finalPayload);
            setParsedData([]); setImportStep(1); onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const allValidSelected = parsedData.length > 0 && parsedData.filter(r => r.isValid).every(r => r.isSelected);

    return (
        <Dialog 
            isOpen={isOpen} onClose={onClose} closable={false} width={1200} 
            contentClassName="p-0 border-0 bg-white dark:bg-gray-900 shadow-2xl rounded-3xl overflow-hidden flex flex-col h-[90vh]"
        >
            {/* Header */}
            <div className="flex-shrink-0 relative bg-emerald-50 dark:bg-emerald-900/20 border-b border-emerald-100 dark:border-emerald-800/30 p-5 flex items-center gap-4">
                <button onClick={onClose} disabled={isParsing || isSubmitting} className="absolute top-5 left-5 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                    <HiX className="text-xl" />
                </button>
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-800/50 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <HiOutlineUpload className="text-2xl" />
                </div>
                <div>
                    <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100">ایمپورت هوشمند مخاطبین</h4>
                    <p className="text-xs text-gray-500 mt-1">
                        {importStep === 1 ? 'فایل اکسل مخاطبین خود را بارگذاری کنید.' : 'تعیین پلتفرم، برچسب و ویرایش اطلاعات به ازای هر سطر'}
                    </p>
                </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-hidden bg-gray-50/50 dark:bg-gray-900">
                {importStep === 1 ? (
                    <div className="p-6 h-full flex flex-col gap-6 animate-[fadeIn_0.3s_ease-out] overflow-y-auto">
                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 flex items-center justify-between shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl flex items-center justify-center shadow-inner text-emerald-500">
                                    <HiOutlineDocumentText className="text-xl" />
                                </div>
                                <div>
                                    <span className="block text-sm font-bold text-gray-800 dark:text-gray-200">فایل نمونه استاندارد</span>
                                    <span className="text-xs text-gray-500">برای مشاهده ساختار ستون‌ها دانلود کنید.</span>
                                </div>
                            </div>
                            <Button size="sm" onClick={downloadSampleCsv} variant="default" icon={<HiOutlineDocumentDownload />} className="font-bold text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:bg-gray-800 dark:text-emerald-400">
                                دانلود فایل
                            </Button>
                        </div>

                        <div className="relative border-2 border-dashed border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800/50 rounded-3xl p-10 flex flex-col items-center justify-center text-center transition-all hover:border-emerald-500 hover:shadow-lg group cursor-pointer flex-1 min-h-[300px]">
                            <input 
                                type="file" accept=".csv" onChange={handleFileUpload} disabled={isParsing} ref={fileInputRef}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" 
                            />
                            {isParsing ? (
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-500 rounded-full animate-spin"></div>
                                    <span className="text-sm font-bold text-gray-600 dark:text-gray-300">در حال پردازش فایل...</span>
                                </div>
                            ) : (
                                <>
                                    <div className="w-16 h-16 bg-gray-50 dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-700 rounded-full flex items-center justify-center mb-4 text-gray-400 group-hover:text-emerald-500 group-hover:scale-110 transition-all">
                                        <HiOutlineUpload className="text-3xl" />
                                    </div>
                                    <h5 className="font-bold text-gray-800 dark:text-gray-100 text-base">فایل CSV خود را اینجا رها کنید</h5>
                                </>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col animate-[fadeIn_0.3s_ease-out]">
                        
                        {/* 🌟 تولبار مدیریت گروهی و ابزارها (Toolbar) */}
                        <div className="px-5 py-3 flex-shrink-0 flex justify-between items-center bg-gray-100/50 dark:bg-gray-800/40 border-b border-gray-200 dark:border-gray-800 z-20">
                            
                            {/* اکشن‌های تیک زدن */}
                            <div className="flex items-center gap-2">
                                <Button 
                                    size="sm" variant="solid" color="emerald-600" icon={<HiCheck />} 
                                    onClick={() => handleSelectAll(true)} className="text-xs font-bold rounded-lg shadow-sm"
                                >
                                    انتخاب همه مجازها
                                </Button>
                                <Button 
                                    size="sm" variant="default" icon={<HiMinusCircle />} 
                                    onClick={() => handleSelectAll(false)} className="text-xs font-bold rounded-lg"
                                >
                                    لغو انتخاب
                                </Button>
                            </div>

                            {/* تنظیمات گروهی (Bulk Setters) */}
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 w-48">
                                    <span className="text-xs font-bold text-gray-600 dark:text-gray-400 whitespace-nowrap">پلتفرم همه:</span>
                                    <CustomPlatformSelect 
                                        value={bulkPlatform} 
                                        onChange={handleBulkPlatformChange} 
                                        renderIcon={renderPlatformIcon} 
                                    />
                                </div>
                                <div className="flex items-center gap-2 w-64 border-r border-gray-200 dark:border-gray-700 pr-4">
                                    <span className="text-xs font-bold text-gray-600 dark:text-gray-400 whitespace-nowrap">برچسب همه:</span>
                                    <CustomTagSelect 
                                        selectedTags={bulkTags} 
                                        onChange={handleBulkTagChange} 
                                        appTags={appTags} 
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar px-5 pb-5 pt-3">
                            <div className="border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm bg-white dark:bg-gray-900 min-w-[1000px]">
                                <table className="w-full text-sm text-right border-collapse">
                                    <thead className="text-[11px] text-gray-700 bg-gray-50/80 dark:bg-gray-800/80 dark:text-gray-400 sticky top-0 shadow-sm z-10 backdrop-blur-sm">
                                        <tr>
                                            <th className="px-3 py-3 w-10 text-center border-b border-gray-200 dark:border-gray-700">
                                                <input 
                                                    type="checkbox" checked={allValidSelected}
                                                    onChange={(e) => handleSelectAll(e.target.checked)}
                                                    className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                                    title="انتخاب/لغو انتخاب تمام ردیف‌های سالم"
                                                />
                                            </th>
                                            <th className="px-3 py-3 w-14 text-center border-b border-gray-200 dark:border-gray-700">وضعیت</th>
                                            <th className="px-3 py-3 border-b border-gray-200 dark:border-gray-700">نام و نام خانوادگی</th>
                                            <th className="px-3 py-3 w-32 border-b border-gray-200 dark:border-gray-700">شماره موبایل</th>
                                            <th className="px-3 py-3 w-32 border-b border-gray-200 dark:border-gray-700">آیدی پلتفرم</th>
                                            <th className="px-3 py-3 w-40 border-b border-gray-200 dark:border-gray-700">پلتفرم اختصاصی</th>
                                            <th className="px-3 py-3 w-56 border-b border-gray-200 dark:border-gray-700">برچسب‌ها (تگ)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="pb-32 block table-row-group">
                                        {parsedData.map((row) => (
                                            <tr key={row.id} className={`border-b dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors ${!row.isValid ? 'bg-red-50/50 dark:bg-red-900/10' : ''}`}>
                                                <td className="px-3 py-2 text-center align-middle">
                                                    <input 
                                                        type="checkbox" checked={row.isSelected} disabled={!row.isValid}
                                                        onChange={(e) => handleRowChange(row.id, 'isSelected', e.target.checked)} 
                                                        className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer disabled:cursor-not-allowed"
                                                    />
                                                </td>
                                                <td className="px-3 py-2 text-center align-middle">
                                                    {row.isValid ? (
                                                        <span className="px-2 py-1 text-[9px] font-bold bg-green-100 text-green-700 rounded-full">سالم</span>
                                                    ) : (
                                                            <button 
                                                                onClick={() => showErrorDetails(row.errors)}
                                                                className="px-2 py-1 text-[10px] font-bold bg-red-100 text-red-700 rounded-full cursor-pointer hover:bg-red-200 hover:scale-105 transition-all shadow-sm border border-red-200 focus:outline-none"
                                                            >
                                                                مشاهده خطا
                                                            </button>
                                                        )}
                                                </td>
                                                <td className="px-3 py-2 align-middle">
                                                    <input 
                                                        type="text" value={row.fullName}
                                                        onChange={(e) => handleRowChange(row.id, 'fullName', e.target.value)}
                                                        className="w-full bg-transparent border-b border-transparent hover:border-gray-300 focus:border-emerald-500 focus:ring-0 px-1 py-1 text-xs transition-colors"
                                                    />
                                                </td>
                                                <td className="px-3 py-2 align-middle">
                                                    <input 
                                                        type="text" value={row.phoneNumber} placeholder="0912..."
                                                        onChange={(e) => handleRowChange(row.id, 'phoneNumber', e.target.value)}
                                                        className="w-full bg-transparent border-b border-transparent hover:border-gray-300 focus:border-emerald-500 focus:ring-0 px-1 py-1 text-xs text-left transition-colors" dir="ltr"
                                                    />
                                                </td>
                                                <td className="px-3 py-2 align-middle">
                                                    <input 
                                                        type="text" value={row.platformUserName} placeholder="@id"
                                                        onChange={(e) => handleRowChange(row.id, 'platformUserName', e.target.value)}
                                                        className="w-full bg-transparent border-b border-transparent hover:border-gray-300 focus:border-emerald-500 focus:ring-0 px-1 py-1 text-xs text-left transition-colors" dir="ltr"
                                                    />
                                                </td>
                                                <td className="px-3 py-2 align-middle border-r border-gray-100 dark:border-gray-800">
                                                    <CustomPlatformSelect 
                                                        value={row.platform} 
                                                        onChange={(val) => handleRowChange(row.id, 'platform', val)} 
                                                        renderIcon={renderPlatformIcon} 
                                                    />
                                                </td>
                                                <td className="px-3 py-2 align-middle border-r border-gray-100 dark:border-gray-800">
                                                    <CustomTagSelect 
                                                        selectedTags={row.tags} 
                                                        onChange={(tags) => handleRowChange(row.id, 'tags', tags)} 
                                                        appTags={appTags} 
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-900 p-2 text-xs font-bold text-gray-500 border-t border-gray-200 dark:border-gray-700 text-center flex-shrink-0">
                            تعداد ردیف‌های آماده ثبت: {parsedData.filter(r => r.isValid && r.isSelected).length} از {parsedData.length}
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            {importStep === 2 && (
                <div className="flex-shrink-0 p-5 border-t border-gray-100 dark:border-gray-800 flex gap-3 bg-gray-50/50 dark:bg-gray-800/20 z-20">
                    <Button className="flex-1 font-bold" onClick={() => setImportStep(1)} disabled={isSubmitting}>بازگشت</Button>
                    <Button className="flex-[3] bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md" loading={isSubmitting} onClick={handleSubmitImport} icon={<HiOutlineSave />}>
                        تایید نهایی و ذخیره در دیتابیس AnyBot
                    </Button>
                </div>
            )}
        </Dialog>
    );
};

export default ImportModal;