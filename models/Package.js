import mongoose from 'mongoose';

const PackageSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  trackingId: { type: String, required: true },
  status: { type: String, default: 'Pending' }, // Pending, Received, Forwarded, Completed
  weight: { type: String },
  dimensions: { type: String },
  note: { type: String },
  photoUrl: { type: String },
  forwardAddress: {
    name: String,
    street: String,
    city: String
  },
  forwardTrackingId: { type: String },
  isConsolidated: { type: Boolean, default: false },
  sourcePackages: [{ type: String }], // Array of original string IDs if needed, or ObjectIds
  consolidatedInto: { type: String }, // String ID or ObjectId
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Package || mongoose.model('Package', PackageSchema);
