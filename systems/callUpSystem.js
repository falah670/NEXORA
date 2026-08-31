const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'callUpSystem',
    async sendCallUp(interaction, targetUser, reason, adminUser) {
        try {
            const embed = new EmbedBuilder()
                .setTitle('🚨 تنبيه استدعاء إداري')
                .setDescription(`تم استدعاؤك بواسطة الإدارة في سيرفر **${interaction.guild.name}**.`)
                .addFields(
                    { name: '📋 السبب', value: reason, inline: false },
                    { name: '👮‍♂️ الإداري المسؤول', value: `${adminUser}`, inline: true },
                    { name: '💬 الإجراء المطلوب', value: 'يرجى التوجه إلى رومات الدعم الفني أو التواصل مع الإداري فوراً.', inline: false }
                )
                .setColor(0xE74C3C)
                .setTimestamp();

            await targetUser.send({ embeds: [embed] });
            return true;
        } catch (error) {
            console.error('فشل إرسال رسالة الاستدعاء الخاصة:', error);
            return false;
        }
    }
};