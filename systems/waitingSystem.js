const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');

const {
    createEmbed,
    COLORS
} = require('./design/embedStyle');

const WAITING_ALERT_CHANNEL_ID = '1507762821616894024';
const WAITING_VOICE_CHANNEL_ID = '1504895587672133714';

// مدة الميوت أو الصمت قبل الإخراج
const MUTE_LIMIT_MS = 60 * 60 * 1000;

// مدة تنبيه الانتظار
const WAITING_REMINDER_MS = 10 * 60 * 1000;

// عدد النقاط عند استلام عضو من الانتظار
const POINTS_PER_CLAIM = 2;

// رومات الدعم
const supportRoomIds = [
    '1504895547729772674',
    '1504895551089676290',
    '1504895555019608265',
    '1504895558328909844',
    '1504895561529036911',
    '1504895564763107459',
    '1504895567590064148',
    '1504895570899239063',
    '1504895574254813381',
    '1504895577270255738',
    '1504895580994932906',
    '1504895584086261851'
];

// جلسات الانتظار
const activeSessions = new Map();

// وقت بداية الميوت أو الصمت
const mutedUsers = new Map();

// مؤقتات انتظار الأعضاء
const waitingTimers = new Map();

// الحالات التي تم استلامها
const claimedWaitingMembers = new Map();

module.exports = {

    name: 'waitingSystem',

    // ==================================================
    // إرسال لوحة الانتظار
    // ==================================================

    async sendPanel(interaction) {

        const embed = createEmbed({
            client: interaction.client,
            system: 'WAITING SYSTEM',
            title: '⏳ نظام الانتظار',
            description:
                '**مرحبًا بك في نظام الانتظار**\n\n' +
                'من خلال هذه اللوحة يمكنك تسجيل دخولك للانتظار، إنهاء الجلسة، ومعرفة رصيد نقاطك.\n\n' +

                '━━━━━━━━━━━━━━━━━━━━\n\n' +

                '🟢 **دخول الانتظار**\n' +
                'اضغط على الزر لبدء تسجيل وقتك واحتساب نقاطك أثناء تواجدك في رومات الدعم.\n\n' +

                '🔴 **الخروج**\n' +
                'اضغط على الزر لإنهاء جلسة الانتظار وحفظ النقاط المكتسبة.\n\n' +

                '⭐ **نقاطي**\n' +
                'استعرض رصيدك الحالي من النقاط المكتسبة.\n\n' +

                '━━━━━━━━━━━━━━━━━━━━\n\n' +

                '📌 **تنبيه**\n' +
                'يجب أن تكون متواجدًا في أحد رومات الدعم المخصصة حتى تتمكن من دخول الانتظار.',

            color: COLORS.waiting,

            // صورة Sword الكبيرة داخل اللوحة
            showSwordImage: true,

            // شعار البوت في أعلى اليمين
            showBotThumbnail: true
        });

        const row = new ActionRowBuilder()
            .addComponents(

                new ButtonBuilder()
                    .setCustomId('wait_join')
                    .setLabel('دخول الانتظار')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('🟢'),

                new ButtonBuilder()
                    .setCustomId('wait_leave')
                    .setLabel('الخروج')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('🔴'),

                new ButtonBuilder()
                    .setCustomId('wait_points')
                    .setLabel('نقاطي')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('⭐')
            );

        await interaction.channel.send({
            embeds: [embed],
            components: [row]
        });

        // منع خطأ Interaction has already been acknowledged
        if (!interaction.replied && !interaction.deferred) {

            await interaction.reply({
                content: '✅ تم إرسال لوحة نظام الانتظار بنجاح.',
                flags: 64
            }).catch(() => {});

        } else {

            await interaction.followUp({
                content: '✅ تم إرسال لوحة نظام الانتظار بنجاح.',
                flags: 64
            }).catch(() => {});
        }
    },

    // ==================================================
    // التعامل مع الأزرار
    // ==================================================

    async handleButton(interaction) {

        const member = interaction.member;
        const customId = interaction.customId;

        // ==================================================
        // استلام عضو من روم الانتظار
        // ==================================================

        if (customId.startsWith('wait_claim_')) {

            const waitingMemberId =
                customId.replace('wait_claim_', '');

            if (claimedWaitingMembers.has(waitingMemberId)) {

                const claimedBy =
                    claimedWaitingMembers.get(waitingMemberId);

                return interaction.reply({
                    content:
                        `⚠️ تم استلام هذا العضو مسبقاً بواسطة <@${claimedBy}>.`,
                    flags: 64
                });
            }

            claimedWaitingMembers.set(
                waitingMemberId,
                member.id
            );

            try {

                if (!interaction.client.waitingPoints) {
                    interaction.client.waitingPoints = new Map();
                }

                const currentPoints =
                    interaction.client.waitingPoints.get(member.id) || 0;

                const newPoints =
                    currentPoints + POINTS_PER_CLAIM;

                interaction.client.waitingPoints.set(
                    member.id,
                    newPoints
                );

                console.log(
                    `⭐ تم إضافة ${POINTS_PER_CLAIM} نقطة إلى ${member.user.tag} | الرصيد الجديد: ${newPoints}`
                );

                if (waitingTimers.has(waitingMemberId)) {

                    clearTimeout(
                        waitingTimers.get(waitingMemberId)
                    );

                    waitingTimers.delete(
                        waitingMemberId
                    );
                }

                const waitingMember =
                    await interaction.guild.members.fetch(
                        waitingMemberId
                    ).catch(() => null);

                if (
                    waitingMember &&
                    waitingMember.voice.channel &&
                    member.voice.channel
                ) {

                    await waitingMember.voice.setChannel(
                        member.voice.channel
                    ).catch(error => {

                        console.error(
                            '❌ تعذر سحب العضو:',
                            error
                        );
                    });
                }

                // ==================================================
                // رسالة استلام الحالة
                // ==================================================

                const claimedEmbed = new EmbedBuilder()
                    .setColor(0x57F287)
                    .setAuthor({
                        name: 'NEXORA • WAITING SYSTEM'
                    })
                    .setTitle('✅ تم استلام عضو الانتظار')
                    .setDescription(
                        '**تم استلام هذه الحالة بنجاح.**\n\n' +
                        'لم تعد الحالة بحاجة إلى تدخل إداري إضافي.'
                    )
                    .addFields(
                        {
                            name: '👤 العضو',
                            value: `<@${waitingMemberId}>`,
                            inline: true
                        },
                        {
                            name: '👮 تم الاستلام بواسطة',
                            value: `${member}`,
                            inline: true
                        },
                        {
                            name: '⭐ المكافأة',
                            value:
                                `${member} حصل على **${POINTS_PER_CLAIM} نقاط** مقابل استلام الحالة.\n` +
                                `الرصيد الحالي: **${newPoints} نقطة**`,
                            inline: false
                        },
                        {
                            name: '📍 الحالة',
                            value: '🟢 تم استلام العضو',
                            inline: false
                        }
                    )
                    .setThumbnail(
                        member.user.displayAvatarURL({
                            extension: 'png',
                            size: 256
                        })
                    )
                    .setFooter({
                        text: 'NEXORA • Waiting System'
                    })
                    .setTimestamp();

                const disabledRow =
                    new ActionRowBuilder()
                        .addComponents(

                            new ButtonBuilder()
                                .setCustomId(
                                    `wait_claim_${waitingMemberId}`
                                )
                                .setLabel(
                                    'تم استلام العضو'
                                )
                                .setStyle(
                                    ButtonStyle.Success
                                )
                                .setEmoji('✅')
                                .setDisabled(true)
                        );

                await interaction.update({
                    embeds: [claimedEmbed],
                    components: [disabledRow]
                });

                console.log(
                    `✅ ${member.user.tag} استلم العضو ${waitingMemberId} وحصل على ${POINTS_PER_CLAIM} نقاط`
                );

            } catch (error) {

                console.error(
                    '❌ حدث خطأ أثناء استلام عضو الانتظار:',
                    error
                );

                claimedWaitingMembers.delete(
                    waitingMemberId
                );

                if (
                    interaction.deferred ||
                    interaction.replied
                ) {

                    await interaction.followUp({
                        content:
                            '❌ حدث خطأ أثناء استلام الحالة.',
                        flags: 64
                    }).catch(() => {});

                } else {

                    await interaction.reply({
                        content:
                            '❌ حدث خطأ أثناء استلام الحالة.',
                        flags: 64
                    }).catch(() => {});
                }
            }

            return;
        }

        // ==================================================
        // دخول الانتظار
        // ==================================================

        if (customId === 'wait_join') {

            if (!member.voice.channel) {

                return interaction.reply({
                    content:
                        '❌ يجب أن تكون متواجداً في روم صوتي أساساً لتتمكن من دخول الانتظار.',
                    flags: 64
                });
            }

            const currentChannelId =
                member.voice.channel.id;

            const isSupportedRoom =
                supportRoomIds.includes(
                    currentChannelId
                );

            if (!isSupportedRoom) {

                return interaction.reply({
                    content:
                        `❌ هذا الروم غير موجود ضمن رومات الانتظار.\n\n` +
                        `📢 اسم الروم: **${member.voice.channel.name}**\n` +
                        `🆔 ID الروم: \`${currentChannelId}\``,
                    flags: 64
                });
            }

            if (activeSessions.has(member.id)) {

                return interaction.reply({
                    content:
                        '⚠️ أنت مسجل بالفعل في نظام الانتظار.',
                    flags: 64
                });
            }

            if (!interaction.client.waitingPoints) {
                interaction.client.waitingPoints = new Map();
            }

            activeSessions.set(member.id, {
                startTime: Date.now(),
                guildId: interaction.guild.id
            });

            if (
                member.voice.serverMute ||
                member.voice.serverDeaf
            ) {

                mutedUsers.set(
                    member.id,
                    Date.now()
                );
            }

            return interaction.reply({
                content:
                    '🟢 تم تسجيل دخولك بنجاح وبدأ حساب الوقت والنقاط.',
                flags: 64
            });
        }

        // ==================================================
        // الخروج من الانتظار
        // ==================================================

        if (customId === 'wait_leave') {

            if (!activeSessions.has(member.id)) {

                return interaction.reply({
                    content:
                        '⚠️ أنت لست مسجلاً في نظام الانتظار أساساً.',
                    flags: 64
                });
            }

            if (!interaction.client.waitingPoints) {
                interaction.client.waitingPoints = new Map();
            }

            const session =
                activeSessions.get(member.id);

            const elapsedHours =
                (Date.now() - session.startTime) /
                (1000 * 60 * 60);

            const currentPts =
                interaction.client.waitingPoints.get(member.id) || 0;

            const earnedPts =
                Math.floor(elapsedHours);

            if (earnedPts > 0) {

                interaction.client.waitingPoints.set(
                    member.id,
                    currentPts + earnedPts
                );
            }

            activeSessions.delete(member.id);
            mutedUsers.delete(member.id);

            const finalPoints =
                interaction.client.waitingPoints.get(member.id) || 0;

            return interaction.reply({
                content:
                    `🔴 تم إيقاف تسجيل النقاط والخروج بنجاح.\n` +
                    `النقاط المكتسبة لهذه الجلسة: \`${earnedPts}\`\n` +
                    `⭐ رصيدك الكلي الحالي: **${finalPoints} نقطة**`,
                flags: 64
            });
        }

        // ==================================================
        // النقاط
        // ==================================================

        if (customId === 'wait_points') {

            if (!interaction.client.waitingPoints) {
                interaction.client.waitingPoints = new Map();
            }

            let totalPts =
                interaction.client.waitingPoints.get(member.id) || 0;

            if (activeSessions.has(member.id)) {

                const session =
                    activeSessions.get(member.id);

                const elapsedHours =
                    (Date.now() - session.startTime) /
                    (1000 * 60 * 60);

                totalPts +=
                    Math.floor(elapsedHours);
            }

            return interaction.reply({
                content:
                    `⭐ رصيدك الحالي من النقاط: **${totalPts}** نقطة.`,
                flags: 64
            });
        }
    },

    // ==================================================
    // مراقبة روم Waiting
    // ==================================================

    async handleWaitingVoiceStateUpdate(
        oldState,
        newState
    ) {

        const member =
            newState.member;

        if (!member || member.user.bot) {
            return;
        }

        const guild =
            newState.guild;

        const oldChannelId =
            oldState.channelId;

        const newChannelId =
            newState.channelId;

        // ==================================================
        // دخول روم Waiting
        // ==================================================

        if (
            newChannelId ===
                WAITING_VOICE_CHANNEL_ID &&

            oldChannelId !==
                WAITING_VOICE_CHANNEL_ID
        ) {

            claimedWaitingMembers.delete(
                member.id
            );

            const alertChannel =
                guild.channels.cache.get(
                    WAITING_ALERT_CHANNEL_ID
                );

            if (alertChannel) {

                const waitingEmbed =
                    new EmbedBuilder()
                        .setColor(COLORS.waiting)
                        .setAuthor({
                            name: 'NEXORA • WAITING SYSTEM'
                        })
                        .setTitle(
                            '⏳ عضو جديد في قائمة الانتظار'
                        )
                        .setDescription(
                            '**يوجد عضو جديد في الانتظار ويحتاج إلى المساعدة.**\n\n' +
                            'يمكن لأحد الإداريين استلام الحالة مباشرة من الزر بالأسفل.'
                        )
                        .addFields(
                            {
                                name: '👤 العضو',
                                value: `${member}`,
                                inline: true
                            },
                            {
                                name: '📍 الموقع',
                                value:
                                    `<#${WAITING_VOICE_CHANNEL_ID}>`,
                                inline: true
                            },
                            {
                                name: '⏳ الحالة',
                                value:
                                    '🟡 بانتظار استلام أحد الإداريين للحالة',
                                inline: false
                            }
                        )
                        .setThumbnail(
                            member.user.displayAvatarURL({
                                extension: 'png',
                                size: 256
                            })
                        )
                        .setFooter({
                            text: 'NEXORA • Waiting System'
                        })
                        .setTimestamp();

                const claimRow =
                    new ActionRowBuilder()
                        .addComponents(

                            new ButtonBuilder()
                                .setCustomId(
                                    `wait_claim_${member.id}`
                                )
                                .setLabel(
                                    'استلام العضو'
                                )
                                .setStyle(
                                    ButtonStyle.Primary
                                )
                                .setEmoji('🙋')
                        );

                await alertChannel.send({
                    embeds: [waitingEmbed],
                    components: [claimRow]
                }).catch(console.error);
            }

            // ==================================================
            // مؤقت 10 دقائق
            // ==================================================

            const timer = setTimeout(
                async () => {

                    try {

                        if (
                            claimedWaitingMembers.has(
                                member.id
                            )
                        ) {

                            waitingTimers.delete(
                                member.id
                            );

                            return;
                        }

                        const freshMember =
                            await guild.members.fetch(
                                member.id
                            ).catch(() => null);

                        if (!freshMember) {

                            waitingTimers.delete(
                                member.id
                            );

                            return;
                        }

                        if (
                            freshMember.voice.channelId ===
                            WAITING_VOICE_CHANNEL_ID
                        ) {

                            const currentAlertChannel =
                                guild.channels.cache.get(
                                    WAITING_ALERT_CHANNEL_ID
                                );

                            if (currentAlertChannel) {

                                const reminderEmbed =
                                    new EmbedBuilder()
                                        .setColor(0xED4245)
                                        .setAuthor({
                                            name:
                                                'NEXORA • WAITING SYSTEM'
                                        })
                                        .setTitle(
                                            '🚨 تنبيه انتظار لمدة 10 دقائق'
                                        )
                                        .setDescription(
                                            '**الحالة ما زالت قيد الانتظار.**\n\n' +
                                            'العضو موجود في روم الانتظار ولم يتم استلامه حتى الآن.'
                                        )
                                        .addFields(
                                            {
                                                name: '👤 العضو',
                                                value:
                                                    `${freshMember}`,
                                                inline: true
                                            },
                                            {
                                                name: '📍 روم الانتظار',
                                                value:
                                                    `<#${WAITING_VOICE_CHANNEL_ID}>`,
                                                inline: true
                                            },
                                            {
                                                name: '🚨 المطلوب',
                                                value:
                                                    'الرجاء التوجه للعضو واستلام الحالة في أسرع وقت.',
                                                inline: false
                                            }
                                        )
                                        .setThumbnail(
                                            freshMember.user.displayAvatarURL({
                                                extension: 'png',
                                                size: 256
                                            })
                                        )
                                        .setFooter({
                                            text:
                                                'NEXORA • Waiting System'
                                        })
                                        .setTimestamp();

                                const reminderRow =
                                    new ActionRowBuilder()
                                        .addComponents(

                                            new ButtonBuilder()
                                                .setCustomId(
                                                    `wait_claim_${member.id}`
                                                )
                                                .setLabel(
                                                    'استلام العضو'
                                                )
                                                .setStyle(
                                                    ButtonStyle.Danger
                                                )
                                                .setEmoji('🚨')
                                        );

                                await currentAlertChannel.send({
                                    embeds: [
                                        reminderEmbed
                                    ],
                                    components: [
                                        reminderRow
                                    ]
                                }).catch(console.error);
                            }
                        }

                        waitingTimers.delete(
                            member.id
                        );

                    } catch (error) {

                        console.error(
                            '❌ خطأ أثناء فحص انتظار العضو:',
                            error
                        );

                        waitingTimers.delete(
                            member.id
                        );
                    }

                },

                WAITING_REMINDER_MS
            );

            waitingTimers.set(
                member.id,
                timer
            );

            console.log(
                `⏳ بدأ مؤقت انتظار 10 دقائق للعضو ${member.user.tag}`
            );
        }

        // ==================================================
        // خروج العضو من روم Waiting
        // ==================================================

        if (
            oldChannelId ===
                WAITING_VOICE_CHANNEL_ID &&

            newChannelId !==
                WAITING_VOICE_CHANNEL_ID
        ) {

            if (waitingTimers.has(member.id)) {

                clearTimeout(
                    waitingTimers.get(member.id)
                );

                waitingTimers.delete(
                    member.id
                );
            }

            claimedWaitingMembers.delete(
                member.id
            );

            console.log(
                `✅ خرج العضو ${member.user.tag} من روم الانتظار`
            );
        }

        // ==================================================
        // نظام الميوت والصمت الحالي
        // ==================================================

        const memberId =
            member.id;

        if (!activeSessions.has(memberId)) {
            return;
        }

        if (!newState.channel) {

            mutedUsers.delete(memberId);

            return;
        }

        const currentChannelId =
            newState.channel.id;

        const isSupportedRoom =
            supportRoomIds.includes(
                currentChannelId
            );

        if (!isSupportedRoom) {
            return;
        }

        const isMutedOrDeafened =
            newState.serverMute ||
            newState.serverDeaf;

        if (isMutedOrDeafened) {

            if (!mutedUsers.has(memberId)) {

                mutedUsers.set(
                    memberId,
                    Date.now()
                );

                console.log(
                    `🔇 بدأ عداد الميوت للعضو ${memberId}`
                );
            }

        } else {

            if (mutedUsers.has(memberId)) {

                mutedUsers.delete(
                    memberId
                );

                console.log(
                    `🔊 تم فك الميوت عن العضو ${memberId}`
                );
            }
        }
    },

    // ==================================================
    // فحص دوري للميوت
    // ==================================================

    startWaitingChecker(client) {

        console.log(
            '🕒 تم تشغيل مراقب الميوت والصمت لنظام الانتظار'
        );

        if (!client.waitingPoints) {
            client.waitingPoints = new Map();
        }

        setInterval(async () => {

            for (
                const [memberId, muteStartTime]
                of mutedUsers.entries()
            ) {

                if (!activeSessions.has(memberId)) {

                    mutedUsers.delete(memberId);

                    continue;
                }

                const mutedDuration =
                    Date.now() - muteStartTime;

                if (
                    mutedDuration <
                    MUTE_LIMIT_MS
                ) {
                    continue;
                }

                const session =
                    activeSessions.get(memberId);

                try {

                    const guild =
                        client.guilds.cache.get(
                            session.guildId
                        );

                    if (!guild) {
                        continue;
                    }

                    const member =
                        await guild.members.fetch(
                            memberId
                        ).catch(() => null);

                    if (!member) {

                        activeSessions.delete(
                            memberId
                        );

                        mutedUsers.delete(
                            memberId
                        );

                        continue;
                    }

                    const stillMuted =
                        member.voice.serverMute ||
                        member.voice.serverDeaf;

                    if (!stillMuted) {

                        mutedUsers.delete(
                            memberId
                        );

                        continue;
                    }

                    // ==================================================
                    // حساب النقاط المكتسبة
                    // ==================================================

                    const elapsedHours =
                        (Date.now() -
                            session.startTime) /
                        (1000 * 60 * 60);

                    const earnedPts =
                        Math.floor(
                            elapsedHours
                        );

                    const currentPts =
                        client.waitingPoints.get(memberId) || 0;

                    if (earnedPts > 0) {

                        client.waitingPoints.set(
                            memberId,
                            currentPts +
                            earnedPts
                        );
                    }

                    // ==================================================
                    // إخراجه من الانتظار
                    // ==================================================

                    activeSessions.delete(
                        memberId
                    );

                    mutedUsers.delete(
                        memberId
                    );

                    console.log(
                        `🚫 تم إخراج ${member.user.tag} من الانتظار بسبب الميوت لمدة ساعة`
                    );

                    // ==================================================
                    // إرسال خاص للعضو
                    // ==================================================

                    await member.send({
                        content:
                            '🚫 تم إخراجك تلقائياً من نظام الانتظار.\n\n' +
                            'السبب: كنت تحت الميوت أو الصمت لمدة ساعة كاملة.\n' +
                            `⭐ تم حفظ نقاطك المكتسبة قبل الإخراج: ${earnedPts}`
                    }).catch(() => {});

                } catch (error) {

                    console.error(
                        '❌ خطأ أثناء فحص الميوت في نظام الانتظار:',
                        error
                    );
                }
            }

        }, 30000);
    }
};