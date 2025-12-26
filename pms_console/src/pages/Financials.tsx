"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { KPICard } from "@/components/dashboard/kpi-card"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useFrappeGetDocList, useFrappeGetCall } from "frappe-react-sdk"
import {
    LineChart, Line,
    XAxis, YAxis,
    CartesianGrid, Tooltip,
    ResponsiveContainer,
    PieChart, Pie, Cell
} from "recharts"
import {
    IndianRupee,
    TrendingUp,
    Download,
    PieChart as PieChartIcon,
    LineChart as LineChartIcon,
    Trophy,
    Activity
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))"]

export default function FinancialsPage() {
    const [propertyId, setPropertyId] = useState<string>("all")
    const [portfolioId, setPortfolioId] = useState<string>("all")
    const [period, setPeriod] = useState<string>("thisMonth")

    const { data: properties } = useFrappeGetDocList("Property", {
        fields: ["name", "property_name"]
    })

    const { data: portfolios } = useFrappeGetDocList("Property Portfolio", {
        fields: ["name", "portfolio_name"]
    })

    const { data: summary } = useFrappeGetCall(
        "bookpondy_pms.bookpondy_pms.financial_api.get_financial_summary",
        {
            property_id: propertyId === "all" ? undefined : propertyId,
            portfolio_id: portfolioId === "all" ? undefined : portfolioId,
            period: period
        }
    )

    const revenueData = summary?.revenue_trend || []
    const breakdownData = [
        { name: "Room Revenue", value: summary?.room_revenue || 0 },
        { name: "Services", value: summary?.additional_revenue || 0 },
    ]

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(val)
    }

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Financial Analytics</h1>
                        <p className="text-sm text-muted-foreground">Monitor your property performance and revenue trends.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Select value={portfolioId} onValueChange={setPortfolioId}>
                            <SelectTrigger className="w-[180px] h-10 rounded-xl bg-white border-muted shadow-sm">
                                <SelectValue placeholder="All Portfolios" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Portfolios</SelectItem>
                                {portfolios?.map(p => (
                                    <SelectItem key={p.name} value={p.name}>{p.portfolio_name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={propertyId} onValueChange={setPropertyId}>
                            <SelectTrigger className="w-[200px] h-10 rounded-xl bg-white border-muted shadow-sm">
                                <SelectValue placeholder="Select Property" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Properties</SelectItem>
                                {properties?.map(p => (
                                    <SelectItem key={p.name} value={p.name}>{p.property_name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={period} onValueChange={setPeriod}>
                            <SelectTrigger className="w-[150px] h-10 rounded-xl bg-white border-muted shadow-sm">
                                <SelectValue placeholder="Period" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="thisMonth">This Month</SelectItem>
                                <SelectItem value="last30days">Last 30 Days</SelectItem>
                                <SelectItem value="thisYear">This Year</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button variant="outline" size="icon" className="h-10 w-10 mt-0 rounded-xl bg-white border-muted shadow-sm">
                            <Download className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* KPI Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <KPICard
                        title="Total Revenue"
                        value={formatCurrency(summary?.total_revenue || 0)}
                        change={12.5}
                        trend="up"
                        icon={<IndianRupee className="h-6 w-6" />}
                        variant="teal"
                    />
                    <KPICard
                        title="Avg. Daily Rate (ADR)"
                        value={formatCurrency(summary?.adr || 0)}
                        change={4.2}
                        trend="up"
                        icon={<Trophy className="h-6 w-6" />}
                        variant="gold"
                    />
                    <KPICard
                        title="RevPAR"
                        value={formatCurrency(summary?.revpar || 0)}
                        change={-2.1}
                        trend="down"
                        icon={<TrendingUp className="h-6 w-6" />}
                        variant="pink"
                    />
                    <KPICard
                        title="Occupancy Rate"
                        value={`${summary?.occupancy_percent || 0}%`}
                        change={8.4}
                        trend="up"
                        icon={<Activity className="h-6 w-6" />}
                        variant="green"
                    />
                </div>

                {/* Charts Section */}
                <div className="grid gap-6 lg:grid-cols-3">
                    <Card className="lg:col-span-2 border-none shadow-sm rounded-2xl bg-white/50 backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div className="space-y-1">
                                <CardTitle className="text-lg font-bold">Revenue Trend</CardTitle>
                                <CardDescription>Daily revenue performance for the selected period</CardDescription>
                            </div>
                            <LineChartIcon className="h-5 w-5 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="h-[350px] mt-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={revenueData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                                        <XAxis
                                            dataKey="date"
                                            fontSize={10}
                                            axisLine={false}
                                            tickLine={false}
                                            tickFormatter={(value) => new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                        />
                                        <YAxis
                                            fontSize={10}
                                            axisLine={false}
                                            tickLine={false}
                                            tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                                        />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                            labelFormatter={(label) => new Date(label).toLocaleDateString('en-IN', { dateStyle: 'long' })}
                                            formatter={(value: any) => [formatCurrency(Number(value) || 0), "Revenue"]}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="revenue"
                                            stroke="hsl(var(--primary))"
                                            strokeWidth={3}
                                            dot={false}
                                            activeDot={{ r: 6, strokeWidth: 0 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm rounded-2xl bg-white/50 backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div className="space-y-1">
                                <CardTitle className="text-lg font-bold">Revenue Breakdown</CardTitle>
                                <CardDescription>By revenue stream</CardDescription>
                            </div>
                            <PieChartIcon className="h-5 w-5 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px] flex items-center justify-center">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={breakdownData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {breakdownData.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                            formatter={(value: any) => formatCurrency(Number(value) || 0)}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="space-y-3 mt-4">
                                {breakdownData.map((item, index) => (
                                    <div key={item.name} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                            <span className="font-medium">{item.name}</span>
                                        </div>
                                        <span className="font-bold">{formatCurrency(item.value)}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Metrics Row */}
                <Card className="border-none shadow-sm rounded-2xl bg-white">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold">Operational Metrics</CardTitle>
                        <CardDescription>Detailed breakdown of your property's operational performance.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow className="border-muted hover:bg-transparent">
                                    <TableHead className="font-bold text-[10px] uppercase tracking-wider">Metric</TableHead>
                                    <TableHead className="text-right font-bold text-[10px] uppercase tracking-wider">Value</TableHead>
                                    <TableHead className="text-right font-bold text-[10px] uppercase tracking-wider">Target</TableHead>
                                    <TableHead className="text-right font-bold text-[10px] uppercase tracking-wider">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow className="border-muted/50">
                                    <TableCell className="font-medium">Total Reservations</TableCell>
                                    <TableCell className="text-right font-bold">{summary?.booking_count || 0}</TableCell>
                                    <TableCell className="text-right text-muted-foreground">--</TableCell>
                                    <TableCell className="text-right">
                                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded-md text-[10px] font-bold uppercase">Healthy</span>
                                    </TableCell>
                                </TableRow>
                                <TableRow className="border-muted/50">
                                    <TableCell className="font-medium">Cancellations</TableCell>
                                    <TableCell className="text-right font-bold text-red-500">{summary?.cancellation_count || 0}</TableCell>
                                    <TableCell className="text-right text-muted-foreground">{"< 5%"}</TableCell>
                                    <TableCell className="text-right">
                                        <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-md text-[10px] font-bold uppercase">Watch</span>
                                    </TableCell>
                                </TableRow>
                                <TableRow className="border-muted/50">
                                    <TableCell className="font-medium">Available Nights</TableCell>
                                    <TableCell className="text-right font-bold">{summary?.available_nights || 0}</TableCell>
                                    <TableCell className="text-right text-muted-foreground">--</TableCell>
                                    <TableCell className="text-right">
                                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-[10px] font-bold uppercase">System</span>
                                    </TableCell>
                                </TableRow>
                                <TableRow className="border-muted/50">
                                    <TableCell className="font-medium">Occupied Nights</TableCell>
                                    <TableCell className="text-right font-bold">{summary?.total_nights_occupied || 0}</TableCell>
                                    <TableCell className="text-right text-muted-foreground">--</TableCell>
                                    <TableCell className="text-right">
                                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-[10px] font-bold uppercase">Active</span>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}
