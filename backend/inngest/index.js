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
            populate: { path: 'movie', model: 'Movie' }
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

// Inngest function to send remainders
const sendShowReminders = inngest.createFunction(
    {
        id: 'send-show-reminder-email',
        triggers: [{ cron: "0 * / 8 * * *" }],
    },
    async ({ step }) => {
        const now = new Date();
        const in8Hours = new Date(now.getTime() + 9 * 60 * 60 * 1000);
        const windowStart = new Date(in8Hours.getTime() - 10 * 60 * 1000);

        // Prepare reminder tasks
        const reminderTasks = await step.run("prepare-reminder-tasks", async () => {
            const shows = await Show.find({
                showTime: { $gte: windowStart, $lte: in8Hours },
            }).populate('movie')

            const tasks = []

            for (const show of shows) {
                if (!show.movie || !show.occupiedSeats) continue;

                const userIds = [...new Set(Object.values(show.occupiedSeats))]

                if (userIds.length === 0) continue;

                const users = await User.find({ _id: { $in: userIds } }).select("name email");

                for (const user of users) {
                    tasks.push({
                        userEmail: user.email,
                        userName: user.name,
                        movieTitle: show.movie.title,
                        showTime: show.showTime
                    })
                }
            }
            return tasks;
        })

        if (reminderTasks.length === 0) {
            return { sent: 0, message: "No reminders to send.." }
        }

        // Send reminder emails
        const results = await step.run('send-all-reminders', async () => {
            return await Promise.allSettled(
                reminderTasks.map(task => sendEmail({
                    to: task.userEmail,
                    subject: `Reminder: Your Movie "${task.movieTitle}" starts soon!`,
                    body: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px; border-radius: 10px;">
                
                <div style="background-color: #6c3baa; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0;">🎬 CineMine</h1>
                </div>

                <div style="background-color: #ffffff; padding: 30px; border-radius: 0 0 10px 10px;">
                    <h2 style="color: #333;">Hey ${task.userName}! 👋</h2>
                    <p style="color: #555; font-size: 16px;">
                        Just a reminder — your movie starts in <strong style="color: #6c3baa;">2 hours!</strong> Get ready for an amazing experience. 🍿
                    </p>

                    <div style="background-color: #f3eeff; border-left: 4px solid #6c3baa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <p style="margin: 8px 0; color: #333;"><strong>🎥 Movie:</strong> ${task.movieTitle}</p>
                        <p style="margin: 8px 0; color: #333;"><strong>📅 Show Time:</strong> ${task.showTime}</p>
                    </div>

                    <div style="background-color: #fff8e1; border: 1px solid #ffe082; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <p style="margin: 0; color: #f57f17; font-size: 14px;">
                            ⚠️ Please arrive at least <strong>15 minutes early</strong> to avoid missing the beginning of the show.
                        </p>
                    </div>

                    <p style="color: #555;">See you at the movies! 🎉</p>

                    <div style="text-align: center; margin-top: 30px;">
                        <p style="color: #aaa; font-size: 12px;">© 2026 CineMine. All rights reserved.</p>
                    </div>
                </div>

            </div>`
                }
                ))
            )
        })

        const sent = results.filter(r => r.status === "fulfilled").length;
        const failed = results.length - sent;

        return {
            sent,
            failed,
            message: `Sent ${sent} reminder(s), ${failed} failed..`
        }
    }
)

// Inngest function to send notifications when when a new show is added
const sendNewShowNotifications = inngest.createFunction(
    {
        id: 'send-new-show-notifications',
        triggers: [{ event: "app/show.added" }],
    },
    async ({ event }) => {
        const { movieTitle, movieId } = event.data;
        const users = await User.find({})

        for (const user of users) {
            const userEmail = user.email;
            const userName = user.name;

            const subject = `🎬 New Show Added : ${movieTitle}`;
            const body = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px; border-radius: 10px;">

                <div style="background-color: #6c3baa; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0;">🎬 CineMine</h1>
                    <p style="color: #e0c9ff; margin: 5px 0 0;">New Movie Just Dropped!</p>
                </div>

                <div style="background-color: #ffffff; padding: 30px; border-radius: 0 0 10px 10px;">
                    <h2 style="color: #333;">Hey ${userName}! 👋</h2>
                    <p style="color: #555; font-size: 16px;">
                        A brand new movie has just been added to CineMine. Be the first to grab your seats! 🍿
                    </p>

                    <div style="background-color: #f3eeff; border-left: 4px solid #6c3baa; padding: 20px; border-radius: 5px; margin: 20px 0; text-align: center;">
                        <h2 style="color: #6c3baa; margin: 0 0 10px;">🎥 ${movieTitle}</h2>
                        <p style="color: #888; font-size: 12px; margin: 0;">Movie ID: ${movieId}</p>
                    </div>

                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.FRONTEND_URL}/movies/${movieId}" 
                           style="background-color: #6c3baa; color: #ffffff; padding: 12px 30px; border-radius: 25px; text-decoration: none; font-size: 16px; font-weight: bold;">
                            🎟️ Book Now
                        </a>
                    </div>

                    <div style="background-color: #fff8e1; border: 1px solid #ffe082; padding: 15px; border-radius: 5px;">
                        <p style="margin: 0; color: #f57f17; font-size: 14px;">
                            🔥 Seats fill up fast — book early to get the best seats!
                        </p>
                    </div>

                    <div style="text-align: center; margin-top: 30px;">
                        <p style="color: #aaa; font-size: 12px;">© 2026 CineMine. All rights reserved.</p>
                    </div>
                </div>

            </div>`;

            await sendEmail({
                to: userEmail,
                subject,
                body,
            })
        }

        return {message: 'Notification sent..'}
    }
)

// Create an empty array where we'll export future Inngest functions
export const functions = [syncUserCreation, syncUserDeletion, syncUserUpdation, releaseSeatsAndDeleteBooking, sendBookingConfirmationEmail, sendShowReminders, sendNewShowNotifications];