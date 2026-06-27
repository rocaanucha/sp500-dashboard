import { NextRequest, NextResponse } from 'next/server';
import YahooFinance from 'yahoo-finance2';
import translate from 'google-translate-api-x';
import Parser from 'rss-parser';

const yahooFinance = new YahooFinance();
const parser = new Parser();

export async function GET(request: NextRequest, { params }: { params: Promise<{ ticker: string }> }) {
  const { ticker } = await params;

  try {
    // Fetch historical data for 6 months (1d interval)
    const period2 = new Date();
    const period1 = new Date();
    period1.setMonth(period1.getMonth() - 6);
    
    const [quote, historyResult, financials, searchResult] = await Promise.all([
      yahooFinance.quote(ticker),
      yahooFinance.chart(ticker, { period1, period2, interval: '1d' }).catch(() => ({ quotes: [] })),
      yahooFinance.quoteSummary(ticker, { modules: ['incomeStatementHistory', 'balanceSheetHistory', 'assetProfile'] }).catch(() => null),
      yahooFinance.search(ticker, { newsCount: 15 }).catch(() => ({ news: [] }))
    ]);

    const chartData = (historyResult?.quotes || []).map(h => ({
      date: h.date ? new Date(h.date).toISOString().split('T')[0] : '',
      price: h.close
    })).filter(h => h.price !== null && h.price !== undefined);

    // Extract simple financials
    let revenue = null;
    let netIncome = null;
    let totalAssets = null;
    let totalLiabilities = null;
    let description = financials?.assetProfile?.longBusinessSummary || '';

    if (description) {
      try {
        const res = await translate(description, { to: 'th' });
        description = res.text;
      } catch (err) {
        console.error('Translation error:', err);
      }
    }

    const cleanTicker = ticker.split('.')[0].toLowerCase();
    const companyName = (quote.shortName || quote.longName || '').toLowerCase();
    const companyFirstName = companyName.replace(/inc\.|corp\.|plc|ltd\.|public|company|the/gi, '').trim().split(' ')[0];

    const filteredNews = (searchResult?.news || []).filter((n: any) => {
      if (n.relatedTickers && Array.isArray(n.relatedTickers)) {
        if (n.relatedTickers.includes(ticker) || n.relatedTickers.includes(ticker.split('.')[0])) {
          return true;
        }
      }
      
      const titleLower = (n.title || '').toLowerCase();
      if (titleLower.includes(cleanTicker)) return true;
      if (companyFirstName.length > 2 && titleLower.includes(companyFirstName)) return true;
      
      return false;
    });

    let news = filteredNews.slice(0, 4).map((n: any) => ({
      title: n.title,
      publisher: n.publisher,
      link: n.link,
      publishedAt: n.providerPublishTime ? new Date(n.providerPublishTime).toISOString() : null
    }));

    if (news.length === 0) {
      try {
        const isThai = ticker.endsWith('.BK');
        const query = isThai ? `${cleanTicker} หุ้น` : `${cleanTicker} stock`;
        const lang = isThai ? 'th' : 'en';
        const gl = isThai ? 'TH' : 'US';
        const ceid = isThai ? 'TH:th' : 'US:en';
        const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=${lang}&gl=${gl}&ceid=${ceid}`;
        
        const feed = await parser.parseURL(url);
        
        news = feed.items.slice(0, 4).map(item => {
          const titleParts = (item.title || '').split(' - ');
          const publisher = titleParts.length > 1 ? titleParts.pop() : 'ข่าวสาร';
          return {
            title: titleParts.join(' - ') || item.title || '',
            publisher: publisher?.trim() || 'News',
            link: item.link || '',
            publishedAt: item.isoDate || item.pubDate || new Date().toISOString()
          };
        });
      } catch (err) {
        console.error('RSS Fallback error:', err);
      }
    }

    if (financials) {
      const incomeStmts = financials.incomeStatementHistory?.incomeStatementHistory;
      if (incomeStmts && incomeStmts.length > 0) {
        revenue = (incomeStmts[0] as any).totalRevenue || null;
        netIncome = (incomeStmts[0] as any).netIncome || null;
      }
      
      const balanceStmts = financials.balanceSheetHistory?.balanceSheetStatements;
      if (balanceStmts && balanceStmts.length > 0) {
        totalAssets = (balanceStmts[0] as any).totalAssets || null;
        totalLiabilities = (balanceStmts[0] as any).totalLiab || null;
      }
    }

    return NextResponse.json({
      ticker: quote.symbol,
      name: quote.shortName || quote.longName,
      price: quote.regularMarketPrice,
      change: quote.regularMarketChangePercent,
      peRatio: quote.trailingPE,
      marketCap: quote.marketCap,
      dividendRate: quote.dividendRate || null,
      dividendDate: quote.dividendDate ? new Date(quote.dividendDate).toISOString().split('T')[0] : null,
      description,
      chartData,
      news,
      financials: {
        revenue,
        netIncome,
        totalAssets,
        totalLiabilities,
      }
    });

  } catch (error) {
    console.error(`Error fetching data for ${ticker}:`, error);
    return NextResponse.json({ error: 'Failed to fetch stock details' }, { status: 500 });
  }
}
