const express = require("express");
const { protect } = require("../middleware/auth");
const { 
    register, 
    login, 
    getMe, 
    forgotPassword, 
    resetPassword, 
    updateDetails,
    updatePassword,
    logout
} = require("../controllers/auth");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);
router.get("/me", protect, getMe);
router.post("/forgotpassword", forgotPassword);
router.put("/resetpassword", resetPassword);
router.put('/updatedetails', protect, updateDetails)
router.put('/updatepassword', protect, updatePassword)

module.exports = router;
