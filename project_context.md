# BookPondy PMS - Project Status Report

## 1. Project Details
**Name**: BookPondy PMS
**Goal**: A modern, property-owner-centric management system for BookPondy, aligned with the platform's red/white/dark branding.
**Tech Stack**:
- **Backend**: Frappe Framework (v15)
- **Frontend**: React (Vite) with Shadcn UI & Tailwind CSS

## 2. Data Model (DocTypes)

### Core Hierarchy
| DocType | Description | Status |
| :--- | :--- | :--- |
| `Property Portfolio` | Groups properties under a brand or owner portfolio. | ✅ Implemented |
| `Property` | The main accommodation entity (Villa, Hotel, etc.). Contains amenities, location, rules, etc. Auto-creates units for Single Villas. | ✅ Implemented (Auto-Creation Active) |
| `Unit Category` | Types of units (e.g., "Deluxe Room", "Entire Villa"). Holds base price and capacity. | ✅ Implemented |
| `Unit` | Individual bookable entities (e.g., "Room 101", "Villa A"). | ✅ Implemented |
| `Unit Status` | Tracks availability/status date-wise. | ✅ Implemented |

### Operations & Bookings
| DocType | Description | Status |
| :--- | :--- | :--- |
| `Reservation` | Central booking record with availability validation. | ✅ Implemented (Validation Active) |
| `Guest` | Guest CRM profile with history stats. | ✅ Implemented |
| `Guest Communication` | Logs emails, WhatsApps, calls. | ✅ Implemented |
| `Housekeeping Task` | Cleaning assignments linked to check-in/out. | ✅ Implemented |
| `Maintenance Ticket` | Repair requests and tracking. | ✅ Implemented |

### Finance
| DocType | Description | Status |
| :--- | :--- | :--- |
| `Folio` | Guest bill container. | ✅ Implemented |
| `Transaction` | Payments and refunds. | ✅ Implemented |
| `Charge` | Line items (room night, service, extra). | ✅ Implemented |
| `Discount Rule` | Automated pricing logic. | ✅ Implemented |

## 3. Implementation Progress

### Backend Implementation
- **Data Structure**: Full Unit Hierarchy (`Portfolio` -> `Property` -> `Unit Category` -> `Unit`) is live and migrated.
- **Logic**:
    - **Availability Checks**: `Reservation` prevents double-booking on the same unit.
    - **Automation**: `Property` creation auto-generates units for single-unit types (Villas).
- **API**: Standard Frappe REST API + Custom `get_console_property_details` for optimized React state loading.

### Frontend Implementation (Console)
| Module / Page | Status | Features |
| :--- | :--- | :--- |
| **Dashboard** | 🟡 Partial | Header, Sidebar, Basic Layout. (Widgets pending). |
| **Properties** | ✅ Complete | List View with Filters, Detail Sheet, Edit Dialog. |
| **Bookings** | ✅ Complete | Stats Header, Advanced Filters, "Quick Book" Wizard (3-step). |
| **Guests** | ✅ Complete | CRM Table, Profile View, Booking History Stats. |
| **Staff** | ✅ Complete | List View, Management Actions. |
| **Communications**| ✅ Complete | Interaction Logs (Email/SMS). |
| **Financials** | 🚧 Placeholder | "Under Construction" Screen. |
| **Invoices** | 🚧 Placeholder | "Under Construction" Screen. |
| **Channels** | 🚧 Placeholder | "Under Construction" Screen. |
| **Reviews** | 🚧 Placeholder | "Under Construction" Screen. |
| **Tasks** | 🚧 Placeholder | "Under Construction" Screen. |
| **Maintenance** | 🚧 Placeholder | "Under Construction" Screen. |
| **Reports** | 🚧 Placeholder | "Under Construction" Screen. |
| **Settings** | 🚧 Placeholder | "Under Construction" Screen. |

## 4. Next Priorities
1.  **Dashboard Widgets**: Implement actual charts and KPIs on the Dashboard.
2.  **Implementation of Placeholders**: Build out UI for `Financials` (Revenue charts) and `Tasks` (Housekeeping board).
3.  **Advanced Pricing**: Implement Seasonal Rates and complex discount logic.
