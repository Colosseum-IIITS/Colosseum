'use client'
import { createContext, useState, useContext } from 'react';

const AdminDashboardContext = createContext();

export const AdminDashboardProvider = ({ children }) => {
  const [dashboardData, setDashboardData] = useState(null);

  return (
    <AdminDashboardContext.Provider value={{ dashboardData, setDashboardData }}>
      {children}
    </AdminDashboardContext.Provider>
  );
};

export const useAdminDashboard = () => {
  const context = useContext(AdminDashboardContext);
  if (!context) {
    throw new Error("useAdminDashboard must be used within an AdminDashboardProvider");
  }
  return context;
};
