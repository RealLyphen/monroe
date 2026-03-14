import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username: { type: String, required: true },
  content: { type: String, required: true },
  rating: { type: Number, default: 5 },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Review || mongoose.model('Review', ReviewSchema);
