const ErrorResponse = require("../utils/errorResponse");
const Bootcamp = require("../models/Bootcamp");

const asyncHandler = require("../middleware/async");
const geocoder = require("../utils/geocoder");
const path = require("path");
const advancedResults = require("../middleware/advancedResult");

// @desc      Get all bootcamps
// @route     GET /api/v1/bootcamps
// @access    Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults);
});

// @desc      Get bootcamp
// @route     GET /api/v1/bootcamp/:id
// @access    Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);
    if (bootcamp) {
        res.status(200).json({ success: true, data: bootcamp });
    } else {
        next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
    }
});

// @desc      Create new bootcamp
// @route     POST /api/v1/bootcamps/
// @access    Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
    // add user to req.body
    req.body.user = req.user.id;

    // check for published bootcamp
    const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id });

    // if the user is not an admin, they can only add one bootcamp
    if (publishedBootcamp && req.user.role !== "admin") {
        return next(new ErrorResponse(`The user with ID ${req.user.id} has already published a bootcamp`, 400));
    }
    const bootcamp = await Bootcamp.create(req.body);

    res.status(201).json({
        success: true,
        data: bootcamp,
    });
});

// @desc      Update bootcamp
// @route     PUT /api/v1/bootcamps/:id
// @access    Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });
    if (bootcamp) {
        res.status(200).json({ success: true, data: bootcamp });
    } else {
        next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
    }
});

// @desc      Delete bootcamp
// @route     DELETE /api/v1/bootcamps/:id
// @access    Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);
    if (bootcamp) {
        res.status(200).json({ success: true, data: bootcamp });
    } else {
        next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
    }
    bootcamp.remove();
});

// @desc      Get bootcamps within a radius
// @route     Get /api/v1/bootcamps/radius/:zipcode/:distance
// @access    Private
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
    const { zipcode, distance } = req.params;

    const loc = await geocoder.geocode(zipcode);
    const lat = loc[0].latitude;
    const long = loc[0].longitude;

    const radius = distance / 3698; // radius is defined in radians

    const bootcamps = await Bootcamp.find({
        location: { $geoWithin: { $centerSphere: [[long, lat], radius] } },
    });

    res.status(200).json({
        success: true,
        count: bootcamps.length,
        data: bootcamps,
    });
});

// @desc      Upload bootcamp
// @route     Put /api/v1/bootcamps/:id/photo
// @access    Private
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);
    if (bootcamp) {
        // check if a file is uploaded
        if (!req.files) {
            next(new ErrorResponse(`Please upload a file`, 400));
        }
        const file = req.files.file;

        // check filetype
        if (!file.mimetype.startsWith("image")) {
            next(new ErrorResponse(`Please upload an image file`, 400));
        }

        // check filesize
        if (file.size > process.env.MAX_FILE_UPLOAD) {
            next(new ErrorResponse(`Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`, 400));
        }

        file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

        // rename file
        file.mv(`${process.FILE_UPLOAD_PATH}`, async (err) => {
            if (err) {
                console.log(err);
                next(new ErrorResponse(`Problem with file upload`, 500));
                return;
            }
            await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });
        });

        res.status(200).json({ success: true, data: file.name });
    } else {
        next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
    }
});
