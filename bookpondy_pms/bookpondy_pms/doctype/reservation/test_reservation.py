# Copyright (c) 2025, vasanth ranganathan and Contributors
# See license.txt

import frappe
from frappe.tests.utils import FrappeTestCase
from frappe.utils import add_days, today, getdate
from bookpondy_pms.bookpondy_pms.doctype.reservation.reservation import Reservation

class TestReservation(FrappeTestCase):
    def setUp(self):
        frappe.db.rollback()
        
        # Create Property
        self.property = frappe.get_doc({
            "doctype": "Property",
            "property_name": "Test Resort",
            "property_type": "Resort",
            "city": "Pondicherry"
        }).insert(ignore_permissions=True)
        
        # Create Unit Category
        self.category = frappe.get_doc({
            "doctype": "Unit Category",
            "category_name": "Deluxe Room",
            "property": self.property.name,
            "unit_type": "Room",
            "base_rate_per_night": 5000
        }).insert(ignore_permissions=True)

        # Create Unit
        self.unit = frappe.get_doc({
            "doctype": "Unit",
            "unit_no": "101",
            "property": self.property.name,
            "unit_category": self.category.name,
            "base_rate_per_night": 5000,
            "status": "Available"
        }).insert(ignore_permissions=True)

        # Create Guest
        self.guest = frappe.get_doc({
            "doctype": "Guest",
            "guest_name": "Test Guest",
            "email": "test@example.com",
            "phone": "9999999999"
        }).insert(ignore_permissions=True)

    def test_overlap_validation(self):
        check_in = add_days(today(), 1)
        check_out = add_days(today(), 5)
        
        # Create first reservation
        res1 = frappe.get_doc({
            "doctype": "Reservation",
            "guest": self.guest.name,
            "property": self.property.name,
            "allocated_unit": self.unit.name,
            "unit_category": self.category.name,
            "check_in_date": check_in,
            "check_out_date": check_out,
            "reservation_status": "Confirmed",
            "room_rate_per_night": 5000,
            "source": "Direct"
        }).insert(ignore_permissions=True)
        
        # Attempt conflicting reservation (Overlapping start)
        res2 = frappe.get_doc({
            "doctype": "Reservation",
            "guest": self.guest.name,
            "property": self.property.name,
            "allocated_unit": self.unit.name,
            "unit_category": self.category.name,
            "check_in_date": add_days(today(), 2),
            "check_out_date": add_days(today(), 6),
            "reservation_status": "Confirmed",
            "room_rate_per_night": 5000,
            "source": "Direct"
        })
        
        self.assertRaises(frappe.ValidationError, res2.insert)

    def test_get_availability_api(self):
        # Create a booking
        check_in = add_days(today(), 1)
        check_out = add_days(today(), 3)
        
        res1 = frappe.get_doc({
            "doctype": "Reservation",
            "guest": self.guest.name,
            "property": self.property.name,
            "allocated_unit": self.unit.name,
            "unit_category": self.category.name,
            "check_in_date": check_in,
            "check_out_date": check_out,
            "reservation_status": "Confirmed",
            "room_rate_per_night": 5000,
            "source": "Direct"
        }).insert(ignore_permissions=True)
        
        # Query Availability
        start = today()
        end = add_days(today(), 5)
        
        data = Reservation.get_availability(self.property.name, start, end)
        
        # Validate data structure and content
        self.assertTrue(len(data) > 0)
        
        # Day 0 (Today) should be Available
        day0 = next(d for d in data if d['date'] == str(getdate(start)))
        self.assertEqual(day0['status'], 'Available')
        
        # Day 1 (Check-in) should be Booked
        day1 = next(d for d in data if d['date'] == str(getdate(check_in)))
        self.assertEqual(day1['status'], 'Booked')
        self.assertEqual(day1['unit_id'], self.unit.name)

    def test_rate_plan_pricing(self):
        # Create Rate Plan (Base 2000)
        plan = frappe.get_doc({
            "doctype": "Rate Plan",
            "plan_name": "Integration Test Plan",
            "unit_category": self.category.name,
            "property": self.property.name,
            "base_rate": 2000
        }).insert(ignore_permissions=True)

        check_in = add_days(today(), 10)
        check_out = add_days(today(), 12) # 2 nights

        res = frappe.get_doc({
            "doctype": "Reservation",
            "guest": self.guest.name,
            "property": self.property.name,
            "allocated_unit": self.unit.name,
            "unit_category": self.category.name,
            "rate_plan": plan.name,
            "check_in_date": check_in,
            "check_out_date": check_out,
            "reservation_status": "Confirmed",
            "source": "Direct",
            "extras_and_services": 500,
            "discount_amount": 100
        })
        res.insert(ignore_permissions=True)
        
        # Expected:
        # 2 Nights @ 2000 = 4000
        # Extras: 500
        # Discount: 100
        # Total: 4400
        self.assertEqual(res.total_amount, 4400.0)
        self.assertEqual(res.subtotal_room_charges, 4000.0)

    def test_communication_trigger(self):
        # Create Confirmed Reservation
        res = frappe.get_doc({
            "doctype": "Reservation",
            "guest": self.guest.name,
            "property": self.property.name,
            "allocated_unit": self.unit.name,
            "unit_category": self.category.name,
            "check_in_date": add_days(today(), 20),
            "check_out_date": add_days(today(), 22),
            "reservation_status": "Confirmed",
            "source": "Direct",
            "room_rate_per_night": 5000
        }).insert(ignore_permissions=True)
        
        # Submit triggers communication
        res.submit()
        
        # Verify Guest Communication created
        comm = frappe.get_all("Guest Communication", filters={"guest": self.guest.name}, fields=["subject", "status"])
        self.assertTrue(len(comm) > 0)
        self.assertEqual(comm[0].status, "Sent") # Should be 'Sent' if email succeeds, or 'Pending'/'Failed' mock
        self.assertIn("Booking Confirmed", comm[0].subject)
