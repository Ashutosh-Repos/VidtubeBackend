/*tweet[icon: twitter]{
  _id: string
  owner: ObjectId user
  content: string
  //likes: ObjectId user
  createdAt: Date
  updatedAt: Date
}*/

import mongoose, { Schema } from "mongoose";

const TweetSchema = new Schema(
    {
        owner:{
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        content:{
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
);

export const Tweet = mongoose.model("Tweet", TweetSchema);