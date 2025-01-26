import { Router } from "express";
import { getVideoComments, addComment, updateComment, deleteComment } from "../controllers/comment.controllers.js";

const router = Router();
router.route("/video/:videoId").get(getVideoComments); //ok
router.route("/new").post(addComment); //ok
router.route("/:comment_id").patch(updateComment).delete(deleteComment); //ok

export default router;