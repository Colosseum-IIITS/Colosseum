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

const ReportFormDialog = ({ open, onOpenChange }) => {
  const [organiserName, setOrganiserName] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
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
    if (!organiserName.trim()) {
      setMessage('Organiser name is required.');
      setIsSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem('user_jwt'); // or use cookies/session
      const payload = {
        organiserName,
        reason,
      };

  
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/report/OreportO2A`, {
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
            Provide the necessary details for your report.
          </DialogDescription>
        </DialogHeader>

        {/* Report Form */}
        <form onSubmit={handleSubmit}>
          {/* Organiser Name */}
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
