'use client';

import { useState } from 'react';
import { Button } from '../../../components/ui/button'; // Adjust path if needed

const OrganiserItem = ({ organiser }) => {
  const [isFollowing, setIsFollowing] = useState(true);

  const handleUnfollow = async () => {
    const token = localStorage.getItem('user_jwt');
    
    try {
      const response = await fetch('http://localhost:5000/api/player/unFollowOrganiser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({ organiserId: organiser._id }),
      });

      if (response.ok) {
        setIsFollowing(false);
        window.location.reload();
      } else {
        alert('Failed to unfollow organiser.');
      }
    } catch (error) {
      alert('Error unfollowing organiser.');
    }
  };

  return (
    <div className="tournament-item p-6 border-2 border-gray-200 rounded-xl shadow-lg bg-white hover:shadow-xl transition-shadow duration-300 relative">
      <h3 className="text-xl font-bold">{organiser?.username || 'Unnamed'}</h3>
      <div className="organiser-description mt-2">
        <p><strong>Email:</strong> {organiser?.email || 'N/A'}</p>
        <p><strong>Tournaments Organized:</strong></p>
        <ul className="list-disc ml-5">
          {organiser.tournaments && organiser.tournaments.length > 0 ? (
            organiser.tournaments.map((tournament) => (
              <li key={tournament._id}>{tournament.name}</li>
            ))
          ) : (
            <li>No tournaments organized yet</li>
          )}
        </ul>
      </div>

      {isFollowing && (
        <Button
          onClick={handleUnfollow}
          className="absolute bottom-4 right-4 bg-black text-white hover:bg-gray-700"
        >
          Unfollow
        </Button>
      )}
    </div>
  );
};

export default OrganiserItem;
