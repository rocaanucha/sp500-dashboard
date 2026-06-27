import { NextRequest, NextResponse } from 'next/server';
import YahooFinance from 'yahoo-finance2';
const yahooFinance = new YahooFinance();
import { TOP_SP500_TICKERS, SET50_TICKERS, NIKKEI225_TICKERS, KOSPI200_TICKERS, CSI300_TICKERS } from '@/lib/constants';

let cachedSP500Quotes: any[] = [];
let cachedSP500Time: number = 0;
let cachedSET50Quotes: any[] = [];
let cachedSET50Time: number = 0;
let cachedNikkeiQuotes: any[] = [];
let cachedNikkeiTime: number = 0;
let cachedKospiQuotes: any[] = [];
let cachedKospiTime: number = 0;
let cachedCSI300Quotes: any[] = [];
let cachedCSI300Time: number = 0;
let cachedExchangeRates: Record<string, number> = {};
let cachedExchangeRatesTime: number = 0;
const CACHE_TTL = 60000; // 1 minute


function getMarketInfo(market: string, marketState: string) {
  const isUS = market === 'sp500';
  const isJP = market === 'nikkei225';
  const isKR = market === 'kospi200';
  const isCN = market === 'csi300';
  const tz = isUS ? 'America/New_York' : isJP ? 'Asia/Tokyo' : isKR ? 'Asia/Seoul' : isCN ? 'Asia/Shanghai' : 'Asia/Bangkok';
  const openTimeStr = isUS ? '09:30' : isJP ? '09:00' : isKR ? '09:00' : isCN ? '09:30' : '10:00';
  const closeTimeStr = isUS ? '16:00' : isJP ? '15:00' : isKR ? '15:30' : isCN ? '15:00' : '16:30';
  const tzName = isUS ? 'เวลาอเมริกา' : isJP ? 'เวลาญี่ปุ่น' : isKR ? 'เวลาเกาหลี' : isCN ? 'เวลาจีน' : 'เวลาไทย';
  
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: tz, hour: 'numeric', minute: 'numeric', weekday: 'short', hour12: false
  });
  const parts = formatter.formatToParts(now);
  const hour = parseInt(parts.find(p => p.type === 'hour')?.value || '0');
  const minute = parseInt(parts.find(p => p.type === 'minute')?.value || '0');
  const weekday = parts.find(p => p.type === 'weekday')?.value || 'Mon';
  
  const isWeekend = weekday === 'Sat' || weekday === 'Sun';
  const currentTime = hour + minute / 60;
  const openTimeNum = isUS ? 9.5 : isJP ? 9 : isKR ? 9 : isCN ? 9.5 : 10;
  const closeTimeNum = isUS ? 16 : isJP ? 15 : isKR ? 15.5 : isCN ? 15 : 16.5;
  
  let isOpen = false;
  if (marketState) {
     isOpen = marketState === 'REGULAR';
  } else {
     isOpen = !isWeekend && currentTime >= openTimeNum && currentTime < closeTimeNum;
  }
  
  let nextOpenDay = '';
  if (isWeekend) {
    nextOpenDay = 'วันจันทร์';
  } else if (currentTime < openTimeNum) {
    nextOpenDay = 'วันนี้';
  } else if (currentTime >= closeTimeNum) {
    nextOpenDay = weekday === 'Fri' ? 'วันจันทร์' : 'พรุ่งนี้';
  }
  
  return {
    isOpen,
    text: isOpen ? 'ตลาดเปิดทำการ' : 'ตลาดปิดทำการ',
    nextOpen: !isOpen ? `เปิดรอบถัดไป: ${nextOpenDay} เวลา ${openTimeStr} น. (${tzName})` : `เวลาทำการ: จ-ศ ${openTimeStr} - ${closeTimeStr} น. (${tzName})`
  };
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const market = searchParams.get('market');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    const isSP500 = market === 'sp500';
    const isNikkei = market === 'nikkei225';
    const isKospi = market === 'kospi200';
    const isCSI300 = market === 'csi300';
    const allTickers = isSP500 ? TOP_SP500_TICKERS : isNikkei ? NIKKEI225_TICKERS : isKospi ? KOSPI200_TICKERS : isCSI300 ? CSI300_TICKERS : SET50_TICKERS;
    const now = Date.now();
    let sortedQuotes: any[] = [];

    if (isSP500) {
      if (now - cachedSP500Time > CACHE_TTL || cachedSP500Quotes.length === 0) {
        const quotes = await yahooFinance.quote(allTickers).catch(err => {
          console.error('Yahoo Finance Quote Error (SP500):', err);
          return [];
        });
        cachedSP500Quotes = quotes.sort((a, b) => (b.marketCap || 0) - (a.marketCap || 0));
        cachedSP500Time = now;
      }
      sortedQuotes = cachedSP500Quotes;
    } else if (isNikkei) {
      if (now - cachedNikkeiTime > CACHE_TTL || cachedNikkeiQuotes.length === 0) {
        const quotes = await yahooFinance.quote(allTickers).catch(err => {
          console.error('Yahoo Finance Quote Error (Nikkei):', err);
          return [];
        });
        cachedNikkeiQuotes = quotes.sort((a, b) => (b.marketCap || 0) - (a.marketCap || 0));
        cachedNikkeiTime = now;
      }
      sortedQuotes = cachedNikkeiQuotes;
    } else if (isKospi) {
      if (now - cachedKospiTime > CACHE_TTL || cachedKospiQuotes.length === 0) {
        const quotes = await yahooFinance.quote(allTickers).catch(err => {
          console.error('Yahoo Finance Quote Error (Kospi):', err);
          return [];
        });
        cachedKospiQuotes = quotes.sort((a, b) => (b.marketCap || 0) - (a.marketCap || 0));
        cachedKospiTime = now;
      }
      sortedQuotes = cachedKospiQuotes;
    } else if (isCSI300) {
      if (now - cachedCSI300Time > CACHE_TTL || cachedCSI300Quotes.length === 0) {
        const quotes = await yahooFinance.quote(allTickers).catch(err => {
          console.error('Yahoo Finance Quote Error (CSI300):', err);
          return [];
        });
        cachedCSI300Quotes = quotes.sort((a, b) => (b.marketCap || 0) - (a.marketCap || 0));
        cachedCSI300Time = now;
      }
      sortedQuotes = cachedCSI300Quotes;
    } else {
      if (now - cachedSET50Time > CACHE_TTL || cachedSET50Quotes.length === 0) {
        const quotes = await yahooFinance.quote(allTickers).catch(err => {
          console.error('Yahoo Finance Quote Error (SET50):', err);
          return [];
        });
        cachedSET50Quotes = quotes.sort((a, b) => (b.marketCap || 0) - (a.marketCap || 0));
        cachedSET50Time = now;
      }
      sortedQuotes = cachedSET50Quotes;
    }

    const totalPages = Math.ceil(sortedQuotes.length / limit);
    const startIdx = (page - 1) * limit;
    const paginatedQuotes = sortedQuotes.slice(startIdx, startIdx + limit);
    
    // Fetch FX rates (cache for 10 mins)
    if (now - cachedExchangeRatesTime > CACHE_TTL * 10 || Object.keys(cachedExchangeRates).length === 0) {
      const fxQuotes = await yahooFinance.quote(['THB=X', 'JPY=X', 'KRW=X', 'CNY=X']).catch(() => []);
      fxQuotes.forEach(q => {
        if (q.symbol === 'THB=X') cachedExchangeRates['thb'] = q.regularMarketPrice || 1;
        if (q.symbol === 'JPY=X') cachedExchangeRates['jpy'] = q.regularMarketPrice || 1;
        if (q.symbol === 'KRW=X') cachedExchangeRates['krw'] = q.regularMarketPrice || 1;
        if (q.symbol === 'CNY=X') cachedExchangeRates['cny'] = q.regularMarketPrice || 1;
      });
      cachedExchangeRatesTime = now;
    }

    const stocks = paginatedQuotes.map(q => ({
      ticker: q.symbol,
      name: q.shortName || q.longName || q.symbol,
      price: q.regularMarketPrice || 0,
      change: q.regularMarketChangePercent || 0,
      peRatio: q.trailingPE || null,
      marketCap: q.marketCap || 0,
      dividendRate: q.dividendRate || null,
      dividendDate: q.dividendDate ? new Date(q.dividendDate).toISOString().split('T')[0] : null,
    }));

    const rawMarketState = sortedQuotes[0]?.marketState || '';
    const marketInfo = getMarketInfo(market || 'sp500', rawMarketState);

    return NextResponse.json({ 
      stocks, 
      marketInfo,
      exchangeRates: cachedExchangeRates,
      pagination: { currentPage: page, totalPages, totalItems: allTickers.length }
    });
  } catch (error) {
    console.error('Error fetching stock list:', error);
    return NextResponse.json({ error: 'Failed to fetch stocks' }, { status: 500 });
  }
}
