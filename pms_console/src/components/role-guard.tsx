import { Navigate } from "react-router-dom"
import { useAuthStore } from "@/stores/authStore"
import { useFrappeAuth } from "frappe-react-sdk"

interface RoleGuardProps {
    children: React.ReactNode
    allowedRoles: string[]
}

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
    const { user } = useAuthStore()
    const { currentUser } = useFrappeAuth()

    // Fallback: If no role is set but user is logged in (e.g. Administrator from Frappe), allow access if "Administrator" is in allowedRoles
    // Or default to 'Front Desk' permissions if unknown.
    const currentRole = user?.role || (currentUser === "Administrator" ? "Administrator" : "Front Desk")

    if (!allowedRoles.includes(currentRole)) {
        // Redirect to a safe default page or unauthorized page
        return <Navigate to="/" replace />
    }

    return <>{children}</>
}
