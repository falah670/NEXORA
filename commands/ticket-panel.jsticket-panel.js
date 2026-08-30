const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    PermissionFlagsBits
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket-panel')
        .setDescription('إرسال لوحة فتح التذاكر')
        .setDefaultMemberPermissions(
            PermissionFlagsBits.Administrator
        ),

    async execute(interaction) {

        const embed = new EmbedBuilder()
            .setTitle('🎫 الدعم والتذاكر')
            .setDescription(
                'مرحبًا بك في نظام الدعم.\n\n' +
                'إذا كنت تحتاج إلى مساعدة أو لديك طلب، اضغط على الزر بالأسفل لفتح تذكرة خاصة.\n\n' +
                '📌 سيتمكن فريق الدعم فقط من رؤية تذكرتك.'
            )
            .setFooter({
                text: 'Falah Systems • Ticket System'
            })
            .setTimestamp();

        const openButton = new ButtonBuilder()
            .setCustomId('create_ticket')
            .setLabel('فتح تذكرة')
            .setEmoji('🎫')
            .setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder()
            .addComponents(openButton);

        await interaction.reply({
            embeds: [embed],
            components: [row]
        });
    }
};