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
		except Exception:
			self.status = "Failed"
			frappe.log_error("Guest Communication Failed")
		
		self.save()

	def send_email(self):
		guest_email = frappe.db.get_value("Guest", self.guest, "email")
		if not guest_email:
			frappe.throw("Guest email not found")
			
		frappe.sendmail(
			recipients=[guest_email],
			subject=self.subject,
			content=self.content,
			delayed=False
		)
