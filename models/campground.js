const mongoose = require("mongoose");
const Review = require("./review");

const imageSchema = new mongoose.Schema({
    url: String,
    filename: String,
})

imageSchema.virtual("thumbnail").get(function () {
    return this.url.replace("/upload", "/upload/w_250");
})

const campGroundSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    images: [imageSchema],

    price: {
        type: Number,
        required: true,
        min: 0

    },
    description: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    geometry: {
        type: {
            type: String,
            enum: ["Point"],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    owner: {
        required: true,
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review"
    }]

})

campGroundSchema.post("findOneAndDelete", async (campground) => {
    if (campground) {
        const deleted = await Review.deleteMany({
            _id: { $in: campground.reviews }
        })
        console.log(deleted);
    }
    // if (campground.reviews.length) {
    //     for (let rev_id of campground.reviews) {
    //         await Review.findByIdAndDelete(rev_id);
    //     }
    // }

})
const CampGround = mongoose.model("Campground", campGroundSchema);

module.exports = CampGround;
