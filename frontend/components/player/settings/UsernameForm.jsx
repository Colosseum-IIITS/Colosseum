import React, { useState } from 'react';
import { useUser } from '@/context/UserContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const   UsernameForm = () => {
  const { user, setUser } = useUser(); // Assuming `setUser` updates user context
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    const username = e.target.username.value.trim();

    try {
      const response = await fetch('http://localhost:5000/api/player/updateUsername', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ username }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setUser({ ...user, username }); // Update user in context
      } else {
        setError(data.error || 'Failed to update username');
      }
    } catch (err) {
      console.error('Error updating username:', err);
      setError('Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center space-x-4">
        <div className="flex-grow">
          <label htmlFor="username" className="text-sm font-medium text-gray-700 block mb-1">
            Username
          </label>
          <Input
            type="text"
            id="username"
            name="username"
            defaultValue={user ? user.username : ''}
            placeholder="Enter your name"
            required
            className="max-w-xs"
          />
        </div>
        <Button type="submit" className="mt-6" disabled={loading}>
          {loading ? 'Updating...' : 'Update'}
        </Button>
      </div>
      {message && <p className="text-green-500">{message}</p>}
      {error && <p className="text-red-500">{error}</p>}
    </form>
  );
};

export default UsernameForm;
