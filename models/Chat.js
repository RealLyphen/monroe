import mongoose from 'mongoose';

const ChatSchema = new mongoose.Schema({
  packageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Package', required: true, unique: true },
  messages: [{
    sender: { type: String, enum: ['user', 'admin'], required: true },
    role: { type: String }, // redundant but good for compatibility
    message: { type: String, required: true },
    imageUrl: { type: String },
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Chat || mongoose.model('Chat', ChatSchema);
