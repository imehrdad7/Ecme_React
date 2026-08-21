import { HiCheckCircle } from 'react-icons/hi'
import { FaTelegramPlane, FaInstagram, FaWhatsapp, FaGlobe, FaCommentDots, FaCommentAlt, FaRobot } from 'react-icons/fa'

type Props = {
    bots: any[];
    isLoadingData: boolean;
    selectedBotId: string | null;
    setSelectedBotId: (val: string) => void;
}

const getPlatformDetails = (platformName: string) => {
    const name = platformName || '';
    switch (name.toLowerCase()) {
        case 'telegram': return { icon: FaTelegramPlane, color: 'text-sky-500', bg: 'bg-sky-50 dark:bg-sky-900/40' }
        case 'instagram': return { icon: FaInstagram, color: 'text-pink-600', bg: 'bg-pink-50 dark:bg-pink-900/40' }
        case 'whatsapp': return { icon: FaWhatsapp, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/40' }
        case 'web': return { icon: FaGlobe, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/40' }
        case 'rubika': return { icon: FaCommentDots, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/40' }
        case 'bale': return { icon: FaCommentAlt, color: 'text-teal-500', bg: 'bg-teal-50 dark:bg-teal-900/40' }
        default: return { icon: FaRobot, color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-800/40' }
    }
}

const SenderCard = ({ bots, isLoadingData, selectedBotId, setSelectedBotId }: Props) => {
    return (
        <div className="p-4 sm:p-5 flex flex-col gap-4 bg-gray-50/50 dark:bg-gray-800/20">
            <div className="flex items-center gap-3 border-b border-gray-200 dark:border-gray-700 pb-3">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-bold text-xs">۲</span>
                <h4 className="text-base font-bold text-gray-800 dark:text-gray-100">انتخاب فرستنده</h4>
            </div>
            
            <div className="flex flex-col gap-3">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">رباتی که پیام را ارسال می‌کند:</label>
                {isLoadingData ? (
                    <div className="text-sm text-gray-500 animate-pulse">در حال دریافت ربات‌ها...</div>
                ) : bots.length === 0 ? (
                    <div className="text-sm text-red-500">هیچ ربات فعالی برای ارسال یافت نشد.</div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                        {bots.map(bot => {
                            const isSelected = selectedBotId === bot.id;
                            const platformStr = bot.platformName || '';
                            const platform = getPlatformDetails(platformStr);
                            const PlatformIcon = platform.icon;
                            
                            return (
                                <div key={bot.id} onClick={() => setSelectedBotId(bot.id)} className={`flex flex-col gap-2 p-3 rounded-2xl border-2 cursor-pointer transition-all bg-white dark:bg-gray-900 ${isSelected ? 'border-indigo-500 shadow-sm transform -translate-y-0.5' : 'border-transparent shadow-sm hover:border-gray-300'}`}>
                                    <div className="flex items-center justify-between">
                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${platform.bg}`}><PlatformIcon className={`text-lg ${platform.color}`} /></div>
                                        {isSelected ? <HiCheckCircle className="text-indigo-500 text-xl" /> : <div className="w-4 h-4 rounded-full border-2 border-gray-200 dark:border-gray-600"></div>}
                                    </div>
                                    <div className="mt-1">
                                        <span className={`block text-sm font-bold ${isSelected ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-200'}`}>{bot.name}</span>
                                        <span className="text-[10px] text-gray-400 uppercase tracking-wider">{platformStr}</span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}

export default SenderCard