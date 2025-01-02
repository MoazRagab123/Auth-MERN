import express from "express"; // Import express framework
import cors from "cors"; // Import CORS middleware
import 'dotenv/config'; // Import dotenv for environment variables
import cookieParser from "cookie-parser"; // Import cookie-parser middleware
import connectDB from "./config/mongodb.js"; // Import database connection function
import authRouter from "./routes/authRoutes.js"; // Import auth routes
import userRouter from "./routes/userRoutes.js";

const app = express(); // Create an express application
const port = process.env.PORT || 4000; // Define the port from environment variables or default to 4000
connectDB(); // Connect to the database

const allowedOrigins = ['http://localhost:5173']; // Define the allowed origins

app.use(express.json()); // Middleware to parse JSON requests
app.use(cookieParser()); // Middleware to parse cookies
app.use(cors({origin: allowedOrigins, credentials:true})); // Middleware to enable CORS with credentials

// API Endpoints
app.get('/',(req,res)=>res.send("API working")); // Define a route to check if API is working
app.use('/api/auth',authRouter); // Define the auth routes
app.use('/api/user',userRouter); // Define the user routes

app.listen(port,()=>console.log(`Server started on PORT:${port}`)); // Start the server and listen on the defined port