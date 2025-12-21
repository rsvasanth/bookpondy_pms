/**
 * Central export file for all Zustand stores
 * 
 * State Management Architecture:
 * - authStore: User authentication and profile data
 * - uiStore: Global UI preferences (theme, sidebar, etc.)
 * - filtersStore: Search and filter states across pages
 * - selectionStore: Selected items and active items
 * 
 * Server state (data from backend) is managed via frappe-react-sdk hooks
 */

export { useAuthStore } from './authStore'
export { useUIStore } from './uiStore'
export { useFiltersStore } from './filtersStore'
export { useSelectionStore } from './selectionStore'
