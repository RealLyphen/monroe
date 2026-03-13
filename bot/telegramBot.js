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

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const BOT_TOKEN = '7693026027:AAGZClqTAP5BxMXou_kSqabIswyAJPvwCi0';
const API_BASE = `https://api.telegram.org/bot${BOT_TOKEN}`;
const KEYS_PATH = path.join(__dirname, '..', 'data', 'keys.json');
const POLL_INTERVAL = 1500; // ms

// ── Helpers ──────────────────────────────────────────────

function loadKeys() {
  try {
    return JSON.parse(fs.readFileSync(KEYS_PATH, 'utf-8'));
  } catch {
    return { keys: {} };
  }
}

function saveKeys(data) {
  fs.writeFileSync(KEYS_PATH, JSON.stringify(data, null, 2));
}

function findKeyByTelegramId(data, tgId) {
  for (const [key, info] of Object.entries(data.keys)) {
    if (info.telegramId === tgId) return key;
  }
  return null;
}

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
      const tgId = msg.from.id;
      const username = msg.from.username || msg.from.first_name || 'user';
      const text = msg.text.trim();

      if (text === '/start' || text === '/generate') {
        const data = loadKeys();
        let existingKey = findKeyByTelegramId(data, tgId);

        if (existingKey) {
          await tgApi('sendMessage', {
            chat_id: chatId,
            text:
              `🔑 *Your Monroe Login Key*\n\n` +
              `\`${existingKey}\`\n\n` +
              `This key is permanently tied to your account. ` +
              `Paste it on the Monroe website to sign in.\n\n` +
              `_Your key never changes — use it anytime._`,
            parse_mode: 'Markdown',
          });
        } else {
          const newKey = crypto.randomUUID();
          data.keys[newKey] = {
            telegramId: tgId,
            username,
            createdAt: new Date().toISOString(),
          };
          saveKeys(data);
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
  console.log('🤖 Monroe Telegram Bot started. Waiting for messages...');
  // eslint-disable-next-line no-constant-condition
  while (true) {
    await poll();
    await new Promise((r) => setTimeout(r, POLL_INTERVAL));
  }
}

main();
