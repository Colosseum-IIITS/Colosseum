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

const chartConfig = {
  tournaments: {
    label: "Tournaments",
    color: "hsl(var(--chart-1))",
  },
};

export function TopOrganisersChart() {
  const [activeTab, setActiveTab] = React.useState("weekly");
  const [chartData, setChartData] = React.useState({
    weekly: [],
    monthly: [],
    yearly: []
  });
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/organiser/top-organisers');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        setChartData(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching top organisers:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getChartData = () => {
    return chartData[activeTab] || [];
  };

  if (loading) {
    return <Card><CardContent>Loading...</CardContent></Card>;
  }

  if (error) {
    return <Card><CardContent>Error: {error}</CardContent></Card>;
  }

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
