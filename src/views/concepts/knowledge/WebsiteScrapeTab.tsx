import { useState } from 'react'
import Button from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { apiAddKnowledgeWebsite } from '@/services/KnowledgeService'
import { useSessionUser } from '@/store/authStore'

interface Props {
    onSuccess: () => void;
}

const WebsiteScrapeTab = ({ onSuccess }: Props) => {
    const [title, setTitle] = useState('')
    const [url, setUrl] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const { user } = useSessionUser()
    const companyId = user?.companyId || ''

    const handleSubmit = async () => {
        if (!title.trim() || !url.trim()) {
            toast.push(<Notification title="خطا" type="danger">لطفاً عنوان و آدرس سایت را وارد کنید.</Notification>, { placement: 'top-center' })
            return
        }

        setIsLoading(true)
        try {
            await apiAddKnowledgeWebsite({ companyId, title, url })
            toast.push(<Notification title="موفق" type="success">وب‌سایت با موفقیت ثبت شد. ربات در حال خواندن صفحات است.</Notification>, { placement: 'top-center' })
            setTitle('')
            setUrl('')
            onSuccess()
        } catch (error) {
            toast.push(<Notification title="خطا" type="danger">مشکلی در ارتباط با سایت پیش آمد.</Notification>, { placement: 'top-center' })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex flex-col gap-4">
            <div>
                <label className="block text-sm font-medium mb-1">عنوان سایت یا صفحه</label>
                <Input placeholder="مثال: صفحه درباره ما" value={title} onChange={(e) => setTitle(e.target.value)} disabled={isLoading} />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">آدرس اینترنتی (URL)</label>
                <Input placeholder="https://example.com/about" type="url" value={url} onChange={(e) => setUrl(e.target.value)} disabled={isLoading} className="dir-ltr text-left" />
            </div>
            <div className="flex justify-end mt-2">
                <Button variant="solid" className="bg-indigo-600 hover:bg-indigo-500" loading={isLoading} onClick={handleSubmit}>
                    استخراج و ذخیره
                </Button>
            </div>
        </div>
    )
}

export default WebsiteScrapeTab