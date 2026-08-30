const {
    ChannelType,
    PermissionFlagsBits,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    UserSelectMenuBuilder,
    StringSelectMenuBuilder
} = require('discord.js');

const { getGuildSettings } = require('./config');


// =========================
// إنشاء أزرار التذكرة
// =========================
function createTicketButtons(claimed = false, claimedUser = null) {

    const claimButton = new ButtonBuilder()
        .setCustomId('claim_ticket')
        .setLabel(
            claimed
                ? `تم الاستلام بواسطة ${claimedUser}`
                : 'استلام التذكرة'
        )
        .setEmoji(claimed ? '✅' : '✋')
        .setStyle(
            claimed
                ? ButtonStyle.Success
                : ButtonStyle.Primary
        )
        .setDisabled(claimed);


    const manageButton = new ButtonBuilder()
        .setCustomId('manage_ticket')
        .setLabel('إدارة التذكرة')
        .setEmoji('📋')
        .setStyle(ButtonStyle.Secondary);


    const closeButton = new ButtonBuilder()
        .setCustomId('close_ticket')
        .setLabel('إغلاق التذكرة')
        .setEmoji('🔒')
        .setStyle(ButtonStyle.Danger);


    return new ActionRowBuilder()
        .addComponents(
            claimButton,
            manageButton,
            closeButton
        );
}


// =========================
// التحقق من صلاحية الإدارة
// =========================
function hasTicketManagementPermission(interaction, settings) {

    if (!interaction.guild || !interaction.member) {
        return false;
    }


    const isSupport =
        settings.ticketSupportRole &&
        interaction.member.roles.cache.has(
            settings.ticketSupportRole
        );


    const isAdmin =
        interaction.member.permissions.has(
            PermissionFlagsBits.Administrator
        );


    return isSupport || isAdmin;
}


// =========================
// الحصول على صاحب التذكرة
// =========================
function getTicketOwnerId(channel) {

    if (!channel?.topic) {
        return null;
    }


    if (!channel.topic.startsWith('ticket-owner:')) {
        return null;
    }


    return channel.topic.replace(
        'ticket-owner:',
        ''
    );
}


// =========================
// إنشاء تذكرة
// =========================
async function createTicket(interaction) {

    const settings =
        getGuildSettings(
            interaction.guild.id
        );


    if (!settings.ticketCategory) {

        return interaction.reply({

            ephemeral: true,

            content:
                '❌ لم يتم تحديد فئة التذاكر بعد.'
        });
    }


    if (!settings.ticketSupportRole) {

        return interaction.reply({

            ephemeral: true,

            content:
                '❌ لم يتم تحديد رتبة دعم التذاكر بعد.'
        });
    }


    const existingTicket =
        interaction.guild.channels.cache.find(
            channel =>
                channel.parentId ===
                settings.ticketCategory &&
                channel.topic ===
                `ticket-owner:${interaction.user.id}`
        );


    if (existingTicket) {

        return interaction.reply({

            ephemeral: true,

            content:
                `❌ لديك تذكرة مفتوحة بالفعل: ${existingTicket}`
        });
    }


    const safeUsername =
        interaction.user.username
            .toLowerCase()
            .replace(/[^a-z0-9-]/g, '-')
            .slice(0, 80);


    const ticketChannel =
        await interaction.guild.channels.create({

            name: `ticket-${safeUsername}`,

            type: ChannelType.GuildText,

            parent: settings.ticketCategory,

            topic:
                `ticket-owner:${interaction.user.id}`,

            permissionOverwrites: [

                {
                    id: interaction.guild.id,

                    deny: [
                        PermissionFlagsBits.ViewChannel
                    ]
                },


                {
                    id: interaction.user.id,

                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ReadMessageHistory
                    ]
                },


                {
                    id: settings.ticketSupportRole,

                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ReadMessageHistory,
                        PermissionFlagsBits.ManageMessages
                    ]
                }
            ]
        });


    const ticketEmbed =
        new EmbedBuilder()

            .setTitle('🎫 تذكرة جديدة')

            .setDescription(

                `مرحبًا ${interaction.user}\n\n` +

                `تم إنشاء تذكرتك بنجاح.\n\n` +

                `يرجى كتابة مشكلتك أو طلبك وسيقوم فريق الدعم بمساعدتك.\n\n` +

                `👤 **صاحب التذكرة:** ${interaction.user}\n` +

                `✋ **المسؤول عن التذكرة:** لم يتم الاستلام بعد`
            )

            .setFooter({
                text:
                    'Falah Systems • Ticket System'
            })

            .setTimestamp();


    const row =
        createTicketButtons();


    await ticketChannel.send({

        content:
            `${interaction.user} <@&${settings.ticketSupportRole}>`,

        embeds: [
            ticketEmbed
        ],

        components: [
            row
        ]
    });


    await interaction.reply({

        ephemeral: true,

        content:
            `✅ تم إنشاء تذكرتك بنجاح: ${ticketChannel}`
    });
}


// =========================
// استلام التذكرة
// =========================
async function claimTicket(interaction) {

    const settings =
        getGuildSettings(
            interaction.guild.id
        );


    if (
        !hasTicketManagementPermission(
            interaction,
            settings
        )
    ) {

        return interaction.reply({

            ephemeral: true,

            content:
                '❌ فقط فريق الدعم أو الإداريين يمكنهم استلام التذكرة.'
        });
    }


    const claimButton =
        interaction.message.components[0]
            ?.components
            ?.find(
                component =>
                    component.customId ===
                    'claim_ticket'
            );


    if (claimButton?.disabled) {

        return interaction.reply({

            ephemeral: true,

            content:
                '❌ تم استلام هذه التذكرة بالفعل.'
        });
    }


    const oldEmbed =
        interaction.message.embeds[0];


    const oldDescription =
        oldEmbed.description || '';


    const newDescription =
        oldDescription.replace(

            '✋ **المسؤول عن التذكرة:** لم يتم الاستلام بعد',

            `✋ **المسؤول عن التذكرة:** ${interaction.user}`
        );


    const updatedEmbed =
        EmbedBuilder
            .from(oldEmbed)
            .setDescription(
                newDescription
            );


    const updatedRow =
        createTicketButtons(
            true,
            interaction.user.username
        );


    await interaction.update({

        embeds: [
            updatedEmbed
        ],

        components: [
            updatedRow
        ]
    });


    await interaction.channel.send({

        content:
            `✋ **تم استلام التذكرة بواسطة:** ${interaction.user}`
    });
}


// =========================
// فتح قائمة إدارة التذكرة
// =========================
async function openTicketManageMenu(interaction) {

    const settings =
        getGuildSettings(
            interaction.guild.id
        );


    if (
        !hasTicketManagementPermission(
            interaction,
            settings
        )
    ) {

        return interaction.reply({

            ephemeral: true,

            content:
                '❌ فقط فريق الدعم أو الإداريين يمكنهم إدارة التذكرة.'
        });
    }


    const manageMenu =
        new StringSelectMenuBuilder()

            .setCustomId(
                'ticket_manage_select'
            )

            .setPlaceholder(
                'اختر الإجراء الذي تريد تنفيذه'
            )

            .addOptions(

                {
                    label:
                        'إضافة شخص للتذكرة',

                    description:
                        'إضافة عضو جديد إلى التذكرة',

                    value:
                        'add_user',

                    emoji:
                        '👥'
                },

                {
                    label:
                        'إرسال رسالة لصاحب التذكرة',

                    description:
                        'إرسال رسالة خاصة لصاحب التذكرة',

                    value:
                        'dm_owner',

                    emoji:
                        '📩'
                },

                {
                    label:
                        'طلب معلومات من صاحب التذكرة',

                    description:
                        'طلب معلومات إضافية من صاحب التذكرة',

                    value:
                        'request_info',

                    emoji:
                        '📄'
                }
            );


    const row =
        new ActionRowBuilder()
            .addComponents(
                manageMenu
            );


    await interaction.reply({

        ephemeral: true,

        content:
            '📋 **إدارة التذكرة**\n\nاختر الإجراء الذي تريد تنفيذه:',

        components: [
            row
        ]
    });
}


// =========================
// التعامل مع قائمة الإدارة
// =========================
async function handleTicketManageSelect(interaction) {

    const selectedAction =
        interaction.values[0];


    if (selectedAction === 'add_user') {

        return openAddUserMenu(
            interaction
        );
    }


    if (selectedAction === 'dm_owner') {

        return openSendOwnerMessageModal(
            interaction
        );
    }


    if (selectedAction === 'request_info') {

        return openRequestInfoModal(
            interaction
        );
    }
}


// =========================
// نافذة إرسال رسالة لصاحب التذكرة
// =========================
async function openSendOwnerMessageModal(interaction) {

    const modal =
        new ModalBuilder()

            .setCustomId(
                'send_owner_message_modal'
            )

            .setTitle(
                '📩 إرسال رسالة لصاحب التذكرة'
            );


    const titleInput =
        new TextInputBuilder()

            .setCustomId(
                'owner_message_title'
            )

            .setLabel(
                'عنوان الرسالة'
            )

            .setStyle(
                TextInputStyle.Short
            )

            .setPlaceholder(
                'مثال: تحديث بخصوص تذكرتك'
            )

            .setRequired(true)

            .setMinLength(2)

            .setMaxLength(100);


    const messageInput =
        new TextInputBuilder()

            .setCustomId(
                'owner_message_content'
            )

            .setLabel(
                'محتوى الرسالة'
            )

            .setStyle(
                TextInputStyle.Paragraph
            )

            .setPlaceholder(
                'اكتب الرسالة التي تريد إرسالها لصاحب التذكرة...'
            )

            .setRequired(true)

            .setMinLength(2)

            .setMaxLength(1000);


    const row1 =
        new ActionRowBuilder()
            .addComponents(
                titleInput
            );


    const row2 =
        new ActionRowBuilder()
            .addComponents(
                messageInput
            );


    modal.addComponents(
        row1,
        row2
    );


    await interaction.showModal(
        modal
    );
}


// =========================
// تنفيذ إرسال الرسالة الخاصة
// =========================
async function handleSendOwnerMessageModal(interaction) {

    await interaction.deferReply({
        ephemeral: true
    });


    const title =
        interaction.fields.getTextInputValue(
            'owner_message_title'
        );


    const message =
        interaction.fields.getTextInputValue(
            'owner_message_content'
        );


    const ownerId =
        getTicketOwnerId(
            interaction.channel
        );


    if (!ownerId) {

        return interaction.editReply({

            content:
                '❌ لم يتم العثور على صاحب التذكرة.'
        });
    }


    const owner =
        await interaction.client.users.fetch(
            ownerId
        ).catch(
            () => null
        );


    if (!owner) {

        return interaction.editReply({

            content:
                '❌ تعذر العثور على صاحب التذكرة.'
        });
    }


    const messageEmbed =
        new EmbedBuilder()

            .setTitle(
                `📩 ${title}`
            )

            .setDescription(
                message
            )

            .addFields(
                {
                    name:
                        '🎫 التذكرة',

                    value:
                        interaction.channel.name,

                    inline:
                        true
                },

                {
                    name:
                        '👮 المرسل',

                    value:
                        `${interaction.user}`,

                    inline:
                        true
                }
            )

            .setFooter({
                text:
                    'Falah Systems • Ticket System'
            })

            .setTimestamp();


    try {

        await owner.send({

            embeds: [
                messageEmbed
            ]
        });


        await interaction.editReply({

            content:
                `✅ تم إرسال الرسالة إلى ${owner} بنجاح.`
        });


        await interaction.channel.send({

            content:
                `📩 **تم إرسال رسالة خاصة لصاحب التذكرة بواسطة:** ${interaction.user}`
        });

    } catch (error) {

        console.error(
            'خطأ في إرسال رسالة خاصة:',
            error
        );


        await interaction.editReply({

            content:
                '❌ تعذر إرسال الرسالة لصاحب التذكرة. ربما الرسائل الخاصة لديه مغلقة.'
        });
    }
}


// =========================
// فتح نافذة طلب المعلومات
// =========================
async function openRequestInfoModal(interaction) {

    const modal =
        new ModalBuilder()

            .setCustomId(
                'request_ticket_info_modal'
            )

            .setTitle(
                '📄 طلب معلومات من صاحب التذكرة'
            );


    const titleInput =
        new TextInputBuilder()

            .setCustomId(
                'info_request_title'
            )

            .setLabel(
                'عنوان طلب المعلومات'
            )

            .setStyle(
                TextInputStyle.Short
            )

            .setPlaceholder(
                'مثال: نحتاج معلومات إضافية'
            )

            .setRequired(true)

            .setMinLength(2)

            .setMaxLength(100);


    const requestInput =
        new TextInputBuilder()

            .setCustomId(
                'info_request_content'
            )

            .setLabel(
                'المعلومات المطلوبة'
            )

            .setStyle(
                TextInputStyle.Paragraph
            )

            .setPlaceholder(
                'اكتب المعلومات التي تريد طلبها من صاحب التذكرة...'
            )

            .setRequired(true)

            .setMinLength(3)

            .setMaxLength(1000);


    const row1 =
        new ActionRowBuilder()
            .addComponents(
                titleInput
            );


    const row2 =
        new ActionRowBuilder()
            .addComponents(
                requestInput
            );


    modal.addComponents(
        row1,
        row2
    );


    await interaction.showModal(
        modal
    );
}


// =========================
// إرسال طلب المعلومات لصاحب التذكرة
// =========================
async function handleRequestInfoModal(interaction) {

    await interaction.deferReply({
        ephemeral: true
    });


    const title =
        interaction.fields.getTextInputValue(
            'info_request_title'
        );


    const request =
        interaction.fields.getTextInputValue(
            'info_request_content'
        );


    const ownerId =
        getTicketOwnerId(
            interaction.channel
        );


    if (!ownerId) {

        return interaction.editReply({

            content:
                '❌ لم يتم العثور على صاحب التذكرة.'
        });
    }


    const owner =
        await interaction.client.users.fetch(
            ownerId
        ).catch(
            () => null
        );


    if (!owner) {

        return interaction.editReply({

            content:
                '❌ تعذر العثور على صاحب التذكرة.'
        });
    }


    const requestEmbed =
        new EmbedBuilder()

            .setTitle(
                `📄 ${title}`
            )

            .setDescription(

                `قام فريق الدعم بطلب المعلومات التالية منك:\n\n` +

                `${request}\n\n` +

                `اضغط الزر بالأسفل لإرسال ردك.`
            )

            .addFields(
                {
                    name:
                        '🎫 التذكرة',

                    value:
                        interaction.channel.name,

                    inline:
                        true
                },

                {
                    name:
                        '👮 طلب المعلومات بواسطة',

                    value:
                        `${interaction.user}`,

                    inline:
                        true
                }
            )

            .setFooter({
                text:
                    'Falah Systems • Ticket Information Request'
            })

            .setTimestamp();


    const replyButton =
        new ButtonBuilder()

            .setCustomId(
                `ticket_info_reply:${interaction.channel.id}`
            )

            .setLabel(
                'الرد على الطلب'
            )

            .setEmoji('📝')

            .setStyle(
                ButtonStyle.Primary
            );


    const row =
        new ActionRowBuilder()
            .addComponents(
                replyButton
            );


    try {

        await owner.send({

            embeds: [
                requestEmbed
            ],

            components: [
                row
            ]
        });


        await interaction.editReply({

            content:
                `✅ تم إرسال طلب المعلومات إلى ${owner} بنجاح.`
        });


        await interaction.channel.send({

            content:

                `📄 **تم إرسال طلب معلومات لصاحب التذكرة**\n\n` +

                `👮 **بواسطة:** ${interaction.user}\n` +

                `📝 **الطلب:** ${request}`
        });

    } catch (error) {

        console.error(
            'خطأ في إرسال طلب المعلومات:',
            error
        );


        await interaction.editReply({

            content:
                '❌ تعذر إرسال طلب المعلومات لصاحب التذكرة. ربما الرسائل الخاصة لديه مغلقة.'
        });
    }
}


// =========================
// فتح نافذة رد صاحب التذكرة
// =========================
async function openTicketInfoReplyModal(
    interaction,
    ticketChannelId
) {

    const ticketChannel =
        await interaction.client.channels.fetch(
            ticketChannelId
        ).catch(
            () => null
        );


    if (!ticketChannel) {

        return interaction.reply({

            ephemeral: true,

            content:
                '❌ لم يتم العثور على التذكرة المرتبطة بهذا الطلب.'
        });
    }


    const ownerId =
        getTicketOwnerId(
            ticketChannel
        );


    if (
        !ownerId ||
        ownerId !== interaction.user.id
    ) {

        return interaction.reply({

            ephemeral: true,

            content:
                '❌ هذا الطلب ليس مرتبطًا بحسابك.'
        });
    }


    const modal =
        new ModalBuilder()

            .setCustomId(
                `ticket_info_reply_modal:${ticketChannelId}`
            )

            .setTitle(
                '📝 الرد على طلب المعلومات'
            );


    const replyInput =
        new TextInputBuilder()

            .setCustomId(
                'ticket_info_reply_content'
            )

            .setLabel(
                'اكتب المعلومات المطلوبة'
            )

            .setStyle(
                TextInputStyle.Paragraph
            )

            .setPlaceholder(
                'اكتب ردك بالتفصيل...'
            )

            .setRequired(true)

            .setMinLength(2)

            .setMaxLength(2000);


    const row =
        new ActionRowBuilder()
            .addComponents(
                replyInput
            );


    modal.addComponents(
        row
    );


    await interaction.showModal(
        modal
    );
}


// =========================
// استقبال رد صاحب التذكرة
// =========================
async function handleTicketInfoReplyModal(
    interaction,
    ticketChannelId
) {

    await interaction.deferReply({
        ephemeral: true
    });


    const ticketChannel =
        await interaction.client.channels.fetch(
            ticketChannelId
        ).catch(
            () => null
        );


    if (!ticketChannel) {

        return interaction.editReply({

            content:
                '❌ لم يتم العثور على التذكرة المرتبطة بهذا الطلب.'
        });
    }


    const ownerId =
        getTicketOwnerId(
            ticketChannel
        );


    if (
        !ownerId ||
        ownerId !== interaction.user.id
    ) {

        return interaction.editReply({

            content:
                '❌ ليس لديك صلاحية لإرسال هذا الرد.'
        });
    }


    const reply =
        interaction.fields.getTextInputValue(
            'ticket_info_reply_content'
        );


    const replyEmbed =
        new EmbedBuilder()

            .setTitle(
                '📄 تم استلام معلومات من صاحب التذكرة'
            )

            .setDescription(
                reply
            )

            .addFields(
                {
                    name:
                        '👤 صاحب الرد',

                    value:
                        `${interaction.user}`,

                    inline:
                        true
                },

                {
                    name:
                        '🎫 التذكرة',

                    value:
                        ticketChannel.name,

                    inline:
                        true
                }
            )

            .setFooter({
                text:
                    'Falah Systems • Ticket Information'
            })

            .setTimestamp();


    try {

        await ticketChannel.send({

            content:
                `📩 ${interaction.user}`,

            embeds: [
                replyEmbed
            ]
        });


        await interaction.editReply({

            content:
                '✅ تم إرسال معلوماتك إلى فريق الدعم بنجاح.'
        });

    } catch (error) {

        console.error(
            'خطأ في إرسال رد المعلومات:',
            error
        );


        await interaction.editReply({

            content:
                '❌ حدث خطأ أثناء إرسال المعلومات.'
        });
    }
}


// =========================
// فتح قائمة إضافة شخص
// =========================
async function openAddUserMenu(interaction) {

    const settings =
        getGuildSettings(
            interaction.guild.id
        );


    if (
        !hasTicketManagementPermission(
            interaction,
            settings
        )
    ) {

        return interaction.reply({

            ephemeral: true,

            content:
                '❌ فقط فريق الدعم أو الإداريين يمكنهم إضافة أشخاص للتذكرة.'
        });
    }


    const userSelect =
        new UserSelectMenuBuilder()

            .setCustomId(
                'ticket_add_user_select'
            )

            .setPlaceholder(
                'اختر الشخص الذي تريد إضافته للتذكرة'
            )

            .setMinValues(1)

            .setMaxValues(1);


    const row =
        new ActionRowBuilder()
            .addComponents(
                userSelect
            );


    await interaction.update({

        content:

            '👥 **إضافة شخص للتذكرة**\n\n' +

            'اختر العضو الذي تريد إضافته إلى هذه التذكرة:',

        components: [
            row
        ]
    });
}


// =========================
// إضافة شخص للتذكرة
// =========================
async function addUserToTicket(interaction) {

    const settings =
        getGuildSettings(
            interaction.guild.id
        );


    if (
        !hasTicketManagementPermission(
            interaction,
            settings
        )
    ) {

        return interaction.reply({

            ephemeral: true,

            content:
                '❌ ليس لديك صلاحية لإضافة أشخاص للتذكرة.'
        });
    }


    const userId =
        interaction.values[0];


    const member =
        await interaction.guild.members.fetch(
            userId
        ).catch(
            () => null
        );


    if (!member) {

        return interaction.reply({

            ephemeral: true,

            content:
                '❌ لم يتم العثور على هذا العضو.'
        });
    }


    const ownerId =
        getTicketOwnerId(
            interaction.channel
        );


    if (userId === ownerId) {

        return interaction.reply({

            ephemeral: true,

            content:
                '❌ هذا الشخص هو صاحب التذكرة بالفعل.'
        });
    }


    const existingPermission =
        interaction.channel.permissionOverwrites.cache.get(
            userId
        );


    if (
        existingPermission &&
        existingPermission.allow.has(
            PermissionFlagsBits.ViewChannel
        )
    ) {

        return interaction.reply({

            ephemeral: true,

            content:
                `❌ ${member} موجود بالفعل داخل التذكرة.`
        });
    }


    await interaction.channel.permissionOverwrites.edit(

        userId,

        {
            ViewChannel: true,

            SendMessages: true,

            ReadMessageHistory: true
        }
    );


    await interaction.channel.send({

        content:

            `👥 **تمت إضافة شخص إلى التذكرة**\n\n` +

            `➕ **العضو المضاف:** ${member}\n` +

            `👮 **تمت الإضافة بواسطة:** ${interaction.user}`
    });


    await interaction.update({

        content:
            `✅ تم إضافة ${member} إلى التذكرة بنجاح.`,

        components: []
    });
}


// =========================
// فتح نافذة إغلاق التذكرة
// =========================
async function closeTicket(interaction) {

    const settings =
        getGuildSettings(
            interaction.guild.id
        );


    const ownerId =
        getTicketOwnerId(
            interaction.channel
        );


    const isOwner =
        ownerId === interaction.user.id;


    const hasManagementPermission =
        hasTicketManagementPermission(
            interaction,
            settings
        );


    if (
        !isOwner &&
        !hasManagementPermission
    ) {

        return interaction.reply({

            ephemeral: true,

            content:
                '❌ ليس لديك صلاحية لإغلاق هذه التذكرة.'
        });
    }


    const modal =
        new ModalBuilder()

            .setCustomId(
                'close_ticket_modal'
            )

            .setTitle(
                '🔒 إغلاق التذكرة'
            );


    const reasonInput =
        new TextInputBuilder()

            .setCustomId(
                'close_reason'
            )

            .setLabel(
                'سبب إغلاق التذكرة'
            )

            .setStyle(
                TextInputStyle.Paragraph
            )

            .setPlaceholder(
                'اكتب سبب إغلاق التذكرة هنا...'
            )

            .setRequired(true)

            .setMinLength(3)

            .setMaxLength(500);


    const row =
        new ActionRowBuilder()
            .addComponents(
                reasonInput
            );


    modal.addComponents(
        row
    );


    await interaction.showModal(
        modal
    );
}


// =========================
// تنفيذ إغلاق التذكرة
// =========================
async function handleCloseTicketModal(interaction) {

    const settings =
        getGuildSettings(
            interaction.guild.id
        );


    const reason =
        interaction.fields.getTextInputValue(
            'close_reason'
        );


    const ownerId =
        getTicketOwnerId(
            interaction.channel
        );


    const ticketOwner =
        ownerId
            ? `<@${ownerId}>`
            : 'غير معروف';


    const ticketName =
        interaction.channel.name;


    if (settings.ticketLogChannel) {

        try {

            const logChannel =
                interaction.guild.channels.cache.get(
                    settings.ticketLogChannel
                );


            if (logChannel) {

                const logEmbed =
                    new EmbedBuilder()

                        .setTitle(
                            '🔒 تم إغلاق تذكرة'
                        )

                        .setDescription(

                            `🎫 **اسم التذكرة:** ${ticketName}\n\n` +

                            `👤 **صاحب التذكرة:** ${ticketOwner}\n\n` +

                            `👮 **تم الإغلاق بواسطة:** ${interaction.user}\n\n` +

                            `📝 **سبب الإغلاق:**\n${reason}`
                        )

                        .setFooter({
                            text:
                                'Falah Systems • Ticket Logs'
                        })

                        .setTimestamp();


                await logChannel.send({

                    embeds: [
                        logEmbed
                    ]
                });
            }

        } catch (error) {

            console.error(
                'خطأ في إرسال لوق التذكرة:',
                error
            );
        }
    }


    await interaction.reply({

        content:

            `🔒 **سيتم إغلاق التذكرة خلال 5 ثوانٍ...**\n\n` +

            `📝 **سبب الإغلاق:** ${reason}\n` +

            `👤 **بواسطة:** ${interaction.user}`
    });


    setTimeout(async () => {

        try {

            await interaction.channel.delete();

        } catch (error) {

            console.error(
                'خطأ في حذف التذكرة:',
                error
            );
        }

    }, 5000);
}


// =========================
// تصدير الوظائف
// =========================
module.exports = {

    createTicket,

    claimTicket,

    openTicketManageMenu,

    handleTicketManageSelect,

    openAddUserMenu,

    addUserToTicket,

    closeTicket,

    handleCloseTicketModal,

    handleSendOwnerMessageModal,

    handleRequestInfoModal,

    openTicketInfoReplyModal,

    handleTicketInfoReplyModal
};