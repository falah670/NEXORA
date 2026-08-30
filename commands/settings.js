const { SlashCommandBuilder } = require('discord.js');
const { getGuildSettings } = require('../systems/config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('settings')
        .setDescription('عرض إعدادات السيرفر'),

    async execute(interaction) {
        const settings = getGuildSettings(interaction.guild.id);

        await interaction.reply({
            ephemeral: true,
            content:
                `⚙️ **إعدادات Falah Systems**\n\n` +
                `🏠 **اسم السيرفر:** ${interaction.guild.name}\n\n` +

                `🎫 **فئة التذاكر:** ${
                    settings.ticketCategory
                        ? `<#${settings.ticketCategory}>`
                        : 'غير محدد'
                }\n` +

                `👥 **رتبة دعم التذاكر:** ${
                    settings.ticketSupportRole
                        ? `<@&${settings.ticketSupportRole}>`
                        : 'غير محدد'
                }\n` +

                `📜 **لوق التذاكر:** ${
                    settings.ticketLogChannel
                        ? `<#${settings.ticketLogChannel}>`
                        : 'غير محدد'
                }\n\n` +

                `⚖️ **لوق العقوبات:** ${
                    settings.punishmentLogChannel
                        ? `<#${settings.punishmentLogChannel}>`
                        : 'غير محدد'
                }\n\n` +

                `📢 **روم Call Up:** ${
                    settings.callUpChannel
                        ? `<#${settings.callUpChannel}>`
                        : 'غير محدد'
                }\n\n` +

                `⏳ **روم Waiting:** ${
                    settings.waitingChannel
                        ? `<#${settings.waitingChannel}>`
                        : 'غير محدد'
                }\n` +

                `⏰ **تنبيه الانتظار بعد:** ${settings.waitingWarningMinutes} دقائق\n\n` +

                `⭐ **نظام النقاط:** ${
                    settings.pointsEnabled
                        ? 'مفعل'
                        : 'غير مفعل'
                }`
        });
    }
};