const Router = require("express");
const router = new Router();
const bookingController = require("../controllers/bookingController");

// Создать бронирование
router.post("/", bookingController.createBooking);

// Получить бронирования пользователя
router.get("/user/:userId", bookingController.getUserBookings);

// Получить бронирование по ID
router.get("/:id", bookingController.getBookingById);

// Подтвердить бронирование (оплата)
router.patch("/:id/confirm", bookingController.confirmBooking);

// Отменить бронирование
router.patch("/:id/cancel", bookingController.cancelBooking);

// Получить все бронирования (для админа)
router.get("/", bookingController.getAllBookings);

module.exports = router;