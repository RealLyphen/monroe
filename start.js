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

nextServer.on('close', (code) => {
  console.log(`\n⚠️ Next.js exited with code ${code}. Shutting down container for clean restart...`);
  telegramBot.kill();
  process.exit(code || 1);
});

telegramBot.on('close', (code) => {
  console.log(`\n⚠️ Telegram Bot exited with code ${code}. Shutting down container for clean restart...`);
  nextServer.kill();
  process.exit(code || 1);
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
