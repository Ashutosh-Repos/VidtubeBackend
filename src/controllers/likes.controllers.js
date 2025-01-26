/*
const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
})

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
})
 */

import {Like} from "../models/likes.models.js";
import { Video } from "../models/video.models.js";
import { Comment } from "../models/comment.models.js";
import { Tweet } from "../models/tweet.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {asyncHandler} from "../utils/asycHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params;
    if(!videoId || !videoId.trim()) throw new ApiError(400,"videoId is not provided or null");
    const user_id = req.user?._id;
    if(!user_id) throw new ApiError(400,"Please login.....");

    const video = await Video.findById(videoId).select("_id");

    if(!video) throw new ApiError("videoId provided is invalid, video is not found");

    const toogle = await Like.findOneAndUpdate(
        {
            video: video._id,
            likedBy: user_id
        },
        {new: true}
    );

    if(toogle){
        const del = await Like.deleteOne(
            {
                video: video._id,
                likedBy: user_id
            }
        );

        if(!del?.acknowledged) throw new ApiError(400, "server error");

        return res
            .status(200)
            .json(new ApiResponse(200, del, "video is unliked successfully"))
    }

    const addLike = await Like.create(
        {
            video: video._id,
            likedBy: user_id
        }
    )

    console.log(addLike);
 
    if(!addLike) throw new ApiError(500,"server error");

    return res
        .status(200)
        .json(new ApiResponse(200, addLike, "video is liked successfully"));
    //TODO: toggle like on video
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment

    if(!commentId || !commentId.trim()) throw new ApiError(400,"commentId is not provided or null");
    const user_id = req.user?._id;
    if(!user_id) throw new ApiError(400,"Please login.....");

    const comment = await Comment.findById(commentId).select("_id");

    if(!comment) throw new ApiError("commentId provided is invalid, comment is not found");


    const toogle = await Like.findOneAndUpdate(
        {
            comment: comment._id,
            likedBy: user_id
        },
        {new: true}
    );

    if(toogle){
        const del = await Like.deleteOne(
            {
                comment: comment._id,
                likedBy: user_id
            }
        );

        if(!del?.acknowledged) throw new ApiError(500, "server error");

        return res
            .status(200)
            .json(new ApiResponse(200, del, "comment is unliked successfully"))
    }

    const addLike = await Like.create(
        {
            comment: comment._id,
            likedBy: user_id
        }
    )

    console.log(addLike);
 
    if(!addLike) throw new ApiError(500,"server error");

    return res
            .status(200)
            .json(new ApiResponse(200, addLike, "comment is liked successfully"));

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req?.params;
    //TODO: toggle like on tweet

    if(!tweetId || !tweetId.trim()) throw new ApiError(400,"tweetId is not provided or null");
    const user_id = req.user?._id;
    if(!user_id) throw new ApiError(400,"Please login.....");

    const tweet = await Comment.findById(tweetId).select("_id");

    if(!tweet) throw new ApiError("tweetId provided is invalid, comment is not found");


    const toogle = await Tweet.findOneAndUpdate(
        {
            tweet: tweet._id,
            likedBy: user_id
        }
    );

    if(toogle){
        const del = await Like.deleteOne(
            {
                tweet: tweet._id,
                likedBy: user_id
            },
            {new: true}
        );

        if(!del?.acknowledged) throw new ApiError(500, "server error");

        return res
            .status(200)
            .json(new ApiResponse(200, del, "tweet is unliked successfully"))
    }

    const addLike = await Like.create(
        {
            tweet: tweet._id,
            likedBy: user_id
        }
    )

    console.log(addLike);
 
    if(!addLike) throw new ApiError(500,"server error");


    return res
            .status(200)
            .json(new ApiResponse(200, addLike, "tweet is liked successfully"));
})

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const user = req?.user;
    if(!user) throw new ApiError(400,"Please login.....");

    const user_id = user?._id;

    console.log(user_id);

    if(!user_id) throw new ApiError(400,"Please login again, user_id provided is null");

    const likedVideos = await Like.aggregate(
        [
            {
                $match: {
                    likedBy: user_id
                }
            },
            {
                $lookup:{
                    from: "Video",
                    localField: "video",
                    foreignField: "_id",
                    as: "likedVid"
                }
            },
            {
                $project:{
                    likedBy: 1,
                    likedVid: 1
                }
            }
        ]
    )

    if(!likedVideos) throw new ApiError(503,"user does not liked any video or server error.....");

    return res
        .status(200)
        .json(new ApiResponse(200,likedVideos,"success"));
})

export {
    toggleCommentLike,
    toggleVideoLike,
    toggleTweetLike,
    getLikedVideos
};
