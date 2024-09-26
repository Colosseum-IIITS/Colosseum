async function handleSearch(event) {
    event.preventDefault(); // Prevent the form from submitting

    const searchInput = document.getElementById('search-input').value.trim(); // Get the input value

    // Check if input is empty or just whitespace
    if (!searchInput) {
        alert("Please enter a search term.");
        return;
    }

    // Reset results visibility
    document.getElementById('tournament-results').style.display = 'none';
    document.getElementById('team-results').style.display = 'none';
   

    // Disable the search button to prevent multiple submissions
    const searchButton = event.target.querySelector('button[type="submit"]');
    searchButton.disabled = true;

    try {
        // Determine the type of search based on the first character
        if (searchInput.startsWith('?')) {
            const searchTerm = searchInput.slice(1); // Remove '?' for tournament search
            await searchTournaments(searchTerm);
        } else if (searchInput.startsWith('>')) {
            const searchTerm = searchInput.slice(1); // Remove '>' for team search
            await searchTeams(searchTerm);
        } else {
            alert("Invalid search format. Use '?' for tournaments and '>' for teams.");
        }
    } catch (error) {
        console.error('Error during search:', error);
        alert('An error occurred while searching. Please try again.');
    } finally {
        // Re-enable the search button after operations complete
        searchButton.disabled = false;
    }
}

async function searchTournaments(searchTerm) {
    try {
        const response = await fetch(`/api/player/searchTournaments?searchTerm=${encodeURIComponent(searchTerm)}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}` // Ensure token is valid
            }
        });

        if (!response.ok) {
            const message = await response.json();
            throw new Error(`HTTP error! status: ${response.status}, message: ${message.message}`);
        }

        const result = await response.json();
        
        // Debugging: Log the result to check its structure
        console.log('Search Tournaments Result:', result);

        // Directly display the result as it's already filtered by the backend
        displayTournamentResults(result);
    } catch (error) {
        console.error('Error searching for tournaments:', error);
        document.getElementById('tournament-results').innerText = 'An error occurred while searching for tournaments.';
    }
}


function displayTournamentResults(tournaments) {
    const resultsContainer = document.getElementById('tournament-results');
    resultsContainer.style.display = 'block';
    resultsContainer.innerHTML = '';

    // Defensive coding to handle undefined or null values
    if (!Array.isArray(tournaments) || tournaments.length === 0) {
        resultsContainer.innerText = 'No tournaments found.';
        return;
    }

    tournaments.forEach(tournament => {
        const tournamentDiv = document.createElement('div');
        tournamentDiv.classList.add('tournament-item');
        tournamentDiv.innerHTML = `
            <h3>${tournament.name}</h3>
            <button onclick="joinTournament('${tournament._id}')">Join Tournament</button>
        `;
        resultsContainer.appendChild(tournamentDiv);
    });
}


async function searchTeams(searchTerm) {
    try {
        const response = await fetch(`/api/player/searchTeam?searchTerm=${encodeURIComponent(searchTerm)}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}` // Ensure token is valid
            }
        });

        if (!response.ok) {
            const message = await response.json();
            throw new Error(`HTTP error! status: ${response.status}, message: ${message.message}`);
        }

        const result = await response.json();
        displayTeamResults(result.teams);
    } catch (error) {
        console.error('Error searching for teams:', error);
        document.getElementById('team-results').innerText = 'An error occurred while searching for teams.';
    }
}

function displayTeamResults(teams) {
    const resultsContainer = document.getElementById('team-results');
    resultsContainer.style.display = 'block';
    resultsContainer.innerHTML = '';

    if (teams.length === 0) {
        resultsContainer.innerText = 'No teams found.';
        return;
    }

    teams.forEach(team => {
        const teamDiv = document.createElement('div');
        teamDiv.classList.add('team-item');
        teamDiv.innerHTML = `
            <h3>${team.name}</h3>
            <button onclick="joinTeam('${team._id}')">Join Team</button>
        `;
        resultsContainer.appendChild(teamDiv);
    });
}

async function joinTournament(tournamentId) {
    try {
        const response = await fetch('/api/player/joinTournament', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ tournamentId })
        });

        const message = await response.json();
        alert(message.message); // Display success or error message
    } catch (error) {
        console.error('Error joining tournament:', error);
        alert('An error occurred while trying to join the tournament.');
    }
}

async function joinTeam(teamId) {
    try {
        const response = await fetch('/api/player/joinTeam', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ teamId })
        });

        const message = await response.json();
        alert(message.message); // Display success or error message
    } catch (error) {
        console.error('Error joining team:', error);
        alert('An error occurred while trying to join the team.');
    }
}


// Function to fetch and display enrolled teams
async function fetchEnrolledTeams() {
    try {
        const response = await fetch('/api/player/getEnrolledTeams', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}` // Use the token for authentication
            }
        });

        if (!response.ok) {
            const message = await response.json();
            throw new Error(`HTTP error! status: ${response.status}, message: ${message.message}`);
        }

        const result = await response.json();
        displayEnrolledTeams(result.teams);
    } catch (error) {
        console.error('Error fetching enrolled teams:', error);
    }
}

function displayEnrolledTeams(teams) {
    const resultsContainer = document.getElementById('loaded-team-data'); // Make sure this ID matches
    resultsContainer.style.display = 'block';
    resultsContainer.innerHTML = ''; // Clear previous results

    if (teams.length === 0) {
        resultsContainer.innerText = 'You are not enrolled in any teams.';
        return;
    }

    teams.forEach(team => {
        const teamDiv = document.createElement('div');
        teamDiv.classList.add('team-item');

        // Render as 'Joined' instead of a button for already enrolled teams
        teamDiv.innerHTML = `
            <h3>${team.name}</h3>
            <button disabled>Joined</button> <!-- Disable the button for already joined teams -->
        `;
        
        resultsContainer.appendChild(teamDiv);
    });
}

async function fetchEnrolledTournaments() {
    try {
        const response = await fetch('/api/player/getEnrolledTournaments', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            const message = await response.json();
            throw new Error(`HTTP error! status: ${response.status}, message: ${message.message}`);
        }

        const result = await response.json();
        console.log('Fetched Tournaments:', result); // Log the result to inspect
        displayEnrolledTournaments(result.tournaments, result.message);
    } catch (error) {
        console.error('Error fetching enrolled tournaments:', error);
    }
}

function displayEnrolledTournaments(tournaments, message) {
    const resultsContainer = document.getElementById('loaded-tournament-data');
    resultsContainer.style.display = 'block';
    resultsContainer.innerHTML = '';

    // Display the message about enrollment
    const messageDiv = document.createElement('div');
    messageDiv.innerText = message;
    resultsContainer.appendChild(messageDiv);

    if (tournaments.length === 0) {
        resultsContainer.innerHTML += '<p>No enrolled tournaments found.</p>';
        return; // No need to display anything further
    }

    // Retrieve the current player ID
    const currentPlayerId = localStorage.getItem('playerId'); // Adjust as necessary

    tournaments.forEach(tournament => {
        const tournamentDiv = document.createElement('div');
        tournamentDiv.classList.add('tournament-item');


        tournamentDiv.innerHTML = `
            <h3>${tournament.tournamentName}</h3>
           
            <button disabled>Joined</button>
        `;
        
        resultsContainer.appendChild(tournamentDiv);
    });
}



window.onload = () => {
    fetchEnrolledTeams();
    fetchEnrolledTournaments();
    fetchFollowedOrganisers(); // Call the function to fetch tournaments
};

async function handleOrganizerSearch(event) {
    event.preventDefault(); // Prevent the form from submitting

    const searchInput = document.getElementById('organizer-search-input').value.trim(); // Get the input value

    // Check if input is empty or just whitespace
    if (!searchInput) {
        alert("Please enter a search term.");
        return;
    }

    // Reset results visibility
    document.getElementById('organization-results').style.display = 'none';

    // Disable the search button to prevent multiple submissions
    const searchButton = event.target.querySelector('button[type="submit"]');
    searchButton.disabled = true;

    try {
        // Check if the input starts with ':' for organizer search
        if (searchInput.startsWith(':')) {
            const searchTerm = searchInput.slice(1); // Remove ':' for organizer search
            await searchOrganisers(searchTerm); // Call the function to search for organizers
        } else {
            alert("Invalid search format. Use ':' for searching organizations.");
        }
    } catch (error) {
        console.error('Error during organizer search:', error);
        alert('An error occurred while searching. Please try again.');
    } finally {
        // Re-enable the search button after operations complete
        searchButton.disabled = false;
    }
}

// Example function to search for organizers (you might already have this defined)
async function searchOrganisers(searchTerm) {
    try {
        const response = await fetch(`/api/player/searchOrganisers?searchTerm=${encodeURIComponent(searchTerm)}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}` // Ensure token is valid
            }
        });

        if (!response.ok) {
            const message = await response.json();
            throw new Error(`HTTP error! status: ${response.status}, message: ${message.message}`);
        }

        const result = await response.json();
        console.log('Search Organisers Result:', result);

        // Check if the result is an array and pass it to the display function
        const organisers = Array.isArray(result.organiser) ? result.organiser : [result.organiser];
        displayOrganiserResults(organisers);
    } catch (error) {
        console.error('Error searching for organisers:', error);
        const resultsContainer = document.getElementById('organization-results');
        resultsContainer.style.display = 'block'; // Ensure the container is visible
        resultsContainer.innerText = 'An error occurred while searching for organisers.';
    }
}

// Function to display organizer search results (if you haven't defined it yet)
function displayOrganiserResults(organisers) {
    const resultsContainer = document.getElementById('organization-results');
    resultsContainer.innerHTML = ''; // Clear previous results

    // Show the results container
    if (organisers.length > 0) {
        resultsContainer.style.display = 'block'; // Make it visible
    } else {
        resultsContainer.style.display = 'none'; // Hide if no results
        resultsContainer.innerText = 'No organisers found.'; // Provide feedback if no results
        return;
    }

    // Defensive coding to handle undefined or null values
    if (!Array.isArray(organisers)) {
        console.warn('Organisers data is not an array:', organisers);
        return;
    }

    organisers.forEach(organiser => {
        const organiserDiv = document.createElement('div');
        organiserDiv.classList.add('organiser-item');
        organiserDiv.innerHTML = `
            <h3>${organiser.username}</h3>
            <button onclick="viewOrganiser('${organiser._id}')">View Organiser</button>
        `;
        resultsContainer.appendChild(organiserDiv);
    });
}

function displayOrganiserResults(organisers) {
    const resultsContainer = document.getElementById('organization-results');
    resultsContainer.innerHTML = ''; // Clear previous results

    // Show the results container
    if (organisers.length > 0) {
        resultsContainer.style.display = 'block'; // Make it visible
    } else {
        resultsContainer.style.display = 'none'; // Hide if no results
        resultsContainer.innerText = 'No organisers found.'; // Provide feedback if no results
        return;
    }

    // Defensive coding to handle undefined or null values
    if (!Array.isArray(organisers)) {
        console.warn('Organisers data is not an array:', organisers);
        return;
    }

    organisers.forEach(organiser => {
        const organiserDiv = document.createElement('div');
        organiserDiv.classList.add('organiser-item');
        organiserDiv.innerHTML = `
            <h3>${organiser.username}</h3>
            <button onclick="followOrganiser('${organiser._id}')">Follow Organiser</button>
        `;
        resultsContainer.appendChild(organiserDiv);
    });
}

async function followOrganiser(organiserId) {
    try {
        const response = await fetch('/api/player/followOrganiser', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}` // Ensure token is valid
            },
            body: JSON.stringify({ organiserId })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Failed to follow organiser');
        }

        alert(result.message);
        // Optionally, you can refresh the followed organisers list here

    } catch (error) {
        console.error('Error following organiser:', error);
        alert('An error occurred while trying to follow the organiser. Please try again.');
    }
}
async function fetchFollowedOrganisers() {
    try {
        const response = await fetch('/api/player/myOrganisers', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}` // Ensure the token is valid
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch followed organisers');
        }

        const organisers = await response.json();
        displayFollowedOrganisers(organisers); // Call the display function

    } catch (error) {
        console.error('Error fetching followed organisers:', error);
        alert('An error occurred while fetching followed organisers.');
    }
}

function displayFollowedOrganisers(organisers) {
    const followedContainer = document.getElementById('followed-organisers'); // Ensure you have this container in your HTML
    followedContainer.innerHTML = ''; // Clear previous results

    // Check if there are any organisers followed
    if (organisers.length > 0) {
        organisers.forEach(organiser => {
            const organiserDiv = document.createElement('div');
            organiserDiv.classList.add('organiser-item');
            organiserDiv.innerHTML = `
                <h3>${organiser.username}</h3>
                <h4>Tournaments:</h4>
                <ul>
                    ${organiser.tournaments.map(tournament => `<li>${tournament.name}</li>`).join('')}
                </ul>
            `;
            followedContainer.appendChild(organiserDiv);
        });
    } else {
        followedContainer.innerHTML = '<p>No followed organisers found.</p>'; // Message if none are found
    }
}
