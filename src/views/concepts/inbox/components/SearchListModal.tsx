import React from 'react';
import { HiX } from 'react-icons/hi';
import { Message } from '../types'; // مسیر دقیق typeها رو بر اساس پروژه‌تون تنظیم کنید

interface SearchListModalProps {
    isOpen: boolean;
    onClose: () => void;
    searchTerm: string;
    searchResults: Message[];
    currentSearchIndex: number;
    currentUserId: string;
    contactName?: string;
    onSelectResult: (index: number, messageId: string) => void;
}

export const SearchListModal = ({
    isOpen,
    onClose,
    searchTerm,
    searchResults,
    currentSearchIndex,
    currentUserId,
    contactName,
    onSelectResult
}: SearchListModalProps) => {
    
    if (!isOpen) return null;

    return (
        <div className="absolute inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
            <div className="bg-white dark:bg-[#1e293b] rounded-xl shadow-2xl w-full max-w-md max-h-[80%] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                
                {/* هدر مودال */}
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
                    <div>
                        <h3 className="font-bold text-gray-800 dark:text-gray-100 text-sm">لیست نتایج جستجو</h3>
                        <p className="text-xs text-gray-500 mt-1">«{searchTerm}» ({searchResults.length} مورد پیدا شد)</p>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-2 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                    >
                        <HiX className="text-xl" />
                    </button>
                </div>

                {/* لیست پیام‌ها */}
                <div className="overflow-y-auto p-2 flex-1 space-y-1">
                    {searchResults.map((msg, index) => {
                        const msgDate = new Date(msg.createdAt);
                        return (
                            <div 
                                key={msg.id}
                                onClick={() => onSelectResult(index, msg.id)}
                                className={`p-3 rounded-lg cursor-pointer transition-all border ${
                                    currentSearchIndex === index 
                                    ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800' 
                                    : 'bg-transparent border-transparent hover:bg-gray-50 hover:border-gray-200 dark:hover:bg-gray-800/50 dark:hover:border-gray-700'
                                }`}
                            >
                                <div className="text-[11px] text-gray-500 dark:text-gray-400 mb-1.5 flex justify-between items-center">
                                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                                        {msg.senderUserId === currentUserId ? 'شما' : contactName || 'مشتری'}
                                    </span>
                                    <span>
                                        {msgDate.toLocaleDateString('fa-IR')} - {msgDate.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <div className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 leading-relaxed" dir="auto">
                                    {msg.textContent}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};