
// components/ReportedOrganizers.jsx
"use client"

import { useState, useEffect } from 'react'
import { TableCell, TableRow } from "@/components/ui/table"
import { mockOrganizerReports } from '../utils/mockData'
import ScrollableTable from './ScrollableTable'

export default function ReportedOrganizers() {
  const [organizerReports, setOrganizerReports] = useState([])

  useEffect(() => {
    // Load mock organizer reports
    setOrganizerReports(mockOrganizerReports)
  }, [])

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Reported Organizers</h2>
      <ScrollableTable headers={["Organizer Name", "Reported By", "Reason", "Status"]}>
        {organizerReports.map((report) => (
          <TableRow key={report.id}>
            <TableCell>{report.organizerName}</TableCell>
            <TableCell>{report.reportedBy}</TableCell>
            <TableCell>{report.reason}</TableCell>
            <TableCell>{report.status}</TableCell>
          </TableRow>
        ))}
      </ScrollableTable>
    </div>
  )
}
