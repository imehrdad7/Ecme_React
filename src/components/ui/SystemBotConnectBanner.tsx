import React, { useState, useEffect } from 'react';
import { useAuth } from '@/auth';

const SystemBotConnectBanner = () => {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!user) return;

    // بررسی فعال بودن هندآف در سیستم شرکت
    const isHandoffActive = user.isHandoffEnabled;
    
    // آیا هر دو ربات متصل شده‌اند؟ 
    const isAllConnected = user.isTelegramConnected && user.isBaleConnected;

    // بنر زمانی نشان داده می‌شود که هندآف فعال باشد و هنوز هر دو ربات متصل نشده باشند
    if (isHandoffActive && !isAllConnected) {
      setIsVisible(true);
      setTimeout(() => setIsAnimating(true), 50);
    } else {
      setIsVisible(false);
      setIsAnimating(false);
    }
  }, [user]);

  if (!isVisible || !user) return null;

  const telegramConnectUrl = `https://t.me/AnyBotNotify_bot?start=${user.id}`;
  const baleConnectUrl = `https://ble.ir/AnyBotNotify_bot?start=${user.id}`;

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => setIsVisible(false), 500);
  };

  const handleConnectClick = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div 
      className={`sticky top-0 z-[100] w-full bg-[#F0F9FF]/95 backdrop-blur-md shadow-md border-b-2 border-[#2AABEE]/30 
                  transition-all duration-500 ease-out origin-top
                  ${isAnimating ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}
    >
      <div className="flex flex-col md:flex-row items-center justify-between px-6 lg:px-10 py-4 max-w-full gap-5">
        
        {/* بخش متن و آیکون */}
        <div className="flex items-center gap-4 w-full md:w-auto">
          
          {/* آیکون زنگوله با نقطه قرمز چشمک‌زن */}
          <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-sm border border-blue-200 text-[#2AABEE] shrink-0">
            <span className="absolute top-0 right-0 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500 border-2 border-white"></span>
            </span>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-[15px] md:text-[16px] font-extrabold text-gray-900">
                اتصال به ربات اعلان‌های سیستم (ضروری)
              </h2>
              
              {/* Tooltip راهنما */}
              <div className="relative group flex items-center cursor-help">
                <svg className="w-5 h-5 text-gray-400 hover:text-[#2AABEE] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                
                <div className="absolute right-0 top-full mt-2 w-72 md:w-80 p-4 bg-white text-gray-700 text-[13px] leading-relaxed rounded-xl shadow-xl border border-gray-100 
                                opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <strong className="block text-gray-900 mb-1 font-bold">چرا باید متصل شوم؟</strong>
                  با اتصال حساب خود به ربات مرکزی بآمآسان، تمامی اعلان‌های مهم سیستم مانند 
                  <span className="text-[#2AABEE] font-bold mx-1">درخواست‌های اتصال به اپراتور (Handoff)</span> 
                  از سمت کاربران، به صورت آنی به پیام‌رسان شما ارسال می‌شود تا سرعت پاسخگویی شما افزایش یابد.
                </div>
              </div>
            </div>
            
            <p className="text-[13px] md:text-[14px] font-medium text-gray-600 leading-snug">
              برای دریافت آنی درخواست‌های پشتیبانی و پیام‌های مشتریان، حساب خود را متصل کنید.
            </p>
          </div>
        </div>

        {/* بخش دکمه‌ها */}
        <div className="flex items-center gap-3 shrink-0 mt-3 md:mt-0 w-full md:w-auto justify-end">
          
          {/* 🌟 دکمه تلگرام: اگر متصل باشد تیک سبز نشان می‌دهد، در غیر این صورت دکمه آبی */}
          {user.isTelegramConnected ? (
            <div className="text-[13px] md:text-[14px] font-bold bg-green-50 text-green-600 border border-green-200 px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-default select-none">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              تلگرام متصل شد
            </div>
          ) : (
            <button
              onClick={() => handleConnectClick(telegramConnectUrl)}
              className="text-[13px] md:text-[14px] font-bold bg-[#2AABEE] hover:bg-[#2298D6] text-white px-5 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center"
            >
              اتصال تلگرام 🚀
            </button>
          )}
          
          {/* 🌟 دکمه بله: اگر متصل باشد تیک سبز نشان می‌دهد، در غیر این صورت دکمه سبز */}
          {user.isBaleConnected ? (
            <div className="text-[13px] md:text-[14px] font-bold bg-green-50 text-green-600 border border-green-200 px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-default select-none">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              بله متصل شد
            </div>
          ) : (
            <button
              onClick={() => handleConnectClick(baleConnectUrl)}
              className="text-[13px] md:text-[14px] font-bold bg-[#33cf99] hover:bg-[#2ab384] text-white px-5 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center"
            >
              اتصال بله 💬
            </button>
          )}
          
          <div className="w-px h-8 bg-blue-200/50 mx-1 hidden sm:block"></div>
          
          <button 
            type="button" 
            onClick={handleClose}
            className="text-gray-400 hover:text-red-500 hover:bg-white p-2 rounded-full transition-colors"
            title="بستن"
          >
            <span className="sr-only">بستن</span>
            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

      </div>
    </div>
  );
};

export default SystemBotConnectBanner;