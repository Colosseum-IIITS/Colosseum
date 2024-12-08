'use client'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Users, UserCheck } from "lucide-react"
import useFetchAdminDashboard from "@/context/useFetchAdminDashboard"
import { useEffect } from "react"
import { useAdminDashboard } from "@/context/AdminDashboardContext"

function StatsCard({ title, value, icon }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value.toLocaleString()}</div>
      </CardContent>
    </Card>
  )
}

export function TournamentStatsCards() {
  const dashboardData = useFetchAdminDashboard();
  // Replace these with actual data from your API or state management solution
   
  var totalTournaments = 1234
  var totalPlayers = 98765
  var totalActiveOrganizers = 567
  if(!dashboardData){
    return<div>Loading....</div>
  }
  if(dashboardData){
     totalTournaments = dashboardData.tournaments.length;
     totalPlayers = dashboardData.players.length;
     totalActiveOrganizers = dashboardData.organisers.length;
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <StatsCard
        title="Total Tournaments"
        value={totalTournaments}
        icon={<Trophy className="h-4 w-4 text-muted-foreground" />}
      />
      <StatsCard
        title="Total Players"
        value={totalPlayers}
        icon={<Users className="h-4 w-4 text-muted-foreground" />}
      />
      <StatsCard
        title="Active Organizers"
        value={totalActiveOrganizers}
        icon={<UserCheck className="h-4 w-4 text-muted-foreground" />}
      />
    </div>
  )
}
