'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'; // Ensure these components are properly set up
import { TrophyIcon } from 'lucide-react'; // Importing a relevant rank icon

const PlayerRanking = () => {
  const [playerRanking, setPlayerRanking] = useState(null); // State to hold the ranking data
  const [error, setError] = useState(null); // State to handle errors
  const [loading, setLoading] = useState(true); // State to handle loading state

  useEffect(() => {
    const fetchPlayerRanking = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/player/ranking`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!response.ok) {
          const errorMessage = await response.text();
          throw new Error(`Error: ${response.statusText} - ${errorMessage}`);
        }

        const data = await response.json();
        setPlayerRanking(data.playerRanking);
      } catch (error) {
        console.error('Error fetching player ranking:', error);
        setError('Error fetching ranking');
      } finally {
        setLoading(false);
      }
    };

    fetchPlayerRanking();
  }, []);

  if (loading) {
    return (
      <Card className="w-full max-w-sm shadow-md">
        <CardContent>
          <p className="text-center text-gray-500">Loading ranking...</p>
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
    <Card className="w-full max-w-sm shadow-md">
      <CardHeader>
        <CardTitle className="text-center">Player Ranking</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center p-4 bg-gray-700 bg-opacity-50 rounded-lg hover:bg-opacity-70 transition-colors duration-300">
          <TrophyIcon className="w-8 h-8 text-yellow-500 mb-2 animate-pulse" /> {/* Rank icon */}
          {playerRanking !== null ? (
            <p className="text-2xl font-semibold text-center text-green-600">Rank: {playerRanking}</p>
          ) : (
            <p className="text-center text-gray-600">Ranking information is unavailable.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PlayerRanking;
