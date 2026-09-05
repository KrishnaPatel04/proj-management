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
const projectRouter=require('./routes/project-routes')
const taskRouter=require('./routes/task-routes')
const noteRouter=require('./routes/note-routes')

app.use("/api/v1/healthcheck",healthCheckRouter);
app.use("/api/v1/auth",authRouter);
app.use("/api/v1/projects",projectRouter);
app.use("/api/v1/tasks",taskRouter);
app.use("/api/v1/notes",noteRouter);



app.get('/',(req,res)=>{
    res.send("Welcome to basecampy")
})

// must be registered last — Express routes errors here from any
// asyncHandler-wrapped controller via next(err)
const errorHandler=require('./middlewares/error-handler')
app.use(errorHandler)

module.exports=app;
