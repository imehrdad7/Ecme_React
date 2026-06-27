import { useState } from 'react'
import { 
    HiOutlineSearch, HiOutlinePaperClip, HiOutlineMicrophone, HiOutlineEmojiHappy, 
    HiOutlineUser, HiOutlineTag, HiOutlineChatAlt2, HiOutlineDotsVertical, HiOutlineChevronLeft
} from 'react-icons/hi'
import { FaTelegramPlane, FaInstagram, FaWhatsapp, FaGlobe, FaPaperPlane } from 'react-icons/fa'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Tag from '@/components/ui/Tag'
import Avatar from '@/components/ui/Avatar'

// --- انواع داده‌ها (Types) ---
type ChannelType = 'Telegram' | 'Instagram' | 'WhatsApp' | 'Web'

type Conversation = {
    id: string
    userName: string
    userAvatar?: string
    channel: ChannelType
    lastMessage: string
    time: string
    unreadCount: number
    status: 'online' | 'offline'
}

type Message = {
    id: string
    sender: 'user' | 'agent' | 'bot'
    text: string
    time: string
    type: 'text' | 'image' | 'file'
    fileUrl?: string
}

// --- دیتای تستی صندوق ورودی ---
const mockConversations: Conversation[] = [
    { id: 'c-1', userName: 'مهرداد نصیری', channel: 'Telegram', lastMessage: 'قیمت پکیج نقره‌ای چقدر هست؟', time: '۱۰:۳۰', unreadCount: 2, status: 'online' },
    { id: 'c-2', userName: 'سارا احمدی', channel: 'Instagram', lastMessage: 'ممنون از پاسخگویی سریع شما 🙏', time: '۰۹:۱۵', unreadCount: 0, status: 'offline' },
    { id: 'c-3', userName: 'شرکت بام‌سازان', channel: 'WhatsApp', lastMessage: 'کاتالوگ رسمی تجهیزات گاز را ارسال کنید.', time: 'دیروز', unreadCount: 0, status: 'online' },
    { id: 'c-4', userName: 'کاربر مهمان ۵۴۲', channel: 'Web', lastMessage: 'سلام، ویجت چت روی موبایل لگ دارد.', time: '۲ روز قبل', unreadCount: 1, status: 'offline' },
]

const mockMessages: Record<string, Message[]> = {
    'c-1': [
        { id: 'm-1', sender: 'user', text: 'سلام وقت بخیر', time: '۱۰:۲۵', type: 'text' },
        { id: 'm-2', sender: 'bot', text: 'سلام! به دستیار هوشمند خوش آمدید. چطور می‌توانم کمکتان کنم؟', time: '۱۰:۲۵', type: 'text' },
        { id: 'm-3', sender: 'user', text: 'قیمت پکیج نقره‌ای چقدر هست؟', time: '۱۰:۳۰', type: 'text' },
    ],
    'c-2': [
        { id: 'm-4', sender: 'user', text: 'آیا روی دامنه‌های ir هم فعال می‌شود؟', time: '۰۹:۰۰', type: 'text' },
        { id: 'm-5', sender: 'agent', text: 'سلام بله سارا عزیز، سرویس ما کاملاً با دامنه‌های ملی و بین‌المللی سازگار است.', time: '۰۹:۱۲', type: 'text' },
        { id: 'm-6', sender: 'user', text: 'ممنون از پاسخگویی سریع شما 🙏', time: '۰۹:۱۵', type: 'text' },
    ]
}

const Inbox = () => {
    const [conversations, setConversations] = useState<Conversation[]>(mockConversations)
    const [activeChatId, setActiveChatId] = useState<string>('c-1')
    const [searchQuery, setSearchQuery] = useState<string>('')
    const [inputText, setInputText] = useState<string>('')

    const activeChat = conversations.find(c => c.id === activeChatId)
    const currentMessages = mockMessages[activeChatId] || []

    // فیلتر کردن لیست چت‌ها بر اساس جستجو
    const filteredChats = conversations.filter(c => 
        c.userName.includes(searchQuery) || c.lastMessage.includes(searchQuery)
    )

    // ارسال پیام جدید از طرف اپراتور (Agent)
    const handleSendMessage = () => {
        if (!inputText.trim()) return

        const newMsg: Message = {
            id: Date.now().toString(),
            sender: 'agent',
            text: inputText,
            time: 'الان',
            type: 'text'
        }

        // آپدیت موقت پیام‌ها در محیط کلین فرانت
        mockMessages[activeChatId] = [...currentMessages, newMsg]
        
        // بروزرسانی آخرین پیام در لیست چت‌ها
        setConversations(conversations.map(c => 
            c.id === activeChatId ? { ...c, lastMessage: inputText, time: 'الان' } : c
        ))

        setInputText('')
    }

    // رندر آیکون اختصاصی هر پلتفرم
    const renderChannelIcon = (channel: ChannelType) => {
        switch (channel) {
            case 'Telegram': return <FaTelegramPlane className="text-sky-500 text-xs" />
            case 'Instagram': return <FaInstagram className="text-pink-500 text-xs" />
            case 'WhatsApp': return <FaWhatsapp className="text-green-500 text-xs" />
            case 'Web': return <FaGlobe className="text-indigo-500 text-xs" />
        }
    }

    return (
        <div className="flex h-[calc(100vh-100px)] w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-sm animate-[fadeIn_0.3s_ease-out]">
            
            {/* 🛑 ستون راست: لیست چت‌ها (عرض ۳۲۰ پیکسل) */}
            <div className="w-full md:w-80 h-full border-l border-gray-100 dark:border-gray-800 flex flex-col flex-shrink-0">
                {/* هدر بخش جستجو */}
                <div className="p-4 border-b border-gray-50 dark:border-gray-800/60 flex flex-col gap-3">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">گفتگوها</h3>
                    <Input
                        size="sm"
                        placeholder="جستجوی نام کاربر یا پیام..."
                        prefix={<HiOutlineSearch className="text-lg" />}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-gray-50/60"
                    />
                </div>

                {/* لیست اسکرول‌بار چت‌ها */}
                <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1">
                    {filteredChats.map((chat) => {
                        const isSelected = chat.id === activeChatId
                        return (
                            <div
                                key={chat.id}
                                onClick={() => setActiveChatId(chat.id)}
                                className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all ${isSelected ? 'bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100/50 dark:border-indigo-900/30' : 'hover:bg-gray-50 dark:hover:bg-gray-800/40 border border-transparent'}`}
                            >
                                {/* آواتار کاربر همراه با نقطه وضعیت آنلاین/آفلاین */}
                                <div className="relative flex-shrink-0">
                                    <Avatar size={42} shape="circle" className="bg-gradient-to-tr from-indigo-100 to-indigo-200 dark:from-indigo-900 dark:to-gray-800 text-indigo-700 dark:text-indigo-300 font-bold">
                                        {chat.userName[0]}
                                    </Avatar>
                                    <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900 ${chat.status === 'online' ? 'bg-emerald-500' : 'bg-gray-300'}`}></span>
                                </div>

                                {/* اطلاعات چت */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-bold text-xs text-gray-800 dark:text-gray-100 truncate">{chat.userName}</span>
                                        <span className="text-[10px] text-gray-400">{chat.time}</span>
                                    </div>
                                    <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate leading-relaxed">
                                        {chat.lastMessage}
                                    </p>
                                </div>

                                {/* نشانگر پلتفرم و پیام‌های خوانده نشده */}
                                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                    <div className="w-5 h-5 rounded-md bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                        {renderChannelIcon(chat.channel)}
                                    </div>
                                    {chat.unreadCount > 0 && (
                                        <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-4 text-center">
                                            {chat.unreadCount}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* 🛑 ستون وسط: محوطه اصلی چت و ارسال پیام */}
            <div className="flex-1 h-full flex flex-col bg-gray-50/50 dark:bg-gray-950/10">
                {activeChat ? (
                    <>
                        {/* هدر چت فعال */}
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-between z-10 shadow-sm">
                            <div className="flex items-center gap-3">
                                <Avatar size={36} shape="circle" className="bg-indigo-50 text-indigo-600 font-bold">{activeChat.userName[0]}</Avatar>
                                <div>
                                    <h4 className="text-sm font-bold text-gray-800 dark:text-gray-100">{activeChat.userName}</h4>
                                    <span className="text-[11px] text-emerald-500 flex items-center gap-1 mt-0.5">
                                        {renderChannelIcon(activeChat.channel)} متصل از {activeChat.channel}
                                    </span>
                                </div>
                            </div>
                            <Button shape="circle" variant="plain" icon={<HiOutlineDotsVertical className="text-lg" />} />
                        </div>

                        {/* تاریخچه پیام‌ها (اسکرول‌شونده) */}
                        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
                            {currentMessages.map((msg) => {
                                const isAgent = msg.sender === 'agent'
                                const isBot = msg.sender === 'bot'
                                
                                return (
                                    <div key={msg.id} className={`flex flex-col max-w-[75%] ${isAgent ? 'self-end items-end' : 'self-start items-start'}`}>
                                        {/* برچسب بات یا ادمین */}
                                        {(isBot || isAgent) && (
                                            <span className="text-[9px] text-gray-400 mb-1 px-1">
                                                {isBot ? '🤖 پاسخ خودکار ربات' : '👨‍💻 اپراتور (شما)'}
                                            </span>
                                        )}
                                        
                                        {/* حباب پیام */}
                                        <div className={`p-3.5 shadow-sm rounded-2xl text-[13px] leading-relaxed whitespace-pre-wrap
                                            ${isAgent 
                                                ? 'bg-indigo-600 text-white rounded-tl-sm' 
                                                : isBot 
                                                    ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-900 dark:text-amber-300 border border-amber-100 dark:border-amber-900/30 rounded-tr-sm'
                                                    : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-tr-sm'
                                            }
                                        `}>
                                            {msg.text}
                                        </div>
                                        <span className="text-[9px] text-gray-400 mt-1 px-1">{msg.time}</span>
                                    </div>
                                )
                            })}
                        </div>

                        {/* کادر پایین: باکس ارسال پیام متنی و فایل */}
                        <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
                            <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-2xl p-2 border border-gray-100 dark:border-gray-700/60">
                                <Button shape="circle" size="sm" variant="plain" icon={<HiOutlinePaperClip className="text-xl" />} />
                                <Button shape="circle" size="sm" variant="plain" icon={<HiOutlineEmojiHappy className="text-xl" />} />
                                
                                <input
                                    type="text"
                                    placeholder="پیام خود را بنویسید..."
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                    className="flex-1 bg-transparent border-none outline-none text-sm px-2 text-gray-800 dark:text-gray-100"
                                />

                                <button 
                                    onClick={handleSendMessage}
                                    className="w-9 h-9 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center transition-colors shadow-sm ml-1"
                                >
                                    <FaPaperPlane className="text-xs transform -rotate-45" />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-3">
                        <HiOutlineChatAlt2 className="text-5xl opacity-40" />
                        <span className="text-sm">یک گفتگو را برای شروع چت انتخاب کنید.</span>
                    </div>
                )}
            </div>

            {/* 🛑 ستون چپ: اطلاعات تکمیلی کاربر (عرض ۲۴0 پیکسل - مخصوص سیستم‌های پیشرفته) */}
            {activeChat && (
                <div className="w-60 h-full border-r border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hidden xl:flex flex-col p-5">
                    <div className="flex flex-col items-center text-center pb-5 border-b border-gray-50 dark:border-gray-800">
                        <Avatar size={64} shape="circle" className="bg-indigo-100 text-indigo-700 font-bold mb-3">{activeChat.userName[0]}</Avatar>
                        <h5 className="font-bold text-gray-800 dark:text-gray-100 text-sm">{activeChat.userName}</h5>
                        <span className="text-[11px] text-gray-400 mt-1">شناسه: {activeChat.id}</span>
                    </div>

                    {/* بخش تگ‌ها و دسته‌بندی مشتری */}
                    <div className="py-4 border-b border-gray-50 dark:border-gray-800">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-gray-300 mb-3">
                            <HiOutlineTag className="text-base" />
                            <span>تگ‌های کاربر</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            <Tag className="bg-emerald-50 text-emerald-600 border-0 text-[10px] font-bold">مشتری وفادار</Tag>
                            <Tag className="bg-amber-50 text-amber-600 border-0 text-[10px] font-bold">لید گاز صنعتی</Tag>
                            <span className="text-[11px] text-indigo-600 cursor-pointer font-medium hover:underline">+ افزودن</span>
                        </div>
                    </div>

                    {/* اطلاعات سیستمی */}
                    <div className="py-4 flex flex-col gap-3">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-gray-300">
                            <HiOutlineUser className="text-base" />
                            <span>جزئیات نشست</span>
                        </div>
                        <div className="text-[11px] flex flex-col gap-2 text-gray-500">
                            <div className="flex justify-between"><span>آخرین بازدید:</span><span className="text-gray-700 dark:text-gray-300 font-medium">۱۰ دقیقه پیش</span></div>
                            <div className="flex justify-between"><span>ربات متصل:</span><span className="text-gray-700 dark:text-gray-300 font-medium">پشتیبانی فروش</span></div>
                            <div className="flex justify-between"><span>آی‌پی:</span><span className="text-gray-700 dark:text-gray-300 font-medium" dir="ltr">185.12.44.1</span></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Inbox