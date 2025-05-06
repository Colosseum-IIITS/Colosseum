'use client';

import { useState } from 'react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button'; // ShadCN Button component
import TournamentResult from './TournamentResult'; // New component to render tournaments
import OrganiserResult from './OrganiserResult'; // New component to render organisers

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false); // Control dialog open state

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!searchTerm) {
      setMessage('Please enter a search term.');
      return;
    }

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
    let actionUrl = '';
    let updatedSearchTerm = searchTerm;

    if (updatedSearchTerm.startsWith('?')) {
      actionUrl = '/api/player/searchTournaments';
      updatedSearchTerm = updatedSearchTerm.slice(1);
    } else if (updatedSearchTerm.startsWith(':')) {
      actionUrl = '/api/player/searchOrganisers';
      updatedSearchTerm = updatedSearchTerm.slice(1);
    } else {
      setMessage('Invalid search format. Use "?" for tournaments and ":" for organisers.');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('user_jwt');
      console.log('Fetching from:', baseUrl + actionUrl + `?searchTerm=${updatedSearchTerm}`);
      const response = await fetch(baseUrl + actionUrl + `?searchTerm=${updatedSearchTerm}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        const result = await response.json();
        if (actionUrl === '/api/player/searchTournaments') {
          setSearchResults(result.results || []);
        } else {
          setSearchResults(result.organisationResults || []);
        }
        setMessage('');
        setIsOpen(true); // Open the dialog once results are fetched
      } else {
        const errorText = await response.text();
        setMessage(`Error: ${errorText}`);
      }
    } catch (error) {
      setMessage('Error fetching search results');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex items-center space-x-4 transform scale-90">
        <input
          type="text"
          id="search-input"
          name="searchTerm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)} // Submit on Enter key press
          placeholder="'?' for tournaments, ':' for organisers"
          required
          aria-label="Search tournaments and organisers"
          className="p-3 w-80 border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ease-in-out"
        />
      </form>

      {/* Dialog for displaying search results */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Search Results</DialogTitle>
            <DialogDescription>
              Results for "{searchTerm}"
            </DialogDescription>
          </DialogHeader>

          {/* Conditional Rendering: Display different components based on search type */}
          {searchResults.length > 0 ? (
            <div>
              {searchTerm.startsWith('?') ? (
                searchResults.map((tournament) => (
                  <TournamentResult key={tournament._id} tournament={tournament} />
                ))
              ) : (
                searchResults.map((organiser) => (
                  <OrganiserResult key={organiser._id} organiser={organiser} />
                ))
              )}
            </div>
          ) : (
            <p>No results found</p>
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
