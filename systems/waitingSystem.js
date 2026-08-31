const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');

const WAITING_ALERT_CHANNEL_ID = '1504895587672133714';

// مدة الميوت أو الصمت قبل الإخراج
const MUTE_LIMIT_MS = 60 * 60 * 1000; // ساعة كاملة

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

// النقاط
const userPoints = new Map();

// وقت بداية الميوت أو الصمت
const mutedUsers = new Map();

module.exports = {

    name: 'waitingSystem',

    // =========================
    // إرسال لوحة الانتظار
    // =========================

    async sendPanel(interaction) {

        const embed = new EmbedBuilder()
            .setDescription(
    '🔥 هذا اختبار مباشر للكود الجديد.\n\n' +
    'إذا ظهرت هذه الكتابة فهذا يعني أن ملف waitingSystem.js الذي نعدله هو فعلاً الملف الذي يستخدمه البوت.'
)
            .setColor(0x2B2D31);

        const row = new ActionRowBuilder().addComponents(

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

        await interaction.reply({
            content: '✅ تم إرسال لوحة الانتظار بنجاح.',
            ephemeral: true
        });

    },


    // =========================
    // التعامل مع الأزرار
    // =========================

    async handleButton(interaction) {

        const member = interaction.member;
        const customId = interaction.customId;

        // -------------------------
        // دخول الانتظار
        // -------------------------

        if (customId === 'wait_join') {

            if (!member.voice.channel) {
                return interaction.reply({
                    content: '❌ يجب أن تكون متواجداً في روم صوتي أساساً لتتمكن من دخول الانتظار.',
                    ephemeral: true
                });
            }

            const currentChannelId = member.voice.channel.id;
const isSupportedRoom = supportRoomIds.includes(currentChannelId);

console.log('==============================');
console.log('اسم الروم الحالي:', member.voice.channel.name);
console.log('ID الروم الحالي:', currentChannelId);
console.log('هل الروم مسموح؟', isSupportedRoom);
console.log('قائمة الرومات المسموحة:', supportRoomIds);
console.log('==============================');

if (!isSupportedRoom) {
    return interaction.reply({
        content:
            `❌ هذا الروم غير موجود ضمن رومات الانتظار.\n\n` +
            `📢 اسم الروم: **${member.voice.channel.name}**\n` +
            `🆔 ID الروم: \`${currentChannelId}\``,
        ephemeral: true
    });
}

            activeSessions.set(member.id, {
                startTime: Date.now(),
                guildId: interaction.guild.id
            });

            // إذا كان الشخص ميوت أو ديفن من البداية
            if (
                member.voice.serverMute ||
                member.voice.serverDeaf
            ) {
                mutedUsers.set(member.id, Date.now());
            }

            const alertChannel =
                interaction.guild.channels.cache.get(
                    WAITING_ALERT_CHANNEL_ID
                );

            if (alertChannel) {

                await alertChannel.send({
                    content:
                        `🔔 تنبيه! العضو ${member} دخل طابور الانتظار في الروم: <#${currentChannelId}>`
                }).catch(() => {});

            }

            return interaction.reply({
                content: '🟢 تم تسجيل دخولك بنجاح وبدأ حساب الوقت والنقاط.',
                ephemeral: true
            });

        }


        // -------------------------
        // الخروج من الانتظار
        // -------------------------

        if (customId === 'wait_leave') {

            if (!activeSessions.has(member.id)) {
                return interaction.reply({
                    content: '⚠️ أنت لست مسجلاً في نظام الانتظار أساساً.',
                    ephemeral: true
                });
            }

            const session = activeSessions.get(member.id);

            const elapsedHours =
                (Date.now() - session.startTime) /
                (1000 * 60 * 60);

            const currentPts =
                userPoints.get(member.id) || 0;

            const earnedPts =
                Math.floor(elapsedHours);

            if (earnedPts > 0) {

                userPoints.set(
                    member.id,
                    currentPts + earnedPts
                );

            }

            activeSessions.delete(member.id);
            mutedUsers.delete(member.id);

            return interaction.reply({
                content:
                    `🔴 تم إيقاف تسجيل النقاط والخروج بنجاح.\n` +
                    `النقاط المكتسبة لهذه الجلسة: \`${earnedPts}\``,
                ephemeral: true
            });

        }


        // -------------------------
        // النقاط
        // -------------------------

        if (customId === 'wait_points') {

            let totalPts =
                userPoints.get(member.id) || 0;

            if (activeSessions.has(member.id)) {

                const session =
                    activeSessions.get(member.id);

                const elapsedHours =
                    (Date.now() - session.startTime) /
                    (1000 * 60 * 60);

                totalPts += Math.floor(elapsedHours);

            }

            return interaction.reply({
                content:
                    `⭐ رصيدك الحالي من النقاط: **${totalPts}** نقطة.`,
                ephemeral: true
            });

        }

    },


    // =========================
    // مراقبة تغير حالة الشخص
    // =========================

    async handleWaitingVoiceStateUpdate(
        oldState,
        newState
    ) {

        const memberId = newState.member.id;

        // الشخص غير موجود في الانتظار
        if (!activeSessions.has(memberId)) {
            return;
        }

        const session =
            activeSessions.get(memberId);

        // إذا خرج من الرومات الصوتية
        if (!newState.channel) {

            mutedUsers.delete(memberId);

            return;

        }

        const currentChannelId =
            newState.channel.id;

        const isSupportedRoom =
            supportRoomIds.includes(currentChannelId);

        // إذا انتقل لروم غير روم السبورت
        if (!isSupportedRoom) {

            return;

        }

        // التحقق من الميوت أو الصمت الإداري
        const isMutedOrDeafened =
            newState.serverMute ||
            newState.serverDeaf;

        if (isMutedOrDeafened) {

            // تسجيل وقت بداية الميوت
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

            // إزالة العداد إذا فك الميوت
            if (mutedUsers.has(memberId)) {

                mutedUsers.delete(memberId);

                console.log(
                    `🔊 تم فك الميوت عن العضو ${memberId}`
                );

            }

        }

    },


    // =========================
    // فحص دوري للميوت
    // =========================

    startWaitingChecker(client) {

        console.log(
            '🕒 تم تشغيل مراقب الميوت والصمت لنظام الانتظار'
        );

        setInterval(async () => {

            for (const [memberId, muteStartTime] of mutedUsers.entries()) {

                // إذا الشخص خرج من الانتظار
                if (!activeSessions.has(memberId)) {

                    mutedUsers.delete(memberId);
                    continue;

                }

                const mutedDuration =
                    Date.now() - muteStartTime;

                // لم يكمل ساعة
                if (mutedDuration < MUTE_LIMIT_MS) {
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
                        await guild.members.fetch(memberId)
                            .catch(() => null);

                    if (!member) {

                        activeSessions.delete(memberId);
                        mutedUsers.delete(memberId);

                        continue;

                    }

                    // التأكد أنه ما زال ميوت أو ديفن
                    const stillMuted =
                        member.voice.serverMute ||
                        member.voice.serverDeaf;

                    if (!stillMuted) {

                        mutedUsers.delete(memberId);
                        continue;

                    }

                    // حساب النقاط قبل الإخراج
                    const elapsedHours =
                        (Date.now() - session.startTime) /
                        (1000 * 60 * 60);

                    const earnedPts =
                        Math.floor(elapsedHours);

                    const currentPts =
                        userPoints.get(memberId) || 0;

                    if (earnedPts > 0) {

                        userPoints.set(
                            memberId,
                            currentPts + earnedPts
                        );

                    }

                    // حذف الشخص من الانتظار
                    activeSessions.delete(memberId);
                    mutedUsers.delete(memberId);

                    console.log(
                        `🚫 تم إخراج ${member.user.tag} من الانتظار بسبب الميوت لمدة ساعة`
                    );

                    // إرسال خاص للعضو
                    await member.send({
                        content:
                            '🚫 تم إخراجك تلقائياً من نظام الانتظار.\n\n' +
                            'السبب: كنت تحت الميوت أو الصمت لمدة ساعة كاملة.\n' +
                            `⭐ تم حفظ نقاطك المكتسبة قبل الإخراج: ${earnedPts}`
                    }).catch(() => {});

                    // إرسال تنبيه في روم الانتظار
                    const alertChannel =
                        guild.channels.cache.get(
                            WAITING_ALERT_CHANNEL_ID
                        );

                    if (alertChannel) {

                        await alertChannel.send({
                            content:
                                `🚫 تم إخراج العضو ${member} تلقائياً من نظام الانتظار بسبب بقائه تحت الميوت أو الصمت لمدة ساعة كاملة.`
                        }).catch(() => {});

                    }

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