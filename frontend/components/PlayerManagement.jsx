"use client"
import { useEffect } from "react";
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

export default function PlayerManagement() {
  const [searchQuery, setSearchQuery] = useState('')
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [banReason, setBanReason] = useState('')
  const [selectedPlayer, setSelectedPlayer] = useState(null)
  const { dashboardData, setDashboardData } = useAdminDashboard()
  const { toast } = useToast()
  const [page, setPage] = useState(1)
  const ITEMS_PER_PAGE = 10

  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/player/searchPlayer?` + 
        `searchTerm=${encodeURIComponent(searchQuery)}&page=${page}&limit=${ITEMS_PER_PAGE}`
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch players");
      }
      
      const data = await response.json();
      setPlayers(data.results);

      // Only store essential data fields
      const minimalPlayerData = data.results.map(player => ({
        _id: player._id,
        username: player.username,
        email: player.email,
        banned: player.banned
      }));

      // Store only current page data
      try {
        localStorage.setItem(`players_page_${page}`, JSON.stringify(minimalPlayerData));
      } catch (storageError) {
        console.warn('Storage quota exceeded, clearing old data');
        localStorage.clear(); // Clear all stored data if quota is exceeded
      }

    } catch (error) {
      console.error("Error fetching players:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch players."
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load cached data for current page if available
    const cachedData = localStorage.getItem(`players_page_${page}`);
    if (cachedData) {
      try {
        setPlayers(JSON.parse(cachedData));
      } catch (error) {
        console.error("Error parsing cached players:", error);
        localStorage.removeItem(`players_page_${page}`);
      }
    }
  }, [page]);

const { triggerBanHistoryRefetch } = useBanContext(); // Get the trigger function

const handleToggleBan = async () => {
  if (!selectedPlayer) return;

  const action = selectedPlayer.banned ? 'unban' : 'ban';
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/${action}/player/${selectedPlayer._id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason: banReason }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to ${action} player`);
    }

    // Trigger re-fetch of the ban history
    triggerBanHistoryRefetch();

    setPlayers(prevPlayers =>
      prevPlayers.map(player =>
        player._id === selectedPlayer._id ? { ...player, banned: !player.banned } : player
      )
    );

    toast({
      title: "Success",
      description: `Player ${action === 'ban' ? 'banned' : 'unbanned'} successfully.`,
    });
    setIsDialogOpen(false);
  } catch (error) {
    console.error(`Error trying to ${action} player:`, error);
    toast({
      variant: "destructive",
      title: "Error",
      description: `Failed to ${action} player: ${error.message}`,
    });
  }
};

  const openDialog = (player) => {
    setSelectedPlayer(player)
    setBanReason('')
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Player Management</h2>
      <div className="flex items-center space-x-2">
        <Input
          placeholder="Search players..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={handleSearch} disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </Button>
      </div>
      <ScrollableTable headers={["Username", "Email", "Status", "Action"]}>
        {players.length > 0 ? (
          players.map((player) => (
            <TableRow key={player._id}>
              <TableCell>{player.username}</TableCell>
              <TableCell>{player.email}</TableCell>
              <TableCell>{player.banned ? 'Banned' : 'Active'}</TableCell>
              <TableCell>
                <Button
                  onClick={() => openDialog(player)}
                  variant={player.banned ? "destructive" : "default"}
                >
                  {player.banned ? 'Unban' : 'Ban'}
                </Button>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={4} className="text-center">
              No players found.
            </TableCell>
          </TableRow>
        )}
      </ScrollableTable>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedPlayer?.banned ? 'Unban' : 'Ban'} Player</DialogTitle>
            <DialogDescription>
              {selectedPlayer?.banned
                ? 'Are you sure you want to unban this player?'
                : 'Please provide a reason for banning this player.'}
            </DialogDescription>
          </DialogHeader>
          {!selectedPlayer?.banned && (
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
            <Button onClick={handleToggleBan} disabled={!selectedPlayer?.banned && !banReason.trim()}>
              {selectedPlayer?.banned ? 'Unban' : 'Ban'} Player
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
