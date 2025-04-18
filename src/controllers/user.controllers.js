import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/User.model.js"
import {uploadCloudinary} from "../utils/Cloudinary.js"
import { ApiResponse } from "../utils/Apiresponce.js"



const registerUser=asyncHandler(async (req,res)=>{

  const{fullname,email,username,password}=req.body
console.log("email:",email);
  
  if(
    [fullname,email,username,password].some((field)=>
      field?.trim()==="")
  )
  {
    throw ApiError(400,"all fields are required")
  }


  const existedUser=User.findOne({
    $or:[{username},{email}]
  })

  if(existedUser){
    throw new ApiError(409,"user with email or username already exists")
  }

  const avatarLocalPath=req.files?.avatar[0]?.path;
  const coverImageLocalPath=req.files?.coverImage[0]?.path;

  if(!avatarLocalPath){
    throw new ApiError(400,"Avatar file is required")


  }

  const avatar=await uploadCloudinary(avatarLocalPath)
  const coverImage=await uploadCloudinary(coverImageLocalPath)

  if(!avatar){
    throw new ApiError(400,"Avatar file is required")

  }

  const user=await User.create({
    fullName,
    avatar:avatar.url,
    coverImage:coverImage?.url ||"",
    email,
    password,
    username:username.toLowerCase()
  })

  const createUser=await User.findById(user._id).select(
    "-password -refreshToken"
  )

  if(!createUser){
    throw new ApiError(500,"something went wrong while registering the user")
  }

  return res.status(201).json(
    new ApiResponse(200,createUser,"User registered Successfully")
  )


})



export {registerUser}