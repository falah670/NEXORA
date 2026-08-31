const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'ticketSystem',
    async handleButton(interaction) {
        if (!interaction.isButton()) return;
        
        if (interaction.customId === 'create_ticket') {
            const guild = interaction.guild;
            const member = interaction.member;

            try {
                await interaction.deferReply({ ephemeral: true });

                const ticketChannel = await guild.channels.create({
                    name: `ticket-${member.user.username}`,
                    type: ChannelType.GuildText,
                    permissionOverwrites: [
                        {
                            id: guild.id,
                            denied: [PermissionFlagsBits.ViewChannel],
                        },
                        {
                            id: member.id,
                            allowed: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
                        },
                    ],
                });

                const embed = new EmbedBuilder()
                    .setTitle('🎫 تذكرة دعم فني جديدة')
                    .setDescription(`مرحباً بك ${member},\nيرجى توضيح مشكلتك أو طلبك بالتفصيل وسيقوم الإداريون بالرد عليك قريباً.`)
                    .setColor(0x00AE86);

                const closeButton = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('close_ticket')
                        .setLabel('إغلاق التذكرة')
                        .setStyle(ButtonStyle.Danger)
                );

                await ticketChannel.send({ content: `${member}`, embeds: [embed], components: [closeButton] });
                await interaction.editReply({ content: `✅ تم إنشاء تذكرتك بنجاح: ${ticketChannel}` });

            } catch (error) {
                console.error('خطأ أثناء إنشاء التذكرة:', error);
                await interaction.editReply({ content: '❌ حدث خطأ أثناء محاولة إنشاء التذكرة، حاول مرة أخرى لاحقاً.' });
            }
        }

        if (interaction.customId === 'close_ticket') {
            const channel = interaction.channel;
            await interaction.reply({ content: '🔒 سيتم إغلاق التذكرة وحذف الغرفة خلال 5 ثوانٍ...' });
            setTimeout(async () => {
                try {
                    await channel.delete();
                } catch (e) {
                    console.error('خطأ عند حذف روم التذكرة:', e);
                }
            }, 5000);
        }
    }
};