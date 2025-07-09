// Behavior: Stock market API module that provides real-time stock data via Finnhub API
// Exceptions:
// - Throws if Finnhub API requests fail
// - Throws if data validation fails
// Return:
// - Various: Stock quotes, profiles, and major stocks data
// Parameters:
// - app: Express application instance for route setup

const fetch = require("node-fetch");

// Behavior: Finnhub API configuration from environment variables
// Exceptions: None
// Return: String - API key with fallback
// Parameters: None
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY || 'd1h1ck9r01qkdlvr5d20d1h1ck9r01qkdlvr5d2g';
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';

// Behavior: Helper functions for stock data
// Exceptions: None
// Return: String - Stock key from symbol
// Parameters: symbol - String representing stock ticker
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

// Behavior: Validates and combines stock quote and profile data
// Exceptions: None
// Return: Object - Validated stock data or null if invalid
// Parameters: quote - Object containing quote data, profile - Object containing profile data, symbol - String representing stock symbol
function validateStockData(quote, profile, symbol) {
  if (!quote || !profile) {
    console.warn(`Missing data for ${symbol}: quote=${!!quote}, profile=${!!profile}`);
    return null;
  }

  // Validate required fields
  if (!quote.c || !quote.pc || !quote.h || !quote.l || !quote.v) {
    console.warn(`Invalid quote data for ${symbol}:`, quote);
    return null;
  }

  if (!profile.name || !profile.ticker) {
    console.warn(`Invalid profile data for ${symbol}:`, profile);
    return null;
  }

  return {
    symbol: profile.ticker,
    name: profile.name,
    price: quote.c,
    previousClose: quote.pc,
    high: quote.h,
    low: quote.l,
    volume: quote.v,
    description: profile.finnhubIndustry ? 
      `${profile.name} is a company in the ${profile.finnhubIndustry} industry. ${profile.currency ? `Trading in ${profile.currency}.` : ''}` :
      `${profile.name} is a publicly traded company.`
  };
}

// Behavior: Setup stock market routes for the Express application
// Exceptions: Throws if route setup fails
// Return: None
// Parameters: app - Express application instance
function setupStockRoutes(app) {

  // Behavior: Get real-time stock quote for a specific symbol
  // Exceptions: Throws if API request fails
  // Return: JSON - Stock quote data
  // Parameters: req - Express request object, res - Express response object
  app.get("/api/stock/quote/:symbol", async (req, res) => {
    try {
      const { symbol } = req.params;
      console.log(`Fetching quote for symbol: ${symbol}`);

      const response = await fetch(`${FINNHUB_BASE_URL}/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`);
      
      if (!response.ok) {
        throw new Error(`Finnhub API error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`Quote data for ${symbol}:`, data);
      
      res.json(data);
    } catch (error) {
      console.error(`Error fetching quote for ${req.params.symbol}:`, error);
      res.status(500).json({ error: "Failed to fetch stock quote", details: error.message });
    }
  });

  // Behavior: Get company profile for a specific symbol
  // Exceptions: Throws if API request fails
  // Return: JSON - Company profile data
  // Parameters: req - Express request object, res - Express response object
  app.get("/api/stock/profile/:symbol", async (req, res) => {
    try {
      const { symbol } = req.params;
      console.log(`Fetching profile for symbol: ${symbol}`);

      const response = await fetch(`${FINNHUB_BASE_URL}/stock/profile2?symbol=${symbol}&token=${FINNHUB_API_KEY}`);
      
      if (!response.ok) {
        throw new Error(`Finnhub API error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`Profile data for ${symbol}:`, data);
      
      res.json(data);
    } catch (error) {
      console.error(`Error fetching profile for ${req.params.symbol}:`, error);
      res.status(500).json({ error: "Failed to fetch company profile", details: error.message });
    }
  });

  // Behavior: Get major stocks data (combined quotes and profiles)
  // Exceptions: Throws if API requests fail
  // Return: JSON - Combined stock data for major companies
  // Parameters: req - Express request object, res - Express response object
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
}

module.exports = { setupStockRoutes }; 