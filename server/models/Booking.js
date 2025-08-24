const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      required: false, // Можно изменить на true, если требуется
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    flightId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Flight",
      required: true,
    },
    bookingDateTime: {
      type: Date,
      default: Date.now,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Cancelled"],
      default: "Pending",
      required: true,
    },
    passengers: [{
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      passportNumber: { type: String, required: true },
      dateOfBirth: { type: Date, required: true },
      nationality: { type: String, required: true }
    }],
    totalPrice: {
      type: Number,
      required: true,
    },
    seatNumbers: [{
      type: String,
      required: true,
    }],
    tickets: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket"
    }],
    paymentInfo: {
      cardNumber: String,
      expiryDate: String,
      cvv: String,
      cardHolderName: String
    },
    paymentDate: Date,
    cancelDate: Date,
  },
  {
    timestamps: true,
  }
);

const Booking = mongoose.model("Booking", BookingSchema);
module.exports = Booking;
