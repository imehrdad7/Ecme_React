import React, { useState } from 'react';
import { 
    HiOutlineCamera, 
    HiOutlinePhotograph, 
    HiOutlineDocumentText,
    HiOutlineVideoCamera,
    HiOutlineFolderOpen,
    HiOutlineArchive,
    HiOutlineMusicNote,
    HiArrowRight
} from 'react-icons/hi';

interface AttachMenuProps {
    onCameraImageClick: () => void;
    onGalleryImageClick: () => void;
    onCameraVideoClick: () => void;
    onGalleryVideoClick: () => void;
    onPdfClick: () => void;
    onWordClick: () => void;
    onExcelClick: () => void;
    onZipClick: () => void;
    onAllFilesClick: () => void;
    onAudioClick: () => void;
}

type MenuState = 'main' | 'image' | 'video' | 'document';

export const AttachMenu = ({ 
    onCameraImageClick, 
    onGalleryImageClick, 
    onCameraVideoClick,
    onGalleryVideoClick,
    onPdfClick,
    onWordClick,
    onExcelClick,
    onZipClick,
    onAllFilesClick,
    onAudioClick // 🌟 دریافت تابع موزیک
}: AttachMenuProps) => {
    const [currentView, setCurrentView] = useState<MenuState>('main');

    return (
        <div className="absolute bottom-full mb-3 rtl:right-0 ltr:left-0 w-64 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)] border border-gray-100 dark:border-gray-700/50 p-2 z-50 overflow-hidden transition-all duration-300">
            
            {/* ======================= */}
            {/* ۱. منوی اصلی */}
            {/* ======================= */}
            {currentView === 'main' && (
                <div className="flex flex-col gap-1 animate-in slide-in-from-left-4 fade-in duration-300">
                    <div className="px-3 py-2 text-xs font-bold text-gray-400 dark:text-gray-500 mb-1">ارسال فایل</div>
                    
                    <button onClick={() => setCurrentView('image')} className="flex items-center justify-between w-full p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors group">
                        <div className="flex items-center gap-3">
                            <div className="bg-sky-50 dark:bg-sky-900/30 text-sky-500 p-2 rounded-lg"><HiOutlinePhotograph size={20} /></div>
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">عکس</span>
                        </div>
                        <HiArrowRight className="text-gray-300 rtl:-scale-x-100 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>

                    <button onClick={() => setCurrentView('video')} className="flex items-center justify-between w-full p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors group">
                        <div className="flex items-center gap-3">
                            <div className="bg-rose-50 dark:bg-rose-900/30 text-rose-500 p-2 rounded-lg"><HiOutlineVideoCamera size={20} /></div>
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">ویدیو</span>
                        </div>
                        <HiArrowRight className="text-gray-300 rtl:-scale-x-100 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>

                    {/* 🌟 دکمه جدید موزیک و فایل صوتی (زیر عکس و ویدیو) */}
                    <button onClick={onAudioClick} className="flex items-center justify-between w-full p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors group">
                        <div className="flex items-center gap-3">
                            <div className="bg-purple-50 dark:bg-purple-900/30 text-purple-500 p-2 rounded-lg"><HiOutlineMusicNote size={20} /></div>
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">موزیک و صدا</span>
                        </div>
                    </button>

                    <div className="h-[1px] w-full bg-gray-100 dark:bg-gray-700/50 my-1"></div>

                    <button onClick={() => setCurrentView('document')} className="flex items-center justify-between w-full p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors group">
                        <div className="flex items-center gap-3">
                            <div className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500 p-2 rounded-lg"><HiOutlineDocumentText size={20} /></div>
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">فایل و سند</span>
                        </div>
                        <HiArrowRight className="text-gray-300 rtl:-scale-x-100 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                </div>
            )}

            {/* بقیه زیرمنوها دقیقاً مثل قبل باقی می‌مانند... */}
            
            {/* زیرمنوی عکس */}
            {currentView === 'image' && (
                <div className="flex flex-col gap-1 animate-in slide-in-from-right-4 fade-in duration-300">
                    <button onClick={() => setCurrentView('main')} className="flex items-center gap-2 px-2 py-2 mb-1 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
                        <HiArrowRight className="rtl:rotate-180" />
                        <span className="text-xs font-bold">بازگشت</span>
                    </button>
                    <button onClick={onCameraImageClick} className="flex items-center gap-3 w-full p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors">
                        <div className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 p-2 rounded-lg"><HiOutlineCamera size={20} /></div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">دوربین (گرفتن عکس)</span>
                    </button>
                    <button onClick={onGalleryImageClick} className="flex items-center gap-3 w-full p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors">
                        <div className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 p-2 rounded-lg"><HiOutlinePhotograph size={20} /></div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">گالری تصاویر</span>
                    </button>
                </div>
            )}

            {/* زیرمنوی ویدیو */}
            {currentView === 'video' && (
                <div className="flex flex-col gap-1 animate-in slide-in-from-right-4 fade-in duration-300">
                    <button onClick={() => setCurrentView('main')} className="flex items-center gap-2 px-2 py-2 mb-1 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
                        <HiArrowRight className="rtl:rotate-180" />
                        <span className="text-xs font-bold">بازگشت</span>
                    </button>
                    <button onClick={onCameraVideoClick} className="flex items-center gap-3 w-full p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors">
                        <div className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 p-2 rounded-lg"><HiOutlineCamera size={20} /></div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">دوربین (ضبط ویدیو)</span>
                    </button>
                    <button onClick={onGalleryVideoClick} className="flex items-center gap-3 w-full p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors">
                        <div className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 p-2 rounded-lg"><HiOutlineVideoCamera size={20} /></div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">گالری ویدیوها</span>
                    </button>
                </div>
            )}

            {/* زیرمنوی فایل و سند */}
            {currentView === 'document' && (
                <div className="flex flex-col gap-1 animate-in slide-in-from-right-4 fade-in duration-300">
                    <button onClick={() => setCurrentView('main')} className="flex items-center gap-2 px-2 py-2 mb-1 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
                        <HiArrowRight className="rtl:rotate-180" />
                        <span className="text-xs font-bold">بازگشت</span>
                    </button>
                    <button onClick={onPdfClick} className="flex items-center gap-3 w-full p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors">
                        <div className="bg-red-50 dark:bg-red-900/20 text-red-500 p-2 rounded-lg"><HiOutlineDocumentText size={20} /></div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">فایل PDF</span>
                    </button>
                    <button onClick={onWordClick} className="flex items-center gap-3 w-full p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors">
                        <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-500 p-2 rounded-lg"><HiOutlineDocumentText size={20} /></div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">فایل Word</span>
                    </button>
                    <button onClick={onExcelClick} className="flex items-center gap-3 w-full p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors">
                        <div className="bg-green-50 dark:bg-green-900/20 text-green-600 p-2 rounded-lg"><HiOutlineDocumentText size={20} /></div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">فایل Excel</span>
                    </button>
                    <button onClick={onZipClick} className="flex items-center gap-3 w-full p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors">
                        <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-500 p-2 rounded-lg"><HiOutlineArchive size={20} /></div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">فایل فشرده (ZIP/RAR)</span>
                    </button>
                    <div className="h-[1px] w-full bg-gray-100 dark:bg-gray-700/50 my-1"></div>
                    <button onClick={onAllFilesClick} className="flex items-center gap-3 w-full p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors">
                        <div className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 p-2 rounded-lg"><HiOutlineFolderOpen size={20} /></div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">همه فایل‌ها</span>
                    </button>
                </div>
            )}
        </div>
    );
};