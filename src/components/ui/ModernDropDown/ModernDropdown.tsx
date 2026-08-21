import { useState, useRef, useEffect } from 'react';
import { HiChevronDown } from 'react-icons/hi';

interface Option {
    value: string | number;
    label: string | number;
}

interface ModernDropdownProps {
    value: string | number;
    options: Option[];
    onChange: (value: any) => void;
    className?: string;
    align?: 'right' | 'center'; // 🌟 این پراپ جدید اضافه شد
}

const ModernDropdown = ({ value, options, onChange, className = '', align = 'center' }: ModernDropdownProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find(opt => opt.value === value);

    return (
        <div className={`relative ${className}`} ref={dropdownRef} dir="rtl">
            {/* دکمه اصلی */}
            <div 
                onClick={() => setIsOpen(!isOpen)}
                // 🌟 تراز دکمه بر اساس پراپ align داینامیک شد
                className={`flex items-center w-full bg-transparent border-none text-base font-bold text-gray-800 dark:text-gray-100 py-2 px-3 cursor-pointer transition-all rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/50 ${isOpen ? 'bg-gray-100 dark:bg-gray-700/50 ring-2 ring-indigo-500/20' : ''} ${align === 'right' ? 'justify-between' : 'justify-center gap-1.5'}`}
            >
                <span className={`tracking-wider truncate ${align === 'right' ? 'ml-2 text-right' : 'text-center'}`}>
                    {selectedOption?.label}
                </span>
                <HiChevronDown className={`text-gray-400 text-lg flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-indigo-500' : ''}`} />
            </div>

            {/* لیست بازشو */}
            <div className={`absolute top-full left-0 right-0 mt-2 min-w-[120px] max-h-56 overflow-y-auto bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-black/50 border border-gray-100 dark:border-gray-700 z-50 custom-scrollbar transition-all duration-200 origin-top ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
                <div className="p-1.5 flex flex-col gap-0.5">
                    {options.map((opt) => {
                        const isSelected = value === opt.value;
                        return (
                            <div 
                                key={opt.value}
                                onClick={() => { onChange(opt.value); setIsOpen(false); }}
                                // 🌟 تراز آیتم‌های لیست هم داینامیک شد
                                className={`px-4 py-2.5 cursor-pointer text-sm font-bold rounded-xl transition-all truncate ${align === 'right' ? 'text-right' : 'text-center'} ${
                                    isSelected 
                                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400' 
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                }`}
                            >
                                {opt.label}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
};

export default ModernDropdown;