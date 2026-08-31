const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket-panel')
        .setDescription('إرسال لوحة تذاكر الدعم الفني في الروم الحالي'),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('🔧 نظام التذاكر - سيرفر فايف ام')
            .setDescription('لفتح تذكرة جديدة للحصول على الدعم الفني أو الاستفسار، اضغط على الزر أدناه.')
            .setColor(0x3498DB);

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('create_ticket')
                .setLabel('فتح تذكرة 🎫')
                .setStyle(ButtonStyle.Primary)
        );

        await interaction.channel.send({ embeds: [embed], components: [row] });
        await interaction.reply({ content: '✅ تم إرسال لوحة التذاكر بنجاح.', ephemeral: true });
    },
};