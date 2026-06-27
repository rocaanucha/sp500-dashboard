import { DollarSign, PieChart, Landmark, CreditCard } from 'lucide-react';

interface Financials {
  revenue: number | null;
  netIncome: number | null;
  totalAssets: number | null;
  totalLiabilities: number | null;
}

export default function FinancialSummary({ financials, currencySymbol = '$' }: { financials: Financials, currencySymbol?: string }) {
  const formatCurrency = (num: number | null) => {
    if (num === null || num === undefined) return 'N/A';
    
    const formatNumber = (val: number) => val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    
    if (num >= 1e12) return `${currencySymbol}${formatNumber(num / 1e12)}T`;
    if (num >= 1e9) return `${currencySymbol}${formatNumber(num / 1e9)}B`;
    if (num >= 1e6) return `${currencySymbol}${formatNumber(num / 1e6)}M`;
    return `${currencySymbol}${num.toLocaleString('en-US')}`;
  };

  const cards = [
    { title: 'รายได้รวม (Total Revenue)', value: formatCurrency(financials.revenue), icon: DollarSign, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    { title: 'กำไรสุทธิ (Net Income)', value: formatCurrency(financials.netIncome), icon: PieChart, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    { title: 'สินทรัพย์รวม (Total Assets)', value: formatCurrency(financials.totalAssets), icon: Landmark, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
    { title: 'หนี้สินรวม (Total Liabilities)', value: formatCurrency(financials.totalLiabilities), icon: CreditCard, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      {cards.map((card, idx) => (
        <div key={idx} className={`p-6 rounded-3xl border ${card.border} bg-gray-900/40 backdrop-blur-md flex flex-col gap-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-${card.color.split('-')[1]}-500/10`}>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${card.bg}`}>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>
            <h3 className="text-gray-400 font-medium text-sm tracking-wide">{card.title}</h3>
          </div>
          <p className="text-3xl font-bold text-white tracking-tight">{card.value}</p>
        </div>
      ))}
    </div>
  );
}
