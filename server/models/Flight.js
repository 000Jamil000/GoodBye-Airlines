const mongoose = require("mongoose");

const FlightSchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      required: false, // Можно изменить на true, если требуется
    },
    departureCity: {
      type: String,
      required: true,
    },
    arrivalCity: {
      type: String,
      required: true,
    },
    departureDate: {
      type: Date,
      required: true,
    },
    departureTime: {
      type: String,
      required: true,
    },
    arrivalDate: {
      type: Date,
      required: true,
    },
    arrivalTime: {
      type: String,
      required: true,
    },
    flightNumber: {
      type: String,
      required: true,
    },
    serviceClass: {
      type: String,
      enum: ["Economy", "Business", "First"],
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    totalSeats: {
      type: Number,
      required: true,
      default: 100,
    },
    availableSeats: {
      type: Number,
      required: true,
      default: 100,
    },
    airline: {
      type: String,
      required: true,
      default: "GoodBye Airlines",
    },
    aircraft: {
      type: String,
      required: true,
      default: "Boeing 737",
    },
  },
  {
    timestamps: true,
  }
);

const Flight = mongoose.model("Flight", FlightSchema);
module.exports = Flight;
