# Dice Game - Provably Fair Gaming Platform

A production-ready, provably-fair Stake-style dice game built with the MERN stack. Features manual betting, auto-betting with strategies, advanced rule builder, seed management, fairness verification, and real-time statistics.

## 🎯 Features

- **Provably Fair Gaming**: HMAC-SHA256 based RNG with seed management and verification
- **Multiple Betting Modes**: Manual, Auto, and Advanced strategy builder
- **Real-time Updates**: Socket.io for live bet feeds and statistics
- **Responsive Design**: Pixel-faithful Stake UI with dark theme
- **Security**: Rate limiting, JWT authentication, input validation
- **Testing**: Comprehensive unit, integration, and E2E tests
- **Docker Ready**: Full containerization with docker-compose

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MongoDB 7+
- Docker & Docker Compose (optional)

### Local Development

1. **Clone and install dependencies**
```bash
git clone <repository-url>
cd Dice-Game
npm install
cd backend && npm install
cd ../frontend && npm install
```

2. **Setup environment variables**
```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
```

3. **Start MongoDB**
```bash
# Using Docker
docker run -d -p 27017:27017 --name mongo mongo:7

# Or use your local MongoDB installation
```

4. **Run the application**
```bash
# From root directory
npm run dev
```

5. **Access the application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- API Health: http://localhost:3001/health

### Docker Deployment

```bash
cd infra
docker-compose up -d
```

## 🏗️ Architecture

### Backend (Node.js + Express)
- **RNG System**: Provably fair HMAC-SHA256 implementation
- **API Endpoints**: RESTful API with rate limiting and validation
- **Real-time**: Socket.io for live updates
- **Database**: MongoDB with Mongoose ODM
- **Security**: JWT auth, helmet, CORS, rate limiting

### Frontend (React + Vite)
- **State Management**: React Context with reducer pattern
- **Styling**: TailwindCSS with Stake-inspired design tokens
- **Animations**: Framer Motion for smooth roll animations
- **Real-time**: Socket.io client for live updates
- **Testing**: Vitest for unit tests

### Key Components
- `RollBar`: Main dice roll visualization with animations
- `ManualControls`: Basic betting interface
- `AutoControls`: Automated betting with strategy options
- `FairnessModal`: Seed management and roll verification
- `BetHistory`: Real-time bet feed
- `StatsPanel`: Session statistics and profit tracking

## 🎲 Provable Fairness

### How It Works

1. **Server Seed**: Random 128-character hex string, hashed with SHA256
2. **Client Seed**: User-configurable seed (default: random)
3. **Nonce**: Incremental counter for each bet
4. **Roll Generation**: `HMAC-SHA256(serverSeed, clientSeed:nonce)`

### Verification Process

```javascript
const msg = `${clientSeed}:${nonce}`;
const hmac = HMAC_SHA256(serverSeed, msg);
const first8 = hmac.slice(0, 8);
const intVal = parseInt(first8, 16);
const float = intVal / 0xffffffff;
const roll = Math.floor(float * 10001) / 100;
```

### Seed Management

- Server seed is hashed and shown to players before betting
- Players can set custom client seeds
- Server seed rotation reveals previous seed for verification
- All bets store HMAC for independent verification

## 📊 API Documentation

### Authentication
```bash
POST /api/auth/login
GET /api/auth/profile
```

### Game Operations
```bash
POST /api/game/roll      # Place bet
GET /api/game/history    # Get bet history
GET /api/game/verify     # Verify roll result
```

### Seed Management
```bash
GET /api/seeds/hash      # Get current seed hash
POST /api/seeds/reset    # Rotate server seed
POST /api/seeds/client   # Update client seed
```

### Rate Limits
- Betting: 10 requests per minute
- Seed operations: 5 requests per 5 minutes

## 🧪 Testing

### Run Tests
```bash
# Backend unit tests
cd backend && npm test

# Frontend unit tests
cd frontend && npm test

# E2E tests
cd tests && npm run test:e2e
```

### Test Coverage
- **Unit Tests**: RNG functions, API endpoints, React components
- **Integration Tests**: Full API workflows with database
- **E2E Tests**: Complete user journeys with Playwright

## 🔧 Configuration

### Environment Variables

**Backend (.env)**
```env
NODE_ENV=development
PORT=3001
MONGO_URI=mongodb://localhost:27017/dice-game
JWT_SECRET=your-super-secret-jwt-key
FRONTEND_URL=http://localhost:5173
```

**Frontend (.env)**
```env
VITE_API_URL=http://localhost:3001
```

### Design Tokens
```css
--background: #0F0F12
--text-primary: #FFFFFF
--text-secondary: #8F9BA8
--accent-green: #00C74D
--accent-blue: #1A9FFF
--border-color: #1E1E23
--error: #FF3B30
```

## 🚀 Deployment

### Production Deployment

1. **Build the application**
```bash
npm run build
```

2. **Deploy with Docker**
```bash
cd infra
docker-compose -f docker-compose.yml up -d
```

3. **Environment Setup**
- Set production MongoDB URI
- Generate secure JWT secret
- Configure CORS origins
- Set up SSL/TLS certificates

### Recommended Hosting
- **Frontend**: Vercel, Netlify, AWS S3 + CloudFront
- **Backend**: Railway, Render, DigitalOcean App Platform
- **Database**: MongoDB Atlas

### Health Monitoring
- Backend health endpoint: `/health`
- Docker health checks included
- Logging with Winston

## 🔒 Security Features

- **Authentication**: JWT tokens with expiration
- **Rate Limiting**: Per-user and per-IP limits
- **Input Validation**: Comprehensive request validation
- **CORS**: Configured for production origins
- **Headers**: Security headers with Helmet
- **Seed Security**: Server seeds never exposed until rotation

## 📱 Mobile Support

- Responsive design for all screen sizes
- Touch-friendly controls
- Optimized animations for mobile
- Progressive Web App ready

## 🎮 Game Features

### Manual Mode
- Adjustable bet amount with quick multipliers
- Win chance slider (0.01% - 95%)
- Over/Under direction selection
- Real-time payout calculation

### Auto Mode
- Configurable number of bets
- Stop conditions (win target, loss limit)
- Bet adjustment strategies (increase on win/loss)
- Safety caps and rate limiting

### Advanced Mode (Future)
- Visual strategy builder
- Conditional logic blocks
- Complex betting patterns
- Strategy sharing and templates

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Development Guidelines
- Follow ESLint configuration
- Write tests for new features
- Update documentation
- Use conventional commits

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- Create an issue for bug reports
- Join our Discord for community support
- Check the wiki for detailed guides

## 🔮 Roadmap

- [ ] Advanced strategy builder UI
- [ ] Multi-currency support (BTC, ETH)
- [ ] Social features and leaderboards
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Tournament mode