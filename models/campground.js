const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review');

const ImageSchema = new Schema({
  url: String,
  filename: String,
});

ImageSchema.virtual('thumbnail').get(function () {
  return this.url.replace('/upload', '/upload/w_200');
});

const opts = { toJSON: { virtuals: true } };

const campgroundSchema = new mongoose.Schema(
  {
    title: String,
    images: [ImageSchema],
    geometry: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    price: Number,
    description: String,
    location: String,
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Review',
      },
    ],
  },
  opts
);

campgroundSchema.virtual('properties.popUpMarkup').get(function () {
  return `<strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>
  <p>${this.location}</p>
  <p>$${this.price}/ night</p>`;
});

// POST-DELETION MIDDLEWARE:

campgroundSchema.post('findOneAndDelete', async function (doc) {
  console.log(doc);
  if (doc) {
    // Deletes by getting the id in the reviews property of the document.
    await Review.deleteMany({
      _id: {
        $in: doc.reviews,
      },
    });
    console.log('Deleted All Reviews Of The Campground');
  }
});

const Campground = mongoose.model('Campground', campgroundSchema);

module.exports = Campground;
