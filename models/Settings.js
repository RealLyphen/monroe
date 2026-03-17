import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  globalId: { 
    type: String, 
    required: true, 
    default: 'system_settings',
    unique: true 
  },
  ownerKey: {
    type: String,
    required: true,
    default: 'ADMIN-01'
  },
  oxapayMerchantId: {
    type: String,
    required: true,
    default: 'dummy_merchant'
  }
}, { timestamps: true });

// Prevent mongoose from recreating the model if it already exists
const Settings = mongoose.models.Settings || mongoose.model('Settings', settingsSchema);

export default Settings;
