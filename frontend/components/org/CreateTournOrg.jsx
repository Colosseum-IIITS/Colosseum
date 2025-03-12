'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button'; // ShadCN Button
import { Input } from '@/components/ui/input'; // ShadCN Input
import { Textarea } from '@/components/ui/textarea'; // ShadCN Textarea
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter } from '@/components/ui/dialog'; // ShadCN Dialog components

const OrgTourn = () => {
  const [tid, setTid] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [entryFee, setEntryFee] = useState(0);
  const [prizePool, setPrizePool] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false); // Manage dialog open state
  const [csrfToken,setCsrfToken] = useState('');
  
  useEffect(() => {
    fetch('http://localhost:5000/auth/csrfToken', { credentials: 'include' })
        .then(response => response.json())
        .then(data => setCsrfToken(data.csrfToken))
        .catch(error => console.error('Error fetching CSRF token:', error));
        }, []);

  // Handle form submission
  const handleCreateTournament = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
      setMessage('No authentication token found.');
      return;
    }

    // Ensure all fields are filled
    if (!tid || !name || !description || !startDate || !endDate || !entryFee || !prizePool) {
      setMessage('Please fill out all fields.');
      return;
    }

    // Validate that the end date is not before the start date
    if (new Date(endDate) < new Date(startDate)) {
      setMessage('End date cannot be earlier than the start date.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('http://localhost:5000/api/tournament/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          tid,
          name,
          description,
          startDate,
          endDate,
          entryFee: Number(entryFee), // Convert entryFee to number
          prizePool: Number(prizePool), // Convert prizePool to number
          _csrf: csrfToken,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        setMessage(result.message || 'Tournament created successfully');
        setIsDialogOpen(false); // Close dialog on success
      } else {
        setMessage(result.message || 'Failed to create tournament');
      }
    } catch (error) {
      setMessage('Error occurred while creating the tournament');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Button to open the Create Tournament dialog */}
      <Button onClick={() => setIsDialogOpen(true)} className="mb-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg transition-all duration-300">
        Create Tournament
      </Button>

      {/* Dialog for creating tournament */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger />
        <DialogContent className="max-w-md w-full rounded-xl bg-white p-4 shadow-xl transition-all duration-300 transform max-h-[80vh] overflow-y-auto scrollbar-hide">
        <DialogHeader>
          <VisuallyHidden.Root>
            <DialogTitle>Create a New Tournament</DialogTitle>
          </VisuallyHidden.Root>
        </DialogHeader>
        
          <form onSubmit={handleCreateTournament} className="space-y-4">
            <div>
              <label htmlFor="tid" className="block text-sm font-medium text-gray-700">Tournament ID</label>
              <Input
                id="tid"
                name="tid"
                value={tid}
                onChange={(e) => setTid(e.target.value)}
                required
                className="w-full mt-1 rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              />
            </div>
            {/* Other input fields */}
            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Tournament'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>


    </>
  );
};

export default OrgTourn;
