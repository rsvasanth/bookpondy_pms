# Copyright (c) 2025, vasanth ranganathan and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document


class Transaction(Document):
	def on_submit(self):
		self.sync_to_erpnext()

	def sync_to_erpnext(self):
		"""Sync transaction as a Payment Entry to remote ERPNext."""
		from bookpondy_pms.integrations.erpnext_connector import ERPNextConnector
		connector = ERPNextConnector()
		if connector.settings.is_enabled:
			frappe.enqueue(
				"bookpondy_pms.integrations.erpnext_connector.sync_transaction",
				transaction_name=self.name,
				queue="long",
				timeout=600
			)
