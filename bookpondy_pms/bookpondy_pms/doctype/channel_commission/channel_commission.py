# Copyright (c) 2026, vasanth ranganathan and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

class ChannelCommission(Document):
	def validate(self):
		if not self.commission_amount and self.commission_percentage:
			booking_total = frappe.db.get_value("Reservation", self.booking, "total_amount")
			if booking_total:
				self.commission_amount = (booking_total * self.commission_percentage) / 100
