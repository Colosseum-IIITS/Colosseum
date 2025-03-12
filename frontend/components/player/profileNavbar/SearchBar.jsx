'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button'; // ShadCN Button component
import PlayerResult from './PlayerResult'; // Component to render player results
import TeamResult from './TeamResult'; // Component to render team results
import { Input } from "@/components/ui/input";

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]); // Unified results array
  const [searchType, setSearchType] = useState(''); // 'player' or 'team'
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false); // Control dialog open state
  const [message, setMessage] = useState(''); // State for error/success messages

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!searchTerm.trim()) {
      setMessage("Please enter a search term.");
      return;
    }
  
    const initialChar = searchTerm.trim().charAt(0);
    let actionUrl = '';
    let updatedSearchTerm = searchTerm.trim();
    let newSearchType = '';
  
    if (initialChar === '&') {
      actionUrl = '/api/player/searchPlayer';
      updatedSearchTerm = updatedSearchTerm.slice(1).trim();
      newSearchType = 'player';
    } else if (initialChar === '>') {
      actionUrl = '/api/team/search';
      updatedSearchTerm = updatedSearchTerm.slice(1).trim();
      newSearchType = 'team';
    } else {
      setMessage('Invalid search format. Use "&" for player and ">" for team.');
      return;
    }
  
    if (!updatedSearchTerm) {
      setMessage('Please provide a term to search after the symbol.');
      return;
    }
  
    setLoading(true);
    setResults([]);
    setIsOpen(false);
    setMessage('');
    setSearchType(newSearchType);
  
    try {
      const token = localStorage.getItem('token');
  
      if (!token) {
        throw new Error("No authentication token found. Please log in.");
      }
  
      const url = `${baseUrl}${actionUrl}?searchTerm=${encodeURIComponent(updatedSearchTerm)}`;
      console.log("🔍 Fetching search results from:", url);
  
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
  
      if (!response) {
        throw new Error("No response received from the server.");
      }
  
      console.log("📡 API Response Status:", response.status);
  
      if (!response.ok) {
        throw new Error(`Failed to fetch. Status: ${response.status} - ${response.statusText}`);
      }
  
      const data = await response.json();
      console.log("✅ Search Results:", data);
  
      if (newSearchType === 'player') {
        setResults(data.results || []);
      } else if (newSearchType === 'team') {
        setResults(data.teams || []);
      }
  
      if ((newSearchType === 'player' && (data.results || []).length > 0) ||
          (newSearchType === 'team' && (data.teams || []).length > 0)) {
        setIsOpen(true);
      } else {
        setMessage(`No ${newSearchType} found for "${updatedSearchTerm}".`);
      }
  
    } catch (error) {
      console.error("🚨 Error fetching search results:", error);
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="relative">
      {/* Display Message */}
      {message && (
        <div className={`mb-4 p-3 rounded-lg ${message.startsWith('No') ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-center space-x-4">
        <Input
          type="text"
          id="search-input"
          name="searchTerm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Use '&' for player or '>' for team"
          required
          aria-label="Search players and teams"
          className="p-3 w-80 border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ease-in-out"
        />
        <Button type="submit" disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </Button>
      </form>

      {/* Dialog for displaying search results */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Search Results</DialogTitle>
            <DialogDescription>
              Results for "{searchTerm.trim()}"
            </DialogDescription>
          </DialogHeader>

          {/* Player Results */}
          {searchType === 'player' && results.length > 0 && (
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-4">Players Found</h2>
              {results.map((player) => (
                <PlayerResult key={player._id} player={player} />
              ))}
            </div>
          )}

          {/* Team Results */}
          {searchType === 'team' && results.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Teams Found</h2>
              {results.map((team) => (
                <TeamResult key={team._id} team={team} />
              ))}
            </div>
          )}

          {!results.length && (
            <p className="text-gray-500">No results found for "{searchTerm.trim()}".</p>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SearchBar;
