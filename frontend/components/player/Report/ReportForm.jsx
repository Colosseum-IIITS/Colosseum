'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button'; // ShadCN Button component
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'; // Assuming you have a RadioGroup component

const ReportFormDialog = ({ open, onOpenChange }) => {
  const [reportType, setReportType] = useState('Team'); // 'Team' or 'Organiser'
  const [teamName, setTeamName] = useState('');
  const [organiserName, setOrganiserName] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setReportType('Team');
      setTeamName('');
      setOrganiserName('');
      setReason('');
      setMessage('');
    }
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    // Client-side Validation
    if (reportType === 'Team' && !teamName.trim()) {
      setMessage('Team name is required.');
      setIsSubmitting(false);
      return;
    }

    if (reportType === 'Organiser' && !organiserName.trim()) {
      setMessage('Organiser name is required.');
      setIsSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem('user_jwt'); // or use cookies/session
      let endpoint = '';
      let payload = { reason };

      if (reportType === 'Team') {
        endpoint = 'PreportT2O';
        payload.teamName = teamName;
      } else if (reportType === 'Organiser') {
        endpoint = 'PreportO2A';
        payload.organiserName = organiserName;
      }

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

      console.log('Submitting report to:', `${API_URL}/api/report/${endpoint}`);
      console.log('Payload:', payload);

      const response = await fetch(`${API_URL}/api/report/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
        credentials: 'include',
      });

      console.log('Response status:', response.status);
      const result = await response.json();
      console.log('Response data:', result);

      if (response.ok) {
        setMessage('Report submitted successfully.');
        // Optionally close the dialog after successful submission
        setTeamName('');
        setOrganiserName('');
        setReason('');
        setTimeout(() => {
          onOpenChange(false);
          setMessage('');
        }, 2000); // Close after 2 seconds
      } else {
        setMessage(`Error: ${result.error || result.message || 'Failed to submit report.'}`);
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      setMessage('An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
      console.log('Form submission completed');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Dialog Content */}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report</DialogTitle>
          <DialogDescription>
            Choose the type of report and provide the necessary details.
          </DialogDescription>
        </DialogHeader>

        {/* Report Type Selection */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block font-medium mb-2">Report Type:</label>
            <RadioGroup value={reportType} onValueChange={setReportType} className="flex space-x-4">
              <RadioGroupItem id="report-team" value="Team">
                <label htmlFor="report-team" className="ml-2">
                  Team
                </label>
              </RadioGroupItem>
              <RadioGroupItem id="report-organiser" value="Organiser">
                <label htmlFor="report-organiser" className="ml-2">
                  Organiser
                </label>
              </RadioGroupItem>
            </RadioGroup>
          </div>

          {/* Conditional Input Fields */}
          {reportType === 'Team' && (
            <div className="mb-4">
              <label htmlFor="teamName" className="block font-medium mb-1">
                Team Name:
              </label>
              <input
                type="text"
                id="teamName"
                name="teamName"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                required
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          )}

          {reportType === 'Organiser' && (
            <div className="mb-4">
              <label htmlFor="organiserName" className="block font-medium mb-1">
                Organiser Name:
              </label>
              <input
                type="text"
                id="organiserName"
                name="organiserName"
                value={organiserName}
                onChange={(e) => setOrganiserName(e.target.value)}
                required
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          )}

          {/* Reason for Report */}
          <div className="mb-4">
            <label htmlFor="reason" className="block font-medium mb-1">
              Reason:
            </label>
            <textarea
              id="reason"
              name="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
            ></textarea>
          </div>

          {/* Feedback Message */}
          {message && (
            <p
              className={`mb-4 text-center ${
                message.startsWith('Error') ? 'text-red-600' : 'text-green-600'
              }`}
            >
              {message}
            </p>
          )}

          {/* Submit Button */}
          <DialogFooter>
            <Button
              type="submit"
              variant="destructive" // Red color to indicate critical action
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Report'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReportFormDialog;
