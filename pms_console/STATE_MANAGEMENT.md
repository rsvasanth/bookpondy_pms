# State Management Architecture

This application uses a **hybrid state management approach** following modern React best practices:

## Architecture Overview

### 1. **Server State** (via frappe-react-sdk)
Handles all data fetched from the Frappe backend using built-in hooks.

**Tools:**
- `useFrappeGetDocList` - Fetch lists of documents
- `useFrappeGetDoc` - Fetch single document
- `useFrappeCreateDoc` - Create documents
- `useFrappeUpdateDoc` - Update documents
- `useFrappeDeleteDoc` - Delete documents

**Example:**
```tsx
const { data: reservationsList } = useFrappeGetDocList("Reservation", {
  fields: ["name", "guest_name", "property", "check_in_date"],
  limit: 100,
  orderBy: { field: "creation", order: "desc" }
})
```

### 2. **Global Client State** (via Zustand)
Manages application-wide client state that needs to be shared across components.

**Stores:**

#### `authStore.ts`
- **Purpose**: User authentication and profile
- **Persistence**: Yes (localStorage)
- **State**:
  - `user` - Current user object
  - `isAuthenticated` - Authentication status
- **Actions**:
  - `setUser(user)` - Set current user
  - `logout()` - Clear user and logout

**Usage:**
```tsx
import { useAuthStore } from '@/stores'

function Component() {
  const { user, isAuthenticated, setUser } = useAuthStore()
  // ...
}
```

#### `uiStore.ts`
- **Purpose**: Global UI preferences
- **Persistence**: Yes (localStorage)
- **State**:
  - `sidebarOpen` - Sidebar visibility
  - `theme` - Application theme
- **Actions**:
  - `setSidebarOpen(open)` - Control sidebar
  - `toggleSidebar()` - Toggle sidebar
  - `setTheme(theme)` - Set theme

**Usage:**
```tsx
import { useUIStore } from '@/stores'

function Component() {
  const { theme, setTheme, sidebarOpen, toggleSidebar } = useUIStore()
  // ...
}
```

#### `filtersStore.ts`
- **Purpose**: Search and filter states across pages
- **Persistence**: No (session-only)
- **State**:
  - Property filters: `propertySearch`, `propertyStatus`, `propertyType`
  - Booking filters: `bookingSearch`, `bookingStatus`, `bookingProperty`, `bookingDateRange`
  - Guest filters: `guestSearch`, `guestStatus`, `guestSort`
- **Actions**:
  - Setters for each filter
  - `resetPropertyFilters()`, `resetBookingFilters()`, `resetGuestFilters()`
  - `resetAllFilters()` - Reset all filters

**Usage:**
```tsx
import { useFiltersStore } from '@/stores'

function BookingsPage() {
  const { 
    bookingSearch, 
    setBookingSearch,
    bookingStatus,
    setBookingStatus 
  } = useFiltersStore()
  // ...
}
```

#### `selectionStore.ts`
- **Purpose**: Selected items and active items
- **Persistence**: No (session-only)
- **State**:
  - Selected items: `selectedProperties`, `selectedBookings`, `selectedGuests`
  - Active items: `activePropertyId`, `activeBookingId`, `activeGuestId`
- **Actions**:
  - `togglePropertySelection(id)` - Toggle selection
  - `setActiveBookingId(id)` - Set active item
  - `clearAllSelections()` - Clear all selections

**Usage:**
```tsx
import { useSelectionStore } from '@/stores'

function BookingsPage() {
  const { 
    selectedBookings,
    toggleBookingSelection,
    activeBookingId,
    setActiveBookingId 
  } = useSelectionStore()
  // ...
}
```

### 3. **Local Component State** (via useState)
For UI state that is specific to a single component and doesn't need to be shared.

**Use Cases:**
- Modal/Sheet open/close states
- Form input values (before submission)
- Temporary UI states (hover, focus, etc.)
- Component-specific toggles

**Example:**
```tsx
function BookingsPage() {
  const [addBookingOpen, setAddBookingOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  // ...
}
```

## Best Practices

### When to Use What?

1. **frappe-react-sdk hooks** (Server State):
   - ✅ Fetching data from Frappe backend
   - ✅ Performing CRUD operations on DocTypes
   - ✅ Any data that comes from the server

2. **Zustand Stores** (Global Client State):
   - ✅ User authentication state
   - ✅ UI preferences (theme, sidebar, etc.)
   - ✅ Filter states that persist across navigation
   - ✅ Selected items for bulk operations
   - ✅ Any state shared across multiple pages

3. **useState** (Local Component State):
   - ✅ Modal/dialog visibility
   - ✅ Form input values
   - ✅ Component-specific UI states
   - ✅ Temporary states that don't need persistence

### State Flow Example

```
User Action (e.g., filter change)
  ↓
Update Zustand Store (e.g., setBookingStatus)
  ↓
React Re-renders with new filter
  ↓
frappe-react-sdk fetches filtered data
  ↓
UI displays updated results
```

## Migration Guide

### Before (Local State Only):
```tsx
function BookingsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBooking, setSelectedBooking] = useState(null)
  
  const filteredBookings = bookings.filter(b => 
    b.guestName.includes(searchQuery)
  )
  // Filter state is lost on navigation!
}
```

### After (Global State Management):
```tsx
function BookingsPage() {
  // Global filters persist across navigation
  const { bookingSearch, setBookingSearch } = useFiltersStore()
  const { activeBookingId, setActiveBookingId } = useSelectionStore()
  
  const filteredBookings = bookings.filter(b => 
    b.guestName.includes(bookingSearch)
  )
  // Filter state persists! ✨
}
```

## Performance Considerations

1. **Selector Functions**: Zustand allows selecting only needed state
   ```tsx
   // ✅ Good - Only subscribes to bookingSearch
   const bookingSearch = useFiltersStore(state => state.bookingSearch)
   
   // ❌ Avoid - Subscribes to entire store
   const store = useFiltersStore()
   ```

2. **Persistence**: Only auth and UI stores use persistence (localStorage)
   - Filters and selections are session-only for better performance

3. **Server State**: frappe-react-sdk handles caching and deduplication automatically

## File Structure

```
src/
├── stores/
│   ├── index.ts          # Central export
│   ├── authStore.ts      # Authentication state
│   ├── uiStore.ts        # UI preferences
│   ├── filtersStore.ts   # Search and filters
│   └── selectionStore.ts # Selected & active items
└── pages/
    ├── Bookings.tsx      # Uses filtersStore, selectionStore
    ├── Properties.tsx    # Uses filtersStore, selectionStore
    └── Guests.tsx        # Uses filtersStore, selectionStore
```

## Future Enhancements

1. **React Query** (optional): For more advanced server state management
2. **Immer** middleware: For easier nested state updates
3. **DevTools**: Zustand DevTools for debugging
4. **Computed Values**: Derived state using selectors

## Resources

- [Zustand Documentation](https://docs.pmnd.rs/zustand)
- [Frappe React SDK](https://github.com/frappe/frappe-react-sdk)
- [React State Management in 2025](https://react.dev/learn/managing-state)
