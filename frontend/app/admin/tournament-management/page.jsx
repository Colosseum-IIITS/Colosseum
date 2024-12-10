'use client'
import { useEffect, useState } from "react"
import { ActiveTournaments } from "@/components/ActiveTournaments"
import { CompletedTournaments } from "@/components/CompletedTournaments"
import { Button } from "@/components/ui/button"
import PendingTournament from "@/components/PendingTournaments"
import useFetchAdminDashboard from "@/context/useFetchAdminDashboard"
import { useAdminDashboard } from "@/context/AdminDashboardContext"



export default function DashboardPage() {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const dashboardData = useFetchAdminDashboard();
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.classList.toggle("dark")
  }
  useEffect(()=>{
    if(dashboardData){
    console.log("Dashboard Data:", dashboardData)
  }
  },[dashboardData]);
  if(!dashboardData){
    return<div>Loading....</div>;
  }
  
  

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      <div className="container mx-auto p-6 bg-background text-foreground">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Tournament Dashboard</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ActiveTournaments />
          <CompletedTournaments />
        </div>
          <PendingTournament/>
      </div>
    </div>
  )
}

