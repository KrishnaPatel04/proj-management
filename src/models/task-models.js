const mongoose=require('mongoose')
const { Schema } = mongoose
const {AvailableTaskStatus,TaskStatusEnum}=require('../utils/constants')

const taskSchema=new Schema({
    title:{
        type:String,
        required:true,
        trim:true
    },
    description:String,
    project:{
        type:Schema.Types.ObjectId,
        ref:"Project",
        required:true
    },
    assignedTo:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    assignedBy:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    status:{
        type:String,
        enum:AvailableTaskStatus,
        default:TaskStatusEnum.TODO
    },
    attachments:{
        type:[{
            url:String,
            mimetype:String,
            size:Number
        }],
        default:[]
    }
},{
    timestamps:true
})


const Task=mongoose.model('Task',taskSchema);
module.exports=Task;
