const fs = require('fs');
const path = require('path');

const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');

// =========================
// استيراد إعدادات السيرفر
// =========================
const {
    getGuildSettings
} = require('./config');

// =========================
// مسارات البيانات
// =========================
const waitingPath = path.join(
    __dirname,
    '../data/waiting.json'
);

const waitingMembersPath = path.join(
    __dirname,
    '../data/waitingMembers.json'
);


// =========================
// منع تشغيل المراقب أكثر من مرة
// =========================
let waitingCheckerStarted = false;


// =========================
// إعداد المجلدات والملفات
// =========================
function ensureFile(
    filePath,
    defaultData = '[]'
) {

    const directory =
        path.dirname(filePath);

    if (
        !fs.existsSync(directory)
    ) {

        fs.mkdirSync(
            directory,
            {
                recursive: true
            }
        );
    }

    if (
        !fs.existsSync(filePath)
    ) {

        fs.writeFileSync(
            filePath,
            defaultData,
            'utf8'
        );
    }
}


// =========================
// قراءة بيانات الإداريين
// =========================
function loadWaiting() {

    try {

        ensureFile(
            waitingPath,
            '[]'
        );

        const data =
            fs.readFileSync(
                waitingPath,
                'utf8'
            );

        const parsed =
            JSON.parse(
                data || '[]'
            );

        return Array.isArray(parsed)
            ? parsed
            : [];

    } catch (error) {

        console.error(
            'خطأ في قراءة بيانات الانتظار:',
            error
        );

        return [];
    }
}


// =========================
// حفظ بيانات الإداريين
// =========================
function saveWaiting(data) {

    try {

        ensureFile(
            waitingPath,
            '[]'
        );

        fs.writeFileSync(
            waitingPath,
            JSON.stringify(
                data,
                null,
                4
            ),
            'utf8'
        );

    } catch (error) {

        console.error(
            'خطأ في حفظ بيانات الانتظار:',
            error
        );
    }
}


// =========================
// قراءة أعضاء الانتظار
// =========================
function loadWaitingMembers() {

    try {

        ensureFile(
            waitingMembersPath,
            '[]'
        );

        const data =
            fs.readFileSync(
                waitingMembersPath,
                'utf8'
            );

        const parsed =
            JSON.parse(
                data || '[]'
            );

        return Array.isArray(parsed)
            ? parsed
            : [];

    } catch (error) {

        console.error(
            'خطأ في قراءة أعضاء الانتظار:',
            error
        );

        return [];
    }
}


// =========================
// حفظ أعضاء الانتظار
// =========================
function saveWaitingMembers(data) {

    try {

        ensureFile(
            waitingMembersPath,
            '[]'
        );

        fs.writeFileSync(
            waitingMembersPath,
            JSON.stringify(
                data,
                null,
                4
            ),
            'utf8'
        );

    } catch (error) {

        console.error(
            'خطأ في حفظ أعضاء الانتظار:',
            error
        );
    }
}


// =========================
// تحويل المدة إلى نص
// =========================
function formatDuration(milliseconds) {

    const totalSeconds =
        Math.floor(
            milliseconds / 1000
        );

    const hours =
        Math.floor(
            totalSeconds / 3600
        );

    const minutes =
        Math.floor(
            (totalSeconds % 3600) / 60
        );

    const seconds =
        totalSeconds % 60;

    if (hours > 0) {

        return `${hours} ساعة و ${minutes} دقيقة`;
    }

    if (minutes > 0) {

        return `${minutes} دقيقة و ${seconds} ثانية`;
    }

    return `${seconds} ثانية`;
}


// =========================
// التحقق من روم الإدارة
// =========================
function isInAllowedStaffVoice(
    member,
    settings
) {

    const currentChannelId =
        member?.voice?.channelId ||
        member?.voice?.channel?.id ||
        null;

    if (!currentChannelId) {

        console.log(
            `❌ ${member.user.tag} ليس داخل أي روم صوتي`
        );

        return false;
    }

    const allowedChannels =
        Array.isArray(
            settings.waitingStaffVoiceChannels
        )
            ? settings.waitingStaffVoiceChannels
            : [];


    console.log(
        '🔍 روم العضو الحالي:',
        currentChannelId
    );

    console.log(
        '🔍 الرومات المسموحة:',
        allowedChannels
    );


    return allowedChannels.includes(
        String(currentChannelId)
    );
}


// =========================
// حالة الميوت والصمم
// =========================
function getInactiveVoiceState(
    voiceState
) {

    const muted =
        voiceState.selfMute ||
        voiceState.serverMute;

    const deafened =
        voiceState.selfDeaf ||
        voiceState.serverDeaf;

    return {

        muted,

        deafened,

        inactive:
            muted ||
            deafened
    };
}


// =========================
// الحصول على نقاط المستخدم
// =========================
function getUserPoints(
    guildId,
    userId
) {

    const waitingData =
        loadWaiting();

    let highestPoints = 0;

    for (
        const entry of waitingData
    ) {

        if (
            entry.guildId === guildId &&
            entry.userId === userId
        ) {

            const points =
                entry.totalPoints || 0;

            if (
                points > highestPoints
            ) {

                highestPoints =
                    points;
            }
        }
    }

    return highestPoints;
}


// =========================
// ترتيب المستخدم
// =========================
function getUserRank(
    guildId,
    userId
) {

    const waitingData =
        loadWaiting();

    const usersMap =
        new Map();

    for (
        const entry of waitingData
    ) {

        if (
            entry.guildId !== guildId
        ) {

            continue;
        }

        const points =
            entry.totalPoints || 0;

        if (
            !usersMap.has(entry.userId)
        ) {

            usersMap.set(
                entry.userId,
                {
                    userId:
                        entry.userId,

                    username:
                        entry.username,

                    points
                }
            );

        } else {

            const existing =
                usersMap.get(
                    entry.userId
                );

            if (
                points > existing.points
            ) {

                existing.points =
                    points;
            }
        }
    }

    const ranking =
        Array.from(
            usersMap.values()
        )
        .sort(
            (a, b) =>
                b.points - a.points
        );

    const index =
        ranking.findIndex(
            user =>
                user.userId === userId
        );

    return {

        rank:
            index === -1
                ? null
                : index + 1,

        totalUsers:
            ranking.length
    };
}


// =========================
// احتساب نقاط الساعات
// =========================
function addHourlyPoints(
    waitingEntry,
    now,
    settings
) {

    const pointsPerHour =
        Number(
            settings.waitingPointsPerHour
        ) || 1;

    const totalTime =
        now -
        waitingEntry.joinedAt;

    const totalHours =
        Math.floor(
            totalTime /
            (60 * 60 * 1000)
        );

    const earnedHours =
        waitingEntry.earnedHours || 0;

    const newHours =
        totalHours -
        earnedHours;

    if (
        newHours <= 0
    ) {

        return false;
    }

    waitingEntry.totalPoints =
        (waitingEntry.totalPoints || 0) +
        (
            newHours *
            pointsPerHour
        );

    waitingEntry.earnedHours =
        totalHours;

    return true;
}


// =========================
// لوحة نظام الانتظار
// =========================
async function createWaitingPanel(
    interaction
) {

    const embed =
        new EmbedBuilder()

            .setTitle(
                '⭐ نظام احتساب النقاط'
            )

            .setDescription(

                'يتم احتساب النقاط أثناء التواجد في نظام الانتظار.\n\n' +

                '🟢 تسجيل الدخول متاح فقط أثناء التواجد في أحد الرومات الصوتية المخصصة.\n\n' +

                '⭐ نقطة واحدة لكل ساعة مكتملة.\n\n' +

                '📞 نقاط إضافية عند خدمة الأعضاء حسب نظام Call Up.\n\n' +

                '⚠️ في حال تفعيل الميوت أو الصمم لمدة طويلة سيتم إخراجك تلقائيًا من الانتظار.'
            )

            .setFooter({

                text:
                    'Falah Systems • نظام الانتظار'

            })

            .setTimestamp();


    const buttons =
        new ActionRowBuilder()

            .addComponents(

                new ButtonBuilder()

                    .setCustomId(
                        'waiting_join'
                    )

                    .setLabel(
                        'دخول الانتظار'
                    )

                    .setEmoji(
                        '🟢'
                    )

                    .setStyle(
                        ButtonStyle.Success
                    ),


                new ButtonBuilder()

                    .setCustomId(
                        'waiting_leave'
                    )

                    .setLabel(
                        'الخروج'
                    )

                    .setEmoji(
                        '🔴'
                    )

                    .setStyle(
                        ButtonStyle.Danger
                    ),


                new ButtonBuilder()

                    .setCustomId(
                        'waiting_points'
                    )

                    .setLabel(
                        'نقاطي'
                    )

                    .setEmoji(
                        '⭐'
                    )

                    .setStyle(
                        ButtonStyle.Primary
                    )
            );


    await interaction.reply({

        embeds: [
            embed
        ],

        components: [
            buttons
        ]
    });
}


// =========================
// دخول المستخدم للانتظار
// =========================
async function joinWaiting(
    interaction
) {

    try {

        const settings =
            getGuildSettings(
                interaction.guild.id
            );

        const member =
            interaction.member;


        // =========================
        // التحقق من الروم الصوتي فقط
        // =========================
        if (
            !isInAllowedStaffVoice(
                member,
                settings
            )
        ) {

            await interaction.reply({

                ephemeral:
                    true,

                content:
                    '❌ لا يمكنك دخول الانتظار إلا أثناء تواجدك في أحد الرومات الصوتية المخصصة للنظام.'
            });

            return;
        }


        const waitingData =
            loadWaiting();

        const existing =
            waitingData.find(

                waiting =>

                    waiting.guildId ===
                    interaction.guild.id &&

                    waiting.userId ===
                    interaction.user.id &&

                    waiting.active === true
            );


        if (existing) {

            await interaction.reply({

                ephemeral:
                    true,

                content:
                    '⚠️ أنت مسجل بالفعل في نظام الانتظار.'
            });

            return;
        }


        const previousPoints =
            getUserPoints(

                interaction.guild.id,

                interaction.user.id
            );


        const entry = {

            guildId:
                interaction.guild.id,

            userId:
                interaction.user.id,

            username:
                interaction.user.username,

            userTag:
                interaction.user.tag,

            joinedAt:
                Date.now(),

            active:
                true,

            totalPoints:
                previousPoints,

            earnedHours:
                0,

            callCount:
                0,

            inactiveSince:
                null
        };


        waitingData.push(
            entry
        );

        saveWaiting(
            waitingData
        );


        await interaction.reply({

            ephemeral:
                true,

            embeds: [

                new EmbedBuilder()

                    .setTitle(
                        '🟢 تم تسجيل دخولك'
                    )

                    .setDescription(

                        'تم تسجيلك بنجاح في نظام الانتظار.\n\n' +

                        '⭐ سيتم احتساب نقاطك أثناء تواجدك في النظام.\n\n' +

                        '⚠️ يجب البقاء في أحد الرومات الصوتية المخصصة.\n\n' +

                        '🔇 إذا بقيت على الميوت أو الصمم لمدة طويلة سيتم إخراجك تلقائيًا من الانتظار.'
                    )

                    .setTimestamp()
            ]
        });


        console.log(
            `🟢 ${interaction.user.tag} دخل نظام الانتظار`
        );

    } catch (error) {

        console.error(
            'خطأ أثناء دخول الانتظار:',
            error
        );

        if (
            !interaction.replied &&
            !interaction.deferred
        ) {

            await interaction.reply({

                ephemeral:
                    true,

                content:
                    '❌ حدث خطأ أثناء دخول الانتظار.'
            });
        }
    }
}


// =========================
// خروج المستخدم
// =========================
async function leaveWaiting(
    interaction
) {

    try {

        const waitingData =
            loadWaiting();

        const index =
            waitingData.findIndex(

                waiting =>

                    waiting.guildId ===
                    interaction.guild.id &&

                    waiting.userId ===
                    interaction.user.id &&

                    waiting.active === true
            );


        if (
            index === -1
        ) {

            await interaction.reply({

                ephemeral:
                    true,

                content:
                    '⚠️ أنت غير مسجل حاليًا في الانتظار.'
            });

            return;
        }


        const entry =
            waitingData[index];

        const settings =
            getGuildSettings(
                interaction.guild.id
            );

        const now =
            Date.now();


        addHourlyPoints(
            entry,
            now,
            settings
        );


        entry.active =
            false;

        entry.leftAt =
            now;

        entry.totalDuration =
            now -
            entry.joinedAt;

        entry.leaveReason =
            'manual';

        entry.inactiveSince =
            null;


        saveWaiting(
            waitingData
        );


        await interaction.reply({

            ephemeral:
                true,

            embeds: [

                new EmbedBuilder()

                    .setTitle(
                        '🔴 تم خروجك من الانتظار'
                    )

                    .addFields(

                        {

                            name:
                                '⏳ مدة التواجد',

                            value:
                                `**${formatDuration(entry.totalDuration)}**`,

                            inline:
                                true
                        },

                        {

                            name:
                                '⭐ إجمالي النقاط',

                            value:
                                `**${entry.totalPoints || 0} نقطة**`,

                            inline:
                                true
                        }
                    )

                    .setTimestamp()
            ]
        });

    } catch (error) {

        console.error(
            'خطأ أثناء الخروج من الانتظار:',
            error
        );
    }
}


// =========================
// عرض النقاط
// =========================
async function showWaitingPoints(
    interaction
) {

    try {

        const waitingData =
            loadWaiting();

        const activeEntry =
            waitingData.find(

                waiting =>

                    waiting.guildId ===
                    interaction.guild.id &&

                    waiting.userId ===
                    interaction.user.id &&

                    waiting.active === true
            );


        if (activeEntry) {

            const settings =
                getGuildSettings(
                    interaction.guild.id
                );

            const added =
                addHourlyPoints(

                    activeEntry,

                    Date.now(),

                    settings
                );

            if (added) {

                saveWaiting(
                    waitingData
                );
            }
        }


        const points =
            getUserPoints(

                interaction.guild.id,

                interaction.user.id
            );

        const rankData =
            getUserRank(

                interaction.guild.id,

                interaction.user.id
            );


        await interaction.reply({

            ephemeral:
                true,

            embeds: [

                new EmbedBuilder()

                    .setTitle(
                        '⭐ نقاطي'
                    )

                    .addFields(

                        {

                            name:
                                'إجمالي النقاط',

                            value:
                                `**${points} نقطة**`,

                            inline:
                                true
                        },

                        {

                            name:
                                'الترتيب',

                            value:

                                rankData.rank
                                    ? `**#${rankData.rank}**`
                                    : 'لا يوجد ترتيب',

                            inline:
                                true
                        }
                    )

                    .setTimestamp()
            ]
        });

    } catch (error) {

        console.error(
            'خطأ أثناء عرض النقاط:',
            error
        );
    }
}


// =========================
// إضافة نقاط Call Up
// =========================
function addCallPoints(
    guildId,
    userId
) {

    const waitingData =
        loadWaiting();

    const entry =
        waitingData.find(

            waiting =>

                waiting.guildId === guildId &&

                waiting.userId === userId &&

                waiting.active === true
        );


    if (!entry) {

        return null;
    }


    const settings =
        getGuildSettings(
            guildId
        );

    const pointsPerCall =
        Number(
            settings.waitingPointsPerCall
        ) || 2;


    entry.callCount =
        (entry.callCount || 0) +
        1;


    entry.totalPoints =
        (entry.totalPoints || 0) +
        pointsPerCall;


    saveWaiting(
        waitingData
    );


    return {

        pointsAdded:
            pointsPerCall,

        totalPoints:
            entry.totalPoints,

        callCount:
            entry.callCount
    };
}


// =========================
// المستخدمون الموجودون
// في الانتظار
// =========================
function getActiveWaitingMembers(
    guildId
) {

    const waitingData =
        loadWaiting();

    return waitingData.filter(

        waiting =>

            waiting.guildId === guildId &&

            waiting.active === true
    );
}


// =========================
// إزالة مستخدم من الانتظار
// =========================
function removeFromWaiting(
    guildId,
    userId,
    reason = 'system'
) {

    const waitingData =
        loadWaiting();

    const entry =
        waitingData.find(

            waiting =>

                waiting.guildId === guildId &&

                waiting.userId === userId &&

                waiting.active === true
        );


    if (!entry) {

        return null;
    }


    const settings =
        getGuildSettings(
            guildId
        );

    const now =
        Date.now();


    addHourlyPoints(
        entry,
        now,
        settings
    );


    entry.active =
        false;

    entry.leftAt =
        now;

    entry.totalDuration =
        now -
        entry.joinedAt;

    entry.leaveReason =
        reason;

    entry.inactiveSince =
        null;


    saveWaiting(
        waitingData
    );


    return entry;
}


// =========================
// إرسال تنبيه الانتظار
// =========================
async function sendWaitingAlert(
    guild,
    userId,
    reminder = false
) {

    try {

        const settings =
            getGuildSettings(
                guild.id
            );


        if (
            !settings.waitingNotificationChannel
        ) {

            console.log(
                `⚠️ لم يتم تحديد روم تنبيهات الانتظار في السيرفر ${guild.name}`
            );

            return;
        }


        const channel =
            guild.channels.cache.get(
                settings.waitingNotificationChannel
            );


        if (!channel) {

            console.log(
                `❌ لم يتم العثور على روم تنبيهات الانتظار: ${settings.waitingNotificationChannel}`
            );

            return;
        }


        if (
            typeof channel.send !== 'function'
        ) {

            console.log(
                '❌ روم تنبيهات الانتظار ليس رومًا نصيًا صالحًا.'
            );

            return;
        }


        const activeAdmins =
            getActiveWaitingMembers(
                guild.id
            );


        const mentions =
            activeAdmins
                .map(
                    admin =>
                        `<@${admin.userId}>`
                )
                .join(' ');


        let member;

        try {

            member =
                await guild.members.fetch(
                    userId
                );

        } catch {

            console.log(
                `❌ لم يتم العثور على العضو ${userId}`
            );

            return;
        }


        const embed =
            new EmbedBuilder()

                .setTitle(

                    reminder
                        ? '⏰ تنبيه: عضو ما زال في الانتظار'
                        : '🚨 عضو بحاجة إلى الدعم'
                )

                .setDescription(

                    reminder

                        ? `العضو ${member} ما زال موجودًا في روم الانتظار ولم يتم سحبه حتى الآن.`

                        : `يوجد عضو جديد في روم الانتظار بحاجة إلى الدعم.\n\n👤 العضو: ${member}\n🔊 الحالة: بانتظار المساعدة`
                )

                .setTimestamp();


        await channel.send({

            content:
                mentions ||
                null,

            embeds: [
                embed
            ],

            allowedMentions: {

                users:
                    activeAdmins.map(
                        admin =>
                            admin.userId
                    )
            }
        });


        console.log(

            reminder
                ? `⏰ تم إرسال تنبيه ثانٍ للعضو ${member.user.tag}`
                : `🚨 تم إرسال تنبيه دخول للعضو ${member.user.tag}`
        );

    } catch (error) {

        console.error(
            'خطأ أثناء إرسال تنبيه الانتظار:',
            error
        );
    }
}


// =========================
// إضافة عضو للانتظار
// =========================
async function addWaitingMember(
    guild,
    userId
) {

    const waitingMembers =
        loadWaitingMembers();


    const exists =
        waitingMembers.find(

            entry =>

                entry.guildId === guild.id &&

                entry.userId === userId
        );


    if (exists) {

        return false;
    }


    const entry = {

        guildId:
            guild.id,

        userId,

        joinedAt:
            Date.now(),

        reminded:
            false
    };


    waitingMembers.push(
        entry
    );


    saveWaitingMembers(
        waitingMembers
    );


    console.log(
        `🟢 تم اكتشاف عضو جديد في روم الانتظار: ${userId}`
    );


    await sendWaitingAlert(
        guild,
        userId,
        false
    );


    return true;
}


// =========================
// إزالة عضو من الانتظار
// =========================
function removeWaitingMember(
    guildId,
    userId
) {

    const waitingMembers =
        loadWaitingMembers();


    const updated =
        waitingMembers.filter(

            entry =>

                !(

                    entry.guildId === guildId &&

                    entry.userId === userId
                )
        );


    saveWaitingMembers(
        updated
    );


    console.log(
        `🔴 خرج العضو ${userId} من روم الانتظار`
    );
}


// =========================
// مراقبة تغيرات الصوت
// =========================
async function handleWaitingVoiceStateUpdate(
    oldState,
    newState
) {

    try {

        const member =
            newState.member ||
            oldState.member;


        if (
            !member ||
            member.user.bot
        ) {

            return;
        }


        const guild =
            member.guild;


        const settings =
            getGuildSettings(
                guild.id
            );


        const oldChannelId =
            oldState.channelId;


        const newChannelId =
            newState.channelId;


        // دخول روم انتظار الأعضاء
        if (

            settings.waitingChannel &&

            newChannelId === settings.waitingChannel &&

            oldChannelId !== settings.waitingChannel
        ) {

            await addWaitingMember(
                guild,
                member.id
            );
        }


        // خروج من روم انتظار الأعضاء
        if (

            settings.waitingChannel &&

            oldChannelId === settings.waitingChannel &&

            newChannelId !== settings.waitingChannel
        ) {

            removeWaitingMember(
                guild.id,
                member.id
            );
        }


        // فحص المستخدم المسجل
        const waitingData =
            loadWaiting();


        const entry =
            waitingData.find(

                waiting =>

                    waiting.guildId === guild.id &&

                    waiting.userId === member.id &&

                    waiting.active === true
            );


        if (!entry) {

            return;
        }


        // إذا غادر الرومات المسموحة
        if (

            !isInAllowedStaffVoice(
                member,
                settings
            )
        ) {

            const now =
                Date.now();


            addHourlyPoints(
                entry,
                now,
                settings
            );


            entry.active =
                false;

            entry.leftAt =
                now;

            entry.totalDuration =
                now -
                entry.joinedAt;

            entry.leaveReason =
                'left_staff_voice';

            entry.inactiveSince =
                null;


            saveWaiting(
                waitingData
            );


            console.log(
                `🔴 ${member.user.tag} خرج من الانتظار لأنه غادر الروم المخصص`
            );

            return;
        }


        // فحص الميوت والصمم
        const inactiveState =
            getInactiveVoiceState(
                member.voice
            );


        if (
            inactiveState.inactive
        ) {

            if (
                !entry.inactiveSince
            ) {

                entry.inactiveSince =
                    Date.now();

                saveWaiting(
                    waitingData
                );
            }

        } else {

            if (
                entry.inactiveSince
            ) {

                entry.inactiveSince =
                    null;


                saveWaiting(
                    waitingData
                );
            }
        }

    } catch (error) {

        console.error(
            'خطأ في مراقبة الرومات الصوتية:',
            error
        );
    }
}


// =========================
// تشغيل مراقب الانتظار
// =========================
function startWaitingChecker(
    client
) {

    if (
        waitingCheckerStarted
    ) {

        return;
    }


    waitingCheckerStarted =
        true;


    console.log(
        '⏳ تم تشغيل مراقب نظام الانتظار.'
    );


    const runWaitingChecker =
        async () => {

            try {

                const now =
                    Date.now();


                const waitingData =
                    loadWaiting();

                let waitingChanged =
                    false;


                for (
                    const entry of waitingData
                ) {

                    if (
                        !entry.active
                    ) {

                        continue;
                    }


                    const guild =
                        client.guilds.cache.get(
                            entry.guildId
                        );


                    if (!guild) {

                        continue;
                    }


                    const settings =
                        getGuildSettings(
                            guild.id
                        );


                    let member;


                    try {

                        member =
                            await guild.members.fetch(
                                entry.userId
                            );

                    } catch {

                        entry.active =
                            false;

                        entry.leaveReason =
                            'member_not_found';

                        entry.leftAt =
                            now;

                        waitingChanged =
                            true;

                        continue;
                    }


                    const hourlyAdded =
                        addHourlyPoints(
                            entry,
                            now,
                            settings
                        );


                    if (hourlyAdded) {

                        waitingChanged =
                            true;
                    }


                    if (

                        !isInAllowedStaffVoice(
                            member,
                            settings
                        )
                    ) {

                        entry.active =
                            false;

                        entry.leftAt =
                            now;

                        entry.totalDuration =
                            now -
                            entry.joinedAt;

                        entry.leaveReason =
                            'left_staff_voice';

                        entry.inactiveSince =
                            null;

                        waitingChanged =
                            true;

                        continue;
                    }


                    const inactiveState =
                        getInactiveVoiceState(
                            member.voice
                        );


                    if (
                        !inactiveState.inactive
                    ) {

                        if (
                            entry.inactiveSince
                        ) {

                            entry.inactiveSince =
                                null;

                            waitingChanged =
                                true;
                        }

                        continue;
                    }


                    if (
                        !entry.inactiveSince
                    ) {

                        entry.inactiveSince =
                            now;

                        waitingChanged =
                            true;

                        continue;
                    }


                    const inactiveMinutes =
                        Number(
                            settings.waitingInactivityMinutes
                        ) || 60;


                    const inactiveTime =
                        now -
                        entry.inactiveSince;


                    if (

                        inactiveTime <

                        inactiveMinutes *
                        60 *
                        1000
                    ) {

                        continue;
                    }


                    entry.active =
                        false;

                    entry.leftAt =
                        now;

                    entry.totalDuration =
                        now -
                        entry.joinedAt;

                    entry.leaveReason =
                        'inactive_voice';

                    entry.inactiveSince =
                        null;

                    waitingChanged =
                        true;


                    try {

                        let reason =
                            'البقاء على الميوت أو الصمم لمدة طويلة';


                        if (

                            inactiveState.muted &&

                            !inactiveState.deafened
                        ) {

                            reason =
                                'البقاء على الميوت لمدة طويلة';

                        } else if (

                            inactiveState.deafened &&

                            !inactiveState.muted
                        ) {

                            reason =
                                'البقاء على الصمم لمدة طويلة';
                        }


                        await member.send({

                            embeds: [

                                new EmbedBuilder()

                                    .setTitle(
                                        '🚫 تم إخراجك من الانتظار'
                                    )

                                    .setDescription(

                                        'تم إخراجك تلقائيًا من نظام الانتظار بسبب عدم التفاعل.\n\n' +

                                        `**السبب:** ${reason}\n\n` +

                                        `استمرت الحالة لمدة **${inactiveMinutes} دقيقة**.\n\n` +

                                        'يمكنك التسجيل في الانتظار مرة أخرى عند عودتك للنشاط.'
                                    )

                                    .setTimestamp()
                            ]
                        });

                    } catch {

                        console.log(
                            `⚠️ تعذر إرسال رسالة خاصة إلى ${member.user.tag}`
                        );
                    }
                }


                if (waitingChanged) {

                    saveWaiting(
                        waitingData
                    );
                }


                let waitingMembers =
                    loadWaitingMembers();

                let membersChanged =
                    false;


                // حذف من خرجوا من روم انتظار الأعضاء
                waitingMembers =
                    waitingMembers.filter(

                        entry => {

                            const guild =
                                client.guilds.cache.get(
                                    entry.guildId
                                );


                            if (!guild) {

                                membersChanged =
                                    true;

                                return false;
                            }


                            const settings =
                                getGuildSettings(
                                    guild.id
                                );


                            const channel =
                                guild.channels.cache.get(
                                    settings.waitingChannel
                                );


                            if (

                                !channel ||

                                !channel.members
                            ) {

                                membersChanged =
                                    true;

                                return false;
                            }


                            const stillInside =
                                channel.members.has(
                                    entry.userId
                                );


                            if (!stillInside) {

                                membersChanged =
                                    true;

                                return false;
                            }


                            return true;
                        }
                    );


                // اكتشاف الموجودين داخل روم انتظار الأعضاء
                for (
                    const guild of client.guilds.cache.values()
                ) {

                    const settings =
                        getGuildSettings(
                            guild.id
                        );


                    if (
                        !settings.waitingChannel
                    ) {

                        continue;
                    }


                    const channel =
                        guild.channels.cache.get(
                            settings.waitingChannel
                        );


                    if (

                        !channel ||

                        !channel.members
                    ) {

                        continue;
                    }


                    for (
                        const member of channel.members.values()
                    ) {

                        if (
                            member.user.bot
                        ) {

                            continue;
                        }


                        const exists =
                            waitingMembers.find(

                                entry =>

                                    entry.guildId === guild.id &&

                                    entry.userId === member.id
                            );


                        if (!exists) {

                            console.log(
                                `🚨 اكتشاف عضو داخل روم الانتظار: ${member.user.tag}`
                            );


                            waitingMembers.push({

                                guildId:
                                    guild.id,

                                userId:
                                    member.id,

                                joinedAt:
                                    now,

                                reminded:
                                    false
                            });


                            await sendWaitingAlert(

                                guild,

                                member.id,

                                false
                            );


                            membersChanged =
                                true;
                        }
                    }
                }


                // التنبيه الثاني
                for (
                    const entry of waitingMembers
                ) {

                    if (
                        entry.reminded
                    ) {

                        continue;
                    }


                    const guild =
                        client.guilds.cache.get(
                            entry.guildId
                        );


                    if (!guild) {

                        continue;
                    }


                    const settings =
                        getGuildSettings(
                            guild.id
                        );


                    const warningMinutes =
                        Number(
                            settings.waitingWarningMinutes
                        ) || 10;


                    const waitingTime =
                        now -
                        entry.joinedAt;


                    if (

                        waitingTime >=

                        warningMinutes *
                        60 *
                        1000
                    ) {

                        console.log(
                            `⏰ إرسال التنبيه الثاني للعضو ${entry.userId}`
                        );


                        await sendWaitingAlert(

                            guild,

                            entry.userId,

                            true
                        );


                        entry.reminded =
                            true;


                        membersChanged =
                            true;
                    }
                }


                if (
                    membersChanged
                ) {

                    saveWaitingMembers(
                        waitingMembers
                    );
                }

            } catch (error) {

                console.error(
                    'خطأ في مراقب نظام الانتظار:',
                    error
                );
            }
        };


    // تشغيل فوري
    runWaitingChecker();


    // ثم كل دقيقة
    setInterval(

        runWaitingChecker,

        60 * 1000
    );
}


// =========================
// تصدير النظام
// =========================
module.exports = {

    createWaitingPanel,

    joinWaiting,

    leaveWaiting,

    showWaitingPoints,

    getActiveWaitingMembers,

    removeFromWaiting,

    addCallPoints,

    getUserPoints,

    getUserRank,

    loadWaiting,

    saveWaiting,

    startWaitingChecker,

    handleWaitingVoiceStateUpdate
};