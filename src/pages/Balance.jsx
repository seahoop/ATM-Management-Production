// Behavior: Balance display component that shows user's current account balance
// Exceptions:
// - Throws if user is not authenticated
// Return:
// - JSX: Balance page with current balance display and navigation
// Parameters:
// - None (React component, uses location state for user data)

import { useLocation, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { BalanceContext } from "./BalanceContext";
import "../pagesCss/dashboard.css";

function Balance() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = location.state?.user;
  const { balance } = useContext(BalanceContext);

  const handleBack = () => {
    navigate("/dashboard", { state: { user } });
  };

  if (!user) {
    navigate("/");
    return null;
  }

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

        <h1 className="dashboard-title">Account Balance</h1>

        <div className="balance-display">
          <h2>Current Balance</h2>
          <p className="balance-amount">${balance.toLocaleString()}</p>
        </div>

        <button onClick={handleBack} className="logout-button">
          <span className="logout-icon">←</span>
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}

export default Balance;
