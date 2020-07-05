const express = require('express');
const router = express.Router({mergeParams: true})
const reviewController = require('./../controller/reviewController')
const authController = require('./../controller/authController')

router.use(authController.protect)

router
  .route("/")
  .get(reviewController.getAllReviews)
  .post(
    authController.restrictTo('user'),
    reviewController.setBookUserIds,
    reviewController.createReview
  );

router
  .route("/:id")
  .get(reviewController.getReview)
  .patch(
    authController.restrictTo("user", "moderator"),
    reviewController.updateReview
  )
  .delete(
    authController.restrictTo("user", "moderator"),
    reviewController.deleteReview
  );


module.exports = router