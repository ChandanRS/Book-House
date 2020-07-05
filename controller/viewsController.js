const catchAsync = require('./../utils/catchAsync')
const Book = require('./../models/bookModel')
const AppError = require('./../utils/appError')
const User = require('../models/userModel')
const Booking = require('../models/bookingModel');

exports.getBook = catchAsync(async(req,res,next)=>{ 
//     const book = await Book.findOne({slug:req.params.slug}).populate({
//     path: 'reviews',
//     fields: 'name review rating user'
// })

const book = await Book.findOne({slug:req.params.slug}).populate({
        path: 'reviews',
        fields: 'name review rating user'
    })


    if (!book) {
        return next(new AppError('There is no book with that name.', 404));
    }
//console.log(reviews)
    res.status(200).render('book',{
        title: `${book.name}`,
        book
    })
})

exports.getOverView = catchAsync(async(req,res,next)=>{
    //1 get book data from collection
    const books = await Book.find()
    //2 build template
    //3 Render data from template from 1

    res.status(200).render('overview',{
       title: "All Books",
       books
    })
})

exports.getLoginForm = catchAsync(async(req,res)=>{
    res.status(200).render('login',{
        title: 'Login to your account'
    })
})


exports.getAccount = (req, res) =>{
    res.status(200).render('account',{
        title: 'Your Account'
    })
}


exports.updateUserData = catchAsync(async (req, res, next) => {
    console.log(req.body);
    
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        name: req.body.name,
        email: req.body.email
      },
      {
        new: true,
        runValidators: true
      }
    );
  
    res.status(200).render('account', {
      title: 'Your account',
      user: updatedUser
    });
  });
  


  exports.getSignupForm = (req, res) =>{
    res.status(200).render('signup',{
        title: 'Sign Up User'
    })
}

//   exports.createUser = catchAsync(async (req, res, next) => {
//     console.log(req.body);
    
    
//         const newUser = await User.create({
//             name: req.data.name,
//             email: req.data.email,
//             // role: req.body.role,
//             password : req.data.password,
//             passwordConfirm : req.data.passwordConfirm
//         },
//         {
//         new: true,
//         runValidators: true
//         });
  
//     res.status(200).render('account', {
//       title: 'Your account',
//       user: updatedUser
//     });
//   });
  

exports.getMyBooks = catchAsync(async (req, res, next) => {
    // 1) Find all bookings
    const bookings = await Booking.find({ user: req.user.id });
  
    // 2) Find books with the returned IDs
    const bookIDs = bookings.map(el => el.book);
    const books = await Book.find({ _id: { $in: bookIDs } });
  
    res.status(200).render('overview', {
      title: 'My Books',
      books
    });
  });