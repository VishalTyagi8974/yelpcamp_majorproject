const CampGround = require("../models/campground");
const Review = require("../models/review");

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash("error", "Login or Registeration required.")
        return res.redirect("/login");
    }
    return next();
}


module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    return next();
}

module.exports.authorize = async (req, res, next) => {
    const { id } = req.params;
    const campground = await CampGround.findById(id);
    if (!campground || !campground.owner.equals(req.user._id)) {
        req.flash("error", "Dont have Permission to do this");
        return res.redirect(`/campgrounds/${id}`);
    }
    return next();
}

module.exports.authorizeReviewer = async (req, res, next) => {
    const { camp_id, rev_id } = req.params;
    const review = await Review.findById(rev_id);
    if (!review || !review.author.equals(req.user._id)) {
        req.flash("error", "Dont have Permission to do this");
        return res.redirect(`/campgrounds/${camp_id}`);
    }
    return next();
}

