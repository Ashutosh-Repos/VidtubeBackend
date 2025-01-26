import { Router } from "express";
import { toggleCommentLike, toggleVideoLike, toggleTweetLike, getLikedVideos } from "../controllers/likes.controllers.js";

const router = Router();

router.route("/video/:videoId").post(toggleVideoLike);
router.route("/comment/:commentId").post(toggleCommentLike);
router.route("/tweet/:tweetId").post(toggleTweetLike);
router.route("/videos").get(getLikedVideos);

export default router;