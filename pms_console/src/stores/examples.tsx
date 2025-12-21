/**
 * Example: Using Zustand Stores in Different Scenarios
 */

// ============================================
// Example 1: BookingsPage with Global Filters
// ============================================
import { useFiltersStore, useSelectionStore } from '@/stores'
import { useFrappeGetDocList } from 'frappe-react-sdk'

function BookingsPage() {
    // Global filter state (persists across navigation)
    const { bookingSearch, bookingStatus, setBookingSearch, setBookingStatus } = useFiltersStore()

    // Global selection state
    const { activeBookingId, setActiveBookingId } = useSelectionStore()

    // Local UI state (doesn't need to be global)
    const [detailsOpen, setDetailsOpen] = useState(false)

    // Server state (handled by frappe-react-sdk)
    const { data: reservations } = useFrappeGetDocList('Reservation', {
        fields: ['name', 'guest_name', 'reservation_status'],
        filters: bookingStatus !== 'all' ? [['reservation_status', '=', bookingStatus]] : undefined
    })

    // Apply search filter client-side
    const filteredBookings = reservations?.filter(b =>
        b.guest_name.toLowerCase().includes(bookingSearch.toLowerCase())
    ) || []

    return (
        <div>
            {/* Search input connected to global state */}
            <Input
                value={bookingSearch}
                onChange={(e) => setBookingSearch(e.target.value)}
            />

            {/* Status filter connected to global state */}
            <Select value={bookingStatus} onValueChange={setBookingStatus}>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="Confirmed">Confirmed</SelectItem>
            </Select>

            {/* Click handler updates global selection */}
            <Table>
                {filteredBookings.map(booking => (
                    <TableRow onClick={() => {
                        setActiveBookingId(booking.name)
                        setDetailsOpen(true)
                    }}>
                        {booking.guest_name}
                    </TableRow>
                ))}
            </Table>
        </div>
    )
}

// ============================================
// Example 2: Bulk Selection with Checkboxes
// ============================================
function PropertyManagement() {
    const { selectedProperties, togglePropertySelection } = useSelectionStore()
    const { data: properties } = useFrappeGetDocList('Property')

    const handleDelete = async () => {
        // Use selectedProperties for bulk operations
        await Promise.all(
            selectedProperties.map(id =>
                useFrappeDeleteDoc('Property', id)
            )
        )
    }

    return (
        <div>
            {/* Show bulk action button when items are selected */}
            {selectedProperties.length > 0 && (
                <Button onClick={handleDelete}>
                    Delete {selectedProperties.length} properties
                </Button>
            )}

            {properties?.map(property => (
                <Checkbox
                    checked={selectedProperties.includes(property.name)}
                    onCheckedChange={() => togglePropertySelection(property.name)}
                />
            ))}
        </div>
    )
}

// ============================================
// Example 3: Persistent UI Preferences
// ============================================
function Layout() {
    const { sidebarOpen, toggleSidebar, theme, setTheme } = useUIStore()

    // UI preferences persist across sessions
    return (
        <div className={theme}>
            <button onClick={toggleSidebar}>Toggle Sidebar</button>

            <aside className={sidebarOpen ? 'open' : 'closed'}>
                Sidebar content
            </aside>

            <select value={theme} onChange={(e) => setTheme(e.target.value)}>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
            </select>
        </div>
    )
}

// ============================================
// Example 4: Authentication Flow
// ============================================
function LoginPage() {
    const { setUser } = useAuthStore()
    const { call } = useFrappeAuth()

    const handleLogin = async (username, password) => {
        const response = await call('/api/method/login', { username, password })

        // Store user in global state
        setUser({
            name: response.message.user,
            email: response.message.email,
            full_name: response.message.full_name
        })
    }

    return <LoginForm onSubmit={handleLogin} />
}

function Header() {
    const { user, logout } = useAuthStore()

    return (
        <header>
            <span>Welcome, {user?.full_name}</span>
            <button onClick={logout}>Logout</button>
        </header>
    )
}

// ============================================
// Example 5: Selector Pattern for Performance
// ============================================
function GuestCounter() {
    // ✅ Only subscribe to guestSearch (efficient)
    const guestSearch = useFiltersStore(state => state.guestSearch)

    // vs

    // ❌ Subscribe to entire store (re-renders on any change)
    const filters = useFiltersStore()

    return <div>Searching for: {guestSearch}</div>
}

// ============================================
// Example 6: Resetting Filters
// ============================================
function ClearFiltersButton() {
    const { resetAllFilters } = useFiltersStore()

    return (
        <Button onClick={resetAllFilters}>
            Clear All Filters
        </Button>
    )
}

// ============================================
// Example 7: Combining Multiple Stores
// ============================================
function DashboardPage() {
    const { user } = useAuthStore()
    const { theme } = useUIStore()
    const { propertySearch } = useFiltersStore()
    const { selectedProperties } = useSelectionStore()

    const { data: properties } = useFrappeGetDocList('Property', {
        filters: [['property_name', 'like', `%${propertySearch}%`]]
    })

    return (
        <div className={theme}>
            <h1>Welcome, {user?.full_name}</h1>
            <p>{selectedProperties.length} properties selected</p>
            <PropertyList properties={properties} />
        </div>
    )
}

// ============================================
// Example 8: Custom Hook Pattern
// ============================================
function useBookingFilters() {
    const {
        bookingSearch,
        bookingStatus,
        bookingProperty,
        setBookingSearch,
        setBookingStatus,
        setBookingProperty,
        resetBookingFilters
    } = useFiltersStore()

    return {
        filters: { bookingSearch, bookingStatus, bookingProperty },
        setFilters: { setBookingSearch, setBookingStatus, setBookingProperty },
        resetFilters: resetBookingFilters
    }
}

// Usage
function BookingsFilters() {
    const { filters, setFilters, resetFilters } = useBookingFilters()

    return (
        <div>
            <Input value={filters.bookingSearch} onChange={(e) => setFilters.setBookingSearch(e.target.value)} />
            <Button onClick={resetFilters}>Reset</Button>
        </div>
    )
}
