import { useState } from 'react'
import Button from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { apiAddKnowledgeText } from '@/services/KnowledgeService'
import { useSessionUser } from '@/store/authStore'

interface Props {
    onSuccess: () => void;
}

const TextEntryTab = ({ onSuccess }: Props) => {
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const { user } = useSessionUser()
    const companyId = user?.companyId || ''

    const handleSubmit = async () => {
        if (!title.trim() || !content.trim()) {
            toast.push(<Notification title="خطا" type="danger">لطفاً عنوان و متن را وارد کنید.</Notification>, { placement: 'top-center' })
            return
        }

        setIsLoading(true)
        try {
            await apiAddKnowledgeText(companyId, { title, textContent: content })
            toast.push(<Notification title="موفق" type="success">متن با موفقیت به پایگاه دانش افزوده شد و در حال پردازش است.</Notification>, { placement: 'top-center' })
            setTitle('')
            setContent('')
            onSuccess() // رفرش کردن لیست داکیومنت‌ها
        } catch (error) {
            toast.push(<Notification title="خطا" type="danger">مشکلی در ذخیره متن پیش آمد.</Notification>, { placement: 'top-center' })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex flex-col gap-4">
            <div>
                <label className="block text-sm font-medium mb-1">عنوان سند</label>
                <Input 
                    placeholder="مثال: قوانین مرجوعی کالا" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    disabled={isLoading}
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">متن کامل</label>
                <textarea
                    rows={6}
                    className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm resize-none"
                    placeholder="متن خود را اینجا تایپ یا پیست کنید..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    disabled={isLoading}
                />
            </div>
            <div className="flex justify-end mt-2">
                <Button variant="solid" className="bg-indigo-600 hover:bg-indigo-500" loading={isLoading} onClick={handleSubmit}>
                    ذخیره در پایگاه دانش
                </Button>
            </div>
        </div>
    )
}

export default TextEntryTab