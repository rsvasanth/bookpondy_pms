"use client"

import { } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  TrendingUp,
  AlertCircle,
  IndianRupee,
  Activity
} from "lucide-react"
import { cn } from "@/lib/utils"

const stats = [
  { label: "Total Revenue", value: "₹4.2L", change: "+12%", icon: IndianRupee, trend: "up" },
  { label: "Occupancy", value: "84%", change: "+5%", icon: TrendingUp, trend: "up" },
  { label: "Active Bookings", value: "28", change: "+3", icon: Users, trend: "up" },
  { label: "Maintenance", value: "04", change: "-2", icon: AlertCircle, trend: "down" },
]

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="mb-4 flex flex-col gap-1">
        <h1 className="text-xl font-black tracking-tight text-secondary">Operational Overview</h1>
        <p className="text-xs text-muted-foreground font-medium">Real-time performance across all Pondicherry properties.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-none shadow-sm rounded-2xl overflow-hidden group">
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</span>
                <div className="p-1.5 rounded-xl bg-secondary/5 text-secondary transition-transform group-hover:scale-110">
                  <stat.icon className="h-4 w-4" />
                </div>
              </div>
              <div className="flex items-end gap-1">
                <p className="text-3xl font-black">{stat.value}</p>
                <span className={cn(
                  "text-[10px] font-bold mb-1 px-1.5 py-0.5 rounded-md",
                  stat.trend === "up" ? "bg-green-100 text-green-700" : "bg-primary/10 text-primary"
                )}>
                  {stat.change}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Alerts & Critical Tasks */}
        <Card className="lg:col-span-2 border-muted shadow-sm rounded-3xl overflow-hidden">
          <CardHeader className="p-5 border-b border-muted/30">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-black text-secondary">Immediate Actions</CardTitle>
              <Badge variant="secondary" className="bg-primary text-white border-none font-bold text-[10px] px-3">03 Critical</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-primary/5 border-l-4 border-primary">
              <AlertCircle className="h-5 w-5 text-primary mt-1" />
              <div className="space-y-1">
                <p className="font-bold text-sm">Room 204 AC Maintenance Required</p>
                <p className="text-xs text-muted-foreground">Guest checking in at 4 PM today. Critical fix needed.</p>
              </div>
            </div>
            {/* Additional alert items can follow */}
          </CardContent>
        </Card>

        {/* Live Activity Feed */}
        <Card className="border-muted shadow-sm rounded-3xl overflow-hidden">
          <CardHeader className="p-5 border-b border-muted/30">
            <CardTitle className="text-lg font-black text-secondary">Live Activity</CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3 relative">
                <div className="h-8 w-8 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                  <Activity className="h-4 w-4" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold">New Booking Confirmed</p>
                  <p className="text-[10px] text-muted-foreground uppercase font-medium">Selvam Guest House • 4 Guests</p>
                </div>
                <span className="ml-auto text-[9px] font-bold text-muted-foreground">12m ago</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
