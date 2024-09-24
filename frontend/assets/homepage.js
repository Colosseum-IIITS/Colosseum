async function handleSearch(event) {
    event.preventDefault();
    const searchInput = document.getElementById('search-input').value.trim();

    if (!searchInput.startsWith('>')) {
        alert('Please start your search with ">" to search tournaments.');
        return;
    }

    const searchTerm = searchInput.slice(1).trim(); 

    try {
        // Retrieve the token from localStorage (or wherever it's stored)
        const token = localStorage.getItem('token'); 

        const response = await fetch(`/api/player/searchTournaments?searchTerm=${encodeURIComponent(searchTerm)}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log('Data received from backend:', data);

        const resultsDiv = document.getElementById('search-results');
        resultsDiv.innerHTML = '';

        if (data.length > 0) {
            data.forEach(tournament => {
                const tournamentDiv = document.createElement('div');
                tournamentDiv.textContent = `Tournament: ${tournament.name} (ID: ${tournament.tid})`;
                resultsDiv.appendChild(tournamentDiv);
            });
        } else {
            // If no tournaments are found, show this message
            resultsDiv.textContent = 'No tournaments found';
        }

    } catch (error) {
        console.error('Error fetching tournaments:', error);
        alert('Error fetching tournaments. Please try again.');
    }
}
