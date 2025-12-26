"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

const data = [
    { name: "Confirmed", value: 45, color: "#00A79D" },
    { name: "Checked In", value: 35, color: "#2E7D32" },
    { name: "Checked Out", value: 20, color: "#D81B60" },
]

export function ReservationsDonut() {
    return (
        <Card className="flex flex-col border-none shadow-sm h-full">
            <CardHeader className="items-center pb-0">
                <CardTitle className="text-sm font-bold">Reservations</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <div className="relative h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            />
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold">362</span>
                        <span className="text-[10px] text-muted-foreground uppercase font-bold">Total</span>
                    </div>
                </div>
                <div className="flex justify-center gap-4 pb-4">
                    {data.map((item) => (
                        <div key={item.name} className="flex items-center gap-1.5">
                            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">{item.name}</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
