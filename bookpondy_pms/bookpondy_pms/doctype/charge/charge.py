# Copyright (c) 2025, vasanth ranganathan and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.utils import flt


class Charge(Document):
	def validate(self):
		self.calculate_amounts()

	def calculate_amounts(self):
		# Basic calculation based on spec: total = (qty * rate) + tax
		# Assuming tax is a separate field or calculated from a template
		base_amount = flt(self.quantity) * flt(self.unit_rate)
		
		# Simple tax logic if not using complex templates yet
		if not self.tax_amount and self.tax_template:
			# Placeholder for tax calculation based on template
			# For now, let's assume 0 if not provided
			self.tax_amount = 0
			
		self.total_amount = base_amount + flt(self.tax_amount)
		
	def on_update(self):
		# Trigger folio update if reservation is linked
		if self.reservation:
			folio_name = frappe.db.get_value("Folio", {"reservation": self.reservation}, "name")
			if folio_name:
				frappe.get_doc("Folio", folio_name).save()
