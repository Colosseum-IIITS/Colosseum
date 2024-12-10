import React from 'react'
import { TopOrganisersChart } from '@/components/TopOrganisersByTournaments'
import { TournamentPrizePoolChart } from '@/components/PrizePoolChart'
import { TournamentStatsCards } from '@/components/TournamentStatsCards'

const page = () => {
  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Tournament Statistics</h1>
      <div className="space-y-6">
        <TournamentStatsCards />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TournamentPrizePoolChart />
          <TopOrganisersChart />
        </div>
      </div>
    </div>
  )
}

export default page
