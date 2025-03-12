import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

const TeamActions = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [csrfToken,setCsrfToken]=useState('');

  useEffect(() => {
    fetch('http://localhost:5000/auth/csrfToken', { credentials: 'include' })
        .then(response => response.json())
        .then(data => setCsrfToken(data.csrfToken))
        .catch(error => console.error('Error fetching CSRF token:', error));
      }, []);

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    const teamName = e.target.name.value;
    
    if (!teamName) {
      return setError("Team name is required");
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      // Store team name in localStorage for later use
      localStorage.setItem('pendingTeamName', teamName);
      
      // Redirect to payment page
      router.push(`/payment?type=TEAM_CREATION&amount=500`);
    } catch (err) {
      console.error('Error:', err);
      setError('Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveTeam = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('http://localhost:5000/api/team/leave', {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({ _csrf: csrfToken }),
      });
      

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
      } else {
        setError(data.error || 'Failed to leave team');
      }
    } catch (err) {
      console.error('Error leaving team:', err);
      setError('Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTeamName = async (e) => {
    e.preventDefault();
    const newName = e.target.newName.value;
    
    if (!newName) {
      return setError("New team name is required");
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('http://localhost:5000/api/team/updateTeamName', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ newName, _csrf: csrfToken }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
      } else {
        setError(data.error || 'Failed to update team name');
      }
    } catch (err) {
      console.error('Error updating team name:', err);
      setError('Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Create Team Form */}
      <form onSubmit={handleCreateTeam} className="flex items-center space-x-4">
        <Input 
          type="text" 
          name="name" 
          placeholder="Team Name" 
          required 
          className="max-w-xs"
        />
        <Button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Team'}
        </Button>
      </form>

      {/* Leave Team Form */}
      <form onSubmit={handleLeaveTeam}>
        <Button type="submit" variant="destructive" disabled={loading}>
          {loading ? 'Leaving...' : 'Leave Team'}
        </Button>
      </form>

      {/* Update Team Name Form */}
      <form onSubmit={handleUpdateTeamName} className="flex items-center space-x-4">
        <div className="flex-grow">
          <label htmlFor="newName" className="text-sm font-medium text-gray-700 block mb-1">New Team Name:</label>
          <Input 
            type="text" 
            id="newName" 
            name="newName" 
            required 
            placeholder="Enter New Team Name" 
            className="max-w-xs"
          />
        </div>
        <Button type="submit" className="mt-6" disabled={loading}>
          {loading ? 'Updating...' : 'Update Team Name'}
        </Button>
      </form>

      {/* Error and Success Messages */}
      {message && <p className="text-green-500">{message}</p>}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
};

export default TeamActions;
