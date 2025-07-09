// This module interfaces with the backend API to provide real-time stock data,
// which proxies requests to the Finnhub API to avoid CORS issues.

const API_BASE_URL = process.env.REACT_APP_API_URL;

// Helper function to check if API_BASE_URL is properly set
const getApiBaseUrl = () => {
  if (!API_BASE_URL) {
    console.error('REACT_APP_API_URL is not set. Please check your environment variables.');
    return 'https://atm-mangement.onrender.com'; // Fallback URL
  }
  return API_BASE_URL;
};

// Behavior: Get real-time stock quote for a specific symbol via backend proxy
// Exceptions: Throws if network or API error occurs
// Return: 
// - Object containing current price, change, high, low, etc.
// Parameters: 
// - symbol: String representing stock ticker (e.g., 'AAPL')
export const getStockQuote = async (symbol) => {
  try {
    const baseUrl = getApiBaseUrl();
    const response = await fetch(`${baseUrl}/api/stock/quote/${symbol}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} - ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Validate the response data
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid response format from API');
    }
    
    return data;
  } catch (error) {
    console.error(`Error fetching quote for ${symbol}:`, error);
    throw error;
  }
};

// Behavior: Get company profile for a given stock symbol via backend proxy
// Exceptions: Throws if network or API error occurs
// Return: 
// - Object with company name, industry, market cap, etc.
// Parameters:
// - symbol: String representing stock ticker (e.g., 'AMZN')
export const getCompanyProfile = async (symbol) => {
  try {
    const baseUrl = getApiBaseUrl();
    const response = await fetch(`${baseUrl}/api/stock/profile/${symbol}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} - ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Validate the response data
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid response format from API');
    }
    
    return data;
  } catch (error) {
    console.error(`Error fetching profile for ${symbol}:`, error);
    throw error;
  }
};

// Behavior: Get real-time data for major stocks via backend proxy
// Combines quote and profile data into one object per stock
// Exceptions: Throws if any API call fails
// Return: 
// - Object mapping lowercase stock keys to detailed data objects
export const getMajorStocksData = async () => {
  try {
    const baseUrl = getApiBaseUrl();
    console.log('Fetching major stocks data from:', `${baseUrl}/api/stock/major-stocks`);
    
    const response = await fetch(`${baseUrl}/api/stock/major-stocks`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} - ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Validate the response data
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid response format from API');
    }
    
    console.log('Successfully fetched major stocks data:', Object.keys(data));
    return data;
  } catch (error) {
    console.error('Error fetching major stocks data:', error);
    throw error;
  }
};

// Behavior: Get historical stock data (candlestick format) via backend proxy
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
    const baseUrl = getApiBaseUrl();
    const response = await fetch(`${baseUrl}/api/stock/candles/${symbol}?resolution=${resolution}&from=${from}&to=${to}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} - ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Validate the response data
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid response format from API');
    }
    
    return data;
  } catch (error) {
    console.error(`Error fetching candles for ${symbol}:`, error);
    throw error;
  }
};

// Behavior: Get company news between two dates via backend proxy
// Exceptions: Throws if network or API error occurs
// Return: 
// - Array of news articles related to the company
// Parameters: 
// - symbol: Stock ticker
// - from: Start date (YYYY-MM-DD)
// - to: End date (YYYY-MM-DD)
export const getCompanyNews = async (symbol, from, to) => {
  try {
    const baseUrl = getApiBaseUrl();
    const response = await fetch(`${baseUrl}/api/stock/news/${symbol}?from=${from}&to=${to}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} - ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Validate the response data
    if (!Array.isArray(data)) {
      throw new Error('Invalid response format from API - expected array');
    }
    
    return data;
  } catch (error) {
    console.error(`Error fetching news for ${symbol}:`, error);
    throw error;
  }
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
      description: 'NVIDIA Corporation designs and manufactures computer graphics processors, chipsets, and related multimedia software.'
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
      description: 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide.'
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
      description: 'Saudi Arabian Oil Company (Saudi Aramco) is the world\'s largest integrated oil and gas company, producing and exporting crude oil.'
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
      description: 'Costco Wholesale Corporation operates membership warehouses that offer branded and private-label products in a range of merchandise categories.'
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
      description: 'Amazon.com Inc. engages in the retail sale of consumer products and subscriptions in North America and internationally.'
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
      description: 'Microsoft Corporation develops, licenses, and supports software, services, devices, and solutions worldwide.'
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
      description: 'Alphabet Inc. provides online advertising services and operates Google Cloud, which offers cloud computing services.'
    }
  };
};
