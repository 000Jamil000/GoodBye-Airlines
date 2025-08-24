const Router = require("express");
const router = new Router();
const userController = require("../controllers/userController");
const { authenticateToken } = require("../middleware/auth");

// Публичные маршруты
router.post("/register", userController.register);
router.post("/login", userController.login);

// Защищенные маршруты
router.get("/profile", authenticateToken, userController.getProfile);
router.put("/profile", authenticateToken, userController.updateProfile);
router.patch("/change-password", authenticateToken, userController.changePassword);

// Устаревший маршрут для обратной совместимости
router.post("/post", userController.createUser);

module.exports = router;
