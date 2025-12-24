# Copyright (c) 2025, vasanth ranganathan and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.utils import flt


class Folio(Document):
	def validate(self):
		self.calculate_totals()

	def calculate_totals(self):
		subtotal = 0
		total_tax = 0
		
		# In this implementation, Folio finds charges linked to its reservation
		charges = frappe.get_all("Charge", 
			filters={"reservation": self.reservation},
			fields=["total_amount", "tax_amount", "subtotal_amount"]
		)
		
		for charge in charges:
			# Note: The field names might vary slightly depending on exact schema, 
			# adjusting based on typical patterns. Spec mentions 'total_amount' and 'tax_amount'.
			subtotal += flt(charge.get("total_amount", 0)) - flt(charge.get("tax_amount", 0))
			total_tax += flt(charge.get("tax_amount", 0))

		self.subtotal = subtotal
		self.total_tax = total_tax
		self.grand_total = subtotal + total_tax - flt(self.discount_amount)
		
		if self.grand_total > 0:
			# Update folio status if paid amount matches (would need transaction link)
			pass
