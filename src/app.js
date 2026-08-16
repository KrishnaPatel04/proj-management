const express=require('express');
const cors=require("cors");
const app=express();
const cookieParser=require('cookie-parser')
//basic configurations
app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}));
app.use(express.static("public"));

app.use(cookieParser())
//cors configuration
app.use(cors({
    origin:process.env.cors_origin?.split(',')||"http://localhost:5173",
    credentials:true,
    methods:['PUT','PATCH','GET','DELETE','OPTIONS','POST'],
    allowedHeaders:['Content-Type','Authorization'],  
}))

//import the routes
const healthCheckRouter=require('./routes/healtheck-routes')
const authRouter=require('./routes/auth-routes');

app.use("/api/v1/healthcheck",healthCheckRouter);
app.use("/api/v1/auth",authRouter);


app.get('/',(req,res)=>{
    res.send("Welcome to basecampy")
})
module.exports=app;