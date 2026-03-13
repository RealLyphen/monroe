const { spawn } = require('child_process');

console.log('🚀 Starting Monroe production environment...');

// Start the Next.js production server
const nextServer = spawn('npm', ['run', 'next-start'], {
  stdio: 'inherit',
  shell: true,
  env: process.env,
  cwd: __dirname
});

// Start the Telegram Bot
const telegramBot = spawn('node', ['bot/telegramBot.js'], {
  stdio: 'inherit',
  shell: true,
  env: process.env,
  cwd: __dirname
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down Monroe...');
  nextServer.kill('SIGINT');
  telegramBot.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down Monroe...');
  nextServer.kill('SIGTERM');
  telegramBot.kill('SIGTERM');
  process.exit(0);
});
