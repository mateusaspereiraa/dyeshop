# Admin Notifications (Slack & SMS)

This document explains how to configure Slack and Twilio notifications for admin alerts when a new order is created.

## Slack
- Create an Incoming Webhook in your Slack workspace and copy the webhook URL.
- Set `SLACK_WEBHOOK_URL` in your `.env` to the webhook URL.
- When an order is created via Stripe webhook, the server will POST a simple text message to the webhook.

## Twilio (SMS)
- Create a Twilio account and get your `TWILIO_SID` and `TWILIO_AUTH_TOKEN`.
- Buy a phone number (the `FROM`) in Twilio and set `TWILIO_FROM` in `.env`.
- Set `ADMIN_PHONE` to the target phone number to receive SMS alerts.
- If any Twilio config is missing, SMS will be skipped.

## Testing
- Use `stripe trigger checkout.session.completed` with `stripe listen` forwarding to your local server to test order creation and notifications.
- Check server logs to confirm Slack or SMS sending; errors will be logged if misconfigured.

## Notes
- Slack messages are simple text by default; you can extend to include attachments/blocks.
- Twilio is optional; we lazy-load the Twilio client to avoid adding runtime dependency when not used.
