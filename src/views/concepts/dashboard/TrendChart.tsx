import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { ChartDataPoint } from '@/services/DashboardService';

interface TrendChartProps {
    data: ChartDataPoint[];
}

const TrendChart = ({ data }: TrendChartProps) => {
    return (
        <div className="w-full h-64 mt-6" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis 
                        dataKey="time" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#9ca3af', fontSize: 12 }} 
                        dy={10} 
                    />
                    <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#9ca3af', fontSize: 12 }} 
                    />
                    <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ fontWeight: 'bold' }}
                    />
                    <Line 
                        type="monotone" 
                        dataKey="totalIncoming" 
                        name="کل ورودی" 
                        stroke="#6366f1" 
                        strokeWidth={3} 
                        dot={false} 
                        activeDot={{ r: 6 }} 
                    />
                    <Line 
                        type="monotone" 
                        dataKey="botResolved" 
                        name="حل شده (ربات)" 
                        stroke="#f59e0b" 
                        strokeWidth={3} 
                        strokeDasharray="5 5" 
                        dot={false} 
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default TrendChart;