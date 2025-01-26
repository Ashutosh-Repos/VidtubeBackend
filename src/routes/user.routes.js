import { Router } from "express";
import { registerUser,loginUser,logoutUser,refreshAccessToken,updateAvatar,updateCoverImage,changePassword,getChannelProfile } from "../controllers/user.controllers.js";
import { auth } from "../middlewares/auth.middlewares.js";
import {upload} from "../middlewares/multer.middlewares.js";
const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        }, 
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
    );

router.route("/login").post(loginUser);
router.route("/refresh-token").post(refreshAccessToken)

//secured routes

router.route("/logout").post(auth,logoutUser)
router.route("/update-avatar").post(auth,upload.single("avatar"),updateAvatar);
router.route("/update-coverImage").post(auth,upload.single("coverImage"),updateCoverImage);
router.route("/change-password").post(auth,changePassword);
router.route("/channel/:username").get(auth,getChannelProfile);
export default router;