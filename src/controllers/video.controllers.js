/*
const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
}) **done **not-tested

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
}) **done

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
}) **done **not-tested

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
}) **done **not-tested

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
}) **done **not-tested

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
}) **done **not-tested
 */


import {asyncHandler} from "../utils/asycHandler.js"
import {ApiError} from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary,removeFromCloudinary } from "../utils/cloudinary.js";
import {Video} from "../models/video.models.js";
import {Comment} from "../models/comment.models.js";
import {Like} from "../models/likes.models.js";
import mongoose from "mongoose";

const publishAVideo = asyncHandler(async (req, res) => {
    const user = req?.user;
    if(!user) throw new ApiError(406,"Please login first to upload video");

    const user_id = user?._id;
    if(!user_id) throw new ApiError(406,"Please login again to upload video");

    const { title, description, isPub} = req?.body
    if(!title || !description) throw new ApiError(400,"All fields are required");

    const videoFileLocalPath = req.files?.video?.[0]?.path;
    if(!videoFileLocalPath) throw new ApiError(400,"Video file is required");
    const thumbNailLocalPath = req.files?.thumbnail?.[0]?.path;
    if(!videoFileLocalPath) throw new ApiError(400,"thumbnail image is required");

    const video = await uploadOnCloudinary(videoFileLocalPath);
    const thumbnail = await uploadOnCloudinary(thumbNailLocalPath);

    if(!video || !thumbnail) throw new ApiError(500,"Error while uploading files");

    const dur = video?.duration || 0;

    const dbresponse = await Video.create(
        {
            videoFile: video.url,
            thumbnail: thumbnail.url,
            title: title,
            description: description,
            owner: user._id,
            duration: dur,
            isPublic: (isPub == true || isPub == "true" || isPub == "1" || isPub == 1 ) ? true : false
        }
    )

    if(!dbresponse) throw new ApiError(501,"Something worong");

    return res
        .status(201)
        .json(new ApiResponse(201,dbresponse,"success"));
}); //tested OK

const updateVideo = asyncHandler(async(req,res) =>{
    const { videoId } = req.params
    if(!videoId || !videoId.trim()) throw new ApiError(400,"invalid videoId");

    const { title, description, isPub} = req?.body;

    const thumbnailLocalPath = req?.file?.path;
    let thumbnailurl = null;

    if(thumbnailLocalPath && thumbnailLocalPath.trim()){
        thumbnailurl = await uploadOnCloudinary(thumbnailLocalPath);
    }

    const updates = {};

    if(title && title.trim()) updates.title = title;
    if(description && description.trim()) updates.description = description;

    console.log(typeof isPub);

    if(/*(typeof isPub !== undefined) always give true because typeOf isPub will always give "undefined" -> is a sting and string !== undefined will always give true*/ isPub !== undefined){
        if(isPub == "true" || isPub === true || isPub === 1 || isPub === "1"){updates.isPublic = true}
        else if(isPub == "false" || isPub === false || isPub === 0 || isPub === "0") {updates.isPublic = false}

        console.log("comming here")
    }

    if(thumbnailurl && thumbnailurl !== undefined && thumbnailurl?.url ) updates.thumbnail = thumbnailurl.url;

    console.log(updates);

    const dbVideo = await Video.findByIdAndUpdate(videoId,
        {
            $set:{...updates}
        },
        {new: true}
    );

    console.log(dbVideo);

    if(!dbVideo) throw new ApiError(500, "something went wrong while saving");

    return res
        .status(200)
        .json(new ApiResponse(200,dbVideo,"success"));
}) //tested OK

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req?.params;
    if(!videoId || !videoId.trim()) throw new ApiError(400, "videoId is required to delete video");
    const session = await mongoose.startSession();
    try {
        session.startTransaction();
        const videoDelete = await Video.findByIdAndDelete(videoId).session(session);
        console.log(videoDelete);
        if(!videoDelete) throw new ApiError(400,"video not found or something goes wrong while deleting...");

        const commentDelete = await Comment.deleteMany({video:videoId}).session(session);
        console.log("comment",commentDelete);
        const likeDelete = await Like.updateMany(
            {video:videoId},
            {
                $pull:{video:videoId}
            }
        ).session(session);
        console.log("like",likeDelete);

        await session.commitTransaction();
        console.log("video delete transaction done successfully");
        
    } catch (error) {
        await session.abortTransaction();
        console.log("Video delete transaction is aborted due to error:\n",error);
        throw error;
    }finally{
        session.endSession();
    }


    //cascading delete to comment and likes *ensuring data consistency*

    return res
        .status(200)
        .json(new ApiResponse(200,{},"success"));
}) //tested OK

const getVideoById = asyncHandler(async (req,res) => {
    const { videoId } = req.params;
    console.log(videoId);
    //validate videoID
    if(!videoId || !videoId.trim()) throw new ApiError(400,"invalid videoId");

        //valide video ID is of mongoose ObjectID format
    if(!mongoose.Types.ObjectId.isValid(videoId)) throw new ApiError(400,"Invalid videoId.....");

        //converting valid videoId to ObjectId
    const videoObjectId = new mongoose.Types.ObjectId(videoId);

    if(!videoObjectId) throw new ApiError(501,"Failed to covert videoId in ObjectId");

    const video = await Video.aggregate(
        [
            {
                $match:{
                    _id: videoObjectId
                }
            },
            {
                $lookup:{
                    from: "User",
                    localField: "owner",
                    foreignField: "_id",
                    as: "ownerDetails"
                }
            },
            {
                $lookup:{
                    from: "Comment",
                    localField: "_id",
                    foreignField: "video",
                    as: "comments"
                }
            },
            {
                $lookup:{
                    from: "Like",
                    localField: "_id",
                    foreignField: "video",
                    as: "likes"
                }
            },
            {
                $addFields: {
                    likesCount: {
                        $size: "$likes"
                    },
                    commentsCount: {
                        $size: "$comments"
                    }
                }
            },
            {
                $project:{
                    videoFile: 1,
                    thumbnail: 1,
                    title: 1,
                    description: 1,
                    owner: 1,
                    views: 1,
                    isPublic: 1,
                    comments: 1,
                    likesCount: 1,
                    commentsCount: 1
                }
            }
        ]
    );

    if (!video) throw new ApiError(400,"Video not found either you give flushed videoId or error occured from server/database side.....");

    console.log(video);

    return res
        .status(200)
        .json(new ApiResponse(200,video,"success"));
}) //tested OK

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query = null, sortBy = "createdAt", sortType = 'dsc' } = req.query
    //TODO: get all videos based on query, sort, pagination

    const filter = {};

    if(query){
        filter.$or = [
            {
                title: {
                    $regex: query,
                    $options: 'i'
                },
            },
            {
                
                description: {
                    $regex: query,
                    $options: 'i'
                }
            }
        ]
    }

    console.log(sortType);

    const sortOrder = sortType.toLowerCase() === 'asc'? 1 : -1;
    const skip = (page-1)*limit;

    const videos = await Video.aggregate(
        [
            {
                $match:{
                    ...filter,
                    isPublic: true
                }
            },
            {
                $lookup:{
                    from: "User",
                    localField: "owner",
                    foreignField: "_id",
                    as: "ownerDetails"
                }
            },
            {
                $lookup:{
                    from: "Comment",
                    localField: "_id",
                    foreignField: "video",
                    as: "comments"
                }
            },
            {
                $lookup:{
                    from: "Like",
                    localField: "_id",
                    foreignField: "video",
                    as: "likes"
                }
            },
            {
                $addFields: {
                    likesCount: {
                        $size: "$likes"
                    },
                    commentsCount: {
                        $size: "$comments"
                    }
                }
            },
            {
                $sort: {
                    createdAt: sortOrder,
                }
            },
            {
                $project:{
                    videoFile: 1,
                    thumbnail: 1,
                    title: 1,
                    description: 1,
                    owner: 1,
                    views: 1,
                    isPublic: 1,
                    comments: 1,
                    likesCount: 1,
                    commentsCount: 1
                }
            },
            {
                $skip: skip
            },
            {
                $limit: parseInt(limit)
            }
        ]
    );

    console.log(videos);

    if(!videos) throw new ApiError(400,"something went wrong from server side.....");

    return res
        .status(200)
        .json(new ApiResponse(200,videos,"success"));


}) //tested OK

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if(!videoId || !videoId.trim()) throw new ApiError(400,"invalid videoId");

    const video = await Video.findByIdAndUpdate(videoId,[
        {
            $set:{
                isPublic:{
                    $not: "$isPublic"  //toogle isPublic field (isPublic is boolean field)
                }
            }
        }
    ],{new: true});

    if(!video) throw new ApiError(500,"Video is not found, either videoId is wrong or Something went wrong from my side.....");

    return res
        .status(200)
        .json(new ApiResponse(200,video,"success"));
}) //tested OK
export {
    publishAVideo,
    updateVideo,
    deleteVideo,
    getVideoById,
    getAllVideos,
    togglePublishStatus
};