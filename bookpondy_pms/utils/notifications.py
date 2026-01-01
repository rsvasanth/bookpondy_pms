import frappe
from twilio.rest import Client

class TwilioHandler:
    """
    Handles WhatsApp and SMS communications via Twilio.
    """
    def __init__(self):
        # We'll assume Twilio settings are in Site Config or a dedicated DocType
        self.account_sid = frappe.conf.get('twilio_account_sid')
        self.auth_token = frappe.conf.get('twilio_auth_token')
        self.whatsapp_from = frappe.conf.get('twilio_whatsapp_from', 'whatsapp:+14155552671')
        self.client = Client(self.account_sid, self.auth_token) if self.account_sid and self.auth_token else None

    def send_whatsapp(self, to_number, message):
        """Send a WhatsApp message."""
        if not self.client:
            frappe.log_error("Twilio not configured", "Notification Error")
            return None
            
        # Ensure number format for WhatsApp
        if not to_number.startswith('whatsapp:'):
            to_number = f'whatsapp:{to_number}'
            
        try:
            msg = self.client.messages.create(
                from_=self.whatsapp_from,
                body=message,
                to=to_number
            )
            return msg.sid
        except Exception as e:
            frappe.log_error(f"WhatsApp Send Failed: {str(e)}", "Notification Error")
            return None

class FirebaseHandler:
    """
    Handles Push Notifications via Firebase Cloud Messaging.
    """
    def __init__(self):
        # Implementation would typically use firebase-admin SDK
        # requires a service account JSON file
        pass

    def send_push(self, token, title, body, data=None):
        """Send a push notification to a device token."""
        # Simplified placeholder for push notification logic
        frappe.log_error(f"Push logic triggered for {token}: {title}", "Push Notification")
        return True
