# Copyright (c) 2025, vasanth ranganathan and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class Property(Document):
	def validate(self):
		self.update_room_counts()

	def on_update(self):
		if self.get("marketplace_sync"):
			frappe.enqueue(
				"bookpondy_pms.integrations.marketplace_sync.sync_property_to_marketplace",
				property_name=self.name,
				queue="long"
			)

	def after_insert(self):
		self.create_default_units()

	def create_default_units(self):
		if self.property_type in ["Villa", "Homestay", "Apartment"]:
			# Create Default Unit Category
			category_name = f"Entire {self.property_type}"
			if not frappe.db.exists("Unit Category", {"property": self.name, "category_name": category_name}):
				category_doc = frappe.get_doc({
					"doctype": "Unit Category",
					"naming_series": "UC-.YYYY.-.#####",
					"property": self.name,
					"category_name": category_name,
					"unit_type": self.property_type if self.property_type in ["Villa", "Apartment"] else "Room",
					"base_rate_per_night": 5000 
				})
				category_doc.insert(ignore_permissions=True)
				
				# Create Default Unit
				frappe.get_doc({
					"doctype": "Unit",
					"naming_series": "UNT-.YYYY.-.#####",
					"property": self.name,
					"unit_category": category_doc.name,
					"unit_no": "01",
					"status": "Available"
				}).insert(ignore_permissions=True)
				
				frappe.msgprint(f"Automatically set up '{category_name}' and Unit 1 for {self.property_name}")

	def update_room_counts(self):
		# Count all units linked to this property
		unit_count = frappe.db.count("Unit", {"property": self.name})
		self.total_rooms = unit_count
		
		# For now, let's assume total_units is synonymous with unit_count
		if not self.total_units:
			self.total_units = unit_count
