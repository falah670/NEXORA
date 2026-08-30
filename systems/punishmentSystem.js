const fs = require('fs');
const path = require('path');

const {
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
    MessageFlags
} = require('discord.js');

const {
    getGuildSettings
} = require('./config');


// =========================
// مسار سجل المحاسبة
// =========================
const dataDirectory = path.join(
    __dirname,
    '../data'
);

const accountabilityPath = path.join(
    dataDirectory,
    'accountability.json'
);


// =========================
// التأكد من وجود مجلد البيانات
// =========================
function ensureDataDirectory() {

    try {

        if (!fs.existsSync(dataDirectory)) {

            fs.mkdirSync(
                dataDirectory,
                {
                    recursive: true
                }
            );
        }

    } catch (error) {

        console.error(
            '❌ خطأ أثناء إنشاء مجلد البيانات:',
            error
        );
    }
}


// =========================
// قراءة سجل المحاسبة
// =========================
function loadAccountability() {

    try {

        ensureDataDirectory();


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


        const parsed = JSON.parse(data);


        if (!Array.isArray(parsed)) {

            return [];
        }


        return parsed;

    } catch (error) {

        console.error(
            '❌ خطأ في قراءة سجل المحاسبة:',
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

        ensureDataDirectory();


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
            '❌ خطأ في حفظ سجل المحاسبة:',
            error
        );
    }
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
            '⚠️ التحذير الأول',

        warn_2:
            '⚠️ التحذير الثاني',

        warn_3:
            '🚨 التحذير الثالث'
    };


    return names[type] || 'عقوبة';
}


// =========================
// تنظيف Discord ID
// =========================
function cleanDiscordId(discordId) {

    if (!discordId) {

        return 'غير محدد';
    }


    const cleaned = String(discordId)
        .trim()
        .replace(/[<@!>]/g, '');


    if (!cleaned) {

        return 'غير محدد';
    }


    return cleaned;
}


// =========================
// فتح نافذة الحظر الدائم
// =========================
async function openPermanentBanModal(
    interaction
) {

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
            'اختياري - مثال: 123456789'
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
async function openTemporaryBanModal(
    interaction
) {

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
            'Discord ID'
        )

        .setPlaceholder(
            'مطلوب لإعطاء وسحب رتبة الحظر'
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
            'مثال: 6h أو 1d أو 7d'
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
    interaction
) {

    const modal = new ModalBuilder()

        .setCustomId(
            'punishment_warn_modal'
        )

        .setTitle(
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
// تحويل مدة إلى ملي ثانية
// أمثلة:
// 30m = 30 دقيقة
// 6h = 6 ساعات
// 1d = يوم
// 7d = 7 أيام
// 1w = أسبوع
// =========================
function parseDuration(duration) {

    if (!duration) {

        return null;
    }


    const value = String(duration)
        .trim()
        .toLowerCase();


    const match = value.match(
        /^(\d+)\s*(m|h|d|w)$/
    );


    if (!match) {

        return null;
    }


    const amount = parseInt(
        match[1],
        10
    );


    const unit = match[2];


    if (
        Number.isNaN(amount) ||
        amount <= 0
    ) {

        return null;
    }


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
// الحصول على مفاتيح الرتبة
// يدعم أكثر من اسم للإعداد
// =========================
function getPunishmentRoleKeys(
    punishmentType
) {

    switch (punishmentType) {

        case 'temporary_ban':

            return [
                'bannedTemporaryRole',
                'temporaryBanRole',
                'temporary_ban_role'
            ];


        case 'permanent_ban':

            return [
                'bannedPermanentRole',
                'permanentBanRole',
                'permanent_ban_role'
            ];


        case 'warn':
        case 'warn_1':

            return [
                'warn1Role',
                'warning1Role',
                'warn_1_role'
            ];


        case 'warn_2':

            return [
                'warn2Role',
                'warning2Role',
                'warn_2_role'
            ];


        case 'warn_3':

            return [
                'warn3Role',
                'warning3Role',
                'warn_3_role'
            ];


        default:

            return [];
    }
}


// =========================
// الحصول على ID رتبة العقوبة
// =========================
function getPunishmentRoleId(
    settings,
    punishmentType
) {

    if (!settings) {

        return {
            roleId: null,
            roleKey: null
        };
    }


    const roleKeys = getPunishmentRoleKeys(
        punishmentType
    );


    for (const roleKey of roleKeys) {

        if (
            settings[roleKey] &&
            String(settings[roleKey]).trim()
        ) {

            return {

                roleId:
                    String(settings[roleKey]).trim(),

                roleKey
            };
        }
    }


    return {

        roleId: null,
        roleKey:
            roleKeys[0] || null
    };
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
        `🔎 محاولة إعطاء رتبة | العقوبة: ${punishmentType} | Discord ID: ${discordId}`
    );


    if (
        !discordId ||
        discordId === 'غير محدد'
    ) {

        console.log(
            '⚠️ لم يتم تحديد Discord ID لذلك لن يتم إعطاء رتبة.'
        );

        return {

            success: false,

            message:
                'لم يتم إعطاء رتبة لأن Discord ID غير محدد.'
        };
    }


    discordId = cleanDiscordId(
        discordId
    );


    try {

        if (!interaction.guild) {

            return {

                success: false,

                message:
                    'لم يتم العثور على السيرفر.'
            };
        }


        // =========================
        // جلب الإعدادات
        // =========================
        const settings = getGuildSettings(
            interaction.guild.id
        );


        if (!settings) {

            console.log(
                '❌ لم يتم العثور على إعدادات السيرفر.'
            );

            return {

                success: false,

                message:
                    'لم يتم العثور على إعدادات السيرفر.'
            };
        }


        // =========================
        // الحصول على ID الرتبة
        // =========================
        const {

            roleId,
            roleKey

        } = getPunishmentRoleId(
            settings,
            punishmentType
        );


        console.log(
            `🔑 مفتاح إعداد الرتبة: ${roleKey}`
        );


        if (!roleId) {

            console.log(
                `❌ لم يتم إعداد رتبة العقوبة المطلوبة. المفتاح المتوقع: ${roleKey}`
            );

            console.log(
                '📋 الإعدادات الحالية:',
                settings
            );

            return {

                success: false,

                message:
                    `لم يتم إعداد رتبة العقوبة في الإعدادات (${roleKey}).`
            };
        }


        console.log(
            `🎭 Role ID: ${roleId}`
        );


        // =========================
        // جلب الرتبة
        // =========================
        const role = await interaction.guild.roles.fetch(
            roleId
        ).catch(() => null);


        if (!role) {

            console.log(
                `❌ لم يتم العثور على الرتبة: ${roleId}`
            );

            return {

                success: false,

                message:
                    'ID الرتبة المحفوظ غير صحيح أو الرتبة غير موجودة.'
            };
        }


        console.log(
            `✅ تم العثور على الرتبة: ${role.name}`
        );


        // =========================
        // جلب العضو
        // =========================
        const member = await interaction.guild.members.fetch(
            discordId
        ).catch(() => null);


        if (!member) {

            console.log(
                `❌ لم يتم العثور على العضو صاحب Discord ID: ${discordId}`
            );

            return {

                success: false,

                message:
                    'لم يتم العثور على العضو داخل السيرفر.'
            };
        }


        console.log(
            `👤 تم العثور على العضو: ${member.user.tag}`
        );


        // =========================
        // جلب البوت
        // =========================
        const botMember = await interaction.guild.members.fetchMe()
            .catch(() => interaction.guild.members.me);


        if (!botMember) {

            console.log(
                '❌ لم يتم العثور على حساب البوت داخل السيرفر.'
            );

            return {

                success: false,

                message:
                    'لم يتم العثور على البوت داخل السيرفر.'
            };
        }


        // =========================
        // التحقق من صلاحية Manage Roles
        // =========================
        if (
            !botMember.permissions.has(
                PermissionFlagsBits.ManageRoles
            )
        ) {

            console.log(
                '❌ البوت لا يملك صلاحية Manage Roles.'
            );

            return {

                success: false,

                message:
                    'البوت لا يملك صلاحية Manage Roles.'
            };
        }


        // =========================
        // التحقق من الرتبة المدارة
        // =========================
        if (role.managed) {

            console.log(
                '❌ هذه الرتبة Managed ولا يمكن للبوت إعطاؤها.'
            );

            return {

                success: false,

                message:
                    'هذه الرتبة مرتبطة بتكامل ولا يمكن للبوت إدارتها.'
            };
        }


        // =========================
        // التحقق من ترتيب الرتب
        // =========================
        if (
            role.position >=
            botMember.roles.highest.position
        ) {

            console.log(
                '❌ رتبة العقوبة أعلى من رتبة البوت أو مساوية لها.'
            );

            console.log(
                `رتبة العقوبة: ${role.name}`
            );

            console.log(
                `مكان رتبة العقوبة: ${role.position}`
            );

            console.log(
                `أعلى رتبة للبوت: ${botMember.roles.highest.name}`
            );

            console.log(
                `مكان رتبة البوت: ${botMember.roles.highest.position}`
            );

            return {

                success: false,

                message:
                    'رتبة العقوبة يجب أن تكون أسفل أعلى رتبة للبوت.'
            };
        }


        // =========================
        // التحقق هل العضو لديه الرتبة
        // =========================
        if (
            member.roles.cache.has(
                role.id
            )
        ) {

            console.log(
                `ℹ️ العضو ${member.user.tag} لديه الرتبة بالفعل.`
            );

            return {

                success: true,

                message:
                    `العضو لديه رتبة ${role.name} بالفعل.`
            };
        }


        // =========================
        // إعطاء الرتبة
        // =========================
        await member.roles.add(

            role,

            `Falah Systems | Punishment: ${punishmentType}`
        );


        console.log(
            `✅ تم إعطاء رتبة ${role.name} للعضو ${member.user.tag}`
        );


        return {

            success: true,

            message:
                `تم إعطاء رتبة ${role.name} بنجاح.`
        };


    } catch (error) {

        console.error(
            '❌ خطأ أثناء إعطاء رتبة العقوبة:',
            error
        );


        return {

            success: false,

            message:
                `حدث خطأ أثناء إعطاء الرتبة: ${error.message}`
        };
    }
}


// =========================
// معالجة إرسال نموذج العقوبة
// =========================
async function handlePunishmentModal(
    interaction,
    punishmentType
) {

    try {

        const playerName =
            interaction.fields.getTextInputValue(
                'player_name'
            );


        const fivemId =
            interaction.fields.getTextInputValue(
                'fivem_id'
            );


        let discordId =
            'غير محدد';


        let duration =
            null;


        let expiresAt =
            null;


        let system =
            'غير محدد';


        // =========================
        // الحظر المؤقت
        // =========================
        if (
            punishmentType ===
            'temporary_ban'
        ) {

            discordId =
                cleanDiscordId(
                    interaction.fields.getTextInputValue(
                        'discord_id'
                    )
                );


            duration =
                interaction.fields.getTextInputValue(
                    'duration'
                );


            const durationMs =
                parseDuration(
                    duration
                );


            // =========================
            // التحقق من المدة
            // =========================
            if (!durationMs) {

                await interaction.reply({

                    flags:
                        MessageFlags.Ephemeral,

                    content:
                        '❌ صيغة المدة غير صحيحة.\n\n' +
                        'استخدم مثلًا:\n' +
                        '`30m` = 30 دقيقة\n' +
                        '`6h` = 6 ساعات\n' +
                        '`1d` = يوم\n' +
                        '`7d` = 7 أيام\n' +
                        '`1w` = أسبوع'
                });

                return;
            }


            expiresAt =
                Date.now() +
                durationMs;


            system =
                'غير محدد';


        } else {

            // =========================
            // باقي العقوبات
            // =========================
            discordId =
                cleanDiscordId(
                    interaction.fields.getTextInputValue(
                        'discord_id'
                    )
                );


            system =
                interaction.fields.getTextInputValue(
                    'system'
                );
        }


        const reason =
            interaction.fields.getTextInputValue(
                'reason'
            );


        // =========================
        // تسجيل القضية
        // =========================
        const newCase =
            addAccountabilityCase({

                guildId:
                    interaction.guild.id,

                moderatorId:
                    interaction.user.id,

                moderatorTag:
                    interaction.user.tag,

                punishmentType,

                playerName,

                fivemId,

                discordId,

                system,

                reason,

                duration,

                expiresAt
            });


        // =========================
        // إعطاء رتبة العقوبة
        // =========================
        const roleResult =
            await assignPunishmentRole(

                interaction,

                punishmentType,

                discordId
            );


        // =========================
        // اسم العقوبة
        // =========================
        const punishmentName =
            getPunishmentName(
                punishmentType
            );


        // =========================
        // إنشاء Embed اللوق
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
                            playerName || 'غير محدد',

                        inline:
                            true
                    },

                    {

                        name:
                            '🎮 FiveM ID',

                        value:
                            fivemId || 'غير محدد',

                        inline:
                            true
                    },

                    {

                        name:
                            '💬 Discord ID',

                        value:
                            discordId || 'غير محدد',

                        inline:
                            true
                    },

                    {

                        name:
                            '🖥️ النظام / القسم',

                        value:
                            system || 'غير محدد',

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
                            reason || 'غير محدد',

                        inline:
                            false
                    }
                )

                .setFooter({

                    text:
                        `Falah Systems • Case ID: ${newCase.id}`
                })

                .setTimestamp();


        // =========================
        // إضافة مدة العقوبة
        // =========================
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
        // إضافة حالة الرتبة
        // =========================
        if (
            discordId !== 'غير محدد'
        ) {

            embed.addFields({

                name:
                    '🎭 حالة الرتبة',

                value:
                    roleResult.success
                        ? `✅ ${roleResult.message}`
                        : `⚠️ ${roleResult.message}`,

                inline:
                    false
            });
        }


        // =========================
        // إرسال اللوق
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
                    await interaction.guild.channels.fetch(
                        settings.punishmentLogChannel
                    ).catch(() => null);


                if (
                    logChannel &&
                    logChannel.isTextBased()
                ) {

                    await logChannel.send({

                        embeds: [
                            embed
                        ]
                    });
                }
            }


        } catch (error) {

            console.error(
                '❌ خطأ في إرسال سجل المحاسبة:',
                error
            );
        }


        // =========================
        // رد نجاح
        // =========================
        await interaction.reply({

            flags:
                MessageFlags.Ephemeral,

            embeds: [

                new EmbedBuilder()

                    .setTitle(
                        '✅ تم تسجيل القضية'
                    )

                    .setDescription(

                        `⚖️ **نوع العقوبة:** ${punishmentName}\n` +

                        `👤 **اللاعب:** ${playerName}\n` +

                        `🎮 **FiveM ID:** ${fivemId}\n` +

                        `💬 **Discord ID:** ${discordId}\n` +

                        `🖥️ **النظام:** ${system}\n` +

                        `👮 **الإداري:** ${interaction.user}\n\n` +

                        `🎭 **حالة الرتبة:** ${roleResult.success ? '✅' : '⚠️'} ${roleResult.message}\n\n` +

                        'تم حفظ القضية وإرسالها إلى سجل المحاسبة.'
                    )

                    .setTimestamp()
            ]
        });


    } catch (error) {

        console.error(
            '❌ خطأ أثناء معالجة نموذج العقوبة:',
            error
        );


        if (
            !interaction.replied &&
            !interaction.deferred
        ) {

            await interaction.reply({

                flags:
                    MessageFlags.Ephemeral,

                content:
                    '❌ حدث خطأ أثناء تسجيل العقوبة. تحقق من الـ Terminal.'
            });
        }
    }
}


// =========================
// سحب رتبة العقوبة
// =========================
async function removePunishmentRole(
    client,
    punishment
) {

    try {

        const guild =
            await client.guilds.fetch(
                punishment.guildId
            ).catch(() => null);


        if (!guild) {

            return {

                success: false,

                retry: true,

                message:
                    'لم يتم العثور على السيرفر.'
            };
        }


        if (
            !punishment.discordId ||
            punishment.discordId === 'غير محدد'
        ) {

            return {

                success: true,

                retry: false,

                message:
                    'لا يوجد Discord ID لسحب الرتبة.'
            };
        }


        const discordId =
            cleanDiscordId(
                punishment.discordId
            );


        const member =
            await guild.members.fetch(
                discordId
            ).catch(() => null);


        if (!member) {

            return {

                success: true,

                retry: false,

                message:
                    'العضو غير موجود في السيرفر.'
            };
        }


        const settings =
            getGuildSettings(
                punishment.guildId
            );


        if (!settings) {

            return {

                success: false,

                retry: true,

                message:
                    'لم يتم العثور على إعدادات السيرفر.'
            };
        }


        const {

            roleId

        } = getPunishmentRoleId(

            settings,

            punishment.punishmentType
        );


        if (!roleId) {

            return {

                success: false,

                retry: true,

                message:
                    'لم يتم العثور على ID رتبة العقوبة.'
            };
        }


        const role =
            await guild.roles.fetch(
                roleId
            ).catch(() => null);


        if (!role) {

            return {

                success: false,

                retry: true,

                message:
                    'رتبة العقوبة غير موجودة.'
            };
        }


        const botMember =
            await guild.members.fetchMe()
                .catch(() => guild.members.me);


        if (!botMember) {

            return {

                success: false,

                retry: true,

                message:
                    'لم يتم العثور على البوت داخل السيرفر.'
            };
        }


        if (
            !botMember.permissions.has(
                PermissionFlagsBits.ManageRoles
            )
        ) {

            return {

                success: false,

                retry: true,

                message:
                    'البوت لا يملك صلاحية Manage Roles.'
            };
        }


        if (
            role.position >=
            botMember.roles.highest.position
        ) {

            return {

                success: false,

                retry: true,

                message:
                    'رتبة العقوبة أعلى من رتبة البوت.'
            };
        }


        if (
            member.roles.cache.has(
                role.id
            )
        ) {

            await member.roles.remove(

                role,

                'Falah Systems | انتهت مدة العقوبة'
            );


            console.log(
                `🗑️ تم سحب رتبة ${role.name} من ${member.user.tag}`
            );


            return {

                success: true,

                retry: false,

                message:
                    'تم سحب الرتبة بنجاح.'
            };
        }


        return {

            success: true,

            retry: false,

            message:
                'العضو لا يملك الرتبة أصلًا.'
        };


    } catch (error) {

        console.error(
            '❌ خطأ أثناء سحب رتبة العقوبة:',
            error
        );


        return {

            success: false,

            retry: true,

            message:
                error.message
        };
    }
}


// =========================
// مراقب العقوبات المؤقتة
// =========================
function startPunishmentChecker(client) {

    console.log(
        '⏳ تم تشغيل مراقب العقوبات المؤقتة.'
    );


    const checkPunishments =
        async () => {

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

                    // =========================
                    // العقوبة تمت معالجتها
                    // =========================
                    if (
                        punishment.expired
                    ) {

                        continue;
                    }


                    // =========================
                    // لا يوجد وقت انتهاء
                    // =========================
                    if (
                        !punishment.expiresAt
                    ) {

                        continue;
                    }


                    // =========================
                    // لم تنته العقوبة بعد
                    // =========================
                    if (
                        punishment.expiresAt > now
                    ) {

                        continue;
                    }


                    console.log(
                        `⏰ انتهت عقوبة اللاعب: ${punishment.playerName}`
                    );


                    const result =
                        await removePunishmentRole(

                            client,

                            punishment
                        );


                    // =========================
                    // إذا تمت المعالجة بنجاح
                    // =========================
                    if (
                        result.success
                    ) {

                        punishment.expired =
                            true;


                        punishment.expiredAt =
                            Date.now();


                        changed =
                            true;


                        console.log(
                            `✅ تمت معالجة انتهاء عقوبة ${punishment.playerName}: ${result.message}`
                        );

                    } else {

                        console.log(
                            `⚠️ لم يتم إنهاء العقوبة بالكامل للاعب ${punishment.playerName}: ${result.message}`
                        );

                        // لن نضع expired = true
                        // لكي يحاول النظام مرة أخرى
                    }
                }


                // =========================
                // حفظ التعديلات
                // =========================
                if (changed) {

                    saveAccountability(
                        cases
                    );
                }


            } catch (error) {

                console.error(
                    '❌ خطأ في مراقب العقوبات:',
                    error
                );
            }
        };


    // تشغيل الفحص مباشرة
    checkPunishments();


    // ثم كل دقيقة
    setInterval(

        checkPunishments,

        60 * 1000
    );
}


// =========================
// تصدير النظام
// =========================
module.exports = {

    openPermanentBanModal,

    openTemporaryBanModal,

    openWarnModal,

    handlePunishmentModal,

    loadAccountability,

    saveAccountability,

    addAccountabilityCase,

    startPunishmentChecker
};