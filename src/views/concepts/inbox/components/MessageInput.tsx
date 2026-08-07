import React, { useState, useRef, useEffect } from 'react';
import { 
    HiOutlineEmojiHappy, 
    HiX,
    HiOutlineTrash,
    HiOutlinePaperClip, 
    HiOutlineMicrophone,
    HiPaperAirplane,
    HiOutlineLightningBolt,
    HiOutlineArrowsExpand,
    HiOutlineMenuAlt4
} from 'react-icons/hi';
import { FaTelegramPlane } from 'react-icons/fa';
import toast from '@/components/ui/toast';
import Notification from '@/components/ui/Notification';
import { AttachMenu } from './AttachMenu';
import { UploadPreviewModal } from './UploadPreviewModal';
import { CannedResponse } from '../types';
import { apiGetCannedResponses } from '@/services/liveChatService'; 
import EmojiPicker, { Theme , EmojiClickData } from 'emoji-picker-react';


interface Props {
    companyId: string;
    cannedResponses?: CannedResponse[];
    onSendMessage: (text: string) => void;
    onSendFile?: (file: File, type: 'image' | 'video' | 'document' | 'voice') => Promise<void> | void;}


export const MessageInput = ({ companyId ,cannedResponses = [], onSendMessage, onSendFile }: Props) => {
    const [text, setText] = useState('');
    const [showAttachMenu, setShowAttachMenu] = useState(false);
    const [showEmojiMenu, setShowEmojiMenu] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [showExpandButton, setShowExpandButton] = useState(false);
    
    // === Stateهای مربوط به پیش‌نمایش و آپلود فایل ===
    const [previewFile, setPreviewFile] = useState<{
        file: File | null;
        type: 'image' | 'video' | 'document' | 'voice' | 'file';
        previewUrl: string;
        isViewMode?: boolean;
        fileName?: string;
        fileSize?: number;
        replyId?: string;
    } | null>(null);
    const [isUploadingToCloud, setIsUploadingToCloud] = useState(false);
    
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<BlobPart[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const isCancelledRef = useRef<boolean>(false);

    // === Refها ===
    const attachMenuRef = useRef<HTMLDivElement>(null);
    const emojiMenuRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const imageGalleryRef = useRef<HTMLInputElement>(null);
    const imageCameraRef = useRef<HTMLInputElement>(null);
    const videoGalleryRef = useRef<HTMLInputElement>(null);
    const videoCameraRef = useRef<HTMLInputElement>(null);

    const pdfRef = useRef<HTMLInputElement>(null);
    const wordRef = useRef<HTMLInputElement>(null);
    const excelRef = useRef<HTMLInputElement>(null);
    const zipRef = useRef<HTMLInputElement>(null);
    const allFilesRef = useRef<HTMLInputElement>(null);
    const audioRef = useRef<HTMLInputElement>(null);

    const [showCanned, setShowCanned] = useState(false);

    const [cannedList, setCannedList] = useState<CannedResponse[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [isLoadingCanned, setIsLoadingCanned] = useState(false);

    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const pickerRef = useRef<HTMLDivElement>(null);

    
    const filteredCanned = cannedResponses.filter(r => 
        text.startsWith('/') 
            ? r.trigger.toLowerCase().includes(text.toLowerCase())
            : true
    );

    useEffect(() => {
        const fetchCannedResponses = async () => {
            if (!companyId) return;
            setIsLoadingCanned(true);
            try {
                const response = await apiGetCannedResponses(companyId); 
                if (response) {
                    setCannedList(response);
                }
            } catch (error) {
                console.error("خطا در دریافت پاسخ‌های آماده", error);
            } finally {
                setIsLoadingCanned(false);
            }
        };

        fetchCannedResponses();

        const handleClickOutside = (e: MouseEvent) => {
            if (attachMenuRef.current && !attachMenuRef.current.contains(e.target as Node)) {
                setShowAttachMenu(false);
            }
            if (emojiMenuRef.current && !emojiMenuRef.current.contains(e.target as Node)) {
                setShowEmojiMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => 
            document.removeEventListener('mousedown', handleClickOutside);
    }, [companyId]);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            const currentScrollHeight = textareaRef.current.scrollHeight;
            textareaRef.current.style.height = `${currentScrollHeight}px`;

            if (currentScrollHeight > 100) {
                setShowExpandButton(true);
            } else {
                setShowExpandButton(false);
                if (isExpanded) setIsExpanded(false); 
            }
        }
    }, [text, isExpanded]);

    useEffect(() => {
        if (showCanned) {
            const activeItem = document.getElementById(`canned-item-${selectedIndex}`);
            if (activeItem) {
                // ویژگی nearest باعث می‌شود فقط به اندازه‌ای اسکرول شود که آیتم در دید قرار بگیرد (دقیقاً مثل رفتار ویندوز)
                activeItem.scrollIntoView({ block: 'nearest' });
            }
        }
    }, [selectedIndex, showCanned]);


    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const startRecording = async () => {
        try {
            // دریافت مجوز میکروفون از کاربر
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            isCancelledRef.current = false;
            audioChunksRef.current = [];
            
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) audioChunksRef.current.push(e.data);
            };

            mediaRecorder.onstop = () => {
                // وقتی ضبط متوقف شد، ترک‌های میکروفون را خاموش می‌کنیم تا چراغ میکروفون مرورگر خاموش شود
                stream.getTracks().forEach(track => track.stop());
                
                if (isCancelledRef.current) return; // اگر لغو شده بود، کاری نکن

                // ساخت فایل صوتی نهایی
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const audioFile = new File([audioBlob], `voice_${Date.now()}.webm`, { type: 'audio/webm' });
                
                // ارسال مستقیم فایل به سرور
                if (onSendFile) {
                    onSendFile(audioFile, 'voice');
                }
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingTime(0);
            
            // شروع تایمر
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

        } catch (error) {
            console.error("خطا در دسترسی به میکروفون:", error);
            toast.push(
                React.createElement(Notification, { title: 'خطا', type: 'danger' }, 'لطفاً دسترسی به میکروفون را در مرورگر خود مجاز کنید.'),
                { placement: 'top-center' }
            );
        }
    };

    const stopRecordingAndSend = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop(); // این متد باعث فراخوانی onstop می‌شود
            setIsRecording(false);
            if (timerRef.current) clearInterval(timerRef.current);
        }
    };

    const cancelRecording = () => {
        isCancelledRef.current = true; // فلگ لغو را روشن می‌کنیم
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (timerRef.current) clearInterval(timerRef.current);
        }
    };

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setText(value);

        if (value.startsWith('/')) {
            setShowCanned(true);
            const searchTerm = value.toLowerCase();
            const filtered = cannedList.filter(r => r.trigger.includes(searchTerm));
            setSelectedIndex(0);
        } else {
            setShowCanned(false);
        }
    };

    const handleSelectCanned = (cannedText: string) => {
        setText(cannedText);
        setShowCanned(false);
        textareaRef.current?.focus();
    };

    // === توابع مدیریت پیام متنی ===
    const handleSend = () => {
        if (text.trim()) {
            onSendMessage(text.trim());
            setText('');
            setShowEmojiMenu(false);
            setShowCanned(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        // 🌟 مدیریت کیبورد وقتی منوی پاسخ سریع باز است
        if (showCanned && filteredCanned.length > 0) {
            if (e.key === 'ArrowDown') {
                e.preventDefault(); // جلوگیری از حرکت نشانگر متن
                setSelectedIndex((prev) => (prev + 1) % filteredCanned.length);
                return;
            }
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex((prev) => (prev - 1 + filteredCanned.length) % filteredCanned.length);
                return;
            }
            if (e.key === 'Enter') {
                e.preventDefault(); // جلوگیری از ارسال پیام
                handleSelectCanned(filteredCanned[selectedIndex].text);
                return;
            }
            if (e.key === 'Escape') {
                e.preventDefault();
                setShowCanned(false);
                return;
            }
        }

        // رفتار عادی وقتی منو بسته است (ارسال پیام با اینتر)
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleEmojiClick = (emojiData: EmojiClickData) => {
        setText((prev) => prev + emojiData.emoji);
    };

    // === توابع مدیریت فایل و مودال پیش‌نمایش ===
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video' | 'document' | 'voice', replyId?: string) => {
        const file = e.target.files?.[0];
        
        if (file) {
            const localUrl = URL.createObjectURL(file);
            setPreviewFile({
                file: file,
                type: type,
                previewUrl: localUrl,
                isViewMode: false,
                replyId: replyId
            });
        }
        
        setShowAttachMenu(false); 
        if (e.target) e.target.value = ''; 
    };

    const cancelUpload = () => {
        if (previewFile?.previewUrl && !previewFile.isViewMode) {
            URL.revokeObjectURL(previewFile.previewUrl);
        }
        setPreviewFile(null);
    };

    const confirmAndUploadFile = async () => {
        if (!previewFile || !previewFile.file || !onSendFile) return;

        setIsUploadingToCloud(true);
        try {
            await onSendFile(previewFile.file, previewFile.type as 'image' | 'video' | 'document');
            setPreviewFile(null);
        } catch (error) {
            console.error("خطا در ارسال:", error);
            toast.push(
                <Notification title="خطا" type="danger">ارسال فایل با شکست مواجه شد.</Notification>, 
                { placement: 'top-center' }
            );
        } finally {
            setIsUploadingToCloud(false);
        }
    };

    
  return (
    <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 z-20 transition-all duration-300">
        <div className="flex items-end gap-2 max-w-5xl mx-auto relative">
            
            {/* دکمه Attach (بدون تغییر) */}
            {!isRecording && (
                <div className="relative flex-shrink-0 animate-in fade-in zoom-in" ref={attachMenuRef}>
                   <button 
                        onClick={() => setShowAttachMenu(!showAttachMenu)}
                        className={`p-3 rounded-full transition-colors flex items-center justify-center ${
                            showAttachMenu 
                            ? 'bg-indigo-50 dark:bg-gray-800 text-indigo-600 dark:text-indigo-400' 
                            : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                    >
                        <div className={`transition-transform duration-300 flex items-center justify-center ${showAttachMenu ? 'rotate-90 scale-110' : 'rotate-0'}`}>
                            {showAttachMenu ? (
                                <HiX className="text-xl" />
                            ) : (
                                <HiOutlinePaperClip className="text-xl -rotate-45" /> 
                            )}
                        </div>
                    </button>
                    {showAttachMenu && (
                        <AttachMenu 
                            onCameraImageClick={() => { imageCameraRef.current?.click(); setShowAttachMenu(false); }}
                            onGalleryImageClick={() => { imageGalleryRef.current?.click(); setShowAttachMenu(false); }}
                            onCameraVideoClick={() => { videoCameraRef.current?.click(); setShowAttachMenu(false); }}
                            onGalleryVideoClick={() => { videoGalleryRef.current?.click(); setShowAttachMenu(false); }}
                            onPdfClick={() => { pdfRef.current?.click(); setShowAttachMenu(false); }}
                            onWordClick={() => { wordRef.current?.click(); setShowAttachMenu(false); }}
                            onExcelClick={() => { excelRef.current?.click(); setShowAttachMenu(false); }}
                            onZipClick={() => { zipRef.current?.click(); setShowAttachMenu(false); }}
                            onAllFilesClick={() => { allFilesRef.current?.click(); setShowAttachMenu(false); }}
                            onAudioClick={() => { audioRef.current?.click(); setTimeout(() => setShowAttachMenu(false), 100); }}
                        />
                    )}
                </div>
            )}
            
            {/* === 🌟 باکس متنی حرفه‌ای و شناور (Floating) === */}
            {/* ۱. لایه نگهدارنده جایگاه (فضای خالی که اجازه جابجایی دکمه‌ها را نمی‌دهد) */}
            <div className="flex-1 relative h-[46px] flex items-end">
                
                {/* ۲. لایه شناور که از پایین به بالا رشد می‌کند */}
                <div className={`absolute bottom-0 left-0 w-full transition-all duration-300 ${isRecording ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800/50 shadow-inner' : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'} border rounded-2xl flex items-end px-2 focus-within:bg-white dark:focus-within:bg-gray-800 z-40 ${
                    showExpandButton ? 'shadow-[0_-10px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_-10px_30px_rgba(0,0,0,0.4)]' : ''
                }`}>
                    
                    {/* 🌟 پاپ‌آپ پاسخ‌های آماده (حالا با کادر بالا می‌رود) */}
                    {showCanned && (
                        <div className="absolute bottom-[calc(100%+16px)] left-0 right-0 w-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] dark:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] border border-gray-200/50 dark:border-gray-700/50 overflow-hidden animate-in slide-in-from-bottom-3 fade-in zoom-in-95 duration-200 z-50">
                            
                            {/* هدر پاپ‌آپ */}
                            <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-700/50 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/50">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-inner">
                                        <HiOutlineLightningBolt className="text-sm" />
                                    </div>
                                    <span className="text-sm font-bold text-gray-700 dark:text-gray-200">
                                        پاسخ‌های آماده
                                    </span>
                                </div>
                                <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-2.5 py-1 rounded-md hidden sm:block">
                                    برای انتخاب کلیک کنید
                                </span>
                            </div>

                            {/* لیست پاسخ‌ها */}
                            <ul className="max-h-60 overflow-y-auto p-2 modern-scrollbar">
                                {filteredCanned && filteredCanned.length > 0 ? (
                                    filteredCanned.map((canned, index) => (
                                        <li 
                                            id={`canned-item-${index}`}
                                            key={index}
                                            onClick={() => handleSelectCanned(canned.text)}
                                            onMouseEnter={() => setSelectedIndex(index)}
                                            className={`group flex flex-col sm:flex-row sm:items-center justify-between p-3.5 cursor-pointer rounded-xl transition-all duration-200 gap-3 border ${
                                                selectedIndex === index 
                                                ? 'bg-indigo-50 dark:bg-gray-700/80 border-indigo-200 dark:border-indigo-500/30 shadow-sm' 
                                                : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:border-gray-200 dark:hover:border-gray-600/50'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3 overflow-hidden flex-1">
                                                <span className={`text-[14px] truncate leading-relaxed ${
                                                    selectedIndex === index ? 'text-indigo-900 dark:text-indigo-100 font-medium' : 'text-gray-600 dark:text-gray-300'
                                                }`}>
                                                    {canned.text}
                                                </span>
                                            </div>
                                            <span className={`flex-shrink-0 text-xs font-mono font-bold px-2.5 py-1.5 rounded-lg dir-ltr transition-all ${
                                                selectedIndex === index 
                                                ? 'bg-indigo-600 text-white border-transparent scale-105 shadow-sm shadow-indigo-200 dark:shadow-none' 
                                                : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/50 group-hover:scale-105'
                                            }`}>
                                                {canned.trigger}
                                            </span>
                                        </li>
                                    ))
                                ) : (
                                    <li className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                        {text.startsWith('/') ? 'پاسخی با این کلمه کلیدی یافت نشد.' : 'هیچ پاسخ آماده‌ای ثبت نشده است.'}
                                    </li>
                                )}
                            </ul>
                        </div>
                    )}
                
                    {isRecording ? (
                        <div className="flex-1 flex items-center justify-between h-[46px] px-2 animate-[fadeIn_0.3s_ease-out]">
                            <div className="flex items-center gap-3">
                                <div className="relative flex h-3 w-3 ml-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                </div>
                                <span className="font-mono font-semibold tracking-wider text-red-500 dark:text-red-400 text-base dir-ltr">
                                    {formatTime(recordingTime)}
                                </span>
                                <span className="text-gray-400 text-sm opacity-70 animate-pulse hidden sm:inline-block">در حال ضبط صدا...</span>
                            </div>
                            
                            <button 
                                onClick={cancelRecording} 
                                className="flex items-center gap-2 px-3 py-1.5 text-gray-400 hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                            >
                                <HiOutlineTrash className="text-xl" />
                                <span className="text-sm font-medium hidden sm:block">لغو</span>
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="relative pb-1 flex-shrink-0 flex items-center gap-1 rtl:pr-1 ltr:pl-1">
                                {showExpandButton && (
                                    <button 
                                        onClick={() => setIsExpanded(!isExpanded)} 
                                        className={`p-1.5 rounded-lg transition-colors animate-in zoom-in duration-200 ${isExpanded ? 'bg-indigo-50 text-indigo-600 dark:bg-gray-700 dark:text-indigo-400' : 'text-gray-400 hover:text-indigo-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                        title={isExpanded ? "کوچک کردن کادر" : "نمایش کامل متن"}
                                    >
                                        {isExpanded ? <HiOutlineMenuAlt4 size={22} /> : <HiOutlineArrowsExpand size={20} />}
                                    </button>
                                )}

                                <button 
                                    onClick={() => {
                                        if (showCanned) {
                                            setShowCanned(false);
                                        } else {
                                            setSelectedIndex(0);
                                            setShowCanned(true);
                                        }
                                    }} 
                                    className={`p-1.5 rounded-lg transition-colors ${showCanned ? 'bg-indigo-50 text-indigo-600 dark:bg-gray-700 dark:text-indigo-400' : 'text-gray-400 hover:text-indigo-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                    title="پاسخ‌های آماده (اسلش /)"
                                >
                                    <HiOutlineLightningBolt size={20} />
                                </button>

                                <div ref={emojiMenuRef}>
                                    <button 
                                        onClick={() => setShowEmojiMenu(!showEmojiMenu)} 
                                        className={`p-1.5 rounded-lg transition-colors ${showEmojiMenu ? 'bg-indigo-50 text-indigo-600 dark:bg-gray-700 dark:text-indigo-400' : 'text-gray-400 hover:text-indigo-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                        title="ایموجی"
                                    >
                                        <HiOutlineEmojiHappy size={22} />
                                    </button>
                                    
                                    {showEmojiMenu && (
                                        <div 
                                            className="absolute bottom-[calc(100%+16px)] mb-3 rtl:right-0 ltr:left-0 z-50 animate-in zoom-in-95 duration-200 shadow-2xl rounded-2xl overflow-hidden w-[280px] h-[350px] sm:w-[320px] sm:h-[400px]"
                                            // 🌟 ۱. این استایل باعث می‌شود پکیج، فونت سایت شما را به ارث ببرد
                                            style={{ '--epr-font-family': 'inherit' } as React.CSSProperties}
                                        >
                                            <EmojiPicker 
                                                onEmojiClick={handleEmojiClick}
                                                theme={Theme.AUTO}
                                                searchPlaceHolder="جستجوی ایموجی..."
                                                width="100%"
                                                height="100%"
                                                lazyLoadEmojis={true}
                                                searchDisabled={true}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <textarea
                                ref={textareaRef}
                                value={text}
                                onChange={handleTextChange}
                                onKeyDown={handleKeyDown}
                                placeholder="پیام ..."
                                className={`flex-1 min-h-[44px] bg-transparent resize-none outline-none py-3 px-2 text-[15px] text-gray-800 dark:text-gray-100 modern-scrollbar overflow-y-auto transition-all duration-300 text-right ${
                                    isExpanded ? 'max-h-[50vh]' : 'max-h-[110px]'
                                }`}                        
                                rows={1}
                                dir="auto"
                            />
                        </>
                    )}
                </div>
            </div>

            {/* === دکمه هوشمند سمت چپ (ارسال / ضبط / توقف) === */}
            <div className="flex-shrink-0 ml-1">
                {isRecording ? (
                    // دکمه توقف و ارسال ویس
                    <button 
                        onClick={stopRecordingAndSend}
                        className="p-3.5 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-200 dark:shadow-none flex items-center justify-center transition-all animate-bounce"
                    >
                        <FaTelegramPlane className="text-xl rtl:-scale-x-100" />
                    </button>
                ) : text.trim() ? (
                    // دکمه ارسال متن
                    <button 
                        onClick={handleSend}
                        className="group relative flex flex-shrink-0 items-center justify-center w-11 h-11 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-0 disabled:scale-75 disabled:cursor-not-allowed outline-none"
                    >
                        <HiPaperAirplane className="text-xl rotate-90 rtl:-rotate-90 -mt-0.5 rtl:-ml-1 ltr:-mr-1 transition-transform duration-300 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 group-active:translate-x-1 rtl:group-active:-translate-x-1" />
                    </button>
                ) : (
                    // دکمه شروع ضبط ویس
                    <button 
                        onClick={startRecording}
                        className="p-3.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 flex items-center justify-center transition-all animate-in zoom-in"
                    >
                        <HiOutlineMicrophone className="text-xl" />
                    </button>
                )}
            </div>

           {/* مدیا */}
            <input type="file" ref={imageGalleryRef} className="hidden" accept="image/*" onChange={(e) => handleFileSelect(e, 'image')} />
            <input type="file" ref={imageCameraRef} className="hidden" accept="image/*" capture="environment" onChange={(e) => handleFileSelect(e, 'image')} />
            <input type="file" ref={videoGalleryRef} className="hidden" accept="video/*" onChange={(e) => handleFileSelect(e, 'video')} />
            <input type="file" ref={videoCameraRef} className="hidden" accept="video/*" capture="environment" onChange={(e) => handleFileSelect(e, 'video')} />

            {/* فایل و سند */}
            <input type="file" ref={pdfRef} className="hidden" accept=".pdf,application/pdf" onChange={(e) => handleFileSelect(e, 'document')} />
            <input type="file" ref={wordRef} className="hidden" accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(e) => handleFileSelect(e, 'document')} />
            <input type="file" ref={excelRef} className="hidden" accept=".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={(e) => handleFileSelect(e, 'document')} />
            <input type="file" ref={zipRef} className="hidden" accept=".zip,.rar,.7z,application/zip,application/x-rar-compressed,application/x-7z-compressed" onChange={(e) => handleFileSelect(e, 'document')} />
            <input type="file" ref={allFilesRef} className="hidden" accept="*" onChange={(e) => handleFileSelect(e, 'document')} />
            <input type="file" ref={audioRef} className="hidden" accept="audio/*,.mp3,.wav,.ogg,.m4a" onChange={(e) => handleFileSelect(e, 'voice')} />
        </div>

        {previewFile && (
            <UploadPreviewModal
                previewFile={previewFile}
                isUploading={isUploadingToCloud}
                onCancel={cancelUpload}
                onConfirm={confirmAndUploadFile}
            />
        )}
    </div>
);
};