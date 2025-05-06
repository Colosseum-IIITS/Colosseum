'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'; // ShadCN Card
import { BeatLoader } from 'react-spinners'; // ShadCN BeatLoader for loading state
import { Alert } from '@/components/ui/alert'; // ShadCN Alert (optional for error handling)
import axios from 'axios'; // For API calls

const OrganiserStats = () => {
  const [loading, setLoading] = useState(true); // Handle loading state
  const [error, setError] = useState(null); // Handle errors
  const [organiserData, setOrganiserData] = useState(null); // State to hold organiser data

  // Fetch organiser data from API
  useEffect(() => {
    const fetchOrganiserData = async () => {
      try {
        const token = localStorage.getItem('token'); // Get token from localStorage or other storage
    
        // If there's no token, handle the error or redirect the user to login
        if (!token) {
          setError('Token missing. Please log in.');
          setLoading(false);
          return;
        }
    
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/organiser/getOrganiserName`, {
          headers: {
            Authorization: `Bearer ${token}`, // Ensure the token is attached
          },
        });
    
        setOrganiserData(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch organiser data');
        setLoading(false);
      }
    };
    
    fetchOrganiserData();
  }, []);

  if (loading) {
    return (
      <Card className="shadow-lg bg-white rounded-lg p-6">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-semibold text-gray-900">Organiser Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center">
            <BeatLoader />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-lg bg-white rounded-lg p-6">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-semibold text-gray-900">Organiser Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive" className="text-center">
            {error}
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Destructure the data from organiserData if it's available
  const { rating, followers, banned } = organiserData || {};

  // Helper function to safely format numbers
  const formatNumber = (value) => {
    return typeof value === 'number' ? value.toLocaleString() : 'N/A';
  };

  return (
    <Card className="shadow-lg bg-white rounded-lg p-6">
      <CardHeader>
        <CardTitle className="text-center text-2xl font-semibold text-gray-900">Organiser Stats</CardTitle>
      </CardHeader>
      <CardContent>
        <section className="stats-section flex flex-wrap justify-between">
          {/* Rating */}
          <div className="stat-card w-full sm:w-1/3 p-4">
            <Card className="shadow-sm bg-black text-white">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Rating</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl text-center">{formatNumber(rating)}</p>
              </CardContent>
            </Card>
          </div>

          {/* Followers */}
          <div className="stat-card w-full sm:w-1/3 p-4">
            <Card className="shadow-sm bg-black text-white">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Followers</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl text-center">{formatNumber(followers)}</p>
              </CardContent>
            </Card>
          </div>

          {/* Banned */}
          <div className="stat-card w-full sm:w-1/3 p-4">
            <Card className="shadow-sm bg-black text-white">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Banned</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl text-center">{banned ? 'Yes' : 'No'}</p>
              </CardContent>
            </Card>
          </div>
        </section>
      </CardContent>
    </Card>
  );
};

export default OrganiserStats;
