// Behavior: Stock market component that displays real-time stock data for major companies
// Exceptions:
// - Throws if user is not authenticated
// - Throws if stock API calls fail
// Return:
// - JSX: Stock market interface with real-time data and interactive charts
// Parameters:
// - None (React component, uses location state for user data)

// This React component displays real-time stock data for selected companies.
// It fetches data using the backend API which proxies Finnhub API calls to avoid CORS issues.
// It shows summarized stock cards and a detailed panel for the selected stock.
// Supports auto-refresh every 30 seconds and manual refresh.

// Dependencies
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { getMockStockData, getMajorStocksData } from './services/stockIntegration';
import '../pagesCss/StockMarket.css';

function StockMarket() {
    const navigate = useNavigate();
    const location = useLocation();
    const user = location.state?.user;

    // Behavior: Stores the stock data
    // Return: Object mapping stock keys to their data
    const [stockData, setStockData] = useState({});

    // Behavior: Tracks loading status
    const [loading, setLoading] = useState(true);

    // Behavior: Tracks error message
    const [error, setError] = useState(null);

    // Behavior: Stores which stock is currently selected
    const [selectedStock, setSelectedStock] = useState('nvidia');

    // Behavior: Stores interval ID to clear auto-refresh on unmount
    const [refreshInterval, setRefreshInterval] = useState(null);

    // Behavior: Tracks if we're using mock data
    const [usingMockData, setUsingMockData] = useState(false);

    // Behavior: Runs once on mount to fetch initial data and set interval
    useEffect(() => {
        fetchStockData();
        const interval = setInterval(fetchStockData, 30000); // 30 seconds
        setRefreshInterval(interval);
        return () => {
            if (interval) clearInterval(interval);
        };
    }, []);

    // Behavior: Cleanup interval on component unmount or interval update
    useEffect(() => {
        return () => {
            if (refreshInterval) clearInterval(refreshInterval);
        };
    }, [refreshInterval]);

    // Behavior: Fetches stock data from API or falls back to mock data
    // Exceptions: Throws if API call fails
    // Return: None (updates state)
    // Parameters: None
    const fetchStockData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const data = await getMajorStocksData();
            setStockData(data);
            setUsingMockData(false);
        } catch (error) {
            console.error('Error fetching stock data:', error);
            setError('Failed to fetch real-time data. Using mock data.');
            
            // Fallback to mock data
            const mockData = getMockStockData();
            setStockData(mockData);
            setUsingMockData(true);
        } finally {
            setLoading(false);
        }
    };

    // Behavior: Handles manual refresh button click
    // Exceptions: None
    // Return: None
    // Parameters: None
    const handleRefresh = () => {
        fetchStockData();
    };

    // Behavior: Handles stock selection
    // Exceptions: None
    // Return: None
    // Parameters: stockKey - String representing the selected stock
    const handleStockSelect = (stockKey) => {
        setSelectedStock(stockKey);
    };

    // Behavior: Handles navigation back to dashboard
    // Exceptions: None
    // Return: None
    // Parameters: None
    const handleBack = () => {
        navigate("/dashboard", { state: { user } });
    };

    // Behavior: Formats stock price with proper decimal places
    // Exceptions: None
    // Return: String - Formatted price
    // Parameters: price - Number representing stock price
    const formatPrice = (price) => {
        if (!price) return 'N/A';
        return `$${parseFloat(price).toFixed(2)}`;
    };

    // Behavior: Calculates percentage change
    // Exceptions: None
    // Return: String - Formatted percentage change
    // Parameters: current - Number, previous - Number
    const formatChange = (current, previous) => {
        if (!current || !previous) return 'N/A';
        const change = ((current - previous) / previous) * 100;
        return `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
    };

    // Behavior: Determines if stock price increased
    // Exceptions: None
    // Return: Boolean - True if price increased
    // Parameters: current - Number, previous - Number
    const isPositive = (current, previous) => {
        if (!current || !previous) return false;
        return current > previous;
    };

    if (!user) {
        navigate("/");
        return null;
    }

    const selectedStockData = stockData[selectedStock];

    return (
        <div className="stock-market-container">
            <div className="stock-market-card">
                <div className="stock-market-header">
                    <div className="stock-market-logo">
                        <span className="logo-text">HABO</span>
                        <span className="logo-dot"></span>
                        <span className="logo-text-secondary">BERLIN</span>
                    </div>
                    <div className="header-actions">
                        <button onClick={handleRefresh} className="refresh-button" disabled={loading}>
                            {loading ? 'Loading...' : '🔄 Refresh'}
                        </button>
                        <button onClick={handleBack} className="back-button">
                            ← Back
                        </button>
                    </div>
                </div>

                <h1 className="stock-market-title">Stock Market</h1>
                
                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                {usingMockData && (
                    <div className="mock-data-notice">
                        Using mock data (API unavailable)
                    </div>
                )}

                <div className="stock-market-content">
                    <div className="stock-grid">
                        {Object.entries(stockData).map(([key, stock]) => (
                            <div
                                key={key}
                                className={`stock-card ${selectedStock === key ? 'selected' : ''}`}
                                onClick={() => handleStockSelect(key)}
                            >
                                <div className="stock-header">
                                    <h3 className="stock-name">{stock.name}</h3>
                                    <span className="stock-symbol">{stock.symbol}</span>
                                </div>
                                <div className="stock-price">
                                    {formatPrice(stock.price)}
                                </div>
                                <div className={`stock-change ${isPositive(stock.price, stock.previousClose) ? 'positive' : 'negative'}`}>
                                    {formatChange(stock.price, stock.previousClose)}
                                </div>
                            </div>
                        ))}
                    </div>

                    {selectedStockData && (
                        <div className="stock-detail-panel">
                            <h2 className="detail-title">{selectedStockData.name} ({selectedStockData.symbol})</h2>
                            
                            <div className="detail-grid">
                                <div className="detail-item">
                                    <span className="detail-label">Current Price</span>
                                    <span className="detail-value">{formatPrice(selectedStockData.price)}</span>
                                </div>
                                
                                <div className="detail-item">
                                    <span className="detail-label">Previous Close</span>
                                    <span className="detail-value">{formatPrice(selectedStockData.previousClose)}</span>
                                </div>
                                
                                <div className="detail-item">
                                    <span className="detail-label">Change</span>
                                    <span className={`detail-value ${isPositive(selectedStockData.price, selectedStockData.previousClose) ? 'positive' : 'negative'}`}>
                                        {formatChange(selectedStockData.price, selectedStockData.previousClose)}
                                    </span>
                                </div>
                                
                                <div className="detail-item">
                                    <span className="detail-label">High</span>
                                    <span className="detail-value">{formatPrice(selectedStockData.high)}</span>
                                </div>
                                
                                <div className="detail-item">
                                    <span className="detail-label">Low</span>
                                    <span className="detail-value">{formatPrice(selectedStockData.low)}</span>
                                </div>
                                
                                <div className="detail-item">
                                    <span className="detail-label">Volume</span>
                                    <span className="detail-value">{selectedStockData.volume?.toLocaleString() || 'N/A'}</span>
                                </div>
                            </div>

                            {selectedStockData.description && (
                                <div className="stock-description">
                                    <h3>About {selectedStockData.name}</h3>
                                    <p>{selectedStockData.description}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default StockMarket;
