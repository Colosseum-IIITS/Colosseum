import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const PasswordForm = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    const currentPassword = e.target.currentPassword.value.trim();
    const newPassword = e.target.newPassword.value.trim();

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/player/updatePassword`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
      } else {
        setError(data.error || 'Failed to update password');
      }
    } catch (err) {
      console.error('Error updating password:', err);
      setError('Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center space-x-4">
        <div className="space-y-2 flex-grow">
          <div>
            <label htmlFor="currentPassword" className="text-sm font-medium text-gray-700 block mb-1">
              Current Password
            </label>
            <Input
              type="password"
              id="currentPassword"
              name="currentPassword"
              placeholder="Enter your current password"
              required
              className="max-w-xs"
            />
          </div>
          <div>
            <label htmlFor="newPassword" className="text-sm font-medium text-gray-700 block mb-1">
              New Password
            </label>
            <Input
              type="password"
              id="newPassword"
              name="newPassword"
              placeholder="Enter your new password"
              required
              className="max-w-xs"
            />
          </div>
        </div>
        <Button type="submit" className="mt-12" disabled={loading}>
          {loading ? 'Saving...' : 'Save'}
        </Button>
      </div>
      {message && <p className="text-green-500">{message}</p>}
      {error && <p className="text-red-500">{error}</p>}
    </form>
  );
};

export default PasswordForm;
