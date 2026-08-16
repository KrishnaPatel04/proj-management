const User=require('../models/user-model')
const asyncHandler=require('../utils/asyn-handler')
const ApiError=require('../utils/api-error')
const jwt=require('jsonwebtoken')
const verifyJWT=asyncHandler(async(req,res,next)=>{
   const token=req.cookies?.accessToken||req.header("Authorization")?.replace("Bearer ","")

   if(!token){
    throw new ApiError(401,"Unauthorized request")
   }

   try{
        const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
        const user=await User.findById(decodedToken?._id).select(
            "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
        )
        if(!user){
            throw new ApiError(401,"Invalid Access Token")
        }
        req.user=user;
        next();
   }catch(error){
        throw new ApiError(401,"Unauthorized Access")
   }


})

module.exports=verifyJWT