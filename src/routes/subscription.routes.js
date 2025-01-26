import { Router } from "express";
import {toggleSubscription,getSubscribedChannels, getUserChannelSubscribers} from "../controllers/subscription.controllers.js";
import { auth } from "../middlewares/auth.middlewares.js";


const router = Router();

router.route("/toggle/:channelId").post(toggleSubscription);

// for admins
router.route("/subscribers/:channelId").get(getUserChannelSubscribers);
router.route("/subscribed/:subscriberId").get(getSubscribedChannels);

export default router;