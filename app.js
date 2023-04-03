if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

// ----------------------------------------------------------------

// OUR PACKAGES:
const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const User = require('./models/user');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
// PASSPORT AUTHENTICATION AND THE STRATEGY FOR IT:
const passport = require('passport');
const LocalStrategy = require('passport-local');

// The dbUrl should be your mongoDb atlas url.
const dbUrl = process.env.DB_URL;
// 'mongodb://127.0.0.1:27017/yelp-camp'
const MongoDBStore = require('connect-mongo');
// ----------------------------------------------------------------

// ERROR CLASS AND ASYNC WRAPPER FUNCTION:
const ExpressError = require('./utility/ExpressError');

// ROUTES FOR OUR CAMPGROUND AND REVIEWS:
const campgrounds = require('./routes/campgrounds');
const reviews = require('./routes/reviews');
const users = require('./routes/users');

mongoose.set('strictQuery', true);

// SESSION CONFIGURATION AND MIDDLEWARE:
// (mongoUrl should be changed to dbUrl)
const store = MongoDBStore.create({
  mongoUrl: 'mongodb://127.0.0.1:27017/yelp-camp',
  secret: 'thisshouldbeabettersecret',
  touchAfter: 24 * 60 * 60,
});

store.on('error', function (e) {
  console.log('SESSION STORE ERROR', e);
});

const sessionConfig = {
  store,
  name: 'session',
  secret: 'thisshouldbeabettersecret',
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    // secure: true,
    // Date is in milliseconds format. Here from left to right is: ms, s, min, hours, days
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
    // Expires a week from now
  },
};

app.use(session(sessionConfig));

// FLASH PACKAGE FOR DISPLAYING MESSAGES TO USER:

app.use(flash());

// HELMET:
app.use(helmet());

const scriptSrcUrls = [
  'https://stackpath.bootstrapcdn.com/',
  'https://api.tiles.mapbox.com/',
  'https://api.mapbox.com/',
  'https://kit.fontawesome.com/',
  'https://cdnjs.cloudflare.com/',
  'https://cdn.jsdelivr.net',
];
const styleSrcUrls = [
  'https://kit-free.fontawesome.com/',
  'https://stackpath.bootstrapcdn.com/',
  'https://api.mapbox.com/',
  'https://api.tiles.mapbox.com/',
  'https://fonts.googleapis.com/',
  'https://use.fontawesome.com/',
  'https://cdn.jsdelivr.net',
];
const connectSrcUrls = [
  'https://api.mapbox.com/',
  'https://a.tiles.mapbox.com/',
  'https://b.tiles.mapbox.com/',
  'https://events.mapbox.com/',
];
const fontSrcUrls = [];
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", 'blob:'],
      objectSrc: [],
      imgSrc: [
        "'self'",
        'blob:',
        'data:',
        'https://res.cloudinary.com/dk5pnej6r/', //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
        'https://images.unsplash.com/',
      ],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  })
);

// PASSPORT:
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');

  next();
});

// ----------------------------------------------------------------

// SETS THE RENDER ENGINE TO EJS:
app.set('view engine', 'ejs');

// SETTING THE VIEWS PATH:
app.set('views', path.join(__dirname, 'views'));

// CONFIGURATION FOR THE BODY PARSER:
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// METHOD OVERRIDE PACKAGE FOR USING THE DELETE AND PUT METHOD:
app.use(methodOverride('_method'));

// SERVING STATIC FILES:
app.use(express.static(path.join(__dirname, 'public')));

// PACKAGE FOR MAKING OUR BOILERPLATE AND LAYOUTS:
app.engine('ejs', ejsMate);

// MONGO SANITIZE:
app.use(
  mongoSanitize({
    replaceWith: '_',
  })
);

main().catch((err) => console.log(err));

//MONGOOSE CONNECTION:

async function main() {
//   url should be changed to dbUrl
  await mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');
  console.log('Connection Open!');

  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}

// ______________________________________________

// OUR MIDDLEWARE : (morgan)

app.use((req, res, next) => {
  console.log(req.method, req.path);
  next();
});

// CAMPGROUNDS ROUTER:

app.use('/', users);
app.use('/campgrounds', campgrounds);
app.use('/campgrounds/:id/reviews', reviews);

// HOME PAGE:
app.get('/', (req, res) => {
  res.render('home');
});

// ______________________________________________

// ---------------(ERROR CLASS)---------------

// THIS PIECE OF CODE SHOULD BE AT THE END BECAUSE IT RUNS WHEN ANY OF THE CODE ABOVE IS NOT EXECUTED.

app.all('*', (req, res, next) => {
  next(new ExpressError(404, 'Page Not Found'));
});

// ______________________________________________

// CUSTOM ERROR HANDLER:

app.use((err, req, res, next) => {
  // IF IT IS NOT WITH THE 5XX AND 4XX RANGE, WE HAVE DEFAULT VALUES FOR IT.
  const { statusCode = 500 } = err; // 500 IS INTERNAL SERVER ERROR.
  if (!err.message) err.message = 'Oops! Something went wrong.';
  res.status(statusCode).render('error', { err });
});

// ______________________________________________

// OUR PORT:

app.listen(3000, () => {
  console.log('Listening on port 3000');
});
