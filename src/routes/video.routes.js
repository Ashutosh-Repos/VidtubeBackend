import { Router } from "express";
import {
  publishAVideo,
  updateVideo,
  deleteVideo,
  getVideoById,
  getAllVideos,
  togglePublishStatus,
} from "../controllers/video.controllers.js";
import { auth } from "../middlewares/auth.middlewares.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { conversion } from "../middlewares/conversion.middlewares.js";
const router = Router();

router.route("/").get(getAllVideos);

router.route("/upload").post(
  auth,
  upload.fields([
    {
      name: "video",
      maxCount: 1,
    },
    {
      name: "thumbnail",
      maxCount: 1,
    },
  ]),
  conversion,
  publishAVideo
);

router
  .route("/:videoId")
  .get(auth, getVideoById)
  .delete(auth, deleteVideo)
  .patch(auth, upload.single("thumbnail"), updateVideo);

router.route("/update/toggle/:videoId").patch(auth, togglePublishStatus);

export default router;
