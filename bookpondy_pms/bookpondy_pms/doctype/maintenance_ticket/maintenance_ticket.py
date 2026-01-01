import frappe
from frappe.model.document import Document
from frappe.utils import now_datetime

class MaintenanceTicket(Document):
	def before_save(self):
		if self.is_new():
			if not self.property_link and self.unit:
				self.property_link = frappe.db.get_value("Unit", self.unit, "property")

	def on_update(self):
		self.sync_to_erpnext()

	def sync_to_erpnext(self):
		"""Sync maintenance ticket to remote ERPNext."""
		from bookpondy_pms.integrations.erpnext_connector import ERPNextConnector
		connector = ERPNextConnector()
		if connector.settings.is_enabled:
			frappe.enqueue(
				"bookpondy_pms.integrations.erpnext_connector.sync_maintenance",
				ticket_name=self.name,
				queue="long",
				timeout=600
			)
