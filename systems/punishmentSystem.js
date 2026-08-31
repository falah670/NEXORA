const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'punishmentSystem',

    async handleButton(interaction) {
        const customId = interaction.customId;

        // تحديد نوع العقوبة حسب الزر
        let title = '';
        if (customId === 'btn_ban_perm') title = 'Banned Perm - حظر دائم';
        if (customId === 'btn_ban_temp') title = 'Banned Temporary - حظر مؤقت';
        if (customId === 'btn_warn_1') title = 'Warn 1 - تحذير أول';
        if (customId === 'btn_warn_2') title = 'Warn 2 - تحذير ثاني';
        if (customId === 'btn_warn_3') title = 'Warn 3 - تحذير ثالث';

        const modal = new ModalBuilder()
            .setCustomId(`modal_${customId}`)
            .setTitle(title);

        const userInput = new TextInputBuilder()
            .setCustomId('player_id')
            .setLabel('معرف اللاعب (Discord ID / Steam HEX / FiveM ID)')
            .setPlaceholder('مثال: 412356789123456789')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const reasonInput = new TextInputBuilder()
            .setCustomId('punish_reason')
            .setLabel('سبب العقوبة / Reason')
            .setPlaceholder('اكتب سبب العقوبة بالتفصيل...')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

        const rows = [new ActionRowBuilder().addComponents(userInput), new ActionRowBuilder().addComponents(reasonInput)];

        if (customId === 'btn_ban_temp') {
            const durationInput = new TextInputBuilder()
                .setCustomId('ban_duration')
                .setLabel('مدة الحظر (مثال: 3d أو 7d)')
                .setPlaceholder('3d')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);
            rows.push(new ActionRowBuilder().addComponents(durationInput));
        }

        modal.addComponents(rows);
        await interaction.showModal(modal);
    },

    async handleModalSubmit(interaction) {
        const customId = interaction.customId;
        const playerId = interaction.fields.getTextInputValue('player_id');
        const reason = interaction.fields.getTextInputValue('punish_reason');
        const admin = interaction.user;

        let typeLabel = '';
        if (customId === 'modal_btn_ban_perm') typeLabel = '🛑 حظر دائم (Permanent Ban)';
        if (customId === 'modal_btn_ban_temp') {
            const duration = interaction.fields.getTextInputValue('ban_duration');
            typeLabel = `⏳ حظر مؤقت (${duration})`;
        }
        if (customId === 'modal_btn_warn_1') typeLabel = '⚠️ تحذير (Warn 1)';
        if (customId === 'modal_btn_warn_2') typeLabel = '⚠️⚠️ تحذير (Warn 2)';
        if (customId === 'modal_btn_warn_3') typeLabel = '🚨 تحذير نهائي (Warn 3)';

        const logEmbed = new EmbedBuilder()
            .setTitle('📋 تسجيل عقوبة جديدة')
            .addFields(
                { name: '👤 العضو / ID', value: `\`${playerId}\``, inline: true },
                { name: '⚖️ نوع العقوبة', value: typeLabel, inline: true },
                { name: '👮‍♂️ الإداري', value: `${admin}`, inline: true },
                { name: '📝 السبب', value: reason, inline: false }
            )
            .setColor(0x990000)
            .setTimestamp();

        await interaction.reply({ content: `✅ تم تسجيل العقوبة بنجاح للاعب \`${playerId}\`.`, ephemeral: true });
        
        // إرسال اللوج في روم التسجيل إذا كان محدداً
        if (interaction.channel) {
            await interaction.channel.send({ embeds: [logEmbed] });
        }
    }
};