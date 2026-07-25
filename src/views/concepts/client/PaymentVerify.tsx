import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { apiVerifyPayment } from '@/services/BillingService'

const PaymentVerify = () => {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading')
    const [message, setMessage] = useState('در حال ارتباط با سرور و استعلام...')
    const [refId, setRefId] = useState<string | null>(null)
    
    // استخراج دقیق روز، ماه و سال برای نمایش بسیار بزرگ (مشابه تصویر)
    const [dateInfo] = useState(() => {
        const now = new Date();
        const day = new Intl.DateTimeFormat('fa-IR', { day: '2-digit' }).format(now);
        const month = new Intl.DateTimeFormat('fa-IR', { month: 'long' }).format(now);
        const year = new Intl.DateTimeFormat('fa-IR', { year: 'numeric' }).format(now);
        const time = new Intl.DateTimeFormat('fa-IR', { hour: '2-digit', minute: '2-digit' }).format(now);
        return { day, month, year, time, full: now.toISOString() };
    })

    const hasRequested = useRef(false)

    useEffect(() => {
        const authority = searchParams.get('Authority')

        if (!authority) {
            setStatus('failed')
            setMessage('شناسه پرداخت (Authority) در آدرس یافت نشد.')
            return
        }

        if (!hasRequested.current) {
            hasRequested.current = true
            verifyTransaction(authority)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const verifyTransaction = async (authority: string) => {
        try {
            const res = await apiVerifyPayment({ authority })
            
            if (res && res.isSuccess) {
                setStatus('success')
                setMessage(res.message)
                setRefId(res.referenceNumber || null)
            } else {
                setStatus('failed')
                setMessage(res?.message || 'تراکنش ناموفق بود.')
            }
        } catch (error: any) {
            setStatus('failed')
            setMessage(error.response?.data?.message || 'خطای ارتباط با درگاه پرداخت.')
        }
    }

    // انتقال کاملاً خاموش به داشبورد بعد از ۱۰ ثانیه
    useEffect(() => {
        if (status === 'success' || status === 'failed') {
            const timer = setTimeout(() => navigate('/dashboard'), 15000)
            return () => clearTimeout(timer)
        }
    }, [status, navigate])

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50/80 font-sans" dir="rtl">
            
            {/* بدنه اصلی بلیت افقی */}
            <div className="relative flex flex-col md:flex-row w-full max-w-[850px] bg-white shadow-xl rounded-lg overflow-hidden text-gray-900 border border-gray-200">
                
                {/* خط رنگی بالای بلیت (Accent Line) */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-[#8b1c1c]"></div>

                {/* === بخش اصلی بلیت (سمت راست) === */}
                <div className="flex-1 p-8 md:pr-10 relative">
                    
                    {/* حاشیه خطی تزئینی داخلی */}
                    <div className="absolute top-3 left-0 right-3 bottom-3 border border-gray-200 rounded-sm pointer-events-none hidden md:block"></div>

                    {/* هدر */}
                    <div className="flex justify-between items-start border-b-2 border-gray-100 pb-3 mb-6 relative z-10">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-extrabold text-[#8b1c1c] tracking-tight">
                                ANYBOT <span className="text-xl md:text-2xl text-gray-700 font-bold">- SUBSCRIPTION</span>
                            </h1>
                        </div>
                        <div className="text-left text-gray-500 hidden md:block">
                            <span className="block text-[10px] uppercase tracking-widest font-bold">Ticket Number</span>
                            <span className="text-sm font-mono font-bold text-gray-800">{refId || 'N/A'}</span>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-8 relative z-10">
                        
                        {/* تاریخ بزرگ و برجسته (مشابه عکس) */}
                        <div className="flex flex-col items-center md:items-start text-[#8b1c1c] min-w-[140px]">
                            <span className="text-7xl font-black leading-none tracking-tighter">{dateInfo.day}</span>
                            <span className="text-3xl font-extrabold uppercase mt-1">{dateInfo.month}</span>
                            <span className="text-4xl font-bold text-gray-800 tracking-wider mt-1">{dateInfo.year}</span>
                        </div>

                        {/* اطلاعات تراکنش */}
                        <div className="flex-1 flex flex-col justify-center space-y-5 border-r-2 border-gray-100 pr-6">
                            
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Status / وضعیت تراکنش</span>
                                {status === 'loading' && <span className="text-xl font-bold text-gray-500 animate-pulse">در حال استعلام...</span>}
                                {status === 'success' && <span className="text-2xl font-black text-green-700">پرداخت تأیید شد</span>}
                                {status === 'failed' && <span className="text-2xl font-black text-[#8b1c1c]">پرداخت رد شد</span>}
                            </div>

                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Time & Message / زمان و پیام</span>
                                <span className="text-lg font-bold text-gray-700">
                                    ساعت {dateInfo.time} — {message}
                                </span>
                            </div>

                        </div>
                    </div>

                    {/* بخش خریداری شده توسط (مشابه عکس) */}
                    <div className="mt-10 pt-4 border-t-2 border-gray-100 relative z-10">
                        <span className="text-sm font-bold text-gray-600 tracking-wider uppercase">
                            PURCHASED BY: <span className="text-[#8b1c1c]">MEHRDAD</span>
                        </span>
                    </div>

                </div>

                {/* === پرفراژ (خط‌چین عمودی بین دو تکه بلیت) === */}
                <div className="hidden md:flex flex-col justify-between items-center w-8 relative bg-white z-20">
                    <div className="absolute top-0 -mt-3 w-6 h-6 bg-gray-50 rounded-full border border-gray-200 shadow-inner"></div>
                    <div className="h-full w-full border-l-[3px] border-dashed border-gray-300 my-4"></div>
                    <div className="absolute bottom-0 -mb-3 w-6 h-6 bg-gray-50 rounded-full border border-gray-200 shadow-inner"></div>
                </div>

                {/* === ته‌چک بلیت (سمت چپ) === */}
                <div className="w-full md:w-48 bg-gray-50 p-6 flex flex-col items-center justify-center relative border-r border-gray-200 md:border-none">
                    
                    {/* حاشیه خطی تزئینی داخلی ته‌چک */}
                    <div className="absolute top-3 right-0 left-3 bottom-3 border border-gray-200 rounded-sm pointer-events-none hidden md:block"></div>

                    <div className="text-center md:transform md:-rotate-90 md:w-48 flex flex-col items-center relative z-10">
                        
                        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3">
                            AUTHORITY CODE
                        </span>
                        
                        {/* بارکد کلاسیک */}
                        <div 
                            className="h-16 md:h-20 w-full md:w-32 opacity-80" 
                            style={{ 
                                backgroundImage: 'repeating-linear-gradient(90deg, #1f2937 0, #1f2937 2px, transparent 2px, transparent 4px, #1f2937 4px, #1f2937 5px, transparent 5px, transparent 8px, #1f2937 8px, #1f2937 12px, transparent 12px, transparent 14px)' 
                            }}
                        ></div>
                        
                        <span className="mt-3 text-xs font-mono font-bold text-gray-800 tracking-widest bg-white px-2 py-1 border border-gray-200 rounded">
                            {refId ? refId.substring(0, 10).toUpperCase() : 'PENDING'}
                        </span>
                    </div>

                    {/* نمایش وضعیت کوچک در ته‌چک */}
                    <div className="absolute bottom-6 left-0 right-0 text-center hidden md:block">
                         {status === 'success' && <span className="text-xs font-bold text-green-700 uppercase tracking-widest">VALID</span>}
                         {status === 'failed' && <span className="text-xs font-bold text-[#8b1c1c] uppercase tracking-widest">VOID</span>}
                    </div>
                </div>

            </div>
            
        </div>
    )
}

export default PaymentVerify