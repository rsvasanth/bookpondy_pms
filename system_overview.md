# BookPondy PMS - System Overview

## 1. Executive Summary
**BookPondy PMS** is a hybrid **Property Management System** designed for high-availability and offline resilience. It combines a robust **Frappe/ERPNext** backend with a modern, local-first **React/Vite** frontend (`pms_console`). The core differentiator is its **RxDB Sync Engine**, which ensures property managers can continue operations (Check-ins, Invoicing, Guest Management) even during internet outages, syncing back to the cloud when connectivity is restored.

---

## 2. Architecture

### High-Level Diagram
```mermaid
graph TD
    User([Property Manager]) --> UI[PMS Console (React)]
    UI <--> RxDB[(Local RxDB / IndexedDB)]
    RxDB <--> Sync[Sync Service]
    Sync <--> API[Frappe REST API]
    API <--> DB[(MariaDB Cloud)]
    
    subgraph Frontend [Local Device]
        UI
        RxDB
        Sync
    end
    
    subgraph Backend [Cloud / Server]
        API
        DB
        Modules[PMS Modules]
    end
```

### Components
1.  **PMS Console (Frontend)**:
    *   **Framework**: React 18, Vite.
    *   **Language**: TypeScript.
    *   **UI Library**: Shadcn UI, Tailwind CSS, Lucide Icons.
    *   **State Management**: Zustand (Auth/UI), RxDB Hooks (Data).
    *   **Router**: React Router DOM.
    *   **Path**: `apps/bookpondy_pms/pms_console`

2.  **BookPondy App (Backend)**:
    *   **Framework**: Frappe Framework (Python/JS).
    *   **Database**: MariaDB.
    *   **Path**: `apps/bookpondy_pms/bookpondy_pms`

---

## 3. Local-First Sync Engine (RxDB)

The heart of the offline capability is the **Sync Engine**. It mirrors critical backend DocTypes to a browser-based **RxDB** database.

### Core Concept: "Background Sync, Instant UI"
Instead of fetching data from the API on every page load, the UI queries the *local* database. A background service keeps this local DB in sync with the server.

*   **Database**: `pms_console_db_v9` (Versioning ensures schema migrations).
*   **Storage Adapter**: Dexie.js (IndexedDB wrapper).
*   **Sync Direction**:
    *   **Pull**: Incremental fetch from Server -> Local (based on `modified` timestamp).
    *   **Push**: Queue-based sync from Local -> Server (optimistic UI updates).

### Mapped Collections
The following Frappe DocTypes are actively synced to local RxDB collections:

| Frappe DocType | RxDB Collection | Purpose |
| :--- | :--- | :--- |
| `Reservation` | `reservations` | Core booking data, guest linkage, status. |
| `Unit` | `units` | Room/Apartment inventory and status. |
| `Guest` | `guests` | Guest profiles, identity proofs. |
| `Folio` | `folios` | Financial accounts for bookings. |
| `Sales Invoice` | `invoices` | Billing documents. |
| `Property Portfolio` | `portfolios` | Brand/Property grouping. |
| `Unit Category` | `unit_categories` | Room types (e.g., "Deluxe", "Studio"). |
| `Staff` | `staff` | Staff profiles for operations. |
| `Booking Inquiry` | `inquiries` | Leads and pre-booking requests. |
| `Checkin Checklist` | `checklists` | Operational tasks. |

---

## 4. Key Modules & Data Models

### A. Property Management
*   **Property Portfolio**: Top-level entity (e.g., "Silver Sands", "Beach House").
*   **Unit**: Individual rentable spaces.
*   **Unit Category**: Classification (Standard, Deluxe) for pricing/inventory.
*   **Unit Status**: Live tracking (Vacant, Occupied, Dirty, Maintenance).

### B. Booking Operations
*   **Reservation**: The central record. Links Guest, Unit, and Folio. Tracks lifecycle (`Tentative` -> `Confirmed` -> `Checked-In` -> `Checked-Out`).
*   **Guest**: CRM record. Stores generic info reusing across bookings.
*   **Checkin Checklist**: Tasks required before/during check-in (ID Verification, Payments).

### C. Financials
*   **Folio**: A container for all charges and payments related to a booking.
*   **Sales Invoice**: Legal bill generated from Folio charges.
*   **Payments**: Tracks incoming money (Cash/Card/UPI).

### D. Activity & Logs
*   **Guest Communication**: Logs emails/WhatsApp messages.
*   **Housekeeping Task**: Operational tickets for cleaning/maintenance.

---

## 5. Development Workflow

### Frontend (PMS Console)
```bash
cd pms_console
yarn dev       # Starts Vite server (Localhost:8080)
```
*   **Env Variables**: 
    *   `VITE_SITE_NAME`: Target Frappe site (e.g., `pms.local`).
    *   `VITE_SOCKET_PORT`: For realtime events (default `9000`).
*   **Hooks**: `useLocalDoc("Reservation", id)` or `useLocalDocList("Unit")`.

### Backend (Frappe)
```bash
bench start    # Starts web server, background workers, redis
```
*   **New DocType**: Create via Desk, then export fixtures if needed.
*   **API**: Custom endpoints in `api.py` or standard REST API.

---

## 6. Directory Structure
```
apps/bookpondy_pms/
├── bookpondy_pms/              # Backend Python Code
│   ├── doctype/                # Definitions for all business objects
│   │   ├── reservation/
│   │   ├── property_portfolio/
│   │   ├── guest/
│   │   └── ...
│   ├── api.py                  # Custom API Endpoints
│   └── hooks.py                # App Configuration & Events
│
└── pms_console/                # Frontend React App
    ├── src/
    │   ├── components/         # Reusable UI (Shadcn)
    │   ├── hooks/              # Data hooks (useLocalData)
    │   ├── lib/                # Core Logic
    │   │   └── db/             # RxDB Setup (schemas, sync-service)
    │   ├── pages/              # Application Routes (BookingDetails, Dashboard)
    │   ├── stores/             # Zustand Stores (Auth, UI state)
    │   └── App.tsx             # Main Entry & Providers
    └── package.json
```
