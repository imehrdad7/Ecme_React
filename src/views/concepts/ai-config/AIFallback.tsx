import { useState, useRef, useEffect } from 'react'
import { 
    HiOutlineSparkles, HiOutlineChip, HiOutlineDatabase, 
    HiOutlineAdjustments, HiOutlineSave, HiOutlineChatAlt2,
    HiOutlineRefresh, HiOutlinePaperAirplane
} from 'react-icons/hi'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'

type ChatMessage = { sender: 'user' | 'ai'; text: string }

const aiModels = [
    { id: 'gpt-4o', name: 'GPT-4 Omni', provider: 'OpenAI', badge: 'باهوش‌ترین' },
    { id: 'gpt-3.5', name: 'GPT-3.5 Turbo', provider: 'OpenAI', badge: 'سریع و اقتصادی' },
    { id: 'claude-3', name: 'Claude 3 Haiku', provider: 'Anthropic', badge: 'لحن طبیعی' },
]

const AIFallback = () => {
    // استیت‌های تنظیمات هوش مصنوعی
    const [isAIEnabled, setIsAIEnabled] = useState<boolean>(true)
    const [selectedModel, setSelectedModel] = useState<string>('gpt-4o')
    const [systemPrompt, setSystemPrompt] = useState<string>(
        "شما دستیار هوشمند شرکت «باماسان» هستید. لحن شما باید محترمانه، صمیمی و دوستانه باشد. محصولات اصلی ما شامل پکیج‌های طراحی سایت و سئو است. قیمت پایه طراحی سایت از ۱۵ میلیون تومان شروع می‌شود. اگر سوالی پرسیده شد که جواب آن را نمی‌دانید، کاربر را به شماره ۰۲۱۱۲۳۴۵۶ ارجاع دهید."
    )
    const [temperature, setTemperature] = useState<number>(0.5) // بین 0 تا 1
    const [isSaving, setIsSaving] = useState<boolean>(false)

    // استیت‌های شبیه‌ساز (Playground)
    const [testMessage, setTestMessage] = useState<string>('')
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
        { sender: 'ai', text: 'سلام! من نسخه شبیه‌سازی شده مغز هوشمند شما هستم. می‌توانید تنظیمات را تغییر دهید و من را همینجا تست کنید.' }
    ])
    const [isAITyping, setIsAITyping] = useState<boolean>(false)
    const chatContainerRef = useRef<HTMLDivElement>(null)

    // اسکرول خودکار به پایین چت
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
        }
    }, [chatHistory, isAITyping])

    const handleSaveConfig = async () => {
        setIsSaving(true)
        try {
            await new Promise(resolve => setTimeout(resolve, 1500))
            toast.push(<Notification type="success" title="موفقیت‌آمیز">مغز هوشمند با موفقیت به‌روزرسانی و فعال شد.</Notification>, { placement: 'top-center' })
        } finally {
            setIsSaving(false)
        }
    }

    const handleTestChat = async () => {
        if (!testMessage.trim()) return
        
        const newUserMsg: ChatMessage = { sender: 'user', text: testMessage }
        setChatHistory(prev => [...prev, newUserMsg])
        setTestMessage('')
        setIsAITyping(true)

        // شبیه‌سازی فکر کردن و جواب دادن هوش مصنوعی
        setTimeout(() => {
            let aiResponse = 'ببخشید متوجه نشدم.'
            if (newUserMsg.text.includes('قیمت') || newUserMsg.text.includes('هزینه')) {
                aiResponse = 'قیمت پایه خدمات طراحی سایت ما از ۱۵ میلیون تومان شروع می‌شود. البته این مبلغ بسته به نیازهای دقیق شما متغیر است.'
            } else if (newUserMsg.text.includes('سلام')) {
                aiResponse = 'سلام کاربر عزیز! خوش آمدید. چطور می‌توانم کمکتان کنم؟'
            } else {
                aiResponse = 'پاسخ این سوال در پایگاه دانش من نیست. لطفاً برای اطلاعات دقیق‌تر با شماره تماس ۰۲۱۱۲۳۴۵۶ در ارتباط باشید.'
            }

            setChatHistory(prev => [...prev, { sender: 'ai', text: aiResponse }])
            setIsAITyping(false)
        }, 1500)
    }

    const resetChat = () => setChatHistory([{ sender: 'ai', text: 'چت پاک شد. تنظیمات جدید را تست کنید!' }])

    return (
        <div className="flex flex-col lg:flex-row gap-6 w-full h-full pb-8 animate-[fadeIn_0.3s_ease-out]" dir="rtl">
            
            {/* 🛑 ستون راست: تنظیمات هوش مصنوعی */}
            <div className="flex-1 flex flex-col gap-6">
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-col gap-1">
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                            <HiOutlineSparkles className="text-purple-600" />
                            مغز هوشمند (AI Fallback)
                        </h3>
                        <p className="text-sm text-gray-500">اگر ربات جواب سوالی را در کلمات کلیدی پیدا نکرد، هوش مصنوعی وارد عمل می‌شود.</p>
                    </div>
                    
                    <Button 
                        variant="solid" 
                        icon={<HiOutlineSave />} 
                        loading={isSaving}
                        onClick={handleSaveConfig}
                        className="bg-gray-900 hover:bg-black dark:bg-white dark:text-gray-900 shadow-md font-bold"
                    >
                        ذخیره تنظیمات AI
                    </Button>
                </div>

                <Card className="border-gray-100 dark:border-gray-800 p-0 overflow-hidden shadow-sm flex flex-col">
                    
                    {/* هدر فعال‌سازی */}
                    <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/30">
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors duration-500 ${isAIEnabled ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-600' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                                <HiOutlineChip className="text-2xl" />
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100">وضعیت موتور هوش مصنوعی</h4>
                                <span className={`text-xs font-bold mt-1 ${isAIEnabled ? 'text-emerald-500' : 'text-gray-400'}`}>
                                    {isAIEnabled ? 'روشن و فعال' : 'خاموش'}
                                </span>
                            </div>
                        </div>
                        {/* Toggle Switch */}
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" checked={isAIEnabled} onChange={() => setIsAIEnabled(!isAIEnabled)} />
                            <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                        </label>
                    </div>

                    <div className={`flex flex-col transition-all duration-300 ${!isAIEnabled ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
                        
                        {/* انتخاب مدل زبانی */}
                        <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                            <h4 className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                                <HiOutlineSparkles className="text-lg text-purple-500" /> انتخاب مدل زبانی (LLM)
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {aiModels.map(model => (
                                    <div 
                                        key={model.id}
                                        onClick={() => setSelectedModel(model.id)}
                                        className={`flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedModel === model.id ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-900/20 shadow-sm' : 'border-gray-100 dark:border-gray-700 hover:border-purple-200'}`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-bold text-sm text-gray-800 dark:text-gray-100">{model.name}</span>
                                            {selectedModel === model.id && <div className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse"></div>}
                                        </div>
                                        <span className="text-[10px] text-gray-500 uppercase">{model.provider}</span>
                                        <span className="mt-2 text-[10px] font-bold text-purple-600 bg-purple-100 dark:bg-purple-900/40 dark:text-purple-300 self-start px-2 py-0.5 rounded-md">
                                            {model.badge}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* تنظیم پرامپت و دیتابیس کسب‌وکار */}
                        <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="text-sm font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                                    <HiOutlineDatabase className="text-lg text-purple-500" /> دستورالعمل و پایگاه دانش (System Prompt)
                                </h4>
                            </div>
                            <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                                در اینجا شخصیت ربات، خدمات، قیمت‌ها و قوانین کسب‌وکار خود را بنویسید. هوش مصنوعی فقط بر اساس این اطلاعات به کاربران پاسخ می‌دهد و اطلاعات غلط (Hallucination) تولید نخواهد کرد.
                            </p>
                            <Input 
                                textArea 
                                rows={8} 
                                value={systemPrompt}
                                onChange={(e) => setSystemPrompt(e.target.value)}
                                className="bg-gray-50 dark:bg-gray-800/50 font-mono text-sm leading-loose border-purple-100 dark:border-purple-900/30 focus:border-purple-500"
                            />
                        </div>

                        {/* تنظیمات پیشرفته (دما/خلاقیت) */}
                        <div className="p-6">
                            <h4 className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                                <HiOutlineAdjustments className="text-lg text-purple-500" /> میزان خلاقیت ربات (Temperature)
                            </h4>
                            <div className="flex items-center gap-4">
                                <span className="text-xs text-gray-500 font-bold w-12 text-left">دقیق</span>
                                <input 
                                    type="range" 
                                    min="0" max="1" step="0.1" 
                                    value={temperature} 
                                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-purple-600"
                                />
                                <span className="text-xs text-gray-500 font-bold w-12 text-right">خلاقانه</span>
                            </div>
                            <div className="mt-3 flex justify-between px-16">
                                <span className="text-[10px] text-gray-400">مناسب برای پشتیبانی و پاسخ‌های قطعی</span>
                                <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 rounded">{temperature}</span>
                                <span className="text-[10px] text-gray-400">مناسب برای بازاریابی و گفتگو</span>
                            </div>
                        </div>

                    </div>
                </Card>
            </div>

            {/* 🛑 ستون چپ: شبیه‌ساز زنده (Playground) */}
            <div className="w-full lg:w-[380px] xl:w-[420px] flex flex-col gap-6">
                
                <Card className="flex flex-col h-[600px] lg:h-full p-0 border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden rounded-3xl bg-gray-50/50 dark:bg-gray-950/50 relative">
                    
                    {/* هدر شبیه‌ساز */}
                    <div className="h-16 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-between px-4 z-10 shadow-sm relative">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center shadow-md">
                                <HiOutlineSparkles className="text-white text-lg" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-sm text-gray-800 dark:text-gray-100">شبیه‌ساز هوش مصنوعی</span>
                                <span className="text-[10px] text-purple-600 font-bold flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></span>
                                    {aiModels.find(m => m.id === selectedModel)?.name}
                                </span>
                            </div>
                        </div>
                        <button onClick={resetChat} title="پاک کردن تاریخچه" className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-gray-500 transition-colors">
                            <HiOutlineRefresh className="text-lg" />
                        </button>
                    </div>

                    {/* بدنه چت */}
                    <div 
                        ref={chatContainerRef}
                        className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 relative custom-scrollbar"
                    >
                        {!isAIEnabled && (
                            <div className="absolute inset-0 z-20 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6">
                                <HiOutlineChip className="text-6xl text-gray-300 dark:text-gray-600 mb-4" />
                                <span className="font-bold text-gray-600 dark:text-gray-300">مغز هوشمند خاموش است</span>
                                <span className="text-xs text-gray-500 mt-2">برای استفاده از شبیه‌ساز، ابتدا دکمه فعال‌سازی را روشن کنید.</span>
                            </div>
                        )}

                        {chatHistory.map((msg, idx) => (
                            <div key={idx} className={`flex max-w-[85%] ${msg.sender === 'user' ? 'self-end justify-end' : 'self-start justify-start'}`}>
                                <div className={`p-3.5 rounded-2xl text-[13px] leading-relaxed shadow-sm ${
                                    msg.sender === 'user' 
                                        ? 'bg-gray-900 text-white rounded-tl-sm dark:bg-white dark:text-gray-900 font-medium' 
                                        : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-100 rounded-tr-sm'
                                }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}

                        {isAITyping && (
                            <div className="self-start bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-4 rounded-2xl rounded-tr-sm shadow-sm flex gap-1.5 items-center w-16 h-10">
                                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                            </div>
                        )}
                    </div>

                    {/* کادر ارسال پیام تست */}
                    <div className="p-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-10">
                        <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-1.5 pr-4 shadow-inner">
                            <input 
                                type="text"
                                placeholder="از هوش مصنوعی سوال بپرسید..."
                                value={testMessage}
                                onChange={(e) => setTestMessage(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleTestChat()}
                                disabled={!isAIEnabled || isAITyping}
                                className="flex-1 bg-transparent border-none outline-none text-[13px] text-gray-800 dark:text-gray-100 disabled:opacity-50"
                            />
                            <button 
                                onClick={handleTestChat}
                                disabled={!isAIEnabled || isAITyping || !testMessage.trim()}
                                className="w-10 h-10 rounded-xl bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center transition-colors shadow-md disabled:opacity-50 disabled:bg-gray-400 transform -rotate-180"
                            >
                                <HiOutlinePaperAirplane className="text-lg rotate-45 transform" />
                            </button>
                        </div>
                    </div>
                </Card>

            </div>

            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #475569; }
            `}</style>
        </div>
    )
}

export default AIFallback