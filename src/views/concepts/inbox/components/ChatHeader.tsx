import React, { useRef, useEffect , useState} from 'react';
import { FaRobot } from 'react-icons/fa';
import { 
    HiDotsVertical, 
    HiOutlineCheckCircle, 
    HiOutlineIdentification, 
    HiOutlineSearch,
    HiX,
    HiOutlineChevronUp,
    HiOutlineChevronDown,
    HiArrowRight
} from 'react-icons/hi';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import { Conversation } from '../types';

interface ChatHeaderProps {
    activeChat: Conversation & { platform?: string; status?: number };
    avatarLetter: string;
    userName: string;
    isGroup: boolean;
    groupName?: string;
    isUnassigned: boolean;
    isAssignedToMe: boolean;
    isAssignedToOther: boolean;
    isInfoOpen: boolean;
    onToggleInfo: () => void;
    onCloseConversation: () => void;
    onEndConversationClick: () => void;
    onOpenListModal?: () => void;
    onBackToList?: () => void;
    isSearchMode: boolean;
    setIsSearchMode: (val: boolean) => void;
    searchTerm: string;
    setSearchTerm: (val: string) => void;
    onSearchSubmit: (e: React.FormEvent) => void;
    searchResultsCount: number;
    currentSearchIndex: number;
    onNextResult: () => void;
    onPrevResult: () => void;
    onCloseSearch: () => void;
    isSearching: boolean;
    hasSearched: boolean;
}

export const ChatHeader = ({
    activeChat,
    avatarLetter,
    userName,
    isGroup,
    groupName,
    isUnassigned,
    isAssignedToMe,
    isAssignedToOther,
    isInfoOpen,
    onToggleInfo,
    onCloseConversation,
    onEndConversationClick,
    onOpenListModal,
    isSearchMode,
    setIsSearchMode,
    searchTerm,
    setSearchTerm,
    onSearchSubmit,
    searchResultsCount,
    currentSearchIndex,
    onNextResult,
    onPrevResult,
    onCloseSearch,
    isSearching,
    hasSearched,
    onBackToList
}: ChatHeaderProps) => {
    
    const isEnded = activeChat?.status !== 1;
    const searchInputRef = useRef<HTMLInputElement>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (isSearchMode && searchInputRef.current) {
            // یک تاخیر خیلی کوتاه (۵۰ میلی‌ثانیه) می‌دیم تا انیمیشن شروع بشه بعد فوکوس کنه
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 50);
        }
    }, [isSearchMode]);

  return (
        // 🌟 کلمه relative به این دیو اصلی اضافه شد تا فرزندان absolute از آن بیرون نزنند
        <div className="px-4 py-2.5 mx-3 mt-3 mb-1 sm:mx-4 sm:mt-4 sm:mb-2 rounded-[28px] sm:rounded-full bg-white/60 dark:bg-[#1c242f]/60 backdrop-blur-xl backdrop-saturate-150 shadow-[0_8px_32px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-white/50 dark:border-white/10 flex items-center justify-between z-20 sticky top-3 sm:top-4 h-[68px] relative">
            
            {/* ======================================= */}
            {/* ۱. بخش اطلاعات کاربر (پروفایل و دکمه‌ها) */}
            {/* ======================================= */}
            <div 
                className={`flex items-center justify-between w-full transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                    isSearchMode 
                    ? 'opacity-0 translate-x-20 pointer-events-none absolute' // در حالت سرچ: پرتاب به راست و محو شدن
                    : 'opacity-100 translate-x-0' // در حالت عادی: سر جای خود
                }`}
            >
                <div className="flex items-center gap-2 sm:gap-3">
                    {onBackToList && (
                        <button 
                            onClick={onBackToList} 
                            className="md:hidden shrink-0 p-1.5 sm:p-2 -mr-1 sm:-mr-2 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-full transition-colors flex items-center justify-center"
                        >
                            <HiArrowRight className="text-[22px]" />
                        </button>
                    )}
                    <Avatar size={44} shape="circle" className="bg-[#edf2ff] text-[#3b82f6] font-bold text-lg shadow-sm">
                        {avatarLetter}
                    </Avatar>
                    
                    <div className="flex flex-col justify-center">
                        <h4 className="text-[16px] font-black text-gray-800 dark:text-gray-100 leading-tight">
                            {userName}
                        </h4>
                        <div className="flex items-center gap-1 mt-0.5 text-[11.5px] font-bold text-gray-500 dark:text-gray-400">
                            {isGroup && (
                                <>
                                    <span className="text-gray-400 dark:text-gray-500">در</span>
                                    <span dir="auto" className="text-slate-600 dark:text-slate-300 max-w-[150px] sm:max-w-[250px] truncate">
                                        "{groupName}"
                                    </span>
                                    <span className="mx-1 opacity-40">•</span>
                                </>
                            )}
                            <span className="capitalize">ورودی از {activeChat?.platform || 'نامشخص'}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                    {isEnded === false && (
                        <>
                            {isUnassigned && (
                                <span className="hidden sm:flex items-center gap-1.5 text-[12px] font-bold bg-teal-50 text-teal-600 px-3 py-1.5 rounded-full border border-teal-100 dark:bg-teal-900/30 dark:border-teal-800/40 shadow-sm">
                                    <FaRobot className="text-sm" /> کنترل توسط ربات
                                </span>
                            )}
                            
                           {isAssignedToMe && (
                                <>
                                    {/* ============================== */}
                                    {/* 🌟 حالت دسکتاپ: دکمه‌های معمولی (در موبایل مخفی می‌شوند) */}
                                    {/* ============================== */}
                                    <div className="hidden md:flex items-center gap-2">
                                        <Button 
                                            onClick={onCloseConversation} 
                                            className="bg-[#f59e0b] hover:bg-[#d97706] text-white border-transparent rounded-full px-4 py-1.5 text-[12px] font-extrabold shadow-sm h-9 transition-colors"
                                        >
                                            بازگشت به ربات
                                        </Button>
                                        <Button 
                                            onClick={onEndConversationClick} 
                                            className="bg-[#dc2626] hover:bg-[#b91c1c] text-white border-transparent rounded-full px-4 py-1.5 text-[12px] font-extrabold shadow-sm h-9 flex items-center gap-1.5 transition-colors"
                                        >
                                            <HiOutlineCheckCircle className="text-[16px]" />
                                            <span>پایان مکالمه</span>
                                        </Button>
                                    </div>

                                    {/* ============================== */}
                                    {/* 🌟 حالت موبایل: منوی سه نقطه (در دسکتاپ مخفی می‌شود) */}
                                    {/* ============================== */}
                                    <div className="relative md:hidden">
                                        <button 
                                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                            className="p-1.5 sm:p-2 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors flex items-center justify-center"
                                        >
                                            <HiDotsVertical className="text-[22px]" />
                                        </button>

                                        {/* دراپ‌داون منو */}
                                        {isMobileMenuOpen && (
                                            <>
                                                {/* یک بک‌گراند نامرئی برای بستن منو با کلیک بیرون از آن */}
                                                <div 
                                                    className="fixed inset-0 z-40"
                                                    onClick={() => setIsMobileMenuOpen(false)}
                                                ></div>
                                                
                                                <div className="absolute rtl:left-0 ltr:right-0 top-full mt-2 w-48 bg-white dark:bg-[#1e293b] rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-gray-100 dark:border-gray-700 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-200">
                                                    <button 
                                                        onClick={() => {
                                                            onCloseConversation();
                                                            setIsMobileMenuOpen(false);
                                                        }}
                                                        className="w-full text-right px-4 py-2.5 text-[13px] font-bold text-[#f59e0b] hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex items-center gap-2"
                                                    >
                                                        بازگشت به ربات
                                                    </button>
                                                    <div className="w-full h-px bg-gray-100 dark:bg-gray-700 my-0.5"></div>
                                                    <button 
                                                        onClick={() => {
                                                            onEndConversationClick();
                                                            setIsMobileMenuOpen(false);
                                                        }}
                                                        className="w-full text-right px-4 py-2.5 text-[13px] font-bold text-[#dc2626] hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex items-center gap-2"
                                                    >
                                                        <HiOutlineCheckCircle className="text-[16px]" />
                                                        پایان مکالمه
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </>
                            )}
                        </>
                    )}

                    <span className="hidden sm:block w-[1px] h-6 bg-gray-200 dark:bg-gray-700 mx-1"></span>

                    <button 
                        onClick={() => setIsSearchMode(true)}
                        className="p-1.5 sm:p-2 rounded-full text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:text-indigo-400 dark:hover:bg-indigo-900/30 transition-all duration-200 flex items-center justify-center"
                        title="جستجو در پیام‌ها"
                    >
                        <HiOutlineSearch className="text-[20px] sm:text-[22px]" />            
                    </button>

                    <button 
                        onClick={onToggleInfo}
                        className={`p-1.5 sm:p-2 rounded-full transition-all duration-200 flex items-center justify-center ${
                            isInfoOpen 
                            ? 'text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-900/30' 
                            : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50/50 dark:hover:text-gray-300 dark:hover:bg-gray-800/50'
                        }`}
                    >
                        <HiOutlineIdentification className="text-[20px] sm:text-[24px]" />            
                    </button>
                </div>
            </div>

            {/* ======================================= */}
            {/* ۲. بخش فرم جستجو */}
            {/* ======================================= */}
            <form 
                onSubmit={onSearchSubmit} 
                className={`absolute inset-0 px-3 sm:px-4 flex items-center w-full h-full transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                    isSearchMode 
                    ? 'opacity-100 translate-x-0' // در حالت سرچ: پرواز به مرکز و پر کردن هدر
                    : 'opacity-0 -translate-x-20 pointer-events-none' // در حالت عادی: مخفی شدن در سمت چپ
                }`}
            >
                <HiOutlineSearch className="text-gray-400 text-xl shrink-0" />
                <input
                    ref={searchInputRef} // 🌟 مهم: حتماً ref را اینجا قرار دهید تا فوکوس خودکار کار کند
                    type="text"
                    placeholder="جستجو در این گفتگو ..."
                    className="flex-1 bg-transparent mx-3 border-none outline-none text-sm font-medium text-gray-800 dark:text-gray-100 placeholder-gray-400 min-w-0"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                
                <div className="flex items-center shrink-0">
                    {isSearching ? (
                        <div className="flex items-center gap-1.5 mr-2 sm:mr-3">
                            <svg className="animate-spin h-4 w-4 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 hidden sm:inline">در حال جستجو...</span>
                        </div>
                    ) : searchResultsCount > 0 ? (
                        <div className="flex items-center gap-1.5 mr-2" dir="ltr">
                            <span className="text-xs font-bold text-gray-500 w-12 text-center">
                                {currentSearchIndex + 1} / {searchResultsCount}
                            </span>

                            {searchResultsCount > 3 && (
                                <button 
                                    type="button" 
                                    onClick={onOpenListModal} 
                                    className="p-1.5 rounded text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors ml-1"
                                    title="نمایش لیست تمام نتایج"
                                >
                                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" className="text-lg" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path fill="none" d="M0 0h24v24H0z"></path><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"></path></svg>
                                </button>
                            )}

                            <div className="flex items-center border-l border-gray-200 dark:border-gray-700 pl-1.5 ml-1">
                                <button type="button" onClick={onNextResult} disabled={currentSearchIndex === searchResultsCount - 1} className="p-1.5 rounded text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:hover:bg-transparent transition-colors">
                                    <HiOutlineChevronUp className="text-lg" />
                                </button>
                                <button type="button" onClick={onPrevResult} disabled={currentSearchIndex === 0} className="p-1.5 rounded text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:hover:bg-transparent transition-colors">
                                    <HiOutlineChevronDown className="text-lg" />
                                </button>
                            </div>
                        </div>
                    ) : hasSearched && searchResultsCount === 0 ? (
                        <span className="text-xs font-bold text-red-500 bg-red-50 dark:bg-red-900/30 px-2 py-1 rounded-md mr-2">متاسفانه چیزی پیدا نشد</span>
                    ) : null}

                    <button 
                        type="button"
                        onClick={onCloseSearch}
                        className="p-2 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors mr-1 sm:mr-3"
                        title="بستن جستجو"
                    >
                        <HiX className="text-xl" />
                    </button>
                </div>
            </form>

        </div>
    );
};