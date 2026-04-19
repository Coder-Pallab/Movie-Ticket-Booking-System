import { Inngest } from "inngest";
import User from "../models/User.js";
import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import sendEmail from "../configs/nodeMailer.js";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "movie-ticket-booking" });

// inngest function to Save UserData to database
const syncUserCreation = inngest.createFunction(
    {
        id: 'sync-user-from-clerk',
        triggers: [{ event: "clerk/user.created" }],
    },
    async ({ event }) => {
        const { id, first_name, last_name, email_addresses, image_url } = event.data
        const userData = {
            _id: id,
            email: email_addresses[0].email_address,
            name: first_name + ' ' + last_name,
            image: image_url
        }
        await User.create(userData)
    }
)

// Inngest function to Delete User from database
const syncUserDeletion = inngest.createFunction(
    {
        id: 'delete-user-with-clerk',
        triggers: [{ event: "clerk/user.deleted" }],
    },
    async ({ event }) => {
        const { id } = event.data
        await User.findByIdAndDelete(id)
    }
)

// Inngest function to Update User from database
const syncUserUpdation = inngest.createFunction(
    {
        id: 'update-user-from-clerk',
        triggers: [{ event: "clerk/user.updated" }],
    },
    async ({ event }) => {
        const { id, first_name, last_name, email_addresses, image_url } = event.data
        const userData = {
            _id: id,
            email: email_addresses[0].email_address,
            name: first_name + ' ' + last_name,
            image: image_url
        }
        await User.findByIdAndUpdate(id, userData)
    }
)

// Inngest function to cancel booking and release seats of show after 10 minutes of booking created if payment is not made 
const releaseSeatsAndDeleteBooking = inngest.createFunction(
    {
        id: 'release-seats-delete-booking',
        triggers: [{ event: "app/checkpayment" }],
    },
    async ({ event, step }) => {
        const tenMinutesLater = new Date(Date.now() + 10 * 60 * 1000);
        await step.sleepUntil('wait-for-10-minutes', tenMinutesLater);

        await step.run('check-payment-status', async () => {
            const bookingId = event.data.bookingId;
            const booking = await Booking.findById(bookingId)

            // If payment is not made release seats and delete booking
            if (!booking.isPaid) {
                const show = await Show.findById(booking.show);
                booking.bookedSeats.forEach((seat) => {
                    delete show.occupiedSeats[seat]
                });
                show.markModified('occupiedSeats')
                await show.save();
                await Booking.findByIdAndDelete(booking._id)
            }
        })
    }
)

// Inngest function to send email when user books a show
const sendBookingConfirmationEmail = inngest.createFunction(
    {
        id: 'send-booking-confirmation-email',
        triggers: [{ event: "app/show.booked" }],
    },
    async ({ event, step }) => {
        const { bookingId } = event.data;

        const booking = await Booking.findById(bookingId).populate({
            path: 'show',
            populate: { path: 'movie', model: 'Movie'}
        }).populate('user');

        await sendEmail({
            to: booking.user.email,
            subject: `Payment Confirmation "${booking.show.movie.title}" booked!`,
            body: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px; border-radius: 10px;">
                
                <div style="background-color: #6c3baa; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0;">🎬 CineMine</h1>
                </div>

                <div style="background-color: #ffffff; padding: 30px; border-radius: 0 0 10px 10px;">
                    <h2 style="color: #333;">Hi ${booking.user.name},</h2>
                    <p style="color: #555;">Your booking is confirmed! Here are your details:</p>

                    <div style="background-color: #f3eeff; border-left: 4px solid #6c3baa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <p style="margin: 5px 0;"><strong>🎥 Movie:</strong> ${booking.show.movie.title}</p>
                        <p style="margin: 5px 0;"><strong>📅 Show Time:</strong> ${booking.show.showDateTime}</p>
                        <p style="margin: 5px 0;"><strong>💺 Seats:</strong> ${booking.bookedSeats.join(', ')}</p>
                        <p style="margin: 5px 0;"><strong>💰 Amount Paid:</strong> ₹${booking.amount}</p>
                        <p style="margin: 5px 0;"><strong>🔖 Booking ID:</strong> ${bookingId}</p>
                    </div>

                    <p style="color: #555;">Please arrive 15 minutes before the show. Enjoy the movie! 🍿</p>

                    <div style="text-align: center; margin-top: 30px;">
                        <p style="color: #aaa; font-size: 12px;">© 2026 CineMine. All rights reserved.</p>
                    </div>
                </div>

            </div>`
        })
    }
)

// Create an empty array where we'll export future Inngest functions
export const functions = [syncUserCreation, syncUserDeletion, syncUserUpdation, releaseSeatsAndDeleteBooking, sendBookingConfirmationEmail];