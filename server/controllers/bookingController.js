const Booking = require("../models/Booking");
const Flight = require("../models/Flight");
const Ticket = require("../models/Ticket");

class BookingController {
  // Создать бронирование
  async createBooking(req, res) {
    try {
      const { userId, flightId, passengers, seatNumbers } = req.body;

      // Проверяем существование рейса
      const flight = await Flight.findById(flightId);
      if (!flight) {
        return res.status(404).json({ error: "Рейс не найден" });
      }

      // Проверяем доступность мест
      if (flight.availableSeats < passengers.length) {
        return res.status(400).json({ 
          error: "Недостаточно свободных мест на рейсе" 
        });
      }

      // Создаем бронирование
      const booking = await Booking.create({
        userId,
        flightId,
        passengers,
        totalPrice: flight.price * passengers.length,
        seatNumbers,
        status: "Pending"
      });

      // Уменьшаем количество доступных мест
      await Flight.findByIdAndUpdate(flightId, {
        $inc: { availableSeats: -passengers.length }
      });

      // Создаем билеты для каждого пассажира
      const tickets = [];
      for (let i = 0; i < passengers.length; i++) {
        const ticket = await Ticket.create({
          flightId,
          userId,
          bookingId: booking._id,
          passengerInfo: passengers[i],
          seatNumber: seatNumbers[i],
          price: flight.price,
          status: "Booked"
        });
        tickets.push(ticket);
      }

      // Обновляем бронирование со списком билетов
      await Booking.findByIdAndUpdate(booking._id, {
        tickets: tickets.map(t => t._id)
      });

      const populatedBooking = await Booking.findById(booking._id)
        .populate('flightId')
        .populate('tickets');

      return res.status(201).json(populatedBooking);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Получить все бронирования пользователя
  async getUserBookings(req, res) {
    try {
      const { userId } = req.params;
      
      const bookings = await Booking.find({ userId })
        .populate('flightId')
        .populate('tickets')
        .sort({ createdAt: -1 });

      return res.json(bookings);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Получить бронирование по ID
  async getBookingById(req, res) {
    try {
      const { id } = req.params;
      
      const booking = await Booking.findById(id)
        .populate('flightId')
        .populate('tickets');

      if (!booking) {
        return res.status(404).json({ error: "Бронирование не найдено" });
      }

      return res.json(booking);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Подтвердить бронирование (оплата)
  async confirmBooking(req, res) {
    try {
      const { id } = req.params;
      const { paymentInfo } = req.body;

      const booking = await Booking.findById(id);
      if (!booking) {
        return res.status(404).json({ error: "Бронирование не найдено" });
      }

      if (booking.status !== "Pending") {
        return res.status(400).json({ 
          error: "Бронирование уже обработано" 
        });
      }

      // Обновляем статус бронирования
      await Booking.findByIdAndUpdate(id, {
        status: "Confirmed",
        paymentInfo,
        paymentDate: new Date()
      });

      // Обновляем статус билетов
      await Ticket.updateMany(
        { bookingId: id },
        { status: "Bought" }
      );

      const updatedBooking = await Booking.findById(id)
        .populate('flightId')
        .populate('tickets');

      return res.json(updatedBooking);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Отменить бронирование
  async cancelBooking(req, res) {
    try {
      const { id } = req.params;

      const booking = await Booking.findById(id).populate('flightId');
      if (!booking) {
        return res.status(404).json({ error: "Бронирование не найдено" });
      }

      if (booking.status === "Cancelled") {
        return res.status(400).json({ 
          error: "Бронирование уже отменено" 
        });
      }

      // Возвращаем места на рейс
      const ticketCount = booking.tickets ? booking.tickets.length : booking.passengers.length;
      await Flight.findByIdAndUpdate(booking.flightId._id, {
        $inc: { availableSeats: ticketCount }
      });

      // Обновляем статус бронирования
      await Booking.findByIdAndUpdate(id, {
        status: "Cancelled",
        cancelDate: new Date()
      });

      // Обновляем статус билетов
      await Ticket.updateMany(
        { bookingId: id },
        { status: "Cancelled" }
      );

      const updatedBooking = await Booking.findById(id)
        .populate('flightId')
        .populate('tickets');

      return res.json(updatedBooking);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Получить все бронирования (для админа)
  async getAllBookings(req, res) {
    try {
      const bookings = await Booking.find()
        .populate('flightId')
        .populate('userId', 'email')
        .populate('tickets')
        .sort({ createdAt: -1 });

      return res.json(bookings);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new BookingController();