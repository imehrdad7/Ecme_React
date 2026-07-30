import React, { useState, useRef, useEffect } from 'react';
import { 
    HiOutlineEmojiHappy, 
    HiX,
    HiOutlineTrash,
    HiOutlinePaperClip, 
    HiOutlineMicrophone
} from 'react-icons/hi';
import { FaTelegramPlane } from 'react-icons/fa';
import toast from '@/components/ui/toast';
import Notification from '@/components/ui/Notification';
import { AttachMenu } from './AttachMenu';
import { UploadPreviewModal } from './UploadPreviewModal';
import { HiPaperAirplane } from 'react-icons/hi';

interface Props {
    onSendMessage: (text: string) => void;
    onSendFile?: (file: File, type: 'image' | 'video' | 'document' | 'voice') => Promise<void> | void;}

const COMMON_EMOJIS = ['😊', '😂', '❤️', '👍', '🙏', '🔥', '🎉', '✅', '👀', '✨'];

export const MessageInput = ({ onSendMessage, onSendFile }: Props) => {
    // === Stateهای اصلی پیام متنی ===
    const [text, setText] = useState('');
    const [showAttachMenu, setShowAttachMenu] = useState(false);
    const [showEmojiMenu, setShowEmojiMenu] = useState(false);

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

    // بستن منوها هنگام کلیک بیرون از آن‌ها
    useEffect(() => {
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
    }, []);

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

    // === توابع مدیریت پیام متنی ===
    const handleSend = () => {
        if (text.trim()) {
            onSendMessage(text.trim());
            setText('');
            setShowEmojiMenu(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleEmojiClick = (emoji: string) => {
        setText((prev) => prev + emoji);
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
                
                {/* دکمه Attach */}
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
                                // هندلرهای عکس
                                onCameraImageClick={() => { imageCameraRef.current?.click(); setShowAttachMenu(false); }}
                                onGalleryImageClick={() => { imageGalleryRef.current?.click(); setShowAttachMenu(false); }}
                                
                                // هندلرهای ویدیو
                                onCameraVideoClick={() => { videoCameraRef.current?.click(); setShowAttachMenu(false); }}
                                onGalleryVideoClick={() => { videoGalleryRef.current?.click(); setShowAttachMenu(false); }}
                                
                                // هندلرهای فایل و سند
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
                {/* === باکس متنی و ایموجی / یا باکس ضبط صدا === */}
                <div className={`flex-1 transition-all duration-300 ${isRecording ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800/50 shadow-inner' : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'} border rounded-2xl flex items-end px-2 focus-within:bg-white dark:focus-within:bg-gray-800`}>
                    
                    {isRecording ? (
                        // 🎙️ رابط کاربری در حال ضبط (بسیار مدرن)
                        <div className="flex-1 flex items-center justify-between h-[50px] px-2 animate-[fadeIn_0.3s_ease-out]">
                            <div className="flex items-center gap-3">
                                {/* نقطه قرمز چشمک‌زن */}
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
                        // ⌨️ رابط کاربری تایپ متن (حالت عادی)
                        <>
                            <div className="relative pb-1 flex-shrink-0 animate-in zoom-in" ref={emojiMenuRef}>
                                <button onClick={() => setShowEmojiMenu(!showEmojiMenu)} className="p-1.5 text-gray-400 hover:text-indigo-500 transition-colors">
                                    <HiOutlineEmojiHappy size={22} />
                                </button>
                                {/* منوی ایموجی (همان کدهای قبلی) */}
                                {showEmojiMenu && (
                                    <div className="absolute bottom-full mb-3 rtl:right-0 ltr:left-0 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-3 z-50">
                                        <div className="grid grid-cols-5 gap-2">
                                            {COMMON_EMOJIS.map(emoji => (
                                                <button key={emoji} onClick={() => handleEmojiClick(emoji)} className="text-xl hover:bg-gray-100 dark:hover:bg-gray-700 p-1.5 rounded-lg transition-colors flex items-center justify-center">
                                                    {emoji}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <textarea
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="پیام خود را بنویسید..."
                                className="flex-1 max-h-32 min-h-[44px] bg-transparent resize-none outline-none py-3 px-2 text-[15px] text-gray-800 dark:text-gray-100 scrollbar-thin scrollbar-thumb-gray-300"
                                rows={1}
                                dir="auto"
                            />
                        </>
                    )}
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
                        // دکمه ارسال متن (اگر تایپ کرده باشد)
                        <button 
                            onClick={handleSend}
                            className="group relative flex flex-shrink-0 items-center justify-center w-11 h-11 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-0 disabled:scale-75 disabled:cursor-not-allowed outline-none"
                        >
                            <HiPaperAirplane className="text-xl rotate-90 rtl:-rotate-90 -mt-0.5 rtl:-ml-1 ltr:-mr-1 transition-transform duration-300 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 group-active:translate-x-1 rtl:group-active:-translate-x-1" />
                        </button>
                    ) : (
                        // دکمه شروع ضبط ویس (اگر متنی ننوشته باشد)
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