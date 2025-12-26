# BookPondy PMS - Detailed Specifications for Placeholder Modules
## Focus: WhatsApp Integration, ERPNext Connectivity & Business-Critical Features Only

---

## 📋 EXECUTIVE SUMMARY

**Business Priority Order (Implementation Sequence):**
1. **Financials** - Revenue tracking & KPIs (CRITICAL for owner dashboard)
2. **Invoices** - Guest billing & GST compliance (CRITICAL for operations)
3. **Tasks** - Housekeeping workflow (CRITICAL for daily operations)
4. **Channels** - WhatsApp booking + OTA sync (CRITICAL for revenue)
5. **Maintenance** - Issue tracking (SECONDARY)
6. **Reports** - Owner insights (SECONDARY)
7. **Reviews** - Guest feedback (NICE-TO-HAVE)
8. **Settings** - System configuration (FOUNDATIONAL)

---

# MODULE 1: FINANCIALS (PRIORITY: 🔴 CRITICAL)
## Goal: Owner revenue visibility + KPI dashboard

### Data Model (Backend - DocTypes)

#### 1. **Revenue Dashboard Config** (NEW)
```
DocType: Revenue Dashboard Config
Purpose: Store dashboard preferences per owner/property

Fields:
- owner_id (Link: User) - Property owner
- property (Link: Property) - Specific property or NULL for all
- currency (Data: INR/USD) - Display currency
- date_range (Select: This Month, Last 30 Days, This Year, Custom)
- metrics_enabled (Table) - Which KPIs to show
  - metric_name (Data: RevPAR, ADR, Occupancy, ARR, etc.)
  - display_order (Int)
```

#### 2. **Financial Period Summary** (NEW - Cached)
```
DocType: Financial Period Summary
Purpose: Pre-calculated revenue aggregates (auto-generated daily)

Fields:
- property (Link: Property)
- period_start_date (Date)
- period_end_date (Date)
- total_revenue (Currency) - Sum of all Folio amounts
- room_revenue (Currency) - From Charges where type=accommodation
- additional_revenue (Currency) - Services, extras, amenities
- occupancy_nights (Int) - Total nights booked
- available_nights (Int) - Total nights available
- occupancy_percent (Percent) - occupancy_nights / available_nights * 100
- adr (Currency) - Average Daily Rate = total_revenue / occupancy_nights
- revpar (Currency) - Revenue Per Available Room = total_revenue / available_nights
- booking_count (Int)
- avg_length_of_stay (Decimal)
- cancellation_count (Int)
- avg_daily_guests (Decimal)
```

### Frontend Implementation

#### Dashboard: Revenue Analytics (React Component)

**Layout:**
```
┌─────────────────────────────────────────────┐
│ Financials Dashboard                         │
│ [Property Filter] [Date Range: This Month] │
└─────────────────────────────────────────────┘

┌──────────┬──────────┬──────────┬──────────┐
│ Total    │ ADR      │ RevPAR   │ Occupancy│
│ Revenue  │ (Avg $/  │ (Avg $/  │ %        │
│ ₹X.XXL   │ Night)   │ Room)    │ XX%      │
│          │ ₹X,XXX   │ ₹X,XXX   │          │
└──────────┴──────────┴──────────┴──────────┘

[Revenue Trend Chart - Line Graph]
  - X-axis: Last 30 days / Last 12 months
  - Y-axis: Daily/Monthly revenue
  - Tooltip: Date, Revenue, Occupancy%

[Revenue Breakdown - Pie Chart]
  - Accommodation Revenue (60%)
  - Service/Extra Revenue (30%)
  - Discount/Refund (10%)

[Key Metrics Table]
  - Booking Count: 12
  - Avg Length of Stay: 3.2 nights
  - Cancellations: 1 (8.3%)
  - Avg Daily Guests: 24
```

**React Component Structure:**
```jsx
// pages/financials.jsx
export default function FinancialsPage() {
  // State
  const [property, setProperty] = useState(null);
  const [dateRange, setDateRange] = useState('thisMonth');
  const [financialData, setFinancialData] = useState(null);
  const [loading, setLoading] = useState(false);

  // API calls
  useEffect(() => {
    if (!property) return;
    
    fetchFinancialData({
      property_id: property,
      date_range: dateRange
    }).then(data => setFinancialData(data));
  }, [property, dateRange]);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex gap-4">
        <PropertySelect value={property} onChange={setProperty} />
        <DateRangeSelect value={dateRange} onChange={setDateRange} />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        <KPICard title="Total Revenue" value={financialData?.total_revenue} />
        <KPICard title="ADR" value={financialData?.adr} />
        <KPICard title="RevPAR" value={financialData?.revpar} />
        <KPICard title="Occupancy" value={financialData?.occupancy_percent} unit="%" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6">
        <TrendChart data={financialData?.trend} />
        <BreakdownPie data={financialData?.breakdown} />
      </div>

      {/* Metrics Table */}
      <MetricsTable data={financialData?.metrics} />
    </div>
  );
}
```

### API Endpoints (Frappe Backend)

**Endpoint 1: Get Financial Summary**
```
GET /api/resource/financial-period-summary
Params:
  - property (string): Property name/id
  - period (string): thisMonth, last30days, thisYear, custom
  - start_date (date): For custom range
  - end_date (date): For custom range

Returns:
{
  "total_revenue": 250000,
  "adr": 5000,
  "revpar": 3500,
  "occupancy_percent": 70,
  "booking_count": 12,
  "cancellation_count": 1,
  "avg_length_of_stay": 3.2,
  "revenue_trend": [
    {"date": "2025-12-01", "revenue": 8000, "occupancy": 65},
    ...
  ],
  "revenue_breakdown": {
    "room": 180000,
    "services": 50000,
    "refunds": -10000
  }
}
```

**Endpoint 2: Get Revenue by Unit Category**
```
GET /api/resource/revenue-by-category
Params:
  - property (string)
  - period (string)

Returns:
[
  {"category_name": "Deluxe Villa", "revenue": 150000, "occupancy": 80},
  {"category_name": "Standard Room", "revenue": 100000, "occupancy": 60}
]
```

### ERPNext Integration Points

**Accounting Journal Integration:**
When Folio is marked "Paid":
1. Create GL Entry in ERPNext
2. Debit: Accounts Receivable (Guest Folio)
3. Credit: Sales Revenue (PMS account)
4. Reference: Folio ID + Reservation ID
5. Sync via Frappe DocType Link: `folio.linked_erp_journal_entry`

**Example Auto-Create Logic (Python - bookpondy_pms/hooks.py):**
```python
def on_folio_paid(doc, method):
    """Auto-create GL entry in ERPNext on Folio payment"""
    if not doc.erp_site_name:
        return
    
    # Build GL Entry dict
    gl_entry = {
        'doctype': 'GL Entry',
        'posting_date': doc.date,
        'account': get_pms_sales_account(doc.property),  # From Settings
        'debit': doc.total_amount if doc.is_income else 0,
        'credit': 0 if doc.is_income else doc.total_amount,
        'reference_doctype': 'Folio',
        'reference_name': doc.name,
        'description': f"Guest {doc.guest_name} - {doc.reservation_id}",
        'cost_center': get_property_cost_center(doc.property)
    }
    
    # Call ERPNext site
    sync_to_erp(doc.erp_site_name, 'GL Entry', gl_entry)
```

---

# MODULE 2: INVOICES (PRIORITY: 🔴 CRITICAL)
## Goal: Guest billing + GST compliance + PDF generation

### Data Model Changes (Extend Existing)

#### **Folio DocType Extension**
```
Fields to Add:
- invoice_number (Data) - Auto-generated, unique per property
  Format: {PROPERTY_CODE}-{YYYY}{MM}{INVOICE_SEQ}
  Example: PROP-202512001

- invoice_date (Date) - When finalized for accounting
- gst_status (Select) - NotApplicable / Exempt / Applicable
- gst_number (Data) - Guest GSTIN (optional)
- hsn_codes_used (Table) - Track HSN codes for line items

- payment_method (Select) - Cash / Card / Bank Transfer / UPI
- payment_reference (Data) - Transaction ID / Reference
- refund_amount (Currency) - If refunded
- refund_reason (Text)
- refund_date (Date)
- refund_method (Select)

- invoice_status (Select) - Draft / Finalized / Sent / Paid / Cancelled
- sent_to_guest (Checkbox) - Email sent to guest?
- guest_email_address (Data) - Email used for sending

- erp_journal_reference (Link: GL Entry) - Link to ERPNext GL Entry
```

### Frontend Implementation

#### Invoice Detail View (React Component)

**Layout:**
```
┌────────────────────────────────────────────┐
│ Invoice #PROP-202512001                     │
│ [Status: Sent]  [Download PDF] [Email]     │
└────────────────────────────────────────────┘

BOOKPONDY PMS
Address: XYZ, Pondicherry

INVOICE TO:
Guest Name: John Doe
Email: john@example.com
Phone: +91-9876543210
Check-in: 2025-12-20
Check-out: 2025-12-23

──────────────────────────────────────────
Item                      Qty    Rate    Amount
──────────────────────────────────────────
Deluxe Villa (3 nights)    3   ₹5000   ₹15,000
Breakfast (3 days)         3    ₹500    ₹1,500
Late Checkout              1   ₹2000    ₹2,000
──────────────────────────────────────────
Subtotal:                              ₹18,500
SGST (9%):                             ₹1,665
CGST (9%):                             ₹1,665
──────────────────────────────────────────
TOTAL DUE:                            ₹21,830
──────────────────────────────────────────

Payment Received: ₹21,830 (2025-12-23)
Remaining Balance: ₹0

[Action Buttons]
[Mark as Paid] [Send Email] [Download PDF] [Refund]
```

**React Component:**
```jsx
// pages/invoices/detail.jsx
export default function InvoiceDetailPage({ invoiceId }) {
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    frappe.call({
      method: 'bookpondy_pms.pms.doctype.folio.folio.get_invoice_details',
      args: { folio_name: invoiceId },
      callback: (r) => setInvoice(r.message)
    });
  }, [invoiceId]);

  const handleDownloadPDF = () => {
    window.open(`/api/method/bookpondy_pms.pms.reports.generate_invoice_pdf?folio=${invoiceId}`);
  };

  const handleSendEmail = () => {
    frappe.call({
      method: 'bookpondy_pms.pms.doctype.folio.folio.send_invoice_email',
      args: { folio_name: invoiceId },
      callback: () => frappe.show_alert({message: 'Invoice sent to guest', indicator: 'green'})
    });
  };

  const handleMarkPaid = () => {
    frappe.db.set_value('Folio', invoiceId, 'invoice_status', 'Paid')
      .then(() => setInvoice({...invoice, invoice_status: 'Paid'}));
  };

  const handleRefund = (amount) => {
    new frappe.ui.Dialog({
      title: 'Process Refund',
      fields: [
        {fieldname: 'refund_amount', fieldtype: 'Currency', label: 'Refund Amount', default: amount},
        {fieldname: 'refund_reason', fieldtype: 'Small Text', label: 'Reason'},
        {fieldname: 'refund_method', fieldtype: 'Select', label: 'Method', options: 'Cash\nBank Transfer\nCard Refund'}
      ],
      primary_action_label: 'Process Refund',
      primary_action: (values) => {
        frappe.call({
          method: 'bookpondy_pms.pms.doctype.folio.folio.process_refund',
          args: {folio_name: invoiceId, ...values},
          callback: () => frappe.show_alert({message: 'Refund processed', indicator: 'green'})
        });
      }
    }).show();
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1>Invoice #{invoice.invoice_number}</h1>
        <Badge>{invoice.invoice_status}</Badge>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Button onClick={handleDownloadPDF}>Download PDF</Button>
        <Button onClick={handleSendEmail}>Email to Guest</Button>
        <Button onClick={() => handleMarkPaid()}>Mark as Paid</Button>
        <Button variant="destructive" onClick={() => handleRefund(invoice.total_amount)}>Refund</Button>
      </div>

      <div className="bg-white p-8 rounded border">
        <InvoiceTemplate invoice={invoice} />
      </div>
    </div>
  );
}

// Component: InvoiceTemplate (Reusable for PDF + Print)
function InvoiceTemplate({ invoice }) {
  return (
    <div className="space-y-6">
      {/* Header with branding */}
      <div className="flex justify-between">
        <div>
          <h2 className="text-2xl font-bold">BOOKPONDY PMS</h2>
          <p className="text-gray-600">Pondicherry, India</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold">INVOICE</p>
          <p className="text-gray-600">#{invoice.invoice_number}</p>
        </div>
      </div>

      {/* Guest & Reservation Info */}
      <div className="grid grid-cols-2 gap-8">
        <div>
          <h3 className="font-semibold mb-2">INVOICE TO:</h3>
          <p>{invoice.guest_name}</p>
          <p>{invoice.guest_email}</p>
          <p>{invoice.guest_phone}</p>
          <p className="text-sm text-gray-600 mt-2">
            Check-in: {invoice.check_in_date}<br/>
            Check-out: {invoice.check_out_date}
          </p>
        </div>
        <div className="text-right">
          <p><strong>Invoice Date:</strong> {invoice.invoice_date}</p>
          <p><strong>Due Date:</strong> {invoice.due_date}</p>
          <p><strong>Status:</strong> {invoice.invoice_status}</p>
        </div>
      </div>

      {/* Line Items */}
      <table className="w-full text-sm">
        <thead className="border-b-2">
          <tr>
            <th className="text-left py-2">Item Description</th>
            <th className="text-center py-2">Qty</th>
            <th className="text-right py-2">Rate</th>
            <th className="text-right py-2">Amount</th>
          </tr>
        </thead>
        <tbody>
          {invoice.charges.map(charge => (
            <tr key={charge.name} className="border-b">
              <td className="py-2">{charge.charge_description}</td>
              <td className="text-center">{charge.quantity}</td>
              <td className="text-right">₹{charge.rate}</td>
              <td className="text-right font-semibold">₹{charge.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Summary */}
      <div className="flex justify-end">
        <div className="w-64 space-y-2 border-t-2 pt-4">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>₹{invoice.subtotal}</span>
          </div>
          {invoice.gst_applicable && (
            <>
              <div className="flex justify-between">
                <span>SGST (9%):</span>
                <span>₹{invoice.sgst_amount}</span>
              </div>
              <div className="flex justify-between">
                <span>CGST (9%):</span>
                <span>₹{invoice.cgst_amount}</span>
              </div>
            </>
          )}
          {invoice.discount_amount > 0 && (
            <div className="flex justify-between text-red-600">
              <span>Discount:</span>
              <span>-₹{invoice.discount_amount}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-lg border-t pt-2">
            <span>TOTAL DUE:</span>
            <span>₹{invoice.total_amount}</span>
          </div>
        </div>
      </div>

      {/* Payment Info */}
      {invoice.payment_method && (
        <div className="bg-gray-50 p-4 rounded">
          <strong>Payment Details:</strong>
          <p>Method: {invoice.payment_method}</p>
          <p>Reference: {invoice.payment_reference}</p>
          <p>Date: {invoice.payment_date}</p>
        </div>
      )}

      {/* Refund Info if applicable */}
      {invoice.refund_amount > 0 && (
        <div className="bg-orange-50 p-4 rounded border border-orange-200">
          <strong>Refund Processed:</strong>
          <p>Amount: ₹{invoice.refund_amount}</p>
          <p>Reason: {invoice.refund_reason}</p>
          <p>Date: {invoice.refund_date}</p>
        </div>
      )}
    </div>
  );
}
```

### API Endpoints

**Endpoint: Generate & Send Invoice**
```
POST /api/method/bookpondy_pms.pms.doctype.folio.folio.finalize_invoice
Params:
  - folio (string): Folio document name
  - gst_number (string, optional): Guest GSTIN
  - payment_method (string): Cash / Card / Bank / UPI

Returns:
{
  "invoice_number": "PROP-202512001",
  "total_amount": 21830,
  "gst_applicable": true,
  "sgst": 1665,
  "cgst": 1665,
  "status": "Finalized"
}
```

**Endpoint: Send Invoice Email**
```
POST /api/method/bookpondy_pms.pms.doctype.folio.folio.send_invoice_email
Params:
  - folio (string)
  - email (string, optional): Override guest email
  - subject (string, optional)

Returns:
{
  "message": "Invoice sent to guest@example.com",
  "email_id": "SENT-12345"
}
```

### ERPNext Integration

**On Invoice Finalization:**
1. Create Sales Invoice in ERPNext (if configured)
   - Party: Guest GSTIN or default
   - Items: Map Charges to Item master
   - Taxes: Apply SGST/CGST
   - Reference: PMS Folio ID

**Python Hook:**
```python
def on_folio_finalized(doc, method):
    """Create GST-compliant invoice in ERPNext"""
    if not doc.erp_site_name or not doc.gst_applicable:
        return
    
    # Create Sales Invoice in ERPNext
    sales_invoice = {
        'doctype': 'Sales Invoice',
        'customer': doc.guest_name,
        'customer_gstin': doc.gst_number or 'UNREGISTERED',
        'posting_date': doc.invoice_date,
        'items': [
            {
                'item_code': map_charge_to_item(charge.charge_type),
                'qty': charge.quantity,
                'rate': charge.rate,
                'hsn_code': get_hsn_code(charge.charge_type)
            }
            for charge in doc.charges
        ],
        'taxes': [
            {'tax_type': 'SGST', 'tax_rate': 9, 'amount': doc.sgst_amount},
            {'tax_type': 'CGST', 'tax_rate': 9, 'amount': doc.cgst_amount}
        ],
        'reference_doctype': 'Folio',
        'reference_name': doc.name
    }
    
    sync_to_erp(doc.erp_site_name, 'Sales Invoice', sales_invoice)
```

---

# MODULE 3: TASKS (PRIORITY: 🔴 CRITICAL)
## Goal: Housekeeping workflow + Daily operations

### Data Model (Extend Housekeeping Task)

#### **Housekeeping Task DocType Extension**
```
Fields to Add:
- task_status (Select) - Pending / In Progress / Completed / On Hold
- assigned_to_staff (Link: User)
- priority (Select) - Low / Normal / High / Urgent
- scheduled_time (DateTime) - When task should start
- started_time (DateTime) - When staff started
- completed_time (DateTime) - When marked complete
- notes (Text) - Staff notes on completion
- checklist_items (Table) - Sub-tasks/quality checks
  - item_description (Data)
  - is_completed (Checkbox)
  
- property_link (Link: Property) - Denormalized for performance
- unit_link (Link: Unit) - Denormalized for performance

- related_reservation (Link: Reservation) - From check-in/out
- task_type (Select) - CheckIn Cleaning / CheckOut Cleaning / Deep Clean / Turnover

Status Trigger Logic:
- On Reservation.check_in_date: Auto-create CheckIn task
- On Reservation.check_out_date: Auto-create CheckOut task
```

### Frontend Implementation

#### Housekeeping Board (React Component - Kanban View)

**Layout:**
```
┌─────────────────────────────────────────────┐
│ Housekeeping Tasks                           │
│ [Filter by Property] [Date: 2025-12-26]    │
│ [Staff Filter] [Priority Filter]             │
└─────────────────────────────────────────────┘

┌──────────────────┬──────────────────┬──────────────────┬──────────────────┐
│ PENDING          │ IN PROGRESS      │ COMPLETED        │ ON HOLD          │
│ (8 tasks)        │ (3 tasks)        │ (12 tasks)       │ (1 task)         │
├──────────────────┼──────────────────┼──────────────────┼──────────────────┤
│ ┌──────────────┐ │ ┌──────────────┐ │ ┌──────────────┐ │ ┌──────────────┐ │
│ │ [🔴 URGENT]  │ │ │ [🟡 HIGH]    │ │ │ [🟢 NORMAL]  │ │ │ [⚫ NORMAL]  │ │
│ │ Checkout     │ │ │ Checkout     │ │ │ Checkin      │ │ │ Deep Clean   │ │
│ │ Villa A      │ │ │ Room 202     │ │ │ Suite 101    │ │ │ Villa B      │ │
│ │ By 2 PM      │ │ │ Started 1 PM │ │ │ Completed    │ │ │ Waiting on.. │ │
│ │ [Edit] [Assign] │ │ [In Progress] │ │ │ 3:45 PM     │ │ │ [Resume]    │ │
│ └──────────────┘ │ └──────────────┘ │ └──────────────┘ │ └──────────────┘ │
│                  │                  │                  │                  │
│ ┌──────────────┐ │ ┌──────────────┐ │ ┌──────────────┐ │                  │
│ │ [🟡 HIGH]    │ │ │ [🟡 HIGH]    │ │ │ [🟢 NORMAL]  │ │                  │
│ │ Checkin      │ │ │ Turnover     │ │ │ Checkout     │ │                  │
│ │ Room 103     │ │ │ Villa C      │ │ │ Room 105     │ │                  │
│ │ By 10 AM     │ │ │ Started 10 AM │ │ │ Completed    │ │                  │
│ │ [Edit] [Assign] │ │ [In Progress] │ │ │ 2:15 PM     │ │                  │
│ │ Assign: John │ │ └──────────────┘ │ └──────────────┘ │                  │
│ └──────────────┘ │                  │                  │                  │
│                  │ ┌──────────────┐ │                  │                  │
│ (More tasks...) │ │ [🟡 HIGH]    │ │                  │                  │
│                  │ │ Checkin      │ │                  │                  │
│                  │ │ Room 201     │ │                  │                  │
│                  │ │ Started 45 min ago │                                   │
│                  │ │ [Mark Complete]    │                                   │
│                  │ └──────────────┘ │                  │                  │
└──────────────────┴──────────────────┴──────────────────┴──────────────────┘

[Drag tasks between columns to update status]
```

**React Component:**
```jsx
// pages/tasks/board.jsx
import { Card, Badge, Button, Dialog } from '@/components/ui';
import { useState, useEffect } from 'react';

const TASK_STATUSES = ['Pending', 'In Progress', 'Completed', 'On Hold'];
const PRIORITIES = { 'Urgent': '🔴', 'High': '🟡', 'Normal': '🟢', 'Low': '⚪' };

export default function HousekeepingBoard() {
  const [tasks, setTasks] = useState([]);
  const [property, setProperty] = useState(null);
  const [date, setDate] = useState(new Date());
  const [staffFilter, setStaffFilter] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    fetchTasks({
      property_link: property,
      date: date.toISOString().split('T')[0],
      assigned_to_staff: staffFilter
    }).then(setTasks);
  }, [property, date, staffFilter]);

  const handleDragEnd = (source, destination) => {
    if (!destination) return;
    
    const task = tasks.find(t => t.name === source.droppableId);
    updateTaskStatus(task.name, TASK_STATUSES[destination.droppableId])
      .then(() => {
        setTasks(tasks.map(t => 
          t.name === task.name 
            ? {...t, task_status: TASK_STATUSES[destination.droppableId]}
            : t
        ));
      });
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex gap-4 items-center">
        <PropertySelect value={property} onChange={setProperty} />
        <input 
          type="date" 
          value={date.toISOString().split('T')[0]}
          onChange={(e) => setDate(new Date(e.target.value))}
          className="border rounded px-3 py-2"
        />
        <StaffSelect value={staffFilter} onChange={setStaffFilter} clearable />
        <Button onClick={() => setSelectedTask({new: true})}>+ New Task</Button>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-4 gap-6 overflow-x-auto">
        {TASK_STATUSES.map((status, idx) => (
          <div key={status} className="min-w-max">
            <div className="bg-gray-100 rounded-lg p-4">
              <h3 className="font-bold mb-2">
                {status.toUpperCase()}
                <span className="ml-2 text-gray-600">
                  ({tasks.filter(t => t.task_status === status).length})
                </span>
              </h3>
              
              <div 
                className="space-y-3 min-h-96 bg-white rounded"
                onDrop={(e) => handleDragEnd(e.dataTransfer.getData('taskId'), idx)}
                onDragOver={(e) => e.preventDefault()}
              >
                {tasks
                  .filter(t => t.task_status === status)
                  .map(task => (
                    <TaskCard 
                      key={task.name}
                      task={task}
                      onClick={() => setSelectedTask(task)}
                    />
                  ))
                }
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailDialog
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onSave={(updated) => {
            updateTask(updated).then(() => {
              setTasks(tasks.map(t => t.name === updated.name ? updated : t));
              setSelectedTask(null);
            });
          }}
        />
      )}
    </div>
  );
}

// Component: TaskCard (Draggable)
function TaskCard({ task, onClick }) {
  return (
    <div
      draggable
      onDragStart={(e) => e.dataTransfer.setData('taskId', task.name)}
      onClick={onClick}
      className="bg-white border rounded p-3 cursor-move hover:shadow-md transition"
    >
      <div className="flex items-start justify-between">
        <span className="text-xl">{PRIORITIES[task.priority] || '⚪'}</span>
        <Badge>{task.task_type}</Badge>
      </div>
      <h4 className="font-semibold text-sm mt-2">{task.unit_link} - {task.property_link}</h4>
      <p className="text-xs text-gray-600 mt-1">{task.description}</p>
      <div className="flex items-center justify-between mt-3">
        <span className="text-xs text-gray-500">By {new Date(task.scheduled_time).toLocaleTimeString()}</span>
        {task.assigned_to_staff && (
          <Badge variant="outline" className="text-xs">{task.assigned_to_staff}</Badge>
        )}
      </div>
    </div>
  );
}

// Component: TaskDetailDialog
function TaskDetailDialog({ task, onClose, onSave }) {
  const [formData, setFormData] = useState(task);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <div className="space-y-6 p-6">
        <h2 className="text-xl font-bold">
          {task.new ? 'New Task' : `Task: ${task.unit_link}`}
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Unit</label>
            <UnitSelect 
              value={formData.unit_link} 
              onChange={(v) => setFormData({...formData, unit_link: v})}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Task Type</label>
            <select 
              value={formData.task_type}
              onChange={(e) => setFormData({...formData, task_type: e.target.value})}
              className="w-full border rounded px-3 py-2"
            >
              <option>Checkin Cleaning</option>
              <option>Checkout Cleaning</option>
              <option>Deep Clean</option>
              <option>Turnover</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Priority</label>
            <select 
              value={formData.priority}
              onChange={(e) => setFormData({...formData, priority: e.target.value})}
              className="w-full border rounded px-3 py-2"
            >
              <option>Low</option>
              <option>Normal</option>
              <option>High</option>
              <option>Urgent</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Scheduled Time</label>
            <input 
              type="datetime-local"
              value={formData.scheduled_time}
              onChange={(e) => setFormData({...formData, scheduled_time: e.target.value})}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Assign to Staff</label>
            <StaffSelect 
              value={formData.assigned_to_staff}
              onChange={(v) => setFormData({...formData, assigned_to_staff: v})}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Status</label>
            <select 
              value={formData.task_status}
              onChange={(e) => setFormData({...formData, task_status: e.target.value})}
              className="w-full border rounded px-3 py-2"
            >
              <option>Pending</option>
              <option>In Progress</option>
              <option>Completed</option>
              <option>On Hold</option>
            </select>
          </div>
        </div>

        {/* Checklist */}
        <div>
          <label className="block text-sm font-semibold mb-2">Quality Checklist</label>
          <div className="space-y-2 bg-gray-50 p-3 rounded">
            {formData.checklist_items?.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input 
                  type="checkbox"
                  checked={item.is_completed}
                  onChange={(e) => {
                    const items = [...formData.checklist_items];
                    items[idx].is_completed = e.target.checked;
                    setFormData({...formData, checklist_items: items});
                  }}
                />
                <span className="text-sm">{item.item_description}</span>
              </div>
            ))}
            <input 
              type="text"
              placeholder="Add checklist item..."
              onKeyPress={(e) => {
                if (e.key === 'Enter' && e.target.value) {
                  setFormData({
                    ...formData,
                    checklist_items: [
                      ...formData.checklist_items,
                      {item_description: e.target.value, is_completed: false}
                    ]
                  });
                  e.target.value = '';
                }
              }}
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-semibold mb-2">Notes</label>
          <textarea 
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
            rows={3}
            className="w-full border rounded px-3 py-2"
            placeholder="Staff notes or completion details..."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-end">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSave(formData)}>Save Task</Button>
        </div>
      </div>
    </Dialog>
  );
}
```

### API Endpoints

**Endpoint: Get Tasks for Board**
```
GET /api/resource/housekeeping-task
Params:
  - property_link (string)
  - date (date, optional)
  - assigned_to_staff (string, optional)
  - task_status (string, optional)

Returns:
[
  {
    "name": "TASK-001",
    "unit_link": "Villa A",
    "property_link": "Sunset Property",
    "task_type": "Checkout Cleaning",
    "priority": "High",
    "task_status": "Pending",
    "scheduled_time": "2025-12-26 10:00:00",
    "assigned_to_staff": "John (Housekeeper)",
    "description": "Full checkout cleaning, change linens",
    "checklist_items": [
      {"item_description": "Sweep floors", "is_completed": false},
      {"item_description": "Clean bathroom", "is_completed": false}
    ]
  }
]
```

**Endpoint: Update Task Status**
```
PATCH /api/resource/housekeeping-task/{task_id}
Body:
{
  "task_status": "In Progress",
  "notes": "Starting now, guest still on property",
  "started_time": "2025-12-26 09:45:00"
}
```

---

# MODULE 4: CHANNELS (PRIORITY: 🔴 CRITICAL - WhatsApp + OTA)
## Goal: Multi-channel booking + WhatsApp integration

### New DocTypes Required

#### **1. Channel Configuration**
```
DocType: Channel Config
Purpose: Store connection details for each channel

Fields:
- channel_name (Data) - WhatsApp / Booking.com / Airbnb / Direct
- channel_type (Select) - Direct / OTA / Messaging / Website
- is_active (Checkbox)
- property (Link: Property) - For which property
- api_key (Password) - Encrypted API credential
- api_secret (Password) - Encrypted secret
- webhook_url (Data) - For receiving events

For WhatsApp:
- whatsapp_phone_number (Data)
- whatsapp_api_provider (Select) - Raven / Twilio / Meta Graph API
- raven_channel_id (Data) - If using Raven

For OTA:
- ota_property_id (Data) - Booking.com property ID, Airbnb listing ID
- commission_percentage (Percent) - OTA commission
- sync_interval (Int) - How often to sync (minutes)
```

#### **2. Booking Inquiry**
```
DocType: Booking Inquiry
Purpose: Track initial contact before reservation

Fields:
- inquiry_id (Data) - Auto-generated unique ID
- guest_name (Data)
- guest_email (Email)
- guest_phone (Data)
- guest_whatsapp (Data) - If from WhatsApp
- source_channel (Link: Channel Config)
- property_interested (Link: Property)
- unit_category (Link: Unit Category)
- check_in_date (Date)
- check_out_date (Date)
- number_of_guests (Int)
- special_requests (Text)
- inquiry_status (Select) - New / Contacted / Quote Sent / Booked / Not Interested
- inquiry_date (DateTime)
- quoted_price (Currency, optional)
- quote_expiry_date (Date, optional)
- conversion_status (Select) - Pending / Converted to Reservation / Lost
```

#### **3. WhatsApp Message Log**
```
DocType: WhatsApp Message Log
Purpose: Track all WhatsApp communication

Fields:
- message_id (Data) - Unique message ID from provider
- booking_inquiry (Link: Booking Inquiry)
- guest_whatsapp (Data)
- message_direction (Select) - Inbound / Outbound
- message_type (Select) - Text / Image / Document / Template
- message_body (Text)
- sent_time (DateTime)
- delivered_time (DateTime, optional)
- read_time (DateTime, optional)
- attachment_url (Data, optional)
- message_status (Select) - Sent / Delivered / Read / Failed
- provider_response (JSON) - Raw API response
```

#### **4. Booking Template**
```
DocType: Booking Template
Purpose: Pre-defined messages for WhatsApp automation

Fields:
- template_name (Data)
- template_language (Select)
- template_body (Text) - Message content with placeholders
  Placeholders: {guest_name}, {check_in}, {check_out}, {total_price}, 
               {property_name}, {payment_link}
- template_type (Select) - Booking Confirmation / Payment Reminder / Check-in Info
- is_approved (Checkbox) - Has WhatsApp template approval
- meta_template_id (Data) - If using Meta/Raven
```

### Frontend Implementation

#### 1. Booking Inquiry Form (React - For Website/WhatsApp)

**Website Widget:**
```jsx
// components/booking-widget.jsx
export default function BookingWidget({ propertyId }) {
  const [formData, setFormData] = useState({
    guest_name: '',
    guest_email: '',
    guest_phone: '',
    guest_whatsapp: '',
    check_in_date: '',
    check_out_date: '',
    number_of_guests: 1,
    special_requests: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Create booking inquiry
    const inquiry = await frappe.call({
      method: 'bookpondy_pms.channels.booking_inquiry.create_inquiry',
      args: {
        ...formData,
        property_interested: propertyId,
        source_channel: 'Direct',
        inquiry_date: new Date().toISOString()
      }
    });

    if (inquiry.message) {
      setSubmitted(true);
      
      // Send WhatsApp message if phone provided
      if (formData.guest_whatsapp) {
        await sendWhatsAppMessage({
          to: formData.guest_whatsapp,
          template: 'booking_inquiry_received',
          parameters: {
            guest_name: formData.guest_name,
            check_in: formData.check_in_date
          }
        });
      }
    }
  };

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded p-4">
        <h3 className="font-bold text-green-800">Thanks for your interest!</h3>
        <p className="text-green-700 mt-2">
          We've received your booking inquiry. We'll contact you within 2 hours.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input 
        type="text"
        placeholder="Full Name"
        required
        value={formData.guest_name}
        onChange={(e) => setFormData({...formData, guest_name: e.target.value})}
        className="w-full border rounded px-3 py-2"
      />
      <input 
        type="email"
        placeholder="Email Address"
        required
        value={formData.guest_email}
        onChange={(e) => setFormData({...formData, guest_email: e.target.value})}
        className="w-full border rounded px-3 py-2"
      />
      <input 
        type="tel"
        placeholder="Phone Number"
        required
        value={formData.guest_phone}
        onChange={(e) => setFormData({...formData, guest_phone: e.target.value})}
        className="w-full border rounded px-3 py-2"
      />
      <input 
        type="tel"
        placeholder="WhatsApp Number (with country code)"
        value={formData.guest_whatsapp}
        onChange={(e) => setFormData({...formData, guest_whatsapp: e.target.value})}
        className="w-full border rounded px-3 py-2"
      />
      <div className="grid grid-cols-2 gap-4">
        <input 
          type="date"
          required
          value={formData.check_in_date}
          onChange={(e) => setFormData({...formData, check_in_date: e.target.value})}
          className="border rounded px-3 py-2"
        />
        <input 
          type="date"
          required
          value={formData.check_out_date}
          onChange={(e) => setFormData({...formData, check_out_date: e.target.value})}
          className="border rounded px-3 py-2"
        />
      </div>
      <input 
        type="number"
        min="1"
        placeholder="Number of Guests"
        required
        value={formData.number_of_guests}
        onChange={(e) => setFormData({...formData, number_of_guests: e.target.value})}
        className="w-full border rounded px-3 py-2"
      />
      <textarea 
        placeholder="Special Requests (optional)"
        value={formData.special_requests}
        onChange={(e) => setFormData({...formData, special_requests: e.target.value})}
        rows={3}
        className="w-full border rounded px-3 py-2"
      />
      <button 
        type="submit"
        className="w-full bg-blue-600 text-white font-semibold rounded py-2 hover:bg-blue-700"
      >
        Send Inquiry via WhatsApp
      </button>
    </form>
  );
}
```

#### 2. Channels Management Console

**Layout:**
```
┌─────────────────────────────────────────┐
│ Channels & Integrations                  │
│ [+ Add Channel] [Sync Now] [Settings]   │
└─────────────────────────────────────────┘

Active Channels:
┌──────────────┬──────────┬────────┬────────┬──────────┐
│ Channel      │ Type     │ Status │ Synced │ Actions  │
├──────────────┼──────────┼────────┼────────┼──────────┤
│ WhatsApp     │ Direct   │ Active │ Now    │ [Config] │
│ Booking.com  │ OTA      │ Active │ 1h ago │ [Config] │
│ Airbnb       │ OTA      │ Paused │ Error  │ [Fix]    │
│ Direct Web   │ Direct   │ Active │ N/A    │ [Config] │
└──────────────┴──────────┴────────┴────────┴──────────┘

Channel: WhatsApp
├─ API Provider: Raven / Meta Graph API
├─ Connected Phone: +91-XXXXXXXXXX
├─ Template Status: 5 approved templates
├─ Last Sync: 2025-12-26 11:15 AM
├─ Message Templates:
│  ├─ Booking Confirmation (Active)
│  ├─ Payment Reminder (Active)
│  ├─ Check-in Information (Pending Approval)
│  └─ Check-out Survey (Draft)
└─ [Disconnect] [View Logs]
```

### Raven Integration Details

#### **Raven Setup (Frappe WhatsApp)**

**1. Install Raven App:**
```bash
bench get-app raven  # Or your branch
bench install-app raven
```

**2. Configure Raven in BookPondy PMS:**
```python
# bookpondy_pms/hooks.py
def setup_raven_integration():
    """Configure Raven for WhatsApp"""
    # This gets called during app initialization
    
    # Create Raven Channel for BookPondy if not exists
    if not frappe.db.exists('Raven Channel', 'BookPondy WhatsApp'):
        raven_channel = frappe.get_doc({
            'doctype': 'Raven Channel',
            'name': 'BookPondy WhatsApp',
            'channel_name': 'BookPondy WhatsApp',
            'channel_type': 'WhatsApp',
            'is_default': 1
        })
        raven_channel.insert()
```

**3. Raven DocType Integration:**
```
Raven Message DocType Fields to Use:
- channel (Link: Raven Channel) - "BookPondy WhatsApp"
- to (Data) - Guest phone number with country code (+91XXXXXXXXXX)
- message (Text) - Message content
- template_name (Data, optional) - Use pre-approved templates
- media (Attachment, optional) - Images, PDFs

Workflow:
1. Create Raven Message doc
2. Raven sends via Meta Graph API
3. Webhook receives delivery/read status
4. BookPondy logs in WhatsApp Message Log DocType
```

#### **Raven Python Methods:**

```python
# bookpondy_pms/channels/whatsapp_integration.py

def send_whatsapp_message(guest_phone, message_text, booking_inquiry_id=None):
    """Send WhatsApp message via Raven"""
    from raven.raven_messaging.doctype.raven_message.raven_message import send_message
    
    # Create Raven Message
    raven_msg = frappe.get_doc({
        'doctype': 'Raven Message',
        'channel': 'BookPondy WhatsApp',
        'to': guest_phone,  # Must include country code
        'message': message_text,
        'message_type': 'TEXT'
    })
    raven_msg.insert()
    
    # Send via Raven
    try:
        send_message(raven_msg.name)
        
        # Log in our WhatsApp Message Log
        log_entry = frappe.get_doc({
            'doctype': 'WhatsApp Message Log',
            'booking_inquiry': booking_inquiry_id,
            'guest_whatsapp': guest_phone,
            'message_direction': 'Outbound',
            'message_type': 'Text',
            'message_body': message_text,
            'message_status': 'Sent',
            'sent_time': frappe.utils.now(),
            'provider_response': frappe.as_json({'raven_id': raven_msg.name})
        })
        log_entry.insert()
        
        return {'status': 'success', 'raven_id': raven_msg.name}
    except Exception as e:
        frappe.log_error(f"WhatsApp send failed: {str(e)}")
        return {'status': 'failed', 'error': str(e)}


def send_templated_message(guest_phone, template_name, context=None):
    """Send WhatsApp template message"""
    # Get approved template
    template = frappe.get_doc('Booking Template', template_name)
    
    # Replace placeholders with context values
    message_body = template.template_body
    if context:
        message_body = message_body.format(**context)
    
    return send_whatsapp_message(guest_phone, message_body)


@frappe.whitelist()
def handle_whatsapp_webhook(event_data):
    """Webhook handler for incoming WhatsApp messages & delivery updates"""
    # Called by Raven webhook
    
    if event_data.get('type') == 'message':
        # Incoming message from guest
        guest_phone = event_data['from']
        message_text = event_data['message']['body']
        message_id = event_data['id']
        
        # Find or create booking inquiry
        inquiry = frappe.db.get_value(
            'Booking Inquiry',
            {'guest_whatsapp': guest_phone},
            'name'
        )
        
        if not inquiry:
            # Create new inquiry
            inquiry_doc = frappe.get_doc({
                'doctype': 'Booking Inquiry',
                'guest_whatsapp': guest_phone,
                'inquiry_status': 'New',
                'source_channel': 'WhatsApp'
            })
            inquiry_doc.insert()
            inquiry = inquiry_doc.name
        
        # Log message
        msg_log = frappe.get_doc({
            'doctype': 'WhatsApp Message Log',
            'message_id': message_id,
            'booking_inquiry': inquiry,
            'guest_whatsapp': guest_phone,
            'message_direction': 'Inbound',
            'message_type': 'Text',
            'message_body': message_text,
            'message_status': 'Delivered',
            'sent_time': frappe.utils.now()
        })
        msg_log.insert()
        
    elif event_data.get('type') == 'status_update':
        # Delivery/read update
        message_id = event_data['id']
        status = event_data['status']  # sent, delivered, read, failed
        timestamp = event_data.get('timestamp')
        
        # Update message log
        msg_log = frappe.get_value(
            'WhatsApp Message Log',
            {'message_id': message_id},
            'name'
        )
        if msg_log:
            msg_doc = frappe.get_doc('WhatsApp Message Log', msg_log)
            msg_doc.message_status = status.title()
            
            if status == 'read':
                msg_doc.read_time = timestamp
            elif status == 'delivered':
                msg_doc.delivered_time = timestamp
            
            msg_doc.save()

```

#### **Payment Link via WhatsApp:**

```python
def send_payment_link_via_whatsapp(folio_id, guest_phone):
    """Send payment link via WhatsApp for guest settlement"""
    folio = frappe.get_doc('Folio', folio_id)
    
    # Generate payment link (integrate with Razorpay/PayU)
    payment_link = create_payment_link(folio)
    
    message_text = f"""
Hello {folio.guest_name},

Your booking #{folio.reservation_id} invoice is ready for payment.

**Amount Due:** ₹{folio.total_amount}

Pay now: {payment_link}

Thank you for choosing BookPondy!
    """
    
    send_whatsapp_message(guest_phone, message_text, folio.name)
```

---

# MODULE 5: MAINTENANCE (PRIORITY: 🟡 SECONDARY)
## Goal: Issue tracking + vendor management

### Data Model (Extend Maintenance Ticket)

```
Fields to Add:
- ticket_priority (Select) - Low / Normal / High / Emergency
- assigned_vendor (Link: Vendor) - From ERPNext Vendor
- estimated_cost (Currency)
- actual_cost (Currency)
- completion_time (DateTime)
- completion_notes (Text)
- attachments (Table) - Photos of issue/resolution
- parts_used (Table) - Link to spare parts/inventory
  - part_name (Data)
  - quantity (Int)
  - unit_cost (Currency)

- related_unit (Link: Unit) - Which unit needs maintenance
- related_property (Link: Property) - Denormalized
```

### Quick React Component (Status Dashboard)

```jsx
// pages/maintenance/list.jsx
export default function MaintenanceList() {
  const [tickets, setTickets] = useState([]);
  
  useEffect(() => {
    frappe.call({
      method: 'frappe.client.get_list',
      args: {
        doctype: 'Maintenance Ticket',
        fields: ['name', 'status', 'related_unit', 'ticket_priority', 'created'],
        limit_page_length: 50
      },
      callback: (r) => setTickets(r.message)
    });
  }, []);

  const statuses = ['New', 'In Progress', 'Completed', 'On Hold'];
  
  return (
    <div className="space-y-6">
      <h1>Maintenance Tickets</h1>
      
      {statuses.map(status => (
        <div key={status}>
          <h3 className="font-bold">{status}</h3>
          <div className="space-y-2">
            {tickets.filter(t => t.status === status).map(ticket => (
              <div key={ticket.name} className="border rounded p-3 flex justify-between">
                <div>
                  <p className="font-semibold">{ticket.name}</p>
                  <p className="text-sm text-gray-600">{ticket.related_unit}</p>
                </div>
                <div className="flex gap-2">
                  <Badge>{ticket.ticket_priority}</Badge>
                  <Button size="sm" onClick={() => window.location.href = `/app/maintenance-ticket/${ticket.name}`}>
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

---

# MODULE 6: ERPNext INTEGRATION (CRITICAL)

## Architecture: Two-Site Sync Model

### Setup Overview

```
BookPondy PMS (Site 1)          ERP Site (ERPNext)
──────────────────               ──────────────────
Frappe v15                        Frappe v15
- Property Portfolio              - Company
- Property                        - Warehouse (by property)
- Unit                            - Vendors
- Reservation                     - GL Entries
- Folio                           - Sales Invoice
- Transaction                     - Payment Receipt
```

### Sync Points

#### **1. Sales Revenue → GL Entry (On Folio Payment)**
```python
# Hook: on_folio_paid
def sync_revenue_to_erp(doc, method):
    if doc.docstatus != 1 or not doc.erp_site_name:
        return
    
    gl_entry = {
        'posting_date': doc.payment_date,
        'account': 'Sales - PMS',  # From property settings
        'debit': 0,
        'credit': doc.total_amount,
        'reference_type': 'Folio',
        'reference_name': doc.name,
        'cost_center': get_property_cost_center(doc.property)
    }
    
    sync_to_erp_site(doc.erp_site_name, 'GL Entry', gl_entry)
```

#### **2. Expenses → Purchase Invoice (From Maintenance)**
```python
# Hook: on_maintenance_complete
def sync_expense_to_erp(doc, method):
    if not doc.assigned_vendor or not doc.actual_cost:
        return
    
    pi = {
        'supplier': doc.assigned_vendor,
        'posting_date': doc.completion_time,
        'items': [
            {
                'item_code': part.part_name,
                'qty': part.quantity,
                'rate': part.unit_cost
            }
            for part in doc.parts_used
        ],
        'reference_doctype': 'Maintenance Ticket',
        'reference_name': doc.name
    }
    
    sync_to_erp_site(doc.erp_site_name, 'Purchase Invoice', pi)
```

#### **3. Inventory Sync (If Using ERPNext Stock)**
```python
# Optional: For spare parts/consumables
def sync_spare_parts_to_erp(parts_list, erp_site):
    """Sync spare parts consumed to ERPNext stock"""
    for part in parts_list:
        stock_entry = {
            'doctype': 'Stock Entry',
            'stock_entry_type': 'Material Issue',
            'from_warehouse': 'Maintenance - Pondicherry',
            'items': [
                {
                    'item_code': part.code,
                    'qty': part.qty,
                    'basic_rate': part.cost
                }
            ]
        }
        sync_to_erp_site(erp_site, 'Stock Entry', stock_entry)
```

### Python Helper Module

```python
# bookpondy_pms/erp_integration/sync.py

import frappe
from frappe.client import get_list, insert, update_doc
import requests

def sync_to_erp_site(erp_site_name, doctype, doc_data):
    """Sync document to ERPNext site"""
    
    # Get ERP site configuration
    erp_config = frappe.get_doc('ERP Site Configuration', erp_site_name)
    
    headers = {
        'Authorization': f'token {erp_config.api_key}:{erp_config.api_secret}',
        'Content-Type': 'application/json'
    }
    
    url = f"{erp_config.site_url}/api/resource/{frappe.scrub(doctype)}"
    
    try:
        response = requests.post(url, json=doc_data, headers=headers)
        
        if response.status_code == 200:
            result = response.json()
            return {
                'status': 'success',
                'erp_name': result['data']['name'],
                'sync_time': frappe.utils.now()
            }
        else:
            frappe.log_error(f"ERP Sync failed: {response.text}")
            return {'status': 'failed', 'error': response.text}
            
    except Exception as e:
        frappe.log_error(f"ERP Sync error: {str(e)}")
        return {'status': 'error', 'error': str(e)}


def get_property_cost_center(property_name):
    """Get ERP cost center for property"""
    prop = frappe.get_doc('Property', property_name)
    return prop.erp_cost_center  # Must be set in Property DocType


def get_pms_sales_account(property_name):
    """Get ERP sales account for property"""
    prop = frappe.get_doc('Property', property_name)
    return prop.erp_sales_account  # e.g., "Sales - PMS - Pondicherry"
```

### New DocType: ERP Site Configuration

```
DocType: ERP Site Configuration
Purpose: Store connection details for ERPNext site

Fields:
- site_name (Data) - Display name, e.g., "MainERP"
- site_url (Data) - Full URL, e.g., https://erp.yourdomain.com
- api_key (Data) - Frappe API key
- api_secret (Password) - Frappe API secret
- is_active (Checkbox)
- last_sync_time (DateTime)
- sync_status (Select) - Connected / Error / Never Synced
```

### Auto-Sync Trigger Configuration

```python
# In DocType hooks (python_api=True)

def on_doctype_created(doctype):
    """Setup sync triggers for financial DocTypes"""
    
    doctypes_to_sync = [
        ('Folio', 'after_insert', 'bookpondy_pms.erp_integration.sync.sync_folio'),
        ('Folio', 'on_update', 'bookpondy_pms.erp_integration.sync.on_folio_paid'),
        ('Maintenance Ticket', 'on_update', 'bookpondy_pms.erp_integration.sync.sync_maintenance'),
        ('Transaction', 'after_insert', 'bookpondy_pms.erp_integration.sync.sync_payment')
    ]
    
    for doctype, event, method in doctypes_to_sync:
        frappe.db.set_value('DocType Event', 
            {'doctype': doctype, 'event': event},
            'python_api_method', method)
```

---

## 📊 IMPLEMENTATION PRIORITY ROADMAP

| Week | Module | Features | Effort | Dependencies |
|------|--------|----------|--------|--------------|
| 1 | **Dashboard** | KPI cards, Revenue trend chart | 8h | None |
| 1-2 | **Financials** | ADR/RevPAR/Occupancy reports, Date range filters | 16h | Dashboard |
| 2 | **Invoices** | Folio detail view, PDF generation, Email | 12h | Folio (exists) |
| 2-3 | **Tasks** | Kanban board, Drag-drop UI, Staff assignment | 20h | Unit Status (exists) |
| 3 | **WhatsApp** | Raven integration, Booking form, Templates | 16h | Booking Inquiry DocType |
| 3-4 | **Channels** | OTA config, Commission tracking, Sync UI | 24h | Channel Config DocType |
| 4 | **ERP Integration** | Sync hooks, GL Entry creation, GL Entry mapping | 12h | ERP Site Config DocType |
| 4-5 | **Maintenance** | Ticket list, Vendor tracking, Parts management | 12h | Vendor integration |
| 5 | **Reports** | Custom reports, Data export | 16h | All modules |

**Total Effort: ~136 hours (~3-4 weeks for full-stack developer)**

---

## 🔑 KEY DECISIONS FOR YOUR BUSINESS

1. ✅ **WhatsApp over SMS** - Use Raven (Frappe-native) for WhatsApp + SMS integration
2. ✅ **ERPNext two-site sync** - PMS on one site, ERP on another, daily sync of revenue/expenses
3. ✅ **GST-compliant invoicing** - HSN codes + SGST/CGST tracking for Indian regulations
4. ✅ **Kanban for operations** - Housekeeping board reduces manual coordination
5. ⚠️ **Start with Direct + WhatsApp** - Defer Airbnb/Booking.com integration until revenue justifies it
6. ✅ **Property-level ERPAccount mapping** - Each property maps to cost center in ERP for P&L tracking

---

## 📝 NEXT STEPS

1. **Review & Validate** - Confirm these specs match your business model
2. **Setup Raven** - Install & configure for WhatsApp in your dev/staging environment
3. **Create DocTypes** - Add Booking Inquiry, WhatsApp Message Log, Channel Config
4. **Implement Dashboard** - KPI cards first, then charts
5. **Build Financials** - Revenue dashboard + forecasting
6. **Test ERPNext Sync** - Set up GL Entry + Sales Invoice mappings

