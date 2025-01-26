import {asyncHandler} from "../utils/asycHandler.js"
import {ApiError} from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary,removeFromCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.models.js";

const generateAccessTokenAndRefreshToken = async (userId) => {
    if(!userId || userId == '') throw new ApiError(400, "unable to genrate acessToken or refreshToken");
    
    try {
        const user = await User.findById(userId);
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();
        console.log(accessToken,refreshToken);

        user.refreshToken = refreshToken;
    
        await user.save({validateBeforeSave: false});
    
        return {accessToken, refreshToken};
    } catch (error) {
        console.log(error);
        throw new ApiError(500, "Something went wrong while generating or saving acessToken and refreshToken");
    }
} //ok

const loginUser = asyncHandler(async(req,res)=>{
    // const bypass = req?.user?.id;
    // if(!bypass) return res.status(200).json(new ApiResponse(200,req.user, "You are already loggedIn"));
    const {userName, email, password} = req.body;
    console.log(req.body);
    // validate required feilds
    if(!userName || !email || !password) throw new ApiError(404,"All fields are required");

    // find user
    const user = await User.findOne(
        {
            $or: [{userName}, {email}],
        }
    )

    if(!user) throw new ApiError(404, `user with ${email} and ${userName} is not register. Please register`);

    // vailidate password
    const isPasswordCorerect = await user.isPasswordCorrect(password);
    if(!isPasswordCorerect) throw new ApiError(400, "wrong credentials");

    // getting accessToken and refreshToken
    const {accessToken, refreshToken} = await generateAccessTokenAndRefreshToken(user._id);

    //option field for making cookie secured
    const option = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("accessToken",accessToken,option)
        .cookie("refreshToken",refreshToken,option)
        .json(new ApiResponse(200,{user: {"1":accessToken, "2":refreshToken}},"User loggenIn sucessfully"));


}) //ok

const logoutUser = asyncHandler(async (req,res) => {
    console.log(req);
    await User.findByIdAndUpdate(req.user._id, 
        {
            $unset: {                    // this will remove refreshToken field from document
                refreshToken: 1
            }
        },{
            new: true
        }
    )
    
    const option = {
        httpOnly: true,
        secure: true
    }
    return res
        .status(200)
        .clearCookie("accessToken",option)
        .clearCookie("refreshToken",option)
        .json(new ApiResponse(200, {},"user is loggedOut, cookies had been cleared"));
}) //ok

const registerUser = asyncHandler(async (req,res) => {
        if(!req.body) throw new ApiError(400, "All fields are required");

        //may be todo problem is if req.body is not properly filled but files are given user multer middleware upload it to public directory, because of it redundant files are cummulated in public directory and these file are not uploaded to cloudinary and also there is no user created for it. solution try catch of data validation and checking use already exist sections of code

        const {fullName, email, userName, password} = req.body;

        console.log(req.body);

        //data validation
        if(!fullName || !email || !userName || !password){
             throw new ApiError(400, "Fields are undefined");
        }
        if (
            [fullName, email, userName, password].some((field) => field?.trim() === "")
        ) {
            throw new ApiError(400, "All fields are required")
        }

        //checking user is user alreadyExists
        const existedUser = await User.findOne({
            $or: [{ userName: userName }, { email: email }]
        })

        console.log("User is", existedUser);
        
        if(existedUser){ throw new ApiError(409,`User already exists with username - ${userName} or email - ${email}`)};

        //file validation

        const avatarLocalFilePath = await req.files?.avatar?.[0]?.path;

        if(!avatarLocalFilePath){
            throw new ApiError(400, `Avatar field is required`);
        }

        //'/Users/ashutoshkumar/Desktop/vidTube/public/images/default/cover.jpg'
        const coverImageLocalFilePath = await req.files?.coverImage?.[0]?.path;
        if(coverImageLocalFilePath === avatarLocalFilePath) throw new ApiError(400,"avatar image and cover imafe should not be same");
        const avatar = await uploadOnCloudinary(avatarLocalFilePath);
        if(!avatar) throw new ApiError(400, `Avator image file is required`);
        let coverImage;
        if(!coverImageLocalFilePath) coverImage = 'https://res.cloudinary.com/da8wropwc/image/upload/aq9pcgwvleogh1jjftfa';
        coverImage = await uploadOnCloudinary(coverImageLocalFilePath);

        const user = await User.create({
            userName: userName.toLowerCase(),
            email: email,
            fullName: fullName,
            avatar: avatar.url,
            coverImage: coverImage?.url || "",
            password: password
        })

        console.log(user);

        if(!user) throw new ApiError(500,"Something went wrong while registering user");

        const data = {
            userName: user.userName,
            email: user.email
        }

        return res.status(201).json(new ApiResponse(200, data, "User is registered successfully"))
        //const coverImageLocalFilePath = '../../public/images/default/cover.jpg';
    }
) //ok

const refreshAccessToken = asyncHandler(async(req,res)=>{
    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshAccessToken

    if(!incomingRefreshToken) throw new ApiError(400, "unable to get refresh token");

    try {
        const decode = jwt.verify(incomingRefreshToken, process.env.ACCESS_REFRESH_SECRET);
        const user = User.findById(decode?._id).select("-password -userName -fullName -email -avatar -watchHistory -isCreator");

        if(!user) throw new ApiError(400, "Refresh token is invalid");

        if(incomingRefreshToken !== user?.refreshToken) throw new ApiError(400, "Refresh token is expired");

        const option = {
            httpOnly: true,
            secure: true
        }

        const {accessToken, refreshToken: newRefreshToken} = await generateAccessTokenAndRefreshToken(user?._id);

        return res
            .status(200)
            .cookie("accessToken", accessToken, option)
            .cookie("refreshToken", newRefreshToken, option)
            .json(new ApiResponse(200,{accessToken,refreshToken:newRefreshToken}, "accessTokens refreshed"));
    } catch (error) {
        throw new ApiError(400, error?.message || "Refresh token is invalid");
    }

}) //ok

const getUser = asyncHandler(async(req,res)=>{
    if(!req?.user) throw new ApiError(400,"Please login");
    
    return res.status(200).json(new ApiResponse(200,req.user,"success"));
}) //ok

const updateAvatar = asyncHandler(async (req,res) => {
    if(!req?.user) throw new ApiError(400,"Please login");
    console.log(req);
    const avatarLocalPath = req.file?.path
    if(!avatarLocalPath) throw new ApiError(400,"user avatar file is missing");


    const previous_user = req.user;
    //const previousUrl = previous_user.avatar;
    //const result = await removeFromCloudinary(previousUrl);

    // TODO: remove existing image file from cloudinary

    //console.log("result is:", result);

    const newUrl = await uploadOnCloudinary(avatarLocalPath)
    if(!newUrl) throw new ApiError(400,"Something went wrong while uploading avatar");

    const user = await User.findByIdAndUpdate(previous_user._id,{
        $set:{
            avatar:  newUrl.url
        }
    },{new: true}).select("-password -userName -fullName -watchHistory -isCreator -channelName -refreshToken -email -coverImage");

    return res.status(200).json(new ApiResponse(200,user,"success"));

}) //ok

const updateCoverImage = asyncHandler(async (req,res) => {
    if(!req?.user) throw new ApiError(400,"Please login");
    console.log(req);
    const coverLocalPath = req.file?.path
    if(!coverLocalPath) throw new ApiError(400,"user avatar file is missing");
    const previous_user = req.user;
    const newUrl = await uploadOnCloudinary(coverLocalPath)
    if(!newUrl) throw new ApiError(400,"Something went wrong while uploading avatar");

    const user = await User.findByIdAndUpdate(previous_user._id,{
        $set:{
            coverImage:  newUrl.url
        }
    },{new: true}).select("-password -userName -fullName -watchHistory -isCreator -channelName -refreshToken -email -avatar");

    return res.status(200).json(new ApiResponse(200,user,"success"));

}) //ok

const changePassword = asyncHandler(async(req,res)=>{
    const {newPassword, oldPassword} = req.body;

    if(!newPassword || !oldPassword) throw new ApiError(400, "new Password and old Password are required");

    const authUser = req?.user;

    if(!authUser) throw new ApiError(400,"Please login first to change password");

    const userid = authUser._id;

    const user = await User.findById(userid);

    const valid = await user.isPasswordCorrect(oldPassword);


    if(!valid) throw new ApiError(400, "Old password is incorrect");

    user.password = newPassword;

    await user.save({validateBeforeSave: false});

    return res
        .status(200)
        .json(new ApiResponse(200,{},"password is changed successfully"));

}) //pk

const getChannelProfile = asyncHandler(async (req,res) => {
    const {username} = req.params;
    const { page = 1, limit = 10, sortBy = "createdAt", sortType = 'dsc' } = req.query

    if(!username.trim()) throw new ApiError(400,`username is not given`);

    console.log(username)

    // if(!mongoose.Types.ObjectId.isValid(videoId)) throw new ApiError(400,"Invalid videoId.....");
    
    //         //converting valid videoId to ObjectId
    //     const videoObjectId = new mongoose.Types.ObjectId(videoId);
    
    //     if(!videoObjectId) throw new ApiError(501,"Failed to covert videoId in ObjectId");
    //Incomplete

    const sortOrder = sortType.toLowerCase() === 'asc'? 1 : -1;
    const skip = (page-1)*limit;

    const channelInfo = await User.aggregate(
        [
            {
                $match:{
                    userName: username?.toLowerCase()
                }
            },
            {
                $lookup:{
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "channel",
                    as: "subscribers"
                }
            },
            {
                $lookup:{
                    from: "videos",
                    localField: "_id",
                    foreignField: "owner",
                    pipeline:[
                        {
                            $sort: {
                                createdAt: sortOrder,
                            }
                        },
                        {
                            $skip: skip
                        },
                        {
                            $limit: parseInt(limit)
                        }
                    ],
                    as: "videos"
                }
            },
            {
                $addFields:{
                    subscribersCount:{
                        $size: "$subscribers"
                    }
                }
            },
            {
                $project:{
                    userName: 1,
                    subscribersCount: 1,
                    avatar: 1,
                    coverImage: 1,
                    email: 1,
                    videos: 1,
                    subscribers: 1
                }
            }
        ]
    );
    //console.log(owner);

    return res.status(200).json(new ApiResponse(200,channelInfo,"success"));
}) //ok


export {
    registerUser,
    loginUser,
    refreshAccessToken,
    logoutUser,
    getUser,
    updateAvatar,
    updateCoverImage,
    changePassword,
    getChannelProfile
};