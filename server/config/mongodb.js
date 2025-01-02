import mongoose from "mongoose"; // Import mongoose

// Function to connect to the MongoDB database
const connectDB = async ()=>{
  mongoose.connection.on('connected',()=>console.log("Database Connected")); // Log message when connected
  
  await mongoose.connect(`${process.env.MONGODB_URL}/Auth-MERN`); // Connect to the database using the URL from environment variables
}

export default connectDB; // Export the connectDB function