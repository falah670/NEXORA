const fs = require('fs');
const path = require('path');

const {
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');

const {
    getGuildSettings
} = require('./config');


// =========================
// مسار سجل المحاسبة
// =========================
const accountabilityPath =
    path.join(
        __dirname,
        '../data/accountability.json'
    );


// =========================
// التأكد من وجود مجلد البيانات
// =========================
const dataFolder =
    path.join(
        __dirname,
        '../data'
    );


if (!fs.existsSync(dataFolder)) {

    fs.mkdirSync(
        dataFolder,
        {
            recursive: true
        }
    );
}


// =========================
// قراءة سجل المحاسبة
// =========================
function loadAccountability() {

    try {

        if (
            !fs.existsSync(
                accountabilityPath
            )
        ) {

            fs.writeFileSync(
                accountabilityPath,
                '[]',
                'utf8'
            );

            return [];
        }


        const data =
            fs.readFileSync(
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
// إضافة قضية محاسبة
// =========================
function addAccountabilityCase(data) {

    const cases =
        loadAccountability();


    const newCase = {

        id:
            `${Date.now()}-${Math.floor(
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


        steamId:
            data.steamId,


        discordId:
            data.discordId ||
            'غير محدد',


        system:
            data.system,


        reason:
            data.reason,


        duration:
            data.duration ||
            null,


        evidence:
            data.evidence ||
            null,


        status:
            data.status ||
            'active',


        reviewMessageId:
            data.reviewMessageId ||
            null,


        createdAt:
            Date.now()
    };


    cases.push(
        newCase
    );


    saveAccountability(
        cases
    );


    return newCase;
}


// =========================
// البحث عن قضية
// =========================
function getAccountabilityCase(
    caseId
) {

    const cases =
        loadAccountability();


    return cases.find(
        item =>
            item.id === caseId
    );
}


// =========================
// تحديث قضية
// =========================
function updateAccountabilityCase(
    caseId,
    updates
) {

    const cases =
        loadAccountability();


    const caseIndex =
        cases.findIndex(
            item =>
                item.id === caseId
        );


    if (
        caseIndex === -1
    ) {

        return null;
    }


    cases[caseIndex] = {

        ...cases[caseIndex],

        ...updates
    };


    saveAccountability(
        cases
    );


    return cases[caseIndex];
}


// =========================
// أسماء العقوبات
// =========================
function getPunishmentName(
    type
) {

    const names = {

        permanent_ban:
            '🔨 حظر دائم',


        temporary_ban:
            '⏱️ حظر مؤقت',


        warn:
            '⚠️ تحذير'
    };


    return names[type] ||
        'عقوبة';
}


// =========================
// لون العقوبة
// =========================
function getPunishmentColor(
    type
) {

    const colors = {

        permanent_ban:
            0xED4245,


        temporary_ban:
            0xFEE75C,


        warn:
            0xFAA61A
    };


    return colors[type] ||
        0x5865F2;
}


// =========================
// إنشاء Embed القضية
// =========================
function createCaseEmbed(
    caseData
) {

    const punishmentName =
        getPunishmentName(
            caseData.punishmentType
        );


    const embed =
        new EmbedBuilder()

            .setTitle(
                `⚖️ مراجعة عقوبة | ${punishmentName}`
            )

            .setColor(
                getPunishmentColor(
                    caseData.punishmentType
                )
            )

            .addFields(

                {

                    name:
                        '👤 اللاعب',


                    value:
                        caseData.playerName ||
                        'غير محدد',


                    inline:
                        true
                },


                {

                    name:
                        '🎮 Steam ID',


                    value:
                        caseData.steamId ||
                        'غير محدد',


                    inline:
                        true
                },


                {

                    name:
                        '💬 Discord ID',


                    value:
                        caseData.discordId ||
                        'غير محدد',


                    inline:
                        true
                },


                {

                    name:
                        '🖥️ النظام / القسم',


                    value:
                        caseData.system ||
                        'غير محدد',


                    inline:
                        true
                },


                {

                    name:
                        '👮 الإداري المسؤول',


                    value:
                        `<@${caseData.moderatorId}>`,


                    inline:
                        true
                },


                {

                    name:
                        '📌 حالة القضية',


                    value:
                        caseData.status === 'active'
                            ? '🟢 نشطة'
                            : caseData.status === 'removed'
                                ? '🔓 تم فك العقوبة'
                                : '🔴 غير نشطة',


                    inline:
                        true
                },


                {

                    name:
                        '📝 سبب العقوبة',


                    value:
                        caseData.reason ||
                        'غير محدد',


                    inline:
                        false
                }
            )

            .setFooter({

                text:
                    `Falah Systems • Case ID: ${caseData.id}`
            })

            .setTimestamp(
                new Date(
                    caseData.createdAt
                )
            );


    if (
        caseData.duration
    ) {

        embed.addFields({

            name:
                '⏱️ مدة العقوبة',


            value:
                caseData.duration,


            inline:
                true
        });
    }


    if (
        caseData.evidence
    ) {

        embed.addFields({

            name:
                '🔗 الدليل',


            value:
                `[اضغط هنا لفتح الدليل](${caseData.evidence})`,


            inline:
                true
        });

    } else {

        embed.addFields({

            name:
                '🔗 الدليل',


            value:
                'لم يتم إضافة دليل حتى الآن',


            inline:
                true
        });
    }


    return embed;
}


// =========================
// أزرار القضية
// =========================
function createCaseButtons(
    caseData
) {

    const evidenceButton =
        new ButtonBuilder()

            .setCustomId(
                `add_evidence:${caseData.id}`
            )

            .setLabel(
                'إضافة دليل'
            )

            .setEmoji(
                '🔗'
            )

            .setStyle(
                ButtonStyle.Primary
            );


    const removeButton =
        new ButtonBuilder()

            .setCustomId(
                `remove_punishment:${caseData.id}`
            )

            .setLabel(
                'فك العقوبة'
            )

            .setEmoji(
                '🔓'
            )

            .setStyle(
                ButtonStyle.Danger
            );


    if (
        caseData.status !== 'active'
    ) {

        evidenceButton.setDisabled(
            true
        );


        removeButton.setDisabled(
            true
        );
    }


    return [

        new ActionRowBuilder()

            .addComponents(

                evidenceButton,

                removeButton
            )
    ];
}


// =========================
// فتح نافذة الحظر الدائم
// =========================
async function openPermanentBanModal(
    interaction
) {

    const modal =
        new ModalBuilder()

            .setCustomId(
                'punishment_permanent_ban_modal'
            )

            .setTitle(
                '🔨 تسجيل حظر دائم'
            );


    const playerName =
        new TextInputBuilder()

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


    const steamId =
        new TextInputBuilder()

            .setCustomId(
                'steam_id'
            )

            .setLabel(
                'Steam ID'
            )

            .setPlaceholder(
                'مثال: steam:110000xxxxxxxx'
            )

            .setStyle(
                TextInputStyle.Short
            )

            .setRequired(true);


    const discordId =
        new TextInputBuilder()

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


    const system =
        new TextInputBuilder()

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


    const reason =
        new TextInputBuilder()

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
            .addComponents(steamId),

        new ActionRowBuilder()
            .addComponents(discordId),

        new ActionRowBuilder()
            .addComponents(system),

        new ActionRowBuilder()
            .addComponents(reason)
    );


    await interaction.showModal(
        modal
    );
}


// =========================
// فتح نافذة الحظر المؤقت
// =========================
async function openTemporaryBanModal(
    interaction
) {

    const modal =
        new ModalBuilder()

            .setCustomId(
                'punishment_temporary_ban_modal'
            )

            .setTitle(
                '⏱️ تسجيل حظر مؤقت'
            );


    const playerName =
        new TextInputBuilder()

            .setCustomId(
                'player_name'
            )

            .setLabel(
                'اسم اللاعب'
            )

            .setStyle(
                TextInputStyle.Short
            )

            .setRequired(true);


    const steamId =
        new TextInputBuilder()

            .setCustomId(
                'steam_id'
            )

            .setLabel(
                'Steam ID'
            )

            .setPlaceholder(
                'steam:110000xxxxxxxx'
            )

            .setStyle(
                TextInputStyle.Short
            )

            .setRequired(true);


    const duration =
        new TextInputBuilder()

            .setCustomId(
                'duration'
            )

            .setLabel(
                'مدة الحظر'
            )

            .setPlaceholder(
                'مثال: 6 ساعات أو يوم'
            )

            .setStyle(
                TextInputStyle.Short
            )

            .setRequired(true);


    const system =
        new TextInputBuilder()

            .setCustomId(
                'system'
            )

            .setLabel(
                'النظام أو القسم'
            )

            .setStyle(
                TextInputStyle.Short
            )

            .setRequired(true);


    const reason =
        new TextInputBuilder()

            .setCustomId(
                'reason'
            )

            .setLabel(
                'سبب الحظر'
            )

            .setStyle(
                TextInputStyle.Paragraph
            )

            .setRequired(true);


    modal.addComponents(

        new ActionRowBuilder()
            .addComponents(playerName),

        new ActionRowBuilder()
            .addComponents(steamId),

        new ActionRowBuilder()
            .addComponents(duration),

        new ActionRowBuilder()
            .addComponents(system),

        new ActionRowBuilder()
            .addComponents(reason)
    );


    await interaction.showModal(
        modal
    );
}


// =========================
// فتح نافذة التحذير
// =========================
async function openWarnModal(
    interaction
) {

    const modal =
        new ModalBuilder()

            .setCustomId(
                'punishment_warn_modal'
            )

            .setTitle(
                '⚠️ تسجيل تحذير'
            );


    const playerName =
        new TextInputBuilder()

            .setCustomId(
                'player_name'
            )

            .setLabel(
                'اسم اللاعب'
            )

            .setStyle(
                TextInputStyle.Short
            )

            .setRequired(true);


    const steamId =
        new TextInputBuilder()

            .setCustomId(
                'steam_id'
            )

            .setLabel(
                'Steam ID'
            )

            .setStyle(
                TextInputStyle.Short
            )

            .setRequired(true);


    const warnLevel =
        new TextInputBuilder()

            .setCustomId(
                'warn_level'
            )

            .setLabel(
                'مستوى التحذير'
            )

            .setPlaceholder(
                'اكتب: 1 أو 2 أو 3'
            )

            .setStyle(
                TextInputStyle.Short
            )

            .setRequired(true);


    const system =
        new TextInputBuilder()

            .setCustomId(
                'system'
            )

            .setLabel(
                'النظام أو القسم'
            )

            .setStyle(
                TextInputStyle.Short
            )

            .setRequired(true);


    const reason =
        new TextInputBuilder()

            .setCustomId(
                'reason'
            )

            .setLabel(
                'سبب التحذير'
            )

            .setStyle(
                TextInputStyle.Paragraph
            )

            .setRequired(true);


    modal.addComponents(

        new ActionRowBuilder()
            .addComponents(playerName),

        new ActionRowBuilder()
            .addComponents(steamId),

        new ActionRowBuilder()
            .addComponents(warnLevel),

        new ActionRowBuilder()
            .addComponents(system),

        new ActionRowBuilder()
            .addComponents(reason)
    );


    await interaction.showModal(
        modal
    );
}


// =========================
// فتح نافذة إضافة الدليل
// =========================
async function openEvidenceModal(
    interaction,
    caseId
) {

    const caseData =
        getAccountabilityCase(
            caseId
        );


    if (!caseData) {

        return interaction.reply({

            content:
                '❌ لم يتم العثور على القضية.',

            ephemeral:
                true
        });
    }


    const modal =
        new ModalBuilder()

            .setCustomId(
                `add_evidence_modal:${caseId}`
            )

            .setTitle(
                '🔗 إضافة دليل للقضية'
            );


    const evidence =
        new TextInputBuilder()

            .setCustomId(
                'evidence_link'
            )

            .setLabel(
                'رابط الدليل'
            )

            .setPlaceholder(
                'ضع رابط الفيديو أو الصورة أو Discord'
            )

            .setStyle(
                TextInputStyle.Paragraph
            )

            .setRequired(true);


    modal.addComponents(

        new ActionRowBuilder()
            .addComponents(evidence)
    );


    await interaction.showModal(
        modal
    );
}


// =========================
// معالجة إضافة الدليل
// =========================
async function handleEvidenceModal(
    interaction,
    caseId
) {

    const evidence =
        interaction.fields.getTextInputValue(
            'evidence_link'
        );


    const caseData =
        updateAccountabilityCase(

            caseId,

            {
                evidence:
                    evidence
            }
        );


    if (!caseData) {

        return interaction.reply({

            content:
                '❌ لم يتم العثور على القضية.',

            ephemeral:
                true
        });
    }


    await updateReviewMessage(
        interaction.guild,
        caseData
    );


    await interaction.reply({

        content:
            '✅ تم إضافة الدليل إلى القضية.',

        ephemeral:
            true
    });
}


// =========================
// معالجة فك العقوبة
// =========================
async function removePunishment(
    interaction,
    caseId
) {

    const caseData =
        getAccountabilityCase(
            caseId
        );


    if (!caseData) {

        return interaction.reply({

            content:
                '❌ لم يتم العثور على القضية.',

            ephemeral:
                true
        });
    }


    if (
        caseData.status !== 'active'
    ) {

        return interaction.reply({

            content:
                '❌ هذه العقوبة تم التعامل معها مسبقًا.',

            ephemeral:
                true
        });
    }


    const updatedCase =
        updateAccountabilityCase(

            caseId,

            {

                status:
                    'removed',

                removedBy:
                    interaction.user.id,

                removedAt:
                    Date.now()
            }
        );


    await updateReviewMessage(
        interaction.guild,
        updatedCase
    );


    await interaction.reply({

        content:

            `🔓 تم فك العقوبة عن اللاعب **${updatedCase.playerName}**.\n` +

            `👮 بواسطة: ${interaction.user}`,

        ephemeral:
            true
    });
}


// =========================
// تحديث رسالة المراجعة
// =========================
async function updateReviewMessage(
    guild,
    caseData
) {

    try {

        const settings =
            getGuildSettings(
                guild.id
            );


        if (
            !settings ||
            !settings.punishmentReviewChannel ||
            !caseData.reviewMessageId
        ) {

            return;
        }


        const channel =
            guild.channels.cache.get(
                settings.punishmentReviewChannel
            );


        if (!channel) {

            return;
        }


        const message =
            await channel.messages.fetch(
                caseData.reviewMessageId
            ).catch(
                () => null
            );


        if (!message) {

            return;
        }


        await message.edit({

            embeds: [

                createCaseEmbed(
                    caseData
                )
            ],

            components:

                createCaseButtons(
                    caseData
                )
        });

    } catch (error) {

        console.error(
            'خطأ في تحديث رسالة المراجعة:',
            error
        );
    }
}


// =========================
// إرسال القضية إلى روم المراجعة
// =========================
async function sendCaseToReview(
    guild,
    caseData
) {

    try {

        const settings =
            getGuildSettings(
                guild.id
            );


        const reviewChannelId =

            settings?.punishmentReviewChannel ||

            settings?.punishmentLogChannel;


        if (!reviewChannelId) {

            console.log(
                'لم يتم تحديد روم مراجعة العقوبات.'
            );

            return null;
        }


        const reviewChannel =
            guild.channels.cache.get(
                reviewChannelId
            );


        if (!reviewChannel) {

            console.log(
                'روم مراجعة العقوبات غير موجود.'
            );

            return null;
        }


        const message =
            await reviewChannel.send({

                embeds: [

                    createCaseEmbed(
                        caseData
                    )
                ],

                components:

                    createCaseButtons(
                        caseData
                    )
            });


        const updatedCase =
            updateAccountabilityCase(

                caseData.id,

                {

                    reviewMessageId:
                        message.id
                }
            );


        return updatedCase;

    } catch (error) {

        console.error(
            'خطأ في إرسال القضية للمراجعة:',
            error
        );

        return null;
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


    const steamId =
        interaction.fields.getTextInputValue(
            'steam_id'
        );


    const system =
        interaction.fields.getTextInputValue(
            'system'
        );


    const reason =
        interaction.fields.getTextInputValue(
            'reason'
        );


    let duration =
        null;


    let discordId =
        'غير محدد';


    let warnLevel =
        null;


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
    }


    // =========================
    // الحظر الدائم
    // =========================
    if (
        punishmentType ===
        'permanent_ban'
    ) {

        discordId =
            interaction.fields.getTextInputValue(
                'discord_id'
            ) ||
            'غير محدد';
    }


    // =========================
    // التحذيرات
    // =========================
    if (
        punishmentType ===
        'warn'
    ) {

        warnLevel =
            interaction.fields.getTextInputValue(
                'warn_level'
            );


        if (
            !['1', '2', '3'].includes(
                warnLevel
            )
        ) {

            return interaction.reply({

                content:
                    '❌ مستوى التحذير يجب أن يكون 1 أو 2 أو 3.',

                ephemeral:
                    true
            });
        }


        if (
            warnLevel === '1'
        ) {

            duration =
                'أسبوعين';

        } else if (
            warnLevel === '2'
        ) {

            duration =
                '3 أسابيع';

        } else if (
            warnLevel === '3'
        ) {

            duration =
                'شهر';
        }
    }


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


            steamId,


            discordId,


            system,


            reason,


            duration,


            warnLevel
        });


    await sendCaseToReview(

        interaction.guild,

        newCase
    );


    const punishmentName =
        getPunishmentName(
            punishmentType
        );


    let extraInfo =
        '';


    if (
        punishmentType ===
        'warn'
    ) {

        extraInfo =
            `\n⚠️ **مستوى التحذير:** Warn ${warnLevel}`;
    }


    await interaction.reply({

        ephemeral:
            true,


        embeds: [

            new EmbedBuilder()

                .setTitle(
                    '✅ تم تسجيل القضية'
                )

                .setDescription(

                    `⚖️ **نوع العقوبة:** ${punishmentName}\n` +

                    `👤 **اللاعب:** ${playerName}\n` +

                    `🎮 **Steam ID:** ${steamId}\n` +

                    `🖥️ **النظام:** ${system}\n` +

                    `👮 **الإداري:** ${interaction.user}\n` +

                    extraInfo +

                    '\n\n📨 تم إرسال القضية إلى قسم مراجعة الإدارة.'
                )

                .setColor(
                    getPunishmentColor(
                        punishmentType
                    )
                )

                .setTimestamp()
        ]
    });
}


// =========================
// تصدير النظام
// =========================
module.exports = {

    openPermanentBanModal,

    openTemporaryBanModal,

    openWarnModal,

    openEvidenceModal,

    handleEvidenceModal,

    removePunishment,

    handlePunishmentModal,

    loadAccountability,

    saveAccountability,

    addAccountabilityCase,

    getAccountabilityCase,

    updateAccountabilityCase,

    createCaseEmbed,

    createCaseButtons
};