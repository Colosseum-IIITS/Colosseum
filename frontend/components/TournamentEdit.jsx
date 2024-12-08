// components/TournamentEdit.jsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

const TournamentEdit = ({ tournamentId }) => {
    const [tournament, setTournament] = useState(null);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [selectedTeamId, setSelectedTeamId] = useState('');
    const [additionalPoints, setAdditionalPoints] = useState('');
    const router = useRouter();

    useEffect(() => {
        const fetchTournament = async () => {
            try {
                const token = localStorage.getItem('user_jwt');
                const response = await fetch(`http://localhost:5000/api/tournament/${tournamentId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,  // Passing the token as Bearer
                },
                credentials: 'include',
                });


                console.log('Fetch response status:', response.status);

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('Fetch failed:', errorData.message);
                    setError(errorData.message || 'Failed to load tournament data.');
                    return;
                }

                const data = await response.json();
                console.log('Fetched data:', data);

                const { tournament } = data;

                if (!tournament) {
                    setError('Tournament not found.');
                    return;
                }

                setTournament(tournament);
            } catch (err) {
                console.error('Fetch Tournament Error:', err);
                setError('Error loading tournament data.');
            }
        };

        fetchTournament();
    }, [tournamentId]);

    // Function to get team name by ID (for pointsTable removal)
    const getTeamNameById = (teamId) => {
        const team = tournament.teams.find((team) => team._id === teamId);
        return team ? team.name : '';
    };

    // Handler to ban a team
const handleBanTeam = async (teamId) => {
    if (!teamId) {
        setError('Invalid team selected.');
        return;
    }

    if (!confirm('Are you sure you want to ban this team? This action cannot be undone.')) {
        return;
    }

    try {
        const token = localStorage.getItem('user_jwt');

        const response = await fetch(`http://localhost:5000/api/organiser/banTeam`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,  // Passing the token as Bearer
            },
            body: JSON.stringify({ teamId }), // Include teamId in the body
            credentials: 'include',
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Ban Team Response:', data);
            setError(''); // Clear any existing error
            setSuccessMessage('Team banned successfully.');

            // Remove the banned team from the state
            setTournament((prev) => ({
                ...prev,
                teams: prev.teams.filter((team) => team._id !== teamId),
                pointsTable: prev.pointsTable.filter((entry) => entry.teamName !== getTeamNameById(teamId)),
            }));
        } else {
            const errorData = await response.json();
            setError(errorData.message || 'Failed to ban team');
            setSuccessMessage('');
        }
    } catch (error) {
        console.error('Ban Team Error:', error);
        setError('Error banning team');
        setSuccessMessage('');
    }
};

// Handler to update points table
const handleUpdatePoints = async (e) => {
    e.preventDefault();

    // Validation
    if (!selectedTeamId) {
        setError('Please select a team.');
        return;
    }

    if (!additionalPoints) {
        setError('Please enter additional points.');
        return;
    }

    if (isNaN(additionalPoints)) {
        setError('Additional points must be a number.');
        return;
    }

    if (Number(additionalPoints) <= 0) {
        setError('Additional points must be greater than zero.');
        return;
    }

    console.log("seleted team:", selectedTeamId);

    try {
        const token = localStorage.getItem('user_jwt');

        const response = await fetch(`http://localhost:5000/api/tournament/updateTable`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,  // Passing the token as Bearer
            },
            body: JSON.stringify({
                tournamentId,
                teamName: selectedTeamId,
                additionalPoints: Number(additionalPoints),
            }),
            credentials: 'include',
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Update Points Response:', data);
            setError(''); // Clear any existing error
            setSuccessMessage('Points table updated successfully.');

            // Update the tournament state with the updated tournament data
            setTournament(data.tournament);

            // Reset the form
            setSelectedTeamId('');
            setAdditionalPoints('');
        } else {
            const errorData = await response.json();
            setError(errorData.message || 'Failed to update points table');
            setSuccessMessage('');
        }
    } catch (error) {
        console.error('Update Points Error:', error);
        setError('Error updating points table');
        setSuccessMessage('');
    }
};



    if (error && !tournament) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Alert variant="error">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </div>
        );
    }

    if (!tournament) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-gray-500 text-xl">Loading...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg space-y-6">
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4 text-center">
                {tournament.name}
            </h1>

            {/* Winner Display */}
            {tournament.winner && (
                <div className="text-6xl font-bold text-center text-blue-600">
                    Winner: {tournament.winner}
                </div>
            )}

            {/* Tournament Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700 dark:text-gray-300">
                <div className="space-y-2">
                    <p>
                        <strong>ID:</strong> <span className="font-medium">{tournament.tid}</span>
                    </p>
                    <p>
                        <strong>Organised By:</strong> <span className="font-medium">{tournament.organiser.username}</span>
                    </p>
                    <p>
                        <strong>Start Date:</strong>{' '}
                        <span className="font-medium">
                            {new Date(tournament.startDate).toLocaleDateString()}
                        </span>
                    </p>
                    <p>
                        <strong>End Date:</strong>{' '}
                        <span className="font-medium">
                            {new Date(tournament.endDate).toLocaleDateString()}
                        </span>
                    </p>
                </div>
                <div className="space-y-2">
                    <p>
                        <strong>Entry Fee:</strong>{' '}
                        <span className="font-semibold text-green-600">${tournament.entryFee}</span>
                    </p>
                    <p>
                        <strong>Prize Pool:</strong>{' '}
                        <span className="font-semibold text-blue-600">${tournament.prizePool}</span>
                    </p>
                    <div className="flex items-center space-x-2">
                        <strong>Status:</strong>
                        <Badge variant={tournament.status.toLowerCase() === 'pending' ? 'secondary' : 'success'}>
                            {tournament.status}
                        </Badge>
                    </div>
                </div>
            </div>

            {/* Description */}
            <div>
                <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Description</h3>
                <p className="text-gray-700 dark:text-gray-300">{tournament.description}</p>
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
                            {tournament.pointsTable?.map((entry, index) => (
                                <tr key={index} className="hover:bg-gray-100 dark:hover:bg-gray-600">
                                    <td className="px-4 py-2 border-b text-sm text-gray-700 dark:text-gray-300">
                                        {entry.ranking}
                                    </td>
                                    <td className="px-4 py-2 border-b text-sm text-gray-700 dark:text-gray-300">
                                        {entry.teamName}
                                    </td>
                                    <td className="px-4 py-2 border-b text-sm text-gray-700 dark:text-gray-300">
                                        {entry.totalPoints}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Teams Section */}
            <div>
                <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Teams</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white dark:bg-gray-700 border">
                        <thead className="bg-gray-200 dark:bg-gray-600">
                            <tr>
                                <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                                    Team Name
                                </th>
                                <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {tournament.teams?.map((team) => (
                                <tr key={team._id} className="hover:bg-gray-100 dark:hover:bg-gray-600">
                                    <td className="px-4 py-2 border-b text-sm text-gray-700 dark:text-gray-300">
                                        {team.name}
                                    </td>
                                    <td className="px-4 py-2 border-b text-sm text-gray-700 dark:text-gray-300">
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => handleBanTeam(team._id)}
                                        >
                                            Ban Team
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Update Points Table Section */}
<div>
    <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Update Points Table</h3>
    <form onSubmit={handleUpdatePoints} className="space-y-4">
        {/* Team Selection */}
        <div>
            <label htmlFor="team" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Select Team
            </label>
            <select
                id="team"
                name="team"
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-gray-300"
            >
                <option value="">-- Select a Team --</option>
                {tournament.teams.map((team) => (
                    <option key={team._id} value={team._id}>
                        {team.name}
                    </option>
                ))}
            </select>
        </div>
        {/* Additional Points Input */}
        <div>
            <label htmlFor="points" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Additional Points
            </label>
            <input
                type="number"
                id="points"
                name="points"
                value={additionalPoints}
                onChange={(e) => setAdditionalPoints(e.target.value)}
                className="mt-1 block w-full pl-3 pr-12 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-gray-300"
                placeholder="Enter points to add"
                min="1"
                required
            />
        </div>
        {/* Submit Button */}
        <div>
            <Button type="submit" variant="primary">
                Update Points
            </Button>
        </div>
    </form>
</div>



            {/* Success Message */}
            {successMessage && (
                <div className="flex justify-center">
                    <Alert variant="success">
                        <AlertTitle>Success</AlertTitle>
                        <AlertDescription>{successMessage}</AlertDescription>
                    </Alert>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="flex justify-center">
                    <Alert variant="error">
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                </div>
            )}
        </div>
    );

};

export default TournamentEdit;
