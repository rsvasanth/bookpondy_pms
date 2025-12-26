# BookPondy PMS Dashboard Design Prompt - Shadcn Components

## Project Overview
Design a comprehensive Property Management System (PMS) dashboard for **BookPondy** - a hospitality and property reservation platform for Pondicherry & Auroville region. The dashboard should provide real-time property, booking, and operational management in a single unified interface.

---

## Dashboard Architecture

### Primary Navigation Structure
- **Sidebar Navigation** (collapsible): Main module access
- **Top Header**: User profile, notifications, quick search, theme toggle
- **Breadcrumb Navigation**: Current location tracking
- **Responsive Design**: Mobile-first approach with tablet/desktop optimization

---

## Core Dashboard Modules

### 1. **Ongoing Bookings**
**Purpose**: Real-time view of all active and in-progress reservations

**Key Components**:
- **Stats Cards** (shadcn Card + Badge):
  - Total Active Bookings
  - Check-ins Today
  - Check-outs Today
  - Pending Confirmations
  
- **Interactive Table** (shadcn DataTable):
  - Columns: Booking ID | Guest Name | Property | Check-in | Check-out | Status | Amount | Actions
  - Status badges (Confirmed, Pending, Active, Cancelled)
  - Row expansion for booking details
  - Inline actions: View, Edit, Check-in, Message, Cancel
  - Search & filter capabilities
  - Pagination and export options

- **Quick Action Panel**:
  - Create New Booking (Dialog form)
  - Bulk check-in/check-out
  - Multi-select capabilities

- **Timeline View** (optional tab):
  - Visual timeline of today's check-ins/check-outs
  - Color-coded by property type

---

### 2. **Housing Keeping (Housekeeping)**
**Purpose**: Track cleaning tasks, room status, and staff assignments

**Key Components**:
- **Stats Cards**:
  - Total Rooms
  - Rooms Cleaned Today
  - Pending Cleaning
  - Issues Reported

- **Kanban Board** (shadcn Tabs + custom cards):
  - Columns: Not Ready | Cleaning Assigned | In Progress | Quality Check | Ready
  - Drag-and-drop task assignment (future enhancement)
  - Color-coded by room type (Studio, 1BHK, 2BHK, etc.)
  - Room status indicators (Critical, Warning, Normal)

- **Cleaning Tasks Table**:
  - Room Number | Type | Status | Assigned Staff | Due Time | Priority | Notes
  - Quick status update buttons (In Progress, Complete, Issue)
  - Photo upload for before/after
  - Inspector sign-off checkbox

- **Staff Schedule Widget**:
  - Staff assignments for today
  - Availability status
  - Task allocation progress

---

### 3. **Future Bookings**
**Purpose**: Plan ahead and manage upcoming reservations

**Key Components**:
- **Stats Cards**:
  - Total Future Bookings
  - Next 7 Days Bookings
  - Next 30 Days Revenue (projected)
  - Occupancy Rate (%)

- **Calendar View** (shadcn integrated):
  - Monthly calendar showing bookings
  - Color-coded by property/booking status
  - Click to view booking details
  - Drag-to-reschedule capability (future)

- **Timeline List**:
  - Upcoming bookings sorted by check-in date
  - 3-column view: Near-term (7 days) | Mid-term (8-30 days) | Long-term (30+ days)
  - Revenue preview per booking
  - Cancellation risk flag (based on payment status)

- **Occupancy Forecast Chart** (shadcn Chart):
  - Line chart: Occupancy % over next 60 days
  - Stacked area chart: Revenue by property

- **Revenue Projections**:
  - Daily/Weekly/Monthly projected revenue
  - Comparison with previous period

---

### 4. **Maintenance**
**Purpose**: Manage repairs, preventive maintenance, and issue tracking

**Key Components**:
- **Stats Cards**:
  - Total Open Issues
  - Critical Issues
  - Maintenance Scheduled
  - Completed This Month

- **Issue Status Board** (Kanban-style):
  - Columns: Reported | Assigned | In Progress | Completed | Closed
  - Color priority indicators (Red: Critical, Orange: High, Yellow: Medium, Green: Low)
  - Issue preview cards with image thumbnails

- **Maintenance Issues Table**:
  - Issue ID | Property | Type | Priority | Reported Date | Assigned To | Status | Due Date
  - Filter by status, priority, property type
  - Bulk actions for assignment

- **Maintenance Schedule Widget**:
  - Preventive maintenance calendar
  - Upcoming scheduled tasks
  - Contract vendor details (for major repairs)

- **Cost Tracking**:
  - Monthly maintenance spend chart
  - Breakdown by category (Plumbing, Electrical, etc.)
  - Budget vs. actual comparison

---

### 5. **Billing & Payments**
**Purpose**: Invoice management, payment tracking, and revenue analytics

**Key Components**:
- **Stats Cards**:
  - Total Outstanding Amount
  - Payments Pending
  - Overdue Amount
  - This Month Revenue

- **Payment Status Dashboard**:
  - Pie chart: Paid vs. Pending vs. Overdue
  - Outstanding amount by property
  - Aging analysis (0-30, 30-60, 60+ days)

- **Invoices Table** (DataTable):
  - Invoice # | Guest/Booking | Property | Amount | Issue Date | Due Date | Status | Actions
  - Status badges (Paid, Pending, Overdue, Cancelled)
  - Payment method indicator
  - Inline action: View Invoice, Resend, Mark Paid, Cancel

- **Revenue Chart** (shadcn Chart):
  - Line/Bar chart: Daily/Weekly/Monthly revenue
  - Comparison with previous period
  - Property-wise breakdown (stacked)

- **Expense Tracking**:
  - Monthly expense summary
  - Category breakdown (utilities, maintenance, commissions, etc.)
  - Profit margin calculation per property

- **Commission & Fee Management**:
  - Channel-wise commission breakdown
  - Multi-channel fee tracking (OTA commissions, payment gateway fees)
  - Reconciliation status

- **Payment Methods Distribution**:
  - Which payment methods guests prefer
  - Processing success rates

---

### 6. **Client Communication**
**Purpose**: Centralized guest/client messaging and notification hub

**Key Components**:
- **Stats Cards**:
  - Unread Messages
  - Pending Responses
  - Message Response Time (avg)
  - Active Conversations

- **Inbox/Conversation List**:
  - All conversations (from bookings, support, etc.)
  - Unread badge counter
  - Last message preview
  - Conversation date
  - Filter: All | Unread | Bookings | Support | Management | Archived
  - Search functionality

- **Message Panel**:
  - Message thread view (selected conversation)
  - Guest details sidebar (name, property, booking dates)
  - Message composer with:
    - Text input
    - Quick reply templates
    - File attachment option
    - Send button
  - Message history with timestamps
  - Read receipts indicator

- **Notification Center**:
  - Recent notifications list
  - Filter by type: System | Booking | Maintenance | Payment | Guest
  - Mark as read/unread
  - Clear all notifications

- **WhatsApp Integration Indicator**:
  - Messages via WhatsApp (displayed separately or marked)
  - Direct WhatsApp status indicator
  - Option to continue on WhatsApp

- **Communication Templates**:
  - Quick access to saved message templates
  - Pre-configured messages for common scenarios

- **Analytics Widget**:
  - Average response time (KPI)
  - Message volume (chart)
  - Communication channels breakdown

---

## Cross-Cutting Components & Features

### Universal Dashboard Elements

#### **1. Top Header Bar** (shadcn)
- **Left Section**:
  - Logo/Brand
  - Current date & time
  
- **Center Section**:
  - Global search bar (search bookings, guests, properties, invoices)
  - Search suggestions dropdown

- **Right Section**:
  - Notification bell (with unread count)
  - Notification dropdown preview
  - User profile menu (with account settings, logout)
  - Theme toggle (Light/Dark mode)

#### **2. Sidebar Navigation** (shadcn)
- **Collapsible menu**:
  - Dashboard (Overview)
  - Ongoing Bookings
  - Housekeeping
  - Future Bookings
  - Maintenance
  - Billing & Payments
  - Client Communication
  - Reports (expandable sub-menu)
  - Settings (expandable sub-menu)

- **Menu item design**:
  - Icons + Labels
  - Active state highlighting
  - Hover effects
  - Responsive collapse to icons on mobile

#### **3. Quick Stats Bar**
- Display below header (or in sidebar):
  - Properties Managed: [Count]
  - Active Guests: [Count]
  - Total Revenue (this month): [Amount]
  - Overall Occupancy: [%]
  - Pending Tasks: [Count]
  
- Click-through to relevant module

#### **4. Filters & Date Range Selector**
- **Global filters**:
  - Property filter (multi-select dropdown)
  - Date range picker
  - Status filter
  - Reset filters button

#### **5. Data Export Options**
- Export as CSV/Excel
- Export as PDF (for invoices, reports)
- Schedule recurring exports (future)

#### **6. Mobile Responsiveness**
- Sidebar collapses to hamburger menu
- Tables convert to card-based mobile view
- Charts responsive and interactive
- Touch-friendly button sizes (minimum 44px)

---

## Visual Design Guidelines - Shadcn Components

### Color Palette
- **Primary**: Teal (#208C97 or Teal-600 from design system)
- **Secondary**: Brown/Earth tone (accent)
- **Success**: Green (for completed, paid status)
- **Warning**: Orange (for pending, due soon)
- **Danger**: Red (for critical, overdue, issues)
- **Neutral**: Gray scale for text and borders
- **Background**: Light cream (light mode) / Charcoal (dark mode)

### Component Usage
- **Cards**: Stat cards, module cards, content containers
- **Buttons**: Primary (action), Secondary (alternative), Outline (less emphasis)
- **Badges**: Status indicators, priority levels
- **Tables**: DataTable for large datasets with sorting, filtering
- **Charts**: Bar, Line, Pie charts for analytics (Recharts integration recommended)
- **Dialogs**: Forms for creating/editing bookings, messages
- **Dropdowns**: Filters, status changes, bulk actions
- **Modals**: Detailed views, confirmations
- **Tabs**: Module sections, view switching
- **Progress Bars**: Task completion, cleaning progress
- **Tags**: Property type, room type, priority level
- **Popovers/Tooltips**: Contextual information, help text

### Typography
- **Headers** (H1/H2): Bold, teal primary color
- **Sub-headers** (H3/H4): Medium weight, text color
- **Body Text**: Regular weight, readable line-height
- **Mono Font**: For booking IDs, invoice numbers, dates

### Spacing & Layout
- Consistent padding: 16px, 24px, 32px
- Grid-based layout (12-column or auto-grid)
- Card-based design with subtle shadows
- Whitespace prioritization for readability

---

## Interactive Features

### 1. Real-Time Updates
- Auto-refresh of critical data (optional, configurable)
- Toast notifications for new bookings, messages, maintenance alerts
- Connection status indicator

### 2. Drill-Down Analytics
- Click stats to filter the related table
- Hover tooltips for more information
- Click chart sections to drill down by category

### 3. Batch Operations
- Multi-select checkboxes in tables
- Bulk action toolbar (Mark as Complete, Assign, etc.)
- Confirm before execution

### 4. Search & Advanced Filters
- Global search across all modules
- Advanced filter panel with preset filters
- Save custom filter views
- Filter history/suggestions

### 5. Responsive Tables
- Sticky header when scrolling
- Column visibility toggle
- Adjustable column widths
- Sort indicators

---

## Performance & Best Practices

### Data Loading
- Implement pagination (default 20 items per page)
- Virtual scrolling for large lists
- Skeleton loaders while data fetches
- Error states with retry option

### Accessibility
- ARIA labels for interactive elements
- Keyboard navigation (Tab, Enter, Escape)
- Focus visible indicators
- Color not sole indicator of meaning (use icons/text too)
- Alt text for images

### Mobile Optimization
- Touch-friendly interactions
- Horizontal scroll for tables on mobile
- Simplified chart view for small screens
- Sticky action buttons at bottom

---

## Technical Stack (Recommended)

```
Frontend Framework: React 18+ / Next.js 14+
UI Component Library: shadcn/ui
Styling: Tailwind CSS
State Management: Zustand or TanStack Query
Charts: Recharts
Data Tables: TanStack React Table
Forms: React Hook Form + Zod validation
Date Picker: shadcn/ui Calendar component
Icons: Lucide React
Animation: Framer Motion (subtle)
```

---

## Module-Specific Implementation Notes

### Ongoing Bookings
- Show real-time check-in/check-out countdown
- Color code by urgency (red if within 2 hours of check-in/out)
- Auto-mark as checked-in/out option (with confirmation)
- Quick-action buttons for common tasks

### Housekeeping
- Room status quick-change buttons with sound notification
- Photo verification required for completed tasks
- Cleaning time estimation
- Staff performance metrics (daily/weekly)

### Future Bookings
- Overbooking prevention alerts
- Channel conflict detection (same room booked on multiple platforms)
- Pre-arrival task automation (send welcome email, payment link, etc.)
- Revenue optimization suggestions

### Maintenance
- Priority-based auto-escalation (critical issues highlighted)
- Vendor assignment with contact details
- Photo gallery for before/after/progress
- Cost estimation and approval workflow

### Billing
- Automated invoice generation
- Payment reminders (automatic email/SMS)
- Multi-currency support (future)
- Tax calculation (GST for India compliance)
- Commission reconciliation with channels

### Client Communication
- Message search with full-text search
- Conversation archive
- Typing indicators
- Message scheduling (future)
- Template management interface
- Sentiment analysis on messages (future)

---

## Future Enhancements (Phase 2+)

1. **AI-Powered Chatbot**: Auto-respond to common inquiries
2. **Voice Integration**: WhatsApp Voice Message support
3. **Predictive Analytics**: Booking cancellation prediction, maintenance alerts
4. **Mobile App**: Native iOS/Android apps with offline sync
5. **Guest Portal**: Self-serve booking modifications, payment, check-in
6. **Multi-Property Analytics**: Comparative dashboards across properties
7. **Revenue Management**: Dynamic pricing recommendations
8. **Integration Hub**: Connect with Booking.com, Airbnb, OTAs, payment gateways
9. **Workflow Automation**: Zapier/IFTTT-like automation builder
10. **Advanced Reporting**: Custom report builder with scheduling

---

## Success Metrics

- **Dashboard Load Time**: < 2 seconds
- **Responsive Design**: All breakpoints tested (mobile, tablet, desktop)
- **Accessibility Score**: WCAG AA compliance
- **User Satisfaction**: 4.5+ stars in user testing
- **Error Rate**: < 0.1% for critical actions
- **Feature Completeness**: All 6 modules fully functional with no TODOs

---

## Design Handoff Checklist

- [ ] Component library fully integrated (shadcn)
- [ ] Color system applied consistently
- [ ] All interactive states defined (hover, active, disabled, error, loading)
- [ ] Responsive breakpoints tested
- [ ] Dark mode toggle functional
- [ ] Keyboard navigation working
- [ ] Accessibility audit completed
- [ ] Performance optimized (images, code-splitting, lazy loading)
- [ ] Error boundaries and error states designed
- [ ] Toast notification system implemented
- [ ] Loading states with skeleton screens
- [ ] Empty states for no data scenarios
- [ ] Confirmation dialogs for destructive actions
- [ ] Analytics tracking setup (for feature adoption)
- [ ] Documentation for future modifications

---

## Notes for Development

1. **Start with Dashboard Overview**: Create a high-level stats overview that ties all modules together.

2. **Module Independence**: Build each module as a self-contained component so they can be developed in parallel.

3. **Real-Time Features**: Use WebSockets or polling for live updates (consider Firebase Realtime Database or Supabase).

4. **State Management**: Consider using TanStack Query (React Query) for server state and Zustand for UI state.

5. **Database Schema**: Ensure proper indexing for fast filtering and searching across all tables.

6. **API Design**: Build RESTful or GraphQL APIs that support the dashboard's data requirements.

7. **Testing**: Unit tests for components, integration tests for modules, E2E tests for critical user flows.

8. **Monitoring**: Set up error tracking (Sentry), performance monitoring (Vercel Analytics), and user session replay (PostHog).

---

**Document Version**: 1.0  
**Last Updated**: December 26, 2025  
**For**: BookPondy PMS Development Team
