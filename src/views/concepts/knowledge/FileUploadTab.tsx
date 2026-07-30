import { useState, useRef, useEffect } from 'react'
import Button from '@/components/ui/Button'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { apiUploadKnowledgeFile } from '@/services/KnowledgeService'
import { useSessionUser } from '@/store/authStore'
import { 
    HiOutlineCloudUpload, 
    HiOutlineDocumentText, 
    HiOutlineTrash,
    HiOutlineEyeOff
} from 'react-icons/hi'

interface Props {
    onSuccess: () => void;
}

type PreviewState = {
    type: 'pdf' | 'text' | 'unsupported';
    data?: string;
}

const FileUploadTab = ({ onSuccess }: Props) => {
    const [file, setFile] = useState<File | null>(null)
    const [preview, setPreview] = useState<PreviewState | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // پاکسازی URL موقت از مموری مرورگر در زمان بسته شدن تب یا تغییر فایل
    useEffect(() => {
        return () => {
            if (preview?.type === 'pdf' && preview.data) {
                URL.revokeObjectURL(preview.data)
            }
        }
    }, [preview])

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const generatePreview = async (selectedFile: File) => {
        const ext = selectedFile.name.split('.').pop()?.toLowerCase()
        const mimeType = selectedFile.type

        // 1. پیش‌نمایش PDF
        if (mimeType === 'application/pdf' || ext === 'pdf') {
            const objectUrl = URL.createObjectURL(selectedFile)
            setPreview({ type: 'pdf', data: objectUrl })
        } 
        // 2. پیش‌نمایش فایل‌های متنی (TXT, CSV)
        else if (mimeType.startsWith('text/') || ext === 'txt' || ext === 'csv') {
            try {
                // برای جلوگیری از هنگ کردن مرورگر، فقط 50 کیلوبایت اول را برای پیش‌نمایش می‌خوانیم
                const slice = selectedFile.slice(0, 50000) 
                const text = await slice.text()
                const isCut = selectedFile.size > 50000
                
                setPreview({ 
                    type: 'text', 
                    data: text + (isCut ? '\n\n... (ادامه فایل به دلیل حجم بالا در پیش‌نمایش نمایش داده نمی‌شود)' : '') 
                })
            } catch (err) {
                setPreview({ type: 'unsupported' })
            }
        } 
        // 3. فرمت‌های آفیس و سایرین
        else {
            setPreview({ type: 'unsupported' })
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const selectedFile = e.target.files[0]
            setFile(selectedFile)
            generatePreview(selectedFile)
        }
    }

    const clearFile = () => {
        setFile(null)
        setPreview(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const { user } = useSessionUser();
    const companyId = user?.companyId || '';

    const handleSubmit = async () => {
        if (!file) return

        const formData = new FormData()
        formData.append('companyId', companyId)
        formData.append('title', file.name)
        formData.append('file', file)

        setIsLoading(true)
        try {
            await apiUploadKnowledgeFile(formData)
            toast.push(
                <Notification title="موفق" type="success" duration={4000}>
                    فایل با موفقیت آپلود شد و در صف پردازش قرار گرفت.
                </Notification>, { placement: 'top-center' }
            )
            clearFile()
            onSuccess()
        } catch (error) {
            toast.push(
                <Notification title="خطا" type="danger" duration={5000}>
                    آپلود فایل با خطا مواجه شد. لطفاً دوباره تلاش کنید.
                </Notification>, { placement: 'top-center' }
            )
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex flex-col gap-6 w-full">
            {!file ? (
                // 🔹 حالت اول: انتخاب فایل
                <div 
                    className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-3xl p-10 flex flex-col items-center justify-center text-center hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 rounded-2xl flex items-center justify-center mb-4">
                        <HiOutlineCloudUpload className="text-3xl" />
                    </div>
                    <p className="text-base text-gray-700 dark:text-gray-200 font-bold">
                        برای انتخاب فایل کلیک کنید
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                        فایل‌های مجاز: PDF, DOCX, XLSX, CSV, TXT
                    </p>
                    <p className="text-xs text-gray-400 mt-1">حداکثر حجم مجاز: ۱۰ مگابایت</p>
                    
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        className="hidden" 
                        accept=".pdf,.docx,.xlsx,.xls,.txt,.csv"
                    />
                </div>
            ) : (
                // 🔹 حالت دوم: فایل انتخاب شده + پیش‌نمایش
                <div className="flex flex-col gap-4 animate-fadeIn">
                    
                    {/* کارت مشخصات فایل */}
                    <div className="w-full border border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4 w-full">
                            <div className="w-12 h-12 bg-white dark:bg-gray-800 shadow-sm rounded-xl flex items-center justify-center text-indigo-600 shrink-0">
                                <HiOutlineDocumentText className="text-2xl" />
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-gray-800 dark:text-gray-100 font-bold truncate text-sm dir-ltr text-right">
                                    {file.name}
                                </p>
                                <p className="text-gray-500 text-xs mt-1 dir-ltr text-right">
                                    {formatFileSize(file.size)}
                                </p>
                            </div>
                        </div>
                        
                        <Button 
                            shape="circle" 
                            variant="plain" 
                            onClick={clearFile}
                            disabled={isLoading}
                            className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 shrink-0"
                            title="حذف فایل"
                        >
                            <HiOutlineTrash className="text-lg" />
                        </Button>
                    </div>

                    {/* باکس پیش‌نمایش محتوا */}
                    <div className="w-full h-80 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 overflow-hidden relative">
                        {preview?.type === 'pdf' && preview.data && (
                            <iframe 
                                src={preview.data} 
                                className="w-full h-full border-none"
                                title="PDF Preview"
                            />
                        )}

                        {preview?.type === 'text' && (
                            <div className="w-full h-full p-4 overflow-y-auto">
                                <pre className="text-xs text-gray-700 dark:text-gray-300 font-mono whitespace-pre-wrap dir-ltr text-left">
                                    {preview.data}
                                </pre>
                            </div>
                        )}

                        {preview?.type === 'unsupported' && (
                            <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 text-gray-400">
                                <HiOutlineEyeOff className="text-5xl mb-3 opacity-50" />
                                <p className="text-sm font-medium">پیش‌نمایش محتوا برای این فرمت (آفیس) امکان‌پذیر نیست.</p>
                                <p className="text-xs mt-2 opacity-70">فایل شما پس از تایید به درستی در سرور پردازش خواهد شد.</p>
                            </div>
                        )}
                    </div>

                    {/* دکمه‌های تایید و لغو */}
                    <div className="flex justify-end gap-3 mt-2">
                        <Button 
                            variant="plain" 
                            disabled={isLoading} 
                            onClick={clearFile}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            لغو
                        </Button>
                        <Button 
                            variant="solid" 
                            className="bg-indigo-600 hover:bg-indigo-500 px-8" 
                            loading={isLoading} 
                            onClick={handleSubmit}
                        >
                            تایید و آپلود به پایگاه دانش
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default FileUploadTab