import Stripe from 'stripe';
import Booking from '../models/Booking.js';

export const stripeWebhooks = async (req, res) => {
    const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
    const sig = req.headers["stripe-signature"];

    let event;

    try {
        // ✅ req.body must be raw Buffer — do NOT convert it
        event = stripeInstance.webhooks.constructEvent(
            req.body,  
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );

    } catch (error) {
        console.log("❌ constructEvent failed:", error.message);
        console.log("Body type:", typeof req.body, Buffer.isBuffer(req.body)); // debug log
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
                const { bookingId } = session.metadata;

                await Booking.findByIdAndUpdate(bookingId, {
                    isPaid: true,
                    paymentLink: "",
                }, { new: true });

                console.log("✅ Booking updated successfully");
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