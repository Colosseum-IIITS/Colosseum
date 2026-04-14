'use client'
import Hero from "@/components/landing/Hero"
import About from "@/components/landing/About"
import NavBar from "@/components/layout/Navbar"
import Features from "@/components/landing/Features"

import Contact from "@/components/landing/Contact"
import Footer from "@/components/landing/Footer"
import CanvasCursor from "@/components/landing/CanvasCursor"

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
