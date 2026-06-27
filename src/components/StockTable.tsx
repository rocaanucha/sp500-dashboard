'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, ArrowUpDown, TrendingUp, TrendingDown, Clock } from 'lucide-react';

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

const KOSPI_TICKER_MAP: Record<string, string> = {
  "005930.KS": "SAMSUNG",
  "000660.KS": "SKHYNIX",
  "373220.KS": "LGENERGY",
  "207940.KS": "SAMSUNG-BIO",
  "005380.KS": "HYUNDAI",
  "000270.KS": "KIA",
  "068270.KS": "CELLTRION",
  "005490.KS": "POSCO",
  "105560.KS": "KBFIN",
  "006400.KS": "SAMSUNG-SDI",
  "035420.KS": "NAVER",
  "051910.KS": "LGCHEM",
  "035720.KS": "KAKAO",
  "055550.KS": "SHINHAN",
  "028260.KS": "SAMSUNG-C&T",
  "012330.KS": "HYUNDAI-MOBIS",
  "104700.KS": "SK-INNO",
  "003670.KS": "POSCO-CHEM",
  "096770.KS": "SK-INNO",
  "032830.KS": "SAMSUNG-LIFE",
  "011200.KS": "HMM",
  "323410.KS": "KAKAOBANK",
  "316140.KS": "WOORIFIN",
  "034730.KS": "SK",
  "018260.KS": "SAMSUNG-SDS",
  "066570.KS": "LGELEC",
  "086280.KS": "HYUNDAI-GLOVIS",
  "090430.KS": "AMOREPACIFIC",
  "015760.KS": "KEPCO",
  "034220.KS": "LGDISPLAY",
  "009150.KS": "SAMSUNG-ELEC-MECH",
  "003550.KS": "LG",
  "259960.KS": "KRAFTON",
  "011170.KS": "LOTTECHEM",
  "010950.KS": "S-OIL",
  "329180.KS": "HD-HYUNDAI",
  "000810.KS": "SAMSUNG-FIRE",
  "052690.KS": "KEPCO-E&C",
  "024110.KS": "IBK",
  "042660.KS": "HANWHA-OCEAN",
  "036570.KS": "NCSOFT",
  "086790.KS": "HANA-FIN",
  "000100.KS": "YUHAN",
  "030200.KS": "KT"
};

const CSI300_TICKER_MAP: Record<string, string> = {
  "600519.SS": "Moutai",
  "300750.SZ": "CATL",
  "600036.SS": "CMB",
  "601318.SS": "Ping An",
  "000858.SZ": "Wuliangye",
  "600900.SS": "CYP",
  "000333.SZ": "Midea",
  "601166.SS": "Ind. Bank",
  "600276.SS": "Hengrui",
  "002594.SZ": "BYD",
  "601012.SS": "LONGi",
  "603288.SS": "Foshan",
  "600030.SS": "CITIC",
  "300059.SZ": "East Money",
  "002415.SZ": "Hikvision",
  "601888.SS": "CTG Duty Free",
  "600887.SS": "Yili",
  "601328.SS": "BoCom",
  "002142.SZ": "Bank of Ningbo",
  "600000.SS": "SPD Bank",
  "000001.SZ": "Ping An Bank",
  "002714.SZ": "Muyuan",
  "300274.SZ": "Sungrow",
  "601398.SS": "ICBC",
  "000568.SZ": "Luzhou Laojiao",
  "601988.SS": "Bank of China",
  "601288.SS": "Agri Bank",
  "600028.SS": "Sinopec",
  "601857.SS": "PetroChina",
  "601628.SS": "China Life"
};

export default function StockTable() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({});
  const [marketInfo, setMarketInfo] = useState<{isOpen: boolean, text: string, nextOpen: string} | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [market, setMarket] = useState<'sp500' | 'set50' | 'nikkei225' | 'kospi200' | 'csi300'>('sp500');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [market, search]);

  useEffect(() => {
    const fetchData = () => {
      fetch(`/api/stocks?market=${market}&page=${currentPage}&limit=25&search=${encodeURIComponent(search)}`)
        .then(res => res.json())
        .then(data => {
          if (data.stocks) {
            setStocks(data.stocks);
            setMarketInfo(data.marketInfo);
            if (data.exchangeRates) {
              setExchangeRates(data.exchangeRates);
            }
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
    const delayDebounceFn = setTimeout(() => {
      fetchData();
    }, 300);

    const intervalId = setInterval(fetchData, 30000);
    return () => {
      clearTimeout(delayDebounceFn);
      clearInterval(intervalId);
    };
  }, [market, currentPage, search]);

  const sortedStocks = [...stocks].sort((a, b) => {
    if (sortOrder === 'desc') return b.marketCap - a.marketCap;
    return a.marketCap - b.marketCap;
  });

  const currencySymbol = market === 'set50' ? '฿' : market === 'nikkei225' ? '¥' : market === 'kospi200' ? '₩' : market === 'csi300' ? 'CN¥' : '$';

  const formatNumber = (num: number) => num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const formatMarketCap = (num: number) => {
    if (num >= 1e12) return `${currencySymbol}${formatNumber(num / 1e12)}T`;
    if (num >= 1e9) return `${currencySymbol}${formatNumber(num / 1e9)}B`;
    return `${currencySymbol}${formatNumber(num / 1e6)}M`;
  };

  const getUsdPrice = (price: number) => {
    if (market === 'set50' && exchangeRates.thb) return price / exchangeRates.thb;
    if (market === 'nikkei225' && exchangeRates.jpy) return price / exchangeRates.jpy;
    if (market === 'kospi200' && exchangeRates.krw) return price / exchangeRates.krw;
    if (market === 'csi300' && exchangeRates.cny) return price / exchangeRates.cny;
    return 0;
  };

  return (
    <div className="w-full">
      <div className="flex flex-col gap-4 mb-6">
        {/* Row 1: Market Selectors */}
        <div className="flex bg-gray-900/50 p-1 rounded-xl border border-gray-800 shadow-inner overflow-x-auto w-full">
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
          <button
            onClick={() => setMarket('kospi200')}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${market === 'kospi200' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
          >
            KOSPI 200 (KR)
          </button>
          <button
            onClick={() => setMarket('csi300')}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${market === 'csi300' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
          >
            CSI 300 (CN)
          </button>
        </div>
        
        {/* Row 2: Status & Search */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 w-full mt-2">
          {marketInfo && (
            <div className="flex flex-col items-start w-full md:w-auto gap-2 shrink-0">
            <div className={`relative overflow-hidden group flex flex-col md:flex-row items-center gap-3 px-5 py-3 rounded-2xl border backdrop-blur-md shadow-lg transition-all duration-300 w-full md:w-auto ${marketInfo.isOpen ? 'bg-gradient-to-r from-emerald-900/40 to-emerald-800/20 border-emerald-500/30 shadow-emerald-900/20' : 'bg-gradient-to-r from-gray-800/60 to-gray-900/40 border-gray-700/50 shadow-gray-900/50'}`}>
               
               {/* Animated Background Glow */}
               <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-r ${marketInfo.isOpen ? 'from-emerald-500/10 to-transparent' : 'from-gray-500/10 to-transparent'}`}></div>

               {/* Status Indicator & Text */}
               <div className="flex items-center gap-3 shrink-0">
                  <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-black/40 border border-white/5 shadow-inner">
                    <div className={`w-3 h-3 rounded-full ${marketInfo.isOpen ? 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,1)] animate-pulse' : 'bg-gray-500 shadow-inner'}`}></div>
                  </div>
                  <div className="flex flex-col">
                    <span className={`text-sm font-extrabold tracking-wider uppercase ${marketInfo.isOpen ? 'text-emerald-400' : 'text-gray-400'}`}>{marketInfo.text}</span>
                  </div>
               </div>

               {/* Divider for Desktop */}
               <div className={`hidden md:block w-px h-8 ${marketInfo.isOpen ? 'bg-emerald-500/20' : 'bg-gray-700/50'}`}></div>

               {/* Time Info */}
               <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/20 border border-white/5 shrink-0">
                  <Clock className={`w-3.5 h-3.5 ${marketInfo.isOpen ? 'text-emerald-500' : 'text-gray-500'}`} />
                  <span className={`text-xs font-semibold ${marketInfo.isOpen ? 'text-emerald-100/70' : 'text-gray-400'}`}>{marketInfo.nextOpen}</span>
               </div>
            </div>
            
            {/* Last Updated */}
            {lastUpdated && (
              <span className="text-[11px] font-medium text-gray-500 tracking-wider">
                อัปเดต: {lastUpdated.toLocaleTimeString('th-TH')}
              </span>
            )}
          </div>
          )}

          <div className="relative w-full md:max-w-sm ml-auto">
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
      </div>

      <div className="overflow-x-auto shadow-2xl rounded-2xl border border-gray-800 bg-gray-900/20 backdrop-blur-md">
        <table className="w-full text-sm text-left text-gray-300">
          <thead className="text-xs text-gray-400 uppercase bg-gray-900/60 border-b border-gray-800/80">
            <tr>
              <th scope="col" className="px-6 py-5 font-medium tracking-wider">Ticker / Name</th>
              <th scope="col" className="px-6 py-5 font-medium text-right tracking-wider">Price</th>
              <th scope="col" className="px-6 py-5 font-medium text-right tracking-wider">Change</th>
              <th scope="col" className="px-6 py-5 font-medium text-right tracking-wider">Div/Share</th>
              <th scope="col" className="px-6 py-5 font-medium text-right tracking-wider">Div Yield</th>
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
                            const displayTicker = NIKKEI_TICKER_MAP[stock.ticker] || KOSPI_TICKER_MAP[stock.ticker] || CSI300_TICKER_MAP[stock.ticker] || stock.ticker.replace('.BK', '').replace('.T', '').replace('.KS', '').replace('.SS', '').replace('.SZ', '');
                            e.currentTarget.parentElement!.innerHTML = `<span class="text-sm font-bold text-gray-400">${displayTicker.substring(0, 1)}</span>`;
                          }}
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-white text-base group-hover:text-blue-400 transition-colors">
                          {NIKKEI_TICKER_MAP[stock.ticker] || KOSPI_TICKER_MAP[stock.ticker] || CSI300_TICKER_MAP[stock.ticker] || stock.ticker.replace('.BK', '').replace('.T', '').replace('.KS', '').replace('.SS', '').replace('.SZ', '')}
                        </span>
                        <span className="text-xs text-gray-500 truncate max-w-[150px] mt-0.5">{stock.name}</span>
                      </div>
                    </Link>
                  </td>
                  <td className="px-6 py-5 text-right font-medium text-white text-base">
                    <div>{currencySymbol}{formatNumber(stock.price)}</div>
                    {getUsdPrice(stock.price) > 0 && (
                      <div className="text-xs text-gray-400 font-medium mt-0.5">
                        (${formatNumber(getUsdPrice(stock.price))})
                      </div>
                    )}
                  </td>
                  <td className={`px-6 py-5 text-right font-medium flex justify-end items-center ${stock.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    <span className={`flex items-center px-2 py-1 rounded-md ${stock.change >= 0 ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
                      {stock.change >= 0 ? <TrendingUp className="w-4 h-4 mr-1.5" /> : <TrendingDown className="w-4 h-4 mr-1.5" />}
                      {stock.change > 0 ? '+' : ''}{formatNumber(stock.change)}%
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right font-medium text-gray-300">
                    {stock.dividendRate ? `${currencySymbol}${formatNumber(stock.dividendRate)}` : <span className="text-gray-600">-</span>}
                  </td>
                  <td className="px-6 py-5 text-right font-medium text-emerald-400">
                    {(stock.dividendRate && stock.price) ? `${formatNumber((stock.dividendRate / stock.price) * 100)}%` : <span className="text-gray-600">-</span>}
                  </td>
                  <td className="px-6 py-5 text-right font-medium text-gray-400 text-sm">
                    {stock.dividendDate ? new Date(stock.dividendDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : <span className="text-gray-600">-</span>}
                  </td>
                  <td className="px-6 py-5 text-right font-medium">
                    {stock.peRatio ? formatNumber(stock.peRatio) : <span className="text-gray-600">N/A</span>}
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
