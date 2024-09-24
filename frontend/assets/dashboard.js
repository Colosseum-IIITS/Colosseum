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
async function fetchTournamentsWon() {
try {
const token = localStorage.getItem('token'); // or wherever you store the token

const response = await fetch('/api/player/tournamentsWon', {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // Pass the token if needed
    }
});

if (!response.ok) {
    throw new Error('Error fetching tournaments won');
}

const data = await response.json();
document.getElementById('tournaments-won').textContent = data.tournamentsWon;
} catch (error) {
console.error(error);
document.getElementById('tournaments-won').textContent = 'Error loading data';
}
}
