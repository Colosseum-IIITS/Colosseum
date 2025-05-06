import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useUser } from "@/context/UserContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import axios from "axios";
import { toast } from "react-toastify";

const ProfilePicture = () => {
  const { user, setUser } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true); // State for fetching
  const fileInputRef = useRef(null);

  // Fetch the profile picture on component mount
  useEffect(() => {
    const fetchProfilePicture = async () => {
      const token = localStorage.getItem("token");
      console.log("Fetched token:", token); // Log token to verify

      if (!token) {
        console.error("No authentication token found.");
        toast.error("Authentication token is missing.");
        setFetching(false);
        return;
      }

      try {
        console.log("Attempting to fetch profile picture...");
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/player/profilepicture`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Log the entire response to inspect it
        console.log("Profile picture response:", response.data);

        // Check if profilePhoto exists and contains base64 data
        if (response.data && response.data.profilePhoto && response.data.profilePhoto.data) {
          const base64Data = response.data.profilePhoto.data;
          // Set the base64 data as the user image
          setUser((prevUser) => ({
            ...prevUser,
            image: { data: base64Data, contentType: response.data.profilePhoto.contentType },
          }));
          console.log("Profile picture set successfully.");
        } else {
          console.warn("No profilePhoto found or profilePhoto.data is missing in the response.");
          toast.warn("No profile picture found.");
        }
      } catch (error) {
        console.error(
          "Error fetching profile picture:",
          error.response?.data || error.message
        );
        toast.error(
          error.response?.data?.message ||
            "Failed to fetch profile picture."
        );
      } finally {
        setFetching(false);
      }
    };

    fetchProfilePicture();
  }, [setUser]);
  
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
  
    const formData = new FormData();
    formData.append("profilePhoto", file);
    setLoading(true);
  
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Authentication token is missing or invalid.");
      setLoading(false);
      return;
    }
  
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/player/updateprofilepicture`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      const { profilePhoto } = response.data;
      if (profilePhoto?.data) {
        setUser((prevUser) => ({
          ...prevUser,
          image: {
            data: profilePhoto.data,
            contentType: profilePhoto.contentType,
          },
        }));
        toast.success("Profile picture updated successfully!");
      } else {
        toast.warn("No profile picture found in the response.");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to upload profile picture."
      );
    } finally {
      setLoading(false);
      setIsModalOpen(false);
    }
  };
  
  
  
  const handleRemovePicture = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Token is missing or invalid");
      toast.error("Authentication token is missing or invalid.");
      return;
    }
  
    setLoading(true);
  
    try {
      console.log("Attempting to remove profile picture...");
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/player/removeprofilepicture`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      setUser((prevUser) => ({
        ...prevUser,
        image: null,
      }));
      toast.success("Profile picture removed successfully!");
    } catch (error) {
      console.error(
        "Error removing profile picture:",
        error.response?.data || error.message
      );
      toast.error(
        error.response?.data?.message ||
          "Failed to remove profile picture."
      );
    } finally {
      setLoading(false);
      setIsModalOpen(false);
    }
  };
  
  const handleChangePicture = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };


  // Determine image source
  const getImageSrc = () => {
    const imageData = user?.image?.data;
  
    if (!imageData) return "/placeholder.svg";
  
    // If it's already a data URL, just return it
    if (imageData.startsWith("data:image")) return imageData;
  
    // Otherwise, construct it manually
    return `data:${user.image.contentType};base64,${imageData}`;
  };
  

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative w-32 h-32">
        {fetching ? (
          <div className="w-32 h-32 flex items-center justify-center bg-gray-200 rounded-full">
            <span>Loading...</span>
          </div>
        ) : (
          <Image
            src={getImageSrc()}
            alt="Profile Picture"
            width={128}
            height={128}
            className="rounded-full object-cover border-4 border-primary"
            priority
          />
        )}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button
              variant="secondary"
              size="sm"
              className="absolute bottom-0 right-0 rounded-full"
            >
              Edit
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Profile Picture</DialogTitle>
              <DialogDescription>
                Choose an action for your profile picture
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col space-y-4">
              <Button onClick={handleChangePicture}>Change Picture</Button>
              {user.image && (
                <Button
                  variant="destructive"
                  onClick={handleRemovePicture}
                >
                  Remove Picture
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: "none" }}
        accept="image/*"
      />
      {(loading || fetching) && <p>Processing...</p>}
    </div>
  );
};

export default ProfilePicture;
