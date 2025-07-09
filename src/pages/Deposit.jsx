import {useNavigate, useLocation} from "react-router-dom";
import {useEffect, useContext, useState} from "react";
import { BalanceContext } from './BalanceContext';
import '../pagesCss/dashboard.css';

function Deposit() {
    const location = useLocation();
    const navigate = useNavigate();
    const user = location.state?.user;
    const { balance, deposit } = useContext(BalanceContext);
    const [amount, setAmount] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if(!user) {
            navigate('/')
        }
    }, [user, navigate]);

    if(!user) return null;

    const handleBack= () => {
        navigate('/dashboard', {state: {user}});
    };

    const handleDeposit = (e) => {
        e.preventDefault();
        const num = parseFloat(amount);
        if (isNaN(num) || num <= 0) {
            setError('Enter a valid positive amount');
            return;
        }
        deposit(num);
        setAmount('');
        setError('');
    };

    return (
        <div className="balance-card">
            <div className="balance-label">Current Balance</div>
            <div className="balance-amount">${balance.toFixed(2)}</div>
            <form className="balance-action-form" onSubmit={handleDeposit}>
                <input
                    className="balance-input"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="Enter amount to deposit"
                />
                <button className="balance-action-btn" type="submit">Deposit</button>
            </form>
            {error && <div className="balance-error">{error}</div>}
            <button className="balance-action-btn" onClick={handleBack}>Back to Dashboard</button>
        </div>
    );
}

export default Deposit;
