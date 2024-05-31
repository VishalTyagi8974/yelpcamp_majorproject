const express = require("express");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { storeReturnTo } = require("../utils/authMiddlewares");
const { registerUser, loginForm, loginUser, registerForm, userPage, logoutUser } = require("../controllers/userControllers");

const router = express.Router();

router.route("/register")
    .get(registerForm)
    .post(wrapAsync(registerUser));

router.route("/login")
    .get(loginForm)
    .post(storeReturnTo, passport.authenticate("local", { failureFlash: true, failureRedirect: "/login" }), loginUser);

router.get('/logout', logoutUser);

router.get("/users/:id", userPage);

// Google OAuth Routes
router.get('/auth/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

router.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        req.flash("success", "Welcome Back");
        res.redirect('/');
    });

module.exports = router;

