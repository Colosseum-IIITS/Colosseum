'use client';

import { useState, useEffect } from 'react';
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'; // Assuming you're using ShadCN Sheet component

const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/tournament/notifications`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('user_jwt')}`,
            },
            credentials: 'include',
        });

        if (!response.ok) {
          console.error('Failed to fetch notifications', response);
          return;
        }

        const data = await response.json();
        console.log('Fetched notifications:', data);

        if (Array.isArray(data)) {
          setNotifications(data);
        } else {
          console.error('Notifications data is not an array:', data);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false); // Set loading to false after the data is fetched
      }
    };

    fetchNotifications();
  }, []);

  return (
    <div>
      <Sheet>
        {/* Trigger button to open the notifications */}
        <SheetTrigger asChild>
          <button className="p-2 bg-black text-white rounded-md hover:bg-gray-800 transition-all">
            Notifications
          </button>
        </SheetTrigger>

        {/* Notifications content inside the sheet */}
        <SheetContent side="right" className="w-96"> {/* Increased width */}
          <SheetHeader>
            <SheetTitle>Notifications</SheetTitle>
          </SheetHeader>

          <div className="p-6 space-y-4"> {/* Increased padding and space between notifications */}
            {loading ? (
              <p>Loading...</p>
            ) : notifications.length === 0 ? (
              <p>No notifications</p>
            ) : (
              notifications.map((notification, index) => (
                <div
                  key={index}
                  className={`p-5 border rounded-lg 
                    ${notification.read ? 'bg-gray-200 text-gray-600' : 'bg-blue-100 text-blue-800'} 
                    ${notification.read ? 'border-gray-300' : 'border-blue-300'} 
                    hover:${notification.read ? 'bg-gray-300' : 'bg-blue-200'} transition-all`}
                >
                  <p className="font-semibold text-lg">{notification.message}</p> {/* Increased font size */}
                  <p className="text-sm text-gray-500">{new Date(notification.date).toLocaleString()}</p> {/* Text size for date */}
                </div>
              ))
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default NotificationDropdown;
