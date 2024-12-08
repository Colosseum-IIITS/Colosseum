'use client';

import React, { useState } from 'react';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'; // ShadCN components
import TournamentsSection from '@/components/org/TournamentsSection'; // Import TournamentsSection component
import OrganiserReport from '@/components/org/OrgReports'; // Import OrganiserReport component
import OrganiserStats from '@/components/org/OrgStats'; 
import ReportedTeams from '@/components/org/ReportedTeams';
import OrganiserControls from '@/components/org/CreateTournOrg'; // Includes Create Tournament Button

import OrganiserNavbar from '@/components/org/NavOrg';


const Dashboard = () => {
  const [isReportDialogOpen, setReportDialogOpen] = useState(false); // State to manage the report dialog visibility
  const [isTournamentDialogOpen, setTournamentDialogOpen] = useState(false); // State for the tournament creation dialog visibility

  // Function to open the report dialog
  const handleOpenReportDialog = () => setReportDialogOpen(true);

  // Function to close the report dialog
  const handleCloseReportDialog = () => setReportDialogOpen(false);

  // Function to open the tournament creation dialog
  const handleOpenTournamentDialog = () => setTournamentDialogOpen(true);

  // Function to close the tournament creation dialog
  const handleCloseTournamentDialog = () => setTournamentDialogOpen(false);

  return (
    <div className="dashboard-container min-h-screen bg-gray-100 p-8">
      {/* Include the DashboardHeader component */}
      <OrganiserNavbar handleOpenDialog={handleOpenReportDialog} />
  {/* Tournaments Section */}
  <div className="mt-8 px-2">
  <TournamentsSection /> {/* Include TournamentsSection component */}
      </div>
      {/* Organiser Profile Section */}
      <div className="mt-8 px-2">
      <OrganiserReport /> {/* This will render the Organiser Report form inside the dashboard */}
            <OrganiserStats />
            <ReportedTeams />
      </div>

      <OrganiserReport
        open={isReportDialogOpen}
        onOpenChange={handleCloseReportDialog}
      /> {/* Pass state and handler to control dialog visibility */}

  
    </div>
  );
};

export default Dashboard;
