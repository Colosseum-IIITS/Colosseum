'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { GamepadIcon } from 'lucide-react'; // Import the GamepadIcon for the tournaments played icon

const TournamentsPlayed = () => {
  const [tournamentsPlayed, setTournamentsPlayed] = useState(0); // State for tournaments played count
  const [error, setError] = useState(null); // State to handle errors
  const [loading, setLoading] = useState(true); // State to handle loading state

  useEffect(() => {
    const fetchTournamentsPlayed = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/player/tournamentsPlayed`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`, // Authorization header with token
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch tournaments played');
        }

        const data = await response.json();
        setTournamentsPlayed(data.tournamentsPlayed);
      } catch (err) {
        console.error('Error fetching tournaments played:', err.message);
        setError(err.message); // Set error message
      } finally {
        setLoading(false); // Set loading state to false after fetch
      }
    };

    fetchTournamentsPlayed();
  }, []);

  if (loading) {
    return (
      <Card className="w-full max-w-sm shadow-md">
        <CardContent>
          <p className="text-center text-gray-500">Loading tournaments played...</p>
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
        <CardTitle className="text-center text-green-500">Tournaments Played</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center p-4 bg-gray-700 bg-opacity-50 rounded-lg hover:bg-opacity-70 transition-colors duration-300">
          <GamepadIcon className="w-8 h-8 text-green-500 mb-2 animate-pulse" />
          <span className="text-2xl font-bold text-blue-600">{tournamentsPlayed}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default TournamentsPlayed;
