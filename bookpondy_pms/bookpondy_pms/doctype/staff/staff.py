# Copyright (c) 2025, vasanth ranganathan and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class Staff(Document):
	def validate(self):
		if self.user:
			self.update_user_permissions()

	def on_update(self):
		self.sync_to_erpnext()

	def sync_to_erpnext(self):
		"""Sync staff as an Employee to remote ERPNext."""
		from bookpondy_pms.integrations.erpnext_connector import ERPNextConnector
		connector = ERPNextConnector()
		if connector.settings.is_enabled:
			frappe.enqueue(
				"bookpondy_pms.integrations.erpnext_connector.sync_staff",
				staff_name=self.name,
				queue="long",
				timeout=600
			)
