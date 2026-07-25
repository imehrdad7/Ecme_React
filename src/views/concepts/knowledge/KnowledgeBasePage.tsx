import { useState } from 'react'
import Card from '@/components/ui/Card'
import TextEntryTab from './TextEntryTab'
import WebsiteScrapeTab from './WebsiteScrapeTab'
import FileUploadTab from './FileUploadTab'
import DocumentList from './DocumentList'

const KnowledgeBasePage = () => {
    const [activeTab, setActiveTab] = useState<'text' | 'website' | 'file'>('file')
    const [refreshList, setRefreshList] = useState(0)

    const handleSuccess = () => {
        setRefreshList(prev => prev + 1)
    }

    return (
        // کلاس max-w-4xl حذف شد تا عرض صفحه کاملاً پر شود
        <div className="flex flex-col gap-6 w-full pb-12">
            <div>
                <h3 className="text-2xl font-extrabold text-gray-800 dark:text-gray-100">پایگاه دانش (RAG)</h3>
                <p className="text-gray-500 text-sm mt-1">اطلاعات، کاتالوگ‌ها و لینک‌های خود را به هوش مصنوعی آموزش دهید.</p>
            </div>

            <Card className="w-full bg-white dark:bg-gray-800 shadow-sm rounded-3xl p-6 md:p-8">
                <div className="flex bg-gray-100 dark:bg-gray-900 p-1 rounded-xl mb-6">
                    <button 
                        onClick={() => setActiveTab('file')}
                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'file' ? 'bg-white dark:bg-gray-800 shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        آپلود فایل
                    </button>
                    <button 
                        onClick={() => setActiveTab('website')}
                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'website' ? 'bg-white dark:bg-gray-800 shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        لینک سایت
                    </button>
                    <button 
                        onClick={() => setActiveTab('text')}
                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'text' ? 'bg-white dark:bg-gray-800 shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        متن مستقیم
                    </button>
                </div>

                <div className="min-h-[250px] w-full">
                    {activeTab === 'text' && <TextEntryTab onSuccess={handleSuccess} />}
                    {activeTab === 'website' && <WebsiteScrapeTab onSuccess={handleSuccess} />}
                    {activeTab === 'file' && <FileUploadTab onSuccess={handleSuccess} />}
                </div>
            </Card>

            <div className="mt-4 w-full">
                <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">اسناد آموزش داده شده</h4>
                <DocumentList refreshTrigger={refreshList} />
            </div>
        </div>
    )
}

export default KnowledgeBasePage