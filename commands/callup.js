const {
    SlashCommandBuilder,
    PermissionFlagsBits
} = require('discord.js');

const {
    createCallUpPanel
} = require('../systems/callUpSystem');


module.exports = {

    data: new SlashCommandBuilder()

        .setName('callup')

        .setDescription(
            'فتح لوحة استدعاء عضو'
        )

        .setDefaultMemberPermissions(
            PermissionFlagsBits.Administrator
        ),


    async execute(interaction) {

        await createCallUpPanel(
            interaction
        );
    }
};