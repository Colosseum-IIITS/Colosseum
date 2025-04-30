import { useEffect, useState } from 'react';
import OrganiserItem from './OrganiserItem';

const OrganiserList = () => {
  const [followedOrganisers, setFollowedOrganisers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFollowedOrganisers = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch("http://localhost:5000/api/player/followedOrg", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch followed organisers");
        }

        const data = await response.json();
        setFollowedOrganisers(data.followedOrganisers); // ✅ Extract array from response
        setLoading(false); // ✅ End loading
      } catch (err) {
        console.error(err);
        setError(err.message || "Something went wrong");
        setLoading(false); // ✅ Also stop loading on error
      }
    };

    fetchFollowedOrganisers();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h3 className="text-2xl font-semibold mb-4">Followed Organisers</h3>
      {followedOrganisers.length === 0 ? (
        <p>You are not following any organisers yet.</p>
      ) : (
        <ul className="space-y-4">
          {followedOrganisers.map((organiser) => (
            <OrganiserItem key={organiser._id} organiser={organiser} />
          ))}
        </ul>
      )}
    </div>
  );
};

export default OrganiserList;
