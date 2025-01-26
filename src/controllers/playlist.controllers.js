/*
const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    //TODO: create playlist
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
})
*/

import { Video } from "../models/video.models.js";
import { Playlist } from "../models/playlist.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asycHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
    const user = req?.user;
    if(!user) throw new ApiError(406,"Please login first to create playlist");
    const user_id = req.user?._id;
    if(!user_id) throw new ApiError(406,"Please login again to create playlist");

    const {name, description, videoIds} = req.body;
    if(!name || !description) throw new ApiError(400,"name and description of playlist are required");

    let videosList;
    videosList = [];

    const payload = {};
    payload.name = name;
    payload.description = description;
    payload.owner = user_id;

    if(videoIds && Array.isArray(videoIds) && (videoIds.length !== 0)){
        // checking videosIds given are valid or not

        videosList = await Video.find(
            {
                _id:{
                    $in: videoIds
                }
            }
        ).select("_id");

        console.log(videosList);

        if(!videosList || !(videosList.length === videoIds.length)) throw new ApiError(400,"some of videos you give to add in playlist are invalid or not does not exist");

        payload.videos = videosList;

            //some code need to be added 
            // remove throw
            // allow code to resume if videosList is empty declared [] and if videoList have some valid video Ids then proceed with them and create playlist and inform user that valid ids videos are added and invalid were skipped....
    }

    const playlist = await Playlist.create(
        {
            ...payload
        }
    );

    if(!playlist) throw new ApiError(503,"Something went wrong whlie creating playlist");

    return res
        .status(200)
        .json(new ApiResponse(200,playlist,"success"));
    //TODO: create playlist
}) //ok

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {channelId} = req.params;
    if(!channelId || !channelId.trim()) throw new ApiError(400,"you provided null userId");

    //is user have any playlist
    const playlist = await Playlist.find({owner:channelId});

    if(!playlist) throw new ApiError(500,"User have not created any playlist or server error...");

    return res
        .status(200)
        .json(new ApiResponse(200,playlist,"success"));

    //const user = req?.user;
    // if(!user) throw new ApiError(406,"Please login first to upload video");
    // const user_id = user?._id;
    // if(!user_id) throw new ApiError(406,"Please login again to upload video");
    //TODO: get user playlists
}) //ok

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    if(!playlistId || !playlistId.trim()) throw new ApiError(400,"playlistId is null or not provided");

    //is user have any playlist
    const playlist = await Playlist.findById(playlistId);

    if(!playlist) throw new ApiError(500,"Playlist not found or server error...");

    return res
        .status(200)
        .json(new ApiResponse(200,playlist,"success"));
}) //ok

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params;
    if(!playlistId || !videoId || !playlistId.trim() || !videoId.trim()) throw new ApiError(400,"playlistId or video are null or not provided");

    const video = await Video.findById(videoId).select("_id");
    if(!video) throw new ApiError(400,"video not found or videoId given is invalid");

    const playlist = await Playlist.findByIdAndUpdate(playlistId,
        {
            $addToSet:{
                videos: video._id
            }
        },
        {new: true}
    )

    if(!playlist) throw new ApiError(503,"server error.....");

    return res
        .status(200)
        .json(new ApiResponse(200,playlist,"success"));
}) //ok

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params;
    if(!playlistId || !videoId || !playlistId.trim() || !videoId.trim()) throw new ApiError(400,"playlistId or video are null or not provided");
    // TODO: remove video from playlist
    const playlist = await Playlist.findOneAndUpdate(
        {
            _id: playlistId,
            videos: videoId
        },
        {
            $pull:{
                videos: videoId
            }
        },
        {
            new: true
        }
    )

    if(!playlist) throw new ApiError(500,"either videos doesn't exist in playlist or server error");

    return res
        .status(200)
        .json(new ApiResponse(200,playlist,"success"));

}) //ok

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req?.params;
    if(!playlistId || !playlistId.trim()) throw new ApiError(400,"playlistId is null or not provided");

    const {name, description} = req?.body;
    if((!name || !(name.trim() !== "")) && (!description || !(description.trim() !== ""))) throw new ApiError(400,"what i have to update, you and not provided me any field to update.....");

    const updateField = {};

    console.log(typeof name);
    console.log(typeof description);

    if(name !== undefined){
        if(name.trim() !== "") updateField.name = name;
    }
    if(description !== undefined){
        if(description.trim() !== "") updateField.description = description;
    }

    const playlist = await Playlist.findByIdAndUpdate(playlistId,
        {$set: updateField},
        {new: true}
    );

    if(!playlist) throw new ApiError(503,"server error");

    return res
        .status(200)
        .json(new ApiResponse(200,playlist,"success"));

    //TODO: update playlist
}) //ok

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
    if(!playlistId || !playlistId.trim()) throw new ApiError(400,"playlistId is null or not provided");

    //is user have any playlist
    const playlist = await Playlist.findByIdAndDelete(playlistId);

    if(!playlist) throw new ApiError(500,"Playlist not found or server error...");

    return res
        .status(200)
        .json(new ApiResponse(200,playlist,"success"));
}) //ok



export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
};