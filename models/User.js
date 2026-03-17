import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  telegramId: { type: String, sparse: true },
  key: { type: String, required: true, unique: true },
  avatarUrl: { type: String, default: '' },
  savedAddresses: [{ 
    name: String, 
    street: String, 
    city: String, 
    state: String, 
    zip: String, 
    country: String 
  }],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
