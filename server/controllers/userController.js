const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

class UserController {
  // Регистрация пользователя
  async register(req, res) {
    try {
      const { email, password, firstName, lastName, role } = req.body;

      // Проверяем, существует ли пользователь
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: "Пользователь с таким email уже существует" });
      }

      // Хешируем пароль
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Создаем пользователя
      const user = await User.create({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: role || "USER",
      });

      // Создаем JWT токен
      const token = jwt.sign(
        { userId: user._id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      // Убираем пароль из ответа
      const userResponse = { ...user.toObject() };
      delete userResponse.password;

      return res.status(201).json({
        message: "Пользователь успешно зарегистрирован",
        user: userResponse,
        token
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Авторизация пользователя
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Находим пользователя
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ error: "Неверный email или пароль" });
      }

      // Проверяем пароль
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: "Неверный email или пароль" });
      }

      // Создаем JWT токен
      const token = jwt.sign(
        { userId: user._id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      // Убираем пароль из ответа
      const userResponse = { ...user.toObject() };
      delete userResponse.password;

      return res.json({
        message: "Успешная авторизация",
        user: userResponse,
        token
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Получить профиль пользователя
  async getProfile(req, res) {
    try {
      const { userId } = req.user; // Из middleware аутентификации
      
      const user = await User.findById(userId).select('-password');
      if (!user) {
        return res.status(404).json({ error: "Пользователь не найден" });
      }

      return res.json(user);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Обновить профиль пользователя
  async updateProfile(req, res) {
    try {
      const { userId } = req.user;
      const { firstName, lastName, phone, dateOfBirth } = req.body;

      const user = await User.findByIdAndUpdate(
        userId,
        { firstName, lastName, phone, dateOfBirth },
        { new: true }
      ).select('-password');

      if (!user) {
        return res.status(404).json({ error: "Пользователь не найден" });
      }

      return res.json({
        message: "Профиль успешно обновлен",
        user
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Изменить пароль
  async changePassword(req, res) {
    try {
      const { userId } = req.user;
      const { currentPassword, newPassword } = req.body;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: "Пользователь не найден" });
      }

      // Проверяем текущий пароль
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return res.status(401).json({ error: "Неверный текущий пароль" });
      }

      // Хешируем новый пароль
      const saltRounds = 10;
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

      // Обновляем пароль
      await User.findByIdAndUpdate(userId, { password: hashedNewPassword });

      return res.json({ message: "Пароль успешно изменен" });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Устаревший метод для обратной совместимости
  async createUser(req, res) {
    return this.register(req, res);
  }
}

module.exports = new UserController();
