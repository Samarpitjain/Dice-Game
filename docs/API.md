# API Documentation

## Base URL
```
http://localhost:3001/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Endpoints

### Authentication

#### POST /auth/login
Create or login to demo account.

**Request Body:**
```json
{
  "username": "string (3-20 chars)"
}
```

**Response:**
```json
{
  "token": "string",
  "user": {
    "id": "string",
    "username": "string",
    "balance": "number",
    "clientSeed": "string",
    "serverSeedHash": "string",
    "nonce": "number"
  }
}
```

#### GET /auth/profile
Get current user profile.

**Headers:** Authorization required

**Response:**
```json
{
  "user": {
    "id": "string",
    "username": "string",
    "balance": "number",
    "clientSeed": "string",
    "serverSeedHash": "string",
    "nonce": "number",
    "settings": {
      "theme": "dark|light",
      "sound": "boolean"
    }
  }
}
```

### Game Operations

#### POST /game/roll
Place a bet and roll the dice.

**Headers:** Authorization required

**Request Body:**
```json
{
  "betAmount": "number (0.01-1000)",
  "target": "number (0.01-99.99)",
  "direction": "under|over",
  "clientSeed": "string (optional)"
}
```

**Response:**
```json
{
  "roll": "number",
  "win": "boolean",
  "payout": "number",
  "profit": "number",
  "newBalance": "number",
  "newNonce": "number",
  "serverSeedHash": "string"
}
```

**Rate Limit:** 10 requests per minute per user

#### GET /game/history
Get bet history for current user.

**Headers:** Authorization required

**Query Parameters:**
- `limit` (optional): Number of bets to return (max 100, default 50)
- `skip` (optional): Number of bets to skip (default 0)

**Response:**
```json
{
  "bets": [
    {
      "_id": "string",
      "betAmount": "number",
      "direction": "under|over",
      "target": "number",
      "winChance": "number",
      "payout": "number",
      "win": "boolean",
      "profit": "number",
      "roll": "number",
      "nonce": "number",
      "serverSeedHash": "string",
      "hmac": "string",
      "clientSeed": "string",
      "createdAt": "string (ISO date)"
    }
  ]
}
```

#### GET /game/verify
Verify a roll result using seeds and nonce.

**Query Parameters:**
- `serverSeed`: Revealed server seed
- `clientSeed`: Client seed used
- `nonce`: Nonce value

**Response:**
```json
{
  "roll": "number"
}
```

### Seed Management

#### GET /seeds/hash
Get current seed information.

**Headers:** Authorization required

**Response:**
```json
{
  "serverSeedHash": "string",
  "clientSeed": "string",
  "nonce": "number"
}
```

#### POST /seeds/reset
Rotate server seed (reveals old seed).

**Headers:** Authorization required

**Response:**
```json
{
  "oldServerSeed": "string",
  "newServerSeedHash": "string",
  "message": "string"
}
```

**Rate Limit:** 5 requests per 5 minutes per user

#### POST /seeds/client
Update client seed.

**Headers:** Authorization required

**Request Body:**
```json
{
  "clientSeed": "string"
}
```

**Response:**
```json
{
  "clientSeed": "string",
  "message": "string"
}
```

## Error Responses

All endpoints may return these error responses:

### 400 Bad Request
```json
{
  "error": "Error message describing the validation issue"
}
```

### 401 Unauthorized
```json
{
  "error": "Access token required"
}
```

### 403 Forbidden
```json
{
  "error": "Invalid or expired token"
}
```

### 429 Too Many Requests
```json
{
  "error": "Too many requests",
  "retryAfter": "number (seconds)"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

## Rate Limiting

- **Betting endpoints**: 10 requests per minute per user
- **Seed operations**: 5 requests per 5 minutes per user
- **General endpoints**: 100 requests per minute per IP

Rate limit headers are included in responses:
- `X-RateLimit-Limit`: Request limit
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Reset time (Unix timestamp)

## WebSocket Events

Connect to `/` namespace for real-time updates.

### Client Events

#### join
Join user room for personalized updates.
```javascript
socket.emit('join', userId);
```

### Server Events

#### betResult
Emitted when user places a bet.
```javascript
socket.on('betResult', (data) => {
  // data.bet: Bet object
  // data.newBalance: Updated balance
  // data.newNonce: Updated nonce
});
```

## Provable Fairness

### Roll Generation Algorithm
```javascript
const msg = `${clientSeed}:${nonce}`;
const hmac = HMAC_SHA256(serverSeed, msg);
const first8 = hmac.slice(0, 8);
const intVal = parseInt(first8, 16);
const float = intVal / 0xffffffff;
const roll = Math.floor(float * 10001) / 100;
```

### Verification Steps
1. Get server seed hash before betting
2. Place bets with known client seed and nonce
3. After seed rotation, use revealed server seed to verify rolls
4. Compare computed roll with stored roll result

### Security Notes
- Server seed is never revealed until rotation
- Each bet increments nonce to ensure uniqueness
- HMAC ensures server cannot manipulate results
- Client can verify all historical bets independently