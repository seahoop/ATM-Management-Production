// Behavior: Stock integration service that interfaces with backend API for real-time stock data
// Exceptions:
// - Throws if API_BASE_URL is not configured
// - Throws if network or API error occurs
// Return:
// - Various: Stock quotes, profiles, and major stocks data
// Parameters:
// - symbol: String representing stock ticker (e.g., 'AAPL')

// This module interfaces with the backend API to provide real-time stock data,
// which proxies requests to the Finnhub API to avoid CORS issues.

const API_BASE_URL = process.env.REACT_APP_API_URL;

// Behavior: Helper function to check if API_BASE_URL is properly set
// Exceptions: None
// Return: String - API base URL with fallback
// Parameters: None
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
export const getStockProfile = async (symbol) => {
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

// Behavior: Get comprehensive data for major stocks (quotes + profiles) via backend proxy
// Exceptions: Throws if network or API error occurs
// Return: 
// - Object mapping stock keys to their combined quote and profile data
// Parameters: None
export const getMajorStocksData = async () => {
  try {
    const baseUrl = getApiBaseUrl();
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

// Behavior: Generate mock stock data for fallback when API is unavailable
// Exceptions: None
// Return: 
// - Object containing mock stock data for major companies
// Parameters: None
export const getMockStockData = () => {
  return {
    nvidia: {
      symbol: 'NVDA',
      name: 'NVIDIA Corporation',
      price: 875.28,
      previousClose: 870.43,
      high: 880.15,
      low: 865.20,
      volume: 45678900,
      description: 'NVIDIA Corporation is a technology company that designs graphics processing units (GPUs) for gaming and professional markets, as well as system on a chip units (SoCs) for the mobile computing and automotive market.'
    },
    apple: {
      symbol: 'AAPL',
      name: 'Apple Inc.',
      price: 198.45,
      previousClose: 195.89,
      high: 200.12,
      low: 194.50,
      volume: 67890100,
      description: 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables and accessories, and sells a variety of related services.'
    },
    saudiAramco: {
      symbol: '2222.SR',
      name: 'Saudi Aramco',
      price: 30.85,
      previousClose: 30.45,
      high: 31.20,
      low: 30.10,
      volume: 12345600,
      description: 'Saudi Arabian Oil Company is a Saudi Arabian national petroleum and natural gas company based in Dhahran, Saudi Arabia.'
    },
    costco: {
      symbol: 'COST',
      name: 'Costco Wholesale Corporation',
      price: 785.67,
      previousClose: 780.23,
      high: 790.45,
      low: 778.90,
      volume: 23456700,
      description: 'Costco Wholesale Corporation operates membership warehouses that offer a selection of branded and private-label products in a range of merchandise categories.'
    },
    amazon: {
      symbol: 'AMZN',
      name: 'Amazon.com Inc.',
      price: 178.12,
      previousClose: 175.89,
      high: 180.50,
      low: 174.20,
      volume: 34567800,
      description: 'Amazon.com Inc. is an American multinational technology company focusing on e-commerce, cloud computing, digital streaming, and artificial intelligence.'
    },
    microsoft: {
      symbol: 'MSFT',
      name: 'Microsoft Corporation',
      price: 415.26,
      previousClose: 410.15,
      high: 418.90,
      low: 408.75,
      volume: 45678900,
      description: 'Microsoft Corporation is an American multinational technology corporation which produces computer software, consumer electronics, personal computers, and related services.'
    },
    google: {
      symbol: 'GOOGL',
      name: 'Alphabet Inc.',
      price: 165.78,
      previousClose: 163.45,
      high: 167.20,
      low: 162.10,
      volume: 56789000,
      description: 'Alphabet Inc. is an American multinational technology conglomerate holding company, specializing in Internet-related services and products.'
    }
  };
};
