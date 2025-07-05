// This React component displays real-time stock data for selected companies.
// It fetches data using the Finnhub API or fallback mock data if needed.
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

    // Behavior: Fetches stock data from live API or mock fallback
    // Exceptions: If API fails, logs and falls back to mock data
    // Return: Updates `stockData` state
    const fetchStockData = async () => {
        try {
            setLoading(true);
            setError(null);
            try {
                const realTimeData = await getMajorStocksData();
                setStockData(realTimeData);
            } catch (apiError) {
                console.log('API not available, using mock data:', apiError);
                const mockData = getMockStockData();
                setStockData(mockData);
            }
        } catch (err) {
            setError('Failed to fetch stock data. Please try again later.');
            console.error('Error fetching stock data:', err);
        } finally {
            setLoading(false);
        }
    };

    // Behavior: If no user is passed in location state, display error
    if (!user) {
        return <div className="stock-market-container">No user data available.</div>;
    }

    // Behavior: Navigate back to dashboard, preserving user state
    const handleBack = () => {
        navigate('/dashboard', { state: { user } });
    };

    // Behavior: Formats large numbers into human-readable string (e.g., 1.2M)
    const formatNumber = (num) => {
        if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
        if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
        if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
        if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
        return num.toString();
    };

    // Behavior: Formats a number as USD currency string
    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(price);
    };

    // Behavior: UI component to render one stock card in the left pane
    // Parameters: 
    // - stockKey: String key identifier
    // - data: Stock data object
    const StockCard = ({ stockKey, data }) => {
        const isPositive = data.change >= 0;
        const isSelected = selectedStock === stockKey;

        return (
            <div 
                className={`stock-card ${isSelected ? 'selected' : ''}`}
                onClick={() => setSelectedStock(stockKey)}
            >
                <div className="stock-header">
                    <h3>{data.symbol}</h3>
                    <span className="company-name">{data.companyName}</span>
                </div>
                
                <div className="stock-price">
                    <span className="current-price">{formatPrice(data.currentPrice)}</span>
                    <span className={`price-change ${isPositive ? 'positive' : 'negative'}`}>
                        {isPositive ? '+' : ''}{formatPrice(data.change)} ({isPositive ? '+' : ''}{data.changePercent}%)
                    </span>
                </div>

                <div className="stock-details">
                    <div className="detail-row">
                        <span>High:</span>
                        <span>{formatPrice(data.high)}</span>
                    </div>
                    <div className="detail-row">
                        <span>Low:</span>
                        <span>{formatPrice(data.low)}</span>
                    </div>
                    <div className="detail-row">
                        <span>Volume:</span>
                        <span>{formatNumber(data.volume)}</span>
                    </div>
                    <div className="detail-row">
                        <span>Market Cap:</span>
                        <span>{data.marketCap}</span>
                    </div>
                </div>
            </div>
        );
    };

    // Behavior: UI component to render the full detailed view of selected stock
    // Parameters:
    // - data: Stock data object
    const StockDetail = ({ data }) => {
        if (!data) return null;

        return (
            <div className="stock-detail-panel">
                <div className="detail-header">
                    <h2>{data.companyName} ({data.symbol})</h2>
                    <div className="current-price-large">
                        <span className="price">{formatPrice(data.currentPrice)}</span>
                        <span className={`change ${data.change >= 0 ? 'positive' : 'negative'}`}>
                            {data.change >= 0 ? '+' : ''}{formatPrice(data.change)} ({data.change >= 0 ? '+' : ''}{data.changePercent}%)
                        </span>
                    </div>
                </div>

                <div className="company-description">
                    <h3>About {data.companyName}</h3>
                    <p>{data.description}</p>
                </div>

                <div className="trading-info">
                    <h3>Trading Information</h3>
                    <div className="info-grid">
                        <div className="info-item">
                            <label>Current Price:</label>
                            <span>{formatPrice(data.currentPrice)}</span>
                        </div>
                        <div className="info-item">
                            <label>Day High:</label>
                            <span>{formatPrice(data.high)}</span>
                        </div>
                        <div className="info-item">
                            <label>Day Low:</label>
                            <span>{formatPrice(data.low)}</span>
                        </div>
                        <div className="info-item">
                            <label>Volume:</label>
                            <span>{formatNumber(data.volume)}</span>
                        </div>
                        <div className="info-item">
                            <label>Market Cap:</label>
                            <span>{data.marketCap}</span>
                        </div>
                        <div className="info-item">
                            <label>Change:</label>
                            <span className={data.change >= 0 ? 'positive' : 'negative'}>
                                {data.change >= 0 ? '+' : ''}{formatPrice(data.change)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Behavior: If loading and no data, show loading spinner
    if (loading && Object.keys(stockData).length === 0) {
        return (
            <div className="stock-market-container">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading stock data...</p>
                </div>
            </div>
        );
    }

    // Main render
    return (
        <div className="stock-market-container">
            <div className="stock-market-header">
                <h1>Stock Market</h1>
                <div className="header-controls">
                    <button 
                        className="refresh-btn"
                        onClick={fetchStockData}
                        disabled={loading}
                    >
                        {loading ? 'Refreshing...' : 'Refresh'}
                    </button>
                    <button className="back-btn" onClick={handleBack}>
                        Back to Dashboard
                    </button>
                </div>
            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            <div className="stock-market-content">
                <div className="stock-cards-container">
                    <h2>Available Stocks ({Object.keys(stockData).length})</h2>
                    <div className="stock-cards">
                        {Object.entries(stockData).map(([key, data]) => (
                            <StockCard key={key} stockKey={key} data={data} />
                        ))}
                    </div>
                </div>

                <div className="stock-detail-container">
                    <StockDetail data={stockData[selectedStock]} />
                </div>
            </div>

            <div className="stock-market-footer">
                <p>Data refreshes automatically every 30 seconds</p>
                <p>Last updated: {new Date().toLocaleTimeString()}</p>
            </div>
        </div>
    );
}

export default StockMarket;
