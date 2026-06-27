import { useState } from 'react'
import { 
    HiOutlineSave, HiOutlineClipboardCopy, HiOutlineCode, 
    HiOutlineColorSwatch, HiOutlineChatAlt2, HiX, HiPaperAirplane 
} from 'react-icons/hi'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Radio from '@/components/ui/Radio'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'

// رنگ‌های پیشنهادی برای ویجت
const presetColors = [
    { name: 'Indigo', value: '#4f46e5' },
    { name: 'Sky', value: '#0ea5e9' },
    { name: 'Emerald', value: '#10b981' },
    { name: 'Rose', value: '#e11d48' },
    { name: 'Amber', value: '#d97706' },
    { name: 'Black', value: '#111827' },
]

const WidgetBuilder = () => {
    // 🌟 استیت‌های تنظیمات ویجت
    const [primaryColor, setPrimaryColor] = useState<string>('#4f46e5')
    const [position, setPosition] = useState<'right' | 'left'>('right')
    const [title, setTitle] = useState<string>('پشتیبانی آنلاین')
    const [subtitle, setSubtitle] = useState<string>('معمولاً در چند دقیقه پاسخ می‌دهیم')
    const [welcomeMessage, setWelcomeMessage] = useState<string>('سلام! 👋 چطور می‌تونیم کمکتون کنیم؟')
    
    // استیت‌های داخلی بوم پیش‌نمایش
    const [isWidgetOpen, setIsWidgetOpen] = useState<boolean>(true)
    const [isSaving, setIsSaving] = useState<boolean>(false)

    // کد جاوااسکریپت نهایی برای مشتری
    const embedCode = `<script>
  window.ANYBOT_CONFIG = {
    token: "ab_8f7d6e5c4b3a",
    color: "${primaryColor}",
    position: "${position}"
  };
</script>
<script src="https://cdn.bamasan.ir/widget/v1/anybot.js" async></script>`

    const handleCopyCode = () => {
        navigator.clipboard.writeText(embedCode)
        toast.push(<Notification type="success" title="کپی شد">کد اسکریپت با موفقیت در کلیپ‌بورد کپی شد.</Notification>, { placement: 'top-center' })
    }

    const handleSaveConfig = async () => {
        setIsSaving(true)
        try {
            // شبیه‌سازی ارسال تنظیمات به API دات‌نت
            await new Promise(resolve => setTimeout(resolve, 1200))
            toast.push(<Notification type="success" title="ذخیره شد">تنظیمات ویجت با موفقیت به‌روزرسانی شد.</Notification>, { placement: 'top-center' })
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="flex flex-col lg:flex-row h-full w-full gap-6 pb-8 animate-[fadeIn_0.3s_ease-out]" dir="rtl">
            
            {/* 🛑 ستون راست: پنل تنظیمات (عرض ۴۰۰ پیکسل در دسکتاپ) */}
            <div className="w-full lg:w-[400px] xl:w-[450px] flex flex-col gap-6 flex-shrink-0">
                
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">سفارشی‌سازی ویجت</h3>
                        <p className="text-sm text-gray-500 mt-1">طاهر چت‌باکس سایت خود را طراحی کنید.</p>
                    </div>
                    <Button 
                        variant="solid" 
                        icon={<HiOutlineSave />} 
                        loading={isSaving}
                        onClick={handleSaveConfig}
                        className="bg-gray-900 hover:bg-black dark:bg-white dark:text-gray-900 shadow-md"
                    >
                        ذخیره تغییرات
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    <Card className="flex flex-col gap-8 border-gray-100 dark:border-gray-800">
                        
                        {/* ۱. تنظیمات رنگ‌بندی */}
                        <div className="flex flex-col gap-3">
                            <h4 className="text-sm font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                                <HiOutlineColorSwatch className="text-lg text-indigo-500" /> رنگ سازمانی (Brand Color)
                            </h4>
                            <div className="flex items-center gap-3 flex-wrap">
                                {presetColors.map((color) => (
                                    <button
                                        key={color.value}
                                        onClick={() => setPrimaryColor(color.value)}
                                        className={`w-10 h-10 rounded-full transition-transform border-2 ${primaryColor === color.value ? 'scale-110 border-gray-400 dark:border-gray-300 shadow-md' : 'border-transparent hover:scale-105'}`}
                                        style={{ backgroundColor: color.value }}
                                        title={color.name}
                                    />
                                ))}
                                <div className="relative">
                                    <input 
                                        type="color" 
                                        value={primaryColor}
                                        onChange={(e) => setPrimaryColor(e.target.value)}
                                        className="w-10 h-10 rounded-full cursor-pointer opacity-0 absolute inset-0 z-10"
                                    />
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-red-500 via-green-500 to-blue-500 flex items-center justify-center border-2 border-transparent">
                                        <div className="w-8 h-8 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-inner">
                                            <span className="text-lg">+</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <hr className="border-gray-100 dark:border-gray-800" />

                        {/* ۲. محتوای متنی */}
                        <div className="flex flex-col gap-5">
                            <h4 className="text-sm font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                                <HiOutlineChatAlt2 className="text-lg text-indigo-500" /> محتوای متنی
                            </h4>
                            
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-gray-600 dark:text-gray-400">عنوان هدر</label>
                                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="مثال: پشتیبانی آنلاین" />
                            </div>
                            
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-gray-600 dark:text-gray-400">زیرنویس هدر (وضعیت)</label>
                                <Input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="مثال: پاسخگویی زیر ۵ دقیقه" />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-gray-600 dark:text-gray-400">پیام خوش‌آمدگویی ربات</label>
                                <Input textArea rows={2} value={welcomeMessage} onChange={(e) => setWelcomeMessage(e.target.value)} placeholder="متن پیام خودکار آغازین..." />
                            </div>
                        </div>

                        <hr className="border-gray-100 dark:border-gray-800" />

                        {/* ۳. موقعیت و رفتار */}
                        <div className="flex flex-col gap-4">
                            <h4 className="text-sm font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                                <HiOutlineCode className="text-lg text-indigo-500" /> تنظیمات نمایش
                            </h4>
                            
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-gray-600 dark:text-gray-400">موقعیت دکمه در سایت</label>
                                <Radio.Group value={position} onChange={(val) => setPosition(val as 'right' | 'left')} className="flex gap-6 mt-1">
                                    <Radio value="right">گوشه راست پایین</Radio>
                                    <Radio value="left">گوشه چپ پایین</Radio>
                                </Radio.Group>
                            </div>
                        </div>

                    </Card>

                    {/* باکس دریافت کد نصب */}
                    <div className="mt-6">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-bold text-gray-800 dark:text-gray-100">کد نصب (Embed Code)</h4>
                            <Button size="sm" variant="plain" icon={<HiOutlineClipboardCopy />} onClick={handleCopyCode}>کپی کد</Button>
                        </div>
                        <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto relative group">
                            <pre className="text-xs text-green-400 font-mono text-left" dir="ltr">
                                {embedCode}
                            </pre>
                        </div>
                        <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                            این کد را در فایل <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">index.html</code> سایت خود و قبل از بستن تگ <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">&lt;/body&gt;</code> قرار دهید.
                        </p>
                    </div>
                </div>
            </div>

            {/* 🛑 ستون چپ: بوم پیش‌نمایش زنده (Live Preview Canvas) */}
            <div className="flex-1 bg-gray-100 dark:bg-gray-950 rounded-3xl border-4 border-gray-200 dark:border-gray-800 relative overflow-hidden flex flex-col shadow-inner">
                
                {/* بک‌گراند نقطه‌چین شبیه‌ساز بوم */}
                <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" 
                    style={{ backgroundImage: 'radial-gradient(#000 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }}>
                </div>

                {/* هدر مرورگر جعلی (Mock Browser Tab) */}
                <div className="h-12 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center px-4 gap-2 z-10 shadow-sm relative">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    <div className="flex-1 mx-4 h-7 bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center text-[10px] text-gray-400 font-mono">
                        bamasan.ir
                    </div>
                </div>

                {/* محتوای فرضی سایت */}
                <div className="p-10 flex flex-col gap-6 opacity-30 pointer-events-none select-none z-0">
                    <div className="w-1/3 h-10 bg-gray-300 dark:bg-gray-700 rounded-xl"></div>
                    <div className="w-3/4 h-6 bg-gray-300 dark:bg-gray-700 rounded-md mt-4"></div>
                    <div className="w-2/4 h-6 bg-gray-300 dark:bg-gray-700 rounded-md"></div>
                    <div className="grid grid-cols-3 gap-6 mt-10">
                        <div className="h-32 bg-gray-300 dark:bg-gray-700 rounded-2xl"></div>
                        <div className="h-32 bg-gray-300 dark:bg-gray-700 rounded-2xl"></div>
                        <div className="h-32 bg-gray-300 dark:bg-gray-700 rounded-2xl"></div>
                    </div>
                </div>

                {/* 🌟 ویجت زنده (Live Widget Render) */}
                <div className={`absolute bottom-6 transition-all duration-500 z-20 flex flex-col gap-4 ${position === 'right' ? 'right-6 items-end' : 'left-6 items-start'}`}>
                    
                    {/* پنجره چت */}
                    <div className={`w-[320px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 transform origin-bottom border border-gray-100 dark:border-gray-800
                        ${isWidgetOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-90 opacity-0 translate-y-10 pointer-events-none'}`}
                    >
                        {/* هدر ویجت */}
                        <div className="p-4 flex items-center justify-between text-white transition-colors duration-300" style={{ backgroundColor: primaryColor }}>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                    <HiOutlineChatAlt2 className="text-xl text-white" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-bold text-sm shadow-sm">{title || 'عنوان ویجت'}</span>
                                    <span className="text-[10px] opacity-90">{subtitle}</span>
                                </div>
                            </div>
                            <button onClick={() => setIsWidgetOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors">
                                <HiX className="text-lg" />
                            </button>
                        </div>

                        {/* بدنه پیام‌ها */}
                        <div className="h-[280px] bg-gray-50/50 dark:bg-gray-950/50 p-4 flex flex-col gap-3 overflow-y-auto relative">
                            <span className="text-[10px] text-gray-400 mx-auto my-2">امروز</span>
                            
                            <div className="flex items-end gap-2 self-start w-11/12 animate-[fadeIn_0.3s_ease-out_0.2s_both]">
                                <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs shadow-sm" style={{ backgroundColor: primaryColor }}>
                                    <HiOutlineChatAlt2 />
                                </div>
                                <div className="p-3 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 text-xs leading-relaxed rounded-2xl rounded-tr-sm shadow-sm border border-gray-100 dark:border-gray-800">
                                    {welcomeMessage || 'پیام خوش‌آمدگویی خالی است.'}
                                </div>
                            </div>

                            {/* واترمارک AnyBot (Growth Loop) */}
                            <div className="absolute bottom-2 inset-x-0 flex justify-center mt-auto">
                                <span className="text-[9px] text-gray-400 flex items-center gap-1 font-medium bg-white/80 dark:bg-gray-900/80 px-2 py-0.5 rounded-full backdrop-blur-sm">
                                    ⚡ قدرت گرفته از <strong>AnyBot</strong>
                                </span>
                            </div>
                        </div>

                        {/* کادر نوشتن پیام */}
                        <div className="p-3 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2">
                            <div className="flex-1 h-9 bg-gray-100 dark:bg-gray-800 rounded-full px-3 flex items-center text-xs text-gray-400">
                                پیام خود را بنویسید...
                            </div>
                            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white transform rotate-180 transition-colors shadow-sm" style={{ backgroundColor: primaryColor }}>
                                <HiPaperAirplane className="text-sm" />
                            </div>
                        </div>
                    </div>

                    {/* 🌟 دکمه شناور چت */}
                    <button 
                        onClick={() => setIsWidgetOpen(!isWidgetOpen)}
                        className="w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-white transition-all duration-300 hover:scale-105 active:scale-95 z-30 relative"
                        style={{ backgroundColor: primaryColor }}
                    >
                        <HiOutlineChatAlt2 className={`text-2xl absolute transition-all duration-300 ${isWidgetOpen ? 'rotate-90 opacity-0 scale-50' : 'rotate-0 opacity-100 scale-100'}`} />
                        <HiX className={`text-2xl absolute transition-all duration-300 ${isWidgetOpen ? 'rotate-0 opacity-100 scale-100' : '-rotate-90 opacity-0 scale-50'}`} />
                        
                        {/* پالس انیمیشن وقتی بسته است */}
                        {!isWidgetOpen && <span className="absolute inset-0 rounded-full animate-ping opacity-30" style={{ backgroundColor: primaryColor }}></span>}
                    </button>
                </div>

            </div>

            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 4px; }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #374151; }
            `}</style>
        </div>
    )
}

export default WidgetBuilder