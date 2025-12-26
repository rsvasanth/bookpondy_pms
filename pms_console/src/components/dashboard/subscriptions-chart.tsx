import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, ResponsiveContainer, Tooltip, Cell } from "recharts"

const data = [
    { value: 240 },
    { value: 300 },
    { value: 200 },
    { value: 278 },
    { value: 189 },
    { value: 239 },
    { value: 278 },
    { value: 189 },
]

export function SubscriptionsChart() {
    return (
        <Card className="shadow-sm border-none bg-background/50 backdrop-blur-sm overflow-hidden group">
            <CardHeader className="pb-2 px-6 pt-6">
                <CardTitle className="text-xs font-semibold tracking-tight text-muted-foreground/70 uppercase">Subscriptions</CardTitle>
                <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold tracking-tight">+4850</span>
                    <span className="text-[10px] font-bold text-emerald-500">+180.1% from last month</span>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="h-[100px] mt-4 px-4 pb-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <Tooltip
                                cursor={{ fill: 'hsl(var(--muted))', opacity: 0.1 }}
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="rounded-lg border bg-background px-2 py-1 shadow-sm text-[10px] font-bold">
                                                {payload[0].value}
                                            </div>
                                        )
                                    }
                                    return null
                                }}
                            />
                            <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                                {data.map((_, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={index === 1 ? "hsl(var(--primary))" : "black"}
                                        className="transition-all duration-300 hover:opacity-80"
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
