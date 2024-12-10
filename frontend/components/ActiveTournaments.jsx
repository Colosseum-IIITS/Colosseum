"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminDashboard } from '../context/AdminDashboardContext';
import Cookies from 'js-cookie'; // Import js-cookie

export function ActiveTournaments() {
  const { dashboardData } = useAdminDashboard();

  // Determine if data is still loading
  const isLoading = !dashboardData;

  // Fallback value: use the value from the cookie if dashboardData is not loaded yet
  const activeTournamentsCountFromCookie = Cookies.get('activeTournamentsCount') || 0;

  // If dashboard data is available, use its activeTournamentsCount, otherwise fallback to cookie value
  const activeTournamentsCount = isLoading ? activeTournamentsCountFromCookie : dashboardData.activeTournamentsCount;

  return (
    <Card className="bg-secondary/10">
      <CardHeader>
        <CardTitle className="text-secondary-foreground">Total Active Tournaments</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <p className="text-3xl font-bold text-secondary-foreground">
            {activeTournamentsCount}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
