function preprocessSearchInput() {
    const searchInput = document.getElementById('search-input');
    const inputValue = searchInput.value.trim(); // Get the input value
    
    // Check if input is empty
    if (!inputValue) {
        alert("Please enter a search term.");
        return false; // Prevent form submission
    }

    // Determine the type of search based on the first character
    if (inputValue.startsWith('?')) {
        // Remove '?' for tournament search
        searchInput.value = inputValue.slice(1); // Set the cleaned value back to input
        document.querySelector('.search-form').action = '/api/player/searchTournaments'; // Set action for tournament search
    } else if (inputValue.startsWith('>')) {
        // Remove '>' for team search
        searchInput.value = inputValue.slice(1); // Set the cleaned value back to input
        document.querySelector('.search-form').action = '/api/player/teamName'; // Set action for team search
    } else if (inputValue.startsWith(':')) {
        // Remove '>' for team search
        searchInput.value = inputValue.slice(1); // Set the cleaned value back to input
        document.querySelector('.search-form').action = '/api/player/searchOrganisers'; // Set action for team search
    } 
    else {
        alert("Invalid search format. Use '?' for tournaments and '>' for teams and ':' for organisers");
        return false; // Prevent form submission
    }

    return true; // Allow form submission
}


