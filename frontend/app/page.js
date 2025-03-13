"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  const router = useRouter()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-background to-muted">
      <div className="w-full max-w-md p-8 space-y-8 bg-card rounded-xl shadow-lg border border-border">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Choose Your Role</h1>
          <p className="text-muted-foreground">Select the option that best describes you</p>
        </div>

        <div className="space-y-4 pt-4">
          <Button
            className="w-full h-12 text-base font-medium transition-all hover:translate-y-[-2px] hover:shadow-md bg-black text-white hover:bg-black/90"
            onClick={() => router.push("/auth?role=admin")}
          >
            I'm an Admin
          </Button>

          <Button
            className="w-full h-12 text-base font-medium transition-all hover:translate-y-[-2px] hover:shadow-md bg-black text-white hover:bg-black/90"
            onClick={() => router.push("/auth?role=organiser")}
          >
            I'm an Organizer
          </Button>

          <Button
            className="w-full h-12 text-base font-medium transition-all hover:translate-y-[-2px] hover:shadow-md bg-black text-white hover:bg-black/90"
            onClick={() => router.push("/auth?role=player")}
          >
            I'm a Player
          </Button>
        </div>
      </div>
    </div>
  )
}