import React, { useState } from 'react';
import { useUser } from '@/context/UserContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const EmailForm = () => {
  const { user, setUser } = useUser(); // Assuming `setUser` updates user context
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
  

    const email = e.target.email.value.trim();
    // const confirmEmail = e.target.confirmEmail.value.trim();
    
    // if (email !== confirmEmail) {
    //   setError('Emails do not match. Please try again.');
    //   return;
    // }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/player/updateEmail`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setUser({ ...user, email }); // Update email in user context
      } else {
        setError(data.error || 'Failed to update email');
      }
    } catch (err) {
      console.error('Error updating email:', err);
      setError('Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center space-x-4">
        <div className="flex-grow">
          <label htmlFor="email" className="text-sm font-medium text-gray-700 block mb-1">
            Email
          </label>
          <Input
            type="email"
            id="email"
            name="email"
            placeholder="Enter your new email"
            required
            className="max-w-xs"
          />
        </div>
        {/* <div className="flex-grow">
          <label htmlFor="email" className="text-sm font-medium text-gray-700 block mb-1">
            Email
          </label>
          <Input
            type="email"
            id="confirmEmail"
            name="confirmEmail"
            placeholder="Enter your new email"
            required
            className="max-w-xs"
          />
        </div> */}
        {/* onChange={(e) => setConfirmEmail(e.target.value.trim())} */}
        <Button type="submit" className="mt-6" disabled={loading}>
          {loading ? 'Saving...' : 'Save'}
        </Button>
      </div>
      {message && <p className="text-green-500">{message}</p>}
      {error && <p className="text-red-500">{error}</p>}
    </form>
  );
};

export default EmailForm;
