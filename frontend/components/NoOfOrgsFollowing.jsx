'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Users } from 'lucide-react';

const NoOfOrgsFollowing = () => {
  const [noOfOrgsFollowing, setNoOfOrgsFollowing] = useState(0); // State for number of organisers followed
  const [error, setError] = useState(null); // State to handle errors
  const [loading, setLoading] = useState(true); // State for loading state

  useEffect(() => {
    const fetchFollowedOrganisers = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/player/followedOrg`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`, // Fetch with authorization token
          },
        });

        if (!response.ok) {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch followed organisers');
          } else {
            throw new Error('Unexpected response from the server');
          }
        }

        const data = await response.json();
        setNoOfOrgsFollowing(data.followedOrganisers.length); // Assuming 'followedOrganisers' is an array
      } catch (err) {
        console.error('Error fetching followed organisers:', err.message);
        setError(err.message); // Set the error state
      } finally {
        setLoading(false); // Set loading to false after the fetch attempt
      }
    };

    fetchFollowedOrganisers();
  }, []); // Empty dependency array ensures this runs only on mount

  if (loading) {
    return (
      <Card className="flex flex-col items-center p-4 bg-gray-700 bg-opacity-50 rounded-lg hover:bg-opacity-70 transition-colors duration-300">
        <CardContent>
          <p className="text-center text-gray-400">Loading followed organisers...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="flex flex-col items-center p-4 bg-gray-700 bg-opacity-50 rounded-lg hover:bg-opacity-70 transition-colors duration-300">
        <CardContent>
          <p className="text-center text-red-500">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col items-center p-4 bg-gray-700 bg-opacity-50 rounded-lg hover:bg-opacity-70 transition-colors duration-300">
      <CardHeader>
        <div className="flex flex-col items-center">
          <Users className="w-8 h-8 text-purple-500 mb-2 animate-pulse" />
          <CardTitle className="text-center text-gray-200">Organizers You Follow</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold text-center text-purple-500">{noOfOrgsFollowing}</p>
      </CardContent>
    </Card>
  );
};

export default NoOfOrgsFollowing;
