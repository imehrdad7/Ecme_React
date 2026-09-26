import { apiGetManagementOverview, ManagementOverview } from '../../services/DashboardService';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { apiGetDashboardMetrics, DashboardMetrics } from '../../services/DashboardService';
import { useDashboardStore } from '../../store/useDashboardStore';
import { socketManager } from '../../utils/SocketManager';

export const useDashboardMetrics = (companyId: string) => {
    const queryClient = useQueryClient();
    const { timeframe, selectedBot } = useDashboardStore();

    const queryKey = ['dashboardMetrics', companyId, timeframe, selectedBot];

    const query = useQuery({
        queryKey,
        queryFn: async () => {
            const response = await apiGetDashboardMetrics<DashboardMetrics>(companyId, timeframe, selectedBot);
            return response; 
        },
        staleTime: 5 * 60 * 1000, 
        refetchOnWindowFocus: false,
    });

    useEffect(() => {
        if (!companyId) return;

        // فلگ برای جلوگیری از مموری‌لیک در کامپوننت‌های Async
        let isSubscribed = true;

        const initSocket = async () => {
            const token = localStorage.getItem('token') || ''; // یا دریافت از AuthContext
            
            // استفاده از کلاس Singleton شما: اگر وصل باشد همان را می‌دهد، اگر نه وصل می‌شود
            const connection = await socketManager.connect(token);

            if (connection && isSubscribed) {
                // ۱. شنود آپدیت پیام‌ها
                connection.on("ReceiveNewMessage", (newMessage) => {
                    queryClient.setQueryData<DashboardMetrics>(queryKey, (oldData) => {
                        if (!oldData) return oldData;
                        
                        const updatedChart = [...oldData.chartData];
                        if (updatedChart.length > 0) {
                            const lastIndex = updatedChart.length - 1;
                            updatedChart[lastIndex] = {
                                ...updatedChart[lastIndex],
                                totalIncoming: updatedChart[lastIndex].totalIncoming + 1
                            };
                        }

                        return {
                            ...oldData,
                            totalMessages: oldData.totalMessages + 1,
                            chartData: updatedChart
                        };
                    });
                });

                // ۲. شنود آپدیت هنداُورها
                connection.on("ConversationUpdated", (conversationId, action, assigneeUserId) => {
                    if (action === "Assigned") {
                        queryClient.setQueryData<DashboardMetrics>(queryKey, (oldData) => {
                            if (!oldData) return oldData;
                            return { ...oldData, handovers: oldData.handovers + 1 };
                        });
                    }
                });
            }
        };

        initSocket();

        // 🌟 کلین‌آپ بهینه: فقط گوش‌دادن‌های مربوط به داشبورد را لغو می‌کنیم، سوکت را نمی‌کشیم!
        return () => {
            isSubscribed = false;
            const connection = socketManager.getConnection();
            if (connection) {
                connection.off("ReceiveNewMessage");
                connection.off("ConversationUpdated");
            }
        };
    }, [companyId, queryClient, queryKey]);

    return query;
};


export const useManagementOverview = (companyId: string) => {
    return useQuery({
        queryKey: ['managementOverview', companyId],
        queryFn: async () => {
            const response = await apiGetManagementOverview<ManagementOverview>(companyId);
            return response;
        },
        staleTime: 5 * 60 * 1000,
        refetchInterval: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        enabled: !!companyId,
    });
};