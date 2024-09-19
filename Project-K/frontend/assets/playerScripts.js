document.addEventListener('DOMContentLoaded', async function() {
    try {
      const response = await fetch('/api/tournaments');
      const tournaments = await response.json();
      
      const tournamentDiv = document.getElementById('tournaments-playing');
      tournaments.forEach(tournament => {
        const tournamentInfo = document.createElement('div');
        tournamentInfo.innerHTML = `
          <h3>${tournament.name}</h3>
          <p>Date: ${new Date(tournament.date).toLocaleDateString()}</p>
          <p>Points Table: ${JSON.stringify(tournament.pointsTable)}</p>
        `;
        tournamentDiv.appendChild(tournamentInfo);
      });
    } catch (error) {
      console.error('Error fetching tournaments:', error);
    }
  });
  