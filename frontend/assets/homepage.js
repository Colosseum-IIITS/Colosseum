
    // Get URL parameters
       const urlParams = new URLSearchParams(window.location.search);
       const username = urlParams.get('username');
       const role = urlParams.get('role');
   
       // Display the username or other details
       if (username) {
           document.getElementById('welcome-message').textContent = `Welcome, ${username}!`;
       }
       if (role) {
           document.getElementById('role-message').textContent = `You are logged in as ${role}.`;
       }
   
   
async function handleSearch(event) {
   event.preventDefault(); // Prevent the default form submission
   const searchInput = document.getElementById('search-input').value.trim();

   if (!searchInput.startsWith('>')) {
       alert('Please start your search with ">" to search tournaments.');
       return;
   }

   const searchTerm = searchInput.slice(1).trim(); // Remove '>' and get the rest of the term

   try {
       const response = await fetch(`/searchTournaments?searchTerm=${encodeURIComponent(searchTerm)}`);

       if (!response.ok) {
           throw new Error('Network response was not ok');
       }

       const data = await response.json();
       console.log(data); // Check the response

       const resultsDiv = document.getElementById('search-results');
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

   } catch (error) {
       console.error('Error fetching tournaments:', error);
   }
}
