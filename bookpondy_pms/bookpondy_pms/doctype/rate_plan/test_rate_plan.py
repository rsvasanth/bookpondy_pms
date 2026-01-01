# Copyright (c) 2025, vasanth ranganathan and Contributors
# See license.txt

import frappe
from frappe.tests.utils import FrappeTestCase
from frappe.utils import add_days, today, getdate

class TestRatePlan(FrappeTestCase):
    def setUp(self):
        frappe.db.rollback()
        
        # Create Property
        self.property = frappe.get_doc({
            "doctype": "Property",
            "property_name": "Rate Test Property",
            "property_type": "Hotel",
            "city": "Pondicherry"
        }).insert(ignore_permissions=True)
        
        # Create Unit Category
        self.category = frappe.get_doc({
            "doctype": "Unit Category",
            "category_name": "Standard Room",
            "property": self.property.name,
            "unit_type": "Room",
            "base_rate_per_night": 2000
        }).insert(ignore_permissions=True)

        # Create Rate Plan
        self.rate_plan = frappe.get_doc({
            "doctype": "Rate Plan",
            "plan_name": "Standard Plan",
            "unit_category": self.category.name,
            "property": self.property.name,
            "base_rate": 2000
        }).insert(ignore_permissions=True)

    def test_basic_calculation(self):
        check_in = today()
        check_out = add_days(today(), 2) # 2 nights
        
        price_data = self.rate_plan.calculate_total_price(check_in, check_out)
        self.assertEqual(price_data['total_amount'], 4000.0)

    def test_seasonal_rate(self):
        # Create Seasonal Rate for tomorrow
        check_in = add_days(today(), 1)
        check_out = add_days(today(), 3) # 2 nights: Tomorrow (Season), Day After (Season)
        
        season_start = add_days(today(), 1)
        season_end = add_days(today(), 5)
        
        frappe.get_doc({
            "doctype": "Seasonal Rate",
            "rate_plan": self.rate_plan.name,
            "season_name": "High Season",
            "from_date": season_start,
            "to_date": season_end,
            "rate_override": 3000
        }).insert(ignore_permissions=True)
        
        price_data = self.rate_plan.calculate_total_price(check_in, check_out)
        # Both nights fall in season -> 3000 * 2 = 6000
        self.assertEqual(price_data['total_amount'], 6000.0)

    def test_mixed_rate(self):
        # 1 Night Base (Today), 1 Night Season (Tomorrow)
        check_in = today()
        check_out = add_days(today(), 2)
        
        season_start = add_days(today(), 1)
        season_end = add_days(today(), 5)
        
        frappe.get_doc({
            "doctype": "Seasonal Rate",
            "rate_plan": self.rate_plan.name,
            "season_name": "High Season",
            "from_date": season_start,
            "to_date": season_end,
            "rate_override": 3000
        }).insert(ignore_permissions=True)
        
        price_data = self.rate_plan.calculate_total_price(check_in, check_out)
        # Night 1 (Today): Base 2000
        # Night 2 (Tomorrow): Season 3000
        # Total: 5000
        self.assertEqual(price_data['total_amount'], 5000.0)

    def test_modifiers(self):
        # Add 10% Service Charge
        self.rate_plan.append("modifiers", {
            "name1": "Service Charge",
            "type": "Surcharge",
            "value_type": "Percentage",
            "amount": 10
        })
        self.rate_plan.save()
        
        check_in = today()
        check_out = add_days(today(), 1) # 1 night @ 2000
        
        price_data = self.rate_plan.calculate_total_price(check_in, check_out)
        # Base: 2000
        # Modifier: 10% of 2000 = 200
        # Total: 2200
        self.assertEqual(price_data['total_amount'], 2200.0)
