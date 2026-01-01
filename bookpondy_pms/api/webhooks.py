import frappe
import json
import hmac
import hashlib
from bookpondy_pms.integrations.marketplace_sync import MarketplaceSync

@frappe.whitelist(allow_guest=True)
def marketplace_webhook():
    """
    Receive and process webhooks from BookPondy.com.
    """
    if frappe.request.method != "POST":
        frappe.throw("Only POST requests are allowed", frappe.PermissionError)

    # 1. Verify Signature
    signature = frappe.get_request_header("X-BookPondy-Signature")
    if not signature:
        frappe.throw("Missing signature", frappe.PermissionError)

    # In a real scenario, use settings.api_secret
    settings = frappe.get_single('Marketplace Settings') if frappe.db.exists('DocType', 'Marketplace Settings') else None
    api_secret = settings.get_password('api_secret') if settings else frappe.conf.get('bookpondy_api_secret')
    
    if not api_secret:
        frappe.throw("Marketplace secret not configured", frappe.PermissionError)

    data = frappe.request.get_data()
    expected_signature = hmac.new(
        api_secret.encode(),
        data,
        hashlib.sha256
    ).hexdigest()

    if not hmac.compare_digest(signature, expected_signature):
        frappe.throw("Invalid signature", frappe.PermissionError)

    # 2. Process Event
    try:
        payload = json.loads(data)
        event_type = payload.get("event")
        event_data = payload.get("data")

        if event_type == "booking.created":
            booking_id = MarketplaceSync().create_booking_from_marketplace(event_data)
            return {"status": "success", "booking_id": booking_id}

        elif event_type == "booking.cancelled":
            marketplace_booking_id = event_data.get("booking_id")
            reservation = frappe.db.get_value("Reservation", {"marketplace_booking_id": marketplace_booking_id}, "name")
            if reservation:
                res_doc = frappe.get_doc("Reservation", reservation)
                res_doc.reservation_status = "Cancelled"
                res_doc.save(ignore_permissions=True)
                return {"status": "success", "message": "Reservation cancelled"}
            return {"status": "error", "message": "Reservation not found"}

        elif event_type == "review.created":
            # Store review if Review DocType exists
            if frappe.db.exists("DocType", "Review"):
                review = frappe.get_doc({
                    "doctype": "Review",
                    "marketplace_review_id": event_data.get("review_id"),
                    "rating": event_data.get("rating"),
                    "comment": event_data.get("comment"),
                    "guest": event_data.get("guest_name"),
                    "property": event_data.get("property_id")
                })
                review.insert(ignore_permissions=True)
                return {"status": "success"}

        return {"status": "ignored", "message": f"Event type {event_type} not handled"}

    except Exception as e:
        frappe.log_error(f"Marketplace Webhook Error: {str(e)}", "Marketplace Integration")
        return {"status": "error", "message": str(e)}
