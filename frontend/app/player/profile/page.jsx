'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/player/profileNavbar/Navbar';
import ProfilePicture from '@/components/player/profileNavbar/ProfilePicture';
import { UserProvider } from '@/context/UserContext';

const PlayerProfile = () => {
  const [playerData, setPlayerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchPlayerData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        // Optionally, redirect to login or show a message
        return;
      }

      try {
        const response = await fetch('http://localhost:5000/api/player/dashboard', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch player data');
        }

        const data = await response.json();
        setPlayerData(data.player);
      } catch (error) {
        console.error('Error fetching player data:', error);
        // Optionally, set an error state to display a message
      } finally {
        setLoading(false);
      }
    };

    fetchPlayerData();
  }, []);

  const handleTeamRedirect = () => {
    router.push('/player/team');
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar /> {/* Ensure Navbar is part of the loading screen */}
        <div className="flex-grow flex items-center justify-center">
          <div className="text-xl font-semibold text-gray-700">Loading...</div>
        </div>
      </div>
    );
  }

  if (!playerData) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar /> {/* Ensure Navbar is part of the error screen */}
        <div className="flex-grow flex items-center justify-center">
          <div className="text-xl font-semibold text-red-500">
            Unable to load profile data.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-[70%] mt-[20px] mx-auto">
        <Navbar /> {/* Integrate Navbar at the top */}
      </div>
      <main className="flex-grow container mx-auto px-6 py-12">
        <div className="space-y-8">
          
          {/* Player Profile Section */}
          <section className="bg-white dark:bg-gray-800 p-10 rounded-3xl shadow-lg">
            <UserProvider>
            <div className="ml-[40px] flex items-center space-x-16">
                <div className="w-48 h-48 rounded-full overflow-hidden"> {/* Profile Picture container */}
                  <ProfilePicture />
                </div>
                <div className="flex-grow"> {/* Content container */}
                  <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">
                    Player Profile
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <span className="w-40 font-medium text-gray-700 dark:text-gray-300">Username:</span>
                      <span className="text-gray-900 dark:text-gray-100">{playerData.username}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-40 font-medium text-gray-700 dark:text-gray-300">Email:</span>
                      <span className="text-gray-900 dark:text-gray-100">{playerData.email}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-40 font-medium text-gray-700 dark:text-gray-300">Team:</span>
                      <Button
                        onClick={handleTeamRedirect}
                        className={`mt-0 ${
                          playerData.team
                            ? 'bg-black hover:bg-gray-800 text-white shadow-md transform transition-all duration-200 ease-in-out hover:scale-105'
                            : 'border border-black text-white hover:bg-black-100 shadow-sm transform transition-all duration-200 ease-in-out hover:scale-105'
                        } rounded-lg px-6 py-3 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2`}
                      >
                        {playerData.team ? `${playerData.team.name}` : 'No Team'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </UserProvider>
          </section>



          {/* Player Stats Section */}
          <section className="bg-white dark:bg-gray-800 p-10 rounded-3xl shadow-lg">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">
              Player Stats
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Stat Card */}
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-inner">
                <p className="text-xl font-semibold text-gray-800 dark:text-white">Global Rank</p>
                <p className="mt-2 text-2xl text-blue-600 dark:text-blue-400">{playerData.globalRank || 'N/A'}</p>
              </div>
              {/* Stat Card */}
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-inner">
                <p className="text-xl font-semibold text-gray-800 dark:text-white">Tournaments Played</p>
                <p className="mt-2 text-2xl text-blue-600 dark:text-blue-400">{playerData.tournamentsPlayed || 0}</p>
              </div>
              {/* Stat Card */}
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-inner">
                <p className="text-xl font-semibold text-gray-800 dark:text-white">Tournaments Won</p>
                <p className="mt-2 text-2xl text-blue-600 dark:text-blue-400">{playerData.tournamentsWon || 0}</p>
              </div>
              {/* Stat Card */}
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-inner">
                <p className="text-xl font-semibold text-gray-800 dark:text-white">Ongoing Tournaments</p>
                <p className="mt-2 text-2xl text-blue-600 dark:text-blue-400">{playerData.ongoingTournaments || 0}</p>
              </div>
              {/* Stat Card */}
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-inner">
                <p className="text-xl font-semibold text-gray-800 dark:text-white">Orgs Following</p>
                <p className="mt-2 text-2xl text-blue-600 dark:text-blue-400">{playerData.noOfOrgsFollowing || 0}</p>
              </div>
              {/* Stat Card */}
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-inner">
                <p className="text-xl font-semibold text-gray-800 dark:text-white">Win Percentage</p>
                <p className="mt-2 text-2xl text-blue-600 dark:text-blue-400">{playerData.winPercentage ? `${playerData.winPercentage}%` : 'N/A'}</p>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Optional: Footer */}
      <footer className="bg-white dark:bg-gray-800 py-4">
        <div className="container mx-auto text-center text-gray-600 dark:text-gray-400">
          &copy; {new Date().getFullYear()} Colloseum. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default PlayerProfile;
