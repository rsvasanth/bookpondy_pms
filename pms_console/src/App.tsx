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
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { FrappeProvider, useFrappeAuth } from "frappe-react-sdk"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { SyncProvider } from "@/providers/SyncProvider"
import { useAuthStore } from "@/stores/authStore"
import { RoleGuard } from "@/components/role-guard"
import './globals.css'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
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

	return children
}

function App() {
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
								<Route
									path="/"
									element={
										<ProtectedRoute>
											<DashboardPage />
										</ProtectedRoute>
									}
								/>
								<Route
									path="/properties"
									element={
										<ProtectedRoute>
											<PropertiesPage />
										</ProtectedRoute>
									}
								/>
								<Route
									path="/bookings"
									element={
										<ProtectedRoute>
											<BookingsPage />
										</ProtectedRoute>
									}
								/>
								<Route
									path="/bookings/new"
									element={
										<ProtectedRoute>
											<CreateBookingPage />
										</ProtectedRoute>
									}
								/>
								<Route
									path="/bookings/:id"
									element={
										<ProtectedRoute>
											<BookingDetailsPage />
										</ProtectedRoute>
									}
								/>
								<Route
									path="/scheduler"
									element={
										<ProtectedRoute>
											<SchedulerPage />
										</ProtectedRoute>
									}
								/>
								<Route
									path="/guests"
									element={
										<ProtectedRoute>
											<GuestsPage />
										</ProtectedRoute>
									}
								/>
								<Route
									path="/staff"
									element={
										<ProtectedRoute>
											<RoleGuard allowedRoles={['Administrator', 'Manager']}>
												<StaffPage />
											</RoleGuard>
										</ProtectedRoute>
									}
								/>
								<Route
									path="/communications"
									element={
										<ProtectedRoute>
											<CommunicationsPage />
										</ProtectedRoute>
									}
								/>
								<Route
									path="/financials"
									element={
										<ProtectedRoute>
											<RoleGuard allowedRoles={['Administrator', 'Manager']}>
												<FinancialsPage />
											</RoleGuard>
										</ProtectedRoute>
									}
								/>
								<Route
									path="/invoices"
									element={
										<ProtectedRoute>
											<RoleGuard allowedRoles={['Administrator', 'Manager']}>
												<InvoicesPage />
											</RoleGuard>
										</ProtectedRoute>
									}
								/>
								<Route
									path="/channels"
									element={
										<ProtectedRoute>
											<RoleGuard allowedRoles={['Administrator', 'Manager']}>
												<ChannelsPage />
											</RoleGuard>
										</ProtectedRoute>
									}
								/>
								<Route
									path="/reviews"
									element={
										<ProtectedRoute>
											<ReviewsPage />
										</ProtectedRoute>
									}
								/>
								<Route
									path="/maintenance"
									element={
										<ProtectedRoute>
											<MaintenancePage />
										</ProtectedRoute>
									}
								/>
								<Route
									path="/housekeeping"
									element={
										<ProtectedRoute>
											<HousekeepingPage />
										</ProtectedRoute>
									}
								/>
								<Route
									path="/billing"
									element={
										<ProtectedRoute>
											<BillingPage />
										</ProtectedRoute>
									}
								/>
								<Route
									path="/reports"
									element={
										<ProtectedRoute>
											<RoleGuard allowedRoles={['Administrator', 'Manager']}>
												<ReportsPage />
											</RoleGuard>
										</ProtectedRoute>
									}
								/>
								<Route
									path="/settings"
									element={
										<ProtectedRoute>
											<RoleGuard allowedRoles={['Administrator']}>
												<SettingsPage />
											</RoleGuard>
										</ProtectedRoute>
									}
								/>
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
