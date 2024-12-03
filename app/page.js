'use client'
import Hero from "@/components/Hero";
import React from "react";
import About from "@/components/About";
import NavBar from "@/components/Navbar";
import Features from "@/components/Features";
import Story from "@/components/Story"
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import CanvasCursor from "@/components/CanvasCursor";
export default function Home() {
  return (
    <div>
      <main className="relative min-h-screen w-screen overflow-x-hidden">
        <CanvasCursor /> 
        <NavBar />
        <Hero />
        <About />
        <Features />
        <Contact />
        <Footer />
    </main>
    </div>
  );
}
