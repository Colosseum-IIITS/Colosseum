'use client';

import { useParams } from 'next/navigation'; // Use useParams to get route parameters in App Router
import { useState, useEffect } from 'react';
import TournamentDetails from '@/components/player/tournament/TournamentDetails';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'; // ShadCN Alert component for messages

const TournamentPage = () => {
  const { tournamentId } = useParams(); // Get tournamentId from params
  const [tournament, setTournament] = useState(null);
  const [organiser, setOrganiser] = useState(null);
  const [isPlayerInTournament, setIsPlayerInTournament] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // State to handle errors

  useEffect(() => {
    if (!tournamentId) {
      setError('Tournament ID is missing');
      setLoading(false);
      return;
    }

    const fetchTournamentDetails = async () => {
      try {
        const token = localStorage.getItem('user_jwt');
        const response = await fetch(`http://localhost:5000/api/tournament/${tournamentId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,  // Passing the token as Bearer
          },
          credentials: 'include',
        }); // Correct API URL
        const data = await response.json();

        console.log('API Response:', data); // Log the API response

        if (response.ok) {
          setTournament(data.tournament);
          setOrganiser(data.organiser);
          setUserRole(data.userRole);
          setIsPlayerInTournament(data.isPlayerInTournament);
        } else {
          setError(data.message || 'Failed to fetch tournament details');
        }
      } catch (error) {
        setError('Error fetching tournament details');
        console.error('Error fetching tournament details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTournamentDetails();
  }, [tournamentId]); // Dependency on tournamentId

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
        <div className="text-center">
          {/* Styled Loading Indicator */}
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-white h-4 w-4"></div>
            <div className="flex-1 space-y-2 py-1">
              <div className="h-4 bg-white rounded w-3/4"></div>
              <div className="h-4 bg-white rounded w-5/6"></div>
            </div>
          </div>
          <p className="mt-4 text-white text-lg font-medium">Loading tournament details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
        <Alert variant="destructive" className="max-w-md w-full shadow-lg">
          <AlertTitle className="text-xl font-bold">Error</AlertTitle>
          <AlertDescription className="mt-2 text-gray-700 dark:text-gray-300">
            {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!tournament || !organiser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
        <Alert variant="destructive" className="max-w-md w-full shadow-lg">
          <AlertTitle className="text-xl font-bold">Not Found</AlertTitle>
          <AlertDescription className="mt-2 text-gray-700 dark:text-gray-300">
            Tournament or Organiser not found.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <TournamentDetails
          tournament={tournament}
          organiser={organiser}
          userRole={userRole}
          isCaptain={isPlayerInTournament}
        />
      </div>
    </div>
  );
};

export default TournamentPage;