const Router = require("express");
const router = new Router();
const flightController = require("../controllers/flightController");

// Публичные маршруты
router.get("/search", flightController.searchFlights);
router.get("/", flightController.getAllFlights);
router.get("/:id", flightController.getFlightById);

// Админские маршруты (позже добавим middleware для проверки прав)
router.post("/", flightController.createFlight);
router.put("/:id", flightController.updateFlight);
router.delete("/:id", flightController.deleteFlight);

module.exports = router;