import { create } from 'zustand'

interface SelectionState {
    // Selected items
    selectedProperties: string[]
    selectedBookings: string[]
    selectedGuests: string[]

    // Active item (for viewing details)
    activePropertyId: string | null
    activeBookingId: string | null
    activeGuestId: string | null

    // Actions
    setSelectedProperties: (ids: string[]) => void
    togglePropertySelection: (id: string) => void
    clearPropertySelection: () => void

    setSelectedBookings: (ids: string[]) => void
    toggleBookingSelection: (id: string) => void
    clearBookingSelection: () => void

    setSelectedGuests: (ids: string[]) => void
    toggleGuestSelection: (id: string) => void
    clearGuestSelection: () => void

    setActivePropertyId: (id: string | null) => void
    setActiveBookingId: (id: string | null) => void
    setActiveGuestId: (id: string | null) => void

    clearAllSelections: () => void
}

export const useSelectionStore = create<SelectionState>((set) => ({
    selectedProperties: [],
    selectedBookings: [],
    selectedGuests: [],

    activePropertyId: null,
    activeBookingId: null,
    activeGuestId: null,

    // Property selections
    setSelectedProperties: (ids) => set({ selectedProperties: ids }),
    togglePropertySelection: (id) => set((state) => ({
        selectedProperties: state.selectedProperties.includes(id)
            ? state.selectedProperties.filter((i) => i !== id)
            : [...state.selectedProperties, id],
    })),
    clearPropertySelection: () => set({ selectedProperties: [] }),

    // Booking selections
    setSelectedBookings: (ids) => set({ selectedBookings: ids }),
    toggleBookingSelection: (id) => set((state) => ({
        selectedBookings: state.selectedBookings.includes(id)
            ? state.selectedBookings.filter((i) => i !== id)
            : [...state.selectedBookings, id],
    })),
    clearBookingSelection: () => set({ selectedBookings: [] }),

    // Guest selections
    setSelectedGuests: (ids) => set({ selectedGuests: ids }),
    toggleGuestSelection: (id) => set((state) => ({
        selectedGuests: state.selectedGuests.includes(id)
            ? state.selectedGuests.filter((i) => i !== id)
            : [...state.selectedGuests, id],
    })),
    clearGuestSelection: () => set({ selectedGuests: [] }),

    // Active items
    setActivePropertyId: (id) => set({ activePropertyId: id }),
    setActiveBookingId: (id) => set({ activeBookingId: id }),
    setActiveGuestId: (id) => set({ activeGuestId: id }),

    // Clear all
    clearAllSelections: () => set({
        selectedProperties: [],
        selectedBookings: [],
        selectedGuests: [],
        activePropertyId: null,
        activeBookingId: null,
        activeGuestId: null,
    }),
}))
