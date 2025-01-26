/*
const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
})
*/
import { Video } from "../models/video.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Comment } from "../models/comment.models.js";
import { asyncHandler } from "../utils/asycHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req?.params;
    if(!videoId || !videoId.trim()) throw new ApiError(400,"videoId is not provided or null")
    const {page = 1, limit = 10} = req?.query;

    const skip = (page-1)*limit;

    const video = await Video.findById(videoId).select("_id");
    if(!video) throw new ApiError(400,"video is not found");

    const comments = await Comment.find({video:video._id})
        .sort({createdAt: 1})
        .skip(skip)
        .limit(limit);

    if(!comments) throw new ApiError(500,"comments are not found or server error.....");

    return res
        .status(200)
        .json(new ApiResponse(200,comments,"success"));
}) //ok

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    if(!req?.user) throw new ApiError(400,"Please login.....");

    const user_id = req?.user?._id;

    if(!user_id) throw new ApiError(400, "Please login again, (user_id is not defined)");

    const {videoId,content} = req?.body;


    if(!videoId || !videoId.trim() || !content || !content.trim()) throw new ApiError(400, "Please provide both videoId and content");

    const video = await Video.findById(videoId).select("_id");

    if(!video) throw new ApiError(200,"video is not found, either videoId is invalid or server error.....");

    const comment = await Comment.create(
        {
            content: content,
            video: video._id,
            owner: user_id
        }
    );

    if(!comment) throw new ApiError(400,"server error.....");

    return res
        .status(200)
        .json(new ApiResponse(200,comment,"success"));
}) //ok

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    if(!req?.user) throw new ApiError(400,"Please login");
    const user_id = req.user?._id;
    if(!user_id) throw new ApiError(400,"Please login again, (invalid user_id is defined in user)");

    const {comment_id} = req?.params;
    if(!comment_id) throw new ApiError(400,"You have not given tweetId, How I find which tweet have to be updated ? Pleae provide tweetId in req.params");

    const commentMsg = req?.body?.content;
    if(!commentMsg || !commentMsg.trim()) throw new ApiError(400,"comment field is empty");

    const comment = await Comment.findByIdAndUpdate(comment_id,
        {
            $set:{
                content: commentMsg
            }
        },
        {
            new: true
        }
    )

    if(!comment) throw new ApiError(500,"server error.....");

    return res
        .status(200)
        .json(new ApiResponse(200,comment,"success"));
}) //ok

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    if(!req?.user) throw new ApiError(400,"Please login");
    const user_id = req.user?._id;
    if(!user_id) throw new ApiError(400,"Please login again, (invalid user_id is defined in user)");

    const {comment_id} = req?.params;
    if(!comment_id) throw new ApiError(400,"You have not given comment_id, How can I find which comment to be deleted ? Pleae provide tweetId in req.params");

    const commentStatus = await Comment.findByIdAndDelete(comment_id);

    if(!commentStatus) throw new ApiError(503,"Server error.....");

    return res
        .status(200)
        .json(new ApiResponse(200,commentStatus,"success"));
}) //ok

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
};