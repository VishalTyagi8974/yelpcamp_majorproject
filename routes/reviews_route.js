const express = require("express");
const wrapAsync = require("../utils/wrapAsync");

const { isLoggedIn, authorizeReviewer } = require("../utils/authMiddlewares");
const { validateReview } = require("../utils/allValidationFunctions");
const { createReview, deleteReview } = require("../controllers/reviewControllers");

const router = express.Router({ mergeParams: true });

router.post("/", isLoggedIn, validateReview, wrapAsync(createReview));

router.delete("/:rev_id", isLoggedIn, authorizeReviewer, wrapAsync(deleteReview))

module.exports = router;