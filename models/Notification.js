import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  target: { type: String, default: 'ALL' }, // 'ALL' or User ObjectId as string
  title: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
