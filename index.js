require('dotenv').config();

const {
    Client,
    GatewayIntentBits,
    Collection,
    Events
} = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates
    ]
});

client.commands = new Collection();

client.once(Events.ClientReady, () => {
    console.log('====================================');
    console.log(`🤖 تم تسجيل دخول البوت بنجاح: ${client.user.tag}`);
    console.log(`🆔 Bot ID: ${client.user.id}`);
    console.log('🚀 Falah Systems يعمل الآن بنجاح');
    console.log('====================================');
});

client.login(process.env.DISCORD_TOKEN);