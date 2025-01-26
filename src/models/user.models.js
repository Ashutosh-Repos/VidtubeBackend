/*user[icon: user]{
    _id: string
    username: string
    email: string
    fullname: string
    avator: string
    coverImage: string
    password: string
    watchHistory: ObjectId[] video
    isCreator: boolean
    channelName: string
    createdAt: Date
    updatedAt: Date
}*/

import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const UserSchema = new Schema(
    {
        userName:{
            type: String,
            required: true,
            trim: true,
            index: true,
            lowercase: true,
            unique: true
        },
        email:{
            type: String,
            required: true,
            unique: true
        },
        fullName:{
            type: String,
            required: true,
        },
        avatar:{
            type: String, // cloudinary URL
            required: true
        },
        coverImage:{
            type: String // cloudinary URL
        },
        password:{
            type: String,
            required: [true, "password is required"]
        },
        refreshToken:{
            type: String
        },
        watchHistory:[
            {
                type: Schema.Types.ObjectId,
                ref:"Video"
            }
        ]
    },{
        timestamps: true
    }
);

UserSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next();
    
    //this.password = await bcypt.hash(this.password, 10);

    this.password = await bcrypt.hash(this.password, 10);

    console.log("triggerrrr");
})

UserSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password,this.password);
}

UserSchema.methods.generateAccessToken = async function name() {
    return jwt.sign({
        _id: this._id,
        email: this.email,
        fullname: this.fullname
    },process.env.ACCESS_TOKEN_SECRET, {expiresIn: process.env.ACCESS_TOKEN_EXPIRY})
}

UserSchema.methods.generateRefreshToken = async function name() {
    return jwt.sign({
        _id: this._id,
    },process.env.ACCESS_REFRESH_SECRET, {expiresIn: process.env.ACCESS_REFRESH_EXPIRY})
}

export const User = mongoose.model("User", UserSchema);

