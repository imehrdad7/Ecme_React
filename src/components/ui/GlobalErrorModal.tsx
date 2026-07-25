import { useGlobalErrorModal } from '@/store/modalStore'

const GlobalErrorModal = () => {
    const { isOpen, title, message, closeModal } = useGlobalErrorModal()

    if (!isOpen) return null

    const handleRedirect = () => {
        closeModal()
        window.location.href = '/concepts/Pricing'
    }

    return (
        // پس‌زمینه مات و تاریک
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm transition-all">
            
            {/* کارت اصلی مودال */}
            <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(220,38,38,0.3)] overflow-hidden border border-red-100 dark:border-red-900/30 animate-in zoom-in-95 fade-in duration-300">
                
                {/* افکت نوری در پس‌زمینه کارت */}
                <div className="absolute -top-24 -right-24 w-56 h-56 bg-red-500/20 blur-[50px] rounded-full pointer-events-none"></div>

                <div className="p-8 text-center sm:p-10 z-10 relative">
                    
                    {/* آیکون هشدار با طراحی مدرن */}
                    <div className="mx-auto w-24 h-24 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center mb-6 shadow-inner border-8 border-white dark:border-gray-800">
                        <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>

                    {/* متون مودال */}
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">
                        {title}
                    </h3>
                    <p className="text-base font-medium text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
                        {message}
                    </p>

                    {/* دکمه‌های اکشن */}
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={handleRedirect}
                            className="w-full px-6 py-4 rounded-2xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-bold text-lg shadow-lg shadow-red-500/30 transition-all active:scale-95"
                        >
                            مشاهده پلن‌ها و تمدید
                        </button>
                        <button
                            onClick={closeModal}
                            className="w-full px-6 py-4 rounded-2xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold text-base transition-all active:scale-95"
                        >
                            بعداً یادآوری کن
                        </button>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default GlobalErrorModal