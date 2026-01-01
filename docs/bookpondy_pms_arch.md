# BookPondy PMS - Visual Architecture & Integration Guide

## System Architecture Diagram

```
╔════════════════════════════════════════════════════════════════════════════╗
║                       BOOKPONDY PMS - COMPLETE SYSTEM                      ║
╚════════════════════════════════════════════════════════════════════════════╝

┌─────────────────────────────────────────────────────────────────────────────┐
│                           CLIENT LAYER (User Interfaces)                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────┐  ┌──────────────────────────────────────┐  │
│  │  React Web Dashboard       │  │  Doppio Mobile App                   │  │
│  │  (Desktop/Tablet)          │  │  (iOS/Android - Staff & Guests)      │  │
│  │                            │  │                                      │  │
│  │ • Property Management      │  │ • Check-in/Check-out                 │  │
│  │ • Booking Engine           │  │ • QR Code Scanning                   │  │
│  │ • Revenue Ops              │  │ • Task Management                    │  │
│  │ • Guest Portal             │  │ • Guest Communication                │  │
│  │ • Staff Dashboard          │  │ • Real-time Sync                     │  │
│  │ • Analytics & Reports      │  │ • Offline-First Operations           │  │
│  └────────────────────────────┘  └──────────────────────────────────────┘  │
│           │ REST API                              │ REST API                │
│           │ WebSocket                             │ WebSocket              │
│           │ Authentication (JWT)                  │ Authentication (JWT)   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                        ║
                        ║ HTTPS / WebSocket
                        ║
┌─────────────────────────────────────────────────────────────────────────────┐
│                         API GATEWAY LAYER (Raven)                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │  Raven API Framework (Built on Frappe)                                 │ │
│  │                                                                        │ │
│  │  ✓ REST API Endpoints (CRUD operations for all doctypes)             │ │
│  │  ✓ Real-time WebSocket (Bookings, Tasks, Notifications)             │ │
│  │  ✓ JWT Authentication & Authorization                                │ │
│  │  ✓ Request Validation & Middleware                                   │ │
│  │  ✓ Rate Limiting (IP-based, User-based)                             │ │
│  │  ✓ CORS Support (for cross-origin requests)                         │ │
│  │  ✓ Error Standardization (consistent error responses)               │ │
│  │  ✓ API Versioning (v1, v2 future compatibility)                     │ │
│  │                                                                        │ │
│  │  Key Endpoints:                                                       │ │
│  │  • POST /api/resource/Booking (Create booking)                       │ │
│  │  • GET /api/resource/Property/{id} (Get property details)            │ │
│  │  • PUT /api/resource/Rate/{id} (Update pricing)                      │ │
│  │  • GET /api/resource/Task (List tasks with WebSocket updates)        │ │
│  │  • POST /api/method/get_availability_calendar (Calculate availability│ │
│  │  • POST /api/method/sync_to_marketplace (Manual sync trigger)        │ │
│  │                                                                        │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                        ║
                        ║ Python Function Calls
                        ║
┌─────────────────────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER (Frappe/ERPNext v15)                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  Core Frappe Framework                                              │   │
│  │                                                                      │   │
│  │  • ORM (Object-Relational Mapping) - Database abstraction          │   │
│  │  • Doctype System - Define models as configurations               │   │
│  │  • Workflow Engine - Booking approval, check-in workflows         │   │
│  │  • Permission System - Row-level & document-level security         │   │
│  │  • Built-in Modules - Accounting (invoices), HR, CRM              │   │
│  │  • Report Builder - Custom reports without code                    │   │
│  │  • Dashboard Designer - Drag-and-drop dashboards                   │   │
│  │  • Task Scheduling - Celery for background jobs                    │   │
│  │  • Email Templates - Jinja2 templates for communications           │   │
│  │  • File Management - Document storage, attachments                 │   │
│  │                                                                      │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  Custom Business Logic (Python Classes & Methods)                   │   │
│  │                                                                      │   │
│  │  ✓ Booking Management                                              │   │
│  │    - Lifecycle workflow (Inquiry → Confirmed → Checked-in)         │   │
│  │    - Automatic availability blocking                               │   │
│  │    - Pricing calculation with discounts                            │   │
│  │                                                                      │   │
│  │  ✓ Rate & Pricing Engine                                           │   │
│  │    - Seasonal rate rules                                           │   │
│  │    - Occupancy-based dynamic pricing                               │   │
│  │    - Min-stay discounts                                            │   │
│  │    - Extra guest fees                                              │   │
│  │                                                                      │   │
│  │  ✓ Availability Synchronization                                    │   │
│  │    - 90-day calendar management                                    │   │
│  │    - Marketplace sync (daily 2 AM)                                 │   │
│  │    - Conflict resolution (PMS wins)                                │   │
│  │                                                                      │   │
│  │  ✓ Guest Communication                                             │   │
│  │    - Email confirmations (SendGrid)                                │   │
│  │    - WhatsApp messages (Twilio)                                    │   │
│  │    - SMS alerts (Twilio)                                           │   │
│  │    - In-app notifications                                          │   │
│  │    - Templated messages with variables                             │   │
│  │                                                                      │   │
│  │  ✓ Commission & Settlement                                         │   │
│  │    - Channel-based commission tracking                             │   │
│  │    - Automatic commission calculation                              │   │
│  │    - Payout scheduling                                             │   │
│  │                                                                      │   │
│  │  ✓ Integration Hooks                                               │   │
│  │    - Marketplace sync triggers                                     │   │
│  │    - Payment gateway webhooks                                      │   │
│  │    - Email sending queues                                          │   │
│  │    - Task creation automation                                      │   │
│  │                                                                      │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  Custom Doctypes (Database Models)                                  │   │
│  │                                                                      │   │
│  │  • Property        - Guesthouse/Villa/Resort info                  │   │
│  │  • Room           - Individual rooms/units                         │   │
│  │  • Rate           - Pricing rules & seasonal rates                 │   │
│  │  • Availability   - 90-day calendar per room                       │   │
│  │  • Booking        - Reservation records                            │   │
│  │  • Guest          - Guest profiles & preferences                   │   │
│  │  • Task           - Housekeeping & maintenance tasks               │   │
│  │  • Staff          - Team members & assignments                     │   │
│  │  • Invoice        - Guest invoices & receipts                      │   │
│  │  • Payment        - Payment records & transactions                 │   │
│  │  • Review         - Guest reviews & ratings                        │   │
│  │  • ChannelCommission - Commission tracking per booking source      │   │
│  │  • Communication  - Email/SMS/WhatsApp logs                        │   │
│  │                                                                      │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                        ║
                        ║ SQL Queries & Cache Calls
                        ║
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DATA LAYER (Persistence)                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌───────────────────────────────────┐  ┌──────────────────────────────┐   │
│  │  PostgreSQL / MariaDB             │  │  Redis Cache                 │   │
│  │  (Primary Relational Database)    │  │  (In-memory Data Store)      │   │
│  │                                   │  │                              │   │
│  │  Tables:                          │  │  Cache for:                  │   │
│  │  • properties                     │  │  • User sessions (JWT)       │   │
│  │  • rooms                          │  │  • Rate calculations         │   │
│  │  • bookings                       │  │  • Availability calendar     │   │
│  │  • guests                         │  │  • Real-time task updates    │   │
│  │  • rates                          │  │  • WebSocket subscriptions   │   │
│  │  • availability                   │  │  • Rate limiting counters    │   │
│  │  • tasks                          │  │  • Celery task queue         │   │
│  │  • invoices                       │  │  • Pub/Sub messaging         │   │
│  │  • payments                       │  │  • Session store             │   │
│  │  • reviews                        │  │                              │   │
│  │  • staff                          │  │  Data Format:                │   │
│  │  • communications_log             │  │  • String keys (auth tokens) │   │
│  │  • custom_field_values (JSON)    │  │  • Hash (user preferences)   │   │
│  │                                   │  │  • List (task queues)        │   │
│  │  Features:                        │  │  • Sorted Set (leaderboards)│   │
│  │  • ACID transactions              │  │  • Expiration (TTL)          │   │
│  │  • Full-text search               │  │  • Automatic cleanup         │   │
│  │  • JSONB for flexible fields      │  │                              │   │
│  │  • Replication for backups        │  │  Typical Hit Rate: 85-90%   │   │
│  │  • Connection pooling             │  │  Reduces DB load by 10x      │   │
│  │                                   │  │                              │   │
│  │  Capacity:                        │  │  Capacity:                   │   │
│  │  • 10,000+ bookings/month         │  │  • 500MB-2GB depending on   │   │
│  │  • Unlimited properties           │  │    usage patterns            │   │
│  │  • Archive old data to S3         │  │  • Auto-expiring keys       │   │
│  │                                   │  │                              │   │
│  └───────────────────────────────────┘  └──────────────────────────────┘   │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │  Elasticsearch (Optional - Advanced Search)                            │  │
│  │  • Full-text search across guest names, bookings, history             │  │
│  │  • Analytics aggregations (occupancy trends, revenue patterns)         │  │
│  │  • Log indexing & analysis for debugging                              │  │
│  │  • Not essential for MVP, add if search becomes bottleneck            │  │
│  │                                                                        │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                        ║
                        ║ Task Queues & Async Jobs
                        ║
┌─────────────────────────────────────────────────────────────────────────────┐
│                    BACKGROUND JOBS & ASYNC LAYER (Celery)                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  Celery Task Queue (Python Task Execution)                           │   │
│  │                                                                      │   │
│  │  Queue:                       Execution:                            │   │
│  │  Redis job store ──→ Celery Worker ──→ Execute Python function     │   │
│  │                                                                      │   │
│  │  Typical Background Jobs:                                           │   │
│  │                                                                      │   │
│  │  1. Email Sending (Immediate)                                      │   │
│  │     - Booking confirmations                                         │   │
│  │     - Reminders (48hr before check-in)                             │   │
│  │     - Receipts & invoices                                          │   │
│  │     - Review requests (post-stay)                                  │   │
│  │                                                                      │   │
│  │  2. Marketplace Sync (Scheduled)                                   │   │
│  │     - Daily at 2 AM: Availability calendar sync                    │   │
│  │     - Every 6 hours: Pull new bookings from marketplace            │   │
│  │     - Every 30 mins: Sync reviews to marketplace                   │   │
│  │                                                                      │   │
│  │  3. Rate Calculation (Scheduled)                                   │   │
│  │     - Nightly: Recalculate seasonal rates                          │   │
│  │     - On-demand: When rates change                                 │   │
│  │     - Occupancy-based: Adjust prices based on fill                │   │
│  │                                                                      │   │
│  │  4. Report Generation (Scheduled)                                  │   │
│  │     - Weekly: Revenue reports                                      │   │
│  │     - Monthly: Performance analytics                               │   │
│  │     - Daily: Occupancy dashboard                                   │   │
│  │                                                                      │   │
│  │  5. Payment Processing (On-demand)                                │   │
│  │     - Webhook from Razorpay → Create Payment record               │   │
│  │     - Update booking payment status                                │   │
│  │     - Trigger confirmation email                                   │   │
│  │                                                                      │   │
│  │  6. Communication (Immediate)                                      │   │
│  │     - WhatsApp messages via Twilio                                │   │
│  │     - SMS alerts for urgent matters                                │   │
│  │     - In-app push notifications via Firebase                      │   │
│  │                                                                      │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                        ║
                        ║ External API Calls
                        ║
┌─────────────────────────────────────────────────────────────────────────────┐
│                  EXTERNAL INTEGRATIONS & SERVICES LAYER                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────┐  ┌──────────────────────────────────┐    │
│  │  Payment Gateway            │  │  BookPondy.com Marketplace       │    │
│  │  (Razorpay)                 │  │  (Sync Engine)                   │    │
│  │                             │  │                                  │    │
│  │  • Create payment orders    │  │  • Push Listings                │    │
│  │  • Process card payments    │  │  • Push Availability            │    │
│  │  • Handle refunds           │  │  • Pull Bookings                │    │
│  │  • Webhook notifications    │  │  • Pull Reviews                 │    │
│  │  • Settlements (monthly)    │  │  • Sync property photos         │    │
│  │  • Invoice generation       │  │  • Commission tracking          │    │
│  │                             │  │  • Payment synchronization      │    │
│  └─────────────────────────────┘  └──────────────────────────────────┘    │
│                                                                              │
│  ┌─────────────────────────────┐  ┌──────────────────────────────────┐    │
│  │  Communication APIs         │  │  Geolocation & Maps              │    │
│  │                             │  │                                  │    │
│  │  Twilio:                    │  │  Google Maps API:                │    │
│  │  • Send SMS to guests       │  │  • Distance from airport         │    │
│  │  • Send WhatsApp messages   │  │  • Directions/routing           │    │
│  │  • Phone verification OTPs  │  │  • Place autocomplete           │    │
│  │  • Call notifications       │  │  • Street view for listings     │    │
│  │                             │  │  • Nearby attractions           │    │
│  │  SendGrid:                  │  │                                  │    │
│  │  • Bulk email campaigns     │  │  Google Photos:                 │    │
│  │  • Email templates          │  │  • Property photo library       │    │
│  │  • Delivery tracking        │  │  • Automatic image optimization │    │
│  │  • Open/click analytics     │  │                                  │    │
│  │                             │  │                                  │    │
│  │  Firebase Cloud Messaging:  │  │                                  │    │
│  │  • Push notifications (app) │  │                                  │    │
│  │  • Device token management  │  │                                  │    │
│  │  • Message scheduling       │  │                                  │    │
│  │                             │  │                                  │    │
│  └─────────────────────────────┘  └──────────────────────────────────┘    │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  Analytics & Monitoring                                              │   │
│  │                                                                      │   │
│  │  Google Analytics 4: Track user behavior, conversions               │   │
│  │  Sentry: Error tracking & debugging                                 │   │
│  │  Datadog: Infrastructure monitoring, logs, metrics                  │   │
│  │  Betterstack: Uptime monitoring (alerts if site goes down)          │   │
│  │                                                                      │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Detailed Data Flow Diagrams

### Booking Creation Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    BOOKING CREATION FLOW                                     │
└─────────────────────────────────────────────────────────────────────────────┘

Step 1: Guest Search for Availability
┌──────────────────┐
│ React Dashboard  │
│ Guest checks     │
│ Property: Villa  │
│ Dates: Jan 20-25 │
│ Guests: 2        │
└────────┬─────────┘
         │ REST API GET
         ↓
┌──────────────────┐
│ Raven API        │
│ get_availability │
│ _calendar        │
└────────┬─────────┘
         │ Query
         ↓
┌──────────────────┐
│ PostgreSQL       │
│ Query table:     │
│ availability     │
│ Filter by dates  │
└────────┬─────────┘
         │ Rows
         ↓
┌──────────────────┐
│ Redis Cache      │
│ Store result     │
│ TTL: 5 mins      │
└────────┬─────────┘
         │ Return JSON
         ↓
┌──────────────────┐
│ React Frontend   │
│ Show calendar:   │
│ Green = Available│
│ Red = Booked     │
└──────────────────┘


Step 2: Create Booking Record
┌──────────────────┐
│ React Dashboard  │
│ Guest clicks     │
│ "RESERVE NOW →"  │
│ Request body:    │
│ {                │
│  guest_email,    │
│  property_id,    │
│  room_id,        │
│  check_in,       │
│  check_out,      │
│  guests: 2       │
│ }                │
└────────┬─────────┘
         │ POST /api/resource/Booking
         ↓
┌──────────────────┐
│ Raven API        │
│ Validate request │
│ Check JWT token  │
│ Verify schema    │
└────────┬─────────┘
         │ Pass validation
         ↓
┌──────────────────┐
│ Frappe Framework │
│ Booking.validate()│
│ • Check room     │
│   availability   │
│ • Calculate      │
│   pricing        │
│ • Set status =   │
│   "Pending"      │
└────────┬─────────┘
         │ Create record
         ↓
┌──────────────────┐
│ PostgreSQL       │
│ INSERT booking:  │
│ BOK-2025-001     │
│ status = Pending │
│ total = 30000    │
└────────┬─────────┘
         │ Transaction ID
         ↓
┌──────────────────┐
│ Frappe Hooks     │
│ on_insert() runs │
│ • Create task    │
│ • Update         │
│   availability   │
│ • Enqueue sync   │
└────────┬─────────┘
         │
         ├──→ Redis Queue: send_email
         │
         ├──→ Redis Queue: create_task
         │
         └──→ PostgreSQL: Update availability
                        status = "Booked"

┌──────────────────┐
│ Celery Worker    │
│ Picks up email   │
│ task from queue  │
└────────┬─────────┘
         │ Execute
         ↓
┌──────────────────┐
│ SendGrid         │
│ Send email:      │
│ "Booking         │
│  Confirmation"   │
│ To: guest@...    │
└────────┬─────────┘
         │ Delivered
         ↓
┌──────────────────┐
│ Guest Email      │
│ Inbox shows:     │
│ "Your booking    │
│  is pending.     │
│  Pay to confirm" │
└──────────────────┘


Step 3: Payment & Confirmation
┌──────────────────┐
│ Guest clicks     │
│ email link       │
│ Opens checkout   │
└────────┬─────────┘
         │ Redirect to payment page
         ↓
┌──────────────────┐
│ Razorpay Payment │
│ Gateway          │
│ • Display form   │
│ • Guest enters   │
│   card details   │
│ • Process        │
│   payment        │
└────────┬─────────┘
         │ Webhook (POST)
         ↓
┌──────────────────┐
│ PMS API          │
│ /webhook/payment │
│ Verify signature │
│ with secret key  │
└────────┬─────────┘
         │ Valid signature
         ↓
┌──────────────────┐
│ Frappe           │
│ Create Payment   │
│ doctype:         │
│ • status =       │
│   "Captured"     │
│ • amount = 30000 │
│ • booking link   │
└────────┬─────────┘
         │ Save to DB
         ↓
┌──────────────────┐
│ Frappe Hook:     │
│ Payment.on_insert│
│ • Update booking │
│   status =       │
│   "Confirmed"    │
│ • Create task:   │
│   "Prepare room" │
└────────┬─────────┘
         │ Enqueue jobs
         ├──→ Send confirmation email
         ├──→ Send WhatsApp to guest
         ├──→ Create housekeeping task
         ├──→ Send notification to staff
         └──→ Enqueue marketplace sync
                (if not from marketplace)

┌──────────────────┐
│ Guest receives   │
│ WhatsApp message:│
│ "✓ Confirmed!    │
│  Your room is    │
│  ready. Check-in │
│  after 2 PM"     │
└──────────────────┘
```

### Marketplace Sync Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│              MARKETPLACE SYNC FLOW (Daily at 2 AM)                           │
└─────────────────────────────────────────────────────────────────────────────┘

Step 1: Daily Scheduled Job Triggers
┌──────────────────────────────┐
│ Linux Cron Job               │
│ 0 2 * * * (Every day at 2 AM)│
└────────┬─────────────────────┘
         │ Execute scheduled task
         ↓
┌──────────────────────────────┐
│ Frappe Task Scheduler        │
│ Call:                        │
│ sync_availability_daily()    │
└────────┬─────────────────────┘
         │ Run Celery task
         ↓
┌──────────────────────────────┐
│ Celery Worker Process        │
│ Python function executes:    │
│ MarketplaceSync.sync_        │
│ availability()               │
└────────┬─────────────────────┘
         │ Query availability
         ↓
┌──────────────────────────────┐
│ PostgreSQL                   │
│ SELECT * FROM availability   │
│ WHERE property = X           │
│ AND date >= today            │
│ AND date <= today + 90 days  │
└────────┬─────────────────────┘
         │ Return 90-day calendar
         ↓
┌──────────────────────────────┐
│ Python Processing            │
│ Convert to marketplace       │
│ format:                      │
│ {                            │
│  "availability": [          │
│   {                          │
│    "date": "2025-01-20",    │
│    "status": "available",   │
│    "rate": 5000             │
│   },                         │
│   ...                        │
│  ]                           │
│ }                            │
└────────┬─────────────────────┘
         │ Sign request (HMAC)
         ↓
┌──────────────────────────────┐
│ HTTPS POST Request           │
│ To: api.bookpondy.com/sync   │
│ Header: Authorization:       │
│ Bearer {signed_token}        │
│ Body: JSON payload           │
└────────┬─────────────────────┘
         │ Network (HTTPS encrypted)
         ↓
┌──────────────────────────────┐
│ BookPondy.com API            │
│ • Verify signature           │
│ • Update marketplace DB:     │
│   availability table         │
│ • Update listing availability│
│   status on frontend         │
│ • Return 200 OK              │
└────────┬─────────────────────┘
         │ Response JSON
         ↓
┌──────────────────────────────┐
│ PMS Logs                     │
│ "Sync completed: 90 dates    │
│ synced for property X"       │
└──────────────────────────────┘


Step 2: Bookmark Sync from Marketplace (Every 6 hours)
┌──────────────────────────────┐
│ BookPondy.com Backend        │
│ New booking created via      │
│ marketplace:                 │
│ BOK-MKT-2025-0001            │
└────────┬─────────────────────┘
         │ Webhook POST
         ↓
┌──────────────────────────────┐
│ PMS /webhook/booking         │
│ Endpoint:                    │
│ @whitelist(allow_guest=True) │
│ def marketplace_webhook()    │
└────────┬─────────────────────┘
         │ Verify signature
         ↓
┌──────────────────────────────┐
│ Signature Verification       │
│ Compare HMAC signatures      │
│ If mismatch: reject (401)    │
└────────┬─────────────────────┘
         │ Valid signature
         ↓
┌──────────────────────────────┐
│ Python Logic                 │
│ data = {                     │
│   "marketplace_booking_id":  │
│   "BOK-MKT-001",             │
│   "property_id": "villa-1",  │
│   "guest_name": "John Doe",  │
│   "check_in": "2025-01-20",  │
│   "check_out": "2025-01-25", │
│   "total_price": 30000       │
│ }                            │
└────────┬─────────────────────┘
         │ Create/fetch guest
         ↓
┌──────────────────────────────┐
│ PostgreSQL                   │
│ SELECT * FROM guest          │
│ WHERE email = ...            │
│ If not found: INSERT guest   │
└────────┬─────────────────────┘
         │ Guest ID
         ↓
┌──────────────────────────────┐
│ Create Booking in PMS        │
│ doctype = "Booking"          │
│ booking_source = "BookPondy" │
│ status = "Confirmed"         │
│ notes = "Marketplace ID:     │
│         BOK-MKT-001"         │
└────────┬─────────────────────┘
         │ PostgreSQL INSERT
         ↓
┌──────────────────────────────┐
│ Frappe Hooks                 │
│ Booking.after_insert() runs: │
│ • Create availability        │
│   records (block dates)      │
│ • Send confirmation email    │
│ • Create housekeeping task   │
│ • Notify staff               │
└────────┬─────────────────────┘
         │ Tasks queued
         ↓
┌──────────────────────────────┐
│ PMS Database & Systems       │
│ Updated with marketplace     │
│ booking, staff notified,     │
│ guest confirmed              │
└──────────────────────────────┘


Step 3: Handle Cancellation from Marketplace
┌──────────────────────────────┐
│ Guest cancels on             │
│ BookPondy.com                │
└────────┬─────────────────────┘
         │ Webhook: event_type =
         │ "booking.cancelled"
         ↓
┌──────────────────────────────┐
│ PMS /webhook/booking         │
│ if event_type ==             │
│ "booking.cancelled":         │
└────────┬─────────────────────┘
         │ Find PMS booking
         ↓
┌──────────────────────────────┐
│ PostgreSQL Query             │
│ SELECT * FROM booking        │
│ WHERE notes LIKE             │
│ "Marketplace ID: BOK-MKT-001"│
└────────┬─────────────────────┘
         │ Booking found
         ↓
┌──────────────────────────────┐
│ Frappe Booking.cancel()      │
│ • Set status = "Cancelled"   │
│ • Clear availability blocks  │
│ • Issue refund (if needed)   │
│ • Send cancellation to guest │
└────────┬─────────────────────┘
         │ Save cancelled state
         ↓
┌──────────────────────────────┐
│ Staff Notification           │
│ "Booking BOK-XXX cancelled"  │
│ (Task will be auto-deleted)  │
└──────────────────────────────┘
```

---

## Module Dependencies

```
Core Modules:
├── Property Management (Independent)
│   ├── Property doctype
│   ├── Room doctype
│   ├── Amenities list
│   └── Staff assignments
│
├── Inventory Management (Depends on: Property)
│   ├── Rate doctype (pricing rules)
│   ├── Availability calendar (90-day sync)
│   ├── Seasonal rates
│   └── Occupancy calculations
│
├── Booking Engine (Depends on: Property, Inventory, Guest)
│   ├── Booking doctype (core transactions)
│   ├── Workflow state machine
│   ├── Price calculation
│   ├── Payment processing
│   └── Marketplace sync
│
├── Guest Management (Independent)
│   ├── Guest profiles
│   ├── Preferences & history
│   ├── Loyalty tracking
│   └── Communication log
│
├── Operations Management (Depends on: Property, Booking)
│   ├── Task management (housekeeping, maintenance)
│   ├── Staff assignments
│   ├── Shift management
│   └── Inspection workflows
│
├── Revenue Management (Depends on: Booking, Property)
│   ├── Invoice generation
│   ├── Payment tracking
│   ├── Commission calculation
│   ├── Reports & analytics
│   └── Payout scheduling
│
├── Communication (Depends on: Guest, Booking)
│   ├── Email templates
│   ├── WhatsApp integration
│   ├── SMS alerts
│   ├── In-app notifications
│   └── Communication log
│
└── Marketplace Integration (Depends on: Property, Booking, Inventory)
    ├── Listing sync engine
    ├── Availability sync (daily)
    ├── Booking pull (every 6 hrs)
    ├── Review sync (every 30 mins)
    ├── Commission tracking
    └── Webhook receiver
```

---

## API Endpoints Reference

```
Authentication:
├── POST /api/auth/login
│   └─ Credentials → JWT token
├── POST /api/auth/register
│   └─ Create new owner account
└── POST /api/auth/refresh-token
    └─ Refresh expired JWT

Properties (CRUD):
├── GET /api/resource/Property
│   └─ List all properties (paginated)
├── GET /api/resource/Property/{id}
│   └─ Get single property details
├── POST /api/resource/Property
│   └─ Create new property
├── PUT /api/resource/Property/{id}
│   └─ Update property info
└── DELETE /api/resource/Property/{id}
    └─ Archive property (soft delete)

Rooms (CRUD):
├── GET /api/resource/Room?property={id}
│   └─ List rooms in property
├── POST /api/resource/Room
│   └─ Add new room
├── PUT /api/resource/Room/{id}
│   └─ Update room details
└── GET /api/resource/Room/{id}/amenities
    └─ Get room-specific amenities

Availability & Rates:
├── GET /api/method/get_availability_calendar
│   ├─ Params: property_id, start_date, end_date
│   └─ Returns: 90-day calendar with status per room
├── GET /api/method/calculate_price
│   ├─ Params: property_id, check_in, check_out, guests
│   └─ Returns: {base, cleaning, service, discount, total}
├── POST /api/resource/Rate
│   └─ Create/update pricing rules
└── GET /api/method/get_dynamic_rate
    ├─ Params: room_id, date
    └─ Returns: calculated rate with occupancy adjustments

Bookings:
├── GET /api/resource/Booking?property={id}
│   └─ List bookings for property (with filters)
├── GET /api/resource/Booking/{id}
│   └─ Get booking details with guest info
├── POST /api/resource/Booking
│   └─ Create new booking
├── PUT /api/resource/Booking/{id}
│   └─ Modify booking (dates, guests, special requests)
├── POST /api/resource/Booking/{id}/submit
│   └─ Submit booking for payment
├── POST /api/resource/Booking/{id}/cancel
│   └─ Cancel booking (refund logic applies)
└── POST /api/resource/Booking/{id}/check-in
    └─ Mark as checked-in (staff only)

Guests:
├── GET /api/resource/Guest/{id}
│   └─ Get guest profile & history
├── POST /api/resource/Guest
│   └─ Create guest profile (during booking)
├── PUT /api/resource/Guest/{id}
│   └─ Update guest preferences
├── GET /api/resource/Guest/{id}/booking-history
│   └─ List all past bookings
└── GET /api/resource/Guest/{id}/preferences
    └─ Get saved preferences (room type, floor, etc.)

Tasks:
├── GET /api/resource/Task?property={id}
│   └─ List tasks (with status filter)
├── POST /api/resource/Task
│   └─ Create task (for housekeeping, maintenance)
├── PUT /api/resource/Task/{id}
│   └─ Update task (mark in-progress, complete)
├── PUT /api/resource/Task/{id}/upload-photos
│   └─ Upload completion photos
└── DELETE /api/resource/Task/{id}
    └─ Cancel task

Payments & Invoices:
├── GET /api/resource/Invoice/{id}
│   └─ Get invoice details
├── POST /api/resource/Invoice
│   └─ Generate invoice for booking
├── GET /api/resource/Invoice/{id}/receipt
│   └─ Generate PDF receipt
└── POST /api/method/refund-booking
    ├─ Params: booking_id, refund_amount
    └─ Triggers refund via payment gateway

Analytics & Reports:
├── GET /api/method/occupancy-report
│   ├─ Params: property_id, start_date, end_date
│   └─ Returns: occupancy %, avg length of stay, etc.
├── GET /api/method/revenue-report
│   ├─ Params: property_id, month, year
│   └─ Returns: total revenue, by channel breakdown
├── GET /api/method/guest-analytics
│   ├─ Params: property_id, time_period
│   └─ Returns: repeat guest %, ratings, source breakdown
└── GET /api/method/channel-commission-report
    ├─ Params: date_range
    └─ Returns: commission by OTA, settlements due

Marketplace Integration:
├── POST /api/method/sync-availability
│   ├─ Manually trigger sync (normally automatic)
│   └─ Returns: {status, availability_synced}
├── GET /api/method/marketplace-status
│   ├─ Check sync status
│   └─ Returns: last_sync_time, synced_properties
├── POST /api/webhook/booking
│   ├─ Receive booking from marketplace
│   └─ Signature-verified endpoint
├── POST /api/webhook/payment
│   ├─ Receive payment confirmation from Razorpay
│   └─ Create payment record
└── POST /api/webhook/review
    ├─ Receive review from marketplace
    └─ Store and aggregate rating

WebSocket Events (Real-time):
├── ws://api.bookpondy.com/ws/bookings
│   ├─ New booking created
│   ├─ Booking status changed
│   └─ Payment received
├── ws://api.bookpondy.com/ws/tasks
│   ├─ Task assigned
│   ├─ Task status updated
│   └─ Task completed
├── ws://api.bookpondy.com/ws/notifications
│   ├─ Urgent alerts (maintenance, guest issue)
│   └─ Reminders (check-in soon, payment due)
└── ws://api.bookpondy.com/ws/property/{id}
    └─ Real-time property metrics (occupancy, revenue)
```

---

## Deployment Architecture

```
Single Property (Guesthouse):
┌──────────────────────────────────────────────────────┐
│          AWS / DigitalOcean Single Server            │
├──────────────────────────────────────────────────────┤
│ t3.micro EC2 ($10/mo)          RDS PostgreSQL        │
│ ┌──────────────────────┐       ($30/mo)             │
│ │ Docker Compose       │       ┌──────────────────┐  │
│ ├──────────────────────┤       │ postgres DB      │  │
│ │ • Frappe app         │      │ • 20GB storage   │  │
│ │   (gunicorn 2 workers)│      │ • Automated     │  │
│ │ • React frontend     │      │   backups        │  │
│ │   (nginx reverse proxy)│      │ • Read replicas  │  │
│ │ • PostgreSQL         │       │   (optional)     │  │
│ │ • Redis              │       └──────────────────┘  │
│ │ • Celery worker      │                             │
│ │ • Bench              │       ElastiCache Redis     │
│ │                      │       ($20/mo)              │
│ │ Total: ~4GB RAM      │       ┌──────────────────┐  │
│ │ 1 vCPU               │       │ cache.t3.micro   │  │
│ │ 50GB storage         │       │ • Session store  │  │
│ └──────────────────────┘       │ • Task queue     │  │
│                                │ • Rate limiting  │  │
│       HTTPS Port 443            └──────────────────┘  │
│       Let's Encrypt SSL                              │
│       Static IP: ×.×.×.×                             │
└──────────────────────────────────────────────────────┘
         ↓
┌──────────────────────────────────────────────────────┐
│          External Services                          │
├──────────────────────────────────────────────────────┤
│ Razorpay (Payment) | Twilio (SMS/WhatsApp) |        │
│ SendGrid (Email)   | Google Maps API       |        │
│ Firebase (Push)    | BookPondy.com sync    |        │
└──────────────────────────────────────────────────────┘

Monthly Cost: ~$65-80
Capacity: 20 rooms, 100+ bookings/month


Multi-Property (Resort Chain):
┌──────────────────────────────────────────────────────────┐
│         AWS or DigitalOcean Managed Infrastructure     │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Load Balancer (ALB)                                     │
│  └─ Distributes traffic to EC2 instances                 │
│     └─ Healthchecks every 30 seconds                     │
│        └─ Auto-remove unhealthy instances                │
│                                                          │
│  EC2 Instances (Auto-Scaling Group: 2-5)                │
│  ├─ t3.small × 2 base capacity                          │
│  ├─ Scales up if CPU > 70% or Memory > 75%             │
│  ├─ Each runs Docker containers:                        │
│  │  • Frappe app (gunicorn 4 workers)                   │
│  │  • React frontend (nginx)                            │
│  │  • Celery worker (background jobs)                   │
│  └─ Total: ~8GB RAM, 2 vCPUs, 100GB SSD                │
│                                                          │
│  Managed PostgreSQL                                     │
│  ├─ db.t3.small ($80/mo)                               │
│  ├─ Multi-AZ deployment (HA)                            │
│  ├─ Automated daily backups                             │
│  ├─ Read replicas for scale                             │
│  ├─ Point-in-time recovery                              │
│  └─ Encryption at rest                                  │
│                                                          │
│  ElastiCache Redis Cluster                             │
│  ├─ 2 nodes with automatic failover                     │
│  ├─ 5GB capacity                                        │
│  └─ Replication for HA                                  │
│                                                          │
│  CloudFront CDN                                         │
│  ├─ Static assets (JS, CSS, images)                     │
│  ├─ Global edge locations                               │
│  ├─ Automatic compression & caching                     │
│  └─ ~$5-50/mo depending on usage                        │
│                                                          │
│  S3 Bucket (Backups & Images)                          │
│  ├─ PostgreSQL backups (daily, 30-day retention)        │
│  ├─ Guest document storage (encrypted)                  │
│  ├─ Property photos (original + thumbnail)              │
│  └─ ~$20-50/mo                                          │
│                                                          │
│  CloudWatch Monitoring                                  │
│  ├─ Log aggregation                                     │
│  ├─ Metric dashboards                                   │
│  ├─ Alarms (CPU, memory, disk, errors)                  │
│  └─ ~$10-30/mo                                          │
│                                                          │
└──────────────────────────────────────────────────────────┘

Monthly Cost: $250-350
Capacity: Unlimited rooms, 10,000+ bookings/month, 1000+ concurrent users


Kubernetes (Enterprise):
┌──────────────────────────────────────────────────────────┐
│            EKS / GKE / DigitalOcean Kubernetes          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Control Plane (Managed)                                │
│  ├─ API server, etcd, scheduler                         │
│  ├─ Managed by cloud provider                           │
│  └─ No additional cost                                  │
│                                                          │
│  Worker Nodes (Auto-scaling)                            │
│  ├─ 3 nodes minimum (t3.medium) for HA                 │
│  ├─ Scales to 10+ during peak traffic                   │
│  ├─ Each pod (containerized service) can be:            │
│  │  • Frappe app container                              │
│  │  • React frontend (nginx) container                  │
│  │  • Celery worker container                           │
│  │  • Database migration job                            │
│  └─ Orchestration via Kubernetes                        │
│                                                          │
│  StatefulSet for PostgreSQL (optional)                  │
│  ├─ Run PostgreSQL inside K8s with persistence          │
│  ├─ Or use managed database (RDS, Cloud SQL)            │
│  └─ Persistent volumes for data                         │
│                                                          │
│  Service Discovery (built-in)                           │
│  ├─ DNS names resolve to pods automatically             │
│  ├─ Load balancing within cluster                       │
│  └─ Service mesh (Istio) for advanced routing           │
│                                                          │
│  Horizontal Pod Autoscaling (HPA)                       │
│  ├─ Scale pods based on CPU/memory metrics              │
│  ├─ If CPU > 70%, spin up new pod                       │
│  ├─ Min replicas: 2, Max: 20                            │
│  └─ Scales to meet demand automatically                 │
│                                                          │
│  ConfigMaps & Secrets                                   │
│  ├─ Store environment variables                         │
│  ├─ API keys, database passwords (encrypted)            │
│  ├─ Update without redeploying pods                     │
│  └─ Version control & audit trail                       │
│                                                          │
│  Ingress (External Access)                              │
│  ├─ External load balancer (cloud provider)             │
│  ├─ Routes traffic to service backend                   │
│  ├─ SSL/TLS termination                                 │
│  └─ DNS routing (api.bookpondy.com → ingress)           │
│                                                          │
│  CI/CD Integration                                      │
│  ├─ GitHub Actions pushes image to registry             │
│  ├─ Kubernetes pulls new image                          │
│  ├─ Rolling updates (old pods → new pods)               │
│  └─ Zero-downtime deployments                           │
│                                                          │
│  Monitoring & Logging (ELK Stack or cloud native)       │
│  ├─ Prometheus metrics collection                       │
│  ├─ Grafana dashboards                                  │
│  ├─ ELK (Elasticsearch, Logstash, Kibana) for logs      │
│  └─ Alerting (Slack, PagerDuty)                         │
│                                                          │
└──────────────────────────────────────────────────────────┘

Monthly Cost: $500-1000+ (depending on scale & cloud provider)
Capacity: Enterprise-scale, 100,000+ bookings/month, 10,000+ concurrent users
```

---

## Success Metrics & KPIs

```
Technical Metrics:
├── API Response Time
│   └─ Target: < 200ms for 95th percentile
├── Availability/Uptime
│   └─ Target: 99.9% SLA (45 mins downtime/month)
├── Database Query Time
│   └─ Target: < 100ms for standard queries
├── Cache Hit Rate
│   └─ Target: > 85% (reduces DB load)
└── Deployment Frequency
    └─ Target: > 1x per day with zero-downtime

Business Metrics:
├── Booking Success Rate
│   └─ Target: > 95% (bookings that complete payment)
├── Payment Processing Time
│   └─ Target: < 5 seconds (from payment to confirmation)
├── Marketplace Sync Accuracy
│   └─ Target: 100% (no discrepancies between PMS & marketplace)
├── Guest Satisfaction (NPS)
│   └─ Target: > 50 (strong likelihood to recommend)
└── Property Manager Adoption Rate
    └─ Target: > 80% (use PMS for 80% of operations)
```

This comprehensive architecture guide provides the blueprint for building BookPondy PMS - a scalable, enterprise-grade hospitality management platform that grows with your business.
