const { ApiResponse } = require('../utils/api-response')
const asyncHandler=require('../utils/asyn-handler')

// const healthCheck = (req, res) => {
//     try {
//         res.status(200).json(
//             new ApiResponse(200, { message: "Server is Running" })
//         )
//     } catch (error) {
//         console.error(error)
//         res.status(500).json({ success: false, message: "Something went wrong" })
//     }
// }

const healthCheck=asyncHandler(async(req,res)=>{
    res.status(200).json(
        new ApiResponse(200,{message:"Server is Running"})
    )
})
module.exports=healthCheck