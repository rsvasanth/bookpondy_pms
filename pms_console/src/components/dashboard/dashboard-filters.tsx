"use client"


import { cn } from "@/lib/utils"

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
        <div className={cn("flex flex-col md:flex-row items-end gap-3 bg-white p-3 rounded-xl border border-slate-100 shadow-sm mb-4", className)}>

            <div className="flex flex-col gap-1 flex-1 w-full md:w-auto">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280]">Search</label>
                <div className="relative">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => onSearchChange?.(e.target.value)}
                        placeholder="Search Guest, Reservation ID..."
                        className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-[#0f0f14] focus:outline-none focus:ring-2 focus:ring-[#ff3924]/20 focus:border-[#ff3924] transition-all"
                    />
                </div>
            </div>

            <div className="flex flex-col gap-1 w-full md:w-auto">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280]">Property</label>
                <select
                    value={selectedProperty}
                    onChange={(e) => onPropertyChange?.(e.target.value)}
                    className="h-9 w-full md:w-[200px] appearance-none rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-[#0f0f14] focus:outline-none focus:ring-2 focus:ring-[#ff3924]/20 focus:border-[#ff3924] transition-all cursor-pointer"
                >
                    <option value="">All Properties</option>
                    {properties.map((p) => (
                        <option key={p.name} value={p.name}>{p.property_name}</option>
                    ))}
                </select>
            </div>

            <div className="flex flex-col gap-1 w-full md:w-auto">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280]">Date Range</label>
                <select
                    value={selectedDateRange}
                    onChange={(e) => onDateRangeChange?.(e.target.value)}
                    className="h-9 w-full md:w-[160px] appearance-none rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-[#0f0f14] focus:outline-none focus:ring-2 focus:ring-[#ff3924]/20 focus:border-[#ff3924] transition-all cursor-pointer"
                >
                    <option value="Today">Today</option>
                    <option value="This Week">This Week</option>
                    <option value="This Month">This Month</option>
                </select>
            </div>

            <div className="flex flex-col gap-1 w-full md:w-auto">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280]">Status</label>
                <select
                    value={selectedStatus}
                    onChange={(e) => onStatusChange?.(e.target.value)}
                    className="h-9 w-full md:w-[160px] appearance-none rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-[#0f0f14] focus:outline-none focus:ring-2 focus:ring-[#ff3924]/20 focus:border-[#ff3924] transition-all cursor-pointer"
                >
                    <option value="All Status">All Status</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Checked-In">Checked-In</option>
                    <option value="Checked-Out">Checked-Out</option>
                    <option value="Cancelled">Cancelled</option>
                </select>
            </div>

        </div>
    )
}
