import { NextRequest, NextResponse } from 'next/server';
import YahooFinance from 'yahoo-finance2';
const yahooFinance = new YahooFinance();
import { TOP_SP500_TICKERS, SET50_TICKERS, NIKKEI225_TICKERS } from '@/lib/constants';

let cachedSP500Quotes: any[] = [];
let cachedSP500Time: number = 0;
let cachedSET50Quotes: any[] = [];
let cachedSET50Time: number = 0;
let cachedNikkeiQuotes: any[] = [];
let cachedNikkeiTime: number = 0;
const CACHE_TTL = 60000; // 1 minute


function getMarketInfo(market: string, marketState: string) {
  const isUS = market === 'sp500';
  const isJP = market === 'nikkei225';
  const tz = isUS ? 'America/New_York' : isJP ? 'Asia/Tokyo' : 'Asia/Bangkok';
  const openTimeStr = isUS ? '09:30' : isJP ? '09:00' : '10:00';
  const closeTimeStr = isUS ? '16:00' : isJP ? '15:00' : '16:30';
  const tzName = isUS ? 'เวลาอเมริกา' : isJP ? 'เวลาญี่ปุ่น' : 'เวลาไทย';
  
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
  const openTimeNum = isUS ? 9.5 : isJP ? 9 : 10;
  const closeTimeNum = isUS ? 16 : isJP ? 15 : 16.5;
  
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
    const allTickers = isSP500 ? TOP_SP500_TICKERS : isNikkei ? NIKKEI225_TICKERS : SET50_TICKERS;
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
      pagination: { currentPage: page, totalPages, totalItems: allTickers.length }
    });
  } catch (error) {
    console.error('Error fetching stock list:', error);
    return NextResponse.json({ error: 'Failed to fetch stocks' }, { status: 500 });
  }
}
