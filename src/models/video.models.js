/*video[icon: video]{
  _id: string
  videoFile: string
  thumbnail: string
  owner: ObjectId user
  title: string
  description: string
  views: number
  duration: number
  //likes: ObjectId user
  isPublic: boolean
  createdAt: Date
  updatedAt: Date
}*/

import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const VideoSchema = new Schema(
    {
        videoFile:{
            type: String, // cloudinary URL
            required: true,
            unique: true
        },
        thumbnail:{
            type: String, // cloudinary URL
            required: true,
            unique: true
        },
        title:{
            type: String,
            required: true,
        },
        description:{
            type: String,
            required: true,
        },
        owner:{
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        views:{
            type: Number,
            default: 0
        },
        duration:{
            type: Number,
            required: true,
        },
        isPublic:{
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

VideoSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model("Video", VideoSchema);

