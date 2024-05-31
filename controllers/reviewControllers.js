const CampGround = require("../models/campground");
const Review = require("../models/review");

module.exports.createReview = async (req, res, next) => {
    const { camp_id } = req.params;
    const campground = await CampGround.findById(camp_id);

    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);

    await review.save();
    await campground.save();
    req.flash("success", "Successfully shared your Review")
    res.redirect(`/campgrounds/${camp_id}`)
}

module.exports.deleteReview = async (req, res, next) => {
    const { camp_id, rev_id } = req.params;
    const campground = await CampGround.findById(camp_id);
    campground.reviews = campground.reviews.filter(id => id !== rev_id);
    await Review.findByIdAndDelete(rev_id);
    await campground.save();
    req.flash("info", "Review Deleted")
    res.redirect(`/campgrounds/${camp_id}`)
}