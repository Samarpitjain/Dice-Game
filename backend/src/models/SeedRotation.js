import mongoose from 'mongoose';

const seedRotationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  oldServerSeed: {
    type: String,
    required: true
  },
  oldServerSeedHash: {
    type: String,
    required: true
  },
  revealTimestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

seedRotationSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('SeedRotation', seedRotationSchema);