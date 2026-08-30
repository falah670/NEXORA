const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('info')
        .setDescription('معلومات عن البوت'),

    async execute(interaction) {
        await interaction.reply({
            content: `🤖 **Falah Systems**

📡 سرعة البوت: ${interaction.client.ws.ping}ms
🆔 معرف البوت: ${interaction.client.user.id}
🏠 عدد السيرفرات: ${interaction.client.guilds.cache.size}
👥 عدد المستخدمين: ${interaction.client.users.cache.size}`,
            ephemeral: false
        });
    }
};