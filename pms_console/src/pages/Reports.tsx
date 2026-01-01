import { useState, useMemo } from "react"
import { DashboardStatsCard } from "@/components/dashboard/dashboard-stats-card"
import { useLocalDocList } from "@/hooks/use-local-data"
import {
    TrendingUp,
    Users,
    Calendar,
    Banknote,
    PieChart,
    ArrowUpRight,
    Filter,
    Download
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    Area,
    AreaChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    Bar,
    BarChart,
    Cell
} from "recharts"
import { cn } from "@/lib/utils"

export default function ReportsPage() {
    const [timeRange, setTimeRange] = useState("30d")

    // Data Fetching
    const { data: reservations } = useLocalDocList("Reservation")
    const { data: commissions } = useLocalDocList("Channel Commission")
    const { data: invoices } = useLocalDocList("Sales Invoice")

    // --- Analytics Logic ---
    const stats = useMemo(() => {
        const totalRev = invoices?.reduce((sum: number, i: any) => sum + (i.grand_total || 0), 0) || 0
        const confirmedReservations = reservations?.filter((r: any) => ["Confirmed", "Checked-In", "Checked-Out"].includes(r.reservation_status)) || []
        const totalNights = confirmedReservations.reduce((sum: number, r: any) => sum + (r.nights || 0), 0) || 1
        const adr = totalRev / totalNights
        const totalCommission = commissions?.reduce((sum: number, c: any) => sum + (c.commission_amount || 0), 0) || 0

        return {
            totalRevenue: totalRev,
            adr: adr,
            occupancy: (totalNights / (30 * 10)) * 100, // Mock: assuming 10 units total for 30 days
            commission: totalCommission
        }
    }, [reservations, commissions, invoices])

    // Mock Chart Data - In production, this would be derived from the fetched data
    const revenueData = [
        { date: '01 Jan', value: 4500 },
        { date: '05 Jan', value: 5200 },
        { date: '10 Jan', value: 4800 },
        { date: '15 Jan', value: 6100 },
        { date: '20 Jan', value: 5900 },
        { date: '25 Jan', value: 7200 },
        { date: '30 Jan', value: 6800 },
    ]

    const channelData = [
        { name: 'BookPondy', value: 45, color: '#D81B60' },
        { name: 'Airbnb', value: 25, color: '#FF5A5F' },
        { name: 'Booking.com', value: 20, color: '#003580' },
        { name: 'Direct', value: 10, color: '#10b981' },
    ]

    return (
        <>
            <div className="flex flex-col gap-4 pb-12">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-2">
                    <div className="space-y-1">
                        <h1 className="text-xl font-bold tracking-tight text-foreground uppercase tracking-tight">Revenue Analytics</h1>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                            Financial performance and distribution multi-channel insights.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="rounded-lg border-border h-10 px-4 font-bold text-[10px] uppercase tracking-widest gap-2 bg-card">
                            <Filter className="h-4 w-4" /> Filter
                        </Button>
                        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg h-10 px-4 font-bold text-[10px] uppercase tracking-widest gap-2 shadow-sm">
                            <Download className="h-4 w-4" /> Export PDF
                        </Button>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <DashboardStatsCard
                        title="Gross Revenue"
                        value={`₹${(stats.totalRevenue / 1000).toFixed(1)}k`}
                        trend="up"
                        trendValue="12%"
                        icon={Banknote}
                        subtext="Includes all processed invoices"
                    />
                    <DashboardStatsCard
                        title="Avg Daily Rate (ADR)"
                        value={`₹${Math.round(stats.adr).toLocaleString()}`}
                        trend="neutral"
                        trendValue="Steady"
                        icon={TrendingUp}
                        subtext="Rev / Confirmed Room Nights"
                    />
                    <DashboardStatsCard
                        title="Occupancy"
                        value={`${Math.min(100, Math.round(stats.occupancy))}%`}
                        trend="up"
                        trendValue="5% avg"
                        icon={Calendar}
                        subtext="Based on available unit inventory"
                    />
                    <DashboardStatsCard
                        title="Channel Commissions"
                        value={`₹${Math.round(stats.commission).toLocaleString()}`}
                        trend="down"
                        trendValue="Direct Up"
                        icon={PieChart}
                        subtext="Total marketplace fees due"
                    />
                </div>

                {/* Main Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-2 border border-border shadow-sm rounded-lg bg-card overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between bg-muted/30 px-4 py-3">
                            <div className="space-y-1">
                                <CardTitle className="text-sm font-bold uppercase tracking-tight">Revenue Trendline</CardTitle>
                                <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Monthly performance across all units</CardDescription>
                            </div>
                            <div className="flex gap-1 bg-background p-1 rounded-md border border-border">
                                {['7d', '30d', '90d'].map(r => (
                                    <Button
                                        key={r}
                                        variant={timeRange === r ? "secondary" : "ghost"}
                                        size="sm"
                                        className="h-7 px-3 text-[9px] font-black uppercase rounded-sm"
                                        onClick={() => setTimeRange(r)}
                                    >
                                        {r}
                                    </Button>
                                ))}
                            </div>
                        </CardHeader>
                        <CardContent className="p-4">
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={revenueData}>
                                        <defs>
                                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#D81B60" stopOpacity={0.1} />
                                                <stop offset="95%" stopColor="#D81B60" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis
                                            dataKey="date"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }}
                                            tickFormatter={(val) => `₹${val / 1000}k`}
                                        />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', fontSize: '12px', fontWeight: 'bold' }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="value"
                                            stroke="#D81B60"
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorValue)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="lg:col-span-1 border border-border shadow-sm rounded-lg bg-card overflow-hidden">
                        <CardHeader className="bg-muted/30 px-4 py-3">
                            <CardTitle className="text-sm font-bold uppercase tracking-tight">Channel Share</CardTitle>
                            <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Booking volume by source</CardDescription>
                        </CardHeader>
                        <CardContent className="p-4">
                            <div className="h-[250px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={channelData} layout="vertical">
                                        <XAxis type="number" hide />
                                        <YAxis
                                            dataKey="name"
                                            type="category"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }}
                                            width={80}
                                        />
                                        <Tooltip
                                            cursor={{ fill: 'transparent' }}
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                        />
                                        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                                            {channelData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="mt-6 space-y-3">
                                {channelData.map(item => (
                                    <div key={item.name} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                                            <span className="text-[10px] font-bold uppercase text-foreground">{item.name}</span>
                                        </div>
                                        <span className="text-[10px] font-black text-muted-foreground">{item.value}%</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Channel Commission Table */}
                <Card className="border border-border shadow-sm rounded-lg bg-card overflow-hidden">
                    <CardHeader className="bg-muted/30 px-4 py-3 flex flex-row items-center justify-between">
                        <div className="space-y-1">
                            <CardTitle className="text-sm font-bold uppercase tracking-tight">Channel Payouts & Commissions</CardTitle>
                            <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Detailed breakdown of marketplace liabilities</CardDescription>
                        </div>
                        <Button variant="ghost" className="text-[10px] font-black uppercase text-primary tracking-widest gap-1">
                            Full Ledger <ArrowUpRight className="h-3 w-3" />
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-muted/50 border-b border-border">
                                    <tr>
                                        <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Booking / ID</th>
                                        <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Channel</th>
                                        <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Revenue</th>
                                        <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Commission</th>
                                        <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {(commissions || []).slice(0, 5).map((c: any) => (
                                        <tr key={c.name} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-4 py-3 font-bold text-xs uppercase tracking-tight">{c.booking}</td>
                                            <td className="px-4 py-3">
                                                <Badge variant="outline" className="text-[9px] font-bold uppercase px-2 py-0 border-border text-muted-foreground tracking-widest">
                                                    {c.channel}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3 text-xs font-bold text-foreground">₹{(c.commission_amount / (c.commission_percentage / 100)).toLocaleString()}</td>
                                            <td className="px-4 py-3 text-xs font-black text-rose-500">₹{c.commission_amount.toLocaleString()}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1.5">
                                                    <div className={cn("h-1.5 w-1.5 rounded-full", c.status === "Paid" ? "bg-emerald-500" : "bg-amber-400")} />
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-foreground">{c.status}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {(!commissions || commissions.length === 0) && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-[10px] font-bold uppercase text-muted-foreground tracking-widest">
                                                No commission records found for this period.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    )
}
