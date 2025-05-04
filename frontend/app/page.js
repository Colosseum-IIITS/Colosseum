'use client'
import Hero from "@/components/Hero"
import About from "@/components/About"
import NavBar from "@/components/Navbar"
import Features from "@/components/Features"

import Contact from "@/components/Contact"
import Footer from "@/components/Footer"
import CanvasCursor from "@/components/CanvasCursor"

import { useRouter } from "next/navigation"

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


      <Footer />
    </div>
  )
}
