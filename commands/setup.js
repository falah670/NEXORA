const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    ChannelType
} = require('discord.js');

const {
    updateGuildSetting
} = require('../systems/config');


module.exports = {

    data: new SlashCommandBuilder()

        .setName('setup')

        .setDescription('إعداد نظام Falah Systems')

        .setDefaultMemberPermissions(
            PermissionFlagsBits.Administrator
        )


        // =========================
        // إعداد فئة التذاكر
        // =========================
        .addSubcommand(subcommand =>
            subcommand

                .setName('ticket-category')

                .setDescription('تحديد فئة التذاكر')

                .addChannelOption(option =>
                    option

                        .setName('category')

                        .setDescription('اختر فئة التذاكر')

                        .addChannelTypes(
                            ChannelType.GuildCategory
                        )

                        .setRequired(true)
                )
        )


        // =========================
        // إعداد رتبة دعم التذاكر
        // =========================
        .addSubcommand(subcommand =>
            subcommand

                .setName('ticket-support-role')

                .setDescription('تحديد رتبة دعم التذاكر')

                .addRoleOption(option =>
                    option

                        .setName('role')

                        .setDescription('اختر رتبة الدعم')

                        .setRequired(true)
                )
        )


        // =========================
        // لوق التذاكر
        // =========================
        .addSubcommand(subcommand =>
            subcommand

                .setName('ticket-log')

                .setDescription('تحديد روم لوق التذاكر')

                .addChannelOption(option =>
                    option

                        .setName('channel')

                        .setDescription('اختر روم اللوق')

                        .addChannelTypes(
                            ChannelType.GuildText
                        )

                        .setRequired(true)
                )
        )


        // =========================
        // لوق العقوبات
        // =========================
        .addSubcommand(subcommand =>
            subcommand

                .setName('punishment-log')

                .setDescription('تحديد روم لوق العقوبات')

                .addChannelOption(option =>
                    option

                        .setName('channel')

                        .setDescription('اختر روم لوق العقوبات')

                        .addChannelTypes(
                            ChannelType.GuildText
                        )

                        .setRequired(true)
                )
        )


        // =========================
        // روم مراجعة العقوبات
        // =========================
        .addSubcommand(subcommand =>
            subcommand

                .setName('punishment-review-channel')

                .setDescription(
                    'تحديد روم مراجعة واعتماد العقوبات'
                )

                .addChannelOption(option =>
                    option

                        .setName('channel')

                        .setDescription(
                            'اختر روم مراجعة العقوبات'
                        )

                        .addChannelTypes(
                            ChannelType.GuildText
                        )

                        .setRequired(true)
                )
        )


        // =========================
        // رتبة الحظر الدائم
        // =========================
        .addSubcommand(subcommand =>
            subcommand

                .setName('banned-permanent-role')

                .setDescription(
                    'تحديد رتبة الحظر الدائم'
                )

                .addRoleOption(option =>
                    option

                        .setName('role')

                        .setDescription(
                            'اختر رتبة الحظر الدائم'
                        )

                        .setRequired(true)
                )
        )


        // =========================
        // رتبة الحظر المؤقت
        // =========================
        .addSubcommand(subcommand =>
            subcommand

                .setName('banned-temporary-role')

                .setDescription(
                    'تحديد رتبة الحظر المؤقت'
                )

                .addRoleOption(option =>
                    option

                        .setName('role')

                        .setDescription(
                            'اختر رتبة الحظر المؤقت'
                        )

                        .setRequired(true)
                )
        )


        // =========================
        // رتبة التحذير الأول
        // =========================
        .addSubcommand(subcommand =>
            subcommand

                .setName('warn-1-role')

                .setDescription(
                    'تحديد رتبة التحذير الأول'
                )

                .addRoleOption(option =>
                    option

                        .setName('role')

                        .setDescription(
                            'اختر رتبة التحذير الأول'
                        )

                        .setRequired(true)
                )
        )


        // =========================
        // رتبة التحذير الثاني
        // =========================
        .addSubcommand(subcommand =>
            subcommand

                .setName('warn-2-role')

                .setDescription(
                    'تحديد رتبة التحذير الثاني'
                )

                .addRoleOption(option =>
                    option

                        .setName('role')

                        .setDescription(
                            'اختر رتبة التحذير الثاني'
                        )

                        .setRequired(true)
                )
        )


        // =========================
        // رتبة التحذير الثالث
        // =========================
        .addSubcommand(subcommand =>
            subcommand

                .setName('warn-3-role')

                .setDescription(
                    'تحديد رتبة التحذير الثالث'
                )

                .addRoleOption(option =>
                    option

                        .setName('role')

                        .setDescription(
                            'اختر رتبة التحذير الثالث'
                        )

                        .setRequired(true)
                )
        )


        // =========================
        // إنشاء روم Call Up تلقائياً
        // =========================
        .addSubcommand(subcommand =>
            subcommand

                .setName('callup-channel')

                .setDescription(
                    'إنشاء وإعداد روم Call Up تلقائياً'
                )
        )


        // =========================
        // روم Waiting الصوتي
        // =========================
        .addSubcommand(subcommand =>
            subcommand

                .setName('waiting-channel')

                .setDescription(
                    'تحديد روم Waiting الصوتي'
                )

                .addChannelOption(option =>
                    option

                        .setName('channel')

                        .setDescription(
                            'اختر روم Waiting الصوتي'
                        )

                        .addChannelTypes(
                            ChannelType.GuildVoice
                        )

                        .setRequired(true)
                )
        )


        // =========================
        // رتبة إداريين Waiting
        // =========================
        .addSubcommand(subcommand =>
            subcommand

                .setName('waiting-admin-role')

                .setDescription(
                    'تحديد رتبة الإداريين لنظام Waiting'
                )

                .addRoleOption(option =>
                    option

                        .setName('role')

                        .setDescription(
                            'اختر رتبة الإداريين'
                        )

                        .setRequired(true)
                )
        )


        // =========================
        // روم صوتي للإداريين Waiting
        // يمكن استخدام الأمر أكثر من مرة
        // =========================
        .addSubcommand(subcommand =>
            subcommand

                .setName('waiting-staff-channel')

                .setDescription(
                    'إضافة روم صوتي للإداريين في Waiting'
                )

                .addChannelOption(option =>
                    option

                        .setName('channel')

                        .setDescription(
                            'اختر روم الإداريين الصوتي'
                        )

                        .addChannelTypes(
                            ChannelType.GuildVoice
                        )

                        .setRequired(true)
                )
        )


        // =========================
        // روم إشعارات Waiting
        // =========================
        .addSubcommand(subcommand =>
            subcommand

                .setName('waiting-notification')

                .setDescription(
                    'تحديد روم إشعارات نظام Waiting'
                )

                .addChannelOption(option =>
                    option

                        .setName('channel')

                        .setDescription(
                            'اختر روم إشعارات Waiting'
                        )

                        .addChannelTypes(
                            ChannelType.GuildText
                        )

                        .setRequired(true)
                )
        )


        // =========================
        // مدة تنبيه الانتظار
        // =========================
        .addSubcommand(subcommand =>
            subcommand

                .setName('waiting-warning')

                .setDescription(
                    'تحديد مدة تنبيه الانتظار'
                )

                .addIntegerOption(option =>
                    option

                        .setName('minutes')

                        .setDescription(
                            'عدد الدقائق قبل التنبيه'
                        )

                        .setMinValue(1)

                        .setMaxValue(120)

                        .setRequired(true)
                )
        )


        // =========================
        // مدة إخراج الإداري عند الخمول
        // =========================
        .addSubcommand(subcommand =>
            subcommand

                .setName('waiting-inactivity')

                .setDescription(
                    'مدة إخراج الإداري عند الميوت أو الصمم'
                )

                .addIntegerOption(option =>
                    option

                        .setName('minutes')

                        .setDescription(
                            'عدد دقائق الخمول قبل الإخراج'
                        )

                        .setMinValue(1)

                        .setMaxValue(1440)

                        .setRequired(true)
                )
        )


        // =========================
        // نقاط Waiting لكل ساعة
        // =========================
        .addSubcommand(subcommand =>
            subcommand

                .setName('waiting-points-hour')

                .setDescription(
                    'تحديد نقاط Waiting لكل ساعة'
                )

                .addIntegerOption(option =>
                    option

                        .setName('points')

                        .setDescription(
                            'عدد النقاط لكل ساعة'
                        )

                        .setMinValue(0)

                        .setMaxValue(100)

                        .setRequired(true)
                )
        )


        // =========================
        // نقاط لكل Call Up
        // =========================
        .addSubcommand(subcommand =>
            subcommand

                .setName('waiting-points-call')

                .setDescription(
                    'تحديد نقاط كل Call Up'
                )

                .addIntegerOption(option =>
                    option

                        .setName('points')

                        .setDescription(
                            'عدد النقاط لكل Call Up'
                        )

                        .setMinValue(0)

                        .setMaxValue(100)

                        .setRequired(true)
                )
        )


        // =========================
        // تشغيل أو إيقاف النقاط
        // =========================
        .addSubcommand(subcommand =>
            subcommand

                .setName('points')

                .setDescription(
                    'تشغيل أو إيقاف نظام النقاط'
                )

                .addBooleanOption(option =>
                    option

                        .setName('enabled')

                        .setDescription(
                            'تشغيل أو إيقاف النظام'
                        )

                        .setRequired(true)
                )
        ),


    async execute(interaction) {

        await interaction.deferReply({
            ephemeral: true
        });


        try {

            const subcommand =
                interaction.options.getSubcommand();


            let key;
            let value;
            let message;


            switch (subcommand) {


                // =========================
                // التذاكر
                // =========================
                case 'ticket-category':

                    value =
                        interaction.options.getChannel(
                            'category'
                        ).id;

                    key =
                        'ticketCategory';

                    message =
                        `🎫 تم تحديد فئة التذاكر: <#${value}>`;

                    break;


                case 'ticket-support-role':

                    value =
                        interaction.options.getRole(
                            'role'
                        ).id;

                    key =
                        'ticketSupportRole';

                    message =
                        `👥 تم تحديد رتبة دعم التذاكر: <@&${value}>`;

                    break;


                case 'ticket-log':

                    value =
                        interaction.options.getChannel(
                            'channel'
                        ).id;

                    key =
                        'ticketLogChannel';

                    message =
                        `📜 تم تحديد لوق التذاكر: <#${value}>`;

                    break;


                // =========================
                // العقوبات
                // =========================
                case 'punishment-log':

                    value =
                        interaction.options.getChannel(
                            'channel'
                        ).id;

                    key =
                        'punishmentLogChannel';

                    message =
                        `⚖️ تم تحديد روم لوق العقوبات: <#${value}>`;

                    break;


                case 'punishment-review-channel':

                    value =
                        interaction.options.getChannel(
                            'channel'
                        ).id;

                    key =
                        'punishmentReviewChannel';

                    message =
                        `🛡️ تم تحديد روم مراجعة العقوبات: <#${value}>`;

                    break;


                case 'banned-permanent-role':

                    value =
                        interaction.options.getRole(
                            'role'
                        ).id;

                    key =
                        'bannedPermanentRole';

                    message =
                        `🔨 تم تحديد رتبة الحظر الدائم: <@&${value}>`;

                    break;


                case 'banned-temporary-role':

                    value =
                        interaction.options.getRole(
                            'role'
                        ).id;

                    key =
                        'bannedTemporaryRole';

                    message =
                        `⏳ تم تحديد رتبة الحظر المؤقت: <@&${value}>`;

                    break;


                case 'warn-1-role':

                    value =
                        interaction.options.getRole(
                            'role'
                        ).id;

                    key =
                        'warn1Role';

                    message =
                        `⚠️ تم تحديد رتبة التحذير الأول: <@&${value}>`;

                    break;


                case 'warn-2-role':

                    value =
                        interaction.options.getRole(
                            'role'
                        ).id;

                    key =
                        'warn2Role';

                    message =
                        `⚠️ تم تحديد رتبة التحذير الثاني: <@&${value}>`;

                    break;


                case 'warn-3-role':

                    value =
                        interaction.options.getRole(
                            'role'
                        ).id;

                    key =
                        'warn3Role';

                    message =
                        `🚨 تم تحديد رتبة التحذير الثالث: <@&${value}>`;

                    break;


                // =========================
                // Call Up
                // =========================
                case 'callup-channel': {

                    const channelName =
                        '📢・call-up';


                    let callUpChannel =
                        interaction.guild.channels.cache.find(
                            channel =>
                                channel.name === channelName &&
                                channel.type === ChannelType.GuildText
                        );


                    if (!callUpChannel) {

                        callUpChannel =
                            await interaction.guild.channels.create({

                                name:
                                    channelName,

                                type:
                                    ChannelType.GuildText,

                                reason:
                                    `تم إنشاء روم Call Up بواسطة ${interaction.user.tag}`
                            });
                    }


                    key =
                        'callUpChannel';

                    value =
                        callUpChannel.id;


                    message =
                        `📢 تم إنشاء وإعداد روم Call Up: <#${value}>`;

                    break;
                }


                // =========================
                // Waiting
                // =========================
                case 'waiting-channel':

                    value =
                        interaction.options.getChannel(
                            'channel'
                        ).id;

                    key =
                        'waitingChannel';

                    message =
                        `⏳ تم تحديد روم Waiting الصوتي: <#${value}>`;

                    break;


                case 'waiting-admin-role':

                    value =
                        interaction.options.getRole(
                            'role'
                        ).id;

                    key =
                        'waitingAdminRole';

                    message =
                        `👮 تم تحديد رتبة إداريي Waiting: <@&${value}>`;

                    break;


                case 'waiting-staff-channel': {

                    const channel =
                        interaction.options.getChannel(
                            'channel'
                        );


                    const {
                        getGuildSettings
                    } = require('../systems/config');


                    const settings =
                        getGuildSettings(
                            interaction.guild.id
                        );


                    const currentChannels =
                        Array.isArray(
                            settings.waitingStaffVoiceChannels
                        )
                            ? settings.waitingStaffVoiceChannels
                            : [];


                    if (
                        !currentChannels.includes(
                            channel.id
                        )
                    ) {

                        currentChannels.push(
                            channel.id
                        );
                    }


                    key =
                        'waitingStaffVoiceChannels';

                    value =
                        currentChannels;


                    message =
                        `🎧 تم إضافة روم الإداريين لنظام Waiting: <#${channel.id}>`;

                    break;
                }


                case 'waiting-notification':

                    value =
                        interaction.options.getChannel(
                            'channel'
                        ).id;

                    key =
                        'waitingNotificationChannel';

                    message =
                        `🔔 تم تحديد روم إشعارات Waiting: <#${value}>`;

                    break;


                case 'waiting-warning':

                    value =
                        interaction.options.getInteger(
                            'minutes'
                        );

                    key =
                        'waitingWarningMinutes';

                    message =
                        `⏰ سيتم تنبيه الإداريين بعد انتظار العضو لمدة ${value} دقائق`;

                    break;


                case 'waiting-inactivity':

                    value =
                        interaction.options.getInteger(
                            'minutes'
                        );

                    key =
                        'waitingInactivityMinutes';

                    message =
                        `🔇 سيتم إخراج الإداري الخامل بعد ${value} دقائق`;

                    break;


                case 'waiting-points-hour':

                    value =
                        interaction.options.getInteger(
                            'points'
                        );

                    key =
                        'waitingPointsPerHour';

                    message =
                        `⭐ تم تحديد ${value} نقطة لكل ساعة Waiting`;

                    break;


                case 'waiting-points-call':

                    value =
                        interaction.options.getInteger(
                            'points'
                        );

                    key =
                        'waitingPointsPerCall';

                    message =
                        `📢 تم تحديد ${value} نقطة لكل Call Up`;

                    break;


                // =========================
                // نظام النقاط
                // =========================
                case 'points':

                    value =
                        interaction.options.getBoolean(
                            'enabled'
                        );

                    key =
                        'pointsEnabled';

                    message =
                        value
                            ? '⭐ تم تشغيل نظام النقاط'
                            : '⭐ تم إيقاف نظام النقاط';

                    break;


                default:

                    throw new Error(
                        `Subcommand غير معروف: ${subcommand}`
                    );
            }


            // =========================
            // حفظ الإعداد
            // =========================
            updateGuildSetting(

                interaction.guild.id,

                key,

                value
            );


            // =========================
            // رد النجاح
            // =========================
            await interaction.editReply({

                content:
                    `✅ ${message}`
            });


        } catch (error) {

            console.error(
                'خطأ في أمر setup:',
                error
            );


            await interaction.editReply({

                content:
                    '❌ حدث خطأ أثناء حفظ الإعداد. تحقق من الـ Terminal.'
            });
        }
    }
};