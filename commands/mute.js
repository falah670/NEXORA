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

            .setName('mute')

            .setDescription(
                'إعطاء عضو ميوت مؤقت'
            )

            .setDefaultMemberPermissions(
                PermissionFlagsBits.ModerateMembers
            )

            .addUserOption(option =>
                option

                    .setName('user')

                    .setDescription(
                        'العضو الذي تريد إعطاءه ميوت'
                    )

                    .setRequired(true)
            )

            .addStringOption(option =>
                option

                    .setName('duration')

                    .setDescription(
                        'مدة الميوت مثال: 10m أو 2h أو 1d'
                    )

                    .setRequired(true)
            )

            .addStringOption(option =>
                option

                    .setName('reason')

                    .setDescription(
                        'سبب الميوت'
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


        // Discord Timeout له حد أقصى 28 يوم
        const maxTimeout =
            28 *
            24 *
            60 *
            60 *
            1000;


        if (
            duration > maxTimeout
        ) {

            return interaction.reply({

                ephemeral: true,

                content:
                    '❌ أقصى مدة للميوت هي 28 يوم.'
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
            user.id ===
            interaction.user.id
        ) {

            return interaction.reply({

                ephemeral: true,

                content:
                    '❌ لا يمكنك إعطاء نفسك ميوت.'
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
                    '❌ لا يمكنك إعطاء ميوت لعضو إداري.'
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


        if (!member.moderatable) {

            return interaction.reply({

                ephemeral: true,

                content:
                    '❌ لا يمكن للبوت إعطاء هذا العضو ميوت. تأكد من ترتيب رتبة البوت.'
            });
        }


        const existingPunishment =
            getActivePunishment(

                interaction.guild.id,

                user.id,

                'mute'
            );


        if (existingPunishment) {

            return interaction.reply({

                ephemeral: true,

                content:
                    '❌ هذا العضو لديه ميوت نشط بالفعل.'
            });
        }


        try {

            await member.timeout(

                duration,

                `${reason} | بواسطة ${interaction.user.tag}`
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
                    'mute',

                reason,

                duration,

                expiresAt
            });


            await sendPunishmentLog({

                guild:
                    interaction.guild,

                type:
                    'mute',

                user:
                    `${user}`,

                moderator:
                    `${interaction.user}`,

                reason,

                duration,

                action:
                    '🔇 ميوت مؤقت'
            });


            await interaction.reply({

                embeds: [

                    {
                        title:
                            '🔇 تم إعطاء ميوت',

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
                'خطأ في تنفيذ أمر الميوت:',
                error
            );


            await interaction.reply({

                ephemeral: true,

                content:
                    '❌ حدث خطأ أثناء إعطاء الميوت.'
            });
        }
    }
};