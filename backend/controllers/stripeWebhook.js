import stripe from 'stripe';
import Booking from '../models/Booking.js';

export const stripeWebhooks = async (req, res) => {
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
    const sig = req.headers["stripe-signature"];

    let event;

    try {
        // ✅ Vercel fix — body may not be a raw Buffer
        const rawBody = req.body instanceof Buffer
            ? req.body
            : Buffer.from(JSON.stringify(req.body));

        event = stripeInstance.webhooks.constructEvent(
            rawBody,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );

    } catch (error) {
        console.log("❌ constructEvent failed:", error.message);
        return res.status(400).send(`Webhook Error: ${error.message}`);
    }

    try {
        switch (event.type) {
            case "payment_intent.succeeded": {
                const paymentIntent = event.data.object;

                const sessionList = await stripeInstance.checkout.sessions.list({
                    payment_intent: paymentIntent.id
                });

                const session = sessionList.data[0];

                if (!session) {
                    console.log("❌ No session found for payment intent:", paymentIntent.id);
                    return res.status(400).send("No session found");
                }

                const { bookingId } = session.metadata;

                if (!bookingId) {
                    console.log("❌ No bookingId in session metadata");
                    return res.status(400).send("No bookingId in metadata");
                }

                const updated = await Booking.findByIdAndUpdate(bookingId, {
                    isPaid: true,
                    paymentLink: "",
                }, { new: true });

                console.log("✅ Booking updated:", updated);
                break;
            }

            default:
                console.log('Unhandled event type:', event.type);
        }

        return res.json({ received: true });

    } catch (err) {
        console.log("❌ Webhook processing error:", err);
        return res.status(500).send("Internal Server Error");
    }
}