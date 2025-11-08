# Deployment Guide

## Quick Deploy Options

### Option 1: Docker Compose (Recommended)

```bash
# Clone repository
git clone <repository-url>
cd Dice-Game

# Start with Docker Compose
cd infra
docker-compose up -d

# Access application
# Frontend: http://localhost:5173
# Backend: http://localhost:3001
# MongoDB: localhost:27017
```

### Option 2: Railway (One-Click Deploy)

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/dice-game)

1. Click the Railway button above
2. Connect your GitHub account
3. Set environment variables:
   - `MONGO_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Random secure string
   - `FRONTEND_URL`: Your frontend domain
4. Deploy automatically

### Option 3: Render

**Backend Deployment:**
1. Create new Web Service on Render
2. Connect GitHub repository
3. Set build command: `cd backend && npm install`
4. Set start command: `cd backend && npm start`
5. Add environment variables

**Frontend Deployment:**
1. Create new Static Site on Render
2. Set build command: `cd frontend && npm run build`
3. Set publish directory: `frontend/dist`

## Manual Deployment

### Prerequisites

- Node.js 18+
- MongoDB 7+
- PM2 (for production process management)

### Backend Deployment

1. **Prepare server**
```bash
# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
npm install -g pm2

# Install MongoDB
# Follow MongoDB installation guide for your OS
```

2. **Deploy backend**
```bash
# Clone and setup
git clone <repository-url>
cd Dice-Game/backend
npm ci --production

# Set environment variables
cp .env.example .env
nano .env  # Edit with production values

# Start with PM2
pm2 start src/server.js --name dice-game-backend
pm2 save
pm2 startup
```

3. **Setup reverse proxy (Nginx)**
```nginx
server {
    listen 80;
    server_name your-api-domain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Frontend Deployment

1. **Build frontend**
```bash
cd frontend
npm ci
npm run build
```

2. **Deploy to static hosting**
```bash
# Copy dist folder to your web server
scp -r dist/* user@server:/var/www/html/

# Or use Nginx to serve
sudo cp -r dist/* /var/www/html/
```

3. **Nginx configuration for frontend**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/html;
    index index.html;

    # Handle client-side routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

## Environment Configuration

### Backend Environment Variables

```env
# Required
NODE_ENV=production
PORT=3001
MONGO_URI=mongodb://username:password@host:port/database
JWT_SECRET=your-super-secure-random-string-min-32-chars

# Optional
FRONTEND_URL=https://your-frontend-domain.com
LOG_LEVEL=info
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend Environment Variables

```env
VITE_API_URL=https://your-api-domain.com
```

## Database Setup

### MongoDB Atlas (Recommended)

1. Create MongoDB Atlas account
2. Create new cluster
3. Create database user
4. Whitelist IP addresses
5. Get connection string
6. Update `MONGO_URI` in backend environment

### Self-hosted MongoDB

```bash
# Install MongoDB
sudo apt-get install -y mongodb

# Start MongoDB
sudo systemctl start mongodb
sudo systemctl enable mongodb

# Create database and user
mongo
> use dice-game
> db.createUser({
    user: "diceuser",
    pwd: "securepassword",
    roles: ["readWrite"]
  })
```

## SSL/TLS Setup

### Using Certbot (Let's Encrypt)

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d api.your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Update Nginx for HTTPS

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    # Your existing configuration...
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

## Monitoring & Logging

### PM2 Monitoring

```bash
# View logs
pm2 logs dice-game-backend

# Monitor processes
pm2 monit

# Restart application
pm2 restart dice-game-backend

# View process info
pm2 info dice-game-backend
```

### Log Rotation

```bash
# Install logrotate configuration
sudo nano /etc/logrotate.d/dice-game

# Add configuration:
/home/user/.pm2/logs/*.log {
    daily
    missingok
    rotate 7
    compress
    notifempty
    create 0644 user user
    postrotate
        pm2 reloadLogs
    endscript
}
```

## Performance Optimization

### Backend Optimizations

1. **Enable gzip compression**
```javascript
// In server.js
import compression from 'compression';
app.use(compression());
```

2. **Database indexing**
```javascript
// Add indexes for better performance
db.bets.createIndex({ userId: 1, createdAt: -1 });
db.users.createIndex({ username: 1 });
```

3. **Connection pooling**
```javascript
// MongoDB connection options
mongoose.connect(mongoUri, {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
});
```

### Frontend Optimizations

1. **Build optimization**
```javascript
// vite.config.js
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          utils: ['axios', 'socket.io-client']
        }
      }
    }
  }
});
```

2. **CDN setup**
- Use CloudFlare or AWS CloudFront
- Enable gzip/brotli compression
- Set appropriate cache headers

## Security Checklist

### Backend Security

- [ ] Use HTTPS in production
- [ ] Set secure JWT secret (32+ characters)
- [ ] Enable rate limiting
- [ ] Validate all inputs
- [ ] Use helmet for security headers
- [ ] Keep dependencies updated
- [ ] Use environment variables for secrets
- [ ] Enable MongoDB authentication
- [ ] Restrict CORS origins

### Frontend Security

- [ ] Use HTTPS
- [ ] Implement CSP headers
- [ ] Sanitize user inputs
- [ ] Use secure cookie settings
- [ ] Keep dependencies updated
- [ ] Validate API responses

## Backup Strategy

### Database Backup

```bash
# Create backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mongodump --uri="$MONGO_URI" --out="/backups/dice-game-$DATE"
tar -czf "/backups/dice-game-$DATE.tar.gz" "/backups/dice-game-$DATE"
rm -rf "/backups/dice-game-$DATE"

# Keep only last 7 days
find /backups -name "dice-game-*.tar.gz" -mtime +7 -delete
```

### Automated Backups

```bash
# Add to crontab
0 2 * * * /path/to/backup-script.sh
```

## Troubleshooting

### Common Issues

**Backend won't start:**
- Check MongoDB connection
- Verify environment variables
- Check port availability
- Review logs: `pm2 logs dice-game-backend`

**Frontend build fails:**
- Clear node_modules and reinstall
- Check Node.js version (18+)
- Verify environment variables

**Database connection issues:**
- Check MongoDB service status
- Verify connection string
- Check firewall settings
- Ensure database user has correct permissions

**High memory usage:**
- Monitor with `pm2 monit`
- Check for memory leaks
- Restart application: `pm2 restart dice-game-backend`

### Health Checks

```bash
# Backend health
curl http://localhost:3001/health

# Database connection
mongo --eval "db.runCommand({ping: 1})"

# Frontend serving
curl -I http://localhost:80
```

## Scaling Considerations

### Horizontal Scaling

1. **Load balancer setup**
2. **Session management** (Redis for Socket.io)
3. **Database sharding**
4. **CDN for static assets**

### Vertical Scaling

1. **Increase server resources**
2. **Optimize database queries**
3. **Enable caching**
4. **Use PM2 cluster mode**

```bash
# PM2 cluster mode
pm2 start src/server.js -i max --name dice-game-backend
```