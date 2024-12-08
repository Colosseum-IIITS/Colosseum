"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <h1 className="text-2xl font-bold mb-6">Choose Your Role</h1>
      <div className="space-y-4">
        <Button className="w-64" onClick={() => router.push("/auth?role=admin")}>
          I'm an Admin
        </Button>
        <Button className="w-64" onClick={() => router.push("/auth?role=org")}>
          I'm an Organizer
        </Button>
        <Button className="w-64" onClick={() => router.push("/auth?role=player")}>
          I'm a Player
        </Button>
      </div>
    </div>
  );
}
