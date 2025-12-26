import frappe
from frappe.model.document import Document
from frappe.utils import now_datetime

class MaintenanceTicket(Document):
	def before_save(self):
		if self.is_new():
			if not self.property_link and self.unit:
				self.property_link = frappe.db.get_value("Unit", self.unit, "property")

		if self.has_value_changed("ticket_status"):
			if self.ticket_status in ["Resolved", "Closed"] and not self.completion_time:
				self.completion_time = now_datetime()
