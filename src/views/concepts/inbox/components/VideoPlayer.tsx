import React, { useState, useRef, useEffect } from 'react';
import { HiPlay, HiPause, HiVolumeUp, HiVolumeOff, HiArrowsExpand } from 'react-icons/hi';

interface VideoPlayerProps {
    src: string;
    isOutgoing?: boolean;
}

export const VideoPlayer = ({ src, isOutgoing = false }: VideoPlayerProps) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // قالب‌بندی زمان
    const formatTime = (time: number) => {
        if (isNaN(time) || !isFinite(time)) return "00:00";
        const m = Math.floor(time / 60).toString().padStart(2, '0');
        const s = Math.floor(time % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const togglePlay = (e?: React.MouseEvent) => {
        e?.stopPropagation(); // جلوگیری از باز شدن مودالِ احتمالی در پس‌زمینه
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const toggleMute = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const toggleFullscreen = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!containerRef.current) return;

        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen().catch(err => {
                console.error(`خطا در تمام‌صفحه کردن: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    };

    // شنونده برای تغییر وضعیت تمام‌صفحه توسط دکمه ESC کیبورد
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            const current = videoRef.current.currentTime;
            const dur = videoRef.current.duration;
            setCurrentTime(current);
            if (dur && isFinite(dur)) {
                setProgress((current / dur) * 100);
            }
        }
    };

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            // رفع باگ Infinity در WebM
            if (videoRef.current.duration === Infinity) {
                videoRef.current.currentTime = 1e101;
                videoRef.current.ontimeupdate = () => {
                    videoRef.current!.ontimeupdate = handleTimeUpdate;
                    videoRef.current!.currentTime = 0;
                    setDuration(videoRef.current!.duration);
                };
            } else {
                setDuration(videoRef.current.duration);
            }
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.stopPropagation();
        const seekTo = parseFloat(e.target.value);
        if (videoRef.current && duration) {
            videoRef.current.currentTime = (seekTo / 100) * duration;
            setProgress(seekTo);
        }
    };

    const activeColor = isOutgoing ? '#4f46e5' : '#10b981';

    return (
        <div 
            ref={containerRef} 
            className="relative group w-full rounded-2xl overflow-hidden bg-black shadow-sm flex items-center justify-center min-h-[150px] max-h-[300px]"
            onClick={togglePlay} // کلیک روی کل ویدیو باعث پخش/توقف می‌شود
        >
            <video
                ref={videoRef}
                src={src}
                className="w-full h-auto max-h-[300px] outline-none cursor-pointer"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
                playsInline
            />

            {/* دکمه Play بزرگ وسط ویدیو (وقتی متوقف است نمایش داده می‌شود) */}
            {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity">
                    <div className="w-14 h-14 flex items-center justify-center bg-white/20 backdrop-blur-md rounded-full text-white shadow-lg">
                        <HiPlay className="text-3xl ml-1" />
                    </div>
                </div>
            )}

            {/* نوار کنترل پایین (Glassmorphism) - فقط با هاور نمایش داده می‌شود */}
            <div 
                className={`absolute bottom-0 left-0 right-0 px-3 pb-3 pt-8 bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-300 ${isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'} flex flex-col gap-1`}
                onClick={e => e.stopPropagation()} // جلوگیری از تداخل با کلیکِ پخش ویدیو
            >
                {/* نوار پیشرفت */}
                <div className="w-full flex items-center h-4 cursor-pointer">
                    <input
                        type="range"
                        min="0"
                        max="100"
                        step="0.1"
                        value={progress || 0}
                        onChange={handleSeek}
                        className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-white/30 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md transition-all"
                        style={{
                            background: `linear-gradient(to right, ${activeColor} ${progress}%, rgba(255,255,255,0.3) ${progress}%)`
                        }}
                        dir="ltr"
                    />
                </div>

                {/* دکمه‌ها و زمان */}
                <div className="flex items-center justify-between text-white mt-1">
                    <div className="flex items-center gap-3">
                        <button onClick={togglePlay} className="hover:text-gray-300 transition-colors">
                            {isPlaying ? <HiPause size={22} /> : <HiPlay size={22} />}
                        </button>
                        
                        <button onClick={toggleMute} className="hover:text-gray-300 transition-colors">
                            {isMuted ? <HiVolumeOff size={20} /> : <HiVolumeUp size={20} />}
                        </button>
                        
                        <span className="text-[11px] font-mono font-medium opacity-90 tracking-wide pt-0.5">
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                    </div>

                    <button onClick={toggleFullscreen} className="hover:text-gray-300 transition-colors">
                        <HiArrowsExpand size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};