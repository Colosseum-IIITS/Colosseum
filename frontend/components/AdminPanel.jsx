
// components/AdminPanel.jsx
import PlayerManagement from './PlayerManagement'
import OrganizerManagement from './OrganizerManagement'
import BanHistory from './BanHistory'
import ReportedTeams from './org/ReportedTeams'
import ReportedOrganizers from './ReportedOrganizers'

export default function AdminPanel() {
  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="col-span-1 md:col-span-2 lg:col-span-3">
          <PlayerManagement />
        </div>
        <div className="col-span-1 md:col-span-2 lg:col-span-3">
          <OrganizerManagement />
        </div>
        <div className="col-span-1 md:col-span-2 lg:col-span-3">
          <BanHistory />
        </div>
        
      </div>
    </div>
  )
}
