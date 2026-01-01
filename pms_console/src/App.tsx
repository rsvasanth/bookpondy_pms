import { ThemeProvider } from "@/components/theme-provider"
import DashboardPage from "@/pages/Dashboard"
import PropertiesPage from "@/pages/Properties"
import BookingsPage from "@/pages/Bookings"
import CreateBookingPage from "@/pages/CreateBooking"
import BookingDetailsPage from "@/pages/BookingDetails"
import GuestsPage from "@/pages/Guests"
import StaffPage from "@/pages/Staff"
import CommunicationsPage from "@/pages/Communications"
import FinancialsPage from "@/pages/Financials"
import InvoicesPage from "@/pages/Invoices"
import ChannelsPage from "@/pages/Channels"
import ReviewsPage from "@/pages/Reviews"
import ReportsPage from "@/pages/Reports"
import SettingsPage from "@/pages/Settings"
import LoginPage from "@/pages/Login"
import HousekeepingPage from "@/pages/Housekeeping"
import BillingPage from "@/pages/Billing"
import MaintenancePage from "@/pages/Maintenance"
import SchedulerPage from "@/pages/Scheduler"
import TasksPage from "@/pages/Tasks"
import RatesPage from "@/pages/Rates"
import InventoryPage from "@/pages/Inventory"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { FrappeProvider, useFrappeAuth } from "frappe-react-sdk"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { SyncProvider } from "@/providers/SyncProvider"
import { useAuthStore } from "@/stores/authStore"
import { RoleGuard } from "@/components/role-guard"
import { useRealtime } from "@/hooks/use-realtime"
import { AppLayout } from "@/components/layout/AppLayout"

function ProtectedRoute({ children }: { children?: React.ReactNode }) {
	const { currentUser, isLoading, error } = useFrappeAuth()
	const { user: persistedUser, isAuthenticated } = useAuthStore()

	// Optimization: If we have a persisted user, we allow rendering even if authentication is still loading
	// over the network. This provides an "instant" feel and avoids hangs.
	const isUserLoggedIn = currentUser || persistedUser || (error && isAuthenticated)

	if (isLoading && !persistedUser) {
		return (
			<div className="flex h-screen items-center justify-center bg-background">
				<div className="flex flex-col items-center gap-4">
					<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
					<p className="text-sm font-medium animate-pulse">Checking authentication...</p>
				</div>
			</div>
		)
	}

	if (!isUserLoggedIn) {
		return <Navigate to="/login" replace />
	}

	return children ? children : <Outlet />
}

function App() {
	useRealtime();
	return (
		<FrappeProvider
			socketPort={import.meta.env.VITE_SOCKET_PORT}
			siteName={import.meta.env.VITE_SITE_NAME}
		>
			<ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
				<TooltipProvider>
					<SyncProvider>
						<BrowserRouter>
							<Routes>
								<Route path="/login" element={<LoginPage />} />
								<Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
									<Route path="/" element={<DashboardPage />} />
									<Route path="/properties" element={<PropertiesPage />} />
									<Route path="/bookings" element={<BookingsPage />} />
									<Route path="/bookings/new" element={<CreateBookingPage />} />
									<Route path="/bookings/:id" element={<BookingDetailsPage />} />
									<Route path="/scheduler" element={<SchedulerPage />} />
									<Route path="/guests" element={<GuestsPage />} />
									<Route
										path="/staff"
										element={
											<RoleGuard allowedRoles={['Administrator', 'Manager', 'Front Desk']}>
												<StaffPage />
											</RoleGuard>
										}
									/>
									<Route path="/communications" element={<CommunicationsPage />} />
									<Route
										path="/financials"
										element={
											<RoleGuard allowedRoles={['Administrator', 'Manager', 'Front Desk']}>
												<FinancialsPage />
											</RoleGuard>
										}
									/>
									<Route
										path="/invoices"
										element={
											<RoleGuard allowedRoles={['Administrator', 'Manager', 'Front Desk']}>
												<InvoicesPage />
											</RoleGuard>
										}
									/>
									<Route
										path="/channels"
										element={
											<RoleGuard allowedRoles={['Administrator', 'Manager', 'Front Desk']}>
												<ChannelsPage />
											</RoleGuard>
										}
									/>
									<Route path="/reviews" element={<ReviewsPage />} />
									<Route path="/maintenance" element={<MaintenancePage />} />
									<Route path="/housekeeping" element={<HousekeepingPage />} />
									<Route path="/billing" element={<BillingPage />} />
									<Route
										path="/reports"
										element={
											<RoleGuard allowedRoles={['Administrator', 'Manager', 'Front Desk']}>
												<ReportsPage />
											</RoleGuard>
										}
									/>
									<Route path="/tasks" element={<TasksPage />} />
									<Route
										path="/rates"
										element={
											<RoleGuard allowedRoles={['Administrator', 'Manager', 'Front Desk']}>
												<RatesPage />
											</RoleGuard>
										}
									/>
									<Route
										path="/inventory"
										element={
											<RoleGuard allowedRoles={['Administrator', 'Manager', 'Front Desk']}>
												<InventoryPage />
											</RoleGuard>
										}
									/>
									<Route
										path="/settings"
										element={
											<RoleGuard allowedRoles={['Administrator', 'Manager', 'Front Desk']}>
												<SettingsPage />
											</RoleGuard>
										}
									/>
								</Route>
							</Routes>
						</BrowserRouter>
					</SyncProvider>
				</TooltipProvider>
				<Toaster richColors position="top-right" />
			</ThemeProvider>
		</FrappeProvider>
	)
}

export default App
