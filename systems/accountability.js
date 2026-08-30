const fs = require('fs');
const path = require('path');

const {
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
    EmbedBuilder
} = require('discord.js');

const {
    getGuildSettings
} = require('./config');


// =========================
// مسار سجل المحاسبة
// =========================
const accountabilityPath = path.join(
    __dirname,
    '../data/accountability.json'
);


// =========================
// قراءة سجل المحاسبة
// =========================
function loadAccountability() {

    try {

        if (!fs.existsSync(accountabilityPath)) {

            fs.writeFileSync(
                accountabilityPath,
                '[]',
                'utf8'
            );

            return [];
        }

        const data = fs.readFileSync(
            accountabilityPath,
            'utf8'
        );

        if (!data.trim()) {
            return [];
        }

        return JSON.parse(data);

    } catch (error) {

        console.error(
            'خطأ في قراءة سجل المحاسبة:',
            error
        );

        return [];
    }
}


// =========================
// حفظ سجل المحاسبة
// =========================
function saveAccountability(data) {

    try {

        fs.writeFileSync(
            accountabilityPath,
            JSON.stringify(
                data,
                null,
                4
            ),
            'utf8'
        );

    } catch (error) {

        console.error(
            'خطأ في حفظ سجل المحاسبة:',
            error
        );
    }
}


// =========================
// تنظيف Discord ID
// يدعم:
// 123456789
// <@123456789>
// <@!123456789>
// =========================
function cleanDiscordId(value) {

    if (!value) {
        return null;
    }

    const cleaned = value
        .trim()
        .replace(/[<@!>]/g, '');

    if (!/^\d{15,25}$/.test(cleaned)) {
        return null;
    }

    return cleaned;
}


// =========================
// إضافة قضية محاسبة
// =========================
function addAccountabilityCase(data) {

    const cases = loadAccountability();

    const newCase = {

        id: `${Date.now()}-${Math.floor(
            Math.random() * 100000
        )}`,

        guildId:
            data.guildId,

        moderatorId:
            data.moderatorId,

        moderatorTag:
            data.moderatorTag,

        punishmentType:
            data.punishmentType,

        playerName:
            data.playerName,

        fivemId:
            data.fivemId,

        discordId:
            data.discordId,

        system:
            data.system,

        reason:
            data.reason,

        duration:
            data.duration || null,

        expiresAt:
            data.expiresAt || null,

        expired:
            false,

        createdAt:
            Date.now()
    };

    cases.push(newCase);

    saveAccountability(cases);

    return newCase;
}


// =========================
// أسماء العقوبات
// =========================
function getPunishmentName(type) {

    const names = {

        permanent_ban:
            '🔨 حظر دائم',

        temporary_ban:
            '⏱️ حظر مؤقت',

        warn:
            '⚠️ تحذير',

        warn_1:
            '⚠️ Warn 1 | التحذير الأول',

        warn_2:
            '⚠️ Warn 2 | التحذير الثاني',

        warn_3:
            '🚨 Warn 3 | التحذير الثالث'
    };

    return names[type] || 'عقوبة';
}


// =========================
// فتح نافذة الحظر الدائم
// =========================
async function openPermanentBanModal(interaction) {

    const modal = new ModalBuilder()

        .setCustomId(
            'punishment_permanent_ban_modal'
        )

        .setTitle(
            '🔨 تسجيل حظر دائم'
        );


    const playerName = new TextInputBuilder()

        .setCustomId(
            'player_name'
        )

        .setLabel(
            'اسم اللاعب'
        )

        .setPlaceholder(
            'مثال: Falah'
        )

        .setStyle(
            TextInputStyle.Short
        )

        .setRequired(true);


    const fivemId = new TextInputBuilder()

        .setCustomId(
            'fivem_id'
        )

        .setLabel(
            'معرف اللاعب FiveM'
        )

        .setPlaceholder(
            'Citizen ID أو Player ID'
        )

        .setStyle(
            TextInputStyle.Short
        )

        .setRequired(true);


    const discordId = new TextInputBuilder()

        .setCustomId(
            'discord_id'
        )

        .setLabel(
            'Discord ID'
        )

        .setPlaceholder(
            'اختياري'
        )

        .setStyle(
            TextInputStyle.Short
        )

        .setRequired(false);


    const system = new TextInputBuilder()

        .setCustomId(
            'system'
        )

        .setLabel(
            'النظام أو القسم'
        )

        .setPlaceholder(
            'مثال: Police System'
        )

        .setStyle(
            TextInputStyle.Short
        )

        .setRequired(true);


    const reason = new TextInputBuilder()

        .setCustomId(
            'reason'
        )

        .setLabel(
            'سبب العقوبة'
        )

        .setPlaceholder(
            'اكتب سبب الحظر بالتفصيل'
        )

        .setStyle(
            TextInputStyle.Paragraph
        )

        .setRequired(true);


    modal.addComponents(

        new ActionRowBuilder()
            .addComponents(playerName),

        new ActionRowBuilder()
            .addComponents(fivemId),

        new ActionRowBuilder()
            .addComponents(discordId),

        new ActionRowBuilder()
            .addComponents(system),

        new ActionRowBuilder()
            .addComponents(reason)
    );


    await interaction.showModal(modal);
}


// =========================
// فتح نافذة الحظر المؤقت
// =========================
async function openTemporaryBanModal(interaction) {

    const modal = new ModalBuilder()

        .setCustomId(
            'punishment_temporary_ban_modal'
        )

        .setTitle(
            '⏱️ تسجيل حظر مؤقت'
        );


    const playerName = new TextInputBuilder()

        .setCustomId(
            'player_name'
        )

        .setLabel(
            'اسم اللاعب'
        )

        .setPlaceholder(
            'مثال: Falah'
        )

        .setStyle(
            TextInputStyle.Short
        )

        .setRequired(true);


    const fivemId = new TextInputBuilder()

        .setCustomId(
            'fivem_id'
        )

        .setLabel(
            'معرف اللاعب FiveM'
        )

        .setPlaceholder(
            'Citizen ID أو Player ID'
        )

        .setStyle(
            TextInputStyle.Short
        )

        .setRequired(true);


    const discordId = new TextInputBuilder()

        .setCustomId(
            'discord_id'
        )

        .setLabel(
            'Discord ID للاعب'
        )

        .setPlaceholder(
            'ضع Discord ID الصحيح'
        )

        .setStyle(
            TextInputStyle.Short
        )

        .setRequired(true);


    const duration = new TextInputBuilder()

        .setCustomId(
            'duration'
        )

        .setLabel(
            'مدة الحظر'
        )

        .setPlaceholder(
            'مثال: 10m أو 6h أو 1d أو 7d'
        )

        .setStyle(
            TextInputStyle.Short
        )

        .setRequired(true);


    const reason = new TextInputBuilder()

        .setCustomId(
            'reason'
        )

        .setLabel(
            'سبب الحظر'
        )

        .setPlaceholder(
            'اكتب سبب الحظر بالتفصيل'
        )

        .setStyle(
            TextInputStyle.Paragraph
        )

        .setRequired(true);


    modal.addComponents(

        new ActionRowBuilder()
            .addComponents(playerName),

        new ActionRowBuilder()
            .addComponents(fivemId),

        new ActionRowBuilder()
            .addComponents(discordId),

        new ActionRowBuilder()
            .addComponents(duration),

        new ActionRowBuilder()
            .addComponents(reason)
    );


    await interaction.showModal(modal);
}


// =========================
// فتح نافذة التحذير
// =========================
async function openWarnModal(
    interaction,
    warnType = 'warn'
) {

    const warnTitles = {

        warn:
            '⚠️ تسجيل تحذير',

        warn_1:
            '⚠️ تسجيل Warn 1',

        warn_2:
            '⚠️ تسجيل Warn 2',

        warn_3:
            '🚨 تسجيل Warn 3'
    };


    const modal = new ModalBuilder()

        .setCustomId(
            `punishment_${warnType}_modal`
        )

        .setTitle(
            warnTitles[warnType] ||
            '⚠️ تسجيل تحذير'
        );


    const playerName = new TextInputBuilder()

        .setCustomId(
            'player_name'
        )

        .setLabel(
            'اسم اللاعب'
        )

        .setPlaceholder(
            'مثال: Falah'
        )

        .setStyle(
            TextInputStyle.Short
        )

        .setRequired(true);


    const fivemId = new TextInputBuilder()

        .setCustomId(
            'fivem_id'
        )

        .setLabel(
            'معرف اللاعب FiveM'
        )

        .setPlaceholder(
            'Citizen ID أو Player ID'
        )

        .setStyle(
            TextInputStyle.Short
        )

        .setRequired(true);


    const discordId = new TextInputBuilder()

        .setCustomId(
            'discord_id'
        )

        .setLabel(
            'Discord ID'
        )

        .setPlaceholder(
            'ضع Discord ID أو المنشن'
        )

        .setStyle(
            TextInputStyle.Short
        )

        .setRequired(true);


    const system = new TextInputBuilder()

        .setCustomId(
            'system'
        )

        .setLabel(
            'النظام أو القسم'
        )

        .setPlaceholder(
            'مثال: Police System'
        )

        .setStyle(
            TextInputStyle.Short
        )

        .setRequired(true);


    const reason = new TextInputBuilder()

        .setCustomId(
            'reason'
        )

        .setLabel(
            'سبب التحذير'
        )

        .setPlaceholder(
            'اكتب سبب التحذير بالتفصيل'
        )

        .setStyle(
            TextInputStyle.Paragraph
        )

        .setRequired(true);


    modal.addComponents(

        new ActionRowBuilder()
            .addComponents(playerName),

        new ActionRowBuilder()
            .addComponents(fivemId),

        new ActionRowBuilder()
            .addComponents(discordId),

        new ActionRowBuilder()
            .addComponents(system),

        new ActionRowBuilder()
            .addComponents(reason)
    );


    await interaction.showModal(modal);
}


// =========================
// فتح Warn 1
// =========================
async function openWarn1Modal(interaction) {

    await openWarnModal(
        interaction,
        'warn_1'
    );
}


// =========================
// فتح Warn 2
// =========================
async function openWarn2Modal(interaction) {

    await openWarnModal(
        interaction,
        'warn_2'
    );
}


// =========================
// فتح Warn 3
// =========================
async function openWarn3Modal(interaction) {

    await openWarnModal(
        interaction,
        'warn_3'
    );
}


// =========================
// تحويل مدة إلى ملي ثانية
// يدعم:
// 10m
// 6h
// 1d
// 7d
// 1w
// =========================
function parseDuration(duration) {

    if (!duration) {
        return null;
    }


    const value = duration
        .trim()
        .toLowerCase();


    const match = value.match(
        /^(\d+)(m|h|d|w)$/
    );


    if (!match) {
        return null;
    }


    const amount = parseInt(
        match[1],
        10
    );


    const unit = match[2];


    const units = {

        m:
            60 * 1000,

        h:
            60 * 60 * 1000,

        d:
            24 * 60 * 60 * 1000,

        w:
            7 * 24 * 60 * 60 * 1000
    };


    return amount * units[unit];
}


// =========================
// تحديد رقم التحذير تلقائياً
// =========================
function getNextWarnType(
    guildId,
    discordId,
    fivemId
) {

    const cases = loadAccountability();


    const previousWarns = cases.filter(
        punishment => {

            if (
                punishment.guildId !==
                guildId
            ) {
                return false;
            }


            const isWarn =
                punishment.punishmentType === 'warn' ||
                punishment.punishmentType === 'warn_1' ||
                punishment.punishmentType === 'warn_2' ||
                punishment.punishmentType === 'warn_3';


            if (!isWarn) {
                return false;
            }


            if (
                discordId &&
                punishment.discordId ===
                discordId
            ) {
                return true;
            }


            if (
                fivemId &&
                punishment.fivemId ===
                fivemId
            ) {
                return true;
            }


            return false;
        }
    );


    const warnCount =
        previousWarns.length + 1;


    if (warnCount === 1) {
        return 'warn_1';
    }


    if (warnCount === 2) {
        return 'warn_2';
    }


    return 'warn_3';
}


// =========================
// الحصول على Role ID
// =========================
function getRoleKey(punishmentType) {

    const roleKeys = {

        temporary_ban:
            'bannedTemporaryRole',

        permanent_ban:
            'bannedPermanentRole',

        warn_1:
            'warn1Role',

        warn_2:
            'warn2Role',

        warn_3:
            'warn3Role'
    };


    return roleKeys[
        punishmentType
    ] || null;
}


// =========================
// سحب رتب التحذيرات السابقة
// =========================
async function removePreviousWarnRoles(
    interaction,
    member,
    settings,
    punishmentType
) {

    try {

        if (
            punishmentType !== 'warn_2' &&
            punishmentType !== 'warn_3'
        ) {
            return;
        }


        const rolesToRemove = [];


        if (
            settings.warn1Role
        ) {

            const warn1Role =
                interaction.guild.roles.cache.get(
                    settings.warn1Role
                );


            if (
                warn1Role &&
                member.roles.cache.has(
                    warn1Role.id
                )
            ) {

                rolesToRemove.push(
                    warn1Role
                );
            }
        }


        if (
            punishmentType === 'warn_3' &&
            settings.warn2Role
        ) {

            const warn2Role =
                interaction.guild.roles.cache.get(
                    settings.warn2Role
                );


            if (
                warn2Role &&
                member.roles.cache.has(
                    warn2Role.id
                )
            ) {

                rolesToRemove.push(
                    warn2Role
                );
            }
        }


        if (rolesToRemove.length > 0) {

            await member.roles.remove(
                rolesToRemove
            );


            console.log(
                `🗑️ تم سحب رتب التحذيرات السابقة من ${member.user.tag}`
            );
        }

    } catch (error) {

        console.error(
            'خطأ أثناء سحب رتب التحذيرات السابقة:',
            error
        );
    }
}


// =========================
// إعطاء رتبة العقوبة
// =========================
async function assignPunishmentRole(
    interaction,
    punishmentType,
    discordId
) {

    console.log(
        `🔍 محاولة إعطاء رتبة العقوبة | النوع: ${punishmentType} | Discord ID: ${discordId}`
    );


    const cleanId =
        cleanDiscordId(discordId);


    if (!cleanId) {

        console.log(
            '⚠️ لم يتم إعطاء الرتبة: Discord ID غير صحيح.'
        );

        return false;
    }


    try {

        const settings =
            getGuildSettings(
                interaction.guild.id
            );


        if (!settings) {

            console.log(
                '⚠️ لم يتم العثور على إعدادات السيرفر.'
            );

            return false;
        }


        const roleKey =
            getRoleKey(
                punishmentType
            );


        if (!roleKey) {

            console.log(
                `⚠️ نوع العقوبة غير مرتبط برتبة: ${punishmentType}`
            );

            return false;
        }


        const roleId =
            settings[roleKey];


        if (!roleId) {

            console.log(
                `⚠️ لم يتم تحديد رتبة في الإعدادات: ${roleKey}`
            );

            return false;
        }


        console.log(
            `🔍 Role ID: ${roleId}`
        );


        const member =
            await interaction.guild.members.fetch(
                cleanId
            );


        const role =
            interaction.guild.roles.cache.get(
                roleId
            );


        if (!role) {

            console.log(
                `⚠️ لم يتم العثور على الرتبة داخل السيرفر: ${roleId}`
            );

            return false;
        }


        const botMember =
            interaction.guild.members.me;


        if (
            botMember &&
            role.position >=
            botMember.roles.highest.position
        ) {

            console.log(
                `❌ البوت لا يستطيع إعطاء رتبة ${role.name} لأن رتبة البوت أقل منها.`
            );

            return false;
        }


        await removePreviousWarnRoles(
            interaction,
            member,
            settings,
            punishmentType
        );


        if (
            member.roles.cache.has(
                role.id
            )
        ) {

            console.log(
                `ℹ️ العضو لديه الرتبة بالفعل: ${role.name}`
            );

            return true;
        }


        await member.roles.add(
            role
        );


        console.log(
            `✅ تم إعطاء رتبة ${role.name} لـ ${member.user.tag}`
        );


        return true;

    } catch (error) {

        console.error(
            '❌ خطأ أثناء إعطاء رتبة العقوبة:',
            error
        );

        return false;
    }
}


// =========================
// معالجة إرسال نموذج العقوبة
// =========================
async function handlePunishmentModal(
    interaction,
    punishmentType
) {

    const playerName =
        interaction.fields.getTextInputValue(
            'player_name'
        );


    const fivemId =
        interaction.fields.getTextInputValue(
            'fivem_id'
        );


    let discordId = null;

    let duration = null;

    let expiresAt = null;

    let system = 'غير محدد';


    // =========================
    // قراءة Discord ID
    // =========================
    try {

        const rawDiscordId =
            interaction.fields.getTextInputValue(
                'discord_id'
            );


        discordId =
            cleanDiscordId(
                rawDiscordId
            );

    } catch {

        discordId = null;
    }


    // =========================
    // التحقق من Discord ID
    // =========================
    const requiresDiscordId =

        punishmentType === 'temporary_ban' ||

        punishmentType === 'warn' ||

        punishmentType === 'warn_1' ||

        punishmentType === 'warn_2' ||

        punishmentType === 'warn_3';


    if (
        requiresDiscordId &&
        !discordId
    ) {

        await interaction.reply({

            ephemeral: true,

            content:
                '❌ Discord ID غير صحيح. يجب إدخال ID صحيح للعضو.'
        });

        return;
    }


    // =========================
    // قراءة النظام / القسم
    // =========================
    try {

        system =
            interaction.fields.getTextInputValue(
                'system'
            ) ||
            'غير محدد';

    } catch {

        system = 'غير محدد';
    }


    // =========================
    // الحظر المؤقت
    // =========================
    if (
        punishmentType ===
        'temporary_ban'
    ) {

        duration =
            interaction.fields.getTextInputValue(
                'duration'
            );


        const durationMs =
            parseDuration(
                duration
            );


        if (!durationMs) {

            await interaction.reply({

                ephemeral: true,

                content:
                    '❌ صيغة المدة غير صحيحة.\n\nاستخدم مثلاً:\n`10m` = 10 دقائق\n`6h` = 6 ساعات\n`1d` = يوم\n`7d` = أسبوع'
            });

            return;
        }


        expiresAt =
            Date.now() +
            durationMs;
    }


    // =========================
    // تحديد مستوى التحذير
    // =========================
    let finalPunishmentType =
        punishmentType;


    if (
        punishmentType ===
        'warn'
    ) {

        finalPunishmentType =
            getNextWarnType(
                interaction.guild.id,
                discordId,
                fivemId
            );


        console.log(
            `⚠️ تم تحديد مستوى التحذير تلقائياً: ${finalPunishmentType}`
        );
    }


    const reason =
        interaction.fields.getTextInputValue(
            'reason'
        );


    // =========================
    // حفظ القضية
    // =========================
    const newCase =
        addAccountabilityCase({

            guildId:
                interaction.guild.id,

            moderatorId:
                interaction.user.id,

            moderatorTag:
                interaction.user.tag,

            punishmentType:
                finalPunishmentType,

            playerName,

            fivemId,

            discordId:
                discordId || 'غير محدد',

            system,

            reason,

            duration,

            expiresAt
        });


    // =========================
    // إعطاء رتبة العقوبة
    // =========================
    const roleAssigned =
        await assignPunishmentRole(

            interaction,

            finalPunishmentType,

            discordId
        );


    const punishmentName =
        getPunishmentName(
            finalPunishmentType
        );


    // =========================
    // إنشاء السجل
    // =========================
    const embed =
        new EmbedBuilder()

            .setTitle(
                `⚖️ سجل محاسبة | ${punishmentName}`
            )

            .addFields(

                {

                    name:
                        '👤 اللاعب',

                    value:
                        playerName,

                    inline:
                        true
                },

                {

                    name:
                        '🎮 FiveM ID',

                    value:
                        fivemId,

                    inline:
                        true
                },

                {

                    name:
                        '💬 Discord ID',

                    value:
                        discordId ||
                        'غير محدد',

                    inline:
                        true
                },

                {

                    name:
                        '🖥️ النظام / القسم',

                    value:
                        system,

                    inline:
                        true
                },

                {

                    name:
                        '👮 الإداري',

                    value:
                        `<@${interaction.user.id}>`,

                    inline:
                        true
                },

                {

                    name:
                        '📝 السبب',

                    value:
                        reason,

                    inline:
                        false
                }
            )

            .setFooter({

                text:
                    `Falah Systems • Case ID: ${newCase.id}`
            })

            .setTimestamp();


    if (duration) {

        embed.addFields({

            name:
                '⏱️ مدة العقوبة',

            value:
                duration,

            inline:
                true
        });
    }


    // =========================
    // إرسال السجل للقناة
    // =========================
    try {

        const settings =
            getGuildSettings(
                interaction.guild.id
            );


        if (
            settings &&
            settings.punishmentLogChannel
        ) {

            const logChannel =
                interaction.guild.channels.cache.get(
                    settings.punishmentLogChannel
                );


            if (logChannel) {

                await logChannel.send({

                    embeds: [
                        embed
                    ]
                });
            }
        }

    } catch (error) {

        console.error(
            'خطأ في إرسال سجل المحاسبة:',
            error
        );
    }


    // =========================
    // رسالة نجاح
    // =========================
    let roleMessage;


    if (roleAssigned) {

        roleMessage =
            '✅ تم إعطاء رتبة العقوبة بنجاح.';

    } else {

        roleMessage =
            '⚠️ تم تسجيل العقوبة، لكن لم يتم إعطاء الرتبة. تحقق من إعدادات الرتب وصلاحيات البوت.';
    }


    await interaction.reply({

        ephemeral: true,

        embeds: [

            new EmbedBuilder()

                .setTitle(
                    '✅ تم تسجيل القضية'
                )

                .setDescription(

                    `⚖️ **نوع العقوبة:** ${punishmentName}\n` +

                    `👤 **اللاعب:** ${playerName}\n` +

                    `🎮 **FiveM ID:** ${fivemId}\n` +

                    `💬 **Discord ID:** ${discordId || 'غير محدد'}\n` +

                    `🖥️ **النظام:** ${system}\n` +

                    `👮 **الإداري:** ${interaction.user}\n\n` +

                    `${roleMessage}\n\n` +

                    'تم حفظ القضية وإرسالها إلى سجل المحاسبة.'
                )

                .setTimestamp()
        ]
    });
}


// =========================
// مراقب العقوبات المؤقتة
// =========================
function startPunishmentChecker(client) {

    console.log(
        '⏳ تم تشغيل مراقب العقوبات المؤقتة.'
    );


    setInterval(async () => {

        try {

            const cases =
                loadAccountability();


            const now =
                Date.now();


            let changed =
                false;


            for (
                const punishment of cases
            ) {

                // فقط الحظر المؤقت
                if (
                    punishment.punishmentType !==
                    'temporary_ban'
                ) {

                    continue;
                }


                // لا توجد مدة انتهاء
                if (
                    !punishment.expiresAt
                ) {

                    continue;
                }


                // لم تنته العقوبة
                if (
                    punishment.expiresAt > now
                ) {

                    continue;
                }


                // تمت معالجتها سابقاً
                if (
                    punishment.expired
                ) {

                    continue;
                }


                punishment.expired =
                    true;


                changed =
                    true;


                console.log(
                    `⏰ انتهت عقوبة اللاعب: ${punishment.playerName}`
                );


                const guild =
                    client.guilds.cache.get(
                        punishment.guildId
                    );


                if (!guild) {

                    console.log(
                        '⚠️ لم يتم العثور على السيرفر.'
                    );

                    continue;
                }


                const cleanId =
                    cleanDiscordId(
                        punishment.discordId
                    );


                if (!cleanId) {

                    console.log(
                        '⚠️ لا يوجد Discord ID صحيح لسحب رتبة العقوبة.'
                    );

                    continue;
                }


                try {

                    const member =
                        await guild.members.fetch(
                            cleanId
                        );


                    const settings =
                        getGuildSettings(
                            punishment.guildId
                        );


                    if (!settings) {

                        console.log(
                            '⚠️ لم يتم العثور على إعدادات السيرفر.'
                        );

                        continue;
                    }


                    const roleId =
                        settings.bannedTemporaryRole;


                    if (!roleId) {

                        console.log(
                            '⚠️ لم يتم تحديد رتبة الحظر المؤقت.'
                        );

                        continue;
                    }


                    const role =
                        guild.roles.cache.get(
                            roleId
                        );


                    if (!role) {

                        console.log(
                            '⚠️ لم يتم العثور على رتبة الحظر المؤقت.'
                        );

                        continue;
                    }


                    if (
                        member.roles.cache.has(
                            role.id
                        )
                    ) {

                        await member.roles.remove(
                            role
                        );


                        console.log(
                            `🗑️ تم سحب رتبة ${role.name} من ${member.user.tag}`
                        );


                        // =========================
                        // إرسال رسالة خاصة
                        // =========================
                        try {

                            await member.send({

                                embeds: [

                                    new EmbedBuilder()

                                        .setTitle(
                                            '🔓 انتهت العقوبة المؤقتة'
                                        )

                                        .setDescription(
                                            `مرحباً ${member.user.username}\n\n` +
                                            `انتهت مدة الحظر المؤقت الخاصة بك.\n` +
                                            `تمت إزالة رتبة الحظر المؤقت من حسابك.\n\n` +
                                            `📌 السبب: ${punishment.reason || 'غير محدد'}`
                                        )

                                        .setTimestamp()
                                ]
                            });

                        } catch (dmError) {

                            console.log(
                                `⚠️ تعذر إرسال رسالة خاصة إلى ${member.user.tag}`
                            );
                        }
                    }

                } catch (error) {

                    console.error(
                        'خطأ أثناء إنهاء العقوبة:',
                        error
                    );
                }
            }


            if (changed) {

                saveAccountability(
                    cases
                );
            }

        } catch (error) {

            console.error(
                'خطأ في مراقب العقوبات:',
                error
            );
        }

    }, 60 * 1000);
}


// =========================
// تصدير النظام
// =========================
module.exports = {

    openPermanentBanModal,

    openTemporaryBanModal,

    openWarnModal,

    openWarn1Modal,

    openWarn2Modal,

    openWarn3Modal,

    handlePunishmentModal,

    loadAccountability,

    saveAccountability,

    addAccountabilityCase,

    startPunishmentChecker
};