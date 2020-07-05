const express = require('express');
const bookController = require('./../controller/bookController');
const authController = require('./../controller/authController')
const reviewController = require('./../controller/reviewController')
const reviewRouter = require('./reviewRoutes')

const router = express.Router();
router.param('id',(req,res,next,val)=>{
//console.log(val)
next()
})

router
  .route("/best-rated-books")
  .get(bookController.bestRatedBooks, bookController.getAllBooks);

router.route("/book-stats")
    .get(bookController.bookStats);

router
  .route("/")
  .get(bookController.getAllBooks)
  .post(authController.protect,
    authController.restrictTo('moderator','seller'),
    bookController.createBook);

    
router
  .route("/:id")
  .get(bookController.getBook)
  .patch(authController.protect,
    authController.restrictTo('moderator','seller'),
    bookController.updateBook)
  .delete(
    authController.protect,
    authController.restrictTo('moderator','seller'),
    bookController.deleteBook
  );


//Post book/bookId/reviews
//get book/bookId/reviews
//get book/bookId/reviews/reviewId


// router.route('/:bookId/reviews')
//     .post(authController.protect,
//         authController.restrictTo('user'),
//         reviewController.createReview
//     )

router.use('/:bookId/reviews',reviewRouter)

module.exports = router;