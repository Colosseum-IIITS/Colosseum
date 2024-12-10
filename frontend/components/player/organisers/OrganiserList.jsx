'use client';

import { useEffect, useState } from 'react';
import OrganiserItem from './OrganiserItem'; // Assuming OrganiserItem is a separate component

const OrganiserList = () => {
  const [followedOrganisers, setFollowedOrganisers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFollowedOrganisers = async () => {
      try {
        const token = localStorage.getItem('user_jwt');
        const response = await fetch('http://localhost:5000/api/player/followedOrg', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          credentials: 'include',
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Error fetching followed organisers:', errorData);
          return;
        }

        const data = await response.json();
        setFollowedOrganisers(data.followedOrganisers);
      } catch (error) {
        console.error('Error fetching followed organisers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFollowedOrganisers();
  }, []);

  if (loading) {
    return <div className="text-center text-xl text-gray-700">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 rounded-lg shadow-md space-y-6">
      {followedOrganisers.length > 0 ? (
        followedOrganisers.map((organiser) => (
          <OrganiserItem key={organiser._id} organiser={organiser} />
        ))
      ) : (
        <p className="text-center text-lg text-gray-500">You are not following any organisers yet.</p>
      )}
    </div>
  );
};

export default OrganiserList;
