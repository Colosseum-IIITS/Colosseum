import { useState } from 'react';

const SearchProf = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchInput = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();

    // Check if the search term is empty
    if (!searchTerm.trim()) {
      alert('Please enter a search term.');
      return;
    }

    // Determine the type of search based on the first character
    let searchUrl = '';
    if (searchTerm.startsWith('-')) {
      searchUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/player/searchPlayer?searchTerm=${searchTerm.slice(1)}`;
    } else if (searchTerm.startsWith('>')) {
      // Updated to the correct route for teams
      searchUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/player/TeamName?searchTerm=${searchTerm.slice(1)}`;
    } else {
      alert("Invalid search format. Use '>' for teams and '-' for players");
      return;
    }

    try {
      // Fetch search results from the appropriate endpoint
      const response = await fetch(searchUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`, // Assuming JWT token is in localStorage
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Search Results:', data);
        // Process the search results (display them, etc.)
        // You can update the UI with results
      } else {
        console.error('Error fetching search results:', response.statusText);
        alert('No results found.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error searching. Please try again.');
    }
  };

  return (
    <form className="search-form" onSubmit={handleSearchSubmit}>
      <input
        type="text"
        value={searchTerm}
        onChange={handleSearchInput}
        id="search-input"
        name="searchTerm"
        placeholder="Use '>' for teams, '-' for player"
        required
        className="p-2 rounded-md"
      />
      <button type="submit" className="ml-2 p-2 bg-blue-500 text-white rounded-md">
        Search
      </button>
    </form>
  );
};

export default SearchProf;
