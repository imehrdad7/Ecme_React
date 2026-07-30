import React from 'react';
import { HiX } from 'react-icons/hi';
import { FaTelegramPlane } from 'react-icons/fa';
import { VideoPlayer } from './VideoPlayer';
import { DocumentMessage } from './DocumentMessage';

export interface PreviewFileObject {
    file: File | null;
    type: "file" | "image" | "video" | "document" | "voice";
    previewUrl: string;
    isViewMode?: boolean;
    fileName?: string;
    fileSize?: number;
    replyId?: string;
}

interface UploadPreviewModalProps {
    previewFile: PreviewFileObject;
    isUploading: boolean;
    onCancel: () => void;
    onConfirm: () => void;
}

export const UploadPreviewModal = ({ 
    previewFile, 
    isUploading, 
    onCancel, 
    onConfirm 
}: UploadPreviewModalProps) => {
    
    if (!previewFile || !previewFile.previewUrl) return null;

    // استخراج سایز فایل
    const sizeInBytes = previewFile.fileSize || previewFile.file?.size || 0;
    const sizeInMB = (sizeInBytes / (1024 * 1024)).toFixed(2);
    
    // استخراج نام فایل
    const fileName = previewFile.fileName || previewFile.file?.name || 'فایل ضمیمه';

    // 🌟 تابع جدید: استخراج نوع/پسوند فایل
    const getFileExtension = () => {
        // اول سعی می‌کنیم از روی نام فایل پسوند را پیدا کنیم (مثل .pdf)
        if (fileName && fileName.includes('.')) {
            return fileName.split('.').pop()?.toUpperCase();
        }
        // اگر نام فایل پسوند نداشت، از روی نوع (MIME Type) خود فایل می‌خوانیم
        if (previewFile.file?.type) {
            const mime = previewFile.file.type.split('/');
            return mime[mime.length - 1].toUpperCase();
        }
        return 'ناشناخته';
    };

    const fileExtension = getFileExtension();

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all duration-300 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                
                {/* هدر مودال */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                        پیش‌نمایش ارسال
                    </h3>
                    <button 
                        onClick={onCancel} 
                        disabled={isUploading}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50"
                    >
                        <HiX size={22} />
                    </button>
                </div>

                {/* بدنه مودال */}
                <div className="p-6 bg-gray-50/50 dark:bg-gray-900/50 flex flex-col items-center justify-center min-h-[220px]">
                    
                    {/* پیش‌نمایش مدیا */}
                    {previewFile.type === 'image' ? (
                        <div className="relative w-full rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700">
                            <img 
                                src={previewFile.previewUrl} 
                                alt="preview" 
                                className="w-full max-h-[300px] object-contain bg-black/5" 
                            />
                        </div>
                    ) : previewFile.type === 'video' ? (
                        <div className="w-full shadow-md rounded-2xl">
                            <VideoPlayer 
                                src={previewFile.previewUrl} 
                                isOutgoing={true} 
                            />
                        </div>
                    ) : (
                        <div className="w-full">
                            <DocumentMessage 
                                src={previewFile.previewUrl} 
                                fileName={fileName} 
                                isOutgoing={true} 
                            />
                        </div>
                    )}

                    {/* 🌟 بخش جدید نمایش اطلاعات فایل (حجم و پسوند) */}
                    <div className="mt-5 flex items-center justify-center gap-4 text-xs font-medium text-gray-500 dark:text-gray-400 font-mono bg-white dark:bg-gray-800 px-4 py-2 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm w-full">
                        <div className="flex items-center gap-1.5">
                            <span className="text-gray-400">حجم:</span>
                            <span className="text-gray-700 dark:text-gray-200">{sizeInBytes > 0 ? `${sizeInMB} MB` : 'نامشخص'}</span>
                        </div>
                        
                        <div className="w-[1px] h-4 bg-gray-300 dark:bg-gray-600"></div> {/* خط جداکننده */}
                        
                        <div className="flex items-center gap-1.5">
                            <span className="text-gray-400">نوع:</span>
                            <span className="text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-900/30 px-1.5 py-0.5 rounded">
                                {fileExtension}
                            </span>
                        </div>
                    </div>

                </div>

                {/* فوتر مودال */}
                <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-700 flex items-center gap-3 bg-white dark:bg-gray-800">
                    <button 
                        onClick={onCancel}
                        disabled={isUploading}
                        className="flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                    >
                        انصراف
                    </button>
                    
                    <button 
                        onClick={onConfirm}
                        disabled={isUploading}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 dark:shadow-none transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isUploading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                در حال آپلود...
                            </>
                        ) : (
                            <>
                                <FaTelegramPlane className="rtl:-scale-x-100 text-lg" />
                                ارسال فایل
                            </>
                        )}
                    </button>
                </div>
                
            </div>
        </div>
    );
};