"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

export default function UpdateDetails() {
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

    const body = {
      newUsername,
      newEmail,
      newPassword,
      newDescription,
    };

    try {
      const response = await fetch(`http://localhost:5000/api/organiser/update${type}`, {
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
        router.push("/dashboard"); // Redirect after successful update
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
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Update Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          {/* Username */}
          <div className="flex items-center justify-between">
            <div className="w-full">
              <label className="font-medium">Username</label>
              <Input
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Enter new username"
              />
            </div>
            <Button
              onClick={(e) => handleSubmit(e, "Username")}
              className="ml-4 w-1/4"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Username"}
            </Button>
          </div>

          {/* Email */}
          <div className="flex items-center justify-between">
            <div className="w-full">
              <label className="font-medium">Email</label>
              <Input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Enter new email"
              />
            </div>
            <Button
              onClick={(e) => handleSubmit(e, "Email")}
              className="ml-4 w-1/4"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Email"}
            </Button>
          </div>

          {/* Password */}
          <div className="flex items-center justify-between">
            <div className="w-full">
              <label className="font-medium">Password</label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
            </div>
            <Button
              onClick={(e) => handleSubmit(e, "Password")}
              className="ml-4 w-1/4"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Password"}
            </Button>
          </div>

          {/* Description */}
          <div className="flex items-center justify-between">
            <div className="w-full">
              <label className="font-medium">Description</label>
              <Input
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Enter new description"
              />
            </div>
            <Button
              onClick={(e) => handleSubmit(e, "Description")}
              className="ml-4 w-1/4"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Description"}
            </Button>
          </div>
        </form>

        {error && <div className="text-red-500 mt-4">{error}</div>}
      </CardContent>
    </Card>
  );
}
