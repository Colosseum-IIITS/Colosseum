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

        // Assuming the API response contains the number of tournaments won in 'tournamentsWon' field
        const tournamentsWon = data.tournamentsWon || 0; // Default to 0 if no value is found
        
        // Update the DOM element with the fetched value
        document.getElementById('tournaments-Won').innerText = tournamentsWon;

    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
        document.getElementById('tournaments-Won').innerText = 'Error fetching data';
    }
}

// Call the function to fetch the data when the page loads
document.addEventListener('DOMContentLoaded', fetchTournamentsWon);

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
// Fetch and calculate win percentage
async function calculateWinPercentage() {
    const tournamentsWon = await fetchTournamentsWon();
    const tournamentsPlayed = await fetchTournamentsPlayed();

    let winPercentage = 0;
    let data = [0, 100]; // Default to 0 wins and 100 losses (i.e., no games played)

    if (tournamentsPlayed > 0) {
        winPercentage = ((tournamentsWon / tournamentsPlayed) * 100).toFixed(2); // Calculate percentage
        data = [winPercentage, 100 - winPercentage]; // Prepare data for chart
    }

    // Update the UI with the win percentage
    document.getElementById('winPercentageValue').textContent = `${winPercentage}%`; // Display win percentage

    // Draw the circular chart
    drawWinPercentageChart(data); // Pass the data array directly
}

function drawWinPercentageChart(data) {
    const ctx = document.getElementById('winPercentageChartCanvas').getContext('2d');
    
    // Clear any existing chart before rendering
    if (window.chart) {
        window.chart.destroy(); // Destroy previous chart instance
    }

    window.chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Wins', 'Losses'],
            datasets: [{
                label: 'Win Percentage',
                data: data, // Use the data passed from the calculate function
                backgroundColor: ['#36A2EB', '#FF6384'],
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            elements: {
                arc: {
                    borderWidth: 0,
                }
            },
            plugins: {
                legend: {
                    display: false // Hide legend if not needed
                },
                tooltip: {
                    callbacks: {
                        label: function(tooltipItem) {
                            return tooltipItem.label + ': ' + tooltipItem.raw.toFixed(2) + '%';
                        }
                    }
                }
            }
        }
    });
}

// Call the functions to fetch tournaments won, global rank, and tournaments played when the page loads
document.addEventListener('DOMContentLoaded', () => {
    fetchTournamentsWon(); // Fetch tournaments won
    fetchGlobalRank(); // Fetch global rank
    fetchTournamentsPlayed(); // Fetch tournaments played
    calculateWinPercentage(); 
    drawWinPercentageChart();
});