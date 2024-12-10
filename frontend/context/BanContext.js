'use client'
import { createContext, useState, useContext } from 'react';

const BanContext = createContext();

export const useBanContext = () => useContext(BanContext);

export const BanProvider = ({ children }) => {
  const [shouldRefetchBanHistory, setShouldRefetchBanHistory] = useState(false);

  const triggerBanHistoryRefetch = () => {
    setShouldRefetchBanHistory(true);
    setTimeout(() => {
      setShouldRefetchBanHistory(false); // Reset the flag after a short delay
    }, 1000);
  };

  return (
    <BanContext.Provider value={{ shouldRefetchBanHistory, triggerBanHistoryRefetch }}>
      {children}
    </BanContext.Provider>
  );
};
