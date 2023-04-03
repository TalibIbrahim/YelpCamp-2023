const mongoose = require('mongoose');
const axios = require('axios');
// '..' Because we need to back out one directory to access the models
const Campground = require('../models/campground');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');

main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');
  console.log('Connection Open!');

  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}

// ================================================================

// FUNCTION FOR ITERATING OVER THE ARRAY IN CITIES.JS:

const sample = (array) => array[Math.floor(Math.random() * array.length)];

// ================================================================

// FUNCTION FOR ADDING ITEMS IN OUR DATABASE:

const seedDB = async () => {
  // THIS MAKES ONLY 50 NEW CAMPGROUNDS FOR NOW:

  // FOR DELETING ALL:

  await Campground.deleteMany({});
  for (let i = 0; i < 50; i++) {
    // A RANDOM NUMBER BETWEEN 0 AND 1000 TO SELECT A CITY AND STATE:

    const random = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20) + 10;

    // CODE FOR WORKING WITH UNSPLASH AND ACCCESS KEYS:
    const res = await axios.get(
      'https://api.unsplash.com/photos/random?client_id=M8KduPngVr5V4DkB3g_bjhpfkEVY4j3nXthPhgrSpDo&collections=9046579'
    );
    const imageURL = res.data.urls.small;

    const camp = new Campground({
      author: '6411bfcccf17fc65d87e08b0',
      location: `${cities[random].city}, ${cities[random].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
      // USING SHORTHAND PROPERTIES FOR PRICE AND IMAGE:
      price,
      geometry: {
        type: 'Point',
        coordinates: [cities[random].longitude, cities[random].latitude],
      },
      images: [
        {
          url: imageURL,
          filename: `YelpCamp/image${i}`,
        },
      ],
    });
    await camp.save();
  }
  console.log('Saved new campgrounds...');
};

// CLOSING CONNECTION AFTER ADDING EVERYTHING:
seedDB().then(() => {
  mongoose.connection.close();
});

// ================================================================
