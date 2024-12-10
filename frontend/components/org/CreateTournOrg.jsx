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
            <h2 className="text-xl font-semibold text-gray-900">Create a New Tournament</h2>
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
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Tournament Name</label>
              <Input
                id="name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full mt-1 rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
              <Textarea
                id="description"
                name="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="w-full mt-1 rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              />
            </div>
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date</label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full mt-1 rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date</label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className="w-full mt-1 rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              />
            </div>
            <div>
              <label htmlFor="entryFee" className="block text-sm font-medium text-gray-700">Entry Fee</label>
              <Input
                id="entryFee"
                name="entryFee"
                type="number"
                value={entryFee}
                onChange={(e) => setEntryFee(e.target.value)}
                required
                className="w-full mt-1 rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              />
            </div>
            <div>
              <label htmlFor="prizePool" className="block text-sm font-medium text-gray-700">Prize Pool</label>
              <Input
                id="prizePool"
                name="prizePool"
                type="number"
                value={prizePool}
                onChange={(e) => setPrizePool(e.target.value)}
                required
                className="w-full mt-1 rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              />
            </div>
            <DialogFooter>
              <Button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-700 text-white rounded-lg p-3"
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Create Tournament'}
              </Button>
            </DialogFooter>
          </form>
          {message && <p className="text-center mt-4 text-gray-700">{message}</p>}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default OrgTourn;
