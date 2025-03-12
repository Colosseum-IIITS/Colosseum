'use client';

import { useState, useEffect } from "react";
import OrganiserDropdown from "./OrganiserDropdown";
import { Button } from "@/components/ui/button"; // ShadCN Button
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog"; // ShadCN Dialog components
import { Input } from "@/components/ui/input"; // ShadCN Input
import { Textarea } from "@/components/ui/textarea"; // ShadCN Textarea
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"; // ShadCN Card

const OrganiserNavbar = ({ handleOpenDialog }) => {
  const [username, setUsername] = useState(""); // State to store the username
  const [loading, setLoading] = useState(true); // State to track loading status
  const [error, setError] = useState(""); // State to track error messages

  const [tid, setTid] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [entryFee, setEntryFee] = useState(0);
  const [prizePool, setPrizePool] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false); // Manage dialog open state
  const [loadingSubmit, setLoadingSubmit] = useState(false); // Loading state for submit button
  const [message, setMessage] = useState('');
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

    if (!tid || !name || !description || !startDate || !endDate || !entryFee || !prizePool) {
      setMessage('Please fill out all fields.');
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      setMessage('End date cannot be earlier than the start date.');
      return;
    }

    setLoadingSubmit(true);
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
          entryFee: Number(entryFee),
          prizePool: Number(prizePool),
          _csrf:csrfToken,
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
      setLoadingSubmit(false);
    }
  };

  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/organiser/getOrganiserName", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("authToken")}`, // Assuming JWT token is stored in localStorage
          },
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          setUsername(data.username); // Set the username state
          setLoading(false); // Set loading to false once the data is fetched
        } else {
          const data = await response.json();
          setError(data.message || "Error fetching username");
          setLoading(false);
        }
      } catch (error) {
        console.error("Error:", error);
        setError("Error fetching data");
        setLoading(false);
      }
    };

    fetchUsername();
  }, []);

  return (
    <nav className="bg-gray-900 p-4 shadow-md mb-6 w-[75%] mx-auto border-b border-gray-700 rounded-xl">

      <div className="flex justify-between items-center w-full">
        <div className="text-white text-2xl font-bold mt-5">
          {loading ? "Loading..." : username ? username : "My Tournament App"}
        </div>

        {/* Align the SearchBar and Dropdown to the right */}
        <div className="flex items-center space-x-4 ml-auto mt-5">
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="bg-blue-500 text-white py-2 px-4 rounded"
          >
            Create Tournament
          </Button>
          <button
            onClick={handleOpenDialog}
            className="bg-blue-500 text-white py-2 px-4 rounded"
          >
            Report
          </button>
          <OrganiserDropdown />
        </div>
      </div>

      {/* Create Tournament Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger />
        <DialogContent className="max-w-md w-full rounded-xl bg-white p-4 shadow-xl transition-all duration-300 transform max-h-[80vh] overflow-y-auto scrollbar-hide">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900">Create a New Tournament</DialogTitle>
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
                disabled={loadingSubmit}
              >
                {loadingSubmit ? 'Submitting...' : 'Create Tournament'}
              </Button>
            </DialogFooter>
          </form>
          {message && <p className="text-center mt-4 text-gray-700">{message}</p>}
        </DialogContent>
      </Dialog>
    </nav>
  );
};

export default OrganiserNavbar;
