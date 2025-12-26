"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp } from "lucide-react"

const data = [
    { name: "Mon", booked: 40, visited: 80 },
    { name: "Tue", booked: 30, visited: 70 },
    { name: "Wed", booked: 50, visited: 90 },
    { name: "Thu", booked: 45, visited: 85 },
    { name: "Fri", booked: 60, visited: 110 },
    { name: "Sat", booked: 55, visited: 100 },
    { name: "Sun", booked: 40, visited: 75 },
]

export function CampaignOverview() {
    return (
        <Card className="border-none shadow-sm h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="space-y-1">
                    <CardTitle className="text-sm font-bold">Campaign Overview</CardTitle>
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-green-600">
                        <TrendingUp className="h-3 w-3" />
                        <span>+12% performance vs last week</span>
                    </div>
                </div>
                <Select defaultValue="this-week">
                    <SelectTrigger className="h-8 w-[110px] text-xs rounded-xl">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                        <SelectItem value="this-week">This Week</SelectItem>
                        <SelectItem value="last-week">Last Week</SelectItem>
                    </SelectContent>
                </Select>
            </CardHeader>
            <CardContent>
                <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }}
                            />
                            <YAxis hide />
                            <Tooltip
                                cursor={{ fill: 'transparent' }}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            />
                            <Legend
                                verticalAlign="top"
                                align="right"
                                iconType="circle"
                                wrapperStyle={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', paddingBottom: 20 }}
                            />
                            <Bar dataKey="booked" fill="#00A79D" radius={[4, 4, 0, 0]} barSize={12} name="Booked (290)" />
                            <Bar dataKey="visited" fill="#F57F17" radius={[4, 4, 0, 0]} barSize={12} name="Visited (638)" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
