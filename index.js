const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const AppError = require("./utils/appError");
const campGroundRoute = require("./routes/campgrounds_route");
const reviewsRoute = require("./routes/reviews_route");
const usersRoute = require("./routes/users_route");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");
const methodOverride = require("method-override");
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require("helmet");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const MongoStore = require('connect-mongo');


if (process.env.NODE_ENV !== "production") {
    require("dotenv").config()
}

const dbUrl = process.env.DB_URL;

mongoose.connect(dbUrl)
    .then(() => {
        console.log("connected to mongoDb");
    }).catch(e => { console.log(e) })

const app = express();

app.use(express.static(path.join(__dirname, "/public")))
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize());

app.use(methodOverride("_method"));

const secret = process.env.SECRET;
const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret
    }
});

store.on("error", function (e) {
    console.log(e);
})

const sessionConfig = {
    store,
    name: "doYourWork",
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true
    }
}
app.use(session(sessionConfig));
app.use(flash());

const scriptSrcUrls = [
    "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js",
    "https://kit.fontawesome.com",
    "https://cdnjs.cloudflare.com",
    "https://cdn.jsdelivr.net",
    "https://unpkg.com/"
];
const styleSrcUrls = [
    "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css",
    "https://getbootstrap.com/",
    "https://fonts.googleapis.com",
    "https://use.fontawesome.com",
    "https://unpkg.com/"
];
const connectSrcUrls = [
    "https://unpkg.com/"
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            childSrc: ["blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dtgebpxfb/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com",
                "https://unpkg.com/",
                "https://*.tile.openstreetmap.org/",
                "https://*.tile.osm.org/",
                "http://*.tile.osm.org/",
                "https://plus.unsplash.com/"
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/callback"
},
    async (accessToken, refreshToken, profile, done) => {
        try {
            let user = await User.findOne({ googleId: profile.id });
            if (!user) {
                user = new User({
                    username: profile.displayName,
                    email: profile.emails[0].value,
                    googleId: profile.id
                });
                await user.save();
            }
            return done(null, user);
        } catch (err) {
            return done(err, null);
        }
    }
));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.user = req.user;
    res.locals.success = req.flash("success");
    res.locals.info = req.flash("info");
    res.locals.error = req.flash("error");
    next();
})


app.get("/", (req, res) => {
    res.render("campgrounds/home")
})

app.use("/campgrounds", campGroundRoute);
app.use("/campgrounds/:camp_id/reviews", reviewsRoute);
app.use("/", usersRoute);


app.use((err, req, res, next) => {
    console.log(err);
    if (err.name == "ValidationError") {
        err = new AppError("form data cant be validated due to wrong inputs", 400);
    } else if (err.name == "CastError") {
        err = new AppError("Cant Find the CampGround", 404)
    }
    next(err)
})


app.all("*", (req, res, next) => {
    next(new AppError("Page not Found", 404))
})

app.use((err, req, res, next) => {
    const { status = 500, message = "Something Went Wrong" } = err;

    res.status(status).render("campgrounds/errors", { status, message });
})


app.listen(3000, () => {
    console.log("starts listening on  port 3000");
})
