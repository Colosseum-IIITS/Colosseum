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

export function TournamentPrizePoolChart() {
  const [activeTab, setActiveTab] = React.useState("weekly")
  const [chartData, setChartData] = React.useState({
    weekly: [],
    monthly: [],
    yearly: []
  })
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(null)

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/organiser/tournament-prize-pool-averages')
        if (!response.ok) {
          throw new Error('Failed to fetch data')
        }
        const data = await response.json()
        setChartData(data)
      } catch (err) {
        setError(err.message)
        console.error('Error fetching prize pool data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

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

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tournament Prize Pool Averages</CardTitle>
        </CardHeader>
        <CardContent>Loading...</CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tournament Prize Pool Averages</CardTitle>
        </CardHeader>
        <CardContent>Error: {error}</CardContent>
      </Card>
    )
  }

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
          <TabsContent value="weekly">{renderChart(chartData.weekly)}</TabsContent>
          <TabsContent value="monthly">{renderChart(chartData.monthly)}</TabsContent>
          <TabsContent value="yearly">{renderChart(chartData.yearly)}</TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
