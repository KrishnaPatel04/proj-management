const dotenv=require('dotenv')
const app=require("./app.js")
const express=require('express')
const connectDB=require('./db/index.js')
dotenv.config({
    path:"./.env",
})

const port=process.env.port || 3000;

connectDB().then(()=>{
    app.listen(port,()=>{
        console.log(`server running on port : ${port}`)
    })
}).catch((err)=>{
    console.error("mongoDB connection failed",err)
})

app.listen(port,()=>{
    console.log(`server running on port : ${port}`)
})
