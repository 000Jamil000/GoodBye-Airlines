const Flight = require("../models/Flight");
const fs = require("fs");
const path = require("path");

// Load mock data
let mockData = null;
try {
  const mockDataPath = path.join(__dirname, "../mockData.json");
  mockData = JSON.parse(fs.readFileSync(mockDataPath, "utf8"));
} catch (error) {
  console.log("Mock data not available");
}

class FlightController {
  // Check if MongoDB is available
  async isMongoAvailable() {
    try {
      await Flight.findOne().limit(1);
      return true;
    } catch (error) {
      return false;
    }
  }

  // Получить все рейсы
  async getAllFlights(req, res) {
    try {
      const mongoAvailable = await this.isMongoAvailable();
      
      if (mongoAvailable) {
        const flights = await Flight.find();
        return res.json(flights);
      } else if (mockData) {
        return res.json(mockData.flights);
      } else {
        return res.json([]);
      }
    } catch (error) {
      // Fallback to mock data if MongoDB fails
      if (mockData) {
        return res.json(mockData.flights);
      }
      return res.status(500).json({ error: error.message });
    }
  }

  // Поиск рейсов по параметрам
  async searchFlights(req, res) {
    try {
      const { departureCity, arrivalCity, departureDate, serviceClass } = req.query;
      const mongoAvailable = await this.isMongoAvailable();
      
      if (mongoAvailable) {
        let query = {};
        
        if (departureCity) {
          query.departureCity = new RegExp(departureCity, 'i');
        }
        
        if (arrivalCity) {
          query.arrivalCity = new RegExp(arrivalCity, 'i');
        }
        
        if (departureDate) {
          const searchDate = new Date(departureDate);
          const nextDay = new Date(searchDate);
          nextDay.setDate(nextDay.getDate() + 1);
          
          query.departureDate = {
            $gte: searchDate,
            $lt: nextDay
          };
        }
        
        if (serviceClass) {
          query.serviceClass = serviceClass;
        }

        const flights = await Flight.find(query).sort({ departureDate: 1, departureTime: 1 });
        return res.json(flights);
      } else if (mockData) {
        // Filter mock data
        let flights = mockData.flights;
        
        if (departureCity) {
          flights = flights.filter(f => 
            f.departureCity.toLowerCase().includes(departureCity.toLowerCase())
          );
        }
        
        if (arrivalCity) {
          flights = flights.filter(f => 
            f.arrivalCity.toLowerCase().includes(arrivalCity.toLowerCase())
          );
        }
        
        if (departureDate) {
          const searchDate = new Date(departureDate).toDateString();
          flights = flights.filter(f => 
            new Date(f.departureDate).toDateString() === searchDate
          );
        }
        
        if (serviceClass) {
          flights = flights.filter(f => f.serviceClass === serviceClass);
        }
        
        // Sort by departure date and time
        flights.sort((a, b) => {
          const dateA = new Date(a.departureDate);
          const dateB = new Date(b.departureDate);
          if (dateA.getTime() === dateB.getTime()) {
            return a.departureTime.localeCompare(b.departureTime);
          }
          return dateA - dateB;
        });
        
        return res.json(flights);
      } else {
        return res.json([]);
      }
    } catch (error) {
      // Fallback to mock data search
      if (mockData) {
        let flights = mockData.flights;
        if (departureCity) {
          flights = flights.filter(f => 
            f.departureCity.toLowerCase().includes(departureCity.toLowerCase())
          );
        }
        if (arrivalCity) {
          flights = flights.filter(f => 
            f.arrivalCity.toLowerCase().includes(arrivalCity.toLowerCase())
          );
        }
        return res.json(flights);
      }
      return res.status(500).json({ error: error.message });
    }
  }

  // Получить рейс по ID
  async getFlightById(req, res) {
    try {
      const { id } = req.params;
      const mongoAvailable = await this.isMongoAvailable();
      
      if (mongoAvailable) {
        const flight = await Flight.findById(id);
        
        if (!flight) {
          return res.status(404).json({ error: "Рейс не найден" });
        }
        
        return res.json(flight);
      } else if (mockData) {
        const flight = mockData.flights.find(f => f._id === id);
        
        if (!flight) {
          return res.status(404).json({ error: "Рейс не найден" });
        }
        
        return res.json(flight);
      } else {
        return res.status(404).json({ error: "Рейс не найден" });
      }
    } catch (error) {
      // Fallback to mock data
      if (mockData) {
        const flight = mockData.flights.find(f => f._id === req.params.id);
        if (flight) {
          return res.json(flight);
        }
      }
      return res.status(500).json({ error: error.message });
    }
  }

  // Создать новый рейс (для админа)
  async createFlight(req, res) {
    try {
      const {
        departureCity,
        arrivalCity,
        departureDate,
        departureTime,
        arrivalDate,
        arrivalTime,
        flightNumber,
        serviceClass,
        price,
        totalSeats,
        availableSeats
      } = req.body;

      const flight = await Flight.create({
        departureCity,
        arrivalCity,
        departureDate,
        departureTime,
        arrivalDate,
        arrivalTime,
        flightNumber,
        serviceClass,
        price,
        totalSeats,
        availableSeats
      });

      return res.status(201).json(flight);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Обновить рейс (для админа)
  async updateFlight(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const flight = await Flight.findByIdAndUpdate(id, updateData, { new: true });
      
      if (!flight) {
        return res.status(404).json({ error: "Рейс не найден" });
      }

      return res.json(flight);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Удалить рейс (для админа)
  async deleteFlight(req, res) {
    try {
      const { id } = req.params;
      const flight = await Flight.findByIdAndDelete(id);
      
      if (!flight) {
        return res.status(404).json({ error: "Рейс не найден" });
      }

      return res.json({ message: "Рейс успешно удален" });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new FlightController();