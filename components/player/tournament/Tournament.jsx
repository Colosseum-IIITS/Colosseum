'use client';

const Tournament = ({ tournament }) => {
  // Helper function to format date
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString();

  return (
    <div className="tournament-item p-6 border-2 border-gray-200 rounded-xl shadow-lg bg-white hover:shadow-xl transition-shadow duration-300">
      <div className="TName">
        <h4 className="text-2xl font-semibold text-gray-800">{tournament.name}</h4>
      </div>

      <div className="DescT mt-4">
        <p className="text-lg text-gray-700">
          <strong className="font-medium text-gray-900">Start Date:</strong> {formatDate(tournament.startDate)}
        </p>
        <p className="text-lg text-gray-700">
          <strong className="font-medium text-gray-900">Prize Pool:</strong> ${tournament.prizePool}
        </p>
      </div>
    </div>
  );
};

export default Tournament;