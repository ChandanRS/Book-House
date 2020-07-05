const express = require('express')
const viewsController = require('./../controller/viewsController')
const authController = require('../controller/authController')
const bookingController = require('../controller/bookingController');

const router = express.Router();

router.get('/',authController.isLoggedIn, viewsController.getOverView)
router.get('/book/:slug', authController.isLoggedIn, viewsController.getBook)
router.get('/signup', viewsController.getSignupForm) 
router.get('/login',authController.isLoggedIn, viewsController.getLoginForm) 
router.get('/me',authController.protect, viewsController.getAccount) 

router.get(
  '/my-books',
  bookingController.createBookingCheckout,
  authController.protect,
  viewsController.getMyBooks
);


router.post(
    '/submit-user-data',
    authController.protect,
    viewsController.updateUserData
  );

module.exports = router