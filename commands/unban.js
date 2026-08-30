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

            .setName('unban')

            .setDescription(
                'فك الباند عن عضو'
            )

            .setDefaultMemberPermissions(
                PermissionFlagsBits.BanMembers
            )

            .addStringOption(option =>
                option

                    .setName('userid')

                    .setDescription(
                        'ايدي العضو الذي تريد فك الباند عنه'
                    )

                    .setRequired(true)
            )

            .addStringOption(option =>
                option

                    .setName('reason')

                    .setDescription(
                        'سبب فك الباند'
                    )

                    .setRequired(false)
            ),


    async execute(interaction) {

        const userId =
            interaction.options.getString(
                'userid'
            );


        const reason =
            interaction.options.getString(
                'reason'
            ) ||
            'تم فك الباند بواسطة الإدارة';


        if (
            !/^\d{17,20}$/.test(
                userId
            )
        ) {

            return interaction.reply({

                ephemeral: true,

                content:
                    '❌ يرجى إدخال ID صحيح للعضو.'
            });
        }


        try {

            const bans =
                await interaction.guild.bans.fetch();


            const bannedUser =
                bans.get(
                    userId
                );


            if (!bannedUser) {

                return interaction.reply({

                    ephemeral: true,

                    content:
                        '❌ هذا العضو غير محظور من السيرفر.'
                });
            }


            await interaction.guild.members.unban(

                userId,

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
                            userId &&

                            punishment.type ===
                            'ban'
                        )
                );


            savePunishments(
                updatedPunishments
            );


            await sendPunishmentLog({

                guild:
                    interaction.guild,

                type:
                    'unban',

                user:
                    `<@${userId}>`,

                moderator:
                    `${interaction.user}`,

                reason,

                action:
                    '🔓 فك الباند'
            });


            await interaction.reply({

                embeds: [

                    {
                        title:
                            '🔓 تم فك الباند',

                        description:

                            `👤 **العضو:** <@${userId}>\n` +

                            `👮 **بواسطة:** ${interaction.user}\n` +

                            `📝 **السبب:** ${reason}`,

                        timestamp:
                            new Date().toISOString()
                    }
                ]
            });

        } catch (error) {

            console.error(
                'خطأ في تنفيذ أمر فك الباند:',
                error
            );


            await interaction.reply({

                ephemeral: true,

                content:
                    '❌ حدث خطأ أثناء فك الباند.'
            });
        }
    }
};