# Copyright (c) 2025, vasanth ranganathan and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class Property(Document):
	def validate(self):
		self.update_room_counts()

	def update_room_counts(self):
		# Count all rooms linked to this property
		# Rooms are linked via Room Type -> Property
		room_count = frappe.db.count("Room", {"property": self.name})
		self.total_rooms = room_count
		
		# If Units are used separately, they can also be counted
		# For now, let's assume total_units is synonymous with total_rooms if not specified
		if not self.total_units:
			self.total_units = room_count
