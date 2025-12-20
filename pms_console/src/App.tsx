import { ThemeProvider } from "@/components/theme-provider"
import DashboardPage from "@/pages/Dashboard"
import PropertiesPage from "@/pages/Properties"
import BookingsPage from "@/pages/Bookings"
import GuestsPage from "@/pages/Guests"
import LoginPage from "@/pages/Login"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { FrappeProvider, useFrappeAuth } from "frappe-react-sdk"
import { Toaster } from "@/components/ui/sonner"
import './globals.css'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
	const { currentUser, isLoading } = useFrappeAuth()

	if (isLoading) {
		return (
			<div className="flex h-screen items-center justify-center bg-background">
				<div className="flex flex-col items-center gap-4">
					<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
					<p className="text-sm font-medium animate-pulse">Checking authentication...</p>
				</div>
			</div>
		)
	}

	if (!currentUser) {
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
							path="/guests"
							element={
								<ProtectedRoute>
									<GuestsPage />
								</ProtectedRoute>
							}
						/>
					</Routes>
				</BrowserRouter>
				<Toaster richColors position="top-right" />
			</ThemeProvider>
		</FrappeProvider>
	)
}

export default App
