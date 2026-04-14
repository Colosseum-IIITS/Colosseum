import React from 'react'
import ReportedOrganisers from '@/components/admin/ReportedOrganisers'
import ReportedTeams from '@/components/admin/ReportedTeams_Vihaan'

const page = () => {
  return (
    <div>
      <div className="col-span-1 md:col-span-1 lg:col-span-2">
          <ReportedTeams />
        </div>
        <div className="col-span-1 md:col-span-1 lg:col-span-2">
          <ReportedOrganisers />
        </div>
    </div>
  )
}

export default page
