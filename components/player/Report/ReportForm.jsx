'use client';

import { useState } from 'react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button'; // Import ShadCN Button component

const ReportFormDialog = () => {
  const [teamName, setTeamName] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('user_jwt'); // or use cookies/session
      const response = await fetch('http://localhost:5000/api/report/PreportT2O', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ teamName, reason }),
        credentials: 'include',
      });

      const result = await response.json();

      if (response.ok) {
        setMessage('Team reported successfully');
      } else {
        setMessage(`Error: ${result.details}`);
      }
    } catch (error) {
      setMessage('Error reporting team');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog>
      {/* The trigger to open the Dialog */}
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-blue-500 text-white hover:bg-blue-600">
          Report Team
        </Button>
      </DialogTrigger>

      {/* The dialog content */}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report a Team</DialogTitle>
          <DialogDescription>
            Please provide the necessary details to report the team.
          </DialogDescription>
        </DialogHeader>

        {/* Message or form */}
        {message && <p>{message}</p>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="teamName" className="block">Team Name:</label>
            <input
              type="text"
              id="teamName"
              name="teamName"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              required
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="reason" className="block">Reason:</label>
            <textarea
              id="reason"
              name="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              className="w-full p-2 border rounded"
            ></textarea>
          </div>

          <DialogFooter>
            <Button
              type="submit"
              className="bg-blue-500 text-white hover:bg-blue-600"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Report Team'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReportFormDialog;
