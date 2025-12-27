"use client"

import React from "react"
import { useTheme } from "next-themes"
import { Search, Bell, Sun, Moon, User, LogOut, Clock, Plus, UserPlus, Brush, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { useFrappeAuth } from "frappe-react-sdk"
import { useIsTablet } from "@/hooks/use-mobile"
import { useLocation } from "react-router-dom"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { theme, setTheme } = useTheme()
  const { currentUser, logout } = useFrappeAuth()
  const [now, setNow] = React.useState(new Date())
  const location = useLocation()

  React.useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  const formattedDate = now.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  })
  const formattedTime = now.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit'
  })

  const isTablet = useIsTablet()
  const isSchedulerPage = location.pathname === "/scheduler"

  return (
    <SidebarProvider defaultOpen={!isTablet}>
      <AppSidebar />
      <SidebarInset>
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />

          {/* Clock/Date - visible on desktop */}
          <div className="hidden md:flex items-center ml-2 border border-muted bg-muted/20 px-3 py-1.5 rounded-xl">
            <Clock className="h-3.5 w-3.5 text-primary mr-2" />
            <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              <span className="bg-slate-100 px-1.5 rounded text-slate-600">📅 {formattedDate}</span>
              <span className="opacity-30">•</span>
              <span className="text-foreground">{formattedTime}</span>
            </div>
          </div>

          {/* Search */}
          <div className="ml-auto relative w-full max-w-sm mr-4 hidden sm:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search bookings, guests, properties..."
              className="pl-9 h-10 border-none bg-muted/50 rounded-xl focus-visible:ring-primary"
            />
          </div>

          {/* Quick Actions - Moving from Dashboard.tsx */}
          <div className="hidden xl:flex items-center gap-2 mr-4">
            <Button className="h-8 px-3 bg-[#ff3924] hover:bg-[#d6301e] text-white font-bold rounded-lg text-[10px] tracking-wide uppercase shadow-md transition-all hover:translate-y-[-1px]">
              <Plus className="h-3.5 w-3.5 mr-1" /> Booking
            </Button>
            <Button variant="secondary" className="h-8 px-3 bg-[#f8f9fa] hover:bg-slate-100 text-slate-700 font-bold rounded-lg text-[10px] tracking-wide uppercase border border-slate-200 shadow-sm transition-all">
              <UserPlus className="h-3.5 w-3.5 mr-1 text-slate-400" /> Guest
            </Button>
            <Button variant="secondary" className="h-8 px-3 bg-[#f8f9fa] hover:bg-slate-100 text-slate-700 font-bold rounded-lg text-[10px] tracking-wide uppercase border border-slate-200 shadow-sm transition-all">
              <Brush className="h-3.5 w-3.5 mr-1 text-slate-400" /> Task
            </Button>
            <Button variant="secondary" className="h-8 px-3 bg-[#f8f9fa] hover:bg-slate-100 text-slate-700 font-bold rounded-lg text-[10px] tracking-wide uppercase border border-slate-200 shadow-sm transition-all">
              <FileText className="h-3.5 w-3.5 mr-1 text-slate-400" /> Folio
            </Button>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs">5</Badge>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-80 overflow-auto">
                  <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
                    <span className="font-medium">New booking received</span>
                    <span className="text-xs text-muted-foreground">Ocean View Villa - Check-in Dec 20</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
                    <span className="font-medium">Payment received</span>
                    <span className="text-xs text-muted-foreground">Rs 25,000 from Rajesh Kumar</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
                    <span className="font-medium">New review posted</span>
                    <span className="text-xs text-muted-foreground">5 stars for Beach House Resort</span>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Profile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full bg-muted/50 overflow-hidden border">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-bold leading-none">{currentUser || "Administrator"}</p>
                    <p className="text-xs leading-none text-muted-foreground">Property Owner</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="rounded-lg gap-2">
                  <User className="h-4 w-4" /> Account Settings
                </DropdownMenuItem>
                <DropdownMenuItem className="rounded-lg gap-2 text-destructive focus:text-destructive focus:bg-destructive/10" onClick={() => logout()}>
                  <LogOut className="h-4 w-4" /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main Content */}
        <main className={`flex-1 ${isSchedulerPage ? 'p-3' : 'p-4'}`}>{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
