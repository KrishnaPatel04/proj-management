const mongoose=require('mongoose');
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');
const crypto=require('crypto')
const UserSchema=new mongoose.Schema({
    avatar:{
        type:{
            url:String,
            localPath:String
        },
        default:{
            url:`https://placehold.co/100x100`,
            localPath:""
        }
    },
    username:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true
    },
    name:{
        type:String,
        trim:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true
    },
    role:{
        type:String,
    },
    password:{
        type:String,
        required:[true,"Password is required"]
    },
    isEmailVerified:{
        type:Boolean,
        default:false
    },
    refreshToken:{
        type:String
    },
    forgotPasswordToken:{
        type:String
    },
    forgotPasswordExpiry:{
        type:Date
    },
    emailVerificationToken:{
        type:String
    },
    emailVerificationExpiry:{
        type:Date
    }
},{
    timestamps:true
}
)
UserSchema.pre("save",async function(){
    if(!this.isModified("password")) return ;
    this.password=await bcrypt.hash(this.password,10);
})

UserSchema.methods.isPasswordCorrect=async function(password){
    return bcrypt.compare(password,this.password)
}
UserSchema.methods.generateAcessToken=function(){
    return jwt.sign(
        {
            _id:this._id,
            email:this.email,
            username:this.username
        },
        process.env.ACCESS_TOKEN_SECRET,
        {expiresIn:process.env.ACCESS_TOKEN_EXPIRY}
    )
}
UserSchema.methods.generateRefreshToken=function(){
    return jwt.sign({
        _id:this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {expiresIn:process.env.REFRESH_TOKEN_EXPIRY}
    )
}

UserSchema.methods.generateTemporaryToken=function(){
    const unhashed=crypto.randomBytes(20).toString('hex');
    const hashedToken=crypto.createHash('sha256')
    .update(unhashed)
    .digest("hex")

    const tokenExpiry=Date.now()+(20*60*1000)
    return {unhashed,hashedToken,tokenExpiry};
}
const User=mongoose.model('user',UserSchema)  ;

module.exports=User