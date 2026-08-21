import { useState, useRef, useEffect } from 'react'
import { HiOutlineCalendar, HiOutlinePaperAirplane, HiOutlineClock } from 'react-icons/hi'
import Button from '@/components/ui/Button'

type Props = {
    onTimingChange: (finalDate: string | null) => void;
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
const CURRENT_YEAR = 1403; const CURRENT_MONTH_INDEX = 4; const CURRENT_DAY = 17;

const TimingCard = ({ onTimingChange }: Props) => {
    const [sendTiming, setSendTiming] = useState<'now' | 'scheduled'>('now')
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

    // هر بار تغییری رخ داد، تاریخ نهایی محاسبه و به کامپوننت اصلی فرستاده می‌شود
    useEffect(() => {
        if (sendTiming === 'now') {
            onTimingChange(null);
        } else {
            const gDate = jalaliToGregorian(scheduleYear, scheduleMonth + 1, scheduleDay);
            gDate.setHours(parseInt(scheduleHour, 10));
            gDate.setMinutes(parseInt(scheduleMinute, 10));
            onTimingChange(gDate.toISOString());
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sendTiming, scheduleYear, scheduleMonth, scheduleDay, scheduleHour, scheduleMinute])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) setIsPickerOpen(false)
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <div className="p-4 sm:p-5 flex flex-col gap-4 bg-gray-50/50 dark:bg-gray-800/20 h-full">
            <div className="flex items-center gap-3 border-b border-gray-200 dark:border-gray-700 pb-3">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-bold text-xs">۳</span>
                <h4 className="text-base font-bold text-gray-800 dark:text-gray-100">زمان اجرا</h4>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
                <div onClick={() => setSendTiming('now')} className={`flex flex-col items-center justify-center p-3 border-2 rounded-2xl cursor-pointer transition-all ${sendTiming === 'now' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-sm transform -translate-y-0.5' : 'border-gray-100 dark:border-gray-700 hover:border-gray-300'}`}>
                    <HiOutlinePaperAirplane className={`text-xl mb-1.5 ${sendTiming === 'now' ? 'text-indigo-600' : 'text-gray-400'}`} />
                    <span className={`text-[13px] font-bold ${sendTiming === 'now' ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-400'}`}>ارسال فوری</span>
                </div>
                <div onClick={() => setSendTiming('scheduled')} className={`flex flex-col items-center justify-center p-3 border-2 rounded-2xl cursor-pointer transition-all ${sendTiming === 'scheduled' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-sm transform -translate-y-0.5' : 'border-gray-100 dark:border-gray-700 hover:border-gray-300'}`}>
                    <HiOutlineCalendar className={`text-xl mb-1.5 ${sendTiming === 'scheduled' ? 'text-indigo-600' : 'text-gray-400'}`} />
                    <span className={`text-[13px] font-bold ${sendTiming === 'scheduled' ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-400'}`}>زمان‌بندی</span>
                </div>
            </div>

            {sendTiming === 'scheduled' && (
                <div className="mt-1 animate-[fadeIn_0.3s_ease-out] relative" ref={datePickerRef}>
                    <div onClick={() => setIsPickerOpen(!isPickerOpen)} className="w-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-3 flex justify-between items-center cursor-pointer hover:border-indigo-400 transition-colors shadow-sm">
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-800 dark:text-gray-200">
                            <div className="p-1 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg"><HiOutlineCalendar className="text-indigo-600 text-sm" /></div>
                            {scheduleDay} {jalaliMonths[scheduleMonth]}
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-800 dark:text-gray-200 border-r border-gray-200 dark:border-gray-700 pr-2">
                            <HiOutlineClock className="text-amber-500 text-base" />
                            {scheduleHour}:{scheduleMinute}
                        </div>
                    </div>

                    {isPickerOpen && (
                        <div className="absolute top-full right-0 mt-2 w-[280px] bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-3xl shadow-2xl z-50 p-4 animate-[fadeIn_0.2s_ease-out]">
                            <div className="flex justify-center gap-2 mb-3 pb-3 border-b border-gray-100 dark:border-gray-700">
                                {availableYears.map(year => (
                                    <button type="button" key={year} onClick={() => setScheduleYear(year)} className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors ${year === scheduleYear ? 'bg-indigo-600 text-white shadow-sm' : 'bg-gray-50 dark:bg-gray-900 text-gray-600 hover:bg-gray-100'}`}>سال {year}</button>
                                ))}
                            </div>
                            <div className="grid grid-cols-3 gap-1.5 mb-3">
                                {getAvailableMonths().map(month => (
                                    <button type="button" key={month.index} onClick={() => setScheduleMonth(month.index)} className={`py-1 rounded-xl text-[10px] font-bold transition-all border-2 ${month.index === scheduleMonth ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 border-indigo-500' : 'bg-transparent text-gray-600 border-transparent hover:bg-gray-50'}`}>{month.name}</button>
                                ))}
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-900/50 p-2 rounded-2xl">
                                <div className="grid grid-cols-7 gap-1">
                                    {getAvailableDays().map(day => (
                                        <button type="button" key={day} onClick={() => setScheduleDay(day)} className={`w-7 h-7 mx-auto rounded-full text-xs font-bold flex items-center justify-center transition-all ${day === scheduleDay ? 'bg-indigo-600 text-white shadow-sm transform scale-110' : 'text-gray-700 hover:bg-gray-200'}`}>{day}</button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center justify-center gap-3 mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                                <select value={scheduleHour} onChange={(e) => setScheduleHour(e.target.value)} className="bg-gray-50 dark:bg-gray-900 border-none rounded-xl text-lg font-black text-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none text-center px-2 py-1 cursor-pointer w-14 shadow-sm">
                                    {Array.from({length: 24}, (_, i) => String(i).padStart(2, '0')).map(h => <option key={h} value={h}>{h}</option>)}
                                </select>
                                <span className="text-lg font-black text-gray-300">:</span>
                                <select value={scheduleMinute} onChange={(e) => setScheduleMinute(e.target.value)} className="bg-gray-50 dark:bg-gray-900 border-none rounded-xl text-lg font-black text-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none text-center px-2 py-1 cursor-pointer w-14 shadow-sm">
                                    {Array.from({length: 60}, (_, i) => String(i).padStart(2, '0')).map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>
                            <Button type="button" size="sm" variant="solid" className="w-full mt-3 bg-indigo-600 text-xs font-bold rounded-xl" onClick={() => setIsPickerOpen(false)}>تایید</Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default TimingCard