import { exec, execSync } from "child_process";
import { asyncHandler } from "../utils/asycHandler.js";
import { ApiError } from "../utils/ApiError.js";
import path from "path"; // For safe path joining
import fs from 'fs'
import { ApiResponse } from "../utils/ApiResponse.js";

const conversion = asyncHandler(async (req, res, next) => {
  console.log("Hello to conversion\n");

  // Retrieve video and thumbnail file paths
  const videoFileLocalPath = req.files?.video?.[0]?.path;
  if (!videoFileLocalPath) throw new ApiError(400, "Video file is required");

  // Get the video filename
  const videoFileName = req.files?.video?.[0]?.filename || "not found";
  console.log("Video name is", videoFileName);

  if (!videoFileName || !videoFileName.trim()) throw new ApiError(400, "Cannot access video name");

  // Construct input and output file paths using `path.join` for safer path handling
  const inputFilePath = path.join("public", "temp", "inc", videoFileName);
  const outputFilePath = path.join("public", "temp", "out", `converted_${videoFileName}`);

  try {
    // Run FFmpeg with relative paths
    const command = `ffmpeg -i "${inputFilePath}" -vf "scale=w=iw*min(1920/iw\\,1080/ih):h=ih*min(1920/iw\\,1080/ih),pad=1920:1080:(1920-iw*min(1920/iw\\,1080/ih))/2:(1080-ih*min(1920/iw\\,1080/ih))/2" -c:a copy "${outputFilePath}"`;

    console.log("Executing:", command);
    
    await execSync(command);

    console.log("Video converted successfully:", outputFilePath);

    // Replace the original video file path with the converted video for the next middleware
    req.files.video[0].path = outputFilePath;
    fs.unlinkSync(videoFileLocalPath)

    next(); // Move to the next middleware
  } catch (error) {
    console.error("Error during video conversion:", error);
    throw new ApiError(500, "Error converting video");
  }

  return new ApiResponse(400,{},"something critical");
});

export { conversion };
