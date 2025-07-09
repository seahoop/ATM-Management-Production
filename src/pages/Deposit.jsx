// Behavior: Deposit component that allows users to add funds to their account
// Exceptions:
// - Throws if user is not authenticated
// - Throws if deposit amount is invalid
// Return:
// - JSX: Deposit form with amount input and confirmation
// Parameters:
// - None (React component, uses location state for user data)

import { useLocation, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { BalanceContext } from "./BalanceContext";
import "../pagesCss/dashboard.css";

function Deposit() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = location.state?.user;
  const { deposit } = useContext(BalanceContext);
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");

  const handleBack = () => {
    navigate("/dashboard", { state: { user } });
  };

  const handleDeposit = () => {
    const depositAmount = parseFloat(amount);
    if (isNaN(depositAmount) || depositAmount <= 0) {
      setMessage("Please enter a valid amount");
      return;
    }
    deposit(depositAmount);
    setMessage(`Successfully deposited $${depositAmount.toFixed(2)}`);
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

        <h1 className="dashboard-title">Deposit Funds</h1>

        <div className="deposit-form">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            className="deposit-input"
          />
          <button onClick={handleDeposit} className="deposit-button">
            Deposit
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

export default Deposit;
