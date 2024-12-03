// TournamentResult.js
const TournamentResult = ({ tournament }) => {
  return (
    <div className="tournament-result p-4 border-2 border-gray-200 rounded-lg shadow-sm mb-4">
      <h3 className="text-xl font-bold">{tournament.name}</h3>
      <p><strong>Id:</strong> {tournament.tid}</p>
      <p><strong>Status:</strong> {tournament.status}</p>
      <p><strong>Description:</strong> {tournament.description}</p>
    </div>
  );
};

export default TournamentResult;
