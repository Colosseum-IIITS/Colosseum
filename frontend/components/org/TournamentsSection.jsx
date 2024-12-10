"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const TournamentsSection = () => {
  const [visibilitySettings, setVisibilitySettings] = useState({});
  const [tournamentList, setTournamentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No token found');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('http://localhost:5000/api/organiser/getOrganiserName', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.ok) {
          setVisibilitySettings(data.visibilitySettings);
          setTournamentList(data.tournaments);
        } else {
          setError('Failed to fetch organiser data');
        }
      } catch (error) {
        setError('Error fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  if (!visibilitySettings.tournamentsVisible) {
    return null;
  }

  return (
    <section className="tournaments-section mt-8 px-4">
      <div className="max-w-4xl mx-auto p-6 bg-gray-50 rounded-lg shadow-md space-y-6">
        <h3 className="text-2xl font-semibold text-black mb-4">All Tournaments</h3>
        {tournamentList.length > 0 ? (
          <div className="overflow-y-auto max-h-[500px]">
            <ul className="space-y-4">
              {tournamentList.map((tournament) => {
                if (!tournament._id) {
                  console.warn('Tournament missing _id:', tournament);
                  return null;
                }

                return (
                  <li key={tournament._id}>
                    <Card className="bg-white border border-gray-300 shadow-sm rounded-lg p-4 mb-4">
                      <CardHeader className="bg-white p-4 rounded-md">
                        <CardTitle className="text-xl font-semibold text-black">{tournament.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-black">Start Date: {new Date(tournament.startDate).toLocaleDateString()}</p>
                        <p className="text-black">End Date: {new Date(tournament.endDate).toLocaleDateString()}</p>
                        <p className="text-black">Prize Pool: ${tournament.prizePool}</p>
                        <div
                          className={`status-box ${tournament.status?.toLowerCase() || 'unknown'} bg-gray-200 rounded-full py-1 px-4 inline-block mt-2`}>
                          {tournament.status || 'Unknown'}
                        </div>
                        {tournament.status === 'Completed' && (
                          <p className="text-black mt-2">Winner: {tournament.winner || 'TBD'}</p>
                        )}
                        <button
                          className="mt-4 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
                          onClick={() => router.push(`/org/dashboard/tournament/${tournament._id}`)}
                        >
                          View Details
                        </button>
                      </CardContent>
                    </Card>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : (
          <p className="text-center text-gray-500 mt-4">No tournaments available</p>
        )}
      </div>
    </section>
  );
};

export default TournamentsSection;
