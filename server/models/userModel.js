import mongoose from "mongoose"; // Import mongoose

// Define the user schema with various fields and their types
const userSchema = new mongoose.Schema({
    name:{type:String, required:true}, // User's name, required
    email:{type:String, required:true,unique:true}, // User's email, required and unique
    password:{type:String, required:true}, // User's password, required
    verifyOtp:{type:String, default: ''}, // OTP for account verification
    verifyOtpExpireAt:{type:Number, default: 0}, // Expiry time for verification OTP
    isAccountVerified:{type:Boolean, default: false}, // Flag to check if account is verified
    resetOtp:{type:String, default: ''}, // OTP for password reset
    resetOtpExpireAt:{type:Number, default: 0}, // Expiry time for reset OTP
});

// Create the user model if it doesn't already exist
const userModel =mongoose.models.user||  mongoose.model('User',userSchema);

export default userModel; // Export the user model