const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('فحص سرعة البوت'),

    async execute(interaction) {
        await interaction.reply({
            content: `🏓 Pong! سرعة البوت: ${interaction.client.ws.ping}ms`
        });
    }
};