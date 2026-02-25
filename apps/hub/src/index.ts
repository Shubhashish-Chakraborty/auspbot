import { Client, GatewayIntentBits, Partials } from 'discord.js';
import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';


dotenv.config();

const TELEGRAM_CHAT_ID = process.env.TELEGRAM_MY_CHAT_ID!;

const tgBot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN!);

function escapeHTML(str: string) {
    return str.replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

// Helper function to send messages to my personal Telegram
async function notifyMe(platform: string, sender: string, server: string, message: string) {
    const safeSender = escapeHTML(sender);
    const safeServer = escapeHTML(server);
    const safeMessage = escapeHTML(message);

    // const text = `🚨 <b>New ${platform} Alert</b> 🚨\n\n` +
    //     `👤 <b>From:</b> ${safeSender}\n` +
    //     `🏢 <b>Server/Workspace:</b> ${safeServer}\n\n` +
    //     `💬 <b>Message:</b>\n${safeMessage}`;

    const onlyTextMessage = `Message: ${safeMessage}`;

    try {
        await tgBot.telegram.sendMessage(TELEGRAM_CHAT_ID, onlyTextMessage, { parse_mode: 'HTML' });
        console.log(`[Success] Forwarded ${platform} message to Telegram.`);
    } catch (error) {
        console.error('[Error] Failed to send Telegram message:', error);
    }
}

tgBot.launch();
console.log("Telegram Bot is running...");


const discordClient = new Client({ // DISCORD!: Source-1
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages
    ],
    partials: [Partials.Channel]
});

discordClient.once('ready', () => {
    console.log(`Discord Bot logged in as ${discordClient.user?.tag}`);
});

discordClient.on('messageCreate', async (message) => {
    if (message.author.bot) return; // Ignore messages from bots (including ourselves)

    const sender = message.author.username;
    const server = message.guild ? message.guild.name : 'Direct Message';
    const content = message.content;
    await notifyMe('Discord', sender, server, content);
});

if (!process.env.DISCORD_BOT_TOKEN) {
    console.error("DISCORD_BOT_TOKEN is missing or empty in your .env file!");
    process.exit(1);
}

discordClient.login(process.env.DISCORD_BOT_TOKEN);

process.once('SIGINT', () => tgBot.stop('SIGINT'));
process.once('SIGTERM', () => tgBot.stop('SIGTERM'));