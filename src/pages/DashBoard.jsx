import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import "../pagesCss/dashboard.css";

function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = location.state?.user;

  useEffect(() => {
    if (!user) {
      // If no user was passed (e.g., refresh), redirect to login
      navigate("/");
    }
  }, [user, navigate]);

  if (!user) return null;

  // Navigation handler functions
  const handleBack = () => {
    const API_BASE_URL = process.env.REACT_APP_API_URL;
    window.location.replace(`${API_BASE_URL}/auth/logout`);
  };

  const handleBalance = () => {
    navigate("/balance", { state: { user } });
  };

  const handleDeposit = () => {
    navigate("/deposit", { state: { user } });
  };

  const handleWithdrawl = () => {
    navigate("/withdrawl", { state: { user } });
  };

  const handleMarket = () => {
    navigate("/stockMarket", { state: { user } });
  };

  const handleBot = () => {
    navigate("/haboAi", { state: { user } });
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <div className="dashboard-header">
          <div className="dashboard-logo">
            <span className="logo-text">HABO</span>
            <span className="logo-dot"></span>
            <span className="logo-text-secondary">BERLIN</span>
          </div>
        </div>

        <h1 className="dashboard-title">Banking Dashboard</h1>

        <p className="dashboard-welcome">
          Welcome, <span>{user.name}</span>. What would you like to do today?
        </p>

        <div className="dashboard-actions">
          <button onClick={handleBalance} className="dashboard-button balance">
            <span className="button-icon">💰</span>
            <span className="button-label">Check Balance</span>
          </button>

          <button onClick={handleDeposit} className="dashboard-button deposit">
            <span className="button-icon">⬆️</span>
            <span className="button-label">Deposit Funds</span>
          </button>

          <button
            onClick={handleWithdrawl}
            className="dashboard-button withdrawal"
          >
            <span className="button-icon">⬇️</span>
            <span className="button-label">Withdraw Funds</span>
          </button>

          <button onClick={handleMarket} className="dashboard-button market">
            <span className="button-icon">📈</span>
            <span className="button-label">Stock Market</span>
          </button>

          <button onClick={handleBot} className="dashboard-button chatbot">
            <span className="button-icon">🤖</span>
            <span className="button-label">AI Assistant</span>
          </button>
        </div>

        <button onClick={handleBack} className="logout-button">
          <span className="logout-icon">🔒</span>
          Sign Out
        </button>

        <div className="dashboard-backdrop">
          <div className="berlin-skyline"></div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
