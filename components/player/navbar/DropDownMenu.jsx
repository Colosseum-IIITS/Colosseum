'use client';

import { useState } from 'react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button'; // ShadCN Button component
import { Menu } from 'lucide-react'; // Correct import for the hamburger icon
import ReportForm from '@/components/player/Report/ReportForm'; // Import the ReportForm component
import { useRouter } from 'next/navigation'; // for navigation (Logout redirection)

const DropdownWithComponents = () => {
  const router = useRouter();

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem('user_jwt');
    router.push('/auth?role=player');
  };

  // Handle Settings navigation
  const handleSettings = () => {
    router.push('/settings');
  };

  // Handle Profile navigation (you can modify this to point to the profile page or modal)
  const handleProfile = () => {
    router.push('/profile'); // Assuming you have a profile page
  };

  return (
    <DropdownMenu>
      {/* Trigger the dropdown when the hamburger icon is clicked */}
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="p-2">
          <Menu size={32} /> {/* Hamburger icon */}
        </Button>
      </DropdownMenuTrigger>

      {/* Dropdown Content */}
      <DropdownMenuContent 
        align="start" 
        className="left-0 ml-0 p-4 space-y-4 w-55"
        style={{ transform: 'translateX(-50%)' }} // Move the dropdown to the left
>
        {/* Report Form */}
        <DropdownMenuItem>
          <ReportForm />
        </DropdownMenuItem>
        {/* Profile Button */}
        <DropdownMenuItem onClick={handleProfile}>
          Profile
        </DropdownMenuItem>

        {/* Settings Button */}
        <DropdownMenuItem onClick={handleSettings}>
          Settings
        </DropdownMenuItem>

        {/* Logout Button */}
        <DropdownMenuItem onClick={handleLogout}>
          Logout
        </DropdownMenuItem>

      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DropdownWithComponents;
