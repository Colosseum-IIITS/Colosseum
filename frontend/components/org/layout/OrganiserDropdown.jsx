'use client';

import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button'; // ShadCN Button component
import { Menu } from 'lucide-react'; // Hamburger icon
import { useRouter } from 'next/navigation'; // For navigation (Logout redirection)

const OrganiserDropdown = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false); // State to control dropdown visibility

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem('user_jwt');
    router.push('/auth?role=organiser');
  };

  // Handle Settings navigation
  const handleSettings = () => {
    router.push('/org/settings'); // Assuming you have a settings page for the organiser
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
        {/* Settings Button */}
        <DropdownMenuItem onSelect={handleSettings}>
          Settings
        </DropdownMenuItem>

        {/* Logout Button */}
        <DropdownMenuItem onSelect={handleLogout} className="bg-red-600 text-white">
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default OrganiserDropdown;
