import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';


dotenv.config();

const app = express();
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

app.listen(3000, () => {
    console.log("Server is  running on port 3000");
})
