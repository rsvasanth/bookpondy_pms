import { format, eachDayOfInterval, startOfMonth, endOfMonth, isToday } from "date-fns"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface UnitCategoryCalendarProps {
    categoryId?: string
    totalUnits: number
    occupancyData: Record<string, number> // Date string -> Count
}

export function UnitCategoryCalendar({ totalUnits, occupancyData }: UnitCategoryCalendarProps) {
    const todayDate = new Date()
    const currentMonthStart = startOfMonth(todayDate)
    const currentMonthEnd = endOfMonth(todayDate)

    // Generate days for the grid
    const days = eachDayOfInterval({
        start: currentMonthStart,
        end: currentMonthEnd
    })

    const getOccupancyStatus = (dateStr: string) => {
        const booked = occupancyData?.[dateStr] || 0
        if (totalUnits === 0) return "unavailable"
        if (booked >= totalUnits) return "full"
        if (booked > 0) return "partial"
        return "available"
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "full": return "bg-red-500" // Sold Out
            case "partial": return "bg-orange-400" // Limited
            case "available": return "bg-green-500" // Open
            default: return "bg-gray-200"
        }
    }

    return (
        <div className="flex flex-col gap-2 p-3 rounded-2xl bg-gray-50/50 border border-gray-100/50 w-[200px]">
            <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    {format(todayDate, "MMMM yyyy")}
                </span>
                <div className="flex gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500" title="Available" />
                    <div className="h-1.5 w-1.5 rounded-full bg-orange-400" title="Filling" />
                    <div className="h-1.5 w-1.5 rounded-full bg-red-500" title="Sold Out" />
                </div>
            </div>

            <div className="grid grid-cols-7 gap-1.5 mt-1">
                {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                    <div key={i} className="text-[8px] font-bold text-center text-gray-300">
                        {d}
                    </div>
                ))}

                {/* Empty slots for start of month alignment could be added here, but user asked for simple circle visual. 
                    Let's just show the days. If alignment matters we need getDay(startOfMonth) spacers. 
                    For a mini-viz, strict calendar layout is better. */}
                {Array.from({ length: currentMonthStart.getDay() }).map((_, i) => (
                    <div key={`empty-${i}`} />
                ))}

                {days.map((day) => {
                    const dateStr = format(day, "yyyy-MM-dd")
                    const status = getOccupancyStatus(dateStr)
                    const bookedCount = occupancyData?.[dateStr] || 0
                    const availableCount = Math.max(0, totalUnits - bookedCount)

                    return (
                        <TooltipProvider key={dateStr}>
                            <Tooltip delayDuration={0}>
                                <TooltipTrigger asChild>
                                    <div className={cn(
                                        "h-4 w-4 rounded-full flex items-center justify-center transition-all cursor-default",
                                        isToday(day) && "ring-1 ring-offset-1 ring-blue-500",
                                        "hover:scale-125 hover:shadow-sm"
                                    )}>
                                        <div className={cn(
                                            "h-1.5 w-1.5 rounded-full transition-colors",
                                            getStatusColor(status)
                                        )} />
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent className="text-[10px] font-bold" side="top">
                                    <p>{format(day, "MMM d")}</p>
                                    <p className={cn(
                                        availableCount === 0 ? "text-red-500" : "text-green-600"
                                    )}>
                                        {availableCount} / {totalUnits} left
                                    </p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )
                })}
            </div>
        </div>
    )
}
