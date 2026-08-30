const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    PermissionFlagsBits
} = require('discord.js');

module.exports = {

    data:
        new SlashCommandBuilder()

            .setName('punishment-panel')

            .setDescription(
                'إرسال لوحة نظام العقوبات'
            )

            .setDefaultMemberPermissions(
                PermissionFlagsBits.Administrator
            ),


    async execute(interaction) {


        // =========================
        // تصميم اللوحة
        // =========================
        const embed =
            new EmbedBuilder()

                .setTitle(
                    '🛡️ النظام الإداري'
                )

                .setDescription(
                    'اختر الإجراء الإداري المناسب من الأزرار بالأسفل.'
                )

                .addFields(

                    {
                        name:
                            '🔨 الحظر',

                        value:
                            'حظر دائم أو حظر مؤقت للعضو.',

                        inline:
                            false
                    },

                    {
                        name:
                            '⚠️ التحذيرات',

                        value:
                            'اختر مستوى التحذير المناسب مباشرة: Warn 1 أو Warn 2 أو Warn 3.',

                        inline:
                            false
                    },

                    {
                        name:
                            '🔓 فك العقوبة',

                        value:
                            'إزالة عقوبة أو رتبة عقوبة من عضو.',

                        inline:
                            false
                    }
                )

                .setFooter({

                    text:
                        'Falah Systems • Administration'

                })

                .setTimestamp();


        // =========================
        // زر الحظر الدائم
        // =========================
        const permanentBanButton =
            new ButtonBuilder()

                .setCustomId(
                    'punishment_permanent_ban'
                )

                .setLabel(
                    'Banned Perm'
                )

                .setEmoji(
                    '🔨'
                )

                .setStyle(
                    ButtonStyle.Danger
                );


        // =========================
        // زر الحظر المؤقت
        // =========================
        const temporaryBanButton =
            new ButtonBuilder()

                .setCustomId(
                    'punishment_temporary_ban'
                )

                .setLabel(
                    'Banned Temporary'
                )

                .setEmoji(
                    '⏱️'
                )

                .setStyle(
                    ButtonStyle.Danger
                );


        // =========================
        // زر فك العقوبة
        // =========================
        const removePunishmentButton =
            new ButtonBuilder()

                .setCustomId(
                    'remove_punishment_menu'
                )

                .setLabel(
                    'Unpunish'
                )

                .setEmoji(
                    '🔓'
                )

                .setStyle(
                    ButtonStyle.Success
                );


        // =========================
        // زر Warn 1
        // =========================
        const warn1Button =
            new ButtonBuilder()

                .setCustomId(
                    'punishment_warn_1'
                )

                .setLabel(
                    'Warn 1'
                )

                .setEmoji(
                    '⚠️'
                )

                .setStyle(
                    ButtonStyle.Primary
                );


        // =========================
        // زر Warn 2
        // =========================
        const warn2Button =
            new ButtonBuilder()

                .setCustomId(
                    'punishment_warn_2'
                )

                .setLabel(
                    'Warn 2'
                )

                .setEmoji(
                    '⚠️'
                )

                .setStyle(
                    ButtonStyle.Primary
                );


        // =========================
        // زر Warn 3
        // =========================
        const warn3Button =
            new ButtonBuilder()

                .setCustomId(
                    'punishment_warn_3'
                )

                .setLabel(
                    'Warn 3'
                )

                .setEmoji(
                    '🚨'
                )

                .setStyle(
                    ButtonStyle.Danger
                );


        // =========================
        // الصف الأول
        // الحظر + فك العقوبة
        // =========================
        const row1 =
            new ActionRowBuilder()

                .addComponents(

                    permanentBanButton,

                    temporaryBanButton,

                    removePunishmentButton

                );


        // =========================
        // الصف الثاني
        // مستويات التحذيرات
        // =========================
        const row2 =
            new ActionRowBuilder()

                .addComponents(

                    warn1Button,

                    warn2Button,

                    warn3Button

                );


        // =========================
        // إرسال اللوحة
        // =========================
        await interaction.reply({

            embeds: [
                embed
            ],

            components: [

                row1,

                row2

            ]

        });

    }

};