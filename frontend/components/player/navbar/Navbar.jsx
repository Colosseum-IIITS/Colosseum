'use client';

import { useState, useEffect } from 'react';
import SearchBar from './SearchBar'; // Import the SearchBar component
import DropdownWithComponents from './DropDownMenu';
import NotificationBox from '../notifications/NotificationBox';

const Navbar = () => {
  const [username, setUsername] = useState('');  // State to store the username
  const [loading, setLoading] = useState(true);  // State to track loading status

  useEffect(() => {
    // Fetch the username from the API when the component mounts
    const fetchUsername = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/player/getUserName', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`, // Assuming JWT token is stored in localStorage
          },
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setUsername(data.username);  // Set the username state
          setLoading(false);  // Set loading to false once the data is fetched
        } else {
          console.error('Error fetching username:', response.statusText);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error:', error);
        setLoading(false);
      }
    };

    fetchUsername();
  }, []);

  return (
    <nav className="bg-gray-900 p-4 shadow-md mb-6 w-full border-b border-gray-700 rounded-xl">
      <div className="flex justify-between items-center w-full">
        <div className="text-white text-2xl font-bold">
          {/* Display the username or fallback to a default text */}
          {loading ? 'Loading...' : username ? username : 'My Tournament App'}
        </div>
        
        {/* Align the SearchBar and Dropdown to the right */}
        <div className="flex items-center space-x-4 ml-auto">
          <SearchBar />
          <NotificationBox />
          <DropdownWithComponents />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
