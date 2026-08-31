const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const callUpSystem = require('../systems/callUpSystem');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('callup')
        .setDescription('استدعاء عضو وإرسال تنبيه خاص له على الخاص')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('العضو المراد استدعاؤه')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('reason')
                .setDescription('سبب الاستدعاء')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    async execute(interaction) {
        const targetUser = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason');
        const adminUser = interaction.user;

        const success = await callUpSystem.sendCallUp(interaction, targetUser, reason, adminUser);

        if (success) {
            await interaction.reply({ content: `✅ تم إرسال تنبيه الاستدعاء إلى العضو ${targetUser} بنجاح.`, ephemeral: true });
        } else {
            await interaction.reply({ content: `❌ تعذر إرسال الرسالة الخاصة للعضو ${targetUser} (قد يكون مغلقاً للخاص).`, ephemeral: true });
        }
    },
};