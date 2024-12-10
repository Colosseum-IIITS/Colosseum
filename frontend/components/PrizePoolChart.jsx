"use client"
import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip
} from "recharts"

const weeklyData = [
  { period: "Week 1", average: 5000 },
  { period: "Week 2", average: 5500 },
  { period: "Week 3", average: 4800 },
  { period: "Week 4", average: 6000 }
]

const monthlyData = [
  { period: "Jan", average: 22000 },
  { period: "Feb", average: 24000 },
  { period: "Mar", average: 21000 },
  { period: "Apr", average: 25000 }
]

const yearlyData = [
  { period: "2020", average: 250000 },
  { period: "2021", average: 280000 },
  { period: "2022", average: 300000 },
  { period: "2023", average: 320000 }
]

export function TournamentPrizePoolChart() {
  const [activeTab, setActiveTab] = React.useState("weekly")

  const renderChart = data => (
    <ResponsiveContainer width="100%" height={350}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorAverage" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="hsl(var(--chart-5))"
              stopOpacity={0.8}
            />
            <stop
              offset="95%"
              stopColor="hsl(var(--chart-5))"
              stopOpacity={0}
            />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="period"
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
          tickFormatter={value => `$${value}`}
        />
        <Tooltip />
        <Area
          type="monotone"
          dataKey="average"
          stroke="hsl(var(--chart-5))"
          fillOpacity={1}
          fill="url(#colorAverage)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tournament Prize Pool Averages</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="yearly">Yearly</TabsTrigger>
          </TabsList>
          <TabsContent value="weekly">{renderChart(weeklyData)}</TabsContent>
          <TabsContent value="monthly">{renderChart(monthlyData)}</TabsContent>
          <TabsContent value="yearly">{renderChart(yearlyData)}</TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
