import React, { useState, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import axios from "axios";
import { toast } from "react-toastify";
import Image from "next/image";

const ProfilePicture = () => {
  const { user, setUser } = useUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfilePicture = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No authentication token found.");
        toast.error("Authentication token is missing.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/player/profilepicture`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data && response.data.profilePhoto && response.data.profilePhoto.data) {
          const base64Data = response.data.profilePhoto.data;
          setUser((prevUser) => ({
            ...prevUser,
            image: { data: base64Data, contentType: response.data.profilePhoto.contentType },
          }));
        } else {
          toast.warn("No profile picture found.");
        }
      } catch (error) {
        console.error("Error fetching profile picture:", error.response?.data || error.message);
        toast.error(error.response?.data?.message || "Failed to fetch profile picture.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfilePicture();
  }, [setUser]);

  const getImageSrc = () => {
    if (user && user.image && user.image.data) {
      return `data: ${user.image.data}`;
    }
    return "/placeholder.svg"; // Default image if no profile photo
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative w-48 h-48 rounded-full overflow-hidden"> {/* Make the container rounded */}
        <Image
          src={getImageSrc()}
          alt="Profile Picture"
          width={192} 
          height={192} 
          className="object-cover w-full h-full"
          priority
        />
      </div>
    </div>
  );
};

export default ProfilePicture;
