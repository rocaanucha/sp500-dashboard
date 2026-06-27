'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, TrendingDown, Activity, AlignLeft, Newspaper, ExternalLink } from 'lucide-react';
import PriceChart from '@/components/PriceChart';
import FinancialSummary from '@/components/FinancialSummary';

export default function StockDetail() {
  const params = useParams();
  const router = useRouter();
  // Next.js 15+ allows useParams directly in client components without async if it's standard, but it returns string or string[].
  const ticker = typeof params.ticker === 'string' ? params.ticker.toUpperCase() : '';

  const [data, setData] = useState<any>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!ticker) return;
    
    const fetchData = () => {
      fetch(`/api/stocks/${ticker}`)
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch data');
          return res.json();
        })
        .then(json => {
          setData(json);
          setLastUpdated(new Date());
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setError(err.message);
          setLoading(false);
        });
    };

    fetchData();

    const intervalId = setInterval(fetchData, 30000);
    return () => clearInterval(intervalId);
  }, [ticker]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 to-purple-900/10" />
        <div className="inline-block h-14 w-14 animate-spin rounded-full border-4 border-solid border-blue-500/30 border-r-blue-500 mb-6 relative z-10"></div>
        <p className="text-xl font-medium tracking-wide text-gray-300 animate-pulse relative z-10">กำลังวิเคราะห์ข้อมูล {ticker}...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white">
        <h2 className="text-3xl font-bold text-rose-500 mb-4">เกิดข้อผิดพลาดในการโหลดข้อมูล</h2>
        <p className="text-gray-400 mb-8 text-lg">{error || 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ'}</p>
        <button onClick={() => router.back()} className="px-6 py-3 bg-gray-800 hover:bg-gray-700 transition-colors rounded-xl flex items-center gap-2 font-medium">
          <ArrowLeft className="w-5 h-5" /> กลับสู่หน้าหลัก
        </button>
      </div>
    );
  }

  const isThaiStock = data.ticker.endsWith('.BK');
  const currencySymbol = isThaiStock ? '฿' : '$';

  return (
    <main className="min-h-screen bg-[#050505] text-white p-6 md:p-12 lg:p-24 selection:bg-blue-500/30 relative">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-[50%] h-[50%] rounded-full bg-blue-600/5 blur-[150px] pointer-events-none" />
      
      <div className="max-w-6xl mx-auto space-y-12 relative z-10">
        
        {/* Navigation & Header */}
        <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors font-medium">
            <ArrowLeft className="w-4 h-4" /> กลับสู่หน้าหลัก
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gray-800 flex items-center justify-center overflow-hidden shrink-0 shadow-lg border border-gray-700/50 relative">
                <img 
                  src={`https://financialmodelingprep.com/image-stock/${data.ticker}.png`} 
                  alt={`${data.ticker} logo`} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.innerHTML = `<span class="text-2xl font-bold text-gray-400">${data.ticker.replace('.BK', '').substring(0, 1)}</span>`;
                  }}
                />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 text-xs font-bold tracking-wider bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/20">
                    {data.ticker.replace('.BK', '')}
                  </span>
                  <span className="text-gray-500 text-sm font-medium">หุ้น (EQUITY)</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">{data.name}</h1>
              </div>
            </div>
            
            <div className="text-left md:text-right">
              <p className="text-6xl font-extrabold tracking-tighter">{currencySymbol}{data.price?.toFixed(2)}</p>
              <div className={`inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-lg font-bold text-lg ${data.change >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                {data.change >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                {data.change > 0 ? '+' : ''}{data.change?.toFixed(2)}%
              </div>
              {lastUpdated && (
                <div className="text-xs text-gray-500 mt-3 font-medium">
                  อัปเดตล่าสุด: {lastUpdated.toLocaleDateString('th-TH')} เวลา {lastUpdated.toLocaleTimeString('th-TH')}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Company Description & Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150 fill-mode-both">
          <div className="lg:col-span-2 bg-gray-900/30 p-8 rounded-3xl border border-gray-800/80 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-4">
              <AlignLeft className="w-5 h-5 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-200">เกี่ยวกับบริษัท</h3>
            </div>
            <p className="text-gray-400 leading-relaxed text-sm md:text-base">
              {data.description || 'ไม่มีข้อมูลรายละเอียดของบริษัทนี้'}
            </p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
            <div className="bg-gray-900/30 p-6 rounded-3xl border border-gray-800/80 backdrop-blur-sm flex-1 flex flex-col justify-center">
              <p className="text-gray-500 text-sm font-medium tracking-wide mb-1 uppercase">มูลค่าตลาด (Market Cap)</p>
              <p className="text-2xl font-bold tracking-tight">
                {data.marketCap >= 1e12 ? `${currencySymbol}${(data.marketCap / 1e12).toFixed(2)}T` : 
                 data.marketCap >= 1e9 ? `${currencySymbol}${(data.marketCap / 1e9).toFixed(2)}B` : 
                 `${currencySymbol}${(data.marketCap / 1e6).toFixed(2)}M`}
              </p>
            </div>
            <div className="bg-gray-900/30 p-6 rounded-3xl border border-gray-800/80 backdrop-blur-sm flex-1 flex flex-col justify-center">
              <p className="text-gray-500 text-sm font-medium tracking-wide mb-1 uppercase">อัตราส่วน P/E (TTM)</p>
              <p className="text-2xl font-bold tracking-tight">{data.peRatio ? data.peRatio.toFixed(2) : 'N/A'}</p>
            </div>
            <div className="bg-gray-900/30 p-6 rounded-3xl border border-gray-800/80 backdrop-blur-sm flex-1 flex flex-col justify-center">
              <p className="text-gray-500 text-sm font-medium tracking-wide mb-1 uppercase">เงินปันผล/หน่วย</p>
              <p className="text-2xl font-bold tracking-tight text-emerald-400">{data.dividendRate ? `${currencySymbol}${data.dividendRate.toFixed(2)}` : '-'}</p>
            </div>
            <div className="bg-gray-900/30 p-6 rounded-3xl border border-gray-800/80 backdrop-blur-sm flex-1 flex flex-col justify-center">
              <p className="text-gray-500 text-sm font-medium tracking-wide mb-1 uppercase">วันที่จ่ายปันผลล่าสุด</p>
              <p className="text-2xl font-bold tracking-tight text-blue-400">
                {data.dividendDate ? new Date(data.dividendDate).toLocaleDateString('th-TH', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}
              </p>
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-both">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-500/10 rounded-xl">
              <Activity className="w-6 h-6 text-blue-400" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight">ผลประกอบการย้อนหลัง 6 เดือน</h2>
          </div>
          <PriceChart data={data.chartData} ticker={data.ticker} currencySymbol={currencySymbol} />
        </section>

        {/* Financials Section */}
        <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500 fill-mode-both">
          <h2 className="text-3xl font-bold tracking-tight mb-8">สรุปงบการเงิน</h2>
          <FinancialSummary financials={data.financials} currencySymbol={currencySymbol} />
        </section>

        {/* News Section */}
        <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-700 fill-mode-both pb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-500/10 rounded-xl">
              <Newspaper className="w-6 h-6 text-purple-400" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight">ข่าวสารที่เกี่ยวข้อง (News)</h2>
          </div>
          
          {data.news && data.news.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.news.map((item: any, idx: number) => (
                <a 
                  key={idx} 
                  href={item.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-gray-900/40 border border-gray-800/80 p-5 rounded-2xl hover:bg-gray-800/60 transition-colors flex flex-col justify-between group backdrop-blur-sm"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-purple-400 bg-purple-500/10 px-2 py-1 rounded-md border border-purple-500/20">{item.publisher}</span>
                      <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-200 line-clamp-2 leading-tight group-hover:text-blue-400 transition-colors">
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-500 mt-4">
                    {new Date(item.publishedAt).toLocaleDateString('th-TH', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })} น.
                  </p>
                </a>
              ))}
            </div>
          ) : (
            <div className="bg-gray-900/40 border border-gray-800/80 p-8 rounded-3xl backdrop-blur-sm flex flex-col items-center justify-center text-center">
              <Newspaper className="w-12 h-12 text-gray-600 mb-4" />
              <p className="text-gray-400 text-lg">ยังไม่มีข่าวสารล่าสุดของบริษัทนี้จากระบบส่วนกลาง</p>
            </div>
          )}
        </section>

      </div>
    </main>
  );
}
