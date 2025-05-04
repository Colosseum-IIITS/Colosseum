'use client';

import React, { useState, useEffect } from 'react';

// UI Components
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';


// Organiser Components
import TournamentsSection from '@/components/org/TournamentsSection';
import OrganiserReport from '@/components/org/OrgReports';
import RevenueGraph from '@/components/org/RevenueGraph'
import OrganiserStats from '@/components/org/OrgStats';
import ReportedTeams from '@/components/org/ReportedTeams';
import OrganiserNavbar from '@/components/org/NavOrg';

const Dashboard = () => {
  const [isReportDialogOpen, setReportDialogOpen] = useState(false);
  const [csrfToken, setCsrfToken] = useState('');

  // Fetch CSRF token once when dashboard loads
  // useEffect(() => {
  //   console.log('Dashboard - Fetching CSRF token');
  //   fetch('http://localhost:5000/auth/csrfToken', {
  //     credentials: 'include',
  //     cache: 'no-store'
  //   })
  //   .then(response => response.json())
  //   .then(data => {
  //     if (data && data.csrfToken) {
  //       console.log('Dashboard - CSRF token received:', data.csrfToken);
  //       setCsrfToken(data.csrfToken);
  //       // Share token with other components via localStorage
  //       localStorage.setItem('csrfToken', data.csrfToken);
  //     }
  //   })
  //   .catch(error => {
  //     console.error('Dashboard - Failed to fetch CSRF token:', error);
  //   });
  // }, []);
  
  const handleOpenReportDialog = () => setReportDialogOpen(true);
  const handleCloseReportDialog = () => setReportDialogOpen(false);

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-4">
      {/* Navigation */}
      <OrganiserNavbar handleOpenDialog={handleOpenReportDialog} />

      {/* Main Content */}
      <div className="max-w-6xl mx-auto mt-6 space-y-8">
        {/* Stats & Reports Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Reports */}
          <Card className="shadow-lg border border-gray-200 rounded-xl p-4 col-span-1">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Revenue Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <RevenueGraph />
            </CardContent>
          </Card>


          {/* Stats (Now Properly Aligned) */}
          <Card className="shadow-lg border border-gray-200 rounded-xl p-4 col-span-2">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Organiser Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <OrganiserStats />
            </CardContent>
          </Card>
        </div>

        {/* Tournaments Section */}
        <Card className="shadow-lg border border-gray-200 rounded-xl p-4">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Ongoing Tournaments</CardTitle>
          </CardHeader>
          <CardContent>
            <TournamentsSection />
          </CardContent>
        </Card>

        {/* Reported Teams Section */}
        <Card className="shadow-lg border border-gray-200 rounded-xl p-4">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Reported Teams</CardTitle>
          </CardHeader>
          <CardContent>
            <ReportedTeams />
          </CardContent>
        </Card>
      </div>

      {/* Report Dialog */}
      <OrganiserReport open={isReportDialogOpen} onOpenChange={handleCloseReportDialog} />
    </div>
  );
};

export default Dashboard;
