const mongoose=require('mongoose')
const { Schema } = mongoose
const projectNoteSchema= new Schema({
    project:{
        type:Schema.Types.ObjectId,
        ref:"Project",
        required:true
    },
    createdBy:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    content:{
        type:String,
        required:true
    }
},{timestamps:true})


const ProjectNote=mongoose.model('ProjectNote',projectNoteSchema)
module.exports=ProjectNote
