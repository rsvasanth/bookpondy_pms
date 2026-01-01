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
        <div className={cn("flex flex-col md:flex-row items-end gap-3 bg-card p-3 rounded-xl border border-border shadow-sm mb-4", className)}>

            <div className="flex flex-col gap-1 flex-1 w-full md:w-auto">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Search</Label>
                <div className="relative">
                    <Input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => onSearchChange?.(e.target.value)}
                        placeholder="Search Guest, Reservation ID..."
                        className="h-9 w-full rounded-lg bg-background border-input focus-visible:ring-brand-primary transition-all"
                    />
                </div>
            </div>

            <div className="flex flex-col gap-1 w-full md:w-auto">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Property</Label>
                <Select value={selectedProperty} onValueChange={onPropertyChange}>
                    <SelectTrigger className="h-9 w-full md:w-[200px] rounded-lg bg-background border-input focus:ring-brand-primary">
                        <SelectValue placeholder="All Properties" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL_PROPERTIES_SENTINEL">All Properties</SelectItem>
                        {properties.map((p) => (
                            <SelectItem key={p.name} value={p.name}>{p.property_name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="flex flex-col gap-1 w-full md:w-auto">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Date Range</Label>
                <Select value={selectedDateRange} onValueChange={onDateRangeChange}>
                    <SelectTrigger className="h-9 w-full md:w-[160px] rounded-lg bg-background border-input focus:ring-brand-primary">
                        <SelectValue placeholder="Select Range" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Today">Today</SelectItem>
                        <SelectItem value="This Week">This Week</SelectItem>
                        <SelectItem value="This Month">This Month</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="flex flex-col gap-1 w-full md:w-auto">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status</Label>
                <Select value={selectedStatus} onValueChange={onStatusChange}>
                    <SelectTrigger className="h-9 w-full md:w-[160px] rounded-lg bg-background border-input focus:ring-brand-primary">
                        <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All Status">All Status</SelectItem>
                        <SelectItem value="Confirmed">Confirmed</SelectItem>
                        <SelectItem value="Checked-In">Checked-In</SelectItem>
                        <SelectItem value="Checked-Out">Checked-Out</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                </Select>
            </div>

        </div>
    )
}
