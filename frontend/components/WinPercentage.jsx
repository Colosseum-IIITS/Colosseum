'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BarChartIcon } from 'lucide-react'; // Importing a relevant icon for win percentage

const WinPercentage = () => {
  const [winPercentage, setWinPercentage] = useState(0); // State for win percentage
  const [error, setError] = useState(null); // State for error handling
  const [loading, setLoading] = useState(true); // State for loading

  useEffect(() => {
    const fetchWinPercentage = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/player/winPercentage', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`, // Authorization header with token
          },
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch win percentage');
        }
  
        const data = await response.json();
        console.log("Win percentage response data:", data); // Log the data
        setWinPercentage(data.winPercentage);
      } catch (err) {
        console.error('Error fetching win percentage:', err.message);
        setError(err.message); // Set error message
      } finally {
        setLoading(false); // Set loading state to false after fetch
      }
    };
  
    fetchWinPercentage();
  }, []);
  

  if (loading) {
    return (
      <Card className="w-full max-w-sm shadow-md">
        <CardContent>
          <p className="text-center text-gray-500">Loading win percentage...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-sm shadow-md">
        <CardContent>
          <p className="text-center text-red-500">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-sm shadow-md bg-gray-800 bg-opacity-80 backdrop-blur-sm border-green-500 border-2 transform hover:scale-105 transition-transform duration-300">
      <CardHeader>
        <CardTitle className="text-center text-green-500">Win Percentage</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center p-4 bg-gray-700 bg-opacity-50 rounded-lg hover:bg-opacity-70 transition-colors duration-300">
          <BarChartIcon className="w-8 h-8 text-green-500 mb-2 animate-pulse" />
          <span className="text-2xl font-bold text-blue-600">
  {winPercentage !== null && winPercentage !== undefined ? `${winPercentage}%` : '0%'}
</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default WinPercentage;
