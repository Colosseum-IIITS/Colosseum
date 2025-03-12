"use client"
import { useEffect } from 'react'
import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TableCell, TableRow } from "@/components/ui/table"
import { useBanContext } from '@/context/BanContext'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useToast } from '@/hooks/use-toast'
import { useAdminDashboard } from '../context/AdminDashboardContext'
import ScrollableTable from './ScrollableTable'

export default function OrganizerManagement() {
  const [searchQuery, setSearchQuery] = useState('')
  const [organizers, setOrganizers] = useState([])
  const [loading, setLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [banReason, setBanReason] = useState('')
  const [selectedOrganizer, setSelectedOrganizer] = useState(null)
  const { dashboardData, setDashboardData } = useAdminDashboard()
  const { toast } = useToast()



  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/organiser/search?username=${encodeURIComponent(searchQuery)}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch organisers");
      }
      const data = await response.json();
      
      setOrganizers(data.organisationResults);
  
      // Store organizers in localStorage
      localStorage.setItem("organizers", JSON.stringify(data.organisationResults));
    } catch (error) {
      console.error("Error fetching organisers:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch organisers.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedOrganizers= localStorage.getItem("organizers");
    if (savedOrganizers) {
      try {
        setOrganizers(JSON.parse(savedOrganizers));
      } catch (error) {
        console.error("Error parsing players from localStorage:", error);
        localStorage.removeItem("organizers"); // Clear corrupted data
      }
    }
  }, []);
  
 const { triggerBanHistoryRefetch } = useBanContext();
 const handleToggleBan = async () => {
  if (!selectedOrganizer) return;

  const action = selectedOrganizer.banned ? 'unban' : 'ban';
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/${action}/organiser/${selectedOrganizer._id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason: banReason }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to ${action} organiser`);
    }

    // Trigger re-fetch of the ban history
    triggerBanHistoryRefetch();

    setOrganizers(prevOrganizers =>
      prevOrganizers.map(organizer =>
        organizer._id === selectedOrganizer._id ? { ...organizer, banned: !organizer.banned } : organizer
      )
    );

    toast({
      title: "Success",
      description: `Organizer ${action === 'ban' ? 'banned' : 'unbanned'} successfully.`,
    });
    setIsDialogOpen(false);
  } catch (error) {
    console.error(`Error trying to ${action} organiser:`, error);
    toast({
      variant: "destructive",
      title: "Error",
      description: `Failed to ${action} organiser: ${error.message}`,
    });
  }
};

  const openDialog = (organizer) => {
    setSelectedOrganizer(organizer)
    setBanReason('')
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Organizer Management</h2>
      <div className="flex items-center space-x-2">
        <Input
          placeholder="Search organizers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={handleSearch} disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </Button>
      </div>
      <ScrollableTable headers={["Username", "Email", "Status", "Action"]}>
        {organizers.length > 0 ? (
          organizers.map((organizer) => (
            <TableRow key={organizer._id}>
              <TableCell>{organizer.username}</TableCell>
              <TableCell>{organizer.email}</TableCell>
              <TableCell>{organizer.banned ? 'Banned' : 'Active'}</TableCell>
              <TableCell>
                <Button
                  onClick={() => openDialog(organizer)}
                  variant={organizer.banned ? "destructive" : "default"}
                >
                  {organizer.banned ? 'Unban' : 'Ban'}
                </Button>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={4} className="text-center">
              No organizers found.
            </TableCell>
          </TableRow>
        )}
      </ScrollableTable>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedOrganizer?.banned ? 'Unban' : 'Ban'} Organizer</DialogTitle>
            <DialogDescription>
              {selectedOrganizer?.banned
                ? 'Are you sure you want to unban this organizer?'
                : 'Please provide a reason for banning this organizer.'}
            </DialogDescription>
          </DialogHeader>
          {!selectedOrganizer?.banned && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="reason" className="text-right">
                  Reason
                </Label>
                <Input
                  id="reason"
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  className="col-span-3"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleToggleBan} disabled={!selectedOrganizer?.banned && !banReason.trim()}>
              {selectedOrganizer?.banned ? 'Unban' : 'Ban'} Organizer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

