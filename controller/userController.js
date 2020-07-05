const multer = require('multer')
const sharp = require('sharp')
const express = require('express');
const User = require('./../models/userModel');
// const userRouter = require('./../routes/userRoutes')
const APIFeatures = require('./../utils/apiFeatures')
const catchAsync = require('./../utils/catchAsync')
const mongoose = require('mongoose');
const AppError = require('./../utils/appError')
const app=express();
const factory = require('./handlerFactory')

// const multerStorage = multer.diskStorage({
//   destination: (req,file, cb) =>{
//     cb(null,'public/images')
//   },
//   filename: (req,file, cb) =>{
//     //user 
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`)
//   } 
// })

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) =>{
  if(file.mimetype.startsWith('image')){
    cb(null,true)
  }
  else{
    cb(new AppError('Not an Image, Please upload an image',400),false) 
  }
}

const upload = multer({ 
  storage: multerStorage,
  fileFilter: multerFilter
})


exports.updateUserPhoto = upload.single('photo')

exports.resizeUserPhoto = catchAsync(async(req,res,next) =>{
  if(!req.file) return next()

  req.file.filename =  `user-${req.user.id}-${Date.now()}.jpeg`

  await sharp(req.file.buffer)
  .resize(300,300)
  .toFormat('jpeg')
  .jpeg({ quality:90 })
  .toFile(`public/images/${req.file.filename}`)

  next();
})

const filterObj = (obj, ...allowedFields) =>{
    const newObj={}
    Object.keys(obj).forEach(el=>{
        if(allowedFields.includes(el))
        newObj[el]= obj[el];
    })
    return newObj
}

exports.getMe = (req,res,next)=>{
  req.params.id = req.user.id;
  next()
}


exports.updateMe = catchAsync(async (req, res, next) => {
  //1) CREATE ERROR IF USER POSTS PASSWORD DATA
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        "This route is not for password Update. Please use /updateMyPasword",
        400
      )
    );
  }
  //2) FILTER OUT UNWANTED FIELDS THAT SHOULD NOT BE UPDATED
  const filteredBody = filterObj(req.body, "name", "email");
  if(req.file) filteredBody.photo = req.file.filename;
  console.log(filteredBody);
  //3)UPDATE USER DOCUMENT
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "Success",
    data: {
      user: updatedUser,
    },
  });
});


exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: "Success",
    data: null,
  });
});



exports.createUser = (req,res)=>{
    res.status(500).json({
        status:"Fail",
        message:"The route is not defined!Please use Signup"
    })
}

exports.getAllUsers = factory.getAll(User)
exports.getUser = factory.getOne(User)
//Do not update password using this route
exports.updateUser = factory.updateOne(User)
exports.deleteUser = factory.deleteOne(User)

