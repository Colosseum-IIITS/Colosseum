'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

const data = [
  { month: "Jan", players: 65, teams: 28, organisers: 12, tournaments: 8 },
  { month: "Feb", players: 59, teams: 25, organisers: 10, tournaments: 7 },
  { month: "Mar", players: 80, teams: 36, organisers: 15, tournaments: 10 },
  { month: "Apr", players: 81, teams: 35, organisers: 14, tournaments: 9 },
  { month: "May", players: 56, teams: 25, organisers: 11, tournaments: 7 },
  { month: "Jun", players: 55, teams: 22, organisers: 9, tournaments: 6 },
  { month: "Jul", players: 40, teams: 18, organisers: 8, tournaments: 5 },
];

export function RegistrationsChart() {
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Registrations Over Time</CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
            <XAxis
              dataKey="month"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip />
            <Bar dataKey="players" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
            <Bar dataKey="teams" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
            <Bar dataKey="organisers" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
            <Bar dataKey="tournaments" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
