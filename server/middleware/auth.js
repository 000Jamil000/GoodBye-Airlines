const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Middleware для проверки аутентификации
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: "Токен не предоставлен" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Проверяем, что пользователь еще существует
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({ error: "Пользователь не найден" });
    }

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role
    };
    
    next();
  } catch (error) {
    return res.status(403).json({ error: "Недействительный токен" });
  }
};

// Middleware для проверки роли пользователя
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Необходима аутентификация" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Недостаточно прав доступа" });
    }

    next();
  };
};

// Middleware для проверки прав администратора
const requireAdmin = requireRole(["ADMIN"]);

// Middleware для проверки прав менеджера или администратора
const requireManager = requireRole(["ADMIN", "MANAGER"]);

module.exports = {
  authenticateToken,
  requireRole,
  requireAdmin,
  requireManager
};