const StatCard = ({ title, value }) => {
    return (
      <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-inner">
        <p className="text-xl font-semibold text-gray-800 dark:text-white">{title}</p>
        <p className="mt-2 text-2xl text-teal-600 dark:text-teal-400">{value || 'N/A'}</p>
      </div>
    );
  };
  
  export default StatCard;
  