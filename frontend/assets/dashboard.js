const menuToggle = document.getElementById('menu-toggle');
const sidebar = document.querySelector('.sidebar');

// Toggle sidebar visibility on hamburger menu click
menuToggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
});

// Close sidebar and navigate when a menu item is clicked
const menuItems = document.querySelectorAll('.sidebar .menu-item');
menuItems.forEach(item => {
    item.addEventListener('click', (event) => {
        sidebar.classList.remove('open'); // Close the sidebar
        // Redirect to the link's href
        window.location.href = item.href; 
    });
});

// Fetch Tournaments Won
async function fetchTournamentsWon() {
    try {
        const response = await fetch('/api/player/tournamentsWon', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}` // Ensure token is passed
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        // Update the UI with the tournaments won count
        document.getElementById('tournaments-Won').textContent = data.tournamentsWon || 0; // Set to 0 if no tournaments won
    } catch (error) {
        console.error('Error fetching tournaments won:', error);
        document.getElementById('tournaments-Won').textContent = 0; // Fallback in case of error
    }
}


// Fetch Global Rank
async function fetchGlobalRank() {
    try {
        const response = await fetch('/api/player/ranking', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}` // Ensure token is passed
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        // Update the UI with the global rank
        document.getElementById('Global-rank').textContent = data.playerRanking || 0; // Set to 0 if no rank found
    } catch (error) {
        console.error('Error fetching global rank:', error);
        document.getElementById('Global-rank').textContent = 0; // Fallback in case of error
    }
}
// Fetch Tournaments Played
async function fetchTournamentsPlayed() {
    try {
        const response = await fetch('/api/player/tournamentsPlayed', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}` // Ensure token is passed
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        // Update the UI with the tournaments played count
        document.getElementById('Tournaments-played').textContent = data.tournamentsPlayed || 0; // Set to 0 if no tournaments played
    } catch (error) {
        console.error('Error fetching tournaments played:', error);
        document.getElementById('Tournaments-played').textContent = 0; // Fallback in case of error
    }
}
async function calculateWinPercentage() {
    const tournamentsWon = await fetchTournamentsWon();
    const tournamentsPlayed = await fetchTournamentsPlayed();

    let winPercentage = 0;
    if (tournamentsPlayed > 0) {
        winPercentage = ((tournamentsWon / tournamentsPlayed) * 100).toFixed(2); // Calculate percentage
    }

    // Update the UI with the win percentage
    document.getElementById('gamesPlayedChart').textContent = `${winPercentage}%`; // Display win percentage
}
// Call the functions to fetch tournaments won, global rank, and tournaments played when the page loads
document.addEventListener('DOMContentLoaded', () => {
    fetchTournamentsWon(); // Fetch tournaments won
    fetchGlobalRank(); // Fetch global rank
    fetchTournamentsPlayed(); // Fetch tournaments played
    calculateWinPercentage(); 
});

