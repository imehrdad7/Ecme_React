import { useState, useEffect, useRef, useCallback } from 'react';
import { CampaignListItemDto } from '../types';
import { useSessionUser, getToken } from '@/store/authStore';
import { apiSearchCampaigns } from '@/services/CampaignService'
import { useCampaignSocket } from '@/utils/hooks/useCampaignSocket'; // 👈 فرض بر این است که مشابه useChatSocket یک هوک برای سوکت کمپین می‌سازید

export const useCampaignState = () => {
    const { user } = useSessionUser();
    const companyId = user?.companyId;
    const [resolvedToken, setResolvedToken] = useState<string>('');

    // ۱. دریافت توکن برای اتصال سوکت (مشابه ChatState)
    useEffect(() => {
        const fetchToken = async () => {
            try {
                const t = await getToken(); 
                if (t) setResolvedToken(t);
            } catch (error) {
                console.error("خطا در خواندن توکن از استوریج:", error);
            }
        };
        fetchToken();
    }, [user?.id]);

    // === استیت‌های اصلی ===
    const [campaigns, setCampaigns] = useState<CampaignListItemDto[]>([]);
    
    // رفرنس برای دسترسی به آخرین استیت کمپین‌ها داخل متدهای Callback
    const campaignsRef = useRef<CampaignListItemDto[]>([]);
    useEffect(() => {
        campaignsRef.current = campaigns;
    }, [campaigns]);

    const [searchQuery, setSearchQuery] = useState<string>('');
    const [totalCount, setTotalCount] = useState<number>(0);

    // === استیت‌های فیلتر و صفحه‌بندی ===
    const [page, setPage] = useState<number>(1);
    const [hasMore, setHasMore] = useState<boolean>(true);
    
    // === استیت‌های بارگذاری ===
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    // ==========================================
    // 🌟 ۲. منطق دریافت آپدیت وضعیت کمپین از SignalR
    // ==========================================
    const handleCampaignUpdated = useCallback((updatedCampaign: CampaignListItemDto) => {
        console.log(`وضعیت کمپین ${updatedCampaign.name} به ${updatedCampaign.statusName} تغییر کرد`);

        setCampaigns((prevCampaigns) => {
            const index = prevCampaigns.findIndex(c => c.id === updatedCampaign.id);
            
            if (index !== -1) {
                // اگر کمپین در لیست بود، اطلاعاتش را با دیتای جدید جایگزین کن
                const newCampaigns = [...prevCampaigns];
                newCampaigns[index] = updatedCampaign;
                return newCampaigns;
            } 
            
            return [updatedCampaign, ...prevCampaigns];
            });
    }, []);

    // 🌟 ۳. راه‌اندازی و اتصال سوکت (مشابه useChatSocket)
    // فرض می‌کنیم شما یک فایل useCampaignSocket.ts مشابه چت ساخته‌اید
    /*
    const { isConnected } = useCampaignSocket({
        token: resolvedToken,
        onCampaignUpdated: handleCampaignUpdated
    });
    */
   
    // اگر فایل useCampaignSocket ندارید و می‌خواهید مستقیماً اینجا متصل کنید:
    /*
    useEffect(() => {
        if (!connection) return;
        connection.on("ReceiveCampaignUpdate", handleCampaignUpdated);
        return () => {
            connection.off("ReceiveCampaignUpdate", handleCampaignUpdated);
        };
    }, [handleCampaignUpdated]);
    */

    // ==========================================
    // 🌟 ۴. دریافت لیست کمپین‌ها از API
    // ==========================================
    useEffect(() => {
        const fetchCampaigns = async () => {
            if (!companyId) return; 

            if (page === 1) {
                setIsLoading(true);
            } else {
                setIsLoadingMore(true);
            }
            
            try {
                // نمونه‌ی فراخوانی API (متدهای خودتان را جایگزین کنید)
                /*
                const payload: any = { 
                    companyId: companyId,
                    pageNumber: page,
                    pageSize: 15,
                    searchTerm: searchQuery // در صورت نیاز
                };

                const response = await apiSearchCampaigns<any>(payload);
                const items = response?.data?.items || response?.items || [];
                const count = response?.totalCount || 0; 
                
                setTotalCount(count);
                
                if (page === 1) {
                    setCampaigns(items);
                } else {
                    setCampaigns(prev => [...prev, ...items]);
                }

                setHasMore(items.length === 15);
                */
            } catch (error) {
                console.error("خطا در دریافت لیست کمپین‌ها:", error);
            } finally {
                setIsLoading(false);
                setIsLoadingMore(false);
            }
        };

        // برای جلوگیری از ریکوئست‌های تکراری حین تایپ در سرچ، معمولاً fetchCampaigns را در یک هوک Debounce می‌گذارند
        fetchCampaigns();
    }, [page, companyId]); // اگر searchQuery را به وابستگی‌ها اضافه کنید، با هر تایپ سرچ می‌کند

    // ==========================================
    // محاسبات محلی برای فیلتر کردن لیست (جستجوی Client-side)
    // ==========================================
    const filteredCampaigns = campaigns.filter(c => 
        (c.name?.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return {
        // استیت‌ها
        campaigns: filteredCampaigns, // لیست نهایی که در جدول رندر می‌شود
        searchQuery,
        setSearchQuery,
        
        // صفحه‌بندی
        page,
        setPage,
        hasMore,
        totalCount,
        
        // لودینگ‌ها
        isLoading,
        isLoadingMore,
        
        // سوکت
        // isConnected, // در صورت استفاده از هوک سوکت
        
        // متدهای کمکی برای آپدیت دستی (در صورت نیاز)
        setCampaigns
    };
};