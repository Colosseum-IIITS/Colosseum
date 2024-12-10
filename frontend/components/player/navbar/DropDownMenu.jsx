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
import ReportFormDialog from '@/components/player/Report/ReportForm'; // Correct import
import { useRouter } from 'next/navigation'; // For navigation (Logout redirection)

const DropdownWithComponents = () => {
  const router = useRouter();
  const [isReportOpen, setIsReportOpen] = useState(false); // State to control dialog visibility

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem('user_jwt');
    router.push('/auth?role=player');
  };

  // Handle Settings navigation
  const handleSettings = () => {
    router.push('/player/settings');
  };

  // Handle Profile navigation
  const handleProfile = () => {
    router.push('/player/profile'); // Assuming you have a profile page
  };

  // Handle Report Team click
  const handleReportClick = () => {
    setIsReportOpen(true);
  };

  // Handle Dialog Close
  const handleReportClose = () => {
    setIsReportOpen(false);
  };

  return (
    <>
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

          {/* Profile Button */}
          <DropdownMenuItem onSelect={handleProfile}>
            Profile
          </DropdownMenuItem>

          {/* Settings Button */}
          <DropdownMenuItem onSelect={handleSettings}>
            Settings
          </DropdownMenuItem>

          {/* Report Team Button */}
          <DropdownMenuItem onSelect={handleReportClick} className="bg-blue-600 text-white">
            Report
          </DropdownMenuItem>

          {/* Logout Button */}
          <DropdownMenuItem onSelect={handleLogout} className="bg-red-600 text-white">
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Report Form Dialog */}
      <ReportFormDialog open={isReportOpen} onOpenChange={setIsReportOpen} />
    </>
  );
};

export default DropdownWithComponents;
