import frappe
import requests
from frappe import _

class ERPNextConnector:
    def __init__(self):
        self.settings = frappe.get_single('PMS ERPNext Settings')
        self.url = self.settings.erpnext_url.rstrip('/')
        self.api_key = self.settings.api_key
        self.api_secret = self.settings.get_password('api_secret')
        self.headers = {
            'Authorization': f'token {self.api_key}:{self.api_secret}',
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }

    def test_connection(self):
        """Test authentication with remote ERPNext site by fetching current user."""
        try:
            response = requests.get(
                f"{self.url}/api/method/frappe.auth.get_logged_user",
                headers=self.headers,
                timeout=10
            )
            if response.status_code == 200:
                return True
            else:
                frappe.log_error(f"ERPNext Connection Result: {response.text}", "ERPNext Connector")
                return False
        except Exception as e:
            frappe.log_error(f"ERPNext Connection Error: {str(e)}", "ERPNext Connector")
            return False

    def push_document(self, doctype, data):
        """Push a document to remote ERPNext site."""
        if not self.settings.is_enabled:
            return
            
        try:
            response = requests.post(
                f"{self.url}/api/resource/{doctype}",
                headers=self.headers,
                json=data,
                timeout=20
            )
            if response.status_code in (200, 201):
                return response.json().get('data')
            else:
                frappe.log_error(f"ERPNext Push Failed ({response.status_code}): {response.text}", "ERPNext Connector")
                return None
        except Exception as e:
            frappe.log_error(f"ERPNext Push Error: {str(e)}", "ERPNext Connector")
            return None

    def get_remote_document(self, doctype, filters):
        """Fetch a document from remote ERPNext site by filters."""
        try:
            params = {"filters": frappe.as_json(filters)}
            response = requests.get(
                f"{self.url}/api/resource/{doctype}",
                headers=self.headers,
                params=params,
                timeout=10
            )
            if response.status_code == 200:
                data = response.json().get('data', [])
                return data[0] if data else None
            return None
        except Exception:
            return None

    def map_guest_to_customer(self, guest_id):
        """Ensures a Guest exists as a Customer in remote ERPNext."""
        guest = frappe.get_doc("Guest", guest_id)
        
        # Check if already linked via a custom field in remote ERPNext if we had one, 
        # but for now we match by email or name.
        remote_customer = self.get_remote_document("Customer", {"email_id": guest.email})
        
        if remote_customer:
            return remote_customer.get("name")
            
        # Create new Customer
        customer_data = {
            "customer_name": guest.guest_name,
            "customer_type": "Individual",
            "email_id": guest.email,
            "mobile_no": guest.phone
        }
        res = self.push_document("Customer", customer_data)
        return res.get("name") if res else None

    def sync_reservation_as_invoice(self, reservation_name):
        """Converts a Reservation (checked-out) to a Sales Invoice in ERPNext with detailed Items and Taxes."""
        res = frappe.get_doc("Reservation", reservation_name)
        if res.reservation_status != "Checked-Out":
            return
            
        customer = self.map_guest_to_customer(res.guest)
        if not customer:
            return
            
        property_doc = frappe.get_doc("Property", res.property)
        company = property_doc.erp_company or self.settings.default_company
        
        # Pull Folio and Charges
        folio = frappe.get_all("Folio", filters={"reservation": res.name}, limit=1)
        if not folio:
            return
        
        folio_doc = frappe.get_doc("Folio", folio[0].name)
        charges = frappe.get_all("Charge", 
            filters={"reservation": res.name}, 
            fields=["charge_type", "unit_rate", "quantity", "tax_amount", "total_amount"]
        )

        items = []
        for chg in charges:
            items.append({
                "item_name": f"{chg.charge_type}: {res.unit_category if chg.charge_type == 'Room' else chg.charge_type}",
                "qty": chg.quantity or 1,
                "rate": chg.unit_rate,
                "income_account": property_doc.erp_sales_account
            })

        # Add Taxes based on Folio summary or split
        taxes = []
        if folio_doc.total_tax > 0:
            # Simple logic: assume 50/50 split for CGST/SGST if no IGST logic is defined yet
            # In a real setup, we'd check guest's state vs property state
            tax_amount = folio_doc.total_tax / 2
            
            if self.settings.cgst_account:
                taxes.append({
                    "charge_type": "Actual",
                    "account_head": self.settings.cgst_account,
                    "description": "CGST",
                    "tax_amount": tax_amount
                })
            
            if self.settings.sgst_account:
                taxes.append({
                    "charge_type": "Actual",
                    "account_head": self.settings.sgst_account,
                    "description": "SGST",
                    "tax_amount": tax_amount
                })

        invoice_data = {
            "doctype": "Sales Invoice",
            "company": company,
            "customer": customer,
            "posting_date": frappe.utils.nowdate(),
            "cost_center": property_doc.erp_cost_center,
            "update_stock": 0,
            "items": items,
            "taxes": taxes
        }
        
        return self.push_document("Sales Invoice", invoice_data)

    def sync_transaction_as_payment(self, transaction_name):
        """Converts a PMS Transaction to a Payment Entry in ERPNext."""
        txn = frappe.get_doc("Transaction", transaction_name)
        folio = frappe.get_doc("Folio", txn.folio)
        res = frappe.get_doc("Reservation", folio.reservation)
        
        customer = self.map_guest_to_customer(res.guest)
        property_doc = frappe.get_doc("Property", res.property)
        company = property_doc.erp_company or self.settings.default_company

        payment_data = {
            "doctype": "Payment Entry",
            "payment_type": "Receive",
            "party_type": "Customer",
            "party": customer,
            "company": company,
            "paid_amount": txn.amount,
            "received_amount": txn.amount,
            "mode_of_payment": txn.payment_mode,
            "reference_no": txn.name,
            "reference_date": frappe.utils.nowdate()
        }
        
        return self.push_document("Payment Entry", payment_data)

    def sync_staff_as_employee(self, staff_name):
        """Syncs a Staff record as an Employee in ERPNext."""
        staff = frappe.get_doc("Staff", staff_name)
        property_doc = frappe.get_doc("Property", staff.property)
        company = property_doc.erp_company or self.settings.default_company

        remote_employee = self.get_remote_document("Employee", {"personal_email": staff.email})
        if remote_employee:
            return remote_employee.get("name")

        employee_data = {
            "doctype": "Employee",
            "first_name": staff.staff_name,
            "company": company,
            "designation": staff.designation,
            "personal_email": staff.email,
            "cell_number": staff.phone,
            "status": "Active" if staff.status == "Active" else "Left"
        }
        return self.push_document("Employee", employee_data)

    def sync_maintenance_ticket(self, ticket_name):
        """Syncs Maintenance Ticket to ERPNext (Asset Maintenance or Material Request)."""
        ticket = frappe.get_doc("Maintenance Ticket", ticket_name)
        property_doc = frappe.get_doc("Property", ticket.property_link)
        company = property_doc.erp_company or self.settings.default_company

        # If parts are involved, create a Material Request
        if ticket.parts:
            items = []
            for p in ticket.parts:
                items.append({
                    "item_code": p.item_code,
                    "qty": p.qty,
                    "uom": "Nos", # Default
                    "schedule_date": frappe.utils.nowdate()
                })
            
            mr_data = {
                "doctype": "Material Request",
                "company": company,
                "transaction_date": frappe.utils.nowdate(),
                "material_request_type": "Purchase",
                "items": items
            }
            self.push_document("Material Request", mr_data)

        # Also log as Asset Maintenance if unit has a linked asset in ERPNext (future scope)
        # For now, we just log the Issue/Material Request

    def sync_guest_communication(self, comm_name):
        """Syncs Guest Communication to ERPNext CRM Communication."""
        comm = frappe.get_doc("Guest Communication", comm_name)
        if comm.status != "Sent":
            return

        customer = self.map_guest_to_customer(comm.guest)
        if not customer:
            return

        property_doc = frappe.get_doc("Property", frappe.db.get_value("Guest", comm.guest, "property"))
        # Note: Guests might not be linked to one property, so we get it from their last reservation or profile
        
        # ## 6. GST & Tax Integration Strategy
        # 
        # To ensure seamless financial reporting, taxes calculated in the PMS must align with the remote ERPNext Chart of Accounts.
        # 
        # ### Tax Mapping Logic
        # 
        # | PMS Component | ERPNext Component | Handling Logic |
        # |---------------|-------------------|----------------|
        # | **Folio Subtotal** | `Net Total` | Matches the accumulated base amount of all charges. |
        # | **CGST / SGST** | `Sales Taxes and Charges` | Split the PMS `total_tax` (50/50 for intra-state) and push as specific tax rows in the Sales Invoice. |
        # | **Tax Accounts** | `Account Head` | Configure specific account heads (e.g., "Output GST - CGST") in `ERPNext Settings`. |
        # | **Item Tax** | `Item Tax Template` | Optionally apply templates to individual items for more granular reporting. |
        # 
        # ### Technical Implementation
        # 
        # 1.  **Account Configuration**: Add fields to `ERPNext Settings` for `CGST Account`, `SGST Account`, and `IGST Account`.
        # 2.  **HSN Codes**: Ensure PMS `Charge Type` or `Unit Category` can store HSN codes to be pushed to ERPNext items.
        # 3.  **Folio Sync Upgrade**: Update the sync logic to fetch all `Charge` records for a reservation and push them as individual lines in the ERPNext `Sales Invoice`.
        # 
        # ---
        # 
        # ## 🚀 Recommended Implementation Priority
        comm_data = {
            "doctype": "Communication",
            "communication_type": "Communication",
            "communication_medium": comm.communication_type,
            "subject": comm.subject,
            "content": comm.content,
            "sender": frappe.session.user,
            "recipients": frappe.db.get_value("Guest", comm.guest, "email"),
            "reference_doctype": "Customer",
            "reference_name": customer,
            "status": "Linked"
        }
        return self.push_document("Communication", comm_data)

def sync_reservation(reservation_name):
    """Entry point for background job to sync reservation."""
    connector = ERPNextConnector()
    connector.sync_reservation_as_invoice(reservation_name)

def sync_transaction(transaction_name):
    """Entry point for background job to sync transaction."""
    connector = ERPNextConnector()
    connector.sync_transaction_as_payment(transaction_name)

def sync_staff(staff_name):
    """Entry point for background job to sync staff."""
    connector = ERPNextConnector()
    connector.sync_staff_as_employee(staff_name)

def sync_maintenance(ticket_name):
    """Entry point for background job to sync maintenance ticket."""
    connector = ERPNextConnector()
    connector.sync_maintenance_ticket(ticket_name)

def sync_communication(comm_name):
    """Entry point for background job to sync guest communication."""
    connector = ERPNextConnector()
    connector.sync_guest_communication(comm_name)
