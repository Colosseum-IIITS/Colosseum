// components/TournamentEdit.jsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Loader2 } from 'lucide-react';

const TournamentEdit = ({ tournamentId }) => {
    const [tournament, setTournament] = useState(null);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [selectedTeamId, setSelectedTeamId] = useState('');
    const [additionalPoints, setAdditionalPoints] = useState('');
    const [bannedTeams, setBannedTeams] = useState([]);
    const [selectedWinnerTeam, setSelectedWinnerTeam] = useState('');
    const [declaringWinner, setDeclaringWinner] = useState(false);
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
        
        const teamToBan = tournament.teams.find(team => team._id === teamId);
        if (!teamToBan) {
            setError('Team not found');
            return;
        }

        const response = await fetch('http://localhost:5000/api/organiser/banTeam', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                teamId,
                tournamentId: tournament._id
            }),
            credentials: 'include',
        });

        const data = await response.json();

        if (response.ok) {
            // Add to banned teams list
            setBannedTeams(prev => [...prev, teamToBan]);
            
            // Update tournament state
            setTournament(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    teams: prev.teams.map(team => 
                        team._id === teamId 
                            ? { ...team, status: 'BANNED' }
                            : team
                    ),
                    pointsTable: prev.pointsTable.filter(
                        entry => entry.teamName !== teamToBan.name
                    )
                };
            });

            setSuccessMessage(`Team "${teamToBan.name}" has been banned`);
            setError('');
        } else {
            throw new Error(data.message || 'Failed to ban team');
        }
    } catch (error) {
        console.error('Ban Team Error:', error);
        setError(error.message || 'Error banning team');
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

// Handler to declare winner
const handleDeclareWinner = async (e) => {
    e.preventDefault();
    
    // Get the team at the top of the points table
    const topTeam = tournament.pointsTable[0];
    if (!topTeam) {
        setError('No teams found in points table');
        return;
    }

    // Find the team ID from the team name
    const winningTeam = tournament.teams.find(team => team.name === topTeam.teamName);
    if (!winningTeam) {
        setError('Could not find winning team details');
        return;
    }

    setDeclaringWinner(true);
    setError('');
    setSuccessMessage('');

    try {
        const token = localStorage.getItem('user_jwt');
        const response = await fetch('http://localhost:5000/api/tournament/updateWinner', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                tournamentId: tournament._id,
                winningTeamId: winningTeam._id
            }),
            credentials: 'include',
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to declare winner');
        }

        // First update success message
        setSuccessMessage(`Congratulations! ${topTeam.teamName} has been declared the winner!`);
        
        // Then update tournament state
        const updatedTournament = {
            ...tournament,
            winner: winningTeam._id,
            status: 'Completed'
        };
        setTournament(updatedTournament);

        // Clear form states
        setSelectedTeamId('');
        setAdditionalPoints('');
        setDeclaringWinner(false);

    } catch (error) {
        console.error('Declare Winner Error:', error);
        setError(error.message || 'Error declaring winner');
        setDeclaringWinner(false);
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
                <Card className="mb-6">
                    <CardHeader>
                        <h3 className="text-lg font-semibold">Tournament Winner</h3>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xl font-medium">
                            {tournament.teams.find(team => team._id === tournament.winner)?.name || 'Unknown Team'}
                        </p>
                    </CardContent>
                </Card>
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
            <Card className="mb-6">
                <CardHeader>
                    <h3 className="text-lg font-semibold">Update Points Table</h3>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleUpdatePoints} className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="team" className="text-sm font-medium">
                                Select Team
                            </label>
                            <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a team" />
                                </SelectTrigger>
                                <SelectContent>
                                    {tournament.teams.map((team) => (
                                        <SelectItem key={team._id} value={team._id}>
                                            {team.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        
                        <div className="space-y-2">
                            <label htmlFor="points" className="text-sm font-medium">
                                Additional Points
                            </label>
                            <Input 
                                type="number"
                                id="points"
                                value={additionalPoints}
                                onChange={(e) => setAdditionalPoints(e.target.value)}
                                placeholder="Enter points to add"
                                min="1"
                                required
                            />
                        </div>

                        <div className="flex justify-end space-x-2">
                            <Button type="submit" variant="default">
                                Update Points
                            </Button>
                            {tournament.status != 'Completed' && tournament.pointsTable.length > 0 && (
                                <Button 
                                    onClick={handleDeclareWinner}
                                    disabled={declaringWinner}
                                    variant="secondary"
                                >
                                    {declaringWinner ? (
                                        <span className="flex items-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Declaring...
                                        </span>
                                    ) : (
                                        'Declare Winner'
                                    )}
                                </Button>
                            )}
                        </div>
                    </form>
                </CardContent>
            </Card>

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