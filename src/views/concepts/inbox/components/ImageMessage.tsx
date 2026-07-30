import React, { useState } from 'react';
import { HiDownload, HiOutlinePhotograph, HiOutlineExclamationCircle } from 'react-icons/hi';

interface ImageMessageProps {
    src: string;
    alt?: string;
    onClick?: () => void;
}

export const ImageMessage = ({ src, alt = "فایل تصویری", onClick }: ImageMessageProps) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);

    return (
        <div className="relative group/image w-full max-w-sm rounded-xl overflow-hidden border border-black/5 dark:border-white/5 bg-gray-100 dark:bg-gray-800 min-h-[150px] flex items-center justify-center">
            
            {/* حالت خطا (لود نشدن عکس) */}
            {hasError && (
                <div className="flex flex-col items-center justify-center text-gray-400 p-8">
                    <HiOutlineExclamationCircle className="text-4xl mb-2 opacity-50" />
                    <span className="text-xs font-medium">خطا در بارگذاری تصویر</span>
                </div>
            )}

            {/* حالت بارگذاری (اسکلتون انیمیشنی) */}
            {!isLoaded && !hasError && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 animate-pulse">
                    <HiOutlinePhotograph className="text-4xl text-gray-300 dark:text-gray-600" />
                </div>
            )}

            {/* عکس اصلی */}
            {!hasError && (
                <img 
                    src={src} 
                    alt={alt}
                    loading="lazy" // فقط وقتی در صفحه دیده شد لود می‌شود
                    onLoad={() => setIsLoaded(true)}
                    onError={() => setHasError(true)}
                    onClick={onClick}
                    className={`w-full max-h-[300px] object-cover cursor-pointer transition-opacity duration-500 ${
                        isLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                />
            )}

            {/* دکمه دانلود (فقط وقتی عکس لود شده باشد و ماوس روی آن برود) */}
            {isLoaded && !hasError && (
                <a 
                    href={src}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()} // جلوگیری از باز شدن مودال هنگام کلیک روی دانلود
                    className="absolute bottom-2 right-2 bg-black/50 hover:bg-black/70 backdrop-blur-md text-white p-2 rounded-full opacity-0 group-hover/image:opacity-100 transition-all duration-200 shadow-lg transform translate-y-2 group-hover/image:translate-y-0"
                >
                    <HiDownload size={18} />
                </a>
            )}
        </div>
    );
};