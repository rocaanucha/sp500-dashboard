'use client';

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

interface ChartData {
  date: string;
  price: number;
}

export default function PriceChart({ data, ticker, currencySymbol = '$' }: { data: ChartData[], ticker: string, currencySymbol?: string }) {
  if (!data || data.length === 0) {
    return <div className="h-64 flex items-center justify-center text-gray-500 border border-gray-800 rounded-xl bg-gray-900/30">No chart data available for {ticker}.</div>;
  }

  // Formatting date to short format like 'Jan 15'
  const formatXAxis = (tickItem: string) => {
    const date = new Date(tickItem);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Determine if the trend is positive or negative for coloring
  const isPositive = data[data.length - 1].price >= data[0].price;
  const color = isPositive ? '#10b981' : '#f43f5e'; // emerald-500 or rose-500

  return (
    <div className="h-[400px] w-full p-6 bg-gray-900/40 border border-gray-800/80 rounded-3xl backdrop-blur-sm shadow-xl">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.4} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="date" 
            tickFormatter={formatXAxis} 
            stroke="#4b5563" 
            tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 500 }} 
            tickLine={false}
            axisLine={false}
            minTickGap={40}
          />
          <YAxis 
            domain={['auto', 'auto']} 
            stroke="#4b5563" 
            tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 500 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `$${value}`}
          />
          <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#1f2937" opacity={0.6} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#030712', border: '1px solid #1f2937', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
            itemStyle={{ color: '#fff', fontWeight: 'bold' }}
            labelStyle={{ color: '#9ca3af', marginBottom: '4px' }}
            labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            formatter={(value: any) => {
              const numValue = typeof value === 'number' ? value : Number(value) || 0;
              return [`$${numValue.toFixed(2)}`, 'Close Price'];
            }}
          />
          <Area 
            type="monotone" 
            dataKey="price" 
            stroke={color} 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorPrice)" 
            animationDuration={1500}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
