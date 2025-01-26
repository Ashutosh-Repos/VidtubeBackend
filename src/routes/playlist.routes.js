import { Router } from "express";
import {createPlaylist, getUserPlaylists, getPlaylistById, addVideoToPlaylist, removeVideoFromPlaylist, deletePlaylist, updatePlaylist} from "../controllers/playlist.controllers.js";
import { auth } from "../middlewares/auth.middlewares.js";


const router = Router();

router.route("/new").post(createPlaylist); //ok
router.route("/:playlistId").get(getPlaylistById).patch(updatePlaylist).delete(deletePlaylist); //ok
router.route("/channel/:channelId").get(getUserPlaylists); //ok
router.route("/addVideo/:playlistId/:videoId").post(addVideoToPlaylist); //ok
router.route("/removeVideo/:playlistId/:videoId").post(removeVideoFromPlaylist); //ok

export default router;

