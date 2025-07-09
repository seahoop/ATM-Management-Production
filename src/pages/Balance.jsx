import {useNavigate, useLocation} from "react-router-dom";
import {useEffect, useContext} from "react";
import { BalanceContext } from './BalanceContext';
import '../pagesCss/dashboard.css';

function Balance() {
    const location = useLocation();
    const navigate = useNavigate();
    const user = location.state?.user;
    const { balance } = useContext(BalanceContext);

    useEffect(() => {
        if(!user) {
            navigate('/')
        }
    }, [user, navigate]);

    if(!user) return null;

    const handleBack= () => {
        navigate('/dashboard', {state: {user}});
    };

    return (
        <div className="balance-card">
            <div className="balance-label">Current Balance</div>
            <div className="balance-amount">${balance.toFixed(2)}</div>
            <button className="balance-action-btn" onClick={handleBack}>Back to Dashboard</button>
        </div>
    );
}

export default Balance;
