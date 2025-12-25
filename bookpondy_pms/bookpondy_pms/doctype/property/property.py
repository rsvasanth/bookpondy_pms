# Copyright (c) 2025, vasanth ranganathan and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class Property(Document):
	def validate(self):
		self.update_room_counts()

	def after_insert(self):
		self.create_default_units()

	def create_default_units(self):
		if self.property_type in ["Villa", "Homestay", "Apartment"]:
			# Create Default Unit Category
			category_name = f"Entire {self.property_type}"
			if not frappe.db.exists("Unit Category", {"property": self.name}):
				category_doc = frappe.get_doc({
					"doctype": "Unit Category",
					"property": self.name,
					"category_name": category_name,
					"base_price": 5000 # Default placeholder
				})
				category_doc.insert(ignore_permissions=True)
				
				# Create Default Unit
				frappe.get_doc({
					"doctype": "Unit",
					"property": self.name,
					"unit_category": category_doc.name,
					"unit_number": "1",
					"status": "Clean"
				}).insert(ignore_permissions=True)
				
				frappe.msgprint(f"Automatically set up '{category_name}' and Unit 1 for {self.property_name}")

	def update_room_counts(self):
		# Count all rooms linked to this property
		# Rooms are linked via Room Type -> Property
		room_count = frappe.db.count("Room", {"property": self.name})
		self.total_rooms = room_count
		
		# If Units are used separately, they can also be counted
		# For now, let's assume total_units is synonymous with total_rooms if not specified
		if not self.total_units:
			self.total_units = room_count
