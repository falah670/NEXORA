const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('punishment-panel')
        .setDescription('إرسال لوحة العقوبات والباند الخاصة بالإدارة')
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('🛡️ Sword RP - لوحة العقوبات الإدارية')
            .setDescription(
                'مرحباً بك يا عزيزي، هنا سوف تمكن بتحديد الشخص مع تعبئة بياناته بشكل تام .\n\n' +
                'Hello my dear, here you will be able to ban the person with his details filled in completely .'
            )
            .setColor(0x990000)
            .setImage('https://i.imgur.com/vH1Wf4U.png'); // ضع رابط صورة السيرفر الخاصة بك هنا

        const row1 = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('btn_ban_perm')
                .setLabel('Banned Perm')
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId('btn_ban_temp')
                .setLabel('Banned Temporary')
                .setStyle(ButtonStyle.Danger)
        );

        const row2 = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('btn_warn_1')
                .setLabel('Warn 1')
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId('btn_warn_2')
                .setLabel('Warn 2')
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId('btn_warn_3')
                .setLabel('Warn 3')
                .setStyle(ButtonStyle.Danger)
        );

        await interaction.channel.send({ embeds: [embed], components: [row1, row2] });
        await interaction.reply({ content: '✅ تم إرسال لوحة العقوبات بنجاح.', ephemeral: true });
    },
};