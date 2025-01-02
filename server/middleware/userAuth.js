import jwt from "jsonwebtoken";

const userAuth = async (req, res, next) => {
    const {token}   = req.cookies; // Extract token from cookies

    if(!token){
        return res.json({success:false,message:'User not authenticated'})
    }
    try{
        const tokenDecode = jwt.verify(token,process.env.JWT_SECRET); // Verify the token
        if(tokenDecode.id){
            req.body.userId = tokenDecode.id; // Add userId to request body

        }
        else{
            return res.json({success:false,message:'User not authenticated. Please login again'})
        }
        next(); // Call the next middleware

    }
    catch(error){
        res.json({success:false,message:error.message})
    }
};
export default userAuth;