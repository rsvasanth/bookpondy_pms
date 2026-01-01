# Copyright (c) 2025, vasanth ranganathan and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class GuestCommunication(Document):
	def on_submit(self):
		if self.status == "Pending":
			self.send_communication()

	def send_communication(self):
		# Integration logic for Email/SMS/WhatsApp
		try:
			if self.communication_type == "Email":
				self.send_email()
			# Add other types here
			self.status = "Sent"
			self.sync_to_erpnext()
		except Exception as e:
			frappe.errprint(e)
			self.status = "Failed"
			frappe.log_error(f"Guest Communication Failed: {str(e)}")
		
		self.save()

	def sync_to_erpnext(self):
		"""Sync communication to remote ERPNext CRM."""
		if frappe.flags.in_test:
			return

		from bookpondy_pms.integrations.erpnext_connector import ERPNextConnector
		connector = ERPNextConnector()
		if connector.settings.is_enabled:
			frappe.enqueue(
				"bookpondy_pms.integrations.erpnext_connector.sync_communication",
				comm_name=self.name,
				queue="long",
				timeout=600
			)

	def send_email(self):
		if frappe.flags.in_test:
			return

		guest_email = frappe.db.get_value("Guest", self.guest, "email")
		if not guest_email:
			frappe.throw("Guest email not found")
			
		frappe.sendmail(
			recipients=[guest_email],
			subject=self.subject,
			content=self.content,
			delayed=False
		)
