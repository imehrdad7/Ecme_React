import { useState } from 'react'
import Button from '@/components/ui/Button'
import TextEntryTab from './TextEntryTab'
import WebsiteScrapeTab from './WebsiteScrapeTab'
import FileUploadTab from './FileUploadTab'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { HiArrowRight } from 'react-icons/hi'

interface KnowledgeCreateProps {
    onBackToList: () => void;
}

const KnowledgeCreate = ({ onBackToList }: KnowledgeCreateProps) => {
    const [activeTab, setActiveTab] = useState<'text' | 'website' | 'file'>('text')

    const handleSuccess = () => {
        toast.push(
            <Notification title="موفق" type="success">اطلاعات با موفقیت دریافت شد و در صف پردازش قرار گرفت.</Notification>, 
            { placement: 'top-center' }
        )
        onBackToList(); 
    }

    // این تابع دکمه‌ی سابمیت داخل تب‌ها را پیدا کرده و روی آن کلیک می‌کند
    const triggerSubmit = () => {
        const submitButton = document.getElementById('submit-knowledge-btn')
        if (submitButton) {
            submitButton.click()
        } else {
            toast.push(<Notification title="خطا" type="danger">دکمه ارسال یافت نشد.</Notification>, { placement: 'top-center' })
        }
    }

    return (
        <div className="flex flex-col gap-6 w-full p-4 md:p-6">
            
            {/* باکس هدر */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                
                {/* سمت راست: عنوان و دکمه برگشت */}
                <div className="flex items-center gap-4">
                    <Button 
                        shape="circle" 
                        variant="plain" 
                        onClick={onBackToList} 
                        icon={<HiArrowRight className="text-xl" />} 
                        className="bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-700"
                    />
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">افزودن دانش جدید</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">اطلاعات، کاتالوگ‌ها و لینک‌های خود را وارد کنید.</p>
                    </div>
                </div>
            </div>

            {/* باکس محتوا */}
            <div className="w-full bg-white dark:bg-gray-800 shadow-sm rounded-2xl p-6 md:p-8 border border-gray-100 dark:border-gray-700">
                <div className="flex bg-gray-100 dark:bg-gray-900 p-1 rounded-xl mb-6">
                    <button onClick={() => setActiveTab('text')} className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'text' ? 'bg-white dark:bg-gray-800 shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>متن مستقیم</button>
                    <button onClick={() => setActiveTab('file')} className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'file' ? 'bg-white dark:bg-gray-800 shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>آپلود فایل</button>
                    <button onClick={() => setActiveTab('website')} className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'website' ? 'bg-white dark:bg-gray-800 shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>لینک سایت</button>
                </div>

                <div className="min-h-[250px] w-full">
                    {activeTab === 'text' && <TextEntryTab onSuccess={handleSuccess} />}
                    {activeTab === 'website' && <WebsiteScrapeTab onSuccess={handleSuccess} />}
                    {activeTab === 'file' && <FileUploadTab onSuccess={handleSuccess} />}
                </div>
            </div>
            
        </div>
    )
}

export default KnowledgeCreate