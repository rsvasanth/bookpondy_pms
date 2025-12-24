# Copyright (c) 2025, vasanth ranganathan and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class Staff(Document):
	def validate(self):
		if self.user:
			self.update_user_permissions()

	def update_user_permissions(self):
		# logic to sync roles or permissions based on designation
		pass
