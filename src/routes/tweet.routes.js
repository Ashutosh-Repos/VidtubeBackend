import { Router } from "express";
import { createTweet, getUserTweets, updateTweet, deleteTweet } from "../controllers/tweet.controllers.js";

const router = Router();

router.route("/new").post(createTweet); //ok
router.route("/").get(getUserTweets); //ok
router.route("/:tweetId").patch(updateTweet).delete(deleteTweet); //ok


export default router;