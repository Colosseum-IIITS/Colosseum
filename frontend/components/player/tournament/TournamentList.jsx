'use client';

import { useEffect, useState } from 'react';
import Tournament from './Tournament';

const TournamentList = () => {
  const [joinedTournaments, setJoinedTournaments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const token = localStorage.getItem('user_jwt');
        console.log(token);

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/tournament/tournamentsEnrolled`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          console.log(data);

          setJoinedTournaments(data.tournaments);
        }else if (response.status === 400) {
          setJoinedTournaments([]);
        }else {
          console.error('Failed to fetch tournaments');
        }
        setLoading(false);
      } catch (error) {
        console.error('Error:', error);
        setLoading(false);
      }
    };

    fetchTournaments();
  }, []);

  if (loading) {
    return <p className="text-center text-xl text-gray-700">Loading tournaments...</p>;
  }

  // Filter out duplicate tournaments by `_id`
  const uniqueTournaments = joinedTournaments.filter(
    (tournament, index, self) =>
      index === self.findIndex((t) => t._id === tournament._id)
  );

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 rounded-lg shadow-md space-y-6">
      {uniqueTournaments.length > 0 ? (
        uniqueTournaments.map((tournament) => (
          <Tournament key={tournament._id} tournament={tournament} />
        ))
      ) : (
        <p className="text-center text-lg text-gray-500">You have not joined any tournaments.</p>
      )}
    </div>
  );
};

export default TournamentList;
