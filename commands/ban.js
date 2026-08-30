const {
    SlashCommandBuilder,
    PermissionFlagsBits
} = require('discord.js');

const {
    parseDuration,
    formatDuration,
    addPunishment,
    getActivePunishment,
    sendPunishmentLog
} = require('../systems/punishmentSystem');


module.exports = {

    data:
        new SlashCommandBuilder()

            .setName('ban')

            .setDescription(
                'إعطاء عضو باند مؤقت'
            )

            .setDefaultMemberPermissions(
                PermissionFlagsBits.BanMembers
            )

            .addUserOption(option =>
                option

                    .setName('user')

                    .setDescription(
                        'العضو الذي تريد إعطاءه باند'
                    )

                    .setRequired(true)
            )

            .addStringOption(option =>
                option

                    .setName('duration')

                    .setDescription(
                        'مدة الباند مثال: 1h أو 1d أو 1w'
                    )

                    .setRequired(true)
            )

            .addStringOption(option =>
                option

                    .setName('reason')

                    .setDescription(
                        'سبب الباند'
                    )

                    .setRequired(false)
            ),


    async execute(interaction) {

        const user =
            interaction.options.getUser(
                'user'
            );


        const durationText =
            interaction.options.getString(
                'duration'
            );


        const reason =
            interaction.options.getString(
                'reason'
            ) ||
            'لم يتم تحديد سبب';


        const duration =
            parseDuration(
                durationText
            );


        if (!duration) {

            return interaction.reply({

                ephemeral: true,

                content:

                    '❌ صيغة الوقت غير صحيحة.\n\n' +

                    'استخدم مثل:\n' +

                    '`10m` = 10 دقائق\n' +

                    '`2h` = ساعتين\n' +

                    '`1d` = يوم\n' +

                    '`1w` = أسبوع'
            });
        }


        if (
            user.id ===
            interaction.user.id
        ) {

            return interaction.reply({

                ephemeral: true,

                content:
                    '❌ لا يمكنك إعطاء نفسك باند.'
            });
        }


        const member =
            await interaction.guild.members.fetch(
                user.id
            ).catch(
                () => null
            );


        if (member) {

            if (
                member.permissions.has(
                    PermissionFlagsBits.Administrator
                )
            ) {

                return interaction.reply({

                    ephemeral: true,

                    content:
                        '❌ لا يمكنك إعطاء باند لعضو إداري.'
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


            if (!member.bannable) {

                return interaction.reply({

                    ephemeral: true,

                    content:
                        '❌ لا يمكن للبوت إعطاء هذا العضو باند. تأكد من ترتيب رتبة البوت.'
                });
            }
        }


        const existingPunishment =
            getActivePunishment(

                interaction.guild.id,

                user.id,

                'ban'
            );


        if (existingPunishment) {

            return interaction.reply({

                ephemeral: true,

                content:
                    '❌ هذا العضو لديه باند مؤقت نشط بالفعل.'
            });
        }


        try {

            await interaction.guild.members.ban(

                user.id,

                {
                    reason:
                        `${reason} | بواسطة ${interaction.user.tag}`
                }
            );


            const expiresAt =
                Date.now() +
                duration;


            addPunishment({

                guildId:
                    interaction.guild.id,

                userId:
                    user.id,

                moderatorId:
                    interaction.user.id,

                type:
                    'ban',

                reason,

                duration,

                expiresAt
            });


            await sendPunishmentLog({

                guild:
                    interaction.guild,

                type:
                    'ban',

                user:
                    `${user}`,

                moderator:
                    `${interaction.user}`,

                reason,

                duration,

                action:
                    '🔨 باند مؤقت'
            });


            await interaction.reply({

                embeds: [

                    {
                        title:
                            '🔨 تم إعطاء باند',

                        description:

                            `👤 **العضو:** ${user}\n` +

                            `👮 **بواسطة:** ${interaction.user}\n` +

                            `⏱️ **المدة:** ${formatDuration(duration)}\n` +

                            `📝 **السبب:** ${reason}`,

                        timestamp:
                            new Date().toISOString()
                    }
                ]
            });

        } catch (error) {

            console.error(
                'خطأ في تنفيذ أمر الباند:',
                error
            );


            await interaction.reply({

                ephemeral: true,

                content:
                    '❌ حدث خطأ أثناء إعطاء الباند.'
            });
        }
    }
};