/*comment[icon: comment]{
  _id: string
  content: string
  video: ObjectId video
  owner: ObjectId user
  //likes: ObjectId user
  createdAt: Date
  updatedAt: Date
}*/

import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const CommentSchema = new Schema(
    {
        content:{
            type: String,
            required: true
        },
        video:{
            type: Schema.Types.ObjectId,
            ref: "Video",
        },
        owner:{
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        timestamps: true
    }
);

CommentSchema.plugin(mongooseAggregatePaginate);

export const Comment = mongoose.model("Comment", CommentSchema);