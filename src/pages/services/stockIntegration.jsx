// This module interfaces with the Finnhub stock market API to provide real-time and historical data,
// including quotes, profiles, news, and candlestick chart data for selected stocks. It also includes 
// a helper function to retrieve mock stock data for testing when the API is unavailable.

import axios from 'axios';

// Behavior: Define API key and base URL for Finnhub
// Exceptions: None
// Return: Constants used in axios config
const FINNHUB_API_KEY = 'd1h1ck9r01qkdlvr5d20d1h1ck9r01qkdlvr5d2g';
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';

// Behavior: Create an axios instance configured for Finnhub
// Exceptions: None
// Return: Configured axios instance
const finnhubApi = axios.create({
  baseURL: FINNHUB_BASE_URL,
  headers: {
    'X-Finnhub-Token': FINNHUB_API_KEY
  }
});

// Behavior: Get all stock symbols from a given exchange (default US)
// Exceptions: Throws if network or API error occurs
// Return: 
// - Array of symbol objects from Finnhub
// Parameters: 
// - exchange: String (e.g., 'US', 'TO', 'V') specifying which exchange to pull symbols from
export const getStockSymbols = async (exchange = 'US') => {
  try {
    const response = await finnhubApi.get(`/stock/symbol?exchange=${exchange}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching stock symbols:', error);
    throw error;
  }
};

// Behavior: Get real-time stock quote for a specific symbol
// Exceptions: Throws if network or API error occurs
// Return: 
// - Object containing current price, change, high, low, etc.
// Parameters: 
// - symbol: String representing stock ticker (e.g., 'AAPL')
export const getStockQuote = async (symbol) => {
  try {
    const response = await finnhubApi.get(`/quote?symbol=${symbol}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching quote for ${symbol}:`, error);
    throw error;
  }
};

// Behavior: Get company profile for a given stock symbol
// Exceptions: Throws if network or API error occurs
// Return: 
// - Object with company name, industry, market cap, etc.
// Parameters:
// - symbol: String representing stock ticker (e.g., 'AMZN')
export const getCompanyProfile = async (symbol) => {
  try {
    const response = await finnhubApi.get(`/stock/profile2?symbol=${symbol}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching profile for ${symbol}:`, error);
    throw error;
  }
};

// Behavior: Get historical stock data (candlestick format)
// Exceptions: Throws if network or API error occurs
// Return: 
// - Object with timestamps and OHLC data
// Parameters:
// - symbol: Stock ticker
// - resolution: Time resolution (e.g., 'D', '1', '5')
// - from: UNIX timestamp for start date
// - to: UNIX timestamp for end date
export const getStockCandles = async (symbol, resolution = 'D', from, to) => {
  try {
    const response = await finnhubApi.get(`/stock/candle`, {
      params: { symbol, resolution, from, to }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching candles for ${symbol}:`, error);
    throw error;
  }
};

// Behavior: Get company news between two dates
// Exceptions: Throws if network or API error occurs
// Return: 
// - Array of news articles related to the company
// Parameters: 
// - symbol: Stock ticker
// - from: Start date (YYYY-MM-DD)
// - to: End date (YYYY-MM-DD)
export const getCompanyNews = async (symbol, from, to) => {
  try {
    const response = await finnhubApi.get(`/company-news`, {
      params: { symbol, from, to }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching news for ${symbol}:`, error);
    throw error;
  }
};

// Behavior: Get real-time data for a predefined list of major stock symbols
// Combines quote and profile data into one object per stock
// Exceptions: Throws if any API call fails
// Return: 
// - Object mapping lowercase stock keys to detailed data objects
export const getMajorStocksData = async () => {
  const stockSymbols = ['NVDA', 'AAPL', '2222.SR', 'COST', 'AMZN', 'MSFT', 'GOOGL'];
  const stockData = {};

  try {
    const quotePromises = stockSymbols.map(symbol => getStockQuote(symbol));
    const quotes = await Promise.all(quotePromises);

    const profilePromises = stockSymbols.map(symbol => getCompanyProfile(symbol));
    const profiles = await Promise.all(profilePromises);

    stockSymbols.forEach((symbol, index) => {
      const quote = quotes[index];
      const profile = profiles[index];
      if (quote && profile) {
        const stockKey = getStockKeyFromSymbol(symbol);
        stockData[stockKey] = {
          symbol: symbol,
          companyName: profile.name || 'Unknown Company',
          currentPrice: quote.c,
          change: quote.d,
          changePercent: quote.dp,
          high: quote.h,
          low: quote.l,
          volume: quote.v,
          marketCap: formatMarketCap(profile.marketCapitalization),
          description: profile.finnhubIndustry || 'No description available'
        };
      }
    });

    return stockData;
  } catch (error) {
    console.error('Error fetching major stocks data:', error);
    throw error;
  }
};

// Behavior: Convert stock ticker to camelCase key used in object mapping
// Exceptions: Returns symbol in lowercase if not in map
// Return:
// - String representing key
// Parameters:
// - symbol: Stock ticker (e.g., 'AAPL')
const getStockKeyFromSymbol = (symbol) => {
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
};

// Behavior: Convert raw market cap value to readable format
// Exceptions: Returns 'N/A' if marketCap is null/undefined
// Return:
// - String like '1.2T', '500M', etc.
// Parameters:
// - marketCap: Number representing market cap in dollars
const formatMarketCap = (marketCap) => {
  if (!marketCap) return 'N/A';
  if (marketCap >= 1e12) return (marketCap / 1e12).toFixed(1) + 'T';
  if (marketCap >= 1e9) return (marketCap / 1e9).toFixed(1) + 'B';
  if (marketCap >= 1e6) return (marketCap / 1e6).toFixed(1) + 'M';
  return marketCap.toString();
};

// Behavior: Returns hardcoded mock stock data for offline testing or fallback mode
// Exceptions: None
// Return:
// - Object containing sample stock quote + profile data for 7 major companies
export const getMockStockData = () => {
  return {
    nvidia: {
      symbol: 'NVDA',
      companyName: 'NVIDIA Corporation',
      currentPrice: 485.09,
      change: 12.45,
      changePercent: 2.63,
      high: 492.50,
      low: 478.20,
      volume: 45678900,
      marketCap: '1.2T',
      description: 'NVIDIA Corporation designs and manufactures computer graphics processors...'
    },
    apple: {
      symbol: 'AAPL',
      companyName: 'Apple Inc.',
      currentPrice: 175.43,
      change: -2.15,
      changePercent: -1.21,
      high: 178.90,
      low: 174.20,
      volume: 67890100,
      marketCap: '2.7T',
      description: 'Apple Inc. designs, manufactures, and markets smartphones...'
    },
    saudiAramco: {
      symbol: '2222.SR',
      companyName: 'Saudi Aramco',
      currentPrice: 32.45,
      change: 0.85,
      changePercent: 2.69,
      high: 32.80,
      low: 31.90,
      volume: 12345600,
      marketCap: '2.1T',
      description: 'Saudi Arabian Oil Company (Saudi Aramco) is the world\'s largest integrated oil and gas company...'
    },
    costco: {
      symbol: 'COST',
      companyName: 'Costco Wholesale Corporation',
      currentPrice: 678.92,
      change: 8.76,
      changePercent: 1.31,
      high: 682.50,
      low: 675.30,
      volume: 23456700,
      marketCap: '300B',
      description: 'Costco Wholesale Corporation operates membership warehouses...'
    },
    amazon: {
      symbol: 'AMZN',
      companyName: 'Amazon.com Inc.',
      currentPrice: 145.67,
      change: 3.21,
      changePercent: 2.25,
      high: 147.20,
      low: 143.80,
      volume: 56789000,
      marketCap: '1.5T',
      description: 'Amazon.com Inc. engages in the retail sale of consumer products...'
    },
    microsoft: {
      symbol: 'MSFT',
      companyName: 'Microsoft Corporation',
      currentPrice: 378.85,
      change: 5.67,
      changePercent: 1.52,
      high: 380.20,
      low: 375.40,
      volume: 34567800,
      marketCap: '2.8T',
      description: 'Microsoft Corporation develops, licenses, and supports software...'
    },
    google: {
      symbol: 'GOOGL',
      companyName: 'Alphabet Inc. (Google)',
      currentPrice: 142.56,
      change: 2.34,
      changePercent: 1.67,
      high: 143.90,
      low: 141.20,
      volume: 45678900,
      marketCap: '1.8T',
      description: 'Alphabet Inc. provides online advertising services and operates Google Cloud...'
    }
  };
};
