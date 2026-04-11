// Package imports
import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './configs/db.js';
import dns from 'dns';
import { clerkMiddleware } from '@clerk/express'
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js"
import showRouter from './routes/showRoutes.js';
import bookingRouter from './routes/bookingRoutes.js';
import adminRouter from './routes/adminRoutes.js';
import userRouter from './routes/userRoutes.js';

// Setting the DNS server
dns.setServers(['1.1.1.1', '8.8.8.8'])

// Creating App using express
const app = express();
const port = 3000;

// Connecting MongoDB
await connectDB();

// Defining Middlewares
app.use(express.json());
app.use(cors());
app.use(clerkMiddleware())

// API Routes
app.get('/', (req, res) => res.send("Server is up and running!"));
app.use('/api/inngest', serve({ client: inngest, functions }));
app.use('/api/show', showRouter);
app.use('/api/booking', bookingRouter);
app.use('/api/admin', adminRouter);
app.use('/api/user', userRouter);

// Running the server
app.listen(port, () => console.log(`Server is up and running on port http://localhost:${port}`));