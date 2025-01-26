/*
const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
})
 */

import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Subscription } from "../models/subscription.models.js";
import { asyncHandler } from "../utils/asycHandler.js";
import mongoose from "mongoose";

const toggleSubscription = asyncHandler(async (req, res) => {
    const user_id = req?.user?._id;
    if(!user_id) throw new ApiError(400,"Please login.....");

    const {channelId} = req.params;
    if(!channelId || !channelId.trim()) throw new ApiError(400,"chaneelId is not provide or null");

    console.log(channelId);

    const toogleSub = await Subscription.findOne(
        {
            subscriber: user_id,
            channel: channelId
        }
    );

    console.log(toogleSub);

    if(toogleSub){
        const delSub = await Subscription.deleteOne(
            {
                subscriber: user_id,
                channel: channelId
            }
        )

        if(!delSub?.acknowledged) throw new ApiError(400, "server error");

        return res
            .status(200)
            .json(new ApiResponse(200, delSub, `${channelId} is unsubscribed successfully`))
    }
    

    const addSub = await Subscription.create(
        {
            subscriber: user_id,
            channel: channelId
        }
    )

    console.log(addSub);

    if(!addSub) throw new ApiError(500, "server error");


    return res
        .status(200)
        .json(new ApiResponse(200, addSub, `${channelId} is subscribed successfully`));

    // TODO: toggle subscription
}) //ok

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const user_id = req?.user?._id;
    if(!user_id) throw new ApiError(400,"Please login.....");

    const {channelId} = req.params;
    if(!channelId || !channelId.trim()) throw new ApiError(400,"chaneelId is not provide or null");

    //in aggregate we need to make mongoose id(string) to objectId type // basically if we not do so $match did not do matching and we always got empty array -> [] in return of agrregate;

    //validating channelId format is valid for ObjectId format
    if(!mongoose.Types.ObjectId.isValid(channelId)) throw new ApiError(400,"Invalid channelId.....");
            //converting valid videoId to ObjectId
    const channelObjectId = new mongoose.Types.ObjectId(channelId);


    const subscribers = await Subscription.aggregate(
        [
            {
                $match:{
                    channel: channelObjectId
                }
            }
        ]
    )

    if(!subscribers) throw new ApiError("Server error.....");

    return res
        .status(200)
        .json(new ApiResponse(200,subscribers,"success"));
}) //ok -but (when admin is created this should be updated to get more details)

const getSubscribedChannels = asyncHandler(async (req, res) => {
    const user_id = req?.user?._id;
    if(!user_id) throw new ApiError(400,"Please login.....");

    const { subscriberId } = req.params;

    if(!subscriberId || !subscriberId.trim()) throw new ApiError(400,"chaneelId is not provide or null");

    //validating subscriberId format is valid for ObjectId format
    if(!mongoose.Types.ObjectId.isValid(subscriberId)) throw new ApiError(400,"Invalid subscriberId.....");
            //converting valid videoId to ObjectId
    const subscriberObjectId = new mongoose.Types.ObjectId(subscriberId);

    const subscribed = await Subscription.aggregate(
        [
            {
                $match:{
                    subscriber: subscriberObjectId
                }
            }
        ]
    )

    if(!subscribed) throw new ApiError("Server error.....");

    return res
        .status(200)
        .json(new ApiResponse(200,subscribed,"success"));
}) //ok -but when admin is created this should be updated to get more details

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
};