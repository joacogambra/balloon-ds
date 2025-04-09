import { Client, GatewayIntentBits, Events, AttachmentBuilder } from 'discord.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Bot configuration
const TOKEN = process.env.DISCORD_BOT_TOKEN || 'MTM1OTYwNTgxOTU3MzgwMTM2Mw.GOyNZj.A1padETnytinOLJEN9JFKIufhS3eSt2waPni8I';
const TRIGGER_WORD = '9z';
const POP_THRESHOLD = 3333;
const TOTAL_STAGES = 8;

// Create a new client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Game state
const gameState = {
  count: 0,
  lastUser: null,
  channelId: null,
};

// Get the appropriate balloon stage based on count
function getBalloonStage(count) {
  // Calculate which stage we're at (1-8)
  return Math.min(TOTAL_STAGES, Math.ceil((count / POP_THRESHOLD) * TOTAL_STAGES));
}

// Get the balloon SVG file path for the current stage
function getBalloonSvgPath(stage) {
  return path.join(__dirname, `balloon-stage-${stage}.svg`);
}

// When the client is ready, run this code
client.once(Events.ClientReady, () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

// Listen for messages
client.on(Events.MessageCreate, async (message) => {
  // Ignore bot messages
  if (message.author.bot) return;
  
  // Check if the message contains the trigger word
  if (message.content.toLowerCase().includes(TRIGGER_WORD)) {
    // Initialize channel if not set
    if (!gameState.channelId) {
      gameState.channelId = message.channelId;
    }
    
    // Only process messages in the initialized channel
    if (message.channelId === gameState.channelId) {
      // Increment counter
      gameState.count++;
      gameState.lastUser = message.author;
      
      // Get current balloon stage
      const stage = getBalloonStage(gameState.count);
      
      // Get balloon SVG file path
      const balloonSvgPath = getBalloonSvgPath(stage);
      
      // Create attachment
      const attachment = new AttachmentBuilder(balloonSvgPath, { name: 'balloon.svg' });
      
      // Calculate percentage
      const percentage = Math.min(100, Math.floor((gameState.count / POP_THRESHOLD) * 100));
      
      // Prepare message content
      let content = `Balloon inflation: ${gameState.count}/${POP_THRESHOLD} (${percentage}%)`;
      
      // Check if balloon popped
      if (gameState.count >= POP_THRESHOLD) {
        content = `🎉 POP! 🎉 The balloon has popped after ${POP_THRESHOLD} inflations!\n` +
                 `Congratulations to ${gameState.lastUser} for being the winner!`;
        
        // Reset game
        gameState.count = 0;
        gameState.lastUser = null;
      }
      
      // Send message with balloon image
      await message.channel.send({
        content,
        files: [attachment]
      });
    }
  }
});

// Log in to Discord with your client's token
client.login(TOKEN);

console.log('Discord Balloon Bot is starting...');
console.log('This bot will track when users type "9z" and inflate a balloon until it pops after 3333 messages.');
console.log('The bot will display 8 different SVG images showing the balloon at different inflation stages.');
console.log('To use this bot:');
console.log('1. Create a Discord application at https://discord.com/developers/applications');
console.log('2. Create a bot for your application and copy the token');
console.log('3. Replace YOUR_DISCORD_BOT_TOKEN with your actual token');
console.log('4. Invite the bot to your server with the proper permissions');
console.log('5. Make sure all 8 SVG files are in the same directory as this script');
console.log('6. Run this script to start the bot');