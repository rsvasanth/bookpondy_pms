"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis } from "recharts"
import { TrendingUp } from "lucide-react"

export function RevenueTrend({ data = [], totalRevenue = 0 }: { data?: any[], totalRevenue?: number }) {
    const displayData = data.length > 0 ? data.map(d => ({ name: d.day, value: d.value })) : [
        { name: "M", value: 4000 },
        { name: "T", value: 3000 },
        { name: "W", value: 5000 },
        { name: "T", value: 4500 },
        { name: "F", value: 6000 },
        { name: "S", value: 5500 },
        { name: "S", value: 4800 },
    ]

    return (
        <Card className="border-none shadow-sm h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="space-y-1">
                    <CardTitle className="text-sm font-semibold">Revenue Trend (7d)</CardTitle>
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-bold">₹{totalRevenue.toLocaleString('en-IN')}</span>
                        <div className="flex items-center gap-1 text-xs font-semibold text-success">
                            <TrendingUp className="h-3.5 w-3.5" />
                            <span>+12%</span>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-[150px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={displayData}>
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fontWeight: 500, fill: 'hsl(var(--muted-foreground))' }}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="value"
                                stroke="hsl(var(--chart-1))"
                                strokeWidth={3}
                                dot={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
