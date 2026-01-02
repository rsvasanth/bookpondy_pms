"use client"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export interface DashboardFiltersProps {
    className?: string
    properties?: any[]
    selectedProperty?: string
    onPropertyChange?: (value: string) => void
    selectedDateRange?: string
    onDateRangeChange?: (value: string) => void
    selectedStatus?: string
    onStatusChange?: (value: string) => void
    searchTerm?: string
    onSearchChange?: (value: string) => void
}

export function DashboardFilters({
    className,
    properties = [],
    selectedProperty = "",
    onPropertyChange,
    selectedDateRange = "This Month",
    onDateRangeChange,
    selectedStatus = "All Status",
    onStatusChange,
    searchTerm = "",
    onSearchChange
}: DashboardFiltersProps) {
    return (
        <div className={cn("flex flex-col md:flex-row items-end gap-3 bg-card/40 backdrop-blur-md p-3 rounded-xl border border-border/50 shadow-sm mb-4", className)}>

            <div className="flex flex-col gap-1.5 flex-1 w-full md:w-auto">
                <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Search Analytics</Label>
                <div className="relative group">
                    <Input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => onSearchChange?.(e.target.value)}
                        placeholder="GUEST, REF ID, UNIT..."
                        className="h-8 w-full rounded-md bg-background/50 border-border/50 focus-visible:ring-primary/20 text-[10px] font-bold uppercase tracking-widest placeholder:text-muted-foreground/40 transition-all pl-3"
                    />
                </div>
            </div>

            <div className="flex flex-col gap-1.5 w-full md:w-auto">
                <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Property</Label>
                <Select value={selectedProperty} onValueChange={onPropertyChange}>
                    <SelectTrigger className="h-8 w-full md:w-[180px] rounded-md bg-background/50 border-border/50 focus:ring-primary/20 text-[10px] font-bold uppercase tracking-wider">
                        <SelectValue placeholder="ALL PROPERTIES" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover/90 backdrop-blur-lg border-border/50">
                        <SelectItem value="ALL_PROPERTIES_SENTINEL" className="text-[10px] font-bold uppercase tracking-wider">ALL PROPERTIES</SelectItem>
                        {properties.map((p) => (
                            <SelectItem key={p.name} value={p.name} className="text-[10px] font-bold uppercase tracking-wider">{p.property_name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="flex flex-col gap-1.5 w-full md:w-auto">
                <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Timeline</Label>
                <Select value={selectedDateRange} onValueChange={onDateRangeChange}>
                    <SelectTrigger className="h-8 w-full md:w-[140px] rounded-md bg-background/50 border-border/50 focus:ring-primary/20 text-[10px] font-bold uppercase tracking-wider">
                        <SelectValue placeholder="SELECT RANGE" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover/90 backdrop-blur-lg border-border/50">
                        <SelectItem value="Today" className="text-[10px] font-bold uppercase tracking-wider">TODAY</SelectItem>
                        <SelectItem value="This Week" className="text-[10px] font-bold uppercase tracking-wider">THIS WEEK</SelectItem>
                        <SelectItem value="This Month" className="text-[10px] font-bold uppercase tracking-wider">THIS MONTH</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="flex flex-col gap-1.5 w-full md:w-auto">
                <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Status</Label>
                <Select value={selectedStatus} onValueChange={onStatusChange}>
                    <SelectTrigger className="h-8 w-full md:w-[140px] rounded-md bg-background/50 border-border/50 focus:ring-primary/20 text-[10px] font-bold uppercase tracking-wider">
                        <SelectValue placeholder="STATUS" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover/90 backdrop-blur-lg border-border/50">
                        <SelectItem value="All Status" className="text-[10px] font-bold uppercase tracking-wider">ALL STATUS</SelectItem>
                        <SelectItem value="Confirmed" className="text-[10px] font-bold uppercase tracking-wider">CONFIRMED</SelectItem>
                        <SelectItem value="Checked-In" className="text-[10px] font-bold uppercase tracking-wider">CHECKED-IN</SelectItem>
                        <SelectItem value="Checked-Out" className="text-[10px] font-bold uppercase tracking-wider">CHECKED-OUT</SelectItem>
                        <SelectItem value="Cancelled" className="text-[10px] font-bold uppercase tracking-wider">CANCELLED</SelectItem>
                    </SelectContent>
                </Select>
            </div>

        </div>
    )
}
