const {
    SlashCommandBuilder,
    PermissionFlagsBits
} = require('discord.js');

const {
    sendPunishmentLog
} = require('../systems/punishmentSystem');


module.exports = {

    data:
        new SlashCommandBuilder()

            .setName('kick')

            .setDescription(
                'طرد عضو من السيرفر'
            )

            .setDefaultMemberPermissions(
                PermissionFlagsBits.KickMembers
            )

            .addUserOption(option =>
                option

                    .setName('user')

                    .setDescription(
                        'العضو الذي تريد طرده'
                    )

                    .setRequired(true)
            )

            .addStringOption(option =>
                option

                    .setName('reason')

                    .setDescription(
                        'سبب الطرد'
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
            'لم يتم تحديد سبب';


        if (
            user.id ===
            interaction.user.id
        ) {

            return interaction.reply({

                ephemeral: true,

                content:
                    '❌ لا يمكنك طرد نفسك.'
            });
        }


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


        if (
            member.permissions.has(
                PermissionFlagsBits.Administrator
            )
        ) {

            return interaction.reply({

                ephemeral: true,

                content:
                    '❌ لا يمكنك طرد عضو إداري.'
            });
        }


        if (
            member.roles.highest.position >=
            interaction.member.roles.highest.position &&
            interaction.guild.ownerId !==
            interaction.user.id
        ) {

            return interaction.reply({

                ephemeral: true,

                content:
                    '❌ لا يمكنك معاقبة عضو رتبته مساوية أو أعلى من رتبتك.'
            });
        }


        if (!member.kickable) {

            return interaction.reply({

                ephemeral: true,

                content:
                    '❌ لا يمكن للبوت طرد هذا العضو. تأكد من ترتيب رتبة البوت.'
            });
        }


        try {

            await member.kick(

                `${reason} | بواسطة ${interaction.user.tag}`
            );


            await sendPunishmentLog({

                guild:
                    interaction.guild,

                type:
                    'kick',

                user:
                    `${user}`,

                moderator:
                    `${interaction.user}`,

                reason,

                action:
                    '👢 طرد عضو'
            });


            await interaction.reply({

                embeds: [

                    {
                        title:
                            '👢 تم طرد العضو',

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
                'خطأ في تنفيذ أمر الطرد:',
                error
            );


            await interaction.reply({

                ephemeral: true,

                content:
                    '❌ حدث خطأ أثناء طرد العضو.'
            });
        }
    }
};