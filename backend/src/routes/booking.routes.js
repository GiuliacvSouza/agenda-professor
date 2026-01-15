const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/booking.controller");
const authMiddleware = require("../../middlewares/auth.verificate");

router.post("/", authMiddleware, bookingController.createBooking);
router.get("/", authMiddleware, bookingController.getBookings);
router.get("/teacher/:teacherId", authMiddleware, bookingController.getBookingsByTeacher);
router.put("/:id/status", authMiddleware, bookingController.updateBookingStatus);
router.delete("/:id", authMiddleware, bookingController.deleteBooking);

module.exports = router;