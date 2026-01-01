import frappe
import requests
import hmac
import hashlib
import json
from frappe.utils import now, today, getdate, add_days

class MarketplaceSync:
    """
    Bidirectional sync with BookPondy.com marketplace.
    """
    
    def __init__(self):
        # In a real scenario, these would be in Site Config or a Settings DocType
        # For this implementation, we'll assume they are stored in 'Marketplace Settings'
        settings = frappe.get_single('Marketplace Settings') if frappe.db.exists('DocType', 'Marketplace Settings') else None
        
        self.api_base = settings.api_url if settings else 'https://api.bookpondy.com'
        self.api_key = settings.api_key if settings else frappe.conf.get('bookpondy_api_key')
        self.api_secret = settings.get_password('api_secret') if settings else frappe.conf.get('bookpondy_api_secret')
        self.is_enabled = settings.is_enabled if settings else False

    def get_auth_headers(self):
        """Generate authorization headers with HMAC signature."""
        if not self.api_key or not self.api_secret:
            return {}
            
        timestamp = str(int(frappe.utils.now_datetime().timestamp()))
        message = f"{self.api_key}{timestamp}"
        signature = hmac.new(
            self.api_secret.encode(),
            message.encode(),
            hashlib.sha256
        ).hexdigest()
        
        return {
            'Authorization': f'Bearer {self.api_key}:{signature}',
            'X-Timestamp': timestamp,
            'Content-Type': 'application/json',
        }

    def sync_property(self, property_name):
        """Push property info to marketplace."""
        if not self.is_enabled: return
        
        doc = frappe.get_doc('Property', property_name)
        if not doc.marketplace_sync:
            return

        payload = {
            'marketplace_id': doc.marketplace_id,
            'name': doc.property_name,
            'description': doc.description,
            'address': doc.address,
            'total_units': doc.total_units,
            'amenities': [a.amenity for a in doc.amenities] if hasattr(doc, 'amenities') else [],
            'images': [frappe.utils.get_url(img.image) for img in doc.images] if hasattr(doc, 'images') else [],
            'rules': doc.house_rules if hasattr(doc, 'house_rules') else "",
        }
        
        try:
            response = requests.post(
                f"{self.api_base}/v1/properties/sync",
                json=payload,
                headers=self.get_auth_headers(),
                timeout=10
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            frappe.log_error(f"Marketplace Property Sync Failed: {str(e)}", "Marketplace Integration")
            return None

    def sync_availability(self, property_name, days=90):
        """Push availability calendar to marketplace."""
        if not self.is_enabled: return
        
        start_date = getdate(today())
        end_date = add_days(start_date, days)

        # Get real availability data from Reservation logic
        from bookpondy_pms.bookpondy_pms.doctype.reservation.reservation import Reservation
        
        try:
            availability_data = Reservation.get_availability(property_name, start_date, end_date)
        except Exception as e:
            frappe.log_error(f"Failed to fetch availability for sync: {str(e)}", "Marketplace Integration")
            return

        payload = {
            'property_id': property_name,
            'availability': availability_data,
            'sync_timestamp': now()
        }

        try:
            response = requests.post(
                f"{self.api_base}/v1/availability/sync",
                json=payload,
                headers=self.get_auth_headers(),
                timeout=20
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            frappe.log_error(f"Marketplace Availability Sync Failed: {str(e)}", "Marketplace Integration")
            return None

    def create_booking_from_marketplace(self, data):
        """Create a Reservation in PMS from marketplace booking data."""
        try:
            # 1. Map Guest
            guest_email = data.get('guest_email')
            guest_name = data.get('guest_name')
            
            guest = frappe.db.get_value('Guest', {'email': guest_email}, 'name')
            if not guest:
                guest_doc = frappe.get_doc({
                    'doctype': 'Guest',
                    'first_name': guest_name.split()[0],
                    'last_name': " ".join(guest_name.split()[1:]) if len(guest_name.split()) > 1 else "",
                    'email': guest_email,
                    'mobile_number': data.get('guest_phone')
                })
                guest_doc.insert(ignore_permissions=True)
                guest = guest_doc.name

            # 2. Create Reservation
            res = frappe.get_doc({
                'doctype': 'Reservation',
                'guest': guest,
                'property': data.get('property_id'),
                'unit': data.get('unit_id'),
                'check_in': data.get('check_in'),
                'check_out': data.get('check_out'),
                'reservation_status': 'Confirmed',
                'source': 'Marketplace',
                'marketplace_booking_id': data.get('booking_id'),
                'total_amount': data.get('total_amount')
            })
            res.insert(ignore_permissions=True)
            res.submit()
            
            return res.name
        except Exception as e:
            frappe.log_error(f"Failed to create Marketplace booking: {str(e)}", "Marketplace Integration")
            return None

def sync_property_to_marketplace(property_name):
    """Enqueued function for property sync."""
    MarketplaceSync().sync_property(property_name)

def sync_availability_to_marketplace(property_name):
    """Enqueued function for availability sync."""
    MarketplaceSync().sync_availability(property_name)
