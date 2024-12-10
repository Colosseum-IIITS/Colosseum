"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Sample data - replace with actual data
const weeklyData = [
  { name: "Organizer A", tournaments: 5 },
  { name: "Organizer B", tournaments: 4 },
  { name: "Organizer C", tournaments: 3 },
  { name: "Organizer D", tournaments: 3 },
  { name: "Organizer E", tournaments: 2 },
];

const monthlyData = [
  { name: "Organizer A", tournaments: 20 },
  { name: "Organizer B", tournaments: 18 },
  { name: "Organizer C", tournaments: 15 },
  { name: "Organizer D", tournaments: 12 },
  { name: "Organizer E", tournaments: 10 },
];

const yearlyData = [
  { name: "Organizer A", tournaments: 240 },
  { name: "Organizer B", tournaments: 220 },
  { name: "Organizer C", tournaments: 180 },
  { name: "Organizer D", tournaments: 150 },
  { name: "Organizer E", tournaments: 120 },
];

const chartConfig = {
  tournaments: {
    label: "Tournaments",
    color: "hsl(var(--chart-1))",
  },
};

export function TopOrganisersChart() {
  const [activeTab, setActiveTab] = React.useState("weekly");

  const getChartData = () => {
    switch (activeTab) {
      case "weekly":
        return weeklyData;
      case "monthly":
        return monthlyData;
      case "yearly":
        return yearlyData;
      default:
        return weeklyData;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>Top Organizers</CardTitle>
          <CardDescription>
            Showing top organizers by number of tournaments
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="yearly">Yearly</TabsTrigger>
          </TabsList>
          <TabsContent value={activeTab}>
            <ChartContainer
              config={chartConfig}
              className="aspect-auto h-[250px] w-full"
            >
              <BarChart
                data={getChartData()}
                layout="vertical"
                margin={{
                  left: 80,
                  right: 12,
                  top: 12,
                  bottom: 12,
                }}
              >
                <CartesianGrid horizontal={false} />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={80} />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      className="w-[150px]"
                      nameKey="tournaments"
                    />
                  }
                />
                <Bar dataKey="tournaments" fill={`var(--color-tournaments)`} />
              </BarChart>
            </ChartContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
