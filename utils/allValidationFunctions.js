const { campgroundJoiSchema: serverJoiValidation, reviewsJoiSchema: reviewsJoiValidation } = require("../utils/serverJoiValidation");
const AppError = require("./appError");
function validateCampGround(req, res, next) {
    const campground = req.body;
    console.log(req.body)
    const { error } = serverJoiValidation.validate(campground);
    if (error) {
        const msg = error.details.map(e => e.message).join(", ");
        throw new AppError(msg, 400);
    } else {
        next();
    }
}

function validateReview(req, res, next) {
    const { error } = reviewsJoiValidation.validate(req.body);
    if (error) {
        const msg = error.details.map(e => e.message).join(", ");
        throw new AppError(msg, 400);
    } else {
        next();
    }
}

module.exports = { validateCampGround, validateReview };