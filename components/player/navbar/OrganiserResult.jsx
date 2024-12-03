// OrganiserResult.js
const OrganiserResult = ({ organiser }) => {
  return (
    <div className="organiser-result p-4 border-2 border-gray-200 rounded-lg shadow-sm mb-4">
      <h3 className="text-xl font-bold">{organiser.username}</h3>
      <p><strong>Email:</strong> {organiser.email}</p>
      <p><strong>Tournaments Organized:</strong></p>
      <ul>
        {organiser.tournaments.length > 0 ? (
          organiser.tournaments.map((tournament) => (
            <li key={tournament._id}>{tournament.name}</li>
          ))
        ) : (
          <li>No tournaments organized yet</li>
        )}
      </ul>
    </div>
  );
};

export default OrganiserResult;
  