import { useState } from 'react'
import { 
    HiOutlinePlus, HiOutlineCheckCircle, HiOutlineTrash, HiX,
    HiOutlineInformationCircle, HiOutlineKey, HiOutlineLockClosed
} from 'react-icons/hi'
import { FaTelegramPlane, FaInstagram, FaWhatsapp, FaGlobe } from 'react-icons/fa'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Dialog from '@/components/ui/Dialog'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'

type Platform = 'Telegram' | 'Instagram' | 'WhatsApp' | 'Web'

type ConnectedBot = {
    id: string
    name: string
    platform: Platform
    status: 'active' | 'error'
    createdAt: string
}

const initialConnectedBots: ConnectedBot[] = [
    { id: 'bot-101', name: 'پشتیبانی فروش تلگرام', platform: 'Telegram', status: 'active', createdAt: '۱۴۰۳/۰۲/۱۵' },
]

const availablePlatforms = [
    { 
        id: 'Telegram', name: 'ربات تلگرام', icon: FaTelegramPlane, color: 'text-sky-500', bg: 'bg-sky-50', border: 'border-sky-200',
        gradient: 'from-sky-400 to-blue-600',
        description: 'اتصال سریع با استفاده از توکن دریافتی از BotFather'
    },
    { 
        id: 'WhatsApp', name: 'واتس‌اپ بیزینس', icon: FaWhatsapp, color: 'text-green-500', bg: 'bg-green-50', border: 'border-green-200',
        gradient: 'from-green-400 to-emerald-600',
        description: 'اتصال از طریق Cloud API رسمی متا (Meta)'
    },
    { 
        id: 'Instagram', name: 'دایرکت اینستاگرام', icon: FaInstagram, color: 'text-pink-600', bg: 'bg-pink-50', border: 'border-pink-200',
        gradient: 'from-purple-500 via-pink-500 to-orange-400',
        description: 'پاسخگویی خودکار به دایرکت‌ها و استوری‌ها'
    },
    { 
        id: 'Web', name: 'ویجت چت سایت', icon: FaGlobe, color: 'text-indigo-500', bg: 'bg-indigo-50', border: 'border-indigo-200',
        gradient: 'from-indigo-400 to-violet-600',
        description: 'افزودن حباب چت اختصاصی به وب‌سایت شما'
    },
]

const Integrations = () => {
    const [connectedBots, setConnectedBots] = useState<ConnectedBot[]>(initialConnectedBots)
    
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null)
    const [botName, setBotName] = useState('')
    const [botToken, setBotToken] = useState('')
    const [isConnecting, setIsConnecting] = useState(false)

    const handleOpenConnectModal = (platform: Platform) => {
        setSelectedPlatform(platform)
        setBotName('')
        setBotToken('')
        setIsModalOpen(true)
    }

    const handleConnectBot = async () => {
        if (!botName.trim() || !botToken.trim()) {
            return toast.push(<Notification type="danger" title="خطا">لطفاً تمامی فیلدها را پر کنید.</Notification>, { placement: 'top-center' })
        }

        setIsConnecting(true)
        try {
            await new Promise(resolve => setTimeout(resolve, 1500))
            const newBot: ConnectedBot = {
                id: `bot-${Date.now()}`,
                name: botName,
                platform: selectedPlatform!,
                status: 'active',
                createdAt: 'همین الان'
            }
            setConnectedBots([...connectedBots, newBot])
            setIsModalOpen(false)
            toast.push(<Notification type="success" title="موفقیت‌آمیز">ربات با موفقیت متصل شد.</Notification>, { placement: 'top-center' })
        } catch (error) {
            toast.push(<Notification type="danger" title="خطای اتصال">توکن وارد شده نامعتبر است.</Notification>, { placement: 'top-center' })
        } finally {
            setIsConnecting(false)
        }
    }

    const handleRemoveBot = (botId: string) => {
        setConnectedBots(connectedBots.filter(b => b.id !== botId))
        toast.push(<Notification type="info" title="حذف شد">ربات از سیستم قطع شد.</Notification>, { placement: 'top-center' })
    }

    const renderPlatformIcon = (platform: Platform, className: string = '') => {
        switch (platform) {
            case 'Telegram': return <FaTelegramPlane className={`text-sky-500 ${className}`} />
            case 'Instagram': return <FaInstagram className={`text-pink-600 ${className}`} />
            case 'WhatsApp': return <FaWhatsapp className={`text-green-500 ${className}`} />
            case 'Web': return <FaGlobe className={`text-indigo-500 ${className}`} />
        }
    }

    const activePlatformData = availablePlatforms.find(p => p.id === selectedPlatform)

    return (
        <div className="flex flex-col gap-8 w-full h-full pb-8 animate-[fadeIn_0.3s_ease-out]" dir="rtl">
            
            <div className="flex flex-col gap-1">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">اتصال کانال‌ها</h3>
                <p className="text-sm text-gray-500">پلتفرم‌های پیام‌رسان خود را متصل کنید تا پاسخگویی یکپارچه آغاز شود.</p>
            </div>

            {/* بخش کانال‌های متصل‌شده */}
            <div className="flex flex-col gap-4">
                <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                    <HiOutlineCheckCircle className="text-emerald-500 text-xl" />
                    کانال‌های متصل‌شده
                </h4>
                
                {connectedBots.length === 0 ? (
                    <div className="p-8 border border-dashed border-gray-300 dark:border-gray-700 rounded-2xl bg-gray-50/50 dark:bg-gray-800/30 flex flex-col items-center justify-center text-center">
                        <span className="text-gray-400 text-sm">هنوز هیچ کانالی به سیستم متصل نشده است.</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {connectedBots.map(bot => (
                            <Card key={bot.id} className="border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center border border-gray-100 dark:border-gray-700">
                                            {renderPlatformIcon(bot.platform, 'text-2xl')}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-800 dark:text-gray-100">{bot.name}</span>
                                            <span className="text-xs text-gray-500">{bot.platform} • متصل از: {bot.createdAt}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-3">
                                        <span className="flex items-center gap-1 text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                            آنلاین
                                        </span>
                                        <button onClick={() => handleRemoveBot(bot.id)} className="text-gray-400 hover:text-red-500 transition-colors" title="حذف اتصال">
                                            <HiOutlineTrash className="text-lg" />
                                        </button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            <hr className="border-gray-200 dark:border-gray-800" />

            {/* بخش پلتفرم‌های قابل اتصال */}
            <div className="flex flex-col gap-4">
                <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                    <HiOutlinePlus className="text-indigo-500 text-xl" />
                    افزودن کانال جدید
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {availablePlatforms.map((platform) => (
                        <div 
                            key={platform.id}
                            className="group flex flex-col items-center justify-center p-6 border-2 border-gray-100 dark:border-gray-800 rounded-3xl bg-white dark:bg-gray-900 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all cursor-pointer hover:-translate-y-1 shadow-sm hover:shadow-lg text-center"
                            onClick={() => handleOpenConnectModal(platform.id as Platform)}
                        >
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${platform.bg} group-hover:scale-110 transition-transform duration-300`}>
                                <platform.icon className={`text-4xl ${platform.color}`} />
                            </div>
                            <h5 className="font-bold text-gray-800 dark:text-gray-100 mb-2">{platform.name}</h5>
                            <p className="text-xs text-gray-500 leading-relaxed min-h-[40px]">{platform.description}</p>
                            <Button size="sm" variant="plain" className="mt-4 text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                                اتصال به سیستم
                            </Button>
                        </div>
                    ))}
                </div>
            </div>

            <Dialog
                isOpen={isModalOpen}
                onClose={() => !isConnecting && setIsModalOpen(false)}
                closable={false} // حذف دکمه ضربدر پیش‌فرض و زشت کادر برای جایگزینی با مدل سفارشی
                width={480}
                contentClassName="p-0 border-0 overflow-hidden bg-white dark:bg-gray-900 shadow-2xl rounded-3xl"
            >
                {activePlatformData && (
                    <div className="flex flex-col relative w-full">
                        
                        {/* 🌟 بنر گرادیانت برند */}
                        <div className={`h-36 w-full bg-gradient-to-br ${activePlatformData.gradient} relative overflow-hidden`}>
                            <div className="absolute inset-0 bg-black/10 mix-blend-overlay"></div>
                            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/20 blur-3xl rounded-full"></div>
                            
                            {/* 🌟 دکمه بستن هوشمند، لمسی و شیشه‌ای در گوشه چپ بالا */}
                            <button 
                                type="button" 
                                onClick={() => setIsModalOpen(false)}
                                disabled={isConnecting}
                                className="absolute top-4 left-4 z-30 w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center backdrop-blur-md transition-all active:scale-95 border border-white/10 cursor-pointer"
                                title="بستن فرم"
                            >
                                <HiX className="text-base" />
                            </button>
                        </div>

                        {/* آیکون سه‌بعدی شناور */}
                        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 flex flex-col items-center z-10">
                            <div className="w-24 h-24 rounded-[1.5rem] bg-white dark:bg-gray-800 shadow-xl flex items-center justify-center p-1.5 border-4 border-white dark:border-gray-900">
                                <div className={`w-full h-full rounded-2xl flex items-center justify-center ${activePlatformData.bg}`}>
                                    <activePlatformData.icon className={`text-5xl ${activePlatformData.color}`} />
                                </div>
                            </div>
                        </div>

                        {/* بدنه اصلی فرم */}
                        <div className="pt-16 pb-6 px-8 flex flex-col">
                            
                            <div className="text-center mb-8">
                                <h4 className="text-2xl font-black text-gray-800 dark:text-gray-100 mb-2">
                                    اتصال {activePlatformData.name}
                                </h4>
                                <p className="text-sm text-gray-500">{activePlatformData.description}</p>
                            </div>

                            <div className="flex flex-col gap-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1">نام نمایشی (اختیاری)</label>
                                    <Input 
                                        placeholder="مثال: دستیار پشتیبانی اصلی" 
                                        value={botName}
                                        onChange={(e) => setBotName(e.target.value)}
                                        disabled={isConnecting}
                                        className="bg-gray-50 focus:bg-white transition-colors"
                                    />
                                </div>

                                {(selectedPlatform === 'Telegram' || selectedPlatform === 'WhatsApp') && (
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center justify-between ml-1">
                                            <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                                                {selectedPlatform === 'Telegram' ? 'توکن تلگرام (Bot Token)' : 'توکن دسترسی (Access Token)'}
                                            </label>
                                            <span className="flex items-center gap-1 text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">
                                                <HiOutlineLockClosed /> اتصال رمزنگاری‌شده
                                            </span>
                                        </div>
                                        <Input 
                                            type="password"
                                            placeholder="123456:ABC-DEF1234ghIkl-zyx..." 
                                            value={botToken}
                                            onChange={(e) => setBotToken(e.target.value)}
                                            suffix={<HiOutlineKey className="text-gray-400 text-lg" />}
                                            disabled={isConnecting}
                                            dir="ltr"
                                            className="bg-gray-50 focus:bg-white tracking-widest font-mono text-sm"
                                        />
                                    </div>
                                )}

                                <div className="bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800/30 rounded-2xl p-4 flex gap-3 text-xs text-indigo-800 dark:text-indigo-300 mt-2">
                                    <HiOutlineInformationCircle className="text-xl flex-shrink-0" />
                                    <div className="leading-loose">
                                        {selectedPlatform === 'Telegram' && (
                                            <span>توکن را از ربات <a href="https://t.me/BotFather" target="_blank" rel="noreferrer" className="font-bold underline text-indigo-600">BotFather</a> دریافت کنید و مطمئن شوید ربات شما ادمین کانال/گروه است.</span>
                                        )}
                                        {selectedPlatform === 'WhatsApp' && (
                                            <span>نیاز به توکن دائمی از داشبورد Meta دارید. شماره نباید روی واتس‌اپ شخصی فعال باشد.</span>
                                        )}
                                        {selectedPlatform === 'Instagram' && (
                                            <span>حساب شما باید Business یا Creator باشد و به صفحه فیس‌بوک متصل شده باشد.</span>
                                        )}
                                        {selectedPlatform === 'Web' && (
                                            <span>کد تولید شده را باید قبل از بسته شدن تگ <code>&lt;/body&gt;</code> سایت قرار دهید.</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 🌟 دکمه‌های اکشن پایینی بازطراحی‌شده با نسبت طلایی نامتقارن */}
                        <div className="px-8 pb-8 flex gap-3">
                            <Button 
                                type="button" 
                                className="flex-1 h-12 rounded-xl font-bold text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-200 border-transparent dark:hover:bg-gray-700 transition-colors"
                                onClick={() => setIsModalOpen(false)}
                                disabled={isConnecting}
                            >
                                انصراف
                            </Button>
                            <Button 
                                variant="solid" 
                                className="flex-[2] bg-gray-900 hover:bg-black dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-bold text-sm h-12" 
                                loading={isConnecting}
                                onClick={handleConnectBot}
                            >
                                اعتبارسنجی و اتصال
                            </Button>
                        </div>
                    </div>
                )}
            </Dialog>

            <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
        </div>
    )
}

export default Integrations