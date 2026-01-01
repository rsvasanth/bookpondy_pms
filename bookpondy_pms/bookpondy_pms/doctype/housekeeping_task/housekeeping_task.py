import frappe
from frappe.model.document import Document
from frappe.utils import now_datetime
from bookpondy_pms.bookpondy_pms.utils.realtime import notify

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
					
		if self.has_value_changed("status"):
			notify(
				message=f"Housekeeping task {self.name} for {self.unit} is now {self.status}",
				title="Housekeeping Update",
				doctype="Housekeeping Task",
				docname=self.name,
				link="/housekeeping"
			)

	def after_insert(self):
		notify(
			message=f"New housekeeping task assigned for {self.unit}: {self.task_type}",
			title="New Task",
			type="info",
			doctype="Housekeeping Task",
			docname=self.name,
			link="/housekeeping"
		)
