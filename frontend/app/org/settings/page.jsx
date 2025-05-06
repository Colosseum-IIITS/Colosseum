'use client';

import { useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

function LoadingFallback() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
    </div>
  );
}

export default function OrganiserSettings() {
  const [newUsername, setNewUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e, type) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const body = type === "Password" ? { newPassword } :{
      newUsername,
      newEmail,
      newDescription,
    };
    console.log("Sending request body:", body);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/organiser/update${type}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        alert(`${type} updated successfully!`);
        router.push("/org/dashboard"); // Redirect after successful update
      } else {
        setError(data.message || "Failed to update");
      }
    } catch (err) {
      setError("An error occurred while updating.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="md:flex">
          <div className="p-8 w-full">
            <h1 className="text-3xl font-semibold text-center text-black mb-8">Organiser Settings</h1>
            <Suspense fallback={<LoadingFallback />}>
              <div className="space-y-6">
                {/* Username */}
                <Card className="w-full border border-gray-300">
                  <CardHeader className="bg-white p-4 rounded-md">
                    <CardTitle className="text-xl font-semibold text-black">Update Username</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="flex flex-col space-y-4">
                      <label className="font-medium text-black">Username</label>
                      <div className="flex items-center space-x-4">
                        <Input
                          className="w-full border border-gray-300"
                          value={newUsername}
                          onChange={(e) => setNewUsername(e.target.value)}
                          placeholder="Enter new username"
                        />
                        <Button
                          onClick={(e) => handleSubmit(e, "Username")}
                          className="w-1/4 bg-black hover:bg-gray-800 text-white"
                          disabled={loading}
                        >
                          {loading ? "Updating..." : "Update Username"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Email */}
                <Card className="w-full border border-gray-300">
                  <CardHeader className="bg-white p-4 rounded-md">
                    <CardTitle className="text-xl font-semibold text-black">Update Email</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="flex flex-col space-y-4">
                      <label className="font-medium text-black">Email</label>
                      <div className="flex items-center space-x-4">
                        <Input
                          type="email"
                          className="w-full border border-gray-300"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          placeholder="Enter new email"
                        />
                        <Button
                          onClick={(e) => handleSubmit(e, "Email")}
                          className="w-1/4 bg-black hover:bg-gray-800 text-white"
                          disabled={loading}
                        >
                          {loading ? "Updating..." : "Update Email"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Password */}
                <Card className="w-full border border-black-300">
                  <CardHeader className="bg-white p-4 rounded-md">
                    <CardTitle className="text-xl font-semibold text-black">Update Password</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="flex flex-col space-y-4">
                      <label className="font-medium text-black">Password</label>
                      <div className="flex items-center space-x-4">
                        <Input
                          type="password"
                          className="w-full border border-gray-300"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter new password"
                        />
                        <Button
                          onClick={(e) => handleSubmit(e, "Password")}
                          className="w-1/4 bg-black hover:bg-gray-800 text-white"
                          disabled={loading}
                        >
                          {loading ? "Updating..." : "Update Password"}
                        </Button>
                        
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Description */}
                <Card className="w-full border border-gray-300">
                  <CardHeader className="bg-white p-4 rounded-md">
                    <CardTitle className="text-xl font-semibold text-black">Update Description</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="flex flex-col space-y-4">
                      <label className="font-medium text-black">Description</label>
                      <div className="flex items-center space-x-4">
                        <Input
                          className="w-full border border-gray-300"
                          value={newDescription}
                          onChange={(e) => setNewDescription(e.target.value)}
                          placeholder="Enter new description"
                        />
                        <Button
                          onClick={(e) => handleSubmit(e, "Description")}
                          className="w-1/4 bg-black hover:bg-gray-800 text-white"
                          disabled={loading}
                        >
                          {loading ? "Updating..." : "Update Description"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </Suspense>

            {error && <div className="text-red-500 mt-4 text-center">{error}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
