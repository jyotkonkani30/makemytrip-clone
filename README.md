# MakeMyTrip Clone - Travel Booking Platform

A full-stack travel booking platform inspired by MakeMyTrip, built with HTML, CSS, JavaScript, Node.js, and MongoDB.

## 🚀 Features

### Frontend Features
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **User Authentication**: Sign up and login with OTP verification
- **Flight Booking**: Search and book flights with interactive route mapping
- **Hotel Booking**: Browse and book hotels with detailed information
- **Train Booking**: Search and book train tickets with class selection
- **Trip Management**: View and manage all your bookings in one place
- **Interactive UI**: Modern design with smooth animations and transitions

### Backend Features
- **RESTful API**: Built with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based authentication system
- **OTP Verification**: Twilio integration for SMS OTP
- **User Management**: User-specific trip storage and management

## 🛠️ Technologies Used

### Frontend
- HTML5, CSS3, JavaScript (ES6+)
- Bootstrap 5 for responsive design
- Tailwind CSS for utility-first styling
- Leaflet.js for interactive maps
- Google Fonts (Poppins, Montserrat)

### Backend
- Node.js with Express.js
- MongoDB with Mongoose
- JWT for authentication
- Twilio for OTP services
- CORS for cross-origin requests

## 📁 Project Structure

```
e:\make my trip\Project\
├── new.html              # Homepage
├── flights.html          # Flight booking page
├── hotels.html           # Hotel booking page
├── trains.html           # Train booking page
├── trips.html            # User trips management
├── style.css             # Main stylesheet
├── script.js             # Main JavaScript file
├── b.js                  # Backend server
├── js/
│   └── user-trips.js     # User trip management utilities
├── .env                  # Environment variables (not included in repo)
├── package.json          # Node.js dependencies
└── README.md             # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- Twilio Account (for OTP functionality)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/makemytrip-clone.git
   cd makemytrip-clone
   ```

2. **Install dependencies**
   ```bash
   npm install express mongoose cors body-parser twilio jsonwebtoken dotenv
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/makemytrip
   JWT_SECRET=your_jwt_secret_key
   TWILIO_ACCOUNT_SID=your_twilio_account_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   TWILIO_PHONE_NUMBER=your_twilio_phone_number
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system.

5. **Run the application**
   ```bash
   node b.js
   ```

6. **Open in browser**
   Navigate to `http://localhost:5000`

## 🔧 Configuration

### Database Setup
The application uses MongoDB. Make sure to:
- Install MongoDB on your system
- Update the `MONGO_URI` in your `.env` file
- The application will automatically create the required database and collections

### Twilio Setup (Optional)
For OTP functionality:
1. Create a Twilio account
2. Get your Account SID, Auth Token, and Phone Number
3. Update the `.env` file with your Twilio credentials

## 📱 Usage

1. **User Registration**: Sign up with username, email, password, and mobile number
2. **OTP Verification**: Verify your mobile number with OTP
3. **Login**: Use username/password or mobile OTP login
4. **Book Flights**: Search for flights and make bookings
5. **Book Hotels**: Browse hotels and make reservations
6. **Book Trains**: Search train routes and book tickets
7. **Manage Trips**: View all your bookings in the trips section

## 🔐 Security Features

- JWT-based authentication
- Password security (consider implementing bcrypt in production)
- OTP verification for mobile numbers
- Input validation and sanitization
- CORS configuration for secure cross-origin requests

## 🚀 Deployment

### For Production Deployment:
1. Set up a production MongoDB database
2. Configure environment variables for production
3. Implement proper error handling and logging
4. Add rate limiting and security headers
5. Use HTTPS in production
6. Consider using bcrypt for password hashing

## 👥 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🐛 Known Issues

- Password storage is in plain text (implement bcrypt for production)
- Limited error handling in some areas
- Mobile responsiveness can be improved for some components

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Inspired by MakeMyTrip's user interface
- Built as a learning project to understand full-stack development
- Created by Jyot and Mahin

## 📞 Contact

For any questions or suggestions, please reach out to the development team.

---

**Note**: This is a learning project and should not be used in production without proper security implementations and testing.
