import { useState, useRef, useEffect } from 'react'
import { HiOutlineUsers, HiOutlineCalendar, HiOutlinePaperAirplane, HiOutlineClock } from 'react-icons/hi'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

type Props = {
    onSubmit: (finalScheduledAt: string | null, setSubmitting: (val: boolean) => void) => void;
}

const jalaliToGregorian = (jy: number, jm: number, jd: number) => { 
    const jDaysInMonth = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];
    let gy = jy + 621; let days = 0;
    for (let i = 0; i < jm - 1; i++) days += jDaysInMonth[i];
    days += jd;
    let leapYear = (gy % 4 === 0 && gy % 100 !== 0) || (gy % 400 === 0);
    const gDaysInMonth = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    let gm = 0, gd = 0; let remain = days + 79;
    if (remain > (leapYear ? 366 : 365)) { remain -= (leapYear ? 366 : 365); gy++; }
    for (let i = 0; i < 12; i++) { if (remain <= gDaysInMonth[i]) { gm = i + 1; gd = remain; break; } remain -= gDaysInMonth[i]; }
    return new Date(gy, gm - 1, gd);
}

const jalaliMonths = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند']
const CURRENT_YEAR = 1403
const CURRENT_MONTH_INDEX = 4 
const CURRENT_DAY = 17

const SidebarActions = ({ onSubmit }: Props) => {
    const [sendTiming, setSendTiming] = useState<'now' | 'scheduled'>('now')
    const [isSubmitting, setIsSubmitting] = useState(false)
    
    const [isPickerOpen, setIsPickerOpen] = useState<boolean>(false)
    const [scheduleYear, setScheduleYear] = useState<number>(CURRENT_YEAR)
    const [scheduleMonth, setScheduleMonth] = useState<number>(CURRENT_MONTH_INDEX)
    const [scheduleDay, setScheduleDay] = useState<number>(CURRENT_DAY)
    const [scheduleHour, setScheduleHour] = useState<string>('10')
    const [scheduleMinute, setScheduleMinute] = useState<string>('30')
    const datePickerRef = useRef<HTMLDivElement>(null)

    const availableYears = [CURRENT_YEAR, CURRENT_YEAR + 1]
    const getAvailableMonths = () => jalaliMonths.map((name, index) => ({ name, index })).filter(m => scheduleYear === CURRENT_YEAR ? m.index >= CURRENT_MONTH_INDEX : true)
    const getDaysInMonth = (monthIndex: number) => monthIndex <= 5 ? 31 : (monthIndex <= 10 ? 30 : 29)
    const getAvailableDays = () => {
        const totalDays = getDaysInMonth(scheduleMonth)
        return Array.from({ length: totalDays }, (_, i) => i + 1).filter(d => (scheduleYear === CURRENT_YEAR && scheduleMonth === CURRENT_MONTH_INDEX) ? d >= CURRENT_DAY : true)
    }

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) setIsPickerOpen(false)
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleSubmitClick = () => {
        let finalScheduledAt = null;
        if (sendTiming === 'scheduled') {
            const gDate = jalaliToGregorian(scheduleYear, scheduleMonth + 1, scheduleDay);
            gDate.setHours(parseInt(scheduleHour, 10));
            gDate.setMinutes(parseInt(scheduleMinute, 10));
            finalScheduledAt = gDate.toISOString();
        }
        onSubmit(finalScheduledAt, setIsSubmitting);
    }

    return (
        <div className="w-full lg:w-[350px] xl:w-[420px] flex flex-col gap-5 self-start sticky top-24">
            
            <Card className="bg-gradient-to-br from-indigo-600 to-blue-700 border-0 text-white shadow-md relative overflow-hidden rounded-3xl">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="flex items-center gap-4 mb-3 relative z-10">
                    <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md"><HiOutlineUsers className="text-xl" /></div>
                    <div><h4 className="font-bold text-base">مخاطبین هدف</h4></div>
                </div>
                <div className="relative z-10 bg-black/20 p-3.5 rounded-2xl">
                    <p className="text-sm leading-relaxed opacity-90">
                        فیلتر کردن و انتخاب دقیق مخاطبین در <strong>مرحله بعد</strong> انجام می‌شود.
                    </p>
                </div>
            </Card>

            <Card className="border-gray-200 dark:border-gray-700 flex flex-col gap-5 rounded-3xl shadow-sm">
                <div className="flex flex-col gap-4">
                    <h4 className="text-base font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                        <HiOutlineClock className="text-indigo-500 text-xl" /> تعیین زمان اجرا
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-3">
                        <div onClick={() => setSendTiming('now')} className={`flex flex-col items-center justify-center p-3 border-2 rounded-2xl cursor-pointer transition-all ${sendTiming === 'now' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-sm' : 'border-gray-100 dark:border-gray-700 hover:border-gray-300'}`}>
                            <HiOutlinePaperAirplane className={`text-xl mb-1.5 ${sendTiming === 'now' ? 'text-indigo-600' : 'text-gray-400'}`} />
                            <span className={`text-sm font-bold ${sendTiming === 'now' ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-400'}`}>ارسال فوری</span>
                        </div>
                        <div onClick={() => setSendTiming('scheduled')} className={`flex flex-col items-center justify-center p-3 border-2 rounded-2xl cursor-pointer transition-all ${sendTiming === 'scheduled' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-sm' : 'border-gray-100 dark:border-gray-700 hover:border-gray-300'}`}>
                            <HiOutlineCalendar className={`text-xl mb-1.5 ${sendTiming === 'scheduled' ? 'text-indigo-600' : 'text-gray-400'}`} />
                            <span className={`text-sm font-bold ${sendTiming === 'scheduled' ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-400'}`}>زمان‌بندی آینده</span>
                        </div>
                    </div>

                    {sendTiming === 'scheduled' && (
                        <div className="mt-1 animate-[fadeIn_0.3s_ease-out] relative" ref={datePickerRef}>
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 block">انتخاب دقیق زمان</label>
                            <div onClick={() => setIsPickerOpen(!isPickerOpen)} className="w-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-3 flex justify-between items-center cursor-pointer hover:border-indigo-400 transition-colors shadow-sm">
                                <div className="flex items-center gap-2.5 text-sm font-bold text-gray-800 dark:text-gray-200">
                                    <div className="p-1 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg"><HiOutlineCalendar className="text-indigo-600 text-base" /></div>
                                    {scheduleDay.toLocaleString('fa-IR')} {jalaliMonths[scheduleMonth]} {scheduleYear.toLocaleString('fa-IR')}
                                </div>
                                <div className="flex items-center gap-2.5 text-sm font-bold text-gray-800 dark:text-gray-200 border-r border-gray-200 dark:border-gray-700 pr-3">
                                    <HiOutlineClock className="text-amber-500 text-lg" />
                                    {scheduleHour}:{scheduleMinute}
                                </div>
                            </div>

                            {isPickerOpen && (
                                <div className="absolute top-full right-0 mt-2 w-full bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-3xl shadow-xl z-50 p-5 animate-[fadeIn_0.2s_ease-out]">
                                    <div className="flex justify-center gap-2 mb-4 pb-4 border-b border-gray-100 dark:border-gray-700">
                                        {availableYears.map(year => (
                                            <button type="button" key={year} onClick={() => setScheduleYear(year)} className={`px-4 py-1.5 rounded-xl text-sm font-bold transition-colors ${year === scheduleYear ? 'bg-indigo-600 text-white shadow-sm' : 'bg-gray-50 dark:bg-gray-900 text-gray-600 hover:bg-gray-100'}`}>سال {year.toLocaleString('fa-IR')}</button>
                                        ))}
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 mb-4">
                                        {getAvailableMonths().map(month => (
                                            <button type="button" key={month.index} onClick={() => setScheduleMonth(month.index)} className={`py-1.5 rounded-xl text-xs font-bold transition-all border-2 ${month.index === scheduleMonth ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border-indigo-500' : 'bg-transparent text-gray-600 dark:text-gray-400 border-transparent hover:bg-gray-50 dark:hover:bg-gray-700'}`}>{month.name}</button>
                                        ))}
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-2xl">
                                        <div className="grid grid-cols-7 gap-1">
                                            {getAvailableDays().map(day => (
                                                <button type="button" key={day} onClick={() => setScheduleDay(day)} className={`w-8 h-8 mx-auto rounded-full text-sm font-bold flex items-center justify-center transition-all ${day === scheduleDay ? 'bg-indigo-600 text-white shadow-sm transform scale-110' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>{day.toLocaleString('fa-IR')}</button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                                        <div className="flex flex-col items-center gap-1">
                                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">ساعت</span>
                                            <select value={scheduleHour} onChange={(e) => setScheduleHour(e.target.value)} className="bg-gray-50 dark:bg-gray-900 border-none rounded-xl text-xl font-black text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 outline-none text-center appearance-none px-3 py-1 cursor-pointer w-16 shadow-sm">
                                                {Array.from({length: 24}, (_, i) => String(i).padStart(2, '0')).map(h => <option key={h} value={h}>{h}</option>)}
                                            </select>
                                        </div>
                                        <span className="text-xl font-black text-gray-300 dark:text-gray-600 mb-1">:</span>
                                        <div className="flex flex-col items-center gap-1">
                                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">دقیقه</span>
                                            <select value={scheduleMinute} onChange={(e) => setScheduleMinute(e.target.value)} className="bg-gray-50 dark:bg-gray-900 border-none rounded-xl text-xl font-black text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 outline-none text-center appearance-none px-3 py-1 cursor-pointer w-16 shadow-sm">
                                                {Array.from({length: 60}, (_, i) => String(i).padStart(2, '0')).map(m => <option key={m} value={m}>{m}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <Button type="button" size="sm" variant="solid" className="w-full mt-4 bg-indigo-600 text-sm font-bold rounded-xl" onClick={() => setIsPickerOpen(false)}>تایید زمان</Button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <Button variant="solid" size="lg" className="w-full bg-gray-900 hover:bg-black dark:bg-white dark:text-gray-900 font-bold shadow-md rounded-2xl h-12 text-sm" loading={isSubmitting} onClick={handleSubmitClick}>
                    ثبت و رفتن به مرحله بعد
                </Button>
            </Card>
        </div>
    )
}

export default SidebarActions