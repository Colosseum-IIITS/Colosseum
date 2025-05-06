
import { useEffect } from 'react';
import { useAdminDashboard } from './AdminDashboardContext';

const useFetchAdminDashboard = () => {
  const { dashboardData, setDashboardData } = useAdminDashboard();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/admin/dashboard`); // Your API endpoint here
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        const data = await response.json();
        setDashboardData(data);
      } catch (error) {
        console.error("Error fetching admin dashboard data:", error);
      }
    };

    if (!dashboardData) {
      fetchDashboardData();
    }
  }, [dashboardData, setDashboardData]);

  return dashboardData;
};

export default useFetchAdminDashboard;
