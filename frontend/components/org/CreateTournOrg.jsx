'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle } from '@/components/ui/dialog';

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
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCreateTournament = async (e) => {
    e.preventDefault();

    const authToken = localStorage.getItem('token');
    if (!authToken) {
      setMessage('No authentication token found.');
      return;
    }

    // Validate required fields
    if (!tid || !name || !description || !startDate || !endDate || !entryFee || !prizePool) {
      setMessage('Please fill out all fields.');
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      setMessage('End date cannot be earlier than the start date.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // Re-fetch CSRF token immediately before submitting
      const csrfResponse = await fetch('http://localhost:5000/auth/csrfToken', {
        credentials: 'include',
        cache: 'no-store'
      });
      const csrfData = await csrfResponse.json();
      if (!csrfData?.csrfToken) {
        setMessage('Failed to obtain CSRF token.');
        setLoading(false);
        return;
      }
      const freshCsrfToken = csrfData.csrfToken;

      // Prepare the request body with the CSRF token
      const requestBody = {
        tid,
        name,
        description,
        startDate,
        endDate,
        entryFee: Number(entryFee),
        prizePool: Number(prizePool),
        _csrf: freshCsrfToken // send token in raw JSON body
      };

      const response = await fetch('http://localhost:5000/api/tournament/create', {
        method: 'POST',
        credentials: 'include', // ensure cookies are sent along
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(requestBody)
      });

      const result = await response.json();
      if (response.ok) {
        setMessage(result.message || 'Tournament created successfully');
        setIsDialogOpen(false);
      } else {
        setMessage(result.message || 'Failed to create tournament');
      }
    } catch (error) {
      console.error('Error during tournament creation:', error);
      setMessage('Error occurred while creating tournament');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsDialogOpen(true)}
        className="mb-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg transition-all duration-300"
      >
        Create Tournament
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger />
        <DialogContent className="max-w-md w-full rounded-xl bg-white p-4 shadow-xl transition-all duration-300 transform max-h-[80vh] overflow-y-auto scrollbar-hide">
          <DialogHeader>
            <DialogTitle>Create a New Tournament</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateTournament} className="space-y-4">
            <div>
              <label htmlFor="tid" className="block text-sm font-medium text-gray-700">
                Tournament ID
              </label>
              <Input
                id="tid"
                name="tid"
                value={tid}
                onChange={(e) => setTid(e.target.value)}
                required
                className="w-full mt-1 rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              />
            </div>
            {/* Additional fields for name, description, startDate, endDate, entryFee, prizePool */}
            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Tournament'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {message && <p className="mt-4 text-center">{message}</p>}
    </>
  );
};

export default OrgTourn;
