import { create } from 'zustand';

interface DashboardState {
    timeframe: '24h' | '7d' | '30d';
    selectedBot: string;
    setTimeframe: (timeframe: '24h' | '7d' | '30d') => void;
    setSelectedBot: (botId: string) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
    timeframe: '7d',
    selectedBot: 'all',
    setTimeframe: (timeframe) => set({ timeframe }),
    setSelectedBot: (selectedBot) => set({ selectedBot }),
}));