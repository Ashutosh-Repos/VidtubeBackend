/*
const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
})
 */

import { Tweet } from "../models/tweet.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asycHandler.js";

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    if(!req?.user) throw new ApiError(400,"Please login");
    const user_id = req.user?._id;
    if(!user_id) throw new ApiError(400,"Please login again, (invalid user_id is defined in user)");

    const tweetMsg = req?.body?.content;
    if(!tweetMsg) throw new ApiError(400,"tweet field is empty");

    const tweet = await Tweet.create(
        {
            owner: user_id,
            content: tweetMsg
        }
    )

    if(!tweet) throw new ApiError(400,"Something went wrong while posting tweet");

    return res
        .status(200)
        .json(new ApiResponse(200,tweet,"success"));

}) //ok

const getUserTweets = asyncHandler(async (req,res) => {
    if(!req?.user) throw new ApiError(400,"Please login");
    const user_id = req.user?._id;
    if(!user_id) throw new ApiError(400,"Please login again, (invalid user_id is defined in user)");


    const userTweets = await Tweet.find({owner:user_id});

    if(!userTweets) throw new ApiError(400,"no tweets were found, or something went wrong while finding tweets");

    return res
        .status(200)
        .json(new ApiResponse(200,userTweets,"success"));
}) //ok

const updateTweet = asyncHandler(async (req, res) => {
    if(!req?.user) throw new ApiError(400,"Please login");
    const user_id = req.user?._id;
    if(!user_id) throw new ApiError(400,"Please login again, (invalid user_id is defined in user)");

    const {tweetId} = req?.params;
    if(!tweetId) throw new ApiError(400,"You have not given tweetId, How I find which tweet have to be updated ? Pleae provide tweetId in req.params");

    const tweetMsg = req?.body?.content;
    if(!tweetMsg) throw new ApiError(400,"tweet field is empty");

    const tweet = await Tweet.findByIdAndUpdate(tweetId,
        {
            $set:{
                content: tweetMsg
            }
        },
        {
            new: true
        }
    )

    if(!tweet) throw new ApiError(503,"something went wrong while updating a tweet");

    return res
        .status(200)
        .json(new ApiResponse(200,tweet,"success"));
}) //ok

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    if(!req?.user) throw new ApiError(400,"Please login");
    const user_id = req.user?._id;
    if(!user_id) throw new ApiError(400,"Please login again, (invalid user_id is defined in user)");

    const {tweetId} = req?.params;
    if(!tweetId) throw new ApiError(400,"You have not given tweetId, How can I find which tweet to be deleted ? Pleae provide tweetId in req.params");

    const tweetStatus = await Tweet.findByIdAndDelete(tweetId);

    if(!tweetStatus) throw new ApiError(503,"Tweet is not found or Something went wrong while deleting tweet");

    return res
        .status(200)
        .json(new ApiResponse(200,tweetStatus,"success"));
}) //ok

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
};