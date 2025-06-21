import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import cors from 'cors'


dotenv.config();

const app = express();

const allowedOrigins = [
  'http://localhost:3000',
  'https://cloudeforte.onrender.com'
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200 
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);

mongoose.connect(process.env.Mongo)
    .then(() => {
        console.log('conected');
    }).catch((err) => {
    console.log(err)
    })

app.use(errorHandler);

app.listen(4000, () => {
    console.log("Server is running on port 4000");
})
