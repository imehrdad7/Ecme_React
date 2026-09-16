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
    const [isHoveringTrack, setIsHoveringTrack] = useState(false);

    const formatTime = (time: number) => {
        if (isNaN(time) || !isFinite(time)) return "00:00";
        const m = Math.floor(time / 60).toString().padStart(2, '0');
        const s = Math.floor(time % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const togglePlay = (e?: React.MouseEvent) => {
        e?.stopPropagation();
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

    const activeColor = isOutgoing ? '#818cf8' : '#34d399'; // رنگ‌های ملایم‌تر برای UI مدرن

    return (
        <div 
            ref={containerRef} 
            // حذف ارتفاع ثابت و استفاده از max-w برای جلوگیری از بزرگ شدن بیش از حد در دسکتاپ
            className={`relative group w-full sm:max-w-sm md:max-w-md rounded-2xl overflow-hidden bg-black/95 shadow-lg flex items-center justify-center ${isFullscreen ? 'max-w-none' : ''}`}
            onClick={togglePlay}
        >
            <video
                ref={videoRef}
                src={src}
                // ارتفاع Auto باعث می‌شود ویدیو به نسبت ابعاد اصلی خودش نمایش داده شود
                className="w-full h-auto max-h-[450px] object-contain outline-none cursor-pointer"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
                playsInline
            />

            {/* دکمه Play شیشه‌ای و مدرن وسط ویدیو */}
            <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 pointer-events-none ${isPlaying ? 'opacity-0 scale-110' : 'opacity-100 scale-100 bg-black/20'}`}>
                <div className="w-16 h-16 flex items-center justify-center bg-white/20 backdrop-blur-xl rounded-full text-white shadow-[0_4px_30px_rgba(0,0,0,0.1)] border border-white/30 transform transition-transform group-hover:scale-105">
                    <HiPlay className="text-3xl ml-1.5 drop-shadow-md" />
                </div>
            </div>

            {/* نوار کنترل شیشه‌ای پایین */}
            <div 
                className={`absolute bottom-0 left-0 right-0 px-4 pb-4 pt-12 bg-gradient-to-t from-black/90 via-black/50 to-transparent transition-opacity duration-300 ${isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'} flex flex-col gap-2`}
                onClick={e => e.stopPropagation()}
            >
                {/* نوار پیشرفت (هنگام هاور ضخیم‌تر می‌شود) */}
                <div 
                    className="w-full flex items-center cursor-pointer relative"
                    onMouseEnter={() => setIsHoveringTrack(true)}
                    onMouseLeave={() => setIsHoveringTrack(false)}
                >
                    <input
                        type="range"
                        min="0"
                        max="100"
                        step="0.1"
                        value={progress || 0}
                        onChange={handleSeek}
                        className={`w-full appearance-none cursor-pointer bg-white/30 rounded-full transition-all duration-200 
                        ${isHoveringTrack ? 'h-1.5' : 'h-1'} 
                        [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:transition-all
                        ${isHoveringTrack ? '[&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5' : '[&::-webkit-slider-thumb]:w-0 [&::-webkit-slider-thumb]:h-0'}`}
                        style={{
                            background: `linear-gradient(to right, ${activeColor} ${progress}%, rgba(255,255,255,0.2) ${progress}%)`
                        }}
                        dir="ltr"
                    />
                </div>

                {/* دکمه‌های کنترل */}
                <div className="flex items-center justify-between text-white/90">
                    <div className="flex items-center gap-4">
                        <button onClick={togglePlay} className="hover:text-white hover:scale-110 transition-all duration-200">
                            {isPlaying ? <HiPause size={24} /> : <HiPlay size={24} />}
                        </button>
                        
                        <button onClick={toggleMute} className="hover:text-white hover:scale-110 transition-all duration-200">
                            {isMuted ? <HiVolumeOff size={22} /> : <HiVolumeUp size={22} />}
                        </button>
                        
                        <span className="text-xs font-mono font-medium tracking-wider opacity-80 pt-0.5">
                            {formatTime(currentTime)} <span className="opacity-50 px-1">/</span> {formatTime(duration)}
                        </span>
                    </div>

                    <button onClick={toggleFullscreen} className="hover:text-white hover:scale-110 transition-all duration-200">
                        <HiArrowsExpand size={22} />
                    </button>
                </div>
            </div>
        </div>
    );
};