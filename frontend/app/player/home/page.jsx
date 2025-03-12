'use client';

import { useEffect, useState } from 'react';
import TournamentList from '@/components/player/tournament/TournamentList';
import OrganiserList from '@/components/player/organisers/OrganiserList';
import ReportForm from '@/components/player/Report/ReportForm';
import Navbar from '@/components/player/navbar/Navbar';

export default function HomePage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <Navbar />  {/* Render Navbar component */}
      </div>
      
      {/* Tournament List and Organiser List Section */}
      <div className="flex space-x-8 mb-8">
        <div className="w-1/2">
          <TournamentList />  {/* Render TournamentList component */}
        </div>
        <div className="w-1/2">
          <OrganiserList />  {/* Render OrganiserList component */}
        </div>
      </div>
      <div className="w-1/2">
          <ReportForm/>
      </div>

    </div>
  );
}