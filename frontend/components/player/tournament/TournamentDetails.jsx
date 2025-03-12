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
        <div className="overflow-x-auto rounded-lg border-2 border-orange-500 shadow-[0_0_15px_rgba(251,146,60,0.3)]">
          <table className="min-w-full bg-black">
            <thead>
              <tr className="bg-gradient-to-r from-orange-950 to-black">
                <th className="px-6 py-4 border-b-2 border-orange-500 text-left text-sm font-bold text-orange-400 uppercase tracking-wider">
                  Position
                </th>
                <th className="px-6 py-4 border-b-2 border-orange-500 text-left text-sm font-bold text-orange-400 uppercase tracking-wider">
                  Team Name
                </th>
                <th className="px-6 py-4 border-b-2 border-orange-500 text-left text-sm font-bold text-orange-400 uppercase tracking-wider">
                  Points
                </th>
              </tr>
            </thead>
            <tbody className="bg-black/95">
              {tournament.pointsTable.map((entry, index) => (
                <tr 
                  key={index} 
                  className={`
                    hover:bg-orange-950/30 
                    transition-all duration-300 ease-in-out
                    ${index === 0 ? 'bg-orange-950/20' : ''}
                    ${index === 1 ? 'bg-orange-900/10' : ''}
                    ${index === 2 ? 'bg-orange-800/5' : ''}
                  `}
                >
                  <td className="px-6 py-4 border-b border-orange-500/20">
                    <div className="flex items-center space-x-2">
                      <span className={`
                        flex items-center justify-center w-8 h-8 rounded-full 
                        ${index === 0 ? 'bg-orange-500 text-black' : ''}
                        ${index === 1 ? 'bg-orange-400/80 text-black' : ''}
                        ${index === 2 ? 'bg-orange-300/60 text-black' : ''}
                        ${index > 2 ? 'bg-gray-800 text-orange-50' : ''}
                        font-bold text-sm
                      `}>
                        {entry.ranking}
                      </span>
                      {index === 0 && <span className="text-orange-500">👑</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 border-b border-orange-500/20">
                    <span className="text-orange-50 font-medium hover:text-orange-400 transition-colors">
                      {entry.teamName}
                    </span>
                  </td>
                  <td className="px-6 py-4 border-b border-orange-500/20">
                    <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-orange-950/50 text-orange-400 font-semibold">
                      {entry.totalPoints}
                    </span>
                  </td>
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
