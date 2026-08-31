const ticketSystem = require('../systems/ticketSystem');
const punishmentSystem = require('../systems/punishmentSystem');
const waitingSystem = require('../systems/waitingSystem');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        // معالجة الأوامر العادية (Slash Commands)
        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);
            if (!command) return;

            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(`❌ حدث خطأ أثناء تنفيذ الأمر ${interaction.commandName}:`, error);
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ content: 'حدث خطأ أثناء تنفيذ هذا الأمر!', ephemeral: true });
                } else {
                    await interaction.reply({ content: 'حدث خطأ أثناء تنفيذ هذا الأمر!', ephemeral: true });
                }
            }
            return;
        }

        // معالجة الأزرار (Buttons)
        if (interaction.isButton()) {
            // أزرار نظام التذاكر
            if (interaction.customId === 'create_ticket' || interaction.customId === 'close_ticket') {
                return ticketSystem.handleButton(interaction);
            }

            // أزرار نظام العقوبات (الباند والتحذيرات)
            if (interaction.customId.startsWith('btn_')) {
                return punishmentSystem.handleButton(interaction);
            }

            // أزرار نظام الانتظار (دخول، خروج، نقاطي)
            if (interaction.customId.startsWith('wait_')) {
                return waitingSystem.handleButton(interaction);
            }
            return;
        }

        // معالجة النماذج المنبثقة (Modals)
        if (interaction.isModalSubmit()) {
            // نموذج العقوبات
            if (interaction.customId.startsWith('modal_btn_')) {
                return punishmentSystem.handleModalSubmit(interaction);
            }
            return;
        }
    },
};