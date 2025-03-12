'use client';

import React, { useState } from 'react';

// UI Components
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTitle, DialogHeader } from '@/components/ui/dialog';

// Organiser Components
import TournamentsSection from '@/components/org/TournamentsSection';
import OrganiserReport from '@/components/org/OrgReports';
import OrganiserStats from '@/components/org/OrgStats';
import ReportedTeams from '@/components/org/ReportedTeams';
import OrganiserNavbar from '@/components/org/NavOrg';

const Dashboard = () => {
  const [isReportDialogOpen, setReportDialogOpen] = useState(false);

  const handleOpenReportDialog = () => setReportDialogOpen(true);
  const handleCloseReportDialog = () => setReportDialogOpen(false);

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-4">
      {/* Navigation */}
      <OrganiserNavbar handleOpenDialog={handleOpenReportDialog} />

      {/* Main Content */}
      <div className="max-w-6xl mx-auto mt-6 space-y-8">
        {/* Tournaments Section */}
        <Card className="shadow-lg border border-gray-200 rounded-xl p-4">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Ongoing Tournaments</CardTitle>
          </CardHeader>
          <CardContent>
            <TournamentsSection />
          </CardContent>
        </Card>

        {/* Stats & Reports Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Reports */}
          <Card className="shadow-lg border border-gray-200 rounded-xl p-4 col-span-1">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <OrganiserReport />
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

      {/* ✅ Report Dialog (Fixed) */}
      <Dialog open={isReportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Organiser Report</DialogTitle>
          </DialogHeader>
          <OrganiserReport />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
