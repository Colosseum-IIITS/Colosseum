'use client'
import Hero from "@/components/Hero"
import About from "@/components/About"
import NavBar from "@/components/Navbar"
import Features from "@/components/Features"
import Story from "@/components/Story"
import Contact from "@/components/Contact"
import Footer from "@/components/Footer"
import CanvasCursor from "@/components/CanvasCursor"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function Home() {
  const router = useRouter()

  return (
    <div className="relative min-h-screen w-screen overflow-x-hidden">
      <CanvasCursor />
      <NavBar />
      <Hero />
      <About />
      <Features />
  
      <Contact />
      {/* <div className="flex flex-col items-center justify-center py-10 space-y-6">
        <h2 className="text-3xl font-bold">Choose Your Role</h2>
        <div className="space-y-4 w-full max-w-sm">
          <Button
            className="w-full bg-black text-white"
            onClick={() => router.push("/auth?role=admin")}
          >
            I'm an Admin
          </Button>
          <Button
            className="w-full bg-black text-white"
            onClick={() => router.push("/auth?role=organiser")}
          >
            I'm an Organizer
          </Button>
          <Button
            className="w-full bg-black text-white"
            onClick={() => router.push("/auth?role=player")}
          >
            I'm a Player
          </Button>
        </div>
      </div> */}
      <Footer />
    </div>
  )
}
