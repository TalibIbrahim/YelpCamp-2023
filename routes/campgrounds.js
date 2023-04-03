const express = require('express');
const router = express.Router();
const catchAsync = require('../utility/catchAsync');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');

// MULTER:
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

// CONTROLLER:
const campgrounds = require('../controllers/campgrounds');

// ______________________________________________

// CAMPGROUNDS PAGE: (read)

router
  .route('/')
  .get(catchAsync(campgrounds.index))
  .post(
    isLoggedIn,
    upload.array('image'),
    validateCampground,
    catchAsync(campgrounds.createCampground)
  );

// ______________________________________________

// CAMPGROUNDS CREATE PAGE: (create)

router.get('/new', isLoggedIn, campgrounds.renderNewForm);

// ______________________________________________

router
  .route('/:id')
  .get(catchAsync(campgrounds.showCampground))
  .put(
    isLoggedIn,
    isAuthor,
    upload.array('image'),
    catchAsync(campgrounds.updateCampground)
  )
  .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

// CAMPGROUNDS EDIT PAGE: (update)

router.get(
  '/:id/edit',
  isLoggedIn,
  isAuthor,
  catchAsync(campgrounds.renderEditForm)
);

// ______________________________________________

module.exports = router;
