const express = require('express');
const router = express.Router({ mergeParams: true });
const catchAsync = require('../utility/catchAsync');

// VALIDATION MIDDLEWARE:
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');

// REVIEWS CONTROLLER:
const reviews = require('../controllers/reviews');

// ADD REVIEW:
router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview));

// CAMPGROUNDS REVIEW DELETE:
router.delete(
  '/:reviewId',
  isLoggedIn,
  isReviewAuthor,
  catchAsync(reviews.deleteReview)
);

module.exports = router;
