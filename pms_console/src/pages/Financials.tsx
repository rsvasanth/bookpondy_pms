"use client"

import { useState } from "react"

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
        <>
            <div className="flex flex-col gap-4">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-xl font-bold tracking-tight text-foreground uppercase">Financial Analytics</h1>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Monitor your property performance and revenue trends.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Select value={portfolioId} onValueChange={setPortfolioId}>
                            <SelectTrigger className="w-[180px] h-10 rounded-lg bg-card border-border shadow-sm text-[10px] font-bold uppercase tracking-widest focus:ring-primary">
                                <SelectValue placeholder="All Portfolios" />
                            </SelectTrigger>
                            <SelectContent className="rounded-lg border-border">
                                <SelectItem value="all" className="text-[10px] font-bold uppercase">All Portfolios</SelectItem>
                                {portfolios?.map(p => (
                                    <SelectItem key={p.name} value={p.name} className="text-[10px] font-bold uppercase">{p.portfolio_name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={propertyId} onValueChange={setPropertyId}>
                            <SelectTrigger className="w-[180px] h-10 rounded-lg bg-card border-border shadow-sm text-[10px] font-bold uppercase tracking-widest focus:ring-primary">
                                <SelectValue placeholder="Select Property" />
                            </SelectTrigger>
                            <SelectContent className="rounded-lg border-border">
                                <SelectItem value="all" className="text-[10px] font-bold uppercase">All Properties</SelectItem>
                                {properties?.map(p => (
                                    <SelectItem key={p.name} value={p.name} className="text-[10px] font-bold uppercase">{p.property_name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={period} onValueChange={setPeriod}>
                            <SelectTrigger className="w-[150px] h-10 rounded-lg bg-card border-border shadow-sm text-[10px] font-bold uppercase tracking-widest focus:ring-primary">
                                <SelectValue placeholder="Period" />
                            </SelectTrigger>
                            <SelectContent className="rounded-lg border-border">
                                <SelectItem value="thisMonth" className="text-[10px] font-bold uppercase">This Month</SelectItem>
                                <SelectItem value="last30days" className="text-[10px] font-bold uppercase">Last 30 Days</SelectItem>
                                <SelectItem value="thisYear" className="text-[10px] font-bold uppercase">This Year</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button variant="outline" size="icon" className="h-10 w-10 mt-0 rounded-lg bg-card border-border hover:bg-muted shadow-sm transition-colors">
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
                    <Card className="lg:col-span-2 border border-border shadow-sm rounded-lg bg-card">
                        <CardHeader className="flex flex-row items-center justify-between pb-4 bg-muted/30 px-6 pt-6">
                            <div className="space-y-1">
                                <CardTitle className="text-sm font-bold uppercase tracking-tight">Revenue Trend</CardTitle>
                                <CardDescription className="text-[10px] font-bold uppercase tracking-widest">Daily performance metrics</CardDescription>
                            </div>
                            <div className="h-9 w-9 rounded-md bg-primary/10 text-primary flex items-center justify-center border border-border">
                                <LineChartIcon className="h-5 w-5" />
                            </div>
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

                    <Card className="border border-border shadow-sm rounded-lg bg-card">
                        <CardHeader className="flex flex-row items-center justify-between pb-4 bg-muted/30 px-6 pt-6">
                            <div className="space-y-1">
                                <CardTitle className="text-sm font-bold uppercase tracking-tight">Breakdown</CardTitle>
                                <CardDescription className="text-[10px] font-bold uppercase tracking-widest">By revenue stream</CardDescription>
                            </div>
                            <div className="h-9 w-9 rounded-md bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-border">
                                <PieChartIcon className="h-5 w-5" />
                            </div>
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
                                        <div className="flex items-center gap-3">
                                            <div className="h-2 w-2 rounded-full shadow-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                            <span className="font-bold uppercase tracking-tight">{item.name}</span>
                                        </div>
                                        <span className="font-bold text-foreground">{formatCurrency(item.value)}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Metrics Row */}
                <Card className="border border-border shadow-sm rounded-lg bg-card overflow-hidden">
                    <CardHeader className="bg-muted/30 px-6 py-6 border-b border-border">
                        <CardTitle className="text-sm font-bold uppercase tracking-tight">Operational Metrics</CardTitle>
                        <CardDescription className="text-[10px] font-bold uppercase tracking-widest">Detailed performance statistics</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow className="hover:bg-transparent border-border">
                                    <TableHead className="font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground px-4 py-3 border-b border-border">Metric</TableHead>
                                    <TableHead className="text-right font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground px-4 py-3 border-b border-border">Value</TableHead>
                                    <TableHead className="text-right font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground px-4 py-3 border-b border-border">Target</TableHead>
                                    <TableHead className="text-right font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground px-4 py-3 border-b border-border">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow className="hover:bg-muted/30 transition-all border-none">
                                    <TableCell className="px-4 py-3 font-bold text-sm text-foreground uppercase tracking-tight">Cancellations</TableCell>
                                    <TableCell className="px-4 py-3 text-right font-black text-sm text-rose-500">{summary?.cancellation_count || 0}</TableCell>
                                    <TableCell className="px-4 py-3 text-right text-[10px] font-bold text-muted-foreground uppercase">{`< 5%`}</TableCell>
                                    <TableCell className="px-4 py-3 text-right">
                                        <span className="bg-amber-500/10 text-amber-500 px-3 py-1 rounded-sm text-[9px] font-bold uppercase tracking-widest">Watch</span>
                                    </TableCell>
                                </TableRow>
                                <TableRow className="hover:bg-muted/30 transition-all border-none">
                                    <TableCell className="px-4 py-3 font-bold text-sm text-foreground uppercase tracking-tight">Available Nights</TableCell>
                                    <TableCell className="px-4 py-3 text-right font-black text-sm text-foreground">{summary?.available_nights || 0}</TableCell>
                                    <TableCell className="px-4 py-3 text-right text-[10px] font-bold text-muted-foreground uppercase">--</TableCell>
                                    <TableCell className="px-4 py-3 text-right">
                                        <span className="bg-muted text-muted-foreground px-3 py-1 rounded-sm text-[9px] font-bold uppercase tracking-widest">System</span>
                                    </TableCell>
                                </TableRow>
                                <TableRow className="hover:bg-muted/30 transition-all border-none">
                                    <TableCell className="px-4 py-3 font-bold text-sm text-foreground uppercase tracking-tight">Occupied Nights</TableCell>
                                    <TableCell className="px-4 py-3 text-right font-black text-sm text-foreground">{summary?.total_nights_occupied || 0}</TableCell>
                                    <TableCell className="px-4 py-3 text-right text-[10px] font-bold text-muted-foreground uppercase">--</TableCell>
                                    <TableCell className="px-4 py-3 text-right">
                                        <span className="bg-primary/10 text-primary px-3 py-1 rounded-sm text-[9px] font-bold uppercase tracking-widest">Active</span>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </>
    )
}
