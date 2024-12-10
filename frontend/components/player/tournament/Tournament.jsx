'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

const Tournament = ({ tournament }) => {
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString();

  const handleViewDetails = () => {
    router.push(`/player/home/tournament/${tournament._id}`); 
  };

  if (!isClient) return null;

  return (
    <div className="tournament-item p-6 border-2 border-gray-200 rounded-xl shadow-lg bg-white hover:shadow-xl transition-shadow duration-300 relative">
      <div className="TName">
        <h4 className="text-2xl font-semibold text-gray-800">{tournament.name}</h4>
      </div>

      <div className="DescT mt-4">
        <p className="text-lg text-gray-700">
          <strong className="font-medium text-gray-900">Start Date:</strong> {formatDate(tournament.startDate)}
        </p>
        <p className="text-lg text-gray-700">
          <strong className="font-medium text-gray-900">Prize Pool:</strong> ${tournament.prizePool}
        </p>
      </div>

      {/* View Details Button */}
      <Button 
        onClick={handleViewDetails} 
        className="absolute bottom-4 right-4 bg-black text-white hover:bg-gray-800 transition-colors"
      >
        View Details
      </Button>
    </div>
  );
};

export default Tournament;