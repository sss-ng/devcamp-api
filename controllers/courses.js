const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Course = require("../models/Course");
const Bootcamp = require("../models/Bootcamp");

// @desc         Get courses
// @route        Get /api/v1/courses
// @route        Get /api/v1/bootcamps/:bootcampId/courses
// @access       Public
exports.getCourses = asyncHandler(async (req, res, next) => {
    let query;

    if (req.params.bootcampId) {
        query = Course.find({ bootcamp: req.params.bootcampId });
    } else {
        query = Course.find().populate({
            path: "bootcamp",
            select: "name description",
        }); // find all Courses
    }

    const courses = await query;

    res.status(200).json({
        success: true,
        count: courses.length,
        data: courses,
    });
});

// @desc      Get single course
// @route     GET /api/v1/courses/:id
// @access    Public
exports.getCourse = asyncHandler(async (req, res, next) => {
    const course = await Course.findById(req.params.id).populate({
        path: "bootcamp",
        select: "name description",
    });
    if (course) {
        res.status(200).json({ success: true, data: course });
    } else {
        next(new ErrorResponse(`Course not found with id of ${req.params.id}`, 404));
    }
});

// @desc      Add course
// @route     POST /api/v1/bootcamps/:bootcampId/courses
// @access    Private
exports.addCourse = asyncHandler(async (req, res, next) => {
    req.body.bootcamp = req.params.bootcampId;

    const bootcamp = await Bootcamp.findById(req.params.bootcampId);
    if (bootcamp) {
        const course = await Course.create(req.body);
        res.status(200).json({ success: true, data: course });
    } else {
        next(new ErrorResponse(`Bootcamp not found with id of ${req.params.bootcampId}`, 404));
    }
});

// @desc      Update course
// @route     PUT /api/v1/courses/:id
// @access    Private
exports.updateCourse = asyncHandler(async (req, res, next) => {
    let course = await Course.findById(req.params.id);

    if (course) {
        course = await Course.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        res.status(200).json({ success: true, data: course });
    } else {
        next(new ErrorResponse(`Course not found with id of ${req.params.id}`, 404));
    }
});

// @desc      Delete course
// @route     DELETE /api/v1/courses/:id
// @access    Private
exports.deleteCourse = asyncHandler(async (req, res, next) => {
    const course = await Course.findById(req.params.id);

    if (course) {
        await course.remove();
        res.status(200).json({ success: true, data: {} });
    } else {
        next(new ErrorResponse(`Course not found with id of ${req.params.id}`, 404));
    }
});
