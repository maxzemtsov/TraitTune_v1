# /home/ubuntu/traittune/backend/src/sharing_service.py

import uuid
import datetime
from typing import Optional, Dict, Any, Literal

# Simulated database (in-memory dictionaries for this example)
# In a real application, this would interact with Supabase/PostgreSQL
simulated_sharing_links_db: Dict[str, Dict[str, Any]] = {}
simulated_sharing_link_events_db: list[Dict[str, Any]] = []
simulated_user_bonuses_db: Dict[str, Dict[str, Any]] = {}
simulated_bonus_transactions_db: list[Dict[str, Any]] = []

class SharingService:
    def _generate_unique_token(self) -> str:
        """Generates a unique token for a sharing link."""
        return str(uuid.uuid4())

    def create_private_email_link(
        self,
        sharer_user_id: str,
        target_email: str,
        report_id: Optional[str] = None,
        custom_message: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Creates a private sharing link to be sent via email."""
        token = self._generate_unique_token()
        link_id = str(uuid.uuid4())
        now = datetime.datetime.now(datetime.timezone.utc)

        link_data = {
            "id": link_id,
            "sharer_user_id": sharer_user_id,
            "link_type": "private_email",
            "unique_token": token,
            "target_email": target_email,
            "report_id": report_id,
            "status": "generated", # Will be 'sent' after email dispatch
            "metadata": {"custom_message": custom_message} if custom_message else {},
            "created_at": now.isoformat(),
            "updated_at": now.isoformat(),
            "expires_at": None,
            "share_url": f"https://traittune.com/invite/{token}"
        }
        simulated_sharing_links_db[link_id] = link_data

        print(f"Simulating: Email sent to {target_email} with token {token} and message: 	'{custom_message or ''}	'")
        link_data["status"] = "sent"
        simulated_sharing_links_db[link_id]["status"] = "sent"
        simulated_sharing_links_db[link_id]["updated_at"] = datetime.datetime.now(datetime.timezone.utc).isoformat()
        self.log_link_event(link_id=link_id, event_type="email_sent")
        return link_data

    def create_private_onetime_link(
        self,
        sharer_user_id: str,
        report_id: Optional[str] = None,
        expires_in_hours: Optional[int] = None,
    ) -> Dict[str, Any]:
        """Creates a private one-time shareable link."""
        token = self._generate_unique_token()
        link_id = str(uuid.uuid4())
        now = datetime.datetime.now(datetime.timezone.utc)
        expires_at = None
        if expires_in_hours:
            expires_at = (now + datetime.timedelta(hours=expires_in_hours)).isoformat()

        link_data = {
            "id": link_id,
            "sharer_user_id": sharer_user_id,
            "link_type": "private_onetime",
            "unique_token": token,
            "target_email": None,
            "report_id": report_id,
            "status": "generated",
            "metadata": {},
            "created_at": now.isoformat(),
            "updated_at": now.isoformat(),
            "expires_at": expires_at,
            "share_url": f"https://traittune.com/invite/{token}"
        }
        simulated_sharing_links_db[link_id] = link_data
        self.log_link_event(link_id=link_id, event_type="onetime_link_generated")
        return link_data

    def create_public_link(
        self,
        sharer_user_id: str,
        campaign_tag: Optional[str] = None
    ) -> Dict[str, Any]:
        """Creates a public sharing link."""
        token = self._generate_unique_token()
        link_id = str(uuid.uuid4())
        now = datetime.datetime.now(datetime.timezone.utc)

        link_data = {
            "id": link_id,
            "sharer_user_id": sharer_user_id,
            "link_type": "public",
            "unique_token": token,
            "target_email": None,
            "report_id": None,
            "status": "active",
            "metadata": {"campaign_tag": campaign_tag} if campaign_tag else {},
            "created_at": now.isoformat(),
            "updated_at": now.isoformat(),
            "expires_at": None,
            "share_url": f"https://traittune.com/share/{token}"
        }
        simulated_sharing_links_db[link_id] = link_data
        self.log_link_event(link_id=link_id, event_type="public_link_generated")
        return link_data

    def create_qr_code_link(
        self,
        sharer_user_id: str,
        report_id: Optional[str] = None # QR might share a specific report or be a general invite
    ) -> Dict[str, Any]:
        """Creates a link intended for QR code sharing."""
        token = self._generate_unique_token()
        link_id = str(uuid.uuid4())
        now = datetime.datetime.now(datetime.timezone.utc)

        link_data = {
            "id": link_id,
            "sharer_user_id": sharer_user_id,
            "link_type": "qr",
            "unique_token": token,
            "target_email": None,
            "report_id": report_id,
            "status": "active",
            "metadata": {},
            "created_at": now.isoformat(),
            "updated_at": now.isoformat(),
            "expires_at": None, # QR links might not expire by default
            "qr_data_url": f"https://traittune.com/qr/{token}" # URL to be encoded in QR
        }
        simulated_sharing_links_db[link_id] = link_data
        self.log_link_event(link_id=link_id, event_type="qr_link_generated")
        return link_data

    def get_link_by_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Retrieves a link by its unique token."""
        for link_val in simulated_sharing_links_db.values(): # Iterate through values
            if link_val["unique_token"] == token:
                return link_val
        return None

    def get_link_by_id(self, link_id: str) -> Optional[Dict[str, Any]]:
        """Retrieves a link by its ID."""
        return simulated_sharing_links_db.get(link_id)

    def update_link_status(self, link_id: str, new_status: str) -> bool:
        """Updates the status of a sharing link."""
        if link_id in simulated_sharing_links_db:
            simulated_sharing_links_db[link_id]["status"] = new_status
            simulated_sharing_links_db[link_id]["updated_at"] = datetime.datetime.now(datetime.timezone.utc).isoformat()
            return True
        return False

    def log_link_event(
        self,
        link_id: str,
        event_type: Literal[
            "clicked", 
            "registered_via_link", 
            "test_started_via_link", 
            "test_completed_via_link", 
            "comparison_requested",
            "email_sent",
            "onetime_link_generated",
            "qr_link_generated",
            "public_link_generated",
            "qr_scanned_new_user",
            "qr_scanned_existing_user_comparison_init"
        ],
        recipient_user_id: Optional[str] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Logs a significant event related to a sharing link."""
        event_id = str(uuid.uuid4())
        now = datetime.datetime.now(datetime.timezone.utc)
        event_data = {
            "id": event_id,
            "link_id": link_id,
            "recipient_user_id": recipient_user_id,
            "event_type": event_type,
            "ip_address": ip_address,
            "user_agent": user_agent,
            "metadata": metadata or {},
            "created_at": now.isoformat()
        }
        simulated_sharing_link_events_db.append(event_data)
        
        link_info = self.get_link_by_id(link_id)
        if link_info and link_info["link_type"] == "public" and event_type == "test_completed_via_link":
            if recipient_user_id:
                 self.award_bonus(sharer_user_id=link_info["sharer_user_id"], tokens_amount=10, reason_code="public_referral_bonus", related_link_id=link_id)
        return event_data

    def get_events_for_link(self, link_id: str) -> list[Dict[str, Any]]:
        """Retrieves all events for a specific link."""
        return [event for event in simulated_sharing_link_events_db if event["link_id"] == link_id]

    def award_bonus(
        self,
        sharer_user_id: str,
        tokens_amount: int,
        reason_code: str,
        related_link_id: Optional[str] = None,
        description: Optional[str] = None
    ) -> Dict[str, Any]:
        """Awards bonus tokens to a user and logs the transaction."""
        now = datetime.datetime.now(datetime.timezone.utc)
        transaction_id = str(uuid.uuid4())

        if sharer_user_id not in simulated_user_bonuses_db:
            simulated_user_bonuses_db[sharer_user_id] = {"user_id": sharer_user_id, "token_balance": 0, "last_updated": now.isoformat()}
        
        simulated_user_bonuses_db[sharer_user_id]["token_balance"] += tokens_amount
        simulated_user_bonuses_db[sharer_user_id]["last_updated"] = now.isoformat()

        transaction_data = {
            "id": transaction_id,
            "user_id": sharer_user_id,
            "transaction_type": "credit",
            "tokens_amount": tokens_amount,
            "reason_code": reason_code,
            "description": description or f"{tokens_amount} tokens awarded for {reason_code}",
            "related_link_id": related_link_id,
            "created_at": now.isoformat()
        }
        simulated_bonus_transactions_db.append(transaction_data)
        print(f"Simulating: Awarded {tokens_amount} tokens to user {sharer_user_id} for {reason_code}. New balance: {simulated_user_bonuses_db[sharer_user_id]['token_balance']}")
        return transaction_data

    def get_user_bonus_balance(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Retrieves a user's bonus balance."""
        return simulated_user_bonuses_db.get(user_id)

    def get_user_bonus_transactions(self, user_id: str) -> list[Dict[str, Any]]:
        """Retrieves a user's bonus transaction history."""
        return [tx for tx in simulated_bonus_transactions_db if tx["user_id"] == user_id]

    def resolve_qr_scan(self, token: str, scanning_user_id: Optional[str] = None, ip_address: Optional[str] = None, user_agent: Optional[str] = None) -> Dict[str, Any]:
        """Simulates resolving a QR code scan."""
        link_info = self.get_link_by_token(token)
        if not link_info or link_info["link_type"] != "qr":
            return {"error": "Invalid or not a QR link token"}

        self.log_link_event(link_id=link_info["id"], event_type="clicked", recipient_user_id=scanning_user_id, ip_address=ip_address, user_agent=user_agent)
        
        # Simulate checking if scanning_user_id is an existing user
        is_existing_user = scanning_user_id is not None # Simplified check

        if is_existing_user:
            self.log_link_event(link_id=link_info["id"], event_type="qr_scanned_existing_user_comparison_init", recipient_user_id=scanning_user_id)
            return {
                "action": "initiate_comparison",
                "sharer_user_id": link_info["sharer_user_id"],
                "scanner_user_id": scanning_user_id,
                "message": "Existing user scanned. Initiate comparison flow."
            }
        else:
            self.log_link_event(link_id=link_info["id"], event_type="qr_scanned_new_user", recipient_user_id=None, ip_address=ip_address, user_agent=user_agent)
            return {
                "action": "redirect_to_onboarding",
                "onboarding_url": "https://traittune.com/onboarding?ref_type=qr&ref_token=" + token,
                "message": "New user scanned. Redirect to onboarding."
            }

# Example usage (for testing purposes)
if __name__ == "__main__":
    service = SharingService()
    sharer1_id = str(uuid.uuid4())
    sharer2_id = str(uuid.uuid4())
    recipient_id = str(uuid.uuid4()) 
    existing_user_scanner_id = str(uuid.uuid4())

    email_link = service.create_private_email_link(
        sharer_user_id=sharer1_id,
        target_email="invitee@example.com",
        custom_message="Check out my TraitTune report!"
    )
    print("\nCreated Email Link:", email_link)
    service.log_link_event(link_id=email_link["id"], event_type="clicked", ip_address="192.168.1.1")

    onetime_link = service.create_private_onetime_link(
        sharer_user_id=sharer1_id,
        expires_in_hours=24
    )
    print("\nCreated One-Time Link:", onetime_link)

    public_link = service.create_public_link(sharer_user_id=sharer2_id, campaign_tag="summer_drive")
    print("\nCreated Public Link:", public_link)
    
    service.log_link_event(link_id=public_link["id"], event_type="clicked", recipient_user_id=recipient_id, ip_address="203.0.113.45")
    service.log_link_event(link_id=public_link["id"], event_type="registered_via_link", recipient_user_id=recipient_id)
    service.log_link_event(link_id=public_link["id"], event_type="test_started_via_link", recipient_user_id=recipient_id)
    service.log_link_event(link_id=public_link["id"], event_type="test_completed_via_link", recipient_user_id=recipient_id)

    print("\nSharer 2 Bonus Balance:", service.get_user_bonus_balance(sharer2_id))
    print("Sharer 2 Bonus Transactions:", service.get_user_bonus_transactions(sharer2_id))

    # Test QR Code Link
    qr_link_data = service.create_qr_code_link(sharer_user_id=sharer1_id)
    print("\nCreated QR Link Data:", qr_link_data)
    qr_token = qr_link_data["unique_token"]

    # Simulate new user scanning QR
    qr_resolve_new = service.resolve_qr_scan(token=qr_token, ip_address="10.0.0.1", user_agent="Mobile Scanner App")
    print("\nQR Scan Resolution (New User):", qr_resolve_new)

    # Simulate existing user scanning QR
    qr_resolve_existing = service.resolve_qr_scan(token=qr_token, scanning_user_id=existing_user_scanner_id, ip_address="10.0.0.2", user_agent="TraitTune Mobile App")
    print("\nQR Scan Resolution (Existing User):", qr_resolve_existing)

    print("\nAll Links in DB:", simulated_sharing_links_db)
    print("\nAll Events in DB:", simulated_sharing_link_events_db)
    print("\nAll User Bonuses:", simulated_user_bonuses_db)
    print("\nAll Bonus Transactions:", simulated_bonus_transactions_db)

