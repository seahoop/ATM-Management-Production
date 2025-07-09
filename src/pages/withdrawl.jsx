// Behavior: Withdrawal component that allows users to withdraw funds from their account
// Exceptions:
// - Throws if user is not authenticated
// - Throws if withdrawal amount is invalid or exceeds balance
// Return:
// - JSX: Withdrawal form with amount input and confirmation
// Parameters:
// - None (React component, uses location state for user data)

import { useLocation, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { BalanceContext } from "./BalanceContext";
import "../pagesCss/dashboard.css";

function Withdrawl() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = location.state?.user;
  const { balance, withdraw } = useContext(BalanceContext);
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");

  const handleBack = () => {
    navigate("/dashboard", { state: { user } });
  };

  const handleWithdraw = () => {
    const withdrawalAmount = parseFloat(amount);
    if (isNaN(withdrawalAmount) || withdrawalAmount <= 0) {
      setMessage("Please enter a valid amount");
      return;
    }
    if (withdrawalAmount > balance) {
      setMessage("Insufficient funds");
      return;
    }
    withdraw(withdrawalAmount);
    setMessage(`Successfully withdrawn $${withdrawalAmount.toFixed(2)}`);
    setAmount("");
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

        <h1 className="dashboard-title">Withdraw Funds</h1>

        <div className="withdrawal-form">
          <p className="current-balance">Current Balance: ${balance.toLocaleString()}</p>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            className="withdrawal-input"
          />
          <button onClick={handleWithdraw} className="withdrawal-button">
            Withdraw
          </button>
          {message && <p className="message">{message}</p>}
        </div>

        <button onClick={handleBack} className="logout-button">
          <span className="logout-icon">←</span>
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}

export default Withdrawl;
