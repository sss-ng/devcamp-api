const ErrorResponse = require("../utils/errorResponse");
const Bootcamp = require("../models/Bootcamp");

const asyncHandler = require("../middleware/async");
const geocoder = require("../utils/geocoder");

// @desc      Get all bootcamps
// @route     GET /api/v1/bootcamps
// @access    Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
    let query;
    let reqQuery = { ...req.query };

    // remove fields that we will handle manually
    let removeFields = ["select", "sort", "page", "limit"];
    removeFields.forEach((param) => delete reqQuery[param]);

    let queryStr = JSON.stringify(reqQuery);

    // add <,<=, >,>= operators, etc so mongodb understands it
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, (match) => `$${match}`);

    // find resource
    query = Bootcamp.find(JSON.parse(queryStr));

    // filter fields
    if (req.query.select) {
        const fields = req.query.select.split(",").join(" ");
        query = query.select(fields);
    }

    // sort results
    if (req.query.sort) {
        const sortBy = req.query.sort.split(",").join(" ");
        query = query.sort(sortBy);
    } else {
        query = query.sort("-createdAt");
    }

    // pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Bootcamp.countDocuments();

    console.log(startIndex, endIndex, limit);

    query = query.skip(startIndex).limit(limit);

    // execute the query
    const bootcamps = await query;

    // pagination result
    const pagination = {};

    if (endIndex < total) {
        pagination.next = {
            page: page + 1,
            limit: limit,
        };
    }

    if (startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit: limit,
        };
    }

    res.status(200).json({ success: true, count: bootcamps.length, pagination: pagination, data: bootcamps });
});

// @desc      Get bootcamp
// @route     GET /api/v1/bootcamp/:id
// @access    Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);
    if (bootcamp) {
        res.status(200).json({ success: true, data: {} });
    } else {
        next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
    }
});

// @desc      Create new bootcamp
// @route     POST /api/v1/bootcamps/
// @access    Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
    console.log(req.body);
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
    const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);
    if (bootcamp) {
        res.status(200).json({ success: true, data: bootcamp });
    } else {
        next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
    }
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
