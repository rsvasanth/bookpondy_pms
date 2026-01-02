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
  FileText,
  Banknote,
  Package
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
import { useLocalDocList } from "@/hooks/use-local-data"
import { useAuthStore } from "@/stores/authStore"

const mainNavItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, roles: ["Administrator", "Manager", "Front Desk", "Housekeeping"] },
  { href: "/bookings", label: "Bookings", icon: CalendarDays, roles: ["Administrator", "Manager", "Front Desk"] },
  { href: "/scheduler", label: "Scheduler", icon: CalendarDays, roles: ["Administrator", "Manager", "Front Desk"] },
  { href: "/housekeeping", label: "Housekeeping", icon: ClipboardList, roles: ["Administrator", "Manager", "Front Desk", "Housekeeping"] },
  { href: "/maintenance", label: "Maintenance", icon: Wrench, roles: ["Administrator", "Manager", "Front Desk", "Housekeeping"] },
  { href: "/billing", label: "Billing & Payments", icon: Receipt, roles: ["Administrator", "Manager", "Front Desk"] },
  { href: "/channels", label: "Channels & WhatsApp", icon: MessageSquare, roles: ["Administrator", "Manager", "Front Desk"] },
  { href: "/communications", label: "Guest Chat", icon: MessageSquare, roles: ["Administrator", "Manager", "Front Desk"] },
  { href: "/tasks", label: "Operational Tasks", icon: ClipboardList, roles: ["Administrator", "Manager", "Housekeeping", "Front Desk"] },
]

const managementNavItems = [
  { href: "/properties", label: "Properties", icon: Building2, roles: ["Administrator", "Manager", "Front Desk"] },
  { href: "/guests", label: "Guests", icon: Users, roles: ["Administrator", "Manager", "Front Desk"] },
  { href: "/staff", label: "Staff", icon: UsersRound, roles: ["Administrator", "Manager", "Front Desk"] },
  { href: "/financials", label: "Financials", icon: FileText, roles: ["Administrator", "Manager", "Front Desk"] },
  { href: "/invoices", label: "Invoices", icon: Receipt, roles: ["Administrator", "Manager", "Front Desk"] },
  { href: "/rates", label: "Rates & Pricing", icon: Banknote, roles: ["Administrator", "Manager", "Front Desk"] },
  { href: "/inventory", label: "Inventory", icon: Package, roles: ["Administrator", "Manager", "Front Desk"] },
]

const reportsNavItems = [
  { href: "/reports", label: "Reports", icon: BarChart3, roles: ["Administrator", "Manager", "Front Desk"] },
  { href: "/reviews", label: "Reviews", icon: Star, roles: ["Administrator", "Manager", "Front Desk"] },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { pathname } = useLocation()
  const { currentUser, logout } = useFrappeAuth()
  const { user } = useAuthStore()

  const { data: propertiesList } = useLocalDocList("Property")
  const { data: portfoliosList } = useFrappeGetDocList("Property Portfolio", {
    fields: ["name", "portfolio_name"],
    limit: 100
  })

  // Set initial property when list loads
  const [selectedProperty, setSelectedProperty] = React.useState<{ name: string, property_name: string } | null>(null)
  const [selectedPortfolio, setSelectedPortfolio] = React.useState<string>("")

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

  // Default to Front Desk if role is undefined, or Admin if name is Administrator
  const currentRole = user?.role || (currentUser === "Administrator" ? "Administrator" : "Front Desk")

  const filterItems = (items: any[]) => {
    return items.filter(item => !item.roles || item.roles.includes(currentRole))
  }

  const filteredMainNav = filterItems(mainNavItems)
  const filteredManagementNav = filterItems(managementNavItems)
  const filteredReportsNav = filterItems(reportsNavItems)

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
        {filteredMainNav.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Overview</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredMainNav.map((item) => {
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
        )}

        <SidebarSeparator />

        {filteredManagementNav.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Management</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredManagementNav.map((item) => {
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
        )}

        <SidebarSeparator />

        {filteredReportsNav.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Analytics & Reports</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredReportsNav.map((item) => {
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
        )}

        {["Administrator", "Manager", "Front Desk"].includes(currentRole) && (
          <>
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
          </>
        )}

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
                    <span className="truncate text-xs">{currentRole}</span>
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
                      <span className="truncate text-xs">{currentRole}</span>
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
