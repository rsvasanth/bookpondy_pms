# BookPondy PMS - Property Management System
## Enterprise Hospitality Management Platform

**Version:** 1.0  
**Date:** December 30, 2025  
**Tech Stack:** Frappe/ERPNext v15 + Raven (Backend) + Doppio (Mobile) + React (Frontend)  
**Scope:** Guesthouse → Villa → Resort (Single to Multi-Property Scalability)  
**Integration:** Marketplace Sync with BookPondy.com  

---

## EXECUTIVE SUMMARY

BookPondy PMS is a **versatile, enterprise-grade hospitality management system** built to serve:

- **Single Property Managers** (Guesthouse, 5-10 rooms)
- **Multi-Property Operators** (Villa Network, 3-5 properties)
- **Full-Fledged Resorts** (200+ rooms, complex operations)

**Why BookPondy Builds This:**
1. **Control** - Manage inventory independently before syncing to marketplace
2. **Differentiation** - Custom booking flows, pricing, availability rules
3. **Revenue Optimization** - Channel management, rate parity, dynamic pricing
4. **Guest Experience** - Personalized interactions, pre-arrival comms, post-stay follow-up
5. **Marketplace Integration** - Sync listings, availability, bookings to BookPondy.com
6. **Data Ownership** - Keep guest data, operational metrics, business intelligence

**Core Pillars:**
```
┌─────────────────────────────────────────────────────────┐
│         BookPondy PMS - Hospitality Hub                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  INVENTORY   │  │  OPERATIONS  │  │   REVENUE    │ │
│  │  MANAGEMENT  │  │  MANAGEMENT  │  │ MANAGEMENT   │ │
│  │              │  │              │  │              │ │
│  │ • Properties │  │ • Housekeep  │  │ • Dynamic    │ │
│  │ • Rooms      │  │ • Maintenance│  │   Pricing    │ │
│  │ • Amenities  │  │ • Staff      │  │ • Channels   │ │
│  │ • Rates      │  │ • Tasks      │  │ • Commissions│ │
│  │ • Availability│ │ • Reports    │  │ • Reports    │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  BOOKINGS    │  │   GUESTS     │  │ MARKETPLACE  │ │
│  │  MANAGEMENT  │  │  MANAGEMENT  │  │   SYNC       │ │
│  │              │  │              │  │              │ │
│  │ • Direct     │  │ • Profiles   │  │ • Listings   │ │
│  │ • OTA        │  │ • Preferences│  │ • Inventory  │ │
│  │ • Walk-in    │  │ • Reviews    │  │ • Bookings   │ │
│  │ • Groups     │  │ • History    │  │ • Payments   │ │
│  │ • Pos        │  │ • Comms      │  │ • Analytics  │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                         │
└─────────────────────────────────────────────────────────┘

                ↓↓↓ INTEGRATION ↓↓↓

          BookPondy.com Marketplace
        (Listings, Bookings, Payments)
```

---

## PART 1: ARCHITECTURE & TECH STACK

### 1.1 System Architecture (Multi-Tier)

```
┌─────────────────────────────────────────────────────────────┐
│                   CLIENT LAYER                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────┐  ┌──────────────────────────────┐ │
│  │   React Web App     │  │   Doppio Mobile App          │ │
│  │  (Dashboard)        │  │  (Staff, Guest Check-in)     │ │
│  │                     │  │                              │ │
│  │ • Property Mgmt     │  │ • Check-in/out              │ │
│  │ • Booking Engine    │  │ • Task management           │ │
│  │ • Revenue Ops       │  │ • Guest communication       │ │
│  │ • Reports & BI      │  │ • Offline-first sync        │ │
│  │ • Staff Dashboard   │  │ • Real-time notifications   │ │
│  │ • Guest Portal      │  │ • Photo/document capture    │ │
│  └─────────────────────┘  └──────────────────────────────┘ │
│           │ REST API                     │ REST API          │
│           │ WebSocket                    │ WebSocket         │
└─────────────────────────────────────────────────────────────┘
              ↓↓↓ HTTP/HTTPS over TCP/IP ↓↓↓

┌─────────────────────────────────────────────────────────────┐
│                    API LAYER                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │        Raven (Frappe API Layer)                        │ │
│  │  • REST API endpoints (CRUD operations)               │ │
│  │  • Real-time WebSocket (bookings, tasks, notifications)│
│  │  • Rate limiting, auth, middleware                    │ │
│  │  • Request validation, error handling                 │ │
│  │  • API versioning (v1, v2 future)                     │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │   Custom Frappe Doctypes & Controllers                │ │
│  │  • Booking, Guest, Room, Rate, Task, etc.             │ │
│  │  • Business logic, validations, workflows             │ │
│  │  • Hooks for events (before_insert, after_submit)     │ │
│  │  • Permissions, role-based access control             │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
              ↓↓↓ Python Framework ↓↓↓

┌─────────────────────────────────────────────────────────────┐
│                 APPLICATION LAYER                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │      Frappe/ERPNext v15 Framework                      │ │
│  │                                                        │ │
│  │  • ORM (Database abstraction layer)                   │ │
│  │  • Built-in modules: Accounting, HR, Selling         │ │
│  │  • Workflow engine (booking approval, checkins)       │ │
│  │  • Report builder & dashboards                        │ │
│  │  • User roles & permissions                           │ │
│  │  • Form customization (custom fields, validations)    │ │
│  │  • Scheduled jobs & background tasks (Celery)         │ │
│  │  • File management (guest docs, property photos)      │ │
│  │  • Communication (email, SMS, WhatsApp)               │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │   Custom Business Logic (Python Classes)              │ │
│  │  • Rate calculation engine (seasonal, occupancy)       │ │
│  │  • Availability synchronization                        │ │
│  │  • Commission & payout calculations                    │ │
│  │  • Guest communication workflows                       │ │
│  │  • Integration with external services                  │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
              ↓↓↓ SQL Database & Cache ↓↓↓

┌─────────────────────────────────────────────────────────────┐
│                 DATA LAYER                                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────┐  ┌──────────────────────────┐ │
│  │   PostgreSQL/MariaDB     │  │   Redis Cache            │ │
│  │   (Primary Datastore)    │  │   (Session, Real-time)   │ │
│  │                          │  │                          │ │
│  │ • Bookings               │  │ • WebSocket connections  │ │
│  │ • Guests, Contacts       │  │ • Rate calculations      │ │
│  │ • Properties, Rooms      │  │ • Session store          │ │
│  │ • Rates, Pricing         │  │ • Task queues (Celery)   │ │
│  │ • Tasks, Logs            │  │ • Rate limiting          │ │
│  │ • Transactions           │  │ • Pub/Sub messaging      │ │
│  │ • Files & Attachments    │  │                          │ │
│  │ • Custom fields (JSON)   │  │ • RabbitMQ/MQTT (async)  │ │
│  └──────────────────────────┘  └──────────────────────────┘ │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐ │
│  │    Elasticsearch (Optional, for advanced search)     │ │
│  │  • Guest search, booking history full-text search    │ │
│  │  • Analytics aggregations                            │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘

                ↓↓↓ External Integrations ↓↓↓

┌─────────────────────────────────────────────────────────────┐
│          INTEGRATION & SERVICES LAYER                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ BookPondy.com│  │  Payment     │  │  WhatsApp/   │     │
│  │  Marketplace │  │  Gateway     │  │  SMS API     │     │
│  │ (Sync Engine)│  │ (Razorpay)   │  │ (Twilio)     │     │
│  │              │  │              │  │              │     │
│  │ • Listings   │  │ • Charges    │  │ • OTP        │     │
│  │ • Bookings   │  │ • Refunds    │  │ • Check-in   │     │
│  │ • Availability  │ • Webhooks   │  │ • Alerts     │     │
│  │ • Reviews    │  │ • Settlement │  │ • Reminders  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Google Maps │  │  Email       │  │  Analytics   │     │
│  │  (Location)  │  │  (SendGrid)  │  │  (Google GA) │     │
│  │              │  │              │  │              │     │
│  │ • Distance   │  │ • Confirmations│ • Conversions │     │
│  │ • Directions │  │ • Receipts   │  │ • Performance│     │
│  │ • Photos     │  │ • Reminders  │  │ • Heatmaps   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                             │
└─────────────────────────────────────────────────────────────┘

                ↓↓↓ DevOps & Deployment ↓↓↓

┌─────────────────────────────────────────────────────────────┐
│         INFRASTRUCTURE LAYER                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐ │
│  │     Docker Containers (Compose or K8s)              │ │
│  │  • Frappe app container                             │ │
│  │  • React frontend container                         │ │
│  │  • Nginx/reverse proxy                              │ │
│  │  • PostgreSQL container                             │ │
│  │  • Redis container                                  │ │
│  │  • Celery workers (async tasks)                     │ │
│  │  • Bench (Frappe dev environment)                   │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  Cloud Hosting (AWS/DigitalOcean/NIC)               │ │
│  │  • Static IP for server stability                   │ │
│  │  • SSL/TLS certificates (Let's Encrypt)             │ │
│  │  • CDN for static assets (CloudFlare)               │ │
│  │  • Backup & disaster recovery                       │ │
│  │  • Auto-scaling for high traffic                    │ │
│  │  • Monitoring & logging (ELK, Datadog)              │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Tech Stack Details

```yaml
Backend:
  Framework: Frappe v15 (Python)
    - Built-in ORM, permission system, workflow engine
    - REST API ready (Raven)
    - Extensible via custom doctypes, methods, hooks
    - Background job processing (Celery + Redis)
    - Multi-tenancy support (multiple sites/properties)
    - Bench CLI for development & deployment
  
  API Layer: Raven (Real-time API wrapper for Frappe)
    - REST endpoints for all doctypes
    - WebSocket for real-time updates
    - Authentication via JWT tokens
    - Rate limiting & API key management
    - Request validation & middleware
    - Error standardization
  
  Database:
    Primary: PostgreSQL 14+ or MariaDB 10.6+
      - ACID compliance for transactions
      - JSONB for custom fields flexibility
      - Full-text search capabilities
      - Replication for backups
    
    Cache: Redis 6+
      - Session management
      - WebSocket subscriptions
      - Rate limit counters
      - Task queues (Celery)
      - Real-time notifications
    
    Optional: Elasticsearch 7+ (for advanced search)
      - Guest history full-text search
      - Booking analytics aggregations
      - Log indexing & analysis
  
  Task Queue: Celery + Redis
    - Async email sends (confirmations, reminders)
    - Availability sync to marketplace
    - Rate calculation background jobs
    - Report generation
    - Webhook processing
  
  Background Jobs:
    - Scheduled daily availability sync
    - Weekly revenue reports
    - Monthly invoice generation
    - Payment settlement (if using bank API)

Frontend Web:
  Framework: React 18+
    - Vite build tool (fast HMR, optimized bundles)
    - TypeScript for type safety
    - React Router for navigation
    - Context API / Redux for state management
  
  UI Components:
    - shadcn/ui (headless components)
    - Tailwind CSS for styling
    - Framer Motion for animations
    - React Query for data fetching & caching
  
  Key Libraries:
    - Axios for HTTP requests
    - Socket.io for real-time updates
    - Chart.js / D3.js for dashboards
    - React Calendar for availability picker
    - Form validation: React Hook Form + Zod
    - Date/time: Day.js
    - Notifications: Toast library
    - Markdown editor for property descriptions
  
  Performance:
    - Code splitting by route
    - Lazy loading of images
    - Service Worker for offline support
    - IndexedDB for local caching
    - Gzip compression

Mobile App:
  Framework: Doppio (React Native-like wrapper or Flutter alternative)
    - Cross-platform (iOS/Android from single codebase)
    - Offline-first sync
    - Native performance
  
  Key Features:
    - Check-in/out QR code scanning
    - Task management with real-time updates
    - Guest communication (WhatsApp, SMS)
    - Push notifications
    - Photo/document capture
    - Offline-first operations (sync when online)
    - Biometric authentication (fingerprint)
  
  Storage:
    - SQLite for local data (rooms, guests, tasks)
    - File system for photos/documents
    - Realm DB for reactive updates

DevOps & Deployment:
  Containerization:
    - Docker & Docker Compose (for local dev)
    - Kubernetes (optional, for scaling)
    - Docker Hub for image registry
  
  Deployment:
    - AWS EC2 / DigitalOcean Droplets / NIC cloud
    - GitHub Actions for CI/CD
    - Automated tests (pytest, Jest)
    - Static IP for WhatsApp webhook
  
  Monitoring:
    - Datadog or ELK stack for logs
    - Sentry for error tracking
    - Prometheus for metrics
    - Uptime monitoring (Betterstack)
  
  Security:
    - SSL/TLS certificates (Let's Encrypt, auto-renew)
    - WAF (CloudFlare)
    - Rate limiting (Redis)
    - Input validation & sanitization
    - OWASP compliance
    - Database encryption at rest
    - Backup encryption
    - Regular security audits

Version Control & Collaboration:
  - GitHub for code repository
  - Git flow workflow (main, develop, feature branches)
  - Pull request reviews
  - Issue tracking (GitHub Issues)
  - Documentation (README, wiki)
  - NPM/PyPI for dependency management

Testing:
  Backend:
    - pytest for unit & integration tests
    - Frappe testing framework
    - Coverage >80%
  
  Frontend:
    - Jest for unit tests
    - React Testing Library for component tests
    - Cypress for E2E tests
    - Accessibility testing (axe)
  
  Mobile:
    - Native testing frameworks
    - Integration tests with API
```

---

## PART 2: CORE MODULES & FEATURES

### 2.1 Inventory Management

**Properties Doctype:**
```python
class Property(Document):
    """
    Represents a guesthouse, villa, apartment, or resort property.
    Supports single to multi-property management.
    """
    
    fields = {
        'property_name': 'String',           # e.g., "Beachfront Villa"
        'property_type': 'Select',           # Guesthouse, Villa, Resort, Apartment
        'owner_name': 'Link',                # Reference to User/Owner
        'address': 'Text',                   # Full address with pincode
        'location': 'Link',                  # Pondicherry, Auroville, etc.
        'latitude': 'Float',                 # For map integration
        'longitude': 'Float',
        'description': 'Text Editor',        # Property overview
        'summary': 'String',                 # Short tagline (50 chars)
        'total_rooms': 'Int',                # Count of rooms
        'amenities': 'Table',                # Multi-row (WiFi, Pool, AC, etc.)
        'amenities_list': [                  # JSON array for flexibility
            {'name': 'WiFi', 'icon': 'wifi', 'category': 'connectivity'},
            {'name': 'Kitchen', 'icon': 'utensils', 'category': 'cooking'},
        ],
        'house_rules': 'Text',               # Check-in time, pets, smoking, noise
        'cancellation_policy': 'Select',     # Flexible, Moderate, Strict
        'status': 'Select',                  # Active, Draft, Archived
        'marketplace_sync': 'Bool',          # Sync to BookPondy.com?
        'marketplace_id': 'String',          # Unique ID on marketplace
        'min_stay': 'Int',                   # Minimum nights
        'max_guests': 'Int',                 # Max occupancy
        'cover_image': 'Attach',             # Hero image
        'gallery': 'Table',                  # Multiple images with captions
        'property_manager': 'Link',          # Staff member managing property
        'manager_contact': 'String',         # Phone number
        'coordinates': 'Geolocation',        # JSON: lat, lng
        'created_at': 'Datetime',
        'updated_at': 'Datetime',
    }
    
    def on_insert(self):
        """Trigger marketplace sync when property created."""
        if self.marketplace_sync:
            frappe.enqueue('bookpondy_pms.integrations.sync_to_marketplace',
                          property_id=self.name)
    
    def validate(self):
        """Business logic validation."""
        if self.total_rooms < 1:
            frappe.throw("Property must have at least 1 room")
        if not self.property_manager:
            frappe.msgprint("Please assign a property manager")

# Example creation in Frappe UI or API:
# POST /api/resource/Property
# {
#   "property_name": "Auroville Wellness Retreat",
#   "property_type": "Villa",
#   "total_rooms": 6,
#   "address": "Main Road, Auroville, Pondicherry 605101",
#   "owner_name": "priya@bookpondy.com",
#   "marketplace_sync": true
# }
```

**Room Doctype:**
```python
class Room(Document):
    """
    Individual room/unit within a property.
    Tracks occupancy, availability, and rate codes.
    """
    
    fields = {
        'property': 'Link',                  # Parent property (Property doctype)
        'room_number': 'String',             # e.g., "101", "Deluxe Suite"
        'room_type': 'Select',               # Single, Double, Suite, Dorm
        'bed_type': 'Select',                # Single, Double, Queen, King
        'capacity': 'Int',                   # Max guests (typically 1-4)
        'status': 'Select',                  # Available, Occupied, Maintenance, Blocked
        'rate_category': 'Link',             # Reference to Rate doctype (pricing)
        'amenities': 'Table',                # Room-specific: A/C, WiFi, TV, etc.
        'base_price': 'Currency',            # Default rate
        'currency': 'String',                # INR, USD, EUR
        'images': 'Table',                   # Room photos
        'floor': 'Int',                      # Floor number (optional)
        'maintenance_notes': 'Text',         # Damage, repairs needed
        'last_maintenance': 'Date',          # Track upkeep
        'created_at': 'Datetime',
    }
    
    def before_save(self):
        """Auto-calculate based on property defaults."""
        if not self.rate_category:
            self.rate_category = frappe.db.get_value(
                'Rate', {'property': self.property, 'is_default': True}
            )

# Example:
# {
#   "property": "Auroville Wellness Retreat",
#   "room_number": "101",
#   "room_type": "Double",
#   "bed_type": "Queen",
#   "capacity": 2,
#   "status": "Available",
#   "base_price": 5000,
#   "currency": "INR"
# }
```

**Rate & Pricing Doctype:**
```python
class Rate(Document):
    """
    Dynamic pricing engine.
    Supports seasonal rates, occupancy-based pricing, min-stay discounts.
    """
    
    fields = {
        'property': 'Link',                  # Which property
        'rate_name': 'String',               # e.g., "Summer Peak", "Winter"
        'rate_type': 'Select',               # Standard, Seasonal, Holiday, Dynamic
        'valid_from': 'Date',                # Rate start date
        'valid_till': 'Date',                # Rate end date
        'base_rate': 'Currency',             # Per-night rate
        'weekend_rate': 'Currency',          # Fri-Sat premium (optional)
        'occupancy_rules': 'Table',          # Occupancy threshold pricing
            # E.g., 50% discount if <50% occupancy, full price if >75%
        'min_stay_discounts': 'Table',       # Longer stays = discounts
            # 7 nights: 10% off, 14 nights: 20% off, 30 nights: 30% off
        'extra_guest_fee': 'Currency',       # Additional per guest/night
        'cleaning_fee': 'Currency',          # One-time
        'service_fee': 'Currency',           # Per stay (flat or %)
        'markup_percentage': 'Percent',      # If using dynamic pricing
        'is_default': 'Bool',                # Default rate for property
        'is_active': 'Bool',
        'currency': 'String',
        'created_at': 'Datetime',
    }
    
    def calculate_total_price(self, check_in, check_out, num_guests):
        """
        Calculate total stay price with all fees.
        Returns: {base: 5000, cleaning: 1000, service: 400, discount: -500, total: 5900}
        """
        nights = (check_out - check_in).days
        
        # Base rate (could be seasonal, occupancy-adjusted)
        base_rate = self.get_applicable_rate(check_in, num_guests)
        base_cost = base_rate * nights
        
        # Min-stay discount
        discount = self.get_min_stay_discount(nights, base_cost)
        
        # Fees
        cleaning = self.cleaning_fee or 0
        service = self.service_fee or (base_cost * 0.1)  # 10% default
        extra_guest = max(0, num_guests - 2) * self.extra_guest_fee * nights
        
        total = base_cost + cleaning + service + extra_guest - discount
        
        return {
            'base': base_cost,
            'cleaning': cleaning,
            'service': service,
            'extra_guest': extra_guest,
            'discount': discount,
            'subtotal': base_cost + cleaning + service + extra_guest,
            'total': total,
            'currency': self.currency,
        }
```

**Availability Doctype:**
```python
class Availability(Document):
    """
    Tracks room availability calendar.
    Syncs to marketplace every night.
    """
    
    fields = {
        'property': 'Link',
        'room': 'Link',
        'date': 'Date',
        'status': 'Select',                  # Available, Blocked, Booked, Not Available
        'rate': 'Currency',                  # Rate for this date (optional override)
        'notes': 'String',
        'booked_by': 'Link',                 # Reference to Booking doctype
    }
    
    def create_from_booking(booking):
        """When booking is created, mark dates as unavailable."""
        for date in get_date_range(booking.check_in, booking.check_out):
            Availability.create({
                'property': booking.property,
                'room': booking.room,
                'date': date,
                'status': 'Booked',
                'booked_by': booking.name,
            })

# Typical view: Calendar grid showing 30/90 days availability
# Green = Available, Red = Booked, Gray = Blocked, Yellow = Pending
```

---

### 2.2 Booking & Reservation Management

**Booking Doctype:**
```python
class Booking(Document):
    """
    Core booking/reservation entity.
    Lifecycle: Inquiry → Pending → Confirmed → Checked-in → Checked-out → Completed
    """
    
    fields = {
        'booking_id': 'String',              # Auto-generated: BOK-2025-001234
        'status': 'Select',                  # Inquiry, Pending, Confirmed, Checked-in, Checked-out, Cancelled
        'booking_source': 'Select',          # Direct, BookPondy, Airbnb, Booking.com, Walk-in
        'guest': 'Link',                     # Reference to Guest doctype
        'property': 'Link',                  # Which property
        'room': 'Link',                      # Which room
        'check_in': 'DateTime',              # Check-in time (default 2 PM)
        'check_out': 'DateTime',             # Check-out time (default 11 AM)
        'num_guests': 'Int',                 # Total guests
        'guest_breakdown': 'Table',          # Adults, children, ages (for reporting)
            # E.g., [{'type': 'Adult', 'count': 2}, {'type': 'Child', 'count': 1}]
        'special_requests': 'Text',          # Late check-in, early check-out, high floor, crib, etc.
        'price_breakdown': 'Table',          # Line items (base, cleaning, service, taxes, discount)
        'total_price': 'Currency',           # Final amount due
        'paid_amount': 'Currency',           # Amount received so far
        'balance_due': 'Currency',           # Remaining to pay
        'payment_method': 'Select',          # Credit Card, UPI, Bank Transfer, Cash
        'payment_status': 'Select',          # Unpaid, Partial, Paid, Refunded
        'advance_paid': 'Bool',              # If pre-payment required
        'advance_amount': 'Currency',        # Typically 25-50% of total
        'currency': 'String',                # INR, USD, etc.
        'cancellation_policy': 'Select',     # Flexible, Moderate, Strict (inherited from property)
        'cancellation_fee': 'Currency',      # If cancelled, how much to retain
        'notes': 'Text',                     # Internal notes
        'guest_notes': 'Text',               # What guest mentioned
        'created_by': 'Link',                # Who took the booking (staff, online, etc.)
        'created_at': 'Datetime',
        'updated_at': 'Datetime',
    }
    
    def on_submit(self):
        """
        Mark status as Confirmed.
        1. Update room availability
        2. Send confirmation email/WhatsApp
        3. Sync to marketplace
        """
        self.status = 'Confirmed'
        
        # Create availability records
        Availability.create_from_booking(self)
        
        # Send notification to guest
        send_booking_confirmation(self.guest, self)
        
        # Notify property manager
        send_staff_notification(self.property, f"New booking: {self.booking_id}")
        
        # Sync to marketplace if from direct booking
        if self.booking_source == 'Direct':
            sync_availability_to_marketplace(self.property)
    
    def validate(self):
        """Check availability and pricing."""
        if not self.is_room_available(self.room, self.check_in, self.check_out):
            frappe.throw("Room not available for selected dates")
        
        if self.check_out <= self.check_in:
            frappe.throw("Check-out must be after check-in")
        
        # Calculate price
        rate = frappe.get_doc('Rate', self.room.rate_category)
        pricing = rate.calculate_total_price(
            self.check_in.date(), 
            self.check_out.date(), 
            self.num_guests
        )
        self.total_price = pricing['total']
        self.price_breakdown = [
            {'item': 'Room Rate', 'amount': pricing['base']},
            {'item': 'Cleaning', 'amount': pricing['cleaning']},
            {'item': 'Service Fee', 'amount': pricing['service']},
            {'item': 'Discount', 'amount': -pricing['discount']},
        ]

# Booking lifecycle workflow (built into Frappe):
# Inquiry → [Approve/Reject] → Pending → [Confirm] → Confirmed
#           → [Cancel] → Cancelled
# Confirmed → [Check-in] → Checked-in → [Check-out] → Checked-out → Completed
```

**Guest Doctype:**
```python
class Guest(Document):
    """
    Guest profile with contact info, preferences, booking history.
    """
    
    fields = {
        'guest_id': 'String',                # Unique guest ID
        'first_name': 'String',
        'last_name': 'String',
        'email': 'Email',
        'phone': 'String',                   # Whatsapp-capable phone
        'country': 'String',                 # For international guests
        'nationality': 'String',             # Visa tracking
        'guest_type': 'Select',              # Individual, Couple, Family, Group, Corporate
        'identification_type': 'Select',     # Passport, Aadhar, PAN, Driver License
        'identification_number': 'String',   # Encrypted
        'date_of_birth': 'Date',
        'address': 'Text',
        'preferences': 'Table',              # High floor, king bed, pool view, etc.
        'allergies_restrictions': 'Text',    # Dietary, accessibility, etc.
        'loyalty_program': 'Link',           # If enrolled (future)
        'total_bookings': 'Int',             # Count
        'total_spent': 'Currency',           # Revenue from this guest
        'average_rating': 'Float',           # Out of 5 stars
        'last_stay_date': 'Date',
        'created_at': 'Datetime',
    }
    
    def before_insert(self):
        """Auto-generate guest ID."""
        count = frappe.db.count('Guest')
        self.guest_id = f"GUEST-{frappe.utils.now().strftime('%Y%m%d')}-{count+1:04d}"

# Guest profile enables:
# - Repeat guest discounts
# - Personalized communication
# - Preference tracking (room type, amenities)
# - VIP treatment (loyalty program)
```

---

### 2.3 Operations Management

**Task Doctype:**
```python
class Task(Document):
    """
    Housekeeping, maintenance, and operational tasks.
    Real-time task assignment via mobile app.
    """
    
    fields = {
        'task_id': 'String',
        'property': 'Link',
        'task_type': 'Select',               # Housekeeping, Maintenance, Repair, Deep Clean, Inspection
        'room': 'Link',                      # Which room (if applicable)
        'description': 'Text',
        'assigned_to': 'Link',               # Staff member
        'status': 'Select',                  # Pending, In Progress, Completed, Cancelled
        'priority': 'Select',                # Low, Medium, High, Urgent
        'due_date': 'Date',
        'due_time': 'Time',
        'checklist': 'Table',                # Subtasks
            # E.g., [
            #   {'item': 'Clean bathrooms', 'completed': True},
            #   {'item': 'Change bedsheets', 'completed': True},
            #   {'item': 'Restock amenities', 'completed': False},
            # ]
        'completion_time': 'DateTime',
        'notes': 'Text',
        'attachments': 'Table',              # Photos of completed task
        'created_at': 'Datetime',
    }
    
    def on_creation(self, task_type):
        """Auto-create standard tasks based on booking events."""
        if task_type == 'checkout':
            # Create tasks: Clean room, Inspect, Restock
            create_task(f"Clean Room {self.room}", 'Housekeeping', self.property)
            create_task(f"Inspect Room {self.room}", 'Inspection', self.property)
    
    def on_submit(self):
        """Task completed - notify manager."""
        send_notification(f"Task completed: {self.task_id}")

# Real-time task management flow:
# 1. Property manager creates tasks in dashboard
# 2. Task assigned to staff member (push notification via Doppio)
# 3. Staff member gets real-time notification on mobile
# 4. Staff member marks as in-progress, uploads photos
# 5. Staff marks as completed (with checklist verification)
# 6. Manager reviews & approves
# 7. Notification sent that room is ready
```

**Staff & Role Management:**
```python
class Staff(Document):
    """
    Team members managing properties.
    """
    
    fields = {
        'staff_id': 'String',
        'user': 'Link',                      # Frappe User account
        'first_name': 'String',
        'phone': 'String',
        'properties': 'Table',               # Which properties assigned
        'role': 'Select',                    # Manager, Housekeeper, Maintenance, Receptionist
        'shift': 'Select',                   # Morning, Evening, Night, Flexible
        'status': 'Select',                  # Active, On Leave, Inactive
    }
```

---

### 2.4 Revenue Management

**Commission & Channel Management:**
```python
class ChannelCommission(Document):
    """
    Track commissions from different booking sources (OTA, marketplace, affiliate).
    """
    
    fields = {
        'booking': 'Link',                   # Reference to Booking
        'channel': 'Select',                 # BookPondy, Airbnb, Booking.com, Direct
        'commission_percentage': 'Percent',  # E.g., 15% for BookPondy
        'commission_amount': 'Currency',     # Calculated amount
        'status': 'Select',                  # Pending, Approved, Paid, Disputed
        'payment_date': 'Date',              # When paid
        'notes': 'Text',
    }

# Automatic commission calculation:
# Booking created from BookPondy → 15% commission
# Booking from Airbnb → 15% commission
# Direct booking → 0% commission
```

**Invoice & Payment Tracking:**
```python
class Invoice(Document):
    """
    Guest invoices (for payments, receipts).
    """
    
    fields = {
        'invoice_number': 'String',          # INV-2025-001234
        'booking': 'Link',
        'guest': 'Link',
        'property': 'Link',
        'issue_date': 'Date',
        'due_date': 'Date',
        'line_items': 'Table',               # Base rate, cleaning, service, taxes
        'subtotal': 'Currency',
        'tax_percentage': 'Percent',         # GST 5%/12%/18% in India
        'tax_amount': 'Currency',
        'total': 'Currency',
        'paid_amount': 'Currency',
        'balance_due': 'Currency',
        'status': 'Select',                  # Draft, Issued, Partial, Paid, Cancelled
        'notes': 'Text',
        'currency': 'String',
    }
    
    def on_submit(self):
        """Send invoice to guest via email."""
        send_invoice_email(self.guest, self)

# Tax compliance (GST for India):
# 5% GST: Boarding for non-AC rooms
# 12% GST: Boarding for AC rooms, food
# 18% GST: Liquor, premium services
```

**Payment & Transactions:**
```python
class Payment(Document):
    """
    Payment records from Razorpay, bank transfers, or cash.
    """
    
    fields = {
        'payment_id': 'String',              # Payment gateway ID
        'invoice': 'Link',
        'booking': 'Link',
        'gateway': 'Select',                 # Razorpay, Bank, Cash, UPI
        'amount': 'Currency',
        'payment_method': 'Select',          # Credit Card, Debit Card, UPI, Net Banking, Wallet
        'status': 'Select',                  # Pending, Authorized, Captured, Failed, Refunded
        'transaction_id': 'String',          # From payment gateway
        'receipt_url': 'String',             # Link to receipt
        'processed_at': 'Datetime',
        'notes': 'Text',
    }
    
    def on_insert(self):
        """Update booking payment status."""
        booking = frappe.get_doc('Booking', self.booking)
        booking.paid_amount += self.amount
        booking.payment_status = 'Paid' if booking.paid_amount >= booking.total_price else 'Partial'
        booking.save()

# Payment webhook from Razorpay:
# 1. Guest pays online
# 2. Razorpay sends webhook to PMS
# 3. Payment record created, status updated to "Captured"
# 4. Booking marked as confirmed
# 5. Confirmation email sent to guest
# 6. Staff task created: Prepare room
```

---

### 2.5 Marketplace Integration

**Sync Engine (Custom Python Module):**
```python
# bookpondy_pms/integrations/marketplace_sync.py

class MarketplaceSync:
    """
    Bidirectional sync with BookPondy.com marketplace.
    """
    
    def __init__(self):
        self.api_base = 'https://api.bookpondy.com'
        self.api_key = frappe.conf.get('bookpondy_api_key')
        self.api_secret = frappe.conf.get('bookpondy_api_secret')
    
    def sync_listings(self, property_id):
        """
        Push property info to marketplace.
        """
        property_doc = frappe.get_doc('Property', property_id)
        
        payload = {
            'marketplace_id': property_doc.marketplace_id,
            'name': property_doc.property_name,
            'description': property_doc.description,
            'address': property_doc.address,
            'images': [img.image_url for img in property_doc.gallery],
            'amenities': [a.name for a in property_doc.amenities_list],
            'total_rooms': property_doc.total_rooms,
            'rules': property_doc.house_rules,
        }
        
        response = requests.post(
            f'{self.api_base}/properties/{property_id}/sync',
            json=payload,
            headers=self.get_auth_headers()
        )
        
        return response.json()
    
    def sync_availability(self, property_id):
        """
        Push 90-day availability calendar to marketplace.
        Run daily at 2 AM.
        """
        availability = frappe.db.get_list(
            'Availability',
            filters={'property': property_id, 'date': ['>=', frappe.utils.today()]},
            fields=['date', 'status', 'rate'],
            order_by='date asc',
            limit_page_length=90,
        )
        
        payload = {
            'availability': availability,
            'sync_timestamp': frappe.utils.now(),
        }
        
        response = requests.post(
            f'{self.api_base}/availability/{property_id}/sync',
            json=payload,
            headers=self.get_auth_headers()
        )
        
        frappe.log_error(f"Availability sync: {response.json()}")
    
    def sync_booking_from_marketplace(self, marketplace_booking_data):
        """
        Receive booking from BookPondy.com marketplace.
        Create Booking doctype in PMS.
        """
        # marketplace_booking_data = {
        #   'marketplace_booking_id': 'MBK-2025-001',
        #   'property_id': 'Auroville Wellness',
        #   'guest': {
        #     'name': 'John Doe',
        #     'email': 'john@example.com',
        #     'phone': '+91 98765 43210',
        #   },
        #   'check_in': '2025-01-20',
        #   'check_out': '2025-01-25',
        #   'total_price': 25000,
        #   'source': 'BookPondy Marketplace',
        # }
        
        # Create or fetch guest
        guest = frappe.db.get_list(
            'Guest',
            filters={'email': marketplace_booking_data['guest']['email']},
            limit_page_length=1
        )
        
        if not guest:
            guest_doc = frappe.get_doc({
                'doctype': 'Guest',
                'first_name': marketplace_booking_data['guest']['name'],
                'email': marketplace_booking_data['guest']['email'],
                'phone': marketplace_booking_data['guest']['phone'],
            })
            guest_doc.insert()
            guest_id = guest_doc.name
        else:
            guest_id = guest[0].name
        
        # Create booking
        booking_doc = frappe.get_doc({
            'doctype': 'Booking',
            'booking_source': 'BookPondy',
            'guest': guest_id,
            'property': marketplace_booking_data['property_id'],
            'check_in': marketplace_booking_data['check_in'],
            'check_out': marketplace_booking_data['check_out'],
            'total_price': marketplace_booking_data['total_price'],
            'status': 'Confirmed',
            'notes': f"Marketplace ID: {marketplace_booking_data['marketplace_booking_id']}",
        })
        booking_doc.insert()
        booking_doc.submit()
        
        return booking_doc.name
    
    def get_auth_headers(self):
        """Generate authorization headers."""
        timestamp = int(frappe.utils.now().timestamp())
        message = f"{self.api_key}{timestamp}"
        signature = hmac.new(
            self.api_secret.encode(),
            message.encode(),
            hashlib.sha256
        ).hexdigest()
        
        return {
            'Authorization': f'Bearer {self.api_key}:{signature}',
            'X-Timestamp': str(timestamp),
            'Content-Type': 'application/json',
        }

# Scheduled jobs in Frappe:
# 1. Daily at 2 AM: Sync availability to marketplace
# 2. Every 6 hours: Pull new bookings from marketplace
# 3. Every 30 mins: Sync reviews from marketplace
# 4. Daily at 11 PM: Generate occupancy report

frappe.db.add_jobs({
    'cron': [
        {
            'method': 'bookpondy_pms.integrations.marketplace_sync.sync_availability_daily',
            'frequency': 'daily',
            'time': '02:00',
        },
        {
            'method': 'bookpondy_pms.integrations.marketplace_sync.sync_bookings_from_marketplace',
            'frequency': '0 */6 * * *',  # Every 6 hours
        },
    ]
})
```

**Webhook Receiver for Marketplace Events:**
```python
# bookpondy_pms/api/webhooks.py

@frappe.whitelist(allow_guest=True)
def marketplace_webhook(event_type, data):
    """
    Receive webhooks from BookPondy.com.
    
    Webhook types:
    - booking.created: New booking from marketplace
    - booking.cancelled: Guest cancelled marketplace booking
    - review.created: New review posted
    - message.received: Guest inquiry/message
    """
    
    try:
        if event_type == 'booking.created':
            sync = MarketplaceSync()
            booking_id = sync.sync_booking_from_marketplace(data)
            return {'status': 'success', 'booking_id': booking_id}
        
        elif event_type == 'booking.cancelled':
            # Cancel corresponding booking in PMS
            booking = frappe.db.get_value(
                'Booking',
                {'booking_source': 'BookPondy', 'notes': f"Marketplace ID: {data['marketplace_id']}"}
            )
            if booking:
                frappe.get_doc('Booking', booking).cancel()
            return {'status': 'success'}
        
        elif event_type == 'review.created':
            # Store review, trigger email to host
            frappe.get_doc({
                'doctype': 'Review',
                'booking': data['booking_id'],
                'rating': data['rating'],
                'comment': data['comment'],
                'reviewer_name': data['guest_name'],
            }).insert()
            return {'status': 'success'}
        
    except Exception as e:
        frappe.log_error(f"Webhook error: {e}")
        return {'status': 'error', 'message': str(e)}

# Webhook signature validation:
def verify_webhook_signature(request_data, signature, secret):
    """Verify Razorpay/marketplace webhook authenticity."""
    import hmac
    import hashlib
    
    message = request_data.get_data()
    expected_signature = hmac.new(
        secret.encode(),
        message,
        hashlib.sha256
    ).hexdigest()
    
    return hmac.compare_digest(signature, expected_signature)
```

---

### 2.6 Communication & Notifications

**Multi-Channel Communication:**
```python
class GuestCommunication(Document):
    """
    Track all communications with guests.
    Supports Email, WhatsApp, SMS, In-app notifications.
    """
    
    fields = {
        'guest': 'Link',
        'booking': 'Link',
        'channel': 'Select',                 # Email, WhatsApp, SMS, In-App
        'message_type': 'Select',            # Confirmation, Reminder, Query, Feedback
        'subject': 'String',
        'body': 'Text',
        'status': 'Select',                  # Draft, Queued, Sent, Failed, Read
        'sent_at': 'Datetime',
        'read_at': 'Datetime',
        'error_message': 'String',           # If failed
    }

# Automated communication triggers:

1. Booking Confirmation (immediately after payment)
   - Channel: Email + WhatsApp
   - Template: Confirmation with property details, check-in instructions
   - Variables: {{property_name}}, {{check_in_time}}, {{address}}, {{host_contact}}

2. Pre-Arrival Reminder (7 days before)
   - Channel: WhatsApp
   - Message: "Your stay at [Property] is coming up! Share your preferences."

3. 48-Hour Reminder (with check-in info)
   - Channel: Email + SMS
   - Includes: WiFi password, door code, parking info, house rules

4. Check-in Day Message (morning of arrival)
   - Channel: WhatsApp
   - Message: "Welcome to [Property]! Your room is ready. Arrive after 2 PM."

5. Check-in Confirmation (from staff)
   - Channel: In-App notification
   - Sent after guest checks in via Doppio app

6. Post-Checkout Review Request (1 day after checkout)
   - Channel: Email + In-App
   - Link: Direct to review form on marketplace

7. Thank You Message (3 days after checkout)
   - Channel: WhatsApp
   - Message: Thank you, share review, loyalty offer

# WhatsApp Business API Integration (Twilio):
from twilio.rest import Client

def send_whatsapp_message(phone, message):
    """Send WhatsApp message using Twilio."""
    client = Client(ACCOUNT_SID, AUTH_TOKEN)
    message = client.messages.create(
        from_='whatsapp:+14155552671',  # Twilio sandbox
        body=message,
        to=f'whatsapp:{phone}'
    )
    return message.sid

def send_check_in_code(guest_doc, check_in_code):
    """Send door code/access key via WhatsApp."""
    message = f"""
Welcome to {property_name}!

Your check-in code: {check_in_code}
Check-in time: 2:00 PM - 10:00 PM

📍 Address: {property_address}
📞 Host: {host_phone}

See you soon! 🎉
    """
    send_whatsapp_message(guest_doc.phone, message)

# Email templates (Jinja2 format):
# bookpondy_pms/email_templates/booking_confirmation.html
"""
<h2>Booking Confirmation</h2>
<p>Dear {{ guest_name }},</p>
<p>Your booking at <strong>{{ property_name }}</strong> is confirmed!</p>

<h3>Booking Details</h3>
<ul>
  <li><strong>Booking ID:</strong> {{ booking_id }}</li>
  <li><strong>Check-in:</strong> {{ check_in_date }} at 2:00 PM</li>
  <li><strong>Check-out:</strong> {{ check_out_date }} at 11:00 AM</li>
  <li><strong>Room:</strong> {{ room_number }}</li>
  <li><strong>Total Price:</strong> ₹{{ total_price }}</li>
</ul>

<h3>Check-in Instructions</h3>
<p>{{ property_address }}</p>
<p>Phone: {{ host_contact }}</p>
<p>Door code: {{ door_code }}</p>

<p>Questions? Reply to this email or call us.</p>
<p>We look forward to hosting you!</p>
"""

# Push notifications for mobile app (via Firebase Cloud Messaging):
def send_push_notification(guest_doc, title, body):
    """Send notification to guest's mobile app."""
    import firebase_admin
    from firebase_admin import messaging
    
    message = messaging.Message(
        notification=messaging.Notification(title=title, body=body),
        data={'booking_id': booking_id, 'action': 'open_booking'},
        token=guest_doc.fcm_token,  # Device token registered with app
    )
    
    response = messaging.send(message)
    return response
```

---

## PART 3: FRONTEND (REACT) FEATURE SET

### Dashboard Overview
```
Property Manager Dashboard (React):

┌─────────────────────────────────────────────────────────┐
│  BookPondy PMS | Dashboard | [Admin Menu]               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Key Metrics (KPIs)                              │   │
│  │ ┌──────────┐  ┌──────────┐  ┌──────────┐       │   │
│  │ │ Occupancy│  │ Revenue  │  │ Bookings │       │   │
│  │ │  78%     │  │ ₹45,000  │  │    12    │       │   │
│  │ │ Today    │  │ This Week│  │ This Week│       │   │
│  │ └──────────┘  └──────────┘  └──────────┘       │   │
│  │ ┌──────────┐  ┌──────────┐                      │   │
│  │ │ Avg Rating│ │ Pending  │                      │   │
│  │ │  4.8/5   │  │ Tasks    │                      │   │
│  │ │ 45 reviews│ │    7     │                      │   │
│  │ └──────────┘  └──────────┘                      │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Calendar View (30-day)                          │   │
│  │ ┌─────────────────────────────────────────────┐ │   │
│  │ │ Room101  ████░░░░░  Occupied until Jan 22   │ │   │
│  │ │ Room102  ████████░░  Booked until Jan 24    │ │   │
│  │ │ Room103  ░░░░░░░░░░  Available               │ │   │
│  │ │ Room104  ░░████░░░░  Check-in Jan 21        │ │   │
│  │ └─────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Recent Bookings                     [View All →]│   │
│  │ ┌──────────────────────────────────────────────┐   │
│  │ │ BOK-2025-1234 | John Doe      | Room 101    │   │
│  │ │ Jan 20-22 | ₹6,500 | Confirmed | [Details→]│   │
│  │ ├──────────────────────────────────────────────┤   │
│  │ │ BOK-2025-1235 | Jane Smith     | Room 102   │   │
│  │ │ Jan 23-25 | ₹7,200 | Pending payment | [Remind]│
│  │ ├──────────────────────────────────────────────┤   │
│  │ │ BOK-2025-1236 | Priya Sharma   | Room 103   │   │
│  │ │ Jan 26-28 | ₹5,800 | Confirmed | [Details→]│   │
│  │ └──────────────────────────────────────────────┘   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ Revenue Graph│  │ Occupancy    │  │ Reviews      │ │
│  │ (30 days)    │  │ Trend        │  │ Sentiment    │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Core React Components

```typescript
// src/components/Booking/BookingForm.tsx
// Handles single-property or multi-property booking creation

interface BookingFormProps {
  propertyId?: string; // Auto-select if known
  guestId?: string;    // Auto-populate if returning guest
  onSuccess: (booking: Booking) => void;
}

const BookingForm: React.FC<BookingFormProps> = ({ propertyId, guestId, onSuccess }) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [availability, setAvailability] = useState<{[key: string]: boolean}>({});
  const [pricing, setPricing] = useState<PricingBreakdown | null>(null);
  
  // Multi-step form:
  // Step 1: Select property (if not pre-selected)
  // Step 2: Select room & dates
  // Step 3: Guest details
  // Step 4: Confirm & pay
  
  return (
    <Form onSubmit={handleSubmit}>
      <PropertySelector defaultValue={propertyId} onChange={onPropertyChange} />
      <RoomCalendar rooms={rooms} onDatesSelect={onDatesSelect} />
      <GuestForm defaultGuestId={guestId} />
      <PricingBreakdown pricing={pricing} />
      <PaymentOptions />
      <SubmitButton loading={isSubmitting} />
    </Form>
  );
};

// src/components/Calendar/AvailabilityCalendar.tsx
// Shows 90-day calendar with availability status per room

const AvailabilityCalendar: React.FC<{ property: Property }> = ({ property }) => {
  const [calendarData, setCalendarData] = useState<CalendarDay[]>([]);
  
  // Color coding:
  // Green: Available
  // Red: Booked
  // Gray: Blocked
  // Yellow: Pending confirmation
  
  return (
    <div className="calendar-grid">
      {calendarData.map(day => (
        <DayCell
          date={day.date}
          status={day.status}
          rate={day.rate}
          onClick={() => handleDateClick(day)}
        />
      ))}
    </div>
  );
};

// src/components/Task/TaskBoard.tsx
// Kanban-style task management for housekeeping

const TaskBoard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  
  // Columns: Pending → In Progress → Completed
  
  const handleDragEnd = async (result) => {
    // Update task status based on drag
    const task = result.draggableId;
    const newStatus = result.destination.droppableId;
    await updateTaskStatus(task, newStatus);
  };
  
  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <TaskColumn status="Pending" tasks={tasks} />
      <TaskColumn status="In Progress" tasks={tasks} />
      <TaskColumn status="Completed" tasks={tasks} />
    </DragDropContext>
  );
};

// src/components/Revenue/RevenueReports.tsx
// Detailed revenue analytics and forecasting

const RevenueReports: React.FC = () => {
  const [timeRange, setTimeRange] = useState('month');
  
  return (
    <div>
      <TimeRangeSelector onChange={setTimeRange} />
      <RevenueChart data={revenueData} />
      <OccupancyTrend data={occupancyData} />
      <ChannelBreakdown channels={bookingChannels} />
      <CommissionTracker commissions={commissions} />
    </div>
  );
};

// src/components/Guest/GuestProfile.tsx
// Complete guest profile with history and preferences

const GuestProfile: React.FC<{ guestId: string }> = ({ guestId }) => {
  const [guest, setGuest] = useState<Guest | null>(null);
  const [bookingHistory, setBookingHistory] = useState<Booking[]>([]);
  const [preferences, setPreferences] = useState<GuestPreference[]>([]);
  
  return (
    <div className="guest-profile">
      <GuestHeader guest={guest} />
      <div className="tabs">
        <TabPanel label="History">
          <BookingHistoryList bookings={bookingHistory} />
        </TabPanel>
        <TabPanel label="Preferences">
          <PreferencesForm preferences={preferences} onSave={savePreferences} />
        </TabPanel>
        <TabPanel label="Communication">
          <CommunicationLog guestId={guestId} />
        </TabPanel>
        <TabPanel label="Reviews">
          <ReviewsList bookings={bookingHistory} />
        </TabPanel>
      </div>
    </div>
  );
};

// src/components/Marketplace/MarketplaceSync.tsx
// View and manage marketplace listings and syncs

const MarketplaceSyncPanel: React.FC = () => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  
  const handleManualSync = async () => {
    const result = await triggerMarketplaceSync();
    setSyncStatus(result.status);
    setLastSyncTime(new Date());
  };
  
  return (
    <div className="sync-panel">
      <h3>Marketplace Integration</h3>
      <div className="status">
        <span>Last sync: {lastSyncTime?.toLocaleString()}</span>
        <Button onClick={handleManualSync} variant="primary">Sync Now</Button>
      </div>
      <div className="sync-details">
        <p>Listings synced: {syncStatus?.listings_synced}</p>
        <p>Availability updated: {syncStatus?.availability_synced}</p>
        <p>Bookings pulled: {syncStatus?.bookings_pulled}</p>
      </div>
    </div>
  );
};
```

---

## PART 4: MOBILE APP (DOPPIO) FEATURES

### Staff Check-in/Out Workflow
```
Mobile App - Check-in/Check-out Flow:

1. Staff opens Doppio app
2. Scans guest QR code (or enters booking ID)
3. Guest details appear:
   - Name, phone, special requests
   - Number of guests
   - Room assignment
   - Check-in time status

4. Check-in Process:
   a. Verify guest identity
   b. Verify ID document (photo)
   c. Get electronic signature
   d. Take room entry photo
   e. Mark as checked-in in system
   f. Generate door code / key card
   g. Send welcome message to guest

5. Check-out Process:
   a. Request payment confirmation
   b. Request room walkthrough photos
   c. Inspect for damages
   d. Generate checkout report
   e. Print/email receipt
   f. Mark as checked out in system

Mobile screens:
┌──────────────────────────┐
│ 📱 BookPondy PMS (Staff)  │
│                          │
│ [QR Scanner] [Manual ID]  │
│                          │
│ Guest: John Doe          │
│ Room: 101                │
│ Check-in: 2:00 PM ✓      │
│                          │
│ [Verify ID]              │
│ [Take Photo]             │
│ [Get Signature] ⌂        │
│ [CONFIRM CHECK-IN]       │
└──────────────────────────┘
```

### Real-time Task Notifications
```
Push Notifications on Mobile:

1. Task Created: "New task: Clean Room 101"
2. Task Assigned: "Task assigned to you: Checkout cleaning"
3. Task Reminder: "Room 101 checkout in 30 mins"
4. Task Status Update: "Room 102 marked as complete"
5. Guest Arrival: "Guest arriving in 1 hour - Room 103"
6. Booking Cancelled: "Booking BOK-2025-1234 cancelled"
7. Maintenance Alert: "Urgent: AC not working in Room 104"
8. Guest Request: "Special request: Late checkout by 2 hours"

Real-time WebSocket:
- Push notification comes in
- Staff taps notification
- App opens relevant task/booking with context
- Staff can immediately act (complete task, contact guest, etc.)
```

### Offline-First Sync
```
Scenario: Staff at property with no internet

1. Staff uses app offline
   - Create task: "Clean Room 101"
   - Mark task as completed (stored locally)
   - Take photos (stored on device)
   - Submit forms (queued locally)

2. When internet returns
   - App detects connection
   - Automatically syncs queued items to server
   - Photos uploaded to server
   - LocalStorage cleared, synced state saved
   - Notification: "Sync completed: 5 items synced"

Implementation:
- Service Worker for offline capability
- IndexedDB for local data storage
- Realm DB on mobile for reactive updates
- Sync manager (queue failed requests, retry with exponential backoff)
- Conflict resolution (server wins if manual edit occurred remotely)
```

---

## PART 5: DEPLOYMENT & SCALING

### Single Property Setup (Small Guesthouse)
```
Architecture:
- 1 x EC2 micro instance (t3.micro) - $10/month
- 1 x RDS PostgreSQL (db.t3.micro) - $30/month
- 1 x Redis (ElastiCache) - $20/month
- 1 x S3 for backups & images - $5/month
- SSL certificate (free Let's Encrypt)

Docker Compose:
- Frappe app container
- React frontend container (nginx reverse proxy)
- PostgreSQL container
- Redis container
- Celery worker for background jobs

Monthly cost: ~$65-80

Capacity:
- Up to 20 rooms
- 100+ monthly bookings
- Handles 50 concurrent users
- Good enough for one guesthouse
```

### Multi-Property Setup (Resort Chain)
```
Architecture (Scaled):
- Load Balancer (AWS ALB) - $22/month
- 2-3 x EC2 instances (t3.small) - $60/month each
- 1 x RDS PostgreSQL (db.t3.small) - $80/month
- 1 x ElastiCache Redis (cache.t3.small) - $50/month
- CloudFront CDN for static assets - $5-50/month
- S3 bucket with backups - $20/month
- CloudWatch monitoring - $10/month

Kubernetes (for high availability):
- 3 x worker nodes
- Auto-scaling based on CPU/memory
- Rolling updates without downtime

Monthly cost: ~$250-350

Capacity:
- Unlimited rooms across properties
- 10,000+ monthly bookings
- 1000+ concurrent users
- Multi-site support with single admin dashboard
- Real-time sync across all properties
```

### CI/CD Pipeline (GitHub Actions)
```yaml
# .github/workflows/deploy.yml

name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Run Tests (Backend)
        run: |
          cd backend
          python -m pytest tests/ --cov=bookpondy_pms
      
      - name: Run Tests (Frontend)
        run: |
          cd frontend
          npm run test -- --coverage
      
      - name: Build Docker Image
        run: |
          docker build -t bookpondy-pms:${{ github.sha }} .
          docker tag bookpondy-pms:${{ github.sha }} bookpondy-pms:latest
      
      - name: Push to Registry
        run: docker push bookpondy-pms:${{ github.sha }}
      
      - name: Deploy to Production
        env:
          DEPLOY_KEY: ${{ secrets.DEPLOY_KEY }}
        run: |
          ssh -i $DEPLOY_KEY ubuntu@api.bookpondy.com \
            'docker pull bookpondy-pms:${{ github.sha }} && \
             docker-compose up -d'
      
      - name: Health Check
        run: curl -f https://api.bookpondy.com/health || exit 1
      
      - name: Notify Slack
        uses: slackapi/slack-github-action@v1
        with:
          payload: |
            {
              "text": "✅ Deployment successful: bookpondy-pms:${{ github.sha }}"
            }
```

---

## PART 6: INTEGRATION WITH BOOKPONDY.COM

### Why Separate PMS?

```
BookPondy.com (Marketplace):
├─ Guest-facing listing search
├─ Booking engine
├─ Payment processing
├─ Reviews & ratings
├─ Multi-property comparison
└─ Marketing features

BookPondy PMS (Property Management):
├─ Owner/manager operations
├─ Inventory management
├─ Staff coordination
├─ Revenue optimization
├─ Guest communication
├─ Business intelligence
└─ SYNCED with marketplace

Benefits:
1. Control: Owners manage bookings independently
2. Data: Keep guest data and operational metrics
3. Optimization: Dynamic pricing, advanced rules
4. Integration: Listings available on marketplace
5. Direct: Accept direct bookings without commission
6. Multi-channel: Sync availability across OTAs
```

### Data Flow (Marketplace ↔ PMS)

```
PUSH (PMS → Marketplace):
├─ Daily at 2 AM: Availability calendar
│  └─ 90-day availability snapshot
├─ On property edit: Listing details, images, amenities
├─ On review received: Show on both platforms
└─ On price change: Update rates on marketplace

PULL (Marketplace → PMS):
├─ Every 6 hours: New bookings from marketplace
│  └─ Create Booking record, sync to PMS
├─ Every 30 mins: Check for booking cancellations
│  └─ Cancel corresponding PMS booking
├─ Every 24 hours: Sync reviews
│  └─ Store in PMS, aggregate for reports
└─ Real-time: Payment confirmation webhooks
   └─ Mark payment as received

BIDIRECTIONAL SYNC:
├─ If booking cancelled in marketplace:
│  └─ Marketplace notifies PMS → PMS cancels booking
├─ If booking cancelled in PMS:
│  └─ PMS notifies marketplace → marketplace cancels listing
├─ If price changed in PMS:
│  └─ Sync to marketplace for consistency
└─ If guest leaves review:
   └─ Display on marketplace + PMS
```

### Revenue Model

```
BookPondy Platform Revenue:
1. Booking Commission (15%)
   - Direct bookings: 0%
   - Marketplace bookings: 15% of room rate
   - Paid by property owner after guest checkout

2. Premium Features (Optional)
   - Advanced analytics: $10/month
   - Marketing tools: $20/month
   - White-label: $50/month
   - API access: $30/month

3. Payment Processing Fee (Fixed)
   - 2% + ₹5 per transaction (Razorpay pass-through)
   - Split: 1.5% to Razorpay, 0.5% to BookPondy

Property Owner Benefits:
- Sell on marketplace (15% commission)
- Or manage independently in PMS (0% commission)
- Both options available simultaneously

Example Booking Scenarios:

Scenario 1: Guest books via BookPondy.com
├─ Guest pays: ₹6,500 (room rate)
├─ Marketplace commission: 15% = ₹975
├─ Property receives: ₹5,525 (after commission)
├─ Processing fee: 2% + ₹5 = ₹135
└─ Net to property: ₹5,390

Scenario 2: Guest books directly (PMS form)
├─ Guest pays: ₹6,500
├─ Marketplace commission: 0%
├─ Property receives: ₹6,500
├─ Processing fee: 2% + ₹5 = ₹135
└─ Net to property: ₹6,365 (25% more!)

Incentive: Direct bookings are more profitable for property owners.
BookPondy wins by volume: even at 15% commission, thousands of
properties generate significant recurring revenue.
```

---

## PART 7: IMPLEMENTATION ROADMAP

### Phase 1: MVP (Weeks 1-4)
```
Core Functionality:
✅ Property management (CRUD)
✅ Room inventory
✅ Basic booking workflow
✅ Guest profiles
✅ Simple rate calculation
✅ Payment integration (Razorpay)
✅ Email notifications
✅ React dashboard (basic)
✅ Authentication & roles
✅ Database schema

Deployed:
- Single property demo instance
- Test bookings processed end-to-end
- Basic API endpoints working
```

### Phase 2: Launch (Weeks 5-8)
```
Advanced Features:
✅ Availability calendar sync
✅ Marketplace integration (sync listings, bookings)
✅ Revenue reports & analytics
✅ Task management (basic)
✅ Multi-property support
✅ Advanced rate rules (seasonal, occupancy-based)
✅ Cancellation policies
✅ Commission tracking
✅ WhatsApp integration
✅ Mobile app (Doppio) - basic

Deployed:
- 5+ properties live
- Handling 20+ bookings/week
- Real marketplace sync
```

### Phase 3: Optimization (Weeks 9-12)
```
Scaling & Polish:
✅ Performance optimization
✅ Caching strategy
✅ Database indexing
✅ CDN setup
✅ Mobile app improvements (check-in, QR scanning)
✅ Advanced analytics
✅ Automated workflows
✅ SMS notifications
✅ Guest portal
✅ Staff dashboard (Doppio mobile app)

Deployed:
- 20+ properties live
- 100+ bookings/week
- 5+ staff members
- Full operational capability
```

### Phase 4: Scale (Weeks 13+)
```
Enterprise Features:
✅ Multi-tenant support (white-label)
✅ Advanced role-based access
✅ Bulk operations
✅ API for integrations (Airbnb sync, Booking.com sync)
✅ AI recommendations (pricing, occupancy forecast)
✅ Guest segmentation & personalization
✅ Loyalty program
✅ Inventory forecasting
✅ Housekeeping optimization
✅ Custom reports builder

Architecture:
- Kubernetes deployment
- Auto-scaling
- Multi-region support
- Disaster recovery
```

---

## PART 3: ERPNext INTEGRATION

### 3.1 Overview
The PMS integrates with a central ERPNext site to unify accounting, HR, and inventory management. This bridge allows localized guesthouse operations to sync with a robust enterprise backend.

### 3.2 Key Components
- **ERPNext Settings**: A singleton DocType to manage API credentials (URL, Key, Secret), default company, and Tax account mapping.
- **ERPNextConnector**: A Python utility class that handles authenticated REST API calls, mapping logic, and error logging.
- **Trigger Hooks**: Automatic background jobs enqueued during lifecycle events (checkout, submission, update).

### 3.3 Data Flow & Mapping
The integration uses a unidirectional sync (PMS → ERPNext) for operational documents:

| PMS Doctype | ERPNext Doctype | Trigger Event | Mapping Logic |
|-------------|-----------------|---------------|---------------|
| **Reservation** | `Sales Invoice` | Checked-Out | Itemized charges, Guest-to-Customer mapping. |
| **Transaction** | `Payment Entry` | Submitted | Links payment to remote Customer and Invoice. |
| **Staff** | `Employee` | Update | Syncs profile, designation, and contact info. |
| **Maintenance** | `Material Request` | Update | Syncs required parts to central inventory. |
| **Communication** | `Communication` | Sent | Appends logs to guest timeline in remote CRM. |

### 3.4 GST & Tax Integration
To maintain tax compliance, the `sync_reservation_as_invoice` logic performs the following:
1.  **Itemized Charges**: Each PMS `Charge` (Room, F&B, Service) is pushed as an individual row.
2.  **Tax Account Mapping**: `CGST` and `SGST` are split from the total tax and mapped to account heads defined in **ERPNext Settings**.
3.  **Customer Linking**: Guests are automatically matched to remote `Customer` records by email; new records are created on-the-fly if missing.

### 3.5 Developer Extension Guide
To extend the integration to a new DocType:
1.  Add a `sync_to_erpnext` method to the target Python controller.
2.  Implement a corresponding `sync_xxx` method in `ERPNextConnector` to prepare the remote payload.
3.  Enqueue the operation using `frappe.enqueue` to ensure front-end responsiveness.

---

## CONCLUSION

**BookPondy PMS** is a **comprehensive property management system** built on proven technology:

**Tech Stack:**
- **Backend:** Frappe v15 (Python, proven in enterprise)
- **API:** Raven (REST + real-time WebSocket)
- **Frontend:** React 18 (modern, scalable)
- **Mobile:** Doppio (offline-first, native feel)
- **Database:** PostgreSQL + Redis
- **DevOps:** Docker, GitHub Actions, AWS/DigitalOcean

**Why This Stack:**
1. **Frappe:** Built for ERP, extensible, multi-tenant ready
2. **React:** Fast, large ecosystem, easy to hire developers
3. **Python:** Easy business logic, great for background jobs
4. **PostgreSQL:** Reliable, scalable, ACID compliant
5. **Real-time:** WebSocket for task notifications, live updates

**Scalability:**
- Single property: 1 EC2 micro (~$80/month)
- 10 properties: 2-3 EC2 small (~$300/month)
- 100+ properties: Kubernetes auto-scaling (~$1000+/month)

**Integration:**
- **BookPondy.com:** Bidirectional sync (listings, bookings, availability)
- **Payment:** Razorpay for Indian & international cards
- **Communication:** WhatsApp, Email, SMS for guest & staff
- **Maps:** Google Maps for location & directions
- **Analytics:** Google Analytics + custom dashboards

**Unique Value:**
- **Complete control** over bookings & guest data
- **Direct booking incentive** (0% commission vs 15% on marketplace)
- **Operational efficiency** (tasks, staff, reporting)
- **Revenue optimization** (dynamic pricing, occupancy rules)
- **Marketplace integration** (available on BookPondy.com without tying to exclusive contract)

This PMS empowers property owners from single guesthouse to full resort operations,
while maintaining seamless integration with BookPondy.com marketplace for additional visibility.
```
