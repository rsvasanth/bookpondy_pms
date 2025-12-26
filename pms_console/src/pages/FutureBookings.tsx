"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    TrendingUp,
    Users,
    IndianRupee,
    Calendar,
    Download,
    Percent
} from "lucide-react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"

export default function FutureBookingsPage() {
    return (
        <DashboardLayout>
            <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-xl font-black tracking-tight text-secondary">Future Bookings & Revenue Forecast</h1>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Predict occupancy and plan arrivals</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="rounded-lg font-bold text-[10px] uppercase gap-1.5 border-muted h-8 text-secondary">
                        <Download className="h-3.5 w-3.5" /> Export
                    </Button>
                    <Button className="bg-primary hover:bg-primary/90 text-white rounded-lg h-8 px-4 font-bold text-[10px] uppercase gap-1.5 shadow-sm">
                        <Calendar className="h-3.5 w-3.5" /> Map View
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                <Card className="border-none shadow-sm rounded-xl bg-secondary/5">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-secondary opacity-60">Future Bookings</span>
                            <Calendar className="h-3.5 w-3.5 text-secondary" />
                        </div>
                        <p className="text-2xl font-black text-secondary">214</p>
                        <p className="text-[9px] font-bold text-secondary mt-0.5 tracking-tight uppercase">Confirmed 30d</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm rounded-xl bg-muted/50">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-secondary opacity-60">Avg Occupancy</span>
                            <Percent className="h-3.5 w-3.5 text-secondary" />
                        </div>
                        <p className="text-2xl font-black text-secondary">76%</p>
                        <p className="text-[9px] font-bold text-primary mt-0.5 flex items-center gap-1 uppercase">
                            <TrendingUp className="h-2.5 w-2.5" /> +14% YoY
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm rounded-xl bg-muted/50">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-secondary opacity-60">Next 7 Days</span>
                            <Users className="h-3.5 w-3.5 text-secondary" />
                        </div>
                        <p className="text-2xl font-black text-secondary">42</p>
                        <p className="text-[9px] font-bold text-secondary mt-0.5 uppercase">Expected arrivals</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm rounded-xl bg-primary/5">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Projected Rev.</span>
                            <IndianRupee className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <p className="text-2xl font-black text-primary">₹14.2L</p>
                        <p className="text-[9px] font-bold text-primary/60 mt-0.5 uppercase tracking-tighter">Jan 2026 Forecast</p>
                    </CardContent>
                </Card>
            </div>

            <div className="bg-white rounded-2xl border border-muted shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-black text-base text-secondary">Advanced Occupancy Map</h2>
                    <div className="flex gap-1.5">
                        <Button variant="ghost" size="sm" className="h-7 rounded-md font-bold text-[9px] uppercase bg-muted/50 text-secondary">Day</Button>
                        <Button variant="ghost" size="sm" className="h-7 rounded-md font-bold text-[9px] uppercase bg-muted/50 text-secondary">Week</Button>
                        <Button variant="ghost" size="sm" className="h-7 rounded-md font-bold text-[9px] uppercase bg-secondary text-white shadow-sm">Month</Button>
                    </div>
                </div>

                <div className="flex items-center justify-center h-[350px] border-2 border-dashed border-muted rounded-xl bg-muted/10">
                    <div className="text-center space-y-3">
                        <Calendar className="h-12 w-12 text-secondary mx-auto opacity-10" />
                        <p className="text-sm font-black text-secondary/40">Occupancy Map Visualization</p>
                        <p className="text-[10px] text-secondary/30 uppercase tracking-widest font-black">Sync with property units</p>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
