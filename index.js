const express = require("express");
const mongoose = require("mongoose");
const userRoutes = require("./server/routes/UserRouter");
const flightRoutes = require("./server/routes/flightRoutes");
const bookingRoutes = require("./server/routes/bookingRoutes");
const path = require("path");

const PORT = process.env.PORT || 5000;

const app = express();

app.use(express.json());

// API маршруты
app.use("/api/users", userRoutes);
app.use("/api/flights", flightRoutes);
app.use("/api/bookings", bookingRoutes);

app.use(express.static(path.join("client")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "HTML", "index.html"));
});

async function start() {
  try {
    await mongoose.connect("mongodb://localhost:27017/GoodBye");
    console.log("Успешно подключено к MongoDB");
  } catch (err) {
    console.warn("MongoDB недоступен, используем мок-данные:", err.message);
  }
  
  // Запускаем сервер в любом случае
  app.listen(PORT, () => {
    console.log(`Сервер запустился на ${PORT} порту`);
    console.log(`Главная страница: http://localhost:${PORT}`);
    console.log(`API: http://localhost:${PORT}/api/flights`);
  });
}

start();
