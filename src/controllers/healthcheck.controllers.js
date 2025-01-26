import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asycHandler.js"

const healthCheck = asyncHandler(async (req,res) => {
    return res.status(200).json(new ApiResponse(200,"OK","health check passed"))
})

export {healthCheck}