// components/TeamResult.js
import { useState } from 'react';
import { Button } from '@/components/ui/button'; // Assuming ShadCN Button
import { useToast } from "@/hooks/use-toast";
import { Badge } from '@/components/ui/badge';

const TeamResult = ({ team }) => {
  const [joining, setJoining] = useState(false);
  const [message, setMessage] = useState('');
  const { toast } = useToast();

  const handleJoinTeam = async () => {
    setJoining(true);
    const token = localStorage.getItem('user_jwt');
  
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/team/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ teamId: team._id }), // Send teamId in the body
      });
  
      const data = await response.json();
  
      if (response.ok) {
        setMessage('Successfully joined the team!');
        toast({
          title: "Join Successful",
          description: "You have joined the team.",
        });
      } else {
        setMessage(data.message || 'Error joining team.');
        toast({
          title: "Join Failed",
          description: data.message || 'Error joining team.',
          variant: "destructive",
        });
      }
    } catch (error) {
      setMessage('Error joining the team.');
      console.error('Error joining team:', error);
      toast({
        title: "Error",
        description: "An error occurred while trying to join the team.",
        variant: "destructive",
      });
    } finally {
      setJoining(false);
    }
  };
  
  return (
    <div className="team-result p-4 border-2 border-gray-200 rounded-lg shadow-sm mb-4">
      <h3 className="text-xl font-bold">{team.name}</h3>
      <p><strong>Captain:</strong> {team.captain.name}</p>
      <p><strong>Members:</strong> {team.players.length}</p>
      <p><strong>Tournaments Participated:</strong> {team.tournaments.length}</p>
      
      <div className="mt-4">
        {message && <p className="text-sm text-gray-600">{message}</p>}
        <Button
          onClick={handleJoinTeam}
          disabled={joining || team.isFull} // Assuming 'isFull' indicates if the team is full
          className="bg-blue-500 text-white hover:bg-blue-600"
        >
          {joining ? 'Joining...' : team.isFull ? 'Team Full' : 'Join Team'}
        </Button>
      </div>
    </div>
  );
};

export default TeamResult;
