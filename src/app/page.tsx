import StockTable from '@/components/StockTable';
import { Activity } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#050505] text-white p-6 md:p-12 lg:p-24 selection:bg-blue-500/30">
      {/* Background Glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/10 blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-14 relative z-10">
        
        {/* Header */}
        <header className="flex flex-col items-start gap-5 pt-8">
          <div className="flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-semibold tracking-wide shadow-[0_0_15px_rgba(59,130,246,0.15)]">
            <Activity className="w-4 h-4 animate-pulse" />
            <span>Live Market Data</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-white via-gray-200 to-gray-500 pb-2">
            Global Stock Explorer
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-3xl font-light leading-relaxed">
            แพลตฟอร์มสำหรับดูข้อมูลหุ้นทั่วโลกแบบ Real-time ติดตามผลประกอบการ มูลค่าตลาด และข่าวสารล่าสุดของบริษัทชั้นนำ
          </p>
        </header>

        {/* Dashboard Content */}
        <section className="animate-in fade-in slide-in-from-bottom-8 duration-700">
          <StockTable />
        </section>

      </div>
    </main>
  );
}
