const CampGround = require("../models/campground");
const AppError = require("../utils/appError");
const { cloudinary } = require("../cloudinary/index");
const axios = require('axios');


module.exports.index = async (req, res, next) => {
    const campgrounds = await CampGround.find({})
    res.render("./campgrounds/index", { campgrounds });
}

module.exports.newform = (req, res) => {
    res.render("./campgrounds/create");
}

module.exports.create = async (req, res, next) => {
    const campground = req.body
    campground.images = req.files.map(f => ({ filename: f.filename, url: f.path }))
    console.log(campground.images);
    const newCampGround = new CampGround(campground);
    newCampGround.owner = req.user._id;
    const locationCords = await axios.get(`https://api.geoapify.com/v1/geocode/search?text=${req.body.location}&apiKey=${process.env.GEO_API_KEY}`)
    if (locationCords.data.features.length === 0) {
        throw new AppError("Location Not Found", 404);
    }
    const { features: [{ geometry }] } = locationCords.data;
    newCampGround.geometry = geometry;
    await newCampGround.save();
    req.flash("success", "Successfully registered a new CampGround")
    res.redirect(`/campgrounds/${newCampGround._id}`);
}
module.exports.show = async (req, res, next) => {
    const { id } = req.params;
    const campground = await CampGround.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author"
            }
        })
        .populate("owner");
    if (!campground) {
        throw new AppError("cant find the campGround", 404)
    }
    res.render("./campgrounds/show", { campground });
}

module.exports.update = async (req, res, next) => {
    const { id } = req.params;
    const locationCords = await axios.get(`https://api.geoapify.com/v1/geocode/search?text=${req.body.location}&apiKey=${process.env.GEO_API_KEY}`)
    if (locationCords.data.features.length === 0) {
        throw new AppError("Location Not Found", 404);
    }
    const { features: [{ geometry }] } = locationCords.data;
    const campground = await CampGround.findByIdAndUpdate(id, req.body, { runValidators: true });
    campground.geometry = geometry;
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.images.push(...imgs);
    campground.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash("info", "Successfully Updated the CampGround")
    res.redirect(`/campgrounds/${id}`);
}

module.exports.editForm = async (req, res, next) => {
    const { id } = req.params;
    const campground = await CampGround.findById(id);
    if (!campground) {
        throw new AppError("cant find the campGround", 404)
    }
    res.render("./campgrounds/edit", { campground });
}
module.exports.deleteCamp = async (req, res, next) => {
    const { id } = req.params;
    await CampGround.findByIdAndDelete(id);
    req.flash("info", "CampGround Deleted")
    res.redirect("/campgrounds")
}