import frappe

def populate():
    print("STARTING POPULATION...")
    
    # 1. Properties & Units
    properties = frappe.get_all('Property', fields=['name', 'property_name'])
    units = frappe.get_all('Unit', fields=['name', 'unit_no', 'property'])
    
    print(f"Found {len(properties)} Properties and {len(units)} Units.")
    
    # 2. PMS Items
    items = [
        {"item_code": "LINEN-Q", "item_name": "Queen Bed Linen Set", "category": "Consumable", "unit": "Set", "reorder_level": 5, "valuation_rate": 1500},
        {"item_code": "TOWEL-XL", "item_name": "Premium Bath Towel", "category": "Consumable", "unit": "Pcs", "reorder_level": 10, "valuation_rate": 450},
        {"item_code": "AC-SPLIT-1.5", "item_name": "1.5 Ton Split AC Unit", "category": "Asset", "unit": "Pcs", "reorder_level": 0, "valuation_rate": 35000},
        {"item_code": "TV-LED-43", "item_name": "43 inch LED Smart TV", "category": "Asset", "unit": "Pcs", "reorder_level": 0, "valuation_rate": 28000},
        {"item_code": "BULB-LED-9W", "item_name": "9W LED Bulb", "category": "Part", "unit": "Pcs", "reorder_level": 20, "valuation_rate": 120}
    ]
    
    for item_data in items:
        if not frappe.db.exists("PMS Item", item_data["item_code"]):
            doc = frappe.get_doc({"doctype": "PMS Item", **item_data})
            doc.insert()
            print(f"Created Item: {item_data['item_name']}")
    
    # 3. Stock Entries (Initial Stock)
    for item_data in items:
        if item_data["category"] != "Asset":
            se = frappe.get_doc({
                "doctype": "PMS Stock_Entry", # Wait, I named it "PMS Stock Entry"
                "doctype": "PMS Stock Entry",
                "item": item_data["item_code"],
                "entry_type": "Inward",
                "quantity": 50,
                "date": frappe.utils.nowdate(),
                "notes": "Initial inventory loading"
            })
            se.insert()
            se.submit()
            print(f"Added stock for: {item_data['item_name']}")

    # 4. PMS Assets (Link to Units)
    if units:
        # Asset Types we created
        asset_base_items = {
            "AC": "AC-SPLIT-1.5",
            "TV": "TV-LED-43"
        }
        
        for u in units:
            # Add an AC to each unit
            ac_name = f"AC - {u.unit_no}"
            if not frappe.db.exists("PMS Asset", {"asset_name": ac_name, "location": u.name}):
                frappe.get_doc({
                    "doctype": "PMS Asset",
                    "asset_name": ac_name,
                    "item_link": asset_base_items["AC"],
                    "location": u.name,
                    "serial_number": f"SN-AC-{u.name[-4:]}",
                    "status": "Operational",
                    "purchase_date": "2025-10-01"
                }).insert()
                print(f"Assigned AC to {u.unit_no}")
                
            # Add a TV to each unit
            tv_name = f"TV - {u.unit_no}"
            if not frappe.db.exists("PMS Asset", {"asset_name": tv_name, "location": u.name}):
                frappe.get_doc({
                    "doctype": "PMS Asset",
                    "asset_name": tv_name,
                    "item_link": asset_base_items["TV"],
                    "location": u.name,
                    "serial_number": f"SN-TV-{u.name[-4:]}",
                    "status": "Operational",
                    "purchase_date": "2025-10-01"
                }).insert()
                print(f"Assigned TV to {u.unit_no}")

    frappe.db.commit()
    print("POPULATION COMPLETE.")
