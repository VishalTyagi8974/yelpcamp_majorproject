const express = require("express");
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn, authorize } = require("../utils/authMiddlewares");
const { validateCampGround } = require("../utils/allValidationFunctions");
const multer = require("multer");
const { storage } = require("../cloudinary");
const upload = multer({ storage });

const { index, newform, create, show, update, editForm, deleteCamp } = require("../controllers/campgroundControllers");
const router = express.Router()

router.route("/")
    .get(wrapAsync(index))
    .post(isLoggedIn, upload.array("images"), validateCampGround, wrapAsync(create));

router.get("/new", isLoggedIn, newform)

router.route("/:id")
    .get(wrapAsync(show))
    .patch(isLoggedIn, authorize, upload.array("images"), validateCampGround, wrapAsync(update))
    .delete(isLoggedIn, authorize, wrapAsync(deleteCamp));

router.get("/:id/edit", isLoggedIn, authorize, wrapAsync(editForm));

module.exports = router;