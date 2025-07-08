const fetch = require("node-fetch");

// Finnhub API configuration from environment variables
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY || 'd1h1ck9r01qkdlvr5d20d1h1ck9r01qkdlvr5d2g';
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';

// Helper functions for stock data
function getStockKeyFromSymbol(symbol) {
  const symbolMap = {
    'NVDA': 'nvidia',
    'AAPL': 'apple',
    '2222.SR': 'saudiAramco',
    'COST': 'costco',
    'AMZN': 'amazon',
    'MSFT': 'microsoft',
    'GOOGL': 'google'
  };
  return symbolMap[symbol] || symbol.toLowerCase();
}

function formatMarketCap(marketCap) {
  if (!marketCap || isNaN(marketCap)) return 'N/A';
  if (marketCap >= 1e12) return (marketCap / 1e12).toFixed(1) + 'T';
  if (marketCap >= 1e9) return (marketCap / 1e9).toFixed(1) + 'B';
  if (marketCap >= 1e6) return (marketCap / 1e6).toFixed(1) + 'M';
  return marketCap.toString();
}

// Helper function to validate and clean stock data
function validateStockData(quote, profile, symbol) {
  if (!quote || !profile) {
    console.warn(`Missing data for ${symbol}: quote=${!!quote}, profile=${!!profile}`);
    return null;
  }

  // Check if quote has required fields
  if (typeof quote.c !== 'number' || typeof quote.d !== 'number') {
    console.warn(`Invalid quote data for ${symbol}:`, quote);
    return null;
  }

  return {
    symbol: symbol,
    companyName: profile.name || 'Unknown Company',
    currentPrice: quote.c || 0,
    change: quote.d || 0,
    changePercent: quote.dp || 0,
    high: quote.h || 0,
    low: quote.l || 0,
    volume: quote.v || 0,
    marketCap: formatMarketCap(profile.marketCapitalization),
    description: profile.finnhubIndustry || 'No description available'
  };
}

// Stock market API routes
function setupStockRoutes(app) {
  // Get stock quote for a specific symbol
  app.get("/api/stock/quote/:symbol", async (req, res) => {
    try {
      const { symbol } = req.params;
      
      if (!symbol) {
        return res.status(400).json({ error: "Symbol parameter is required" });
      }

      console.log(`Fetching quote for symbol: ${symbol}`);
      
      const response = await fetch(`${FINNHUB_BASE_URL}/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`);
      
      if (!response.ok) {
        console.error(`Finnhub API error for ${symbol}: ${response.status} - ${response.statusText}`);
        throw new Error(`Finnhub API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Validate response
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid response format from Finnhub API');
      }
      
      console.log(`Successfully fetched quote for ${symbol}`);
      res.json(data);
    } catch (error) {
      console.error(`Error fetching quote for ${req.params.symbol}:`, error);
      res.status(500).json({ error: "Failed to fetch stock quote", details: error.message });
    }
  });

  // Get stock profile for a specific symbol
  app.get("/api/stock/profile/:symbol", async (req, res) => {
    try {
      const { symbol } = req.params;
      
      if (!symbol) {
        return res.status(400).json({ error: "Symbol parameter is required" });
      }

      console.log(`Fetching profile for symbol: ${symbol}`);
      
      const response = await fetch(`${FINNHUB_BASE_URL}/stock/profile2?symbol=${symbol}&token=${FINNHUB_API_KEY}`);
      
      if (!response.ok) {
        console.error(`Finnhub API error for ${symbol}: ${response.status} - ${response.statusText}`);
        throw new Error(`Finnhub API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Validate response
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid response format from Finnhub API');
      }
      
      console.log(`Successfully fetched profile for ${symbol}`);
      res.json(data);
    } catch (error) {
      console.error(`Error fetching profile for ${req.params.symbol}:`, error);
      res.status(500).json({ error: "Failed to fetch stock profile", details: error.message });
    }
  });

  // Get major stocks data (combined quotes and profiles)
  app.get("/api/stock/major-stocks", async (req, res) => {
    try {
      const stockSymbols = ['NVDA', 'AAPL', '2222.SR', 'COST', 'AMZN', 'MSFT', 'GOOGL'];
      const stockData = {};

      console.log('Fetching major stocks data for symbols:', stockSymbols);

      // Fetch quotes and profiles in parallel
      const quotePromises = stockSymbols.map(symbol => 
        fetch(`${FINNHUB_BASE_URL}/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`)
          .then(r => r.ok ? r.json() : null)
          .catch(err => {
            console.error(`Error fetching quote for ${symbol}:`, err);
            return null;
          })
      );
      
      const profilePromises = stockSymbols.map(symbol => 
        fetch(`${FINNHUB_BASE_URL}/stock/profile2?symbol=${symbol}&token=${FINNHUB_API_KEY}`)
          .then(r => r.ok ? r.json() : null)
          .catch(err => {
            console.error(`Error fetching profile for ${symbol}:`, err);
            return null;
          })
      );

      const quotes = await Promise.all(quotePromises);
      const profiles = await Promise.all(profilePromises);

      stockSymbols.forEach((symbol, index) => {
        const quote = quotes[index];
        const profile = profiles[index];
        
        const validatedData = validateStockData(quote, profile, symbol);
        if (validatedData) {
          const stockKey = getStockKeyFromSymbol(symbol);
          stockData[stockKey] = validatedData;
        }
      });

      console.log(`Successfully processed ${Object.keys(stockData).length} stocks`);
      res.json(stockData);
    } catch (error) {
      console.error('Error fetching major stocks data:', error);
      res.status(500).json({ error: "Failed to fetch stock data", details: error.message });
    }
  });

  // Get stock candles (historical data)
  app.get("/api/stock/candles/:symbol", async (req, res) => {
    try {
      const { symbol } = req.params;
      const { resolution = 'D', from, to } = req.query;
      
      if (!symbol) {
        return res.status(400).json({ error: "Symbol parameter is required" });
      }

      if (!from || !to) {
        return res.status(400).json({ error: "From and to parameters are required" });
      }

      console.log(`Fetching candles for ${symbol} from ${from} to ${to}`);
      
      const response = await fetch(`${FINNHUB_BASE_URL}/stock/candle?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${to}&token=${FINNHUB_API_KEY}`);
      
      if (!response.ok) {
        console.error(`Finnhub API error for ${symbol}: ${response.status} - ${response.statusText}`);
        throw new Error(`Finnhub API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Validate response
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid response format from Finnhub API');
      }
      
      console.log(`Successfully fetched candles for ${symbol}`);
      res.json(data);
    } catch (error) {
      console.error(`Error fetching candles for ${req.params.symbol}:`, error);
      res.status(500).json({ error: "Failed to fetch stock candles", details: error.message });
    }
  });

  // Get company news
  app.get("/api/stock/news/:symbol", async (req, res) => {
    try {
      const { symbol } = req.params;
      const { from, to } = req.query;
      
      if (!symbol) {
        return res.status(400).json({ error: "Symbol parameter is required" });
      }

      if (!from || !to) {
        return res.status(400).json({ error: "From and to parameters are required" });
      }

      console.log(`Fetching news for ${symbol} from ${from} to ${to}`);
      
      const response = await fetch(`${FINNHUB_BASE_URL}/company-news?symbol=${symbol}&from=${from}&to=${to}&token=${FINNHUB_API_KEY}`);
      
      if (!response.ok) {
        console.error(`Finnhub API error for ${symbol}: ${response.status} - ${response.statusText}`);
        throw new Error(`Finnhub API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Validate response
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format from Finnhub API - expected array');
      }
      
      console.log(`Successfully fetched ${data.length} news articles for ${symbol}`);
      res.json(data);
    } catch (error) {
      console.error(`Error fetching news for ${req.params.symbol}:`, error);
      res.status(500).json({ error: "Failed to fetch company news", details: error.message });
    }
  });

  // Health check endpoint
  app.get("/api/stock/health", async (req, res) => {
    try {
      console.log('Stock API health check requested');
      res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        finnhubKey: FINNHUB_API_KEY ? 'configured' : 'missing'
      });
    } catch (error) {
      console.error('Health check error:', error);
      res.status(500).json({ status: 'unhealthy', error: error.message });
    }
  });
}

module.exports = { setupStockRoutes }; 