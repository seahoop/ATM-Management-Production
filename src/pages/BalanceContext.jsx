import React, { createContext, useState } from 'react';

export const BalanceContext = createContext();

export const BalanceProvider = ({ children }) => {
  const [balance, setBalance] = useState(100000); // Hardcoded initial balance

  const deposit = (amount) => {
    setBalance((prev) => prev + amount);
  };

  const withdraw = (amount) => {
    setBalance((prev) => prev - amount);
  };

  return (
    <BalanceContext.Provider value={{ balance, deposit, withdraw }}>
      {children}
    </BalanceContext.Provider>
  );
};
