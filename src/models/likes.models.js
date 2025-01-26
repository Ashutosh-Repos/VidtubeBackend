/*likes[icon: thumbs-up]{
  _id: string pk
  comment: ObjectId comment
  video: ObjectId comment
  tweet: ObjectId comment
  likedBy: ObjectId user
  createdAt: string
  updatedAt: string
}*/

import mongoose, { Schema } from "mongoose";

const LikeSchema = new Schema(
    {
        comment:{
            type: Schema.Types.ObjectId,
            ref: "Comment",
        },
        video:{
            type: Schema.Types.ObjectId,
            ref: "Video",
        },
        tweet:{
            type: Schema.Types.ObjectId,
            ref: "Tweet",
        },
        likedBy:{
            type: Schema.Types.ObjectId,
            ref: "User",
        },
    },
    {
        timestamps: true
    }
);

export const Like = mongoose.model("Like", LikeSchema);