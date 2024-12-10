import { useEffect, useState } from 'react';

const FollowedOrganisers = () => {
  const [followedOrganisers, setFollowedOrganisers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch followed organisers when the component mounts
  useEffect(() => {
    const fetchFollowedOrganisers = async () => {
      try {
        const res = await fetch('/api/player/followedOrganisers', {
          method: 'GET',
          credentials: 'include', // To send cookies if needed (e.g., JWT)
        });
        const data = await res.json();
        if (res.ok) {
          setFollowedOrganisers(data.followedOrganisers);
        } else {
          console.error("Failed to fetch followed organisers", data);
        }
      } catch (error) {
        console.error("Error fetching followed organisers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFollowedOrganisers();
  }, []);

  // Unfollow an organiser
  const unfollowOrganiser = async (organiserId) => {
    try {
      const res = await fetch('/api/player/unFollowOrganiser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ organiserId }),
        credentials: 'include',
      });
      if (res.ok) {
        // If unfollow was successful, remove the organiser from the state
        setFollowedOrganisers(prevOrganisers =>
          prevOrganisers.filter(organiser => organiser._id !== organiserId)
        );
      } else {
        console.error("Failed to unfollow organiser");
      }
    } catch (error) {
      console.error("Error unfollowing organiser:", error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="searchResults" id="searchOrg">
      <div className="headTitle" id="orgTitle">
        <h2>Followed Organisers</h2>
      </div>
      <div id="followed-organisers">
        {followedOrganisers.length > 0 ? (
          followedOrganisers.map((organiser) => (
            <div key={organiser._id} className="organiser-details">
              <div className="TName">
                <h3 className="OrgName">{organiser.username}</h3>
              </div>
              <div className="DescT">
                <p className="email">
                  <strong>Email:</strong> {organiser.email}
                </p>
                <p className="tournamentsOrg">
                  <strong>Tournaments Organized</strong>
                </p>
                <ul>
                  {organiser.tournaments && organiser.tournaments.length > 0 ? (
                    organiser.tournaments.map((tournament) => (
                      <p key={tournament._id} className="tournamentPara" style={{ color: 'white' }}>
                        Tournament Name: {tournament.name}
                      </p>
                    ))
                  ) : (
                    <p className="tournamentPara" style={{ color: 'white' }}>
                      No tournaments organized yet
                    </p>
                  )}
                </ul>
                <button
                  onClick={() => unfollowOrganiser(organiser._id)}
                  className="followButton"
                >
                  Unfollow
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>No followed organisers.</p>
        )}
      </div>
    </div>
  );
};

export default FollowedOrganisers;
