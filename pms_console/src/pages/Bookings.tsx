"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  Search,
  AlertCircle,
  MoreVertical,
  LogOut,
  LogIn,
  ArrowRight,
  TrendingUp,
  IndianRupee,
  Calendar,
  Download,
  Percent,
  LayoutGrid,
  List
} from "lucide-react"
import { cn } from "@/lib/utils"

const bookingStats = [
  { label: "Today Arrivals", value: "08", icon: LogIn, color: "text-primary", bg: "bg-primary/5" },
  { label: "Today Departures", value: "12", icon: LogOut, color: "text-secondary", bg: "bg-secondary/10" },
  { label: "Active Guests", value: "34", icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
  { label: "Pending Conf.", value: "03", icon: AlertCircle, color: "text-primary", bg: "bg-primary/5" },
]

export default function BookingsPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-800">Reservation Management</h1>
            <p className="text-sm text-slate-500 font-medium tracking-tight">
              Unifying current operations and future forecasts
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search guest or room..."
                className="pl-9 h-10 rounded-xl border-slate-200 bg-white shadow-sm text-sm"
              />
            </div>
            <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl h-10 px-4 font-bold text-sm gap-2 shadow-sm">
              <Plus className="h-4 w-4" /> New Booking
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="bg-slate-100/50 p-1 rounded-xl h-11">
              <TabsTrigger value="overview" className="rounded-lg h-9 px-4 font-bold text-xs gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm text-slate-500 data-[state=active]:text-slate-900">
                <List className="h-4 w-4" /> Overview
              </TabsTrigger>
              <TabsTrigger value="forecast" className="rounded-lg h-9 px-4 font-bold text-xs gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm text-slate-500 data-[state=active]:text-slate-900">
                <TrendingUp className="h-4 w-4" /> Forecast & Map
              </TabsTrigger>
            </TabsList>

            <Button variant="outline" className="rounded-xl h-10 px-4 font-bold text-sm gap-2 border-slate-200 bg-white shadow-sm text-slate-600">
              <Download className="h-4 w-4" /> Export
            </Button>
          </div>

          <TabsContent value="overview" className="mt-0 space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {bookingStats.map((stat) => (
                <Card key={stat.label} className="border-none shadow-sm rounded-2xl bg-white transition-all hover:translate-y-[-2px]">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</span>
                      <stat.icon className={cn("h-4 w-4", stat.color)} />
                    </div>
                    <p className="text-3xl font-black text-slate-800 tracking-tight">{stat.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-white">
              <div className="p-4 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-2">Active Schedule</h2>
                <div className="flex gap-1 bg-slate-100/50 p-1 rounded-lg">
                  <Button variant="ghost" className="rounded-md h-7 px-3 font-bold text-[10px] bg-white shadow-sm text-slate-900 uppercase">All</Button>
                  <Button variant="ghost" className="rounded-md h-7 px-3 font-bold text-[10px] text-slate-500 hover:text-slate-900 uppercase">Arrivals</Button>
                  <Button variant="ghost" className="rounded-md h-7 px-3 font-bold text-[10px] text-slate-500 hover:text-slate-900 uppercase">Departures</Button>
                </div>
              </div>
              <div className="p-0 overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-50">
                      <th className="text-left py-4 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Guest Detail</th>
                      <th className="text-left py-4 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Property/Room</th>
                      <th className="text-left py-4 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Stay Period</th>
                      <th className="text-left py-4 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Status</th>
                      <th className="text-right py-4 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs border border-slate-200">
                              JD
                            </div>
                            <div className="space-y-0.5">
                              <p className="font-bold text-slate-800 text-sm">John Doe</p>
                              <p className="text-[10px] font-medium text-slate-400 tracking-tight">+91 98765 43210</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="space-y-1">
                            <p className="text-xs font-bold text-slate-700">Beach House Pondy</p>
                            <Badge variant="outline" className="text-[9px] font-bold text-primary uppercase border-primary/20 bg-primary/5 px-1.5 py-0">Unit 204</Badge>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="space-y-0.5">
                            <p className="text-xs font-bold text-slate-700 flex items-center gap-2">
                              24 Dec <ArrowRight className="h-3 w-3 text-slate-300" /> 28 Dec
                            </p>
                            <p className="text-[10px] font-medium text-slate-400">4 Nights • 2 Guests</p>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <Badge className={cn(
                            "text-[10px] font-black uppercase px-2 py-0.5 rounded-md border-none shadow-none",
                            i % 2 === 0 ? "bg-primary text-white" : "bg-blue-500 text-white"
                          )}>
                            {i % 2 === 0 ? "ARRIVING" : "IN-HOUSE"}
                          </Badge>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-slate-100 text-slate-400">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="forecast" className="mt-0 space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-none shadow-sm rounded-2xl bg-slate-900 text-white transition-all hover:translate-y-[-2px]">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-widest opacity-60">Future Bookings</span>
                    <Calendar className="h-4 w-4 opacity-40" />
                  </div>
                  <p className="text-3xl font-black tracking-tight">214</p>
                  <p className="text-[10px] font-bold mt-1 uppercase tracking-widest opacity-40">Confirmed 30d</p>
                </CardContent>
              </Card>
              <Card className="border-none shadow-sm rounded-2xl bg-white transition-all hover:translate-y-[-2px]">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Avg Occupancy</span>
                    <Percent className="h-4 w-4 text-emerald-500" />
                  </div>
                  <p className="text-3xl font-black text-slate-800 tracking-tight">76%</p>
                  <p className="text-[10px] font-bold text-emerald-500 mt-1 flex items-center gap-1 uppercase tracking-widest">
                    <TrendingUp className="h-3 w-3" /> +14% YoY
                  </p>
                </CardContent>
              </Card>
              <Card className="border-none shadow-sm rounded-2xl bg-white transition-all hover:translate-y-[-2px]">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Next 7 Days</span>
                    <Users className="h-4 w-4 text-blue-500" />
                  </div>
                  <p className="text-3xl font-black text-slate-800 tracking-tight">42</p>
                  <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Expected arrivals</p>
                </CardContent>
              </Card>
              <Card className="border-none shadow-sm rounded-2xl bg-white transition-all hover:translate-y-[-2px] border-l-4 border-primary">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-primary">Projected Rev.</span>
                    <IndianRupee className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-3xl font-black text-primary tracking-tight">₹14.2L</p>
                  <p className="text-[10px] font-bold text-primary/60 mt-1 uppercase tracking-widest">Jan 2026 Forecast</p>
                </CardContent>
              </Card>
            </div>

            <Card className="border-none shadow-sm rounded-2xl bg-white p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 border border-slate-100">
                    <LayoutGrid className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-lg text-slate-800 tracking-tight">Advanced Occupancy Map</h3>
                </div>
                <div className="flex gap-1 bg-slate-100/50 p-1 rounded-xl">
                  <Button variant="ghost" size="sm" className="h-8 rounded-lg font-bold text-[10px] uppercase px-4 text-slate-400 hover:text-slate-900">Day</Button>
                  <Button variant="ghost" size="sm" className="h-8 rounded-lg font-bold text-[10px] uppercase px-4 text-slate-400 hover:text-slate-900">Week</Button>
                  <Button variant="ghost" size="sm" className="h-8 rounded-lg font-bold text-[10px] uppercase px-4 bg-white shadow-sm text-slate-900">Month</Button>
                </div>
              </div>

              <div className="flex items-center justify-center h-[400px] border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/30">
                <div className="text-center space-y-4">
                  <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center shadow-sm mx-auto border border-slate-50">
                    <Calendar className="h-8 w-8 text-primary/40 animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Occupancy Map Visualization</p>
                    <p className="text-[10px] text-slate-300 uppercase tracking-[0.2em] font-black">Sync with property units in progress</p>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

function Plus(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  )
}
