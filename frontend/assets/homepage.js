async function handleTournamentSearch(event) {
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

        const resultsDiv = document.getElementById('searchResults');
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

document.addEventListener('DOMContentLoaded', () => {
    // Check if a following organizer is stored in localStorage and display it
    const followedOrganizer = localStorage.getItem('followedOrganizer');
    if (followedOrganizer) {
        displayFollowedOrganizer(followedOrganizer);
    }
});

function handleOrganizerSearch(event) {
    event.preventDefault(); // Prevent form submission refresh
    const searchInput = document.getElementById('organizer-search-input').value.trim();

    // Reset the search results div if no search input
    const resultsDiv = document.getElementById('search-results');
    if (!searchInput.startsWith('/')) {
        alert('Please start your search with "/" to search organizers.');
        resultsDiv.style.display = 'none'; // Hide the search results if input is invalid
        return;
    }

    const searchTerm = searchInput.slice(1).trim(); // Remove '/' and get the search term

    try {
        const token = localStorage.getItem('token'); // Get token from localStorage

        fetch(`/api/player/searchOrganisers?searchTerm=${encodeURIComponent(searchTerm)}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (response.status === 204) {
                displayOrganizerResults([]); // No results, empty array
                return;
            }
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json(); // Parse response JSON
        })
        .then(data => {
            console.log('Data received from server:', data); // Debug log
            displayOrganizerResults(data); // Call function to display results
        })
        .catch(error => {
            console.error('Error fetching organizers:', error);
            alert('Error fetching organizers. Please try again.');
        });

    } catch (error) {
        console.error('Error:', error);
        alert('Error processing the request.');
    }
}

function displayOrganizerResults(data) {
    const resultsDiv = document.getElementById('search-results');
    resultsDiv.innerHTML = ''; // Clear previous results

    // Show the results div when there's a search
    resultsDiv.style.display = 'block'; 

    // Check if data.organiser exists and is an object
    if (data.organiser) {
        const organizer = data.organiser; // Extract organiser object

        // Create a div to display organizer details
        const organizerDiv = document.createElement('div');
        organizerDiv.textContent = `Organizer: ${organizer.username} (ID: ${organizer._id})`;

        // Create the Follow button
        const followButton = document.createElement('button');
        followButton.textContent = 'Follow Organizer';
        followButton.addEventListener('click', () => followOrganizer(organizer));

        organizerDiv.appendChild(followButton);
        resultsDiv.appendChild(organizerDiv);
    } else {
        // No organizer found, display a message
        const noResultsDiv = document.createElement('div');
        noResultsDiv.textContent = 'No organizers found.';
        resultsDiv.appendChild(noResultsDiv);
    }
}

function followOrganizer(organizer) {
    const token = localStorage.getItem('token'); // Assuming you're using JWT for authentication

    fetch('/api/player/followOrganiser', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ organiserId: organizer._id })
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(data => {
                throw new Error(data.message || 'Error following organiser');
            });
        }
        return response.json();
    })
    .then(data => {
        console.log('Followed successfully:', data); // Debug log
        localStorage.setItem('followedOrganizer', organizer.username); // Store in localStorage
        displayFollowedOrganizer(organizer.username); // Update UI
    })
    .catch(error => {
        console.error('Error following organiser:', error);
        alert(error.message || 'Error following organiser. Please try again.');
    });
}

function displayTournamentResults(data) {
    const resultsDiv = document.getElementById('searchResults');
    resultsDiv.innerHTML = '';

    if (data.length > 0) {
        data.forEach(tournament => {
            const tournamentDiv = document.createElement('div');
            tournamentDiv.textContent = `Tournament: ${tournament.name} (ID: ${tournament.tid})`;
            resultsDiv.appendChild(tournamentDiv);
        });
    } else {
        resultsDiv.textContent = 'No tournaments found';
    }
}

