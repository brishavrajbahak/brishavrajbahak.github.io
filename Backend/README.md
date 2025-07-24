// README.md
# Brishav Rajbahak - GTA 6 Style Portfolio Backend

A cyberpunk-inspired backend API for a futuristic portfolio website, built with Node.js, Express, and MongoDB.

## 🌆 Features

- **Authentication System**: JWT-based auth with role management
- **Contact Management**: Form handling with spam detection
- **Project Management**: CRUD operations for portfolio projects
- **Analytics Tracking**: Comprehensive visitor and interaction analytics
- **Admin Dashboard**: Real-time stats and management interface
- **Security**: Rate limiting, input validation, and security headers
- **Email Notifications**: Automated contact form notifications
- **Health Monitoring**: System health checks and backup functionality

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/brishav/portfolio-backend.git
   cd portfolio-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start MongoDB**
   ```bash
   # Using MongoDB service
   sudo systemctl start mongod
   
   # Or using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

5. **Seed the database**
   ```bash
   npm run seed
   ```

6. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Contact
- `POST /api/contact/submit` - Submit contact form
- `GET /api/contact` - Get all contacts (admin)
- `PATCH /api/contact/:id/status` - Update contact status (admin)

### Projects
- `GET /api/projects` - Get all projects (public)
- `GET /api/projects/:id` - Get single project
- `POST /api/projects` - Create project (admin)
- `PUT /api/projects/:id` - Update project (admin)
- `DELETE /api/projects/:id` - Delete project (admin)

### Analytics
- `POST /api/analytics/track` - Track events
- `GET /api/analytics/dashboard` - Get analytics dashboard (admin)
- `GET /api/analytics/realtime` - Get real-time stats (admin)

### Admin
- `GET /api/admin/dashboard` - Admin dashboard overview
- `GET /api/admin/health` - System health check
- `POST /api/admin/backup` - Create data backup
- `DELETE /api/admin/analytics/:days` - Clean old analytics

## 🔧 Configuration

### Environment Variables

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/brishav_portfolio
JWT_SECRET=your_super_secret_jwt_key_here
FRONTEND_URL=http://localhost:3000

# Email configuration (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

### Database Models

- **User**: Authentication and user management
- **Contact**: Contact form submissions
- **Project**: Portfolio projects
- **Analytics**: Visitor tracking and analytics

## 🛡️ Security Features

- **Rate Limiting**: Prevents abuse and DDoS attacks
- **Input Validation**: Sanitizes and validates all inputs
- **JWT Authentication**: Secure token-based authentication
- **Account Locking**: Prevents brute force attacks
- **Security Headers**: Helmet.js for additional security
- **CORS Configuration**: Controlled cross-origin requests

## 📊 Analytics & Monitoring

The backend includes comprehensive analytics tracking:

- **Page Views**: Track visitor navigation
- **Project Views**: Monitor project engagement
- **Contact Submissions**: Track form submissions
- **Real-time Stats**: Live visitor analytics
- **System Health**: Monitor server performance

## 🚀 Deployment

### Using PM2 (Recommended)

```bash
# Install PM2 globally
npm install -g pm2

# Start application
pm2 start server.js --name "portfolio-backend"

# Save PM2 configuration
pm2 save
pm2 startup
```

### Using Docker

```dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
```

```bash
# Build and run
docker build -t portfolio-backend .
docker run -p 5000:5000 portfolio-backend
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- contact.test.js
```

## 📝 API Documentation

For detailed API documentation, visit `/api/docs` when the server is running (requires Swagger setup).

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email brishav@neoncity.dev or create an issue in the repository.

---

Built with ❤️ in the NeonCity | *Welcome to the future*