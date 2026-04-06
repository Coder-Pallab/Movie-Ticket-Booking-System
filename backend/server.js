// Package imports
import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './configs/db.js';
import dns from 'dns';

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

// API Routes
app.get('/', (req, res) => res.send("Server is up and running!"));

// Running the server
app.listen(port, () => console.log(`Server is up and running on port http://localhost:${port}`));