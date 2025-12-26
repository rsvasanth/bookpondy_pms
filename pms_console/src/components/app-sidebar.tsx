"use client"

import * as React from "react"
import { Link, useLocation } from "react-router-dom"
import {
  LayoutDashboard,
  Building2,
  CalendarDays,
  Users,
  MessageSquare,
  Star,
  Wrench,
  UsersRound,
  BarChart3,
  Settings,
  ChevronUp,
  ClipboardList,
  Receipt,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useFrappeAuth, useFrappeGetDocList } from "frappe-react-sdk"
// import BrandLogo from "./brand-logo" // Removed per user request

const mainNavItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/bookings", label: "Bookings", icon: CalendarDays },
  { href: "/housekeeping", label: "Housekeeping", icon: ClipboardList },
  { href: "/maintenance", label: "Maintenance", icon: Wrench },
  { href: "/billing", label: "Billing & Payments", icon: Receipt },
  { href: "/channels", label: "Channels & WhatsApp", icon: MessageSquare },
]

const managementNavItems = [
  { href: "/properties", label: "Properties", icon: Building2 },
  { href: "/guests", label: "Guests", icon: Users },
  { href: "/staff", label: "Staff", icon: UsersRound },
]

const reportsNavItems = [
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/reviews", label: "Reviews", icon: Star },
]



export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { pathname } = useLocation()
  const { currentUser, logout } = useFrappeAuth()

  const { data: propertiesList } = useFrappeGetDocList("Property", {
    fields: ["name", "property_name", "city"],
    limit: 100
  })

  // Set initial property when list loads
  const [selectedProperty, setSelectedProperty] = React.useState<{ name: string, property_name: string, city: string } | null>(null)
  const [selectedPortfolio, setSelectedPortfolio] = React.useState<string>("")

  const { data: portfoliosList } = useFrappeGetDocList("Property Portfolio", {
    fields: ["name", "portfolio_name"],
    limit: 100
  })

  React.useEffect(() => {
    if (propertiesList && propertiesList.length > 0 && !selectedProperty) {
      setSelectedProperty(propertiesList[0])
    }
    if (portfoliosList && portfoliosList.length > 0 && !selectedPortfolio) {
      setSelectedPortfolio(portfoliosList[0].name)
    }
  }, [propertiesList, selectedProperty, portfoliosList, selectedPortfolio])

  const userDisplayName = currentUser || "Administrator"
  const userInitials = userDisplayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="h-16 flex items-center border-b px-4 shrink-0 bg-transparent group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center">
        <div className="w-full flex justify-center">
          <Select value={selectedPortfolio} onValueChange={setSelectedPortfolio}>
            <SelectTrigger
              className="w-full h-10 rounded-xl border-muted bg-muted/30 focus:ring-primary/20 hover:bg-muted/40 transition-all font-bold text-foreground px-4 group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:border-none group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:[&>svg:last-child]:hidden"
            >
              <div className="flex-1 flex items-center gap-2.5 min-w-0 group-data-[collapsible=icon]:hidden">
                <Building2 className="h-4 w-4 text-primary shrink-0" />
                <SelectValue placeholder="Select" className="text-sm truncate" />
              </div>
              <div className="hidden group-data-[collapsible=icon]:flex items-center justify-center h-10 w-10 rounded-xl bg-primary/10 border border-primary/20">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-xl border-muted shadow-xl">
              {portfoliosList?.map((portfolio) => (
                <SelectItem key={portfolio.name} value={portfolio.name} className="rounded-lg py-2.5 font-medium">
                  {portfolio.portfolio_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Overview</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
                      <Link to={item.href}>
                        <item.icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {managementNavItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href)
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
                      <Link to={item.href}>
                        <item.icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Analytics & Reports</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {reportsNavItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href)
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
                      <Link to={item.href}>
                        <item.icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/settings" || pathname.startsWith("/settings")}
                  tooltip="Settings"
                >
                  <Link to="/settings">
                    <Settings />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src="/placeholder-user.jpg" alt={userDisplayName} />
                    <AvatarFallback className="rounded-lg">{userInitials}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{userDisplayName}</span>
                    <span className="truncate text-xs">Property Owner</span>
                  </div>
                  <ChevronUp className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                side="top"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage src="/placeholder-user.jpg" alt={userDisplayName} />
                      <AvatarFallback className="rounded-lg">{userInitials}</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">{userDisplayName}</span>
                      <span className="truncate text-xs">{currentUser}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Account Settings</DropdownMenuItem>
                <DropdownMenuItem>Billing</DropdownMenuItem>
                <DropdownMenuItem>Notifications</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout()}>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
