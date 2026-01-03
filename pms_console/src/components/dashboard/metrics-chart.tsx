import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

const data = [
    { time: "00:00", p1: 400, p2: 240, p3: 310 },
    { time: "04:00", p1: 300, p2: 139, p3: 250 },
    { time: "08:00", p1: 200, p2: 980, p3: 420 },
    { time: "12:00", p1: 278, p2: 390, p3: 300 },
    { time: "16:00", p1: 189, p2: 480, p3: 410 },
    { time: "20:00", p1: 239, p2: 380, p3: 320 },
    { time: "23:59", p1: 349, p2: 430, p3: 380 },
]

export function MetricsChart() {
    return (
        <Card className="shadow-sm border-none bg-background/50 backdrop-blur-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between px-6 py-4 border-b border-border/50">
                <div className="grid gap-0.5">
                    <CardTitle className="text-sm font-semibold tracking-tight">Occupancy & Activity</CardTitle>
                    <CardDescription className="text-xs">Your activity levels are ahead of where you normally are.</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="h-8 text-[11px] font-medium px-3 rounded-lg border-muted">
                    <Download className="mr-2 h-3.5 w-3.5" /> Export
                </Button>
            </CardHeader>
            <CardContent className="px-2 pt-6 pb-2">
                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <XAxis
                                dataKey="time"
                                hide
                            />
                            <YAxis hide />
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="rounded-xl border bg-background/80 backdrop-blur-md p-3 shadow-xl text-[10px] space-y-1">
                                                {payload.map((p, i) => (
                                                    <div key={i} className="flex items-center gap-2">
                                                        <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: p.color }} />
                                                        <span className="font-bold">{p.value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )
                                    }
                                    return null
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="p1"
                                stroke="hsl(var(--chart-2))"
                                strokeWidth={2}
                                dot={false}
                                opacity={0.5}
                                activeDot={{ r: 4, strokeWidth: 0 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="p2"
                                stroke="hsl(var(--chart-3))"
                                strokeWidth={2}
                                dot={false}
                                opacity={0.7}
                                activeDot={{ r: 4, strokeWidth: 0 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="p3"
                                stroke="hsl(var(--chart-1))"
                                strokeWidth={2.5}
                                dot={false}
                                activeDot={{ r: 5, strokeWidth: 0, fill: "hsl(var(--chart-1))" }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
