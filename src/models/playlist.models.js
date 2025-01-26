/*playlist[icon: book-open]{
  _id: string
  name: string
  description: string
  videos: ObjectId[] video
  owner: ObjectId user
  //likes: ObjectId user
  createdAt: Date
  updatedAt: Date
}*/

import mongoose, { Schema } from "mongoose";

const PlaylistSchema = new Schema(
    {
        name:{
            type: String,
            required: true,
        },
        description:{
            type: String,
            required: true,
        },
        owner:{
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        videos:[
            {
                type: Schema.Types.ObjectId,
                ref:"Video"
            }
        ],
    },
    {
        timestamps: true
    }
);

export const Playlist = mongoose.model("Playlist", PlaylistSchema);