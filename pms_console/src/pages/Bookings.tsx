"use client"

import { } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Users,
  Search,
  AlertCircle,
  MoreVertical,
  LogOut,
  LogIn,
  ArrowRight
} from "lucide-react"
import { cn } from "@/lib/utils"

const bookingStats = [
  { label: "Today Arrivals", value: "08", icon: LogIn, color: "text-primary", bg: "bg-primary/5" },
  { label: "Today Departures", value: "12", icon: LogOut, color: "text-secondary", bg: "bg-secondary/10" },
  { label: "Active Guests", value: "34", icon: Users, color: "text-secondary", bg: "bg-secondary/10" },
  { label: "Pending Conf.", value: "03", icon: AlertCircle, color: "text-primary", bg: "bg-primary/5" },
]

export default function BookingsPage() {
  return (
    <DashboardLayout>
      <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-0.5">
          <h1 className="text-xl font-black tracking-tight text-secondary">Ongoing & Today's Bookings</h1>
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Manage arrivals, departures and current occupancy</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search guest or room..."
            className="pl-9 h-9 rounded-xl border-muted bg-white focus-visible:ring-primary/20 text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {bookingStats.map((stat) => (
          <Card key={stat.label} className="border-none shadow-sm rounded-xl overflow-hidden group">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</span>
                <div className={cn("p-1.5 rounded-lg transition-transform group-hover:scale-110", stat.bg, stat.color)}>
                  <stat.icon className="h-3.5 w-3.5" />
                </div>
              </div>
              <p className="text-2xl font-black">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-white mb-4">
        <div className="p-3 border-b border-muted/30 flex items-center justify-between">
          <div className="flex gap-2">
            <Button variant="ghost" className="rounded-lg h-8 px-3 font-bold text-[10px] bg-secondary text-white hover:bg-secondary/90 uppercase tracking-wider">All</Button>
            <Button variant="ghost" className="rounded-lg h-8 px-3 font-bold text-[10px] hover:bg-muted/50 uppercase tracking-wider">Arrivals</Button>
            <Button variant="ghost" className="rounded-lg h-8 px-3 font-bold text-[10px] hover:bg-muted/50 uppercase tracking-wider">Departures</Button>
          </div>
        </div>
        <div className="p-0 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/20 border-b border-muted/10">
                <th className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Guest Detail</th>
                <th className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Property/Room</th>
                <th className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Stay Period</th>
                <th className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</th>
                <th className="text-right py-3 px-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-muted/10">
              {[1, 2, 3, 4].map((i) => (
                <tr key={i} className="hover:bg-muted/5 transition-colors group">
                  <td className="py-2.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary font-black text-xs">
                        JD
                      </div>
                      <div className="space-y-0">
                        <p className="font-bold text-sm">John Doe</p>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase">+91 98765 43210</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5 px-4">
                    <div className="space-y-0.5">
                      <p className="font-bold text-sm">Beach House Pondy</p>
                      <p className="text-[9px] font-black text-primary uppercase bg-primary/5 inline-block px-1.5 py-0.5 rounded-md">Room 204</p>
                    </div>
                  </td>
                  <td className="py-2.5 px-4">
                    <div className="space-y-0.5">
                      <p className="font-bold text-sm flex items-center gap-2">
                        24 Dec <ArrowRight className="h-2.5 w-2.5 text-muted-foreground" /> 28 Dec
                      </p>
                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">4 Nights • 2 Guests</p>
                    </div>
                  </td>
                  <td className="py-2.5 px-4">
                    <Badge className={cn(
                      "text-[9px] font-black px-2.5 py-1 rounded-lg border-none",
                      i % 2 === 0 ? "bg-primary text-white" : "bg-muted text-secondary"
                    )}>
                      {i % 2 === 0 ? "ARRIVING" : "IN-HOUSE"}
                    </Badge>
                  </td>
                  <td className="p-6 text-right">
                    <Button variant="ghost" size="icon" className="rounded-xl group-hover:bg-white group-hover:shadow-sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </DashboardLayout>
  )
}
