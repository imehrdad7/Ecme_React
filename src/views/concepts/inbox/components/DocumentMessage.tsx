import React from 'react';
import { HiOutlineDocumentText, HiDownload } from 'react-icons/hi';

interface DocumentMessageProps {
    src: string;
    fileName?: string;
    isOutgoing?: boolean;
}

export const DocumentMessage = ({ src, fileName, isOutgoing = false }: DocumentMessageProps) => {
    
    // استخراج هوشمندانه نام فایل از لینک (در صورتی که نام فایل پاس داده نشده باشد)
    const getFileName = () => {
        if (fileName) return fileName;
        if (!src || src.startsWith('blob:')) return 'فایل ضمیمه';
        try {
            // استخراج نام فایل از انتهای URL
            const urlName = src.split('/').pop()?.split('?')[0];
            return urlName ? decodeURIComponent(urlName) : 'فایل ضمیمه';
        } catch {
            return 'فایل ضمیمه';
        }
    };

    // استخراج فرمت فایل برای نمایش روی آیکون (اختیاری و برای زیبایی بیشتر)
    const getFileExtension = (name: string) => {
        const parts = name.split('.');
        if (parts.length > 1) {
            return parts.pop()?.toUpperCase().substring(0, 4); // نهایتاً 4 حرف مثل DOCX
        }
        return 'FILE';
    };

    const finalName = getFileName();
    const extension = getFileExtension(finalName);

    return (
        <a 
            href={src} 
            download
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-3 p-3 w-full max-w-sm rounded-2xl border transition-all duration-200 group shadow-sm hover:shadow-md ${
                isOutgoing 
                ? 'bg-indigo-50/80 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-800/30 hover:bg-indigo-100/50 dark:hover:bg-indigo-900/40' 
                : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750'
            }`}
        >
            {/* آیکون فایل با رنگ‌بندی داینامیک */}
            <div className={`relative flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl ${
                isOutgoing 
                ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' 
                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
            }`}>
                <HiOutlineDocumentText size={26} />
                {/* یک لیبل کوچک روی آیکون که فرمت فایل را نشان می‌دهد */}
                <div className={`absolute -bottom-1 -right-1 text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                    isOutgoing ? 'bg-indigo-600 text-white' : 'bg-emerald-600 text-white'
                }`}>
                    {extension}
                </div>
            </div>

            {/* نام فایل و زیرنویس */}
            <div className="flex-1 flex flex-col min-w-0">
                <span className={`text-sm font-semibold truncate dir-ltr text-left ${
                    isOutgoing ? 'text-indigo-900 dark:text-indigo-100' : 'text-gray-800 dark:text-gray-100'
                }`}>
                    {finalName}
                </span>
                <span className={`text-[11px] font-medium mt-0.5 ${
                    isOutgoing ? 'text-indigo-600/70 dark:text-indigo-300/70' : 'text-gray-500 dark:text-gray-400'
                }`}>
                    برای دانلود کلیک کنید
                </span>
            </div>

            {/* آیکون دانلود */}
            <div className={`flex-shrink-0 p-2 rounded-full transition-colors opacity-70 group-hover:opacity-100 ${
                isOutgoing 
                ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-500 group-hover:bg-emerald-500 group-hover:text-white'
            }`}>
                <HiDownload size={18} />
            </div>
        </a>
    );
};