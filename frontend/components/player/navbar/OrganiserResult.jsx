import { useState } from 'react';

const OrganiserResult = ({ organiser }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFollow = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/player/followOrganiser`, {
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
        setMessage('✅ You are now following this organiser.');
      } else {
        setMessage(data.message || '❌ Error following organiser.');
      }
    } catch (error) {
      console.error(error);
      setMessage('❌ Error following organiser.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="organiser-result p-6 border-2 border-gray-300 rounded-lg shadow-md mb-6 bg-white">
      <h3 className="text-2xl font-bold mb-2">{organiser.username}</h3>
      <p className="text-gray-700"><strong>Email:</strong> {organiser.email}</p>

      <div className="mt-2">
        <p className="font-semibold">Tournaments Organized:</p>
        <ul className="list-disc ml-6 mt-1">
          {organiser.tournaments && organiser.tournaments.length > 0 ? (
            organiser.tournaments.map((tournament) => (
              <li key={tournament._id}>{tournament.name}</li>
            ))
          ) : (
            <li className="text-gray-500">No tournaments organized yet</li>
          )}
        </ul>
      </div>

      <div className="mt-4">
        {isFollowing ? (
          <p className="text-green-600 font-medium">✅ You are following this organiser.</p>
        ) : (
          <button
            onClick={handleFollow}
            disabled={loading}
            className={`px-4 py-2 rounded-lg text-white transition-colors duration-200 ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Following...' : 'Follow Organiser'}
          </button>
        )}
      </div>

      {message && (
        <p className="mt-3 text-sm text-gray-600">{message}</p>
      )}
    </div>
  );
};

export default OrganiserResult;
