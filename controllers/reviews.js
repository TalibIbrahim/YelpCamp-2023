const Campground = require('../models/campground');
const Review = require('../models/review');

module.exports.createReview = async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  const review = new Review(req.body.review);
  // Data is sent under 'review'
  review.author = req.user._id;
  campground.reviews.push(review);
  await review.save();
  await campground.save();
  req.flash('success', 'Added your review successfully.');
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteReview = async (req, res) => {
  const { id, reviewId } = req.params;
  // $PULL removes all instances in an existing array. Here, it removes the reference to the reviews.
  await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  // Now that review is not referenced, we will delete it from our database too.
  await Review.findByIdAndDelete(reviewId);
  req.flash('success', 'Removed your review.');
  res.redirect(`/campgrounds/${id}`);
};
