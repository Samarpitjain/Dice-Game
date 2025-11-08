import mongoose from 'mongoose';

const betSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  betAmount: {
    type: Number,
    required: true,
    min: 0.01
  },
  direction: {
    type: String,
    enum: ['over', 'under'],
    required: true
  },
  target: {
    type: Number,
    required: true,
    min: 0.01,
    max: 99.99
  },
  winChance: {
    type: Number,
    required: true,
    min: 0.01,
    max: 95.00
  },
  payout: {
    type: Number,
    required: true
  },
  win: {
    type: Boolean,
    required: true
  },
  profit: {
    type: Number,
    required: true
  },
  roll: {
    type: Number,
    required: true,
    min: 0.00,
    max: 100.00
  },
  nonce: {
    type: Number,
    required: true,
    min: 0
  },
  serverSeedHash: {
    type: String,
    required: true
  },
  hmac: {
    type: String,
    required: true
  },
  clientSeed: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

betSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('Bet', betSchema);