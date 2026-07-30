import React, { useState, useRef, useEffect } from 'react';
import { HiPlay, HiPause } from 'react-icons/hi';

interface VoicePlayerProps {
    src: string;
    isOutgoing?: boolean;
}

export const VoicePlayer = ({ src, isOutgoing = false }: VoicePlayerProps) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);

    // قالب‌بندی زمان (مثلاً 01:23)
    const formatTime = (time: number) => {
        if (isNaN(time) || !isFinite(time)) return "00:00";
        const m = Math.floor(time / 60).toString().padStart(2, '0');
        const s = Math.floor(time % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            const current = audioRef.current.currentTime;
            const dur = audioRef.current.duration;
            setCurrentTime(current);
            if (dur && isFinite(dur)) {
                setProgress((current / dur) * 100);
            }
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            // حل مشکل WebM در مرورگرها که زمان را Infinity می‌دهند
            if (audioRef.current.duration === Infinity) {
                audioRef.current.currentTime = 1e101;
                audioRef.current.ontimeupdate = () => {
                    audioRef.current!.ontimeupdate = handleTimeUpdate;
                    audioRef.current!.currentTime = 0;
                    setDuration(audioRef.current!.duration);
                }
            } else {
                setDuration(audioRef.current.duration);
            }
        }
    };

    const handleEnded = () => {
        setIsPlaying(false);
        setProgress(0);
        setCurrentTime(0);
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const seekTo = parseFloat(e.target.value);
        if (audioRef.current && duration) {
            audioRef.current.currentTime = (seekTo / 100) * duration;
            setProgress(seekTo);
        }
    };

    // رنگ‌بندی داینامیک بر اساس اینکه پیام ارسالی است یا دریافتی
    const activeColor = isOutgoing ? '#4f46e5' : '#10b981'; // نیلی برای ارسال، سبز برای دریافت
    const trackColor = isOutgoing ? 'rgba(79, 70, 229, 0.2)' : 'rgba(16, 185, 129, 0.2)';

    return (
        <div className="flex items-center gap-3 w-64 p-1.5 z-10 relative">
            
            {/* دکمه Play/Pause */}
            <button
                onClick={togglePlay}
                className={`flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-full text-white transition-all transform active:scale-90 shadow-md ${
                    isOutgoing ? 'bg-indigo-500 hover:bg-indigo-600' : 'bg-emerald-500 hover:bg-emerald-600'
                }`}
            >
                {isPlaying ? (
                    <HiPause className="text-2xl" />
                ) : (
                    <HiPlay className="text-2xl ml-1" />
                )}
            </button>

            {/* بخش نوار پیشرفت و زمان */}
            <div className="flex-1 flex flex-col justify-center min-w-0 pt-1">
                
                {/* نوار قابلیت کشیدن (Seekbar) */}
                <input
                    type="range"
                    min="0"
                    max="100"
                    step="0.1"
                    value={progress || 0}
                    onChange={handleSeek}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-sm"
                    style={{
                        background: `linear-gradient(to left, ${trackColor} ${100 - progress}%, ${activeColor} ${100 - progress}%)` 
                    }}
                    dir="ltr"
                />
                
                <div className="flex justify-between items-center mt-2 px-0.5">
                    {/* زمان */}
                    <span className={`text-[11px] font-medium font-mono tabular-nums ${
                        isOutgoing ? 'text-indigo-700/80 dark:text-indigo-200/80' : 'text-emerald-700/80 dark:text-emerald-200/80'
                    }`}>
                        {isPlaying ? formatTime(currentTime) : formatTime(duration)}
                    </span>
                    
                    {/* مینی-ویژوالایزر فیک برای زیبایی */}
                    <div className="flex gap-[2px] items-end h-2.5">
                        {[4, 8, 5, 10, 6, 3].map((height, i) => (
                            <div 
                                key={i} 
                                className={`w-[2px] rounded-full transition-all duration-300 ${
                                    isPlaying ? 'animate-pulse' : 'opacity-40'
                                } ${isOutgoing ? 'bg-indigo-500' : 'bg-emerald-500'}`} 
                                style={{ height: isPlaying ? `${height}px` : '4px' }}
                            ></div>
                        ))}
                    </div>
                </div>
            </div>

            {/* تگ مخفی صوتی مرورگر */}
            <audio
                ref={audioRef}
                src={src}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleEnded}
                preload="metadata"
                className="hidden"
            />
        </div>
    );
};