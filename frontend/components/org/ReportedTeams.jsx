'use client';
import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button'; // Add Button to toggle views

import useFetchAdminDashboard from '@/context/useFetchAdminDashboard';

export default function ReportedTeams() {
  const dashboardData = useFetchAdminDashboard();
  const [reportedTeams, setReportedTeams] = useState([]);
  const [isCardView, setIsCardView] = useState(false); // State for toggling view
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    if (dashboardData && dashboardData.reports) {
      console.log('Dashboard Data:', dashboardData);
      dashboardData.reports.forEach(report => {
        console.log('Reported By Data:', report.reportedBy);
      });

      // Filter the reports for 'Team' type
      const filteredReports = dashboardData.reports.filter(
        (report) => report.reportType === 'Team'
      );

      setReportedTeams(filteredReports);
      console.log('Filtered Reported Teams:', filteredReports);
    }
  }, [dashboardData]);

  const handleReviewReport = async (reportId, status) => {
    try {
      const token = localStorage.getItem('user_jwt');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/report/update-status/${reportId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'Reviewed' })
      });

      if (!response.ok) {
        throw new Error('Failed to update report status');
      }

      const updatedReport = await response.json();

      // Update local state only after successful API call
      setReportedTeams((prevReports) =>
        prevReports.map((report) =>
          report._id === reportId ? { ...report, status: updatedReport.status } : report
        )
      );

      // Optional: Show success message
      console.log('Report status updated successfully');
    } catch (error) {
      console.error('Error updating report status:', error);
      // Optional: Show error message to user
    }
  };

  const toggleView = () => {
    setIsCardView((prevState) => !prevState);
  };

  if (!dashboardData || !reportedTeams) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full">
      {/* Button to toggle between Table and Card view */}
      <Button onClick={toggleView} className="mb-4">
        {isCardView ? 'Switch to Table View' : 'Switch to Card View'}
      </Button>

      {/* Conditional Rendering based on the view mode */}
      {isCardView ? (
        // Card View Format
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reportedTeams.length > 0 ? (
            reportedTeams.map((report) => (
              <Card key={report._id} className="shadow-lg rounded-lg">
                <CardHeader>
                  <CardTitle>{report.reportedTeam}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p><strong>Reported By:</strong> {report.reportedBy.username}</p>
                  <p><strong>Reason:</strong> {report.reason}</p>
                  <p><strong>Status:</strong> {report.status}</p>
                  <p><strong>Reported At:</strong> {new Date(report.createdAt).toLocaleString()}</p>
                  {/* Only show button if status is not 'Reviewed' */}
                  {report.status !== 'Reviewed' && (
                    <div className="mt-4">
                      <Button
                        onClick={() => handleReviewReport(report._id, 'Reviewed')}
                        className="bg-green-500 text-white"
                      >
                        Mark as Reviewed
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <p>No reported teams.</p>
          )}
        </div>
      ) : (
        // Table View Format
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Reported Teams</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reported By</TableHead>
                  <TableHead>Team Name</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reported At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportedTeams.length > 0 ? (
                  reportedTeams.map((report) => (
                    <TableRow key={report._id}>
                      <TableCell>{report.reportedBy.username}</TableCell>
                      <TableCell>{report.reportedTeam}</TableCell>
                      <TableCell>{report.reason}</TableCell>
                      <TableCell>{report.status}</TableCell>
                      <TableCell>
                        {/* Displaying formatted createdAt date */}
                        <span>{new Date(report.createdAt).toLocaleString()}</span>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      No reported teams.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
