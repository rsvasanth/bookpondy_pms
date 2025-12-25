"use client"

import { createContext, useContext, useEffect, useState } from "react"
import type { ReactNode } from "react"
import { useFrappePostCall } from "frappe-react-sdk"
import { toast } from "sonner"

interface PropertyContextType {
    property: any
    unitCategories: any[]
    units: any[]
    occupancy: Record<string, Record<string, number>>
    isLoading: boolean
    error: any
    refresh: () => Promise<void>
    setOptimisticCategories: (categories: any[]) => void
}

const PropertyContext = createContext<PropertyContextType | undefined>(undefined)

export function PropertyProvider({
    children,
    propertyId
}: {
    children: ReactNode
    propertyId: string
}) {
    const [property, setProperty] = useState<any>(null)
    const [unitCategories, setUnitCategories] = useState<any[]>([])
    const [units, setUnits] = useState<any[]>([])
    const [occupancy, setOccupancy] = useState<Record<string, Record<string, number>>>({})

    const { call, loading, error } = useFrappePostCall("bookpondy_pms.bookpondy_pms.api.get_console_property_details")

    const refresh = async () => {
        try {
            const result = await call({ property_id: propertyId })
            if (result && result.message) {
                setProperty(result.message.property)
                setUnitCategories(result.message.unit_categories || [])
                setUnits(result.message.units || [])
                setOccupancy(result.message.occupancy_data || {})
            } else if (result) {
                if (result.property) {
                    setProperty(result.property)
                    setUnitCategories(result.unit_categories || [])
                    setUnits(result.units || [])
                    setOccupancy(result.occupancy_data || {})
                }
            }
        } catch (e) {
            console.error("Failed to fetch property details:", e)
            toast.error("Failed to load property data")
        }
    }

    // Initial fetch
    useEffect(() => {
        if (propertyId) {
            refresh()
        }
    }, [propertyId])

    const setOptimisticCategories = (categories: any[]) => {
        setUnitCategories(categories)
    }

    return (
        <PropertyContext.Provider value={{
            property,
            unitCategories,
            units,
            occupancy,
            isLoading: loading,
            error,
            refresh,
            setOptimisticCategories
        }}>
            {children}
        </PropertyContext.Provider>
    )
}

export function useProperty() {
    const context = useContext(PropertyContext)
    if (context === undefined) {
        throw new Error("useProperty must be used within a PropertyProvider")
    }
    return context
}
