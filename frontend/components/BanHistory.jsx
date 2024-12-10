"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import ScrollableTable from './ScrollableTable';
import { useBanContext } from '@/context/BanContext';

export default function BanHistory() {
  const [banHistory, setBanHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const { shouldRefetchBanHistory } = useBanContext(); // Get the flag from context

  // Fetch Ban History from the backend API
  const fetchBanHistory = async () => {
    try {
      const response = await fetch('http://localhost:5000/admin/banhistory');
      if (!response.ok) {
        throw new Error('Failed to fetch ban history');
      }
      const data = await response.json();

      if (Array.isArray(data.banHistory)) {
        setBanHistory(data.banHistory);
      } else {
        console.error("banHistory is not an array:", data.banHistory);
        setBanHistory([]);
      }
    } catch (error) {
      console.error('Error fetching ban history:', error);
      setBanHistory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanHistory();
  }, [shouldRefetchBanHistory]); // Re-fetch whenever the flag is set to true

  const handleRevertBan = async (banId, entityType, bannedEntityId) => {
    try {
      let apiUrl = '';
      if (entityType === 'Organiser') {
        apiUrl = `http://localhost:5000/admin/unban/organiser/${bannedEntityId}`;
      } else if (entityType === 'Player') {
        apiUrl = `http://localhost:5000/admin/unban/player/${bannedEntityId}`;
      }

      const response = await fetch(apiUrl, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`Failed to revert ban for ${entityType}`);
      }

      // Update the local state after successful unban
      setBanHistory(banHistory.map(record =>
        record._id === banId ? { ...record, active: false } : record
      ));
    } catch (error) {
      console.error(`Error reverting ban for ${entityType}:`, error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Ban History</h2>
      <ScrollableTable headers={["Username", "Type", "Reason", "Date", "Status", "Action"]}>
        {banHistory.map((record) => (
          <TableRow key={record._id}>
            <TableCell>{record.bannedEntity?.username || 'Unknown'}</TableCell>
            <TableCell>{record.entityType}</TableCell>
            <TableCell>{record.reason}</TableCell>
            <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
            <TableCell>{record.active ? 'Active' : 'Reverted'}</TableCell>
            <TableCell>
              {record.active && (
                <Button onClick={() => handleRevertBan(record._id, record.entityType, record.bannedEntity?._id)}>
                  Revert Ban
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </ScrollableTable>
    </div>
  );
}
