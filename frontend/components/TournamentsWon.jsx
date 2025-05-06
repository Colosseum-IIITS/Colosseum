'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Trophy } from 'lucide-react';

const TournamentsWon = () => {
  const [tournamentsWon, setTournamentsWon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('Token from localStorage:', token);

    if (!token) {
      setError('No token found');
      setLoading(false);
      console.error('No token found');
      return;
    }

    const fetchTournamentsWon = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/player/tournamentsWon`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log('Authorization Header:', `Bearer ${token}`);

        if (!response.ok) {
          const errorMessage = await response.text();
          throw new Error(`Error: ${response.statusText} - ${errorMessage}`);
        }

        const data = await response.json();
        console.log('Tournaments data:', data);

        if (data && typeof data.tournamentsWon === 'number') {
          setTournamentsWon(data.tournamentsWon);
        } else {
          setError('Invalid response format');
        }
      } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
        setError('Error fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchTournamentsWon();
  }, []);

  if (loading) {
    return (
      <Card className="flex flex-col items-center p-4 bg-gray-700 bg-opacity-50 rounded-lg hover:bg-opacity-70 transition-colors duration-300">
        <CardContent>
          <p className="text-center text-gray-400">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="flex flex-col items-center p-4 bg-gray-700 bg-opacity-50 rounded-lg hover:bg-opacity-70 transition-colors duration-300">
        <CardContent>
          <p className="text-center text-red-500">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col items-center p-4 bg-gray-700 bg-opacity-50 rounded-lg hover:bg-opacity-70 transition-colors duration-300">
      <CardHeader>
        <div className="flex flex-col items-center">
          <Trophy className="w-8 h-8 text-yellow-500 mb-2 animate-bounce" />
          <CardTitle className="text-center text-gray-200">Tournaments Won</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold text-center text-green-500">
          {tournamentsWon !== null ? tournamentsWon : 'No data available'}
        </p>
      </CardContent>
    </Card>
  );
};

export default TournamentsWon;
