const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://mongo:KirRfHvKDZhmHbjXxzIoLEblmLKHBwsk@switchyard.proxy.rlwy.net:26480';

// Define schemas directly in the script for simplicity or require models
// Since models use 'import', we define them here to avoid ESM/CJS issues
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  telegramId: { type: String, sparse: true },
  key: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now }
});
const User = mongoose.models.User || mongoose.model('User', UserSchema);

const PackageSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  trackingId: { type: String, required: true },
  status: { type: String, default: 'Pending' },
  weight: { type: String },
  dimensions: { type: String },
  note: { type: String },
  photoUrl: { type: String },
  forwardAddress: { name: String, street: String, city: String },
  forwardTrackingId: { type: String },
  createdAt: { type: Date, default: Date.now }
});
const Package = mongoose.models.Package || mongoose.model('Package', PackageSchema);

const AddressSchema = new mongoose.Schema({
  name: { type: String, required: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});
const Address = mongoose.models.Address || mongoose.model('Address', AddressSchema);

const WalletSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  balance: { type: Number, default: 0 },
  transactions: [{
    id: { type: String, required: true },
    amount: { type: Number, required: true },
    type: { type: String, required: true },
    note: { type: String },
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});
const Wallet = mongoose.models.Wallet || mongoose.model('Wallet', WalletSchema);

const NotificationSchema = new mongoose.Schema({
  target: { type: String, default: 'ALL' },
  title: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
const Notification = mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);

const ReviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username: { type: String, required: true },
  content: { type: String, required: true },
  rating: { type: Number, default: 5 },
  createdAt: { type: Date, default: Date.now }
});
const Review = mongoose.models.Review || mongoose.model('Review', ReviewSchema);

const ChatSchema = new mongoose.Schema({
  packageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Package', required: true, unique: true },
  messages: [{
    sender: { type: String, required: true },
    role: { type: String },
    message: { type: String, required: true },
    imageUrl: { type: String },
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});
const Chat = mongoose.models.Chat || mongoose.model('Chat', ChatSchema);

async function migrate() {
  console.log('🔗 Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected.');

  const dataDir = path.join(__dirname, '..', 'data');
  const loadJson = (name) => {
    try {
      return JSON.parse(fs.readFileSync(path.join(dataDir, name), 'utf8'));
    } catch (e) {
      console.log(`⚠️  Could not load ${name}, skipping...`);
      return null;
    }
  };

  // 1. Migrate Users (from keys.json)
  console.log('👤 Migrating Users...');
  const keysData = loadJson('keys.json');
  const userMap = {}; // mapping username -> _id
  if (keysData && keysData.keys) {
    for (const [key, val] of Object.entries(keysData.keys)) {
      const existingUser = await User.findOne({ username: val.username });
      if (!existingUser) {
        const newUser = await User.create({
          username: val.username,
          telegramId: val.telegramId?.toString(),
          key: key,
          createdAt: val.createdAt
        });
        userMap[val.username] = newUser._id;
      } else {
        userMap[val.username] = existingUser._id;
      }
    }
  }

  // 2. Migrate Addresses
  console.log('📍 Migrating Addresses...');
  const addrData = loadJson('addresses.json');
  if (addrData) {
    for (const addr of addrData) {
      const exists = await Address.findOne({ street: addr.street, city: addr.city });
      if (!exists) {
        await Address.create({
          name: addr.name,
          street: addr.street,
          city: addr.city,
          active: addr.active
        });
      }
    }
  }

  // 3. Migrate Wallets
  console.log('💰 Migrating Wallets...');
  const walletData = loadJson('wallets.json');
  if (walletData) {
    for (const [username, data] of Object.entries(walletData)) {
      if (userMap[username]) {
        const exists = await Wallet.findOne({ userId: userMap[username] });
        if (!exists) {
          await Wallet.create({
            userId: userMap[username],
            balance: data.balance,
            transactions: data.transactions
          });
        }
      }
    }
  }

  // 4. Migrate Packages
  console.log('📦 Migrating Packages...');
  const pkgData = loadJson('packages.json');
  const pkgMap = {}; // original id -> mongo _id
  if (pkgData) {
    for (const pkg of pkgData) {
      if (userMap[pkg.username]) {
        // Find if package already exists by userId and trackingId
        let exPkg = await Package.findOne({ userId: userMap[pkg.username], trackingId: pkg.trackingId });
        if (!exPkg) {
          exPkg = await Package.create({
            userId: userMap[pkg.username],
            trackingId: pkg.trackingId,
            status: pkg.status,
            weight: pkg.weight,
            dimensions: pkg.dimensions,
            note: pkg.note,
            photoUrl: pkg.photoUrl,
            forwardAddress: pkg.forwardAddress,
            forwardTrackingId: pkg.forwardTrackingId,
            createdAt: pkg.createdAt
          });
        }
        pkgMap[pkg.id] = exPkg._id;
      }
    }
  }

  // 5. Migrate Notifications
  console.log('🔔 Migrating Notifications...');
  const notifData = loadJson('notifications.json');
  if (notifData) {
    for (const notif of notifData) {
      await Notification.create({
        target: notif.target, // usually "ALL" or username string
        title: notif.title,
        message: notif.message,
        createdAt: notif.createdAt
      });
    }
  }

  // 6. Migrate Reviews
  console.log('⭐ Migrating Reviews...');
  const reviewData = loadJson('reviews.json');
  if (Array.isArray(reviewData)) {
    for (const rev of reviewData) {
      if (userMap[rev.username]) {
        await Review.create({
          userId: userMap[rev.username],
          username: rev.username,
          content: rev.content,
          rating: rev.rating,
          createdAt: rev.createdAt
        });
      }
    }
  }

  // 7. Migrate Chat
  console.log('💬 Migrating Chat...');
  const chatData = loadJson('chat.json');
  if (chatData) {
    for (const [pkgId, messages] of Object.entries(chatData)) {
      if (pkgMap[pkgId]) {
        const exists = await Chat.findOne({ packageId: pkgMap[pkgId] });
        if (!exists) {
          const mappedMessages = messages.map(m => ({
            sender: m.role || m.sender.toLowerCase(), // map role or sender
            role: m.role,
            message: m.message,
            imageUrl: m.imageUrl,
            createdAt: m.createdAt
          }));
          await Chat.create({
            packageId: pkgMap[pkgId],
            messages: mappedMessages
          });
        }
      }
    }
  }

  console.log('🎉 Migration completed!');
  await mongoose.connection.close();
}

migrate().catch(err => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
