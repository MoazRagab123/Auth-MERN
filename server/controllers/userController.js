import userModel from "../models/userModel.js";

export const getUserData = async(req,res)=>{
    try{ 
         const {userId} = req.body; // Extract userId from request body
          
         const user = await userModel.findById(userId); // Find user by userId

         if(!user){
            return res.json({success:false,message:'User not found'}) // Return error if user not found
         }

         res.json({success:true,
            userData:{
                name:user.name,
                email:user.email,
                isAccountVerified:user.isAccountVerified
            }}); // Return user data if found

    }catch(error){
        res.json({success:false,message:error.message})
    }
}