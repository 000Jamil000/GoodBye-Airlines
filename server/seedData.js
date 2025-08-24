const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Flight = require("./models/Flight");
const User = require("./models/User");

const seedData = async () => {
  try {
    // Подключаемся к базе данных
    await mongoose.connect("mongodb://localhost:27017/GoodBye");
    console.log("Подключено к MongoDB");

    // Очищаем существующие данные
    await Flight.deleteMany({});
    await User.deleteMany({});
    console.log("Очистили старые данные");

    // Создаем администратора
    const hashedAdminPassword = await bcrypt.hash("admin123", 10);
    const adminUser = await User.create({
      email: "admin@goodbye.com",
      password: hashedAdminPassword,
      firstName: "Администратор",
      lastName: "Системы",
      role: "ADMIN"
    });

    // Создаем тестового пользователя
    const hashedUserPassword = await bcrypt.hash("user123", 10);
    const testUser = await User.create({
      email: "user@test.com",
      password: hashedUserPassword,
      firstName: "Иван",
      lastName: "Петров",
      phone: "+7 (999) 123-45-67",
      role: "USER"
    });

    console.log("Создали пользователей");

    // Создаем тестовые рейсы
    const flights = [
      {
        departureCity: "Казань",
        arrivalCity: "Москва",
        departureDate: new Date("2024-12-25"),
        departureTime: "08:30",
        arrivalDate: new Date("2024-12-25"),
        arrivalTime: "10:15",
        flightNumber: "GB-101",
        serviceClass: "Economy",
        price: 8500,
        totalSeats: 150,
        availableSeats: 120,
        airline: "GoodBye Airlines",
        aircraft: "Boeing 737"
      },
      {
        departureCity: "Москва",
        arrivalCity: "Казань",
        departureDate: new Date("2024-12-25"),
        departureTime: "14:20",
        arrivalDate: new Date("2024-12-25"),
        arrivalTime: "16:05",
        flightNumber: "GB-102",
        serviceClass: "Economy",
        price: 8500,
        totalSeats: 150,
        availableSeats: 135,
        airline: "GoodBye Airlines",
        aircraft: "Boeing 737"
      },
      {
        departureCity: "Казань",
        arrivalCity: "Санкт-Петербург",
        departureDate: new Date("2024-12-26"),
        departureTime: "11:45",
        arrivalDate: new Date("2024-12-26"),
        arrivalTime: "13:30",
        flightNumber: "GB-201",
        serviceClass: "Economy",
        price: 12000,
        totalSeats: 180,
        availableSeats: 165,
        airline: "GoodBye Airlines",
        aircraft: "Airbus A320"
      },
      {
        departureCity: "Санкт-Петербург",
        arrivalCity: "Казань",
        departureDate: new Date("2024-12-26"),
        departureTime: "18:15",
        arrivalDate: new Date("2024-12-26"),
        arrivalTime: "20:00",
        flightNumber: "GB-202",
        serviceClass: "Economy",
        price: 12000,
        totalSeats: 180,
        availableSeats: 170,
        airline: "GoodBye Airlines",
        aircraft: "Airbus A320"
      },
      {
        departureCity: "Казань",
        arrivalCity: "Сочи",
        departureDate: new Date("2024-12-27"),
        departureTime: "07:00",
        arrivalDate: new Date("2024-12-27"),
        arrivalTime: "09:30",
        flightNumber: "GB-301",
        serviceClass: "Economy",
        price: 15000,
        totalSeats: 200,
        availableSeats: 185,
        airline: "GoodBye Airlines",
        aircraft: "Boeing 757"
      },
      {
        departureCity: "Сочи",
        arrivalCity: "Казань",
        departureDate: new Date("2024-12-27"),
        departureTime: "16:30",
        arrivalDate: new Date("2024-12-27"),
        arrivalTime: "19:00",
        flightNumber: "GB-302",
        serviceClass: "Economy",
        price: 15000,
        totalSeats: 200,
        availableSeats: 190,
        airline: "GoodBye Airlines",
        aircraft: "Boeing 757"
      },
      {
        departureCity: "Москва",
        arrivalCity: "Санкт-Петербург",
        departureDate: new Date("2024-12-28"),
        departureTime: "09:15",
        arrivalDate: new Date("2024-12-28"),
        arrivalTime: "10:45",
        flightNumber: "GB-401",
        serviceClass: "Business",
        price: 25000,
        totalSeats: 120,
        availableSeats: 100,
        airline: "GoodBye Airlines",
        aircraft: "Boeing 737"
      },
      {
        departureCity: "Санкт-Петербург",
        arrivalCity: "Москва",
        departureDate: new Date("2024-12-28"),
        departureTime: "20:45",
        arrivalDate: new Date("2024-12-28"),
        arrivalTime: "22:15",
        flightNumber: "GB-402",
        serviceClass: "Business",
        price: 25000,
        totalSeats: 120,
        availableSeats: 110,
        airline: "GoodBye Airlines",
        aircraft: "Boeing 737"
      },
      {
        departureCity: "Казань",
        arrivalCity: "Екатеринбург",
        departureDate: new Date("2024-12-29"),
        departureTime: "13:20",
        arrivalDate: new Date("2024-12-29"),
        arrivalTime: "15:45",
        flightNumber: "GB-501",
        serviceClass: "Economy",
        price: 9500,
        totalSeats: 160,
        availableSeats: 145,
        airline: "GoodBye Airlines",
        aircraft: "Airbus A319"
      },
      {
        departureCity: "Екатеринбург",
        arrivalCity: "Казань",
        departureDate: new Date("2024-12-29"),
        departureTime: "19:30",
        arrivalDate: new Date("2024-12-29"),
        arrivalTime: "21:55",
        flightNumber: "GB-502",
        serviceClass: "Economy",
        price: 9500,
        totalSeats: 160,
        availableSeats: 155,
        airline: "GoodBye Airlines",
        aircraft: "Airbus A319"
      }
    ];

    await Flight.insertMany(flights);
    console.log("Создали тестовые рейсы");

    console.log("\n=== ТЕСТОВЫЕ ДАННЫЕ СОЗДАНЫ ===");
    console.log("Администратор:");
    console.log("Email: admin@goodbye.com");
    console.log("Пароль: admin123");
    console.log("\nТестовый пользователь:");
    console.log("Email: user@test.com");
    console.log("Пароль: user123");
    console.log(`\nСоздано ${flights.length} тестовых рейсов`);

    process.exit(0);
  } catch (error) {
    console.error("Ошибка при создании тестовых данных:", error);
    process.exit(1);
  }
};

seedData();