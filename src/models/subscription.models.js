/*subscription[icon: dollar-sign]{
  _id: string
  subscriber: ObjectId user
  channel: ObjectId user
  createdAt: Date
  updatedAt: Date
}*/

import mongoose, { Schema } from "mongoose";

const SubscriptionSchema = new Schema(
    {
        subscriber:{
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        channel:{
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        timestamps: true
    }
);

export const Subscription = mongoose.model("Subscription", SubscriptionSchema);