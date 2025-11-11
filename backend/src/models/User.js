import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 20
  },
  balance: {
    type: Number,
    default: 100000, // Stored in cents (1000.00 * 100)
    min: 0
  },
  clientSeed: {
    type: String,
    required: true,
    default: () => Math.random().toString(36).substring(2, 15)
  },
  serverSeed: {
    type: String,
    required: true
  },
  serverSeedHash: {
    type: String,
    required: true
  },
  serverSeedRevealedAt: {
    type: Date,
    default: null
  },
  nonce: {
    type: Number,
    default: 0,
    min: 0
  },
  settings: {
    theme: {
      type: String,
      enum: ['dark', 'light'],
      default: 'dark'
    },
    sound: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

export default mongoose.model('User', userSchema);