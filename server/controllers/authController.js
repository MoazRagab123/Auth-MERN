import bcrypt from 'bcryptjs'; // Import bcrypt for hashing passwords
import jwt from 'jsonwebtoken'; // Import jsonwebtoken for creating and verifying tokens
import userModel from '../models/userModel.js'; // Import user model
import transporter from '../config/nodemailer.js';
import { EMAIL_VERIFY_TEMPLATE,PASSWORD_RESET_TEMPLATE } from '../config/emailTemplates.js';
// Register function to handle user registration
export const register = async(req,res)=>{
    const {name,email,password} = req.body; // Extract name, email, and password from request body

    if(!name || !email || !password) // Check if any details are missing
    {
        return res.json({success:false, message:'Missing Details'}); // Return error if details are missing
    }

    try {
        const existingUser =await userModel.findOne({email}); // Check if user already exists

        if(existingUser){
            return res.json({success:false,message:"User already exists"}); // Return error if user exists
        }

        const hashedPassword = await bcrypt.hash(password,10); // Hash the password

        const user = new userModel({name, email, password: hashedPassword}); // Create a new user with hashed password
        
        user.save(); // Save the user to the database
        
        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET,{expiresIn:'7d'}); // Create a JWT token

        res.cookie('token',token,{
            httpOnly:true, // Set cookie to HTTP only
            secure: process.env.NODE_ENV === 'production', // Set secure flag if in production
            sameSite: process.env.NODE_ENV ==='production' ? 'none' : 'strict', // Set sameSite attribute based on environment
            maxAge:7 * 24 * 60 * 60 * 1000 // Set cookie expiry to 7 days
        });
        
        // Send account verification email
        const mailOptions = {
            from:process.env.SENDER_EMAIL,
            to:email,
            subject:'Account Verification',
            text:`Welcome to Moaz Website. Your account has been created
            with email id:${email}`
        }

        await transporter.sendMail(mailOptions); // Send the email

        return res.json({success:true,message:'You signed up Successfully'});

    } catch (error) {
        return  res.json({success:false,message:error.message}) // Return error message if any exception occurs
    }
}

export const login = async(req,res)=>{
    const {email,password} = req.body; // Extract email and password from request body
     
    if(!email || !password){
        return res.json({success:false,message:'Email and password are required'})
    }
    try{
       const user = await userModel.findOne({email}); // Find user by email
       
       if(!user){
         return res.json ({success:false,message:'Invalid email'})
       }

      const isMatch = await bcrypt.compare(password,user.password);

      if(!isMatch){
            return res.json({success:false,message:'Invalid password'})
      }

      const token = jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:'7d'});
      res.cookie('token',token,{
        httpOnly:true, // Set cookie to HTTP only
        secure: process.env.NODE_ENV === 'production', // Set secure flag if in production
        sameSite: process.env.NODE_ENV ==='production' ? 'none' : 'strict', // Set sameSite attribute based on environment
        maxAge:7 * 24 * 60 * 60 * 1000 // Set cookie expiry to 7 days
    });
    
    return res.json({success:true,message:'Login Successful'});

    }catch(error){
        return res.json({success:false,message:error.message})
    }
}

export const logout = async(req,res)=>{
    try{
         res.clearCookie('token',{
            httpOnly:true, // Set cookie to HTTP only
            secure: process.env.NODE_ENV === 'production', // Set secure flag if in production
            sameSite: process.env.NODE_ENV ==='production' ? 'none' : 'strict', // Set sameSite attribute based on environment
         }); // Clear the token cookie 

            return res.json({success:true,message:'Logged out Successfully'});
    }
    catch(error){
        res.json({success:false,message:error.message})
    }
}
 // Function to send OTP to email for account verification
 export const sendVerifiedOtp = async(req, res) => {
    try {
        const { userId } = req.body; // Extract userId from request body

        const user = await userModel.findById(userId); // Find user by userId

        if (!user) {
            return res.json({ success: false, message: 'User not found' }); // Return error if user is not found
        }

        if (user.isAccountVerified) {
            return res.json({ success: false, message: 'Account already verified' }); // Return error if account is already verified
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000)); // Generate a 6 digit OTP

        user.verifyOtp = otp; // Set the OTP in user document
        user.verifyOtpExpireAt = Date.now() + 24* 60 * 60 * 1000; // Set the OTP expiry to 24 hours
        await user.save(); // Save the user document

        // Debugging statement to check the email value
        console.log('Email to send OTP:', user.email);

        if (!user.email) {
            return res.json({ success: false, message: 'User email is not defined' }); // Return error if email is not defined
        }

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email, // Ensure the email is correctly set
            subject: 'Account Verification OTP',
            //text: `Your account verification OTP is ${otp}`,
            html: EMAIL_VERIFY_TEMPLATE.replace("{{otp}}",otp).replace("{{email}}",user.email)
        };

        await transporter.sendMail(mailOptions); // Send the email

        return  res.json({ success: true, message: 'OTP sent successfully' }); // Return success message

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

//verify email using otp
export const verifyEmail = async (req,res)=>{
   
        const {userId,otp} = req.body; // Extract userId and OTP from request body
        
        if(!userId || !otp){
            return res.json({success:false,message:'Missing Details'}); // Return error if details are missing
        }
        try{
             const user = await userModel.findById(userId); // Find user by userId
                
                if(!user){
                    res.json({success:false,message:'User not found'}); // Return error if user is not found
                }
               
                if(user.verifyOtp===''||user.verifyOtp !== otp){
                    return res.json({success:false,message:'Invalid OTP'}); // Return error if OTP is invalid
                }
                if(user.verifyOtpExpireAt < Date.now()){
                    return res.json({success:false,message:'OTP Expired'}); // Return error if OTP is expired
                }
                user.isAccountVerified = true; // Set account as verified
                user.verifyOtp = ''; // Clear the OTP
                user.verifyOtpExpireAt = 0; // Reset the OTP expiry
                await user.save(); // Save the user document
                const mailOptions = {
                    from: process.env.SENDER_EMAIL,
                    to: user.email, // Ensure the email is correctly set
                    subject: 'Account Verification Successful',
                    text: `Your account has been verified successfully`
                };
                await transporter.sendMail(mailOptions); // Send the email

                return  res.json({success:true,message:'Email verified successfully'}); // Return success message

        }catch(error){
            return  res.json({success:false,message:error.message})
        }
        

}

//check if user is authenticated
export const isAuhtenticated = async(req,res)=>{
 try{
    return res.json({success:true,message:'User is authenticated'})
 }catch(error)
 {
    return res.json({success:false,message:error.message})
 }
}

//Send password reset OTP
export const sendResetOtp = async(req,res)=>{
    const {email} = req.body; // Extract email from request body

    if(!email){
        return res.json({success:false,message:'Email is required'}); // Return error if email is missing
    }
    try{
        const user = await userModel.findOne({email}); // Find user by email
        if(!user){
            return res.json({success:false,message:'User not found'}); // Return error if user is not found
        }
        const otp = String(Math.floor(100000 + Math.random() * 900000)); // Generate a 6 digit OTP

        user.resetOtp = otp; // Set the OTP in user document
        user.resetOtpExpireAt = Date.now() +  60 * 60 * 1000; // Set the OTP expiry to 24 hours
        await user.save(); // Save the user document

        // Debugging statement to check the email value
        console.log('Email to send OTP:', user.email);

        if (!user.email) {
            return res.json({ success: false, message: 'User email is not defined' }); // Return error if email is not defined
        }

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email, // Ensure the email is correctly set
            subject: 'Password Reset OTP',
            //text: `Your password reset OTP is ${otp}`,
            html: PASSWORD_RESET_TEMPLATE.replace("{{otp}}",otp).replace("{{email}}",user.email)
        };

        await transporter.sendMail(mailOptions); // Send the email

       return res.json({ success: true, message: 'OTP sent successfully' }); // Return success message

    }catch(error){
        return  res.json({success:false,message:error.message})
    }
}

//Reset password using OTP
export const resetPassword = async(req,res)=>{
    const {email,otp,password} = req.body; // Extract email, OTP, and password from request body

    if (!email || !otp || !password) {
        // Log missing details to the console
        console.error('Missing details:', {
            email: email ? 'Provided' : 'Missing',
            otp: otp ? 'Provided' : 'Missing',
            password: password ? 'Provided' : 'Missing'
        });
    
        // Return error response
        return res.json({ success: false, message: 'Missing Details' });
    }
    try{
        const user = await userModel.findOne({email}); // Find user by email
        if(!user){
            return res.json({success:false,message:'User not found'}); // Return error if user is not found
        }
        if(user.resetOtp===''||user.resetOtp !== otp){
            return res.json({success:false,message:'Invalid OTP'}); // Return error if OTP is invalid
        }
        if(user.resetOtpExpireAt < Date.now()){
            return res.json({success:false,message:'OTP Expired'}); // Return error if OTP is expired
        }
        const hashedPassword = await bcrypt.hash(password,10); // Hash the new password
        user.password = hashedPassword; // Set the new password in user document
        user.resetOtp = ''; // Clear the OTP
        user.resetOtpExpireAt = 0; // Reset the OTP expiry
        await user.save(); // Save the user document

        return  res.json({success:true,message:'Password reset successfully'}); // Return success message

    }catch(error){
        return  res.json({success:false,message:error.message})
    }
}
export default {register,login,logout,sendVerifiedOtp,verifyEmail}; // Export the register and login functions
