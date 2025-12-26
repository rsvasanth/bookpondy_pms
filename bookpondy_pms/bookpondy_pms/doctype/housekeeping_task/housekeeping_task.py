import frappe
from frappe.model.document import Document
from frappe.utils import now_datetime

class HousekeepingTask(Document):
	def before_save(self):
		if self.is_new():
			if not self.property_link and self.unit:
				self.property_link = frappe.db.get_value("Unit", self.unit, "property")

		if self.has_value_changed("status"):
			if self.status == "In Progress" and not self.started_time:
				self.started_time = now_datetime()
			elif self.status == "Completed" and not self.completed_time:
				self.completed_time = now_datetime()
				if not self.started_time:
					self.started_time = now_datetime()
