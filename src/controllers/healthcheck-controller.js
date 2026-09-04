const ApiResponse = require('../utils/api-response')
const asyncHandler = require('../utils/asyn-handler')

const healthCheck = asyncHandler(async (req, res) => {
    res.status(200).json(
        new ApiResponse(200, { message: "Server is Running" })
    )
})
module.exports = healthCheck
