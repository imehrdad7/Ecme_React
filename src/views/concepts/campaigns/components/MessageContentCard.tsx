import Input from '@/components/ui/Input'
import { HiOutlinePhotograph } from 'react-icons/hi'

type Props = {
    hasMedia: boolean;
    setHasMedia: (val: boolean) => void;
    mediaUrl: string;
    setMediaUrl: (val: string) => void;
    messageText: string;
    setMessageText: (val: string) => void;
}

const MessageContentCard = ({ hasMedia, setHasMedia, mediaUrl, setMediaUrl, messageText, setMessageText }: Props) => {
    return (
        <div className="p-6 sm:p-8 flex flex-col gap-6">
            <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-4">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-bold text-sm">۴</span>
                <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100">محتوای پیام</h4>
            </div>
            
            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">تصویر یا فایل مدیا</label>
                    <label className="flex items-center gap-2 cursor-pointer text-sm">
                        <input type="checkbox" checked={hasMedia} onChange={(e) => setHasMedia(e.target.checked)} className="rounded text-indigo-600 focus:ring-indigo-500" />
                        <span className="text-gray-600 dark:text-gray-400">ارسال مدیا</span>
                    </label>
                </div>
                
                {hasMedia && (
                    <div className="animate-[fadeIn_0.2s_ease-out]">
                        <Input 
                            type="url" dir="ltr" placeholder="https://example.com/banner.jpg" 
                            value={mediaUrl} onChange={(e) => setMediaUrl(e.target.value)} 
                            className="bg-gray-50 dark:bg-gray-800/50" 
                            prefix={<HiOutlinePhotograph className="text-gray-400 text-lg" />}
                        />
                        <p className="text-xs text-gray-500 mt-1.5">لینک مستقیم فایل تصویری یا ویدیویی خود را وارد کنید.</p>
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-3 mt-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">متن پیام شما</label>
                <Input textArea rows={6} placeholder="سلام {name} عزیز! جشنواره تخفیف‌های ما شروع شد..." value={messageText} onChange={(e) => setMessageText(e.target.value)} className="bg-gray-50 dark:bg-gray-800/50 text-sm leading-loose" />
                <p className="text-xs text-gray-500 mt-1">راهنما: از متغیر <code className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 px-1.5 py-0.5 rounded-md font-mono">{'{name}'}</code> برای درج نام اختصاصی هر کاربر استفاده کنید.</p>
            </div>
        </div>
    )
}

export default MessageContentCard