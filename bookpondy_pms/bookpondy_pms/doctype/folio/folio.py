import frappe
from frappe.model.document import Document
from frappe.utils import flt, nowdate, getdate

class Folio(Document):
	def validate(self):
		self.calculate_totals()

	def calculate_totals(self):
		self.subtotal = 0
		self.total_tax = 0
		
		# Map charge types to GST rates (default 18% for accommodation, 5% for others)
		gst_rates = {
			"Accommodation": 12 if self.grand_total < 7500 else 18,
			"Service": 18,
			"Amenity": 12,
			"Food & Beverage": 5
		}
		
		charges = frappe.get_all("Charge", 
			filters={"reservation": self.reservation},
			fields=["name", "amount", "charge_type"]
		)
		
		for charge in charges:
			amount = flt(charge.amount)
			rate = gst_rates.get(charge.charge_type, 18)
			
			if self.gst_status == "Applicable":
				# Simplified: Assume inclusive tax
				tax = amount * rate / (100 + rate)
				self.total_tax += tax
				self.subtotal += amount - tax
			else:
				self.subtotal += amount

		self.grand_total = self.subtotal + self.total_tax - flt(self.discount_amount)

	@frappe.whitelist()
	def finalize_invoice(self, gst_number=None, payment_method=None):
		"""Finalizes the invoice and generates an invoice number."""
		if self.invoice_status != "Draft":
			return self.invoice_number

		self.invoice_status = "Finalized"
		self.invoice_date = nowdate()
		if gst_number:
			self.gst_number = gst_number
		if payment_method:
			self.payment_method = payment_method
		
		# Generate Invoice Number: {PROP_CODE}-{YYYY}{MM}{SEQ}
		property_id = frappe.db.get_value("Reservation", self.reservation, "property")
		prop_code = property_id[:4].upper() if property_id else "INV"
		
		date_prefix = getdate().strftime("%Y%m")
		series = f"INV-{prop_code}-{date_prefix}-"
		self.invoice_number = frappe.model.naming.make_autoname(f"{series}.#####")
		
		self.save()
		return self.invoice_number

@frappe.whitelist()
def get_invoice_details(folio_name):
	"""Returns comprehensive details for the invoice view."""
	doc = frappe.get_doc("Folio", folio_name)
	res_doc = frappe.get_doc("Reservation", doc.reservation)
	
	charges = frappe.get_all("Charge", 
		filters={"reservation": doc.reservation},
		fields=["name", "charge_type", "amount"]
	)
	
	return {
		"invoice_number": doc.invoice_number or doc.name,
		"invoice_date": doc.invoice_date,
		"invoice_status": doc.invoice_status,
		"status": doc.status,
		"guest_name": res_doc.guest_name,
		"guest_email": res_doc.guest_email,
		"guest_phone": res_doc.guest_phone,
		"check_in_date": res_doc.check_in_date,
		"check_out_date": res_doc.check_out_date,
		"property_name": frappe.db.get_value("Property", res_doc.property, "property_name"),
		"charges": charges,
		"subtotal": doc.subtotal,
		"total_tax": doc.total_tax,
		"sgst_amount": doc.total_tax / 2,
		"cgst_amount": doc.total_tax / 2,
		"discount_amount": doc.discount_amount,
		"total_amount": doc.grand_total,
		"payment_method": doc.payment_method,
		"payment_reference": doc.payment_reference,
		"refund_amount": doc.refund_amount,
		"refund_reason": doc.refund_reason,
		"refund_date": doc.refund_date
	}

@frappe.whitelist()
def process_refund(folio_name, refund_amount, refund_reason, refund_method):
	"""Processes a refund for a folio."""
	doc = frappe.get_doc("Folio", folio_name)
	doc.refund_amount = flt(refund_amount)
	doc.refund_reason = refund_reason
	doc.refund_method = refund_method
	doc.refund_date = nowdate()
	doc.status = "Cancelled" # Or a new status like 'Refunded'
	doc.save()
	return doc.refund_amount

@frappe.whitelist()
def send_invoice_email(folio_name, email=None):
	"""Sends the invoice PDF via email."""
	doc = frappe.get_doc("Folio", folio_name)
	target_email = email or doc.guest_email_address or frappe.db.get_value("Reservation", doc.reservation, "guest_email")
	
	if not target_email:
		frappe.throw("Recipient email address is missing.")
	
	# Placeholder for real PDF attachment
	frappe.sendmail(
		recipients=[target_email],
		subject=f"Invoice {doc.invoice_number or doc.name} from BookPondy",
		message=f"Please find your invoice attached.",
		# attachments=[frappe.attach_print("Folio", doc.name)] # This uses Frappe print format
	)
	
	doc.sent_to_guest = 1
	doc.guest_email_address = target_email
	doc.save()
	return True

@frappe.whitelist()
def generate_invoice_pdf(folio):
	"""Generates and returns an invoice PDF (placeholder)."""
	doc = frappe.get_doc("Folio", folio)
	# In a real system, we'd use frappe.get_print("Folio", doc.name)
	# For now, we return a simple HTML that the browser can print.
	html = frappe.get_print("Folio", doc.name, as_pdf=True)
	
	frappe.local.response.filename = f"{doc.invoice_number or doc.name}.pdf"
	frappe.local.response.filecontent = html
	frappe.local.response.type = "download"
