const {
    SlashCommandBuilder,
    PermissionFlagsBits
} = require('discord.js');


const {
    createWaitingPanel
} = require('../systems/waitingSystem');


module.exports = {

    data:
        new SlashCommandBuilder()

            .setName(
                'waiting'
            )

            .setDescription(
                'إرسال لوحة نظام الانتظار'
            )

            .setDefaultMemberPermissions(
                PermissionFlagsBits.Administrator
            ),


    async execute(interaction) {

        try {

            await createWaitingPanel(
                interaction
            );

        } catch (error) {

            console.error(
                'خطأ في إنشاء لوحة الانتظار:',
                error
            );


            if (
                !interaction.replied &&
                !interaction.deferred
            ) {

                await interaction.reply({

                    content:
                        '❌ حدث خطأ أثناء إنشاء لوحة الانتظار.',

                    ephemeral:
                        true
                });
            }
        }
    }
};