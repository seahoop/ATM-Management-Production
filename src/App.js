import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/logIn';
import Dashboard from './pages/DashBoard';
import Deposit from './pages/Deposit';
import Withdrawl from './pages/withdrawl';
import Balance from './pages/Balance';
import StockMarket from './pages/StockMarket';
import Callback from './pages/Callback';
import HaboAi from './pages/HaboAi';
import {BalanceProvider} from './pages/BalanceContext';

function App() {

  return (
    <BalanceProvider>
    <Router>
      <Routes>
        <Route path="/" element={<Login/>}/>
        <Route path="/dashboard" element={<Dashboard/>}/>
         <Route path="/callback" element={<Callback />} />
        <Route path="/deposit" element={<Deposit />}/>
        <Route path="/withdrawl" element={<Withdrawl />}/>
        <Route path="/balance" element={<Balance/>}/>
        <Route path="/stockMarket" element={<StockMarket/>}/>
        <Route path="/haboAi" element={<HaboAi/>}/>
      </Routes>
    </Router>
    </BalanceProvider>
  );
}

export default App;
