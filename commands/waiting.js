const {
    SlashCommandBuilder,
    ChannelType,
    PermissionFlagsBits
} = require('discord.js');

const waitingSystem = require('../systems/waitingSystem');

module.exports = {

    data: new SlashCommandBuilder()
        .setName('waiting')
        .setDescription('إدارة نظام الانتظار')

        .addSubcommand(subcommand =>
            subcommand
                .setName('panel')
                .setDescription('إرسال لوحة نظام الانتظار')
        )

        .addSubcommand(subcommand =>
            subcommand
                .setName('setup')
                .setDescription('إرسال لوحة الانتظار في روم محدد')

.addChannelOption(option =>
    option
        .setName('channel')
        .setDescription('اختر الروم الذي تريد إرسال لوحة الانتظار فيه')
        .setRequired(true)
)
        ),

    async execute(interaction) {

        // صلاحية الإدارة
        if (!interaction.member.permissions.has(
            PermissionFlagsBits.Administrator
        )) {
            return interaction.reply({
                content: '❌ هذا الأمر للإدارة فقط.',
                ephemeral: true
            });
        }

        const subcommand = interaction.options.getSubcommand();

        // إرسال اللوحة في نفس الروم
        if (subcommand === 'panel') {

            return waitingSystem.sendPanel(interaction);

        }

        // إرسال اللوحة في روم يختاره الإداري
        if (subcommand === 'setup') {

            const channel =
                interaction.options.getChannel('channel');

            if (!channel) {
                return interaction.reply({
                    content: '❌ لم يتم العثور على الروم المحدد.',
                    ephemeral: true
                });
            }

            const {
                EmbedBuilder,
                ActionRowBuilder,
                ButtonBuilder,
                ButtonStyle
            } = require('discord.js');

            const embed = new EmbedBuilder()
                .setTitle('⭐ نظام احتساب النقاط')
                .setDescription(
                    'يتم احتساب النقاط أثناء التواجد في نظام الانتظار.\n\n' +
                    '🟢 سجل الدخول فقط أثناء تواجدك في أحد الرومات الصوتية المخصصة.\n\n' +
                    '⭐ نقطة واحدة لكل ساعة مكتملة.\n\n' +
                    '📞 نقاط إضافية عند خدمة الأعضاء حسب نظام Call Up.\n\n' +
                    '⚠️ في حال تفعيل الميوت أو الصمت لمدة طويلة سيتم إخراجك تلقائياً من الانتظار.\n\n' +
                    'Falah Systems • نظام الانتظار'
                )
                .setColor(0x2B2D31);

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

            await channel.send({
                embeds: [embed],
                components: [row]
            });

            return interaction.reply({
                content: `✅ تم إرسال لوحة الانتظار بنجاح في ${channel}.`,
                ephemeral: true
            });

        }

    }

};