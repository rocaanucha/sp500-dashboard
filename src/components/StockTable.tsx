'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, ArrowUpDown, TrendingUp, TrendingDown } from 'lucide-react';

interface Stock {
  ticker: string;
  name: string;
  price: number;
  change: number;
  peRatio: number | null;
  marketCap: number;
  dividendRate: number | null;
  dividendDate: string | null;
}

const NIKKEI_TICKER_MAP: Record<string, string> = {
  "7203.T": "TM",       // Toyota
  "6758.T": "SONY",     // Sony
  "9983.T": "FRCOY",    // Fast Retailing
  "8035.T": "TOELY",    // Tokyo Electron
  "8306.T": "MUFG",     // Mitsubishi UFJ
  "6861.T": "KYCCY",    // Keyence
  "9432.T": "NTTYY",    // NTT
  "8058.T": "MSBHF",    // Mitsubishi Corp
  "6501.T": "HTHIY",    // Hitachi
  "4063.T": "SHECY",    // Shin-Etsu
  "8316.T": "SMFG",     // Sumitomo Mitsui
  "7974.T": "NTDOY",    // Nintendo
  "8001.T": "ITOCY",    // Itochu
  "7267.T": "HMC",      // Honda
  "6902.T": "DNZOY",    // Denso
  "6098.T": "RCRUY",    // Recruit
  "8031.T": "MITSY",    // Mitsui & Co
  "9984.T": "SFTBY",    // SoftBank
  "6594.T": "NJDCY",    // Nidec
  "6367.T": "DKILY",    // Daikin
  "4502.T": "TAK",      // Takeda
  "4568.T": "DSNKY",    // Daiichi Sankyo
  "4519.T": "CHGCY",    // Chugai
  "3382.T": "SVNDY",    // Seven & i
  "8766.T": "TKOMY",    // Tokio Marine
  "6702.T": "FJTSY",    // Fujitsu
  "6981.T": "MRAAY",    // Murata
  "7741.T": "HOCPY",    // HOYA
  "7269.T": "SZKMY",    // Suzuki
  "8053.T": "SSUMY",    // Sumitomo Corp
  "4452.T": "KCRPY",    // Kao
  "4901.T": "FUJIY",    // Fujifilm
  "6723.T": "RNECY",    // Renesas
  "8411.T": "MFG",      // Mizuho
  "2914.T": "JAPAY",    // JT
  "9022.T": "CJPRY",    // JR Central
  "9433.T": "KDDIY",    // KDDI
  "9020.T": "EAJNY",    // JR East
  "7201.T": "NSANY",    // Nissan
  "6503.T": "MIELY",    // Mitsubishi Electric
  "6954.T": "FANUY",    // Fanuc
  "1925.T": "DWAHY",    // Daiwa House
  "9735.T": "SOMLY",    // Secom
  "7751.T": "CAJ",      // Canon
  "2502.T": "ASBRY"     // Asahi
};

export default function StockTable() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [marketInfo, setMarketInfo] = useState<{isOpen: boolean, text: string, nextOpen: string} | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [market, setMarket] = useState<'sp500' | 'set50' | 'nikkei225'>('sp500');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [market]);

  useEffect(() => {
    const fetchData = () => {
      fetch(`/api/stocks?market=${market}&page=${currentPage}&limit=25`)
        .then(res => res.json())
        .then(data => {
          if (data.stocks) {
            setStocks(data.stocks);
            setMarketInfo(data.marketInfo);
            if (data.pagination) {
              setTotalPages(data.pagination.totalPages);
            }
          } else {
            setStocks(data);
          }
          setLastUpdated(new Date());
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    };

    setLoading(true);
    fetchData();

    const intervalId = setInterval(fetchData, 30000);
    return () => clearInterval(intervalId);
  }, [market, currentPage]);

  const filteredStocks = stocks.filter(s => 

    s.ticker.toLowerCase().includes(search.toLowerCase()) || 
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const sortedStocks = [...filteredStocks].sort((a, b) => {
    if (sortOrder === 'desc') return b.marketCap - a.marketCap;
    return a.marketCap - b.marketCap;
  });

  const currencySymbol = market === 'set50' ? '฿' : market === 'nikkei225' ? '¥' : '$';

  const formatMarketCap = (num: number) => {
    if (num >= 1e12) return `${currencySymbol}${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `${currencySymbol}${(num / 1e9).toFixed(2)}B`;
    return `${currencySymbol}${(num / 1e6).toFixed(2)}M`;
  };

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div className="flex bg-gray-900/50 p-1 rounded-xl border border-gray-800 shadow-inner overflow-x-auto w-full md:w-auto shrink-0">
          <button
            onClick={() => setMarket('sp500')}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${market === 'sp500' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
          >
            S&P 500 (US)
          </button>
          <button
            onClick={() => setMarket('set50')}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${market === 'set50' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
          >
            SET50 (THAI)
          </button>
          <button
            onClick={() => setMarket('nikkei225')}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${market === 'nikkei225' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
          >
            Nikkei 225 (JP)
          </button>
        </div>
        
        {marketInfo && (
          <div className="flex flex-col items-center md:items-end w-full md:w-auto">
            <div className={`px-5 py-3 rounded-xl flex flex-col items-center md:items-end border backdrop-blur-sm w-full md:w-auto ${marketInfo.isOpen ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-gray-800/50 border-gray-700/50'}`}>
               <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${marketInfo.isOpen ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-gray-500'}`}></div>
                  <span className={`text-sm font-bold tracking-wide ${marketInfo.isOpen ? 'text-emerald-400' : 'text-gray-400'}`}>{marketInfo.text}</span>
               </div>
               <span className="text-xs text-gray-500 mt-1 font-medium">{marketInfo.nextOpen}</span>
            </div>
            {lastUpdated && (
              <span className="text-xs text-gray-500 mt-2 font-medium">
                อัปเดตล่าสุด: {lastUpdated.toLocaleDateString('th-TH')} เวลา {lastUpdated.toLocaleTimeString('th-TH')}
              </span>
            )}
          </div>
        )}

        <div className="relative w-full max-w-md mt-4 md:mt-0">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input 
            type="text" 
            className="bg-gray-900 border border-gray-700/50 text-white text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-3 placeholder-gray-500 shadow-inner" 
            placeholder="Search by Ticker or Name..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-x-auto shadow-2xl rounded-2xl border border-gray-800 bg-gray-900/20 backdrop-blur-md">
        <table className="w-full text-sm text-left text-gray-300">
          <thead className="text-xs text-gray-400 uppercase bg-gray-900/60 border-b border-gray-800/80">
            <tr>
              <th scope="col" className="px-6 py-5 font-medium tracking-wider">Ticker / Name</th>
              <th scope="col" className="px-6 py-5 font-medium text-right tracking-wider">Price</th>
              <th scope="col" className="px-6 py-5 font-medium text-right tracking-wider">Change</th>
              <th scope="col" className="px-6 py-5 font-medium text-right tracking-wider">Div/Share</th>
              <th scope="col" className="px-6 py-5 font-medium text-right tracking-wider">Div Date</th>
              <th scope="col" className="px-6 py-5 font-medium text-right tracking-wider">P/E Ratio</th>
              <th scope="col" className="px-6 py-5 font-medium text-right cursor-pointer hover:text-white flex items-center justify-end group tracking-wider transition-colors" onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}>
                Market Cap
                <ArrowUpDown className="w-4 h-4 ml-2 opacity-50 group-hover:opacity-100 transition-opacity" />
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-16 text-center text-gray-500">
                  <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-blue-500/30 border-r-blue-500 align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                  <p className="mt-4 text-sm font-medium tracking-wide">Fetching live market data...</p>
                </td>
              </tr>
            ) : sortedStocks.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-16 text-center text-gray-500 font-medium">
                  No stocks found matching your search.
                </td>
              </tr>
            ) : (
              sortedStocks.map((stock) => (
                <tr key={stock.ticker} className="border-b border-gray-800/50 hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-5 whitespace-nowrap">
                    <Link href={`/stock/${stock.ticker}`} className="flex items-center gap-4 group">
                      <div className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden shrink-0 border border-gray-700/50 relative">
                        <img 
                          src={`https://financialmodelingprep.com/image-stock/${stock.ticker}.png`} 
                          alt={`${stock.ticker} logo`} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const displayTicker = NIKKEI_TICKER_MAP[stock.ticker] || stock.ticker.replace('.BK', '').replace('.T', '');
                            e.currentTarget.parentElement!.innerHTML = `<span class="text-sm font-bold text-gray-400">${displayTicker.substring(0, 1)}</span>`;
                          }}
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-white text-base group-hover:text-blue-400 transition-colors">
                          {NIKKEI_TICKER_MAP[stock.ticker] || stock.ticker.replace('.BK', '').replace('.T', '')}
                        </span>
                        <span className="text-xs text-gray-500 truncate max-w-[150px] mt-0.5">{stock.name}</span>
                      </div>
                    </Link>
                  </td>
                  <td className="px-6 py-5 text-right font-medium text-white text-base">
                    {currencySymbol}{stock.price.toFixed(2)}
                  </td>
                  <td className={`px-6 py-5 text-right font-medium flex justify-end items-center ${stock.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    <span className={`flex items-center px-2 py-1 rounded-md ${stock.change >= 0 ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
                      {stock.change >= 0 ? <TrendingUp className="w-4 h-4 mr-1.5" /> : <TrendingDown className="w-4 h-4 mr-1.5" />}
                      {stock.change > 0 ? '+' : ''}{stock.change.toFixed(2)}%
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right font-medium text-gray-300">
                    {stock.dividendRate ? `${currencySymbol}${stock.dividendRate.toFixed(2)}` : <span className="text-gray-600">-</span>}
                  </td>
                  <td className="px-6 py-5 text-right font-medium text-gray-400 text-sm">
                    {stock.dividendDate ? new Date(stock.dividendDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : <span className="text-gray-600">-</span>}
                  </td>
                  <td className="px-6 py-5 text-right font-medium">
                    {stock.peRatio ? stock.peRatio.toFixed(2) : <span className="text-gray-600">N/A</span>}
                  </td>
                  <td className="px-6 py-5 text-right text-gray-300 font-medium tracking-wide">
                    {formatMarketCap(stock.marketCap)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        
        {/* Pagination Controls */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-800/80 bg-gray-900/40">
            <span className="text-sm text-gray-400 font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-5 py-2 rounded-xl text-sm font-bold bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all border border-gray-700/50 shadow-sm"
              >
                Previous
              </button>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-5 py-2 rounded-xl text-sm font-bold bg-blue-600/80 text-white hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all border border-blue-500/30 shadow-sm"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
