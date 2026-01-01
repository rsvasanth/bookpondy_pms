import frappe
from frappe.model.document import Document
from bookpondy_pms.bookpondy_pms.utils.realtime import notify

class BookingInquiry(Document):
	def after_insert(self):
		notify(
			message=f"New booking inquiry received from {self.guest_name}",
			title="New Inquiry",
			type="info",
			doctype="Booking Inquiry",
			docname=self.name,
			link="/communications"
		)
