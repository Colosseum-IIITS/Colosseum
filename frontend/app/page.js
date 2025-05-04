"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export default function HomePage() {
  const router = useRouter()

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Video Background */}
      <video
        className="absolute top-0 left-0 w-full h-auto transform scale-150 object-cover"
        src="/videos/authBackground.mp4"
        autoPlay
        loop
        muted
      >
      </video>
      
      {/* Colloseum Logo */}
      <div className="absolute top-8 left-8 z-20">
        <Image 
          src="/image.png"
          alt="Colloseum Logo"
          width={350}
          height={350}
          className="object-contain"
        />
      </div>

      {/* Content with dark overlay */}
      <div className="relative z-10 flex items-center justify-center min-h-screen bg-black bg-opacity-50">
        <div className="w-full max-w-md p-8 space-y-8 bg-white bg-opacity-90 rounded-xl shadow-lg">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Choose Your Role</h1>
            <p className="text-gray-600">Select the option that best describes you</p>
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
    </div>
  )
}
