import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { ApiError } from "./utils/ApiError.js";
import { auth } from "./middlewares/auth.middlewares.js";

const app = express();

app.use(
  cors({
    //origin: [`${process.env.CORS_ORIGIN}`],
    origin: ["http://localhost:3000"],
    credentials: true,
  })
);
app.use(express.urlencoded({ extended: true }));
//app.use(express.urlencoded({extended: true, limit: '100kb'}));
app.use(express.json({ limit: "100kb" }));
app.use(express.static("public"));
app.use(cookieParser());
// app.use(auth);

//import routes
import healthCheckRouter from "./routes/healthcheck.routes.js";
import userRouter from "./routes/user.routes.js";
import videoRouter from "./routes/video.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import playlistRouter from "./routes/playlist.routes.js";
import tweetRouter from "./routes/tweet.routes.js";
import commentRouter from "./routes/comment.routes.js";
import likeRouter from "./routes/likes.routes.js";

//routes
app.use("/api/v1/healthcheck", healthCheckRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/video", videoRouter);
app.use("/api/v1/subscription", auth, subscriptionRouter);
app.use("/api/v1/playlist", auth, playlistRouter);
app.use("/api/v1/tweet", auth, tweetRouter);
app.use("/api/v1/comment", auth, commentRouter);
app.use("/api/v1/like", auth, likeRouter);

export { app };
