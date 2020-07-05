const crypto = require('crypto')
const { promisify } = require('util') 
const User = require('./../models/userModel')
const catchAsync = require('./../utils/catchAsync')
const jwt = require('jsonwebtoken')
const AppError = require('./../utils/appError')
// const sendEmail = require('./../utils/email')
const Email = require('./../utils/email');

const signToken =id =>{
    return jwt.sign({ id }, process.env.JWT_SECRET ,{
        expiresIn : process.env.JWT_EXPIRES_IN
    })
}

const createAndSendToken = (user,statusCode,res)=>{
    const token = signToken(user._id);
   // console.log(token);
   // console.log(statusCode);
    
    const cookieOptions = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
        httpOnly: true
    }

    if(process.env.NODE_ENV === 'production')
    cookieOptions.secure = true
    res.cookie('jwt',token,cookieOptions)

    //Remove the password
    user.password = undefined;
    res.status(statusCode).json({
        status : 'success',
        token,
        data: {
            user
        }
    })
}


exports.signup = catchAsync(async(req,res)=>{
    // const newUser = await User.create(req.body)

    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        role: req.body.role,
        password : req.body.password,
        passwordConfirm : req.body.passwordConfirm,
        passwordChangedAt : req.body.passwordChangedAt
    })

    const url = `${req.protocol}://${req.get('host')}/me`;
    console.log(url);
    await new Email(newUser, url).sendWelcome();

    createAndSendToken(newUser,201,res )
    
})

exports.login = catchAsync(async (req,res,next)=>{
    const { email, password} = req.body;
 // console.log(req.body)
    //1) Check if email and password exist
    if(!email || !password){
        return next(new AppError('Please provide correct email and password',400))
    }

    //2) Check if email and password are correct 
    const user = await User.findOne({ email }).select('+password')
    if(!user || !(await user.correctPassword(password,user.password))){
        return next(new AppError('Incorrect email or password',401))
    }
    //3) IF everything is okay, send token to client
    createAndSendToken(user,200,res)
})


exports.logout = (req,res) =>{
  res.cookie('jwt', 'loggedout',{
    expires:new Date(Date.now() + 10 * 1000) ,
    httpOnly : true
  });
  res.status(200).json({status : 'success' })
}

exports.protect = catchAsync(async (req,res,next)=>{
 // console.log(req.cookies)
//console.log(req.headers.cookie.substring(4));
  
  //1)Getting the token and check if it exist
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
   } 
    else if (req.cookies.jwt) {
    token = req.cookies.jwt;
   // console.log(`token is :${token}`)
  }

if(!token){
    return next(new AppError('You are not loggend in,Please log in to get access',401))
}
//2) Verification token
const decoded = await promisify(jwt.verify)(token,process.env.JWT_SECRET)
//console.log(decoded)

//3) Check if the user still exist
const currentUser = await User.findById(decoded.id)
if(!currentUser){
    return next(new AppError('The user belonging to this token doesnt exist anymore',401))
}

//console.log(currentUser)

//4) Check if user changed the password after the token is issued
if(currentUser.changedPasswordAfter( decoded.iat )){
    return next(new AppError('User recently changed password! Please login again',401))
}

//GRANT ACCESS TO THE PROTECTED ROUTE
req.user = currentUser;
res.locals.user = currentUser;
next()
})

// Only for rendered pages, no errors!
exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // 1) verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // 2) Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // 3) Check if user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      // THERE IS A LOGGED IN USER
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};


exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    //  console.log(req.user)
    //roles ['moderator']
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }

    next();
  };
};


exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1) GET USER BASED ON GIVEN EMAIL
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError("There is no user with the given email id", 404));
  }
  //2) GENERATE TOKEN
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  //3) SEND IT TO USER EMAIL
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your passwsord? Submit a patch request with a new password and passwordConfirm to ${resetURL}.\n
    if you didnt forgot your password, please ignore this email`;

  try {
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;
    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!'
    });
  } catch (err) {
    (user.passwordResetToken = undefined),
      (user.passwordResetExpires = undefined),
      await user.save({ validateBeforeSave: false });

    return next(new AppError("There was an error sending email", 500));
  }
});




exports.resetPassword = catchAsync(async (req, res, next) => {
  //1)GET USER BASED ON THE TOKEN
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  //2) IF THE TOKEN HAS NOT EXPIRED, AND THERE IS USER SET THE NEW PASSWORD
  if (!user) {
    return next(new AppError("Token is invalid or has expired", 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  //3)uPDATE CHANGE PASSWORD AT

  //4) Login user, send JWT
  createAndSendToken(user, 200, res);
});

exports.updatePassword = catchAsync (async(req,res,next) =>{
    //1) GEt user from collection
    const user =await  User.findById(req.user.id).select('+password');

    //2) Check if posted currengt passwrd is correct 
    if(!(await user.correctPassword(req.body.passwordCurrent,user.password))){
        return next(new AppError('Your current password is wrong',401))
    }

    //3) If so update the password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    //User.findIdAndUpdate will not work as intended

    //4) Log user in, send JWT
    createAndSendToken(user,200,res )
})