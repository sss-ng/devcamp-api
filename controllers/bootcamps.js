// @desc      Get all bootcamps
// @route     GET /api/v1/bootcamps
// @access    Public
exports.getBootcamps = (req, res, next) => {
    res.status(200).json({ success: true, msg: "show all bootcamps" });
};

// @desc      Get bootcamp
// @route     GET /api/v1/bootcamp/:id
// @access    Public
exports.getBootcamp = (req, res, next) => {
    res.status(200).json({ success: true, msg: `show bootcamp ${req.params.id}` });
};

// @desc      Create new bootcamp
// @route     POST /api/v1/bootcamps/:id
// @access    Private
exports.createBootcamp = (req, res, next) => {
    res.status(200).json({ success: true, msg: `create bootcamp ${req.params.id}` });
};

// @desc      Update bootcamp
// @route     PUT /api/v1/bootcamps/:id
// @access    Private
exports.updateBootcamp = (req, res, next) => {
    res.status(200).json({ success: true, msg: `update bootcamp ${req.params.id}` });
};

// @desc      Delete bootcamp
// @route     DELETE /api/v1/bootcamps/:id
// @access    Private
exports.deleteBootcamp = (req, res, next) => {
    res.status(200).json({ success: true, msg: `delete bootcamp ${req.params.id}` });
};
