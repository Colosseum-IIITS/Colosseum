import { useState } from 'react';

const OrganiserResult = ({ organiser }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [message, setMessage] = useState('');

  const handleFollow = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/player/followOrganiser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('user_jwt')}`,
        },
        credentials: 'include',
        body: JSON.stringify({ organiserId: organiser._id }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsFollowing(true);
        setMessage('You are now following this organiser.');
      } else {
        setMessage(data.message || 'Error following organiser.');
      }
    } catch (error) {
      setMessage('Error following organiser.');
      console.error(error);
    }
  };

  return (
    <div className="organiser-result p-4 border-2 border-gray-200 rounded-lg shadow-sm mb-4">
      <h3 className="text-xl font-bold">{organiser.username}</h3>
      <p><strong>Email:</strong> {organiser.email}</p>
      <p><strong>Tournaments Organized:</strong></p>
      <ul>
        {organiser.tournaments.length > 0 ? (
          organiser.tournaments.map((tournament) => (
            <li key={tournament._id}>{tournament.name}</li>
          ))
        ) : (
          <li>No tournaments organized yet</li>
        )}
      </ul>

      <div className="mt-4">
        {isFollowing ? (
          <p className="text-green-600">You are following this organiser.</p>
        ) : (
          <button
            onClick={handleFollow}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Follow Organiser
          </button>
        )}
      </div>

      {message && <p className="mt-2 text-sm text-gray-500">{message}</p>}
    </div>
  );
};

export default OrganiserResult;
