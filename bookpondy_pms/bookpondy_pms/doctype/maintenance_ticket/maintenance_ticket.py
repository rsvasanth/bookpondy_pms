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
		if self.ticket_status in ["Resolved", "Closed"]:
			self.deduct_inventory_stock()

	def deduct_inventory_stock(self):
		"""Creates Outward Stock Entries for all parts used in the maintenance ticket."""
		for part in self.parts:
			if not part.part_name:
				continue
				
			# Check if we already created a stock entry for this part in this ticket
			existing = frappe.get_all("PMS Stock Entry", filters={
				"reference_doctype": "Maintenance Ticket",
				"reference_name": self.name,
				"item": part.part_name,
				"docstatus": ["<", 2] # Not cancelled
			})
			
			if not existing:
				se = frappe.get_doc({
					"doctype": "PMS Stock Entry",
					"item": part.part_name,
					"entry_type": "Outward",
					"quantity": part.quantity or 1,
					"date": frappe.utils.nowdate(),
					"reference_doctype": "Maintenance Ticket",
					"reference_name": self.name,
					"notes": f"Used for Maintenance Ticket: {self.issue_title}"
				})
				se.insert()
				se.submit()

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
