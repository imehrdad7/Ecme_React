import { useState, useRef } from 'react'
import { 
    HiOutlineCloudUpload, HiOutlinePhotograph, HiOutlineVideoCamera, 
    HiOutlineMicrophone, HiOutlineDocument, HiOutlineLocationMarker, 
    HiX, HiOutlineTrash ,HiOutlineRefresh
} from 'react-icons/hi'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { apiUploadMedia, apiDeleteMedia } from '@/services/MediaService'
import appConfig from '@/configs/app.config'
import { MessageType } from '../types'
import { useSessionUser } from '@/store/authStore' 

type Props = {
    companyId: string;
    messageType: MessageType;
    mediaUrl: string;
    setMediaUrl: (url: string) => void;
}

const backendBaseUrl = appConfig.apiPrefix; 

const getFullMediaUrl = (url: string | File) => {
    if (!url || typeof url !== 'string') return '';
    if (url.startsWith('http') || url.startsWith('blob:')) return url;
    return `${backendBaseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
};

const MediaUploader = ({ messageType, mediaUrl, setMediaUrl }: Props) => {
    const { user } = useSessionUser() 
    const fileInputRef = useRef<HTMLInputElement>(null)
    
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [previewLocalUrl, setPreviewLocalUrl] = useState<string | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    if (messageType === MessageType.Text) return null;

    const getConfig = () => {
        switch (messageType) {
            case MessageType.Image: return { placeholder: "لینک تصویر...", icon: HiOutlinePhotograph, accept: "image/*", title: "پیش‌نمایش تصویر" };
            case MessageType.Video: return { placeholder: "لینک ویدیو...", icon: HiOutlineVideoCamera, accept: "video/*", title: "پیش‌نمایش ویدیو" };
            case MessageType.Audio: return { placeholder: "لینک صوت...", icon: HiOutlineMicrophone, accept: "audio/*", title: "پیش‌نمایش صوت" };
            case MessageType.Location: return { placeholder: "مختصات (مثال: 35.68, 51.38)", icon: HiOutlineLocationMarker, accept: "", title: "" };
            default: return { placeholder: "لینک فایل...", icon: HiOutlineDocument, accept: "*/*", title: "تایید فایل" };
        }
    }
    
    const config = getConfig();
    const Icon = config.icon;

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const MAX_FILE_SIZE_MB = 20;
        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
            toast.push(<Notification type="danger" title="خطای حجم فایل">حجم فایل انتخابی نباید بیشتر از ۲۰ مگابایت باشد.</Notification>, { placement: 'top-center' });
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        const localUrl = URL.createObjectURL(file);
        setSelectedFile(file);
        setPreviewLocalUrl(localUrl);
        setIsModalOpen(true);
        
        if (fileInputRef.current) fileInputRef.current.value = '';
    }

    const closeModal = () => {
        setIsModalOpen(false)
        setSelectedFile(null)
        if (previewLocalUrl) URL.revokeObjectURL(previewLocalUrl)
        setPreviewLocalUrl(null)
    }

    const handleConfirmUpload = async () => {
        if (!selectedFile) return;
        setIsUploading(true);

        try {
            const formData = new FormData();
            formData.append('file', selectedFile); 
            
            const response: any = await apiUploadMedia(formData);
            const uploadedUrl: string = response.url || response.data?.url || '';

            if (!uploadedUrl) throw new Error("آدرسی از سمت سرور دریافت نشد");

            setMediaUrl(uploadedUrl); 
            toast.push(<Notification title="آپلود موفق" type="success">فایل با موفقیت آپلود شد.</Notification>, { placement: 'top-center' });
            closeModal();
            
        } catch (error) {
            console.error("Upload Error:", error);
            toast.push(<Notification title="خطا در آپلود" type="danger">مشکلی در آپلود فایل پیش آمد.</Notification>, { placement: 'top-center' });
        } finally {
            setIsUploading(false);
        }
    }

    const handleRemoveSavedFile = async () => {
        if (!mediaUrl) return;
        
        if (typeof mediaUrl === 'string' && !mediaUrl.startsWith('blob:') && !mediaUrl.startsWith('http')) {
            setIsDeleting(true);
            try {
                if (user?.companyId) {
                    await apiDeleteMedia(user.companyId, mediaUrl);
                }   
            } catch (error) {
                console.error("خطا در حذف فایل:", error);
            } finally {
                setIsDeleting(false);
            }
        }
        setMediaUrl('');
    }

    const getFileExtension = (filename: string) => {
        return filename.split('.').pop()?.toUpperCase() || 'FILE';
    }

    return (
        <div className="animate-[fadeIn_0.2s_ease-out] mb-4">
            {mediaUrl ? (
                // حالت ضمیمه شده: نمایش کارت تامنیل
                <div className="flex items-center gap-4 p-3 border border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/50 dark:bg-emerald-900/20 rounded-2xl shadow-sm transition-all animate-[fadeIn_0.3s_ease-out]">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-white dark:bg-gray-800 flex items-center justify-center flex-shrink-0 shadow-sm border border-emerald-100 dark:border-emerald-800/50 p-1">
                        {messageType === MessageType.Image ? (
                            <img src={getFullMediaUrl(mediaUrl)} alt="Thumbnail" className="w-full h-full object-cover rounded-lg" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        ) : messageType === MessageType.Video ? (
                            <HiOutlineVideoCamera className="text-3xl text-emerald-500" />
                        ) : messageType === MessageType.Audio ? (
                            <HiOutlineMicrophone className="text-3xl text-emerald-500" />
                        ) : (
                            <HiOutlineDocument className="text-3xl text-emerald-500" />
                        )}
                    </div>

                    <div className="flex flex-col flex-1 overflow-hidden">
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1">فایل با موفقیت ضمیمه شد</span>
                    </div>

                    <button 
                        onClick={handleRemoveSavedFile}
                        disabled={isDeleting}
                        className="p-2.5 flex items-center justify-center text-red-500 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/40 rounded-xl transition-colors shadow-sm border border-red-100 dark:border-red-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="حذف فایل"
                    >
                        {isDeleting ? <HiOutlineRefresh className="animate-spin text-lg text-red-400" /> : <HiOutlineTrash className="text-lg" />}
                    </button>
                </div>
            ) : (
                <div className="flex w-full">
                    {/* 🌟 شرط هوشمند: برای موقعیت مکانی کادر متنی، برای بقیه دکمه آپلود بزرگ */}
                    {messageType === MessageType.Location ? (
                        <Input 
                            type="text" dir="ltr" placeholder={config.placeholder} 
                            value={mediaUrl} onChange={(e) => setMediaUrl(e.target.value)} 
                            className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-inner w-full rounded-xl" 
                            prefix={<Icon className="text-gray-400 text-lg" />}
                        />
                    ) : (
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-indigo-400 dark:hover:border-indigo-500 rounded-2xl bg-gray-50/50 hover:bg-indigo-50/30 dark:bg-gray-800/30 dark:hover:bg-indigo-900/20 transition-all cursor-pointer group"
                        >
                            <input type="file" ref={fileInputRef} className="hidden" accept={config.accept} onChange={handleFileSelect} />
                            
                            <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-sm border border-gray-100 dark:border-gray-700 text-gray-400 group-hover:text-indigo-500 group-hover:scale-110 mb-2 transition-all duration-300">
                                <HiOutlineCloudUpload className="text-2xl" />
                            </div>
                            
                            <span className="text-sm font-bold text-gray-600 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                برای انتخاب فایل کلیک کنید
                            </span>
                            <span className="text-[10px] font-bold text-gray-400 mt-1.5 tracking-wider">
                                حداکثر حجم مجاز: ۲۰ مگابایت
                            </span>
                        </div>
                    )}
                </div>
            )}
            
            {/* مودال پیش‌نمایش (بدون تغییر) */}
            {isModalOpen && selectedFile && previewLocalUrl && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-[fadeIn_0.2s_ease-out]">
                    <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl transform transition-all scale-100">
                        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
                            <h3 className="font-bold text-gray-800 dark:text-gray-100">{config.title}</h3>
                            <button onClick={closeModal} className="p-1 text-gray-400 hover:text-red-500 transition-colors"><HiX className="text-xl" /></button>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 flex flex-col items-center justify-center min-h-[200px] relative">
                            <div className="w-full flex items-center justify-center">
                                {messageType === MessageType.Image && <img src={previewLocalUrl} alt="Preview" className="max-w-full max-h-[250px] object-contain rounded-xl shadow-sm" />}
                                {messageType === MessageType.Video && <video src={previewLocalUrl} controls className="max-w-full max-h-[250px] rounded-xl shadow-sm" />}
                                {messageType === MessageType.Audio && <audio src={previewLocalUrl} controls className="w-full mt-4" />}
                                {messageType === MessageType.Document && <HiOutlineDocument className="text-7xl text-emerald-500 my-4" />}
                            </div>
                            <div className="w-full mt-4 bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 flex flex-col gap-3 shadow-sm">
                                <div className="flex items-center justify-between gap-3 overflow-hidden">
                                    <span className="text-xs font-bold text-gray-500 whitespace-nowrap">نام فایل:</span>
                                    <span className="text-sm font-bold text-gray-800 dark:text-gray-200 truncate" dir="ltr" title={selectedFile.name}>{selectedFile.name}</span>
                                </div>
                                <div className="w-full h-px bg-gray-100 dark:bg-gray-800"></div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-gray-500">حجم فایل:</span>
                                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300" dir="ltr">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-gray-500">پسوند:</span>
                                        <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-md text-[10px] font-black tracking-widest uppercase">{getFileExtension(selectedFile.name)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 flex gap-3 bg-white dark:bg-gray-900">
                            <Button className="flex-1 rounded-xl" variant="plain" onClick={closeModal} disabled={isUploading}>انصراف</Button>
                            <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl" variant="solid" onClick={handleConfirmUpload} loading={isUploading}>
                                تایید و آپلود به سرور
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default MediaUploader