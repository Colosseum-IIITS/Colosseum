import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const PlayerResult = ({ player }) => {
  const [message, setMessage] = useState('');

  return (
    <div className="player-result p-4 border-2 border-gray-200 rounded-lg shadow-sm mb-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Avatar>
          <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${encodeURIComponent(player.username)}`} alt={`${player.username}'s avatar`} />
          <AvatarFallback>{player.username.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="text-xl font-bold">{player.username}</h3>
          <p><strong>Email:</strong> {player.email}</p>
          {player.team && <p><strong>Team:</strong> {player.team.name}</p>}
        </div>
      </div>

      <div className="flex flex-col items-end">
        {/* Message display or other content */}
        {message && <p className="mt-2 text-sm text-gray-500">{message}</p>}
      </div>
    </div>
  );
};

export default PlayerResult;
