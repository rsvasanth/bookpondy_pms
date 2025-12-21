import { create } from 'zustand'

interface FiltersState {
    // Properties filters
    propertySearch: string
    propertyStatus: string
    propertyType: string

    // Bookings filters
    bookingSearch: string
    bookingStatus: string
    bookingProperty: string
    bookingDateRange: { from?: Date; to?: Date }

    // Guests filters
    guestSearch: string
    guestStatus: string
    guestSort: string

    // Actions
    setPropertySearch: (search: string) => void
    setPropertyStatus: (status: string) => void
    setPropertyType: (type: string) => void

    setBookingSearch: (search: string) => void
    setBookingStatus: (status: string) => void
    setBookingProperty: (property: string) => void
    setBookingDateRange: (range: { from?: Date; to?: Date }) => void

    setGuestSearch: (search: string) => void
    setGuestStatus: (status: string) => void
    setGuestSort: (sort: string) => void

    resetPropertyFilters: () => void
    resetBookingFilters: () => void
    resetGuestFilters: () => void
    resetAllFilters: () => void
}

const initialState = {
    propertySearch: '',
    propertyStatus: 'all',
    propertyType: 'all',

    bookingSearch: '',
    bookingStatus: 'all',
    bookingProperty: 'all',
    bookingDateRange: {},

    guestSearch: '',
    guestStatus: 'all',
    guestSort: 'recent',
}

export const useFiltersStore = create<FiltersState>((set) => ({
    ...initialState,

    // Property filters
    setPropertySearch: (search) => set({ propertySearch: search }),
    setPropertyStatus: (status) => set({ propertyStatus: status }),
    setPropertyType: (type) => set({ propertyType: type }),

    // Booking filters
    setBookingSearch: (search) => set({ bookingSearch: search }),
    setBookingStatus: (status) => set({ bookingStatus: status }),
    setBookingProperty: (property) => set({ bookingProperty: property }),
    setBookingDateRange: (range) => set({ bookingDateRange: range }),

    // Guest filters
    setGuestSearch: (search) => set({ guestSearch: search }),
    setGuestStatus: (status) => set({ guestStatus: status }),
    setGuestSort: (sort) => set({ guestSort: sort }),

    // Reset actions
    resetPropertyFilters: () => set({
        propertySearch: '',
        propertyStatus: 'all',
        propertyType: 'all',
    }),

    resetBookingFilters: () => set({
        bookingSearch: '',
        bookingStatus: 'all',
        bookingProperty: 'all',
        bookingDateRange: {},
    }),

    resetGuestFilters: () => set({
        guestSearch: '',
        guestStatus: 'all',
        guestSort: 'recent',
    }),

    resetAllFilters: () => set(initialState),
}))
