
'use client';

import { Button } from '@/components/ui/button'; // Assuming you're using ShadCN components
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge'; // ShadCN Badge component for status
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'; // ShadCN Alert component for messages

const TournamentDetails = ({ tournament, organiser, userRole, isCaptain }) => {
  const [message, setMessage] = useState('');
  const [captainStatus, setCaptainStatus] = useState(isCaptain); // Track if player is captain
  const router = useRouter();

  const handleBackButton = () => {
    router.push('/player/home'); // Redirects to player home page
  };

  const handleLeaveTournament = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/tournament/leave/${tournament._id}`, {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        setCaptainStatus(false);
        setMessage('Successfully left the tournament!');
      } else {
        setMessage('Failed to leave the tournament');
      }
    } catch (error) {
      setMessage('Error leaving the tournament');
      console.error(error);
    }
  };

  useEffect(() => {
    setCaptainStatus(isCaptain);
  }, [isCaptain]);

  // Function to determine badge color based on status
  const getStatusVariant = (status) => {
    switch (status.toLowerCase()) {
      case 'upcoming':
        return 'secondary';
      case 'ongoing':
        return 'success';
      case 'completed':
        return 'destructive';
      default:
        return 'default';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg space-y-6">
      {/* Tournament Title */}
      <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4 text-center">
        {tournament.name}
      </h1>

      {/* Tournament Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700 dark:text-gray-300">
        <div className="space-y-2">
          <p>
            <strong>ID:</strong> <span className="font-medium">{tournament.tid}</span>
          </p>
          <p>
            <strong>Organised By:</strong> <span className="font-medium">{organiser.username}</span>
          </p>
          <p>
            <strong>Start Date:</strong> <span className="font-medium">{new Date(tournament.startDate).toLocaleDateString()}</span>
          </p>
          <p>
            <strong>End Date:</strong> <span className="font-medium">{new Date(tournament.endDate).toLocaleDateString()}</span>
          </p>
        </div>
        <div className="space-y-2">
          <p>
            <strong>Entry Fee:</strong> <span className="font-semibold text-green-600">${tournament.entryFee}</span>
          </p>
          <p>
            <strong>Prize Pool:</strong> <span className="font-semibold text-blue-600">${tournament.prizePool}</span>
          </p>
          {/* Changed <p> to <div> to allow <Badge> inside */}
          <div className="flex items-center space-x-2">
            <strong>Status:</strong>
            <Badge variant={getStatusVariant(tournament.status)}>
              {tournament.status}
            </Badge>
          </div>
        </div>
      </div>

      {/* Teams Section */}
      <div>
        <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Teams</h3>
        <ul className="list-disc pl-6 space-y-2">
          {tournament.teams.length > 0 ? (
            tournament.teams.map((team) => (
              <li key={team._id} className="text-gray-700 dark:text-gray-300">
                {team.name}
              </li>
            ))
          ) : (
            <li className="text-gray-500 dark:text-gray-400">No teams yet</li>
          )}
        </ul>
      </div>

      {/* Points Table Section */}
      <div>
        <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Points Table</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-700 border">
            <thead className="bg-gray-200 dark:bg-gray-600">
              <tr>
                <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                  Rank
                </th>
                <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                  Team Name
                </th>
                <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                  Points
                </th>
              </tr>
            </thead>
            <tbody>
              {tournament.pointsTable.map((entry, index) => (
                <tr key={index} className="hover:bg-gray-100 dark:hover:bg-gray-600">
                  <td className="px-4 py-2 border-b text-sm text-gray-700 dark:text-gray-300">{entry.ranking}</td>
                  <td className="px-4 py-2 border-b text-sm text-gray-700 dark:text-gray-300">{entry.teamName}</td>
                  <td className="px-4 py-2 border-b text-sm text-gray-700 dark:text-gray-300">{entry.totalPoints}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        {captainStatus ? (
          <Button onClick={handleLeaveTournament} variant="destructive" className="w-40">
            Leave Tournament
          </Button>
        ) : (
          <Button onClick={handleBackButton} className="w-40">
            Back
          </Button>
        )}
      </div>

      {/* Feedback Message */}
      {message && (
        <Alert className="mt-4" variant={message.includes('successfully') ? 'success' : 'error'}>
          <AlertTitle>{message.includes('successfully') ? 'Success' : 'Error'}</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default TournamentDetails;
