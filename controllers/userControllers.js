const User = require("../models/user");

module.exports.registerForm = (req, res) => {
    res.render("users/register");
}

module.exports.registerUser = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, (err) => {
            if (err) return next(err)
            req.flash("success", "Welcome to YelpCamp");
            res.redirect("/");
        })
    }
    catch (e) {
        req.flash("error", e.message);
        return res.redirect("/register");
    }
}

module.exports.loginForm = (req, res) => {
    res.render("users/login");
}

module.exports.loginUser = (req, res) => {
    const returnTo = res.locals.returnTo || "/campgrounds";
    req.flash("success", "Welcome Back")
    res.redirect(`${returnTo}`);
}

module.exports.logoutUser = (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('info', 'Logged Out');
        res.redirect('/');
    });
}

module.exports.userPage = (req, res) => {
    res.render("users/user");
}