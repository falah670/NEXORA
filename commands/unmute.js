const {
    SlashCommandBuilder,
    PermissionFlagsBits
} = require('discord.js');

const {
    loadPunishments,
    savePunishments,
    sendPunishmentLog
} = require('../systems/punishmentSystem');


module.exports = {

    data:
        new SlashCommandBuilder()

            .setName('unmute')

            .setDescription(
                'فك الميوت عن عضو'
            )

            .setDefaultMemberPermissions(
                PermissionFlagsBits.ModerateMembers
            )

            .addUserOption(option =>
                option

                    .setName('user')

                    .setDescription(
                        'العضو الذي تريد فك الميوت عنه'
                    )

                    .setRequired(true)
            )

            .addStringOption(option =>
                option

                    .setName('reason')

                    .setDescription(
                        'سبب فك الميوت'
                    )

                    .setRequired(false)
            ),


    async execute(interaction) {

        const user =
            interaction.options.getUser(
                'user'
            );


        const reason =
            interaction.options.getString(
                'reason'
            ) ||
            'تم فك الميوت بواسطة الإدارة';


        const member =
            await interaction.guild.members.fetch(
                user.id
            ).catch(
                () => null
            );


        if (!member) {

            return interaction.reply({

                ephemeral: true,

                content:
                    '❌ هذا العضو غير موجود في السيرفر.'
            });
        }


        if (!member.moderatable) {

            return interaction.reply({

                ephemeral: true,

                content:
                    '❌ لا يمكن للبوت إدارة هذا العضو. تأكد من ترتيب رتبة البوت.'
            });
        }


        if (
            !member.communicationDisabledUntil ||
            member.communicationDisabledUntilTimestamp <= Date.now()
        ) {

            return interaction.reply({

                ephemeral: true,

                content:
                    '❌ هذا العضو لا يملك ميوت نشط.'
            });
        }


        try {

            await member.timeout(

                null,

                `${reason} | بواسطة ${interaction.user.tag}`
            );


            const punishments =
                loadPunishments();


            const updatedPunishments =
                punishments.filter(

                    punishment =>

                        !(
                            punishment.guildId ===
                            interaction.guild.id &&

                            punishment.userId ===
                            user.id &&

                            punishment.type ===
                            'mute'
                        )
                );


            savePunishments(
                updatedPunishments
            );


            await sendPunishmentLog({

                guild:
                    interaction.guild,

                type:
                    'unmute',

                user:
                    `${user}`,

                moderator:
                    `${interaction.user}`,

                reason,

                action:
                    '🔊 فك الميوت'
            });


            await interaction.reply({

                embeds: [

                    {
                        title:
                            '🔊 تم فك الميوت',

                        description:

                            `👤 **العضو:** ${user}\n` +

                            `👮 **بواسطة:** ${interaction.user}\n` +

                            `📝 **السبب:** ${reason}`,

                        timestamp:
                            new Date().toISOString()
                    }
                ]
            });

        } catch (error) {

            console.error(
                'خطأ في تنفيذ أمر فك الميوت:',
                error
            );


            await interaction.reply({

                ephemeral: true,

                content:
                    '❌ حدث خطأ أثناء فك الميوت.'
            });
        }
    }
};