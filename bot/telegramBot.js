#!/usr/bin/env node
/**
 * Monroe Telegram Bot — Login Key Generator
 *
 * Run:  node bot/telegramBot.js
 *
 * Uses raw Telegram Bot API via fetch (no npm deps).
 * Generates a unique login key per Telegram user.
 * Keys are stored in data/keys.json.
 */

const mongoose = require('mongoose');
const path = require('path');

// Load environment variables from .env file
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
let MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI || MONGODB_URI.includes('localhost') || MONGODB_URI.includes('127.0.0.1')) {
  MONGODB_URI = 'mongodb://mongo:KirRfHvKDZhmHbjXxzIoLEblmLKHBwsk@switchyard.proxy.rlwy.net:26480';
}
const API_BASE = `https://api.telegram.org/bot${BOT_TOKEN}`;
const POLL_INTERVAL = 1500; // ms

// Define User Schema for the bot
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  telegramId: { type: String, sparse: true },
  key: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now }
});
const User = mongoose.models.User || mongoose.model('User', UserSchema);

// Ensure token exists before starting
if (!BOT_TOKEN || BOT_TOKEN === 'your_telegram_bot_token_here') {
  console.error('\n❌ ERROR: Missing or invalid TELEGRAM_BOT_TOKEN in .env file!');
  process.exit(1);
}

// ── Helpers ──────────────────────────────────────────────

async function tgApi(method, body = {}) {
  const res = await fetch(`${API_BASE}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
}

// ── Bot loop ─────────────────────────────────────────────

let offset = 0;

async function poll() {
  try {
    const resp = await tgApi('getUpdates', { offset, timeout: 30 });
    if (!resp.ok || !resp.result) return;

    for (const update of resp.result) {
      offset = update.update_id + 1;
      const msg = update.message;
      if (!msg || !msg.text) continue;

      const chatId = msg.chat.id;
      const tgId = msg.from.id.toString();
      const tgUsername = msg.from.username || msg.from.first_name || 'user';
      const text = msg.text.trim();

      if (text === '/start' || text === '/generate') {
        const photosResp = await tgApi('getUserProfilePhotos', { user_id: tgId, limit: 1 });
        let avatarUrl = '';
        if (photosResp.ok && photosResp.result.total_count > 0) {
          const photoArray = photosResp.result.photos[0];
          const fileId = photoArray[photoArray.length - 1].file_id; // get best quality
          const fileResp = await tgApi('getFile', { file_id: fileId });
          if (fileResp.ok) {
            avatarUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${fileResp.result.file_path}`;
          }
        }

        let user = await User.findOne({ telegramId: tgId });

        if (user) {
          // Update avatarUrl if changed
          if (avatarUrl && user.avatarUrl !== avatarUrl) {
            user.avatarUrl = avatarUrl;
            await user.save();
          }

          await tgApi('sendMessage', {
            chat_id: chatId,
            text:
              `🔑 *Your Monroe Login Key*\n\n` +
              `\`${user.key}\`\n\n` +
              `This key is permanently tied to your account. ` +
              `Paste it on the Monroe website to sign in.\n\n` +
              `_Your key never changes — use it anytime._`,
            parse_mode: 'Markdown',
          });
        } else {
          const newKey = crypto.randomUUID();
          // To ensure unique usernames, if the username exists, we append a random number
          let finalUsername = tgUsername;
          const userExists = await User.findOne({ username: finalUsername });
          if (userExists) {
            finalUsername = `${tgUsername}_${Math.floor(Math.random() * 999)}`;
          }

          user = await User.create({
            telegramId: tgId,
            username: finalUsername,
            key: newKey,
            avatarUrl,
            createdAt: new Date()
          });

          await tgApi('sendMessage', {
            chat_id: chatId,
            text:
              `✅ *Key Generated!*\n\n` +
              `\`${newKey}\`\n\n` +
              `This is your permanent Monroe login key. ` +
              `Paste it on the Monroe website to sign in.\n\n` +
              `_Keep it safe — this key is unique to you._`,
            parse_mode: 'Markdown',
          });
        }
      } else {
        await tgApi('sendMessage', {
          chat_id: chatId,
          text:
            `👋 Welcome to *Monroe Bot*!\n\n` +
            `Use /generate to create your login key.`,
          parse_mode: 'Markdown',
        });
      }
    }
  } catch (err) {
    console.error('Poll error:', err.message);
  }
}

async function main() {
  console.log('🤖 Monroe Telegram Bot initializing...');
  
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected.');
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1);
  }
  
  // Test the token
  try {
    const me = await tgApi('getMe');
    if (me.ok) {
      console.log(`✅ Successfully connected to Telegram as @${me.result.username}`);
      console.log('📡 Waiting for /start or /generate messages...');
    } else {
      console.error('\n❌ ERROR: Telegram rejected the BOT_TOKEN. It might be invalid or revoked.');
      console.error(me);
      process.exit(1);
    }
  } catch(err) {
    console.error('\n❌ ERROR: Could not reach Telegram API. Check your internet connection.');
    process.exit(1);
  }

  // eslint-disable-next-line no-constant-condition
  while (true) {
    await poll();
    await new Promise((r) => setTimeout(r, POLL_INTERVAL));
  }
}

main();
