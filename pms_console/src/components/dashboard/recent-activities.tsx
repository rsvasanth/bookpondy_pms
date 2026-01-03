"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Clock } from "lucide-react"

const activities = [
    {
        user: "Wade Warren",
        room: "#2747",
        action: "Room Request",
        time: "2 mins ago",
        avatar: "WW"
    },
    {
        user: "Esther Howard",
        room: "#3565",
        action: "Housekeeping",
        time: "15 mins ago",
        avatar: "EH"
    },
    {
        user: "Guy Hawkins",
        room: "#1208",
        action: "Checked In",
        time: "45 mins ago",
        avatar: "GH"
    },
    {
        user: "Leslie Alexander",
        room: "#4002",
        action: "New Booking",
        time: "1 hour ago",
        avatar: "LA"
    },
    {
        user: "Dianne Russell",
        room: "#2211",
        action: "Maintenance",
        time: "2 hours ago",
        avatar: "DR"
    }
]

export function RecentActivities() {
    return (
        <Card className="border-none shadow-sm h-full flex flex-col">
            <CardHeader>
                <CardTitle className="text-sm font-semibold">Recent Activities Feed</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0 px-6 pb-6">
                <ScrollArea className="h-[300px]">
                    <div className="space-y-6">
                        {activities.map((activity, i) => (
                            <div key={i} className="flex items-center gap-4">
                                <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                                    <AvatarFallback className="bg-muted text-xs font-semibold uppercase">{activity.avatar}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 space-y-0.5">
                                    <p className="text-sm font-semibold">
                                        {activity.user} <span className="text-muted-foreground font-medium">Room {activity.room}</span>
                                    </p>
                                    <p className="text-xs font-medium text-muted-foreground">
                                        {activity.action}
                                    </p>
                                </div>
                                <div className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground bg-muted p-1.5 rounded-md">
                                    <Clock className="h-3 w-3" />
                                    {activity.time}
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    )
}
