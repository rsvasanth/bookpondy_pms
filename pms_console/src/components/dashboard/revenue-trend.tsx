"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis } from "recharts"
import { TrendingUp } from "lucide-react"

const data = [
    { name: "M", value: 4000 },
    { name: "T", value: 3000 },
    { name: "W", value: 5000 },
    { name: "T", value: 4500 },
    { name: "F", value: 6000 },
    { name: "S", value: 5500 },
    { name: "S", value: 4800 },
]

export function RevenueTrend() {
    return (
        <Card className="border-none shadow-sm h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="space-y-1">
                    <CardTitle className="text-sm font-bold">Revenue Stat</CardTitle>
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-bold">$12,480</span>
                        <div className="flex items-center gap-1 text-[11px] font-bold text-green-600">
                            <TrendingUp className="h-3 w-3" />
                            <span>+16%</span>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-[150px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="value"
                                stroke="#D81B60"
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
