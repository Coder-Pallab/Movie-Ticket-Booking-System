import Stripe from 'stripe';
import Booking from '../models/Booking.js';
import Show from '../models/Show.js';
import { inngest } from '../inngest/index.js';

export const stripeWebhooks = async (req, res) => {
    const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
    const sig = req.headers["stripe-signature"];

    let event;

    try {
        event = stripeInstance.webhooks.constructEvent(
            req.body,
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
                if (!session) break;

                const { bookingId } = session.metadata;
                if (!bookingId) break;

                // ✅ Mark booking as paid
                const booking = await Booking.findByIdAndUpdate(
                    bookingId,
                    { isPaid: true, paymentLink: "" },
                    { new: true }
                );

                // ✅ Lock seats only after payment confirmed
                const showData = await Show.findById(booking.show);
                booking.bookedSeats.forEach((seat) => {
                    showData.occupiedSeats[seat] = booking.user;
                });
                showData.markModified('occupiedSeats');
                await showData.save();

                console.log("✅ Payment confirmed, seats locked, booking updated");

                // Send confirmation email
                await inngest.send({
                    name: "app/show.booked",
                    data: {bookingId}
                })
                break;
            }

            // ✅ Handle expired checkout sessions
            case "checkout.session.expired": {
                const session = event.data.object;
                const { bookingId } = session.metadata;

                if (bookingId) {
                    await Booking.findByIdAndDelete(bookingId);
                    console.log("🗑️ Booking deleted — session expired");
                }
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