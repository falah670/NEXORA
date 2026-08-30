const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    PermissionFlagsBits
} = require('discord.js');

const {
    getGuildSettings
} = require('./config');


// =========================
// إنشاء لوحة Call Up
// =========================

async function createCallUpPanel(interaction) {

    const embed =
        new EmbedBuilder()

            .setTitle(
                '📢 نظام الاستدعاء'
            )

            .setDescription(
                [
                    'من خلال هذه اللوحة يمكن للإدارة استدعاء عضو.',
                    '',
                    'اضغط على الزر بالأسفل ثم قم بإدخال **Discord ID** الخاص بالعضو.',
                    '',
                    'سيتم إرسال رسالة خاصة للعضو وتسجيل عملية الاستدعاء.'
                ].join('\n')
            )

            .setFooter({
                text:
                    'Falah Systems • Call Up'
            })

            .setTimestamp();


    const row =
        new ActionRowBuilder()

            .addComponents(

                new ButtonBuilder()

                    .setCustomId(
                        'callup_open_modal'
                    )

                    .setLabel(
                        'استدعاء عضو'
                    )

                    .setEmoji(
                        '📢'
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
            row
        ]
    });
}


// =========================
// فتح نافذة إدخال الآيدي
// =========================

async function openCallUpModal(interaction) {

    // التأكد أن المستخدم إداري
    if (
        !interaction.memberPermissions.has(
            PermissionFlagsBits.Administrator
        )
    ) {

        await interaction.reply({

            ephemeral: true,

            content:
                '❌ ليس لديك صلاحية استخدام نظام الاستدعاء.'
        });

        return;
    }


    const modal =
        new ModalBuilder()

            .setCustomId(
                'callup_modal'
            )

            .setTitle(
                '📢 استدعاء عضو'
            );


    const userIdInput =
        new TextInputBuilder()

            .setCustomId(
                'callup_user_id'
            )

            .setLabel(
                'Discord ID الخاص بالعضو'
            )

            .setPlaceholder(
                'ضع آيدي العضو هنا'
            )

            .setStyle(
                TextInputStyle.Short
            )

            .setRequired(true);


    const row =
        new ActionRowBuilder()

            .addComponents(
                userIdInput
            );


    modal.addComponents(
        row
    );


    await interaction.showModal(
        modal
    );
}


// =========================
// تنفيذ الاستدعاء
// =========================

async function submitCallUp(interaction) {

    try {

        // التأكد من صلاحية الإداري
        if (
            !interaction.memberPermissions.has(
                PermissionFlagsBits.Administrator
            )
        ) {

            await interaction.reply({

                ephemeral: true,

                content:
                    '❌ ليس لديك صلاحية استخدام نظام الاستدعاء.'
            });

            return;
        }


        await interaction.deferReply({

            ephemeral: true
        });


        const userId =
            interaction.fields
                .getTextInputValue(
                    'callup_user_id'
                )
                .trim();


        // =========================
        // التحقق من الآيدي
        // =========================

        if (
            !/^\d{17,20}$/.test(
                userId
            )
        ) {

            await interaction.editReply({

                content:
                    '❌ الآيدي المدخل غير صحيح.'
            });

            return;
        }


        // =========================
        // البحث عن العضو
        // =========================

        let member;

        try {

            member =
                await interaction.guild.members.fetch(
                    userId
                );

        } catch {

            await interaction.editReply({

                content:
                    '❌ لم يتم العثور على هذا العضو داخل السيرفر.'
            });

            return;
        }


        // =========================
        // رسالة الخاص للعضو
        // =========================

        const dmEmbed =
            new EmbedBuilder()

                .setTitle(
                    '📢 تم استدعاؤك من قبل الإدارة'
                )

                .setDescription(
                    [
                        'تم استدعاؤك من قبل إدارة السيرفر.',
                        '',
                        'الرجاء التوجه إلى روم الدعم مع وجود تصوير آخر **20 دقيقة** من وقت استلام هذا الاستدعاء.',
                        '',
                        'يرجى عدم التأخير، وفي حال عدم الحضور خلال المدة المحددة قد يتم اتخاذ الإجراءات الإدارية المناسبة بحقك.'
                    ].join('\n')
                )

                .setFooter({

                    text:
                        `Falah Systems • ${interaction.guild.name}`

                })

                .setTimestamp();


        // =========================
        // إرسال الرسالة الخاصة
        // =========================

        try {

            await member.send({

                embeds: [
                    dmEmbed
                ]
            });

        } catch (error) {

            console.error(
                'تعذر إرسال الخاص للعضو:',
                error
            );


            await interaction.editReply({

                content:
                    `❌ لم أتمكن من إرسال رسالة خاصة إلى ${member} لأن الرسائل الخاصة لديه مغلقة.`
            });

            return;
        }


        // =========================
        // جلب إعدادات السيرفر
        // =========================

        const settings =
            await Promise.resolve(

                getGuildSettings(
                    interaction.guild.id
                )
            );


        // =========================
        // إنشاء سجل الاستدعاء
        // =========================

        const logEmbed =
            new EmbedBuilder()

                .setTitle(
                    '📢 تم استدعاء عضو'
                )

                .addFields(

                    {

                        name:
                            '👤 العضو',

                        value:
                            `${member}\n\`${member.id}\``,

                        inline:
                            true
                    },

                    {

                        name:
                            '🛡️ بواسطة',

                        value:
                            `${interaction.user}`,

                        inline:
                            true
                    },

                    {

                        name:
                            '⏰ الوقت المتاح',

                        value:
                            '20 دقيقة',

                        inline:
                            true
                    },

                    {

                        name:
                            '📨 الحالة',

                        value:
                            'تم إرسال الاستدعاء بنجاح',

                        inline:
                            false
                    }
                )

                .setFooter({

                    text:
                        'Falah Systems • Call Up'

                })

                .setTimestamp();


        // =========================
        // إرسال السجل لروم Call Up
        // =========================

        if (
            settings &&
            settings.callUpChannel
        ) {

            const logChannel =
                interaction.guild.channels.cache.get(
                    settings.callUpChannel
                );


            if (
                logChannel &&
                logChannel.isTextBased()
            ) {

                await logChannel.send({

                    embeds: [
                        logEmbed
                    ]
                });
            }
        }


        // =========================
        // رسالة نجاح للإداري
        // =========================

        await interaction.editReply({

            content:
                `✅ تم استدعاء ${member} بنجاح وإرسال الرسالة الخاصة له.`
        });


        console.log(

            `📢 تم استدعاء ${member.user.tag} بواسطة ${interaction.user.tag}`
        );


    } catch (error) {

        console.error(
            'خطأ أثناء تنفيذ Call Up:',
            error
        );


        if (
            interaction.deferred ||
            interaction.replied
        ) {

            await interaction.editReply({

                content:
                    '❌ حدث خطأ أثناء تنفيذ الاستدعاء. تحقق من الـ Terminal.'
            });

        } else {

            await interaction.reply({

                ephemeral: true,

                content:
                    '❌ حدث خطأ أثناء تنفيذ الاستدعاء.'
            });
        }
    }
}


// =========================
// معالجة تفاعلات Call Up
// =========================

async function handleCallUpInteraction(
    interaction
) {

    // =========================
    // زر استدعاء عضو
    // =========================

    if (
        interaction.isButton() &&
        interaction.customId ===
        'callup_open_modal'
    ) {

        await openCallUpModal(
            interaction
        );

        return true;
    }


    // =========================
    // إرسال نموذج الاستدعاء
    // =========================

    if (
        interaction.isModalSubmit() &&
        interaction.customId ===
        'callup_modal'
    ) {

        await submitCallUp(
            interaction
        );

        return true;
    }


    return false;
}


// =========================
// تصدير النظام
// =========================

module.exports = {

    createCallUpPanel,

    handleCallUpInteraction,

    openCallUpModal,

    submitCallUp
};