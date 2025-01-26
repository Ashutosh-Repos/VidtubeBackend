import { Router } from "express";
import {publishAVideo, updateVideo, deleteVideo, getVideoById, getAllVideos, togglePublishStatus} from "../controllers/video.controllers.js"
import { auth } from "../middlewares/auth.middlewares.js";
import {upload} from "../middlewares/multer.middlewares.js";
const router = Router();

router.route("/").get(getAllVideos);

router.route("/upload").post(
    auth,
    upload.fields([
        {
            name: "video",
            maxCount: 1
        }, 
        {
            name: "thumbnail",
            maxCount: 1
        }
    ]),
    publishAVideo
);

router.route("/:videoId")
    .get(getVideoById)
    .delete(deleteVideo)
    .patch(upload.single("thumbnail"),updateVideo);

router.route("/update/toggle/:videoId").patch(togglePublishStatus);

export default router;