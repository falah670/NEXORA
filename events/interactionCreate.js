const { Events } = require('discord.js');


// =========================
// نظام التذاكر
// =========================
const {
    createTicket,
    claimTicket,
    openTicketManageMenu,
    handleTicketManageSelect,
    addUserToTicket,
    closeTicket,
    handleCloseTicketModal,
    handleSendOwnerMessageModal,
    handleRequestInfoModal,
    openTicketInfoReplyModal,
    handleTicketInfoReplyModal
} = require('../systems/ticketSystem');


// =========================
// نظام المحاسبة
// =========================
const {
    openPermanentBanModal,
    openTemporaryBanModal,
    openWarnModal,
    openEvidenceModal,
    handleEvidenceModal,
    removePunishment,
    handlePunishmentModal
} = require('../systems/accountability');


// =========================
// نظام الانتظار
// =========================
const {
    joinWaiting,
    leaveWaiting,
    showWaitingPoints
} = require('../systems/waitingSystem');



module.exports = {

    name: Events.InteractionCreate,


    async execute(interaction) {

        console.log(
            `Interaction received: ${interaction.type} | ${interaction.customId || interaction.commandName}`
        );


        // =========================
        // BUTTONS
        // =========================
        if (interaction.isButton()) {

            try {

                // =========================
                // إنشاء تذكرة
                // =========================
                if (
                    interaction.customId ===
                    'create_ticket'
                ) {

                    await createTicket(
                        interaction
                    );

                    return;
                }


                // =========================
                // استلام التذكرة
                // =========================
                if (
                    interaction.customId ===
                    'claim_ticket'
                ) {

                    await claimTicket(
                        interaction
                    );

                    return;
                }


                // =========================
                // إدارة التذكرة
                // =========================
                if (
                    interaction.customId ===
                    'manage_ticket'
                ) {

                    await openTicketManageMenu(
                        interaction
                    );

                    return;
                }


                // =========================
                // إغلاق التذكرة
                // =========================
                if (
                    interaction.customId ===
                    'close_ticket'
                ) {

                    await closeTicket(
                        interaction
                    );

                    return;
                }


                // =========================
                // الرد على طلب المعلومات
                // =========================
                if (
                    interaction.customId.startsWith(
                        'ticket_info_reply:'
                    )
                ) {

                    const ticketChannelId =
                        interaction.customId.split(
                            ':'
                        )[1];


                    await openTicketInfoReplyModal(
                        interaction,
                        ticketChannelId
                    );

                    return;
                }


                // =========================
                // 🔨 حظر دائم
                // =========================
                if (
                    interaction.customId ===
                    'punishment_permanent_ban'
                ) {

                    await openPermanentBanModal(
                        interaction
                    );

                    return;
                }


                // =========================
                // ⏱️ حظر مؤقت
                // =========================
                if (
                    interaction.customId ===
                    'punishment_temporary_ban'
                ) {

                    await openTemporaryBanModal(
                        interaction
                    );

                    return;
                }


                // =========================
                // ⚠️ Warn 1
                // =========================
                if (
                    interaction.customId ===
                    'punishment_warn_1'
                ) {

                    await openWarnModal(
                        interaction,
                        'warn_1'
                    );

                    return;
                }


                // =========================
                // ⚠️ Warn 2
                // =========================
                if (
                    interaction.customId ===
                    'punishment_warn_2'
                ) {

                    await openWarnModal(
                        interaction,
                        'warn_2'
                    );

                    return;
                }


                // =========================
                // 🚨 Warn 3
                // =========================
                if (
                    interaction.customId ===
                    'punishment_warn_3'
                ) {

                    await openWarnModal(
                        interaction,
                        'warn_3'
                    );

                    return;
                }


                // =========================
                // 🔓 فتح قائمة فك العقوبة
                // =========================
                if (
                    interaction.customId ===
                    'remove_punishment_menu'
                ) {

                    await removePunishment(
                        interaction
                    );

                    return;
                }


                // =========================
                // 🔓 فك عقوبة قضية محددة
                // =========================
                if (
                    interaction.customId.startsWith(
                        'remove_punishment:'
                    )
                ) {

                    const caseId =
                        interaction.customId.split(
                            ':'
                        )[1];


                    await removePunishment(
                        interaction,
                        caseId
                    );

                    return;
                }


                // =========================
                // 🔗 إضافة دليل للقضية
                // =========================
                if (
                    interaction.customId.startsWith(
                        'add_evidence:'
                    )
                ) {

                    const caseId =
                        interaction.customId.split(
                            ':'
                        )[1];


                    await openEvidenceModal(
                        interaction,
                        caseId
                    );

                    return;
                }


                // =========================
                // 🟢 دخول الانتظار
                // =========================
                if (
                    interaction.customId ===
                    'waiting_join'
                ) {

                    await joinWaiting(
                        interaction
                    );

                    return;
                }


                // =========================
                // 🔴 الخروج من الانتظار
                // =========================
                if (
                    interaction.customId ===
                    'waiting_leave'
                ) {

                    await leaveWaiting(
                        interaction
                    );

                    return;
                }


                // =========================
                // ⭐ عرض نقاط الانتظار
                // =========================
                if (
                    interaction.customId ===
                    'waiting_points'
                ) {

                    await showWaitingPoints(
                        interaction
                    );

                    return;
                }

            } catch (error) {

                console.error(
                    'خطأ في معالجة الأزرار:',
                    error
                );


                if (
                    !interaction.replied &&
                    !interaction.deferred
                ) {

                    try {

                        await interaction.reply({

                            content:
                                '❌ حدث خطأ أثناء تنفيذ العملية.',

                            ephemeral:
                                true
                        });

                    } catch (replyError) {

                        console.error(
                            'تعذر الرد على التفاعل:',
                            replyError
                        );
                    }
                }
            }


            return;
        }


        // =========================
        // STRING SELECT MENU
        // =========================
        if (
            interaction.isStringSelectMenu()
        ) {

            try {

                // =========================
                // إدارة التذكرة
                // =========================
                if (
                    interaction.customId ===
                    'ticket_manage_select'
                ) {

                    await handleTicketManageSelect(
                        interaction
                    );

                    return;
                }


                // =========================
                // اختيار قضية لفك العقوبة
                // =========================
                if (
                    interaction.customId ===
                    'remove_punishment_select'
                ) {

                    const caseId =
                        interaction.values[0];


                    await removePunishment(
                        interaction,
                        caseId
                    );

                    return;
                }

            } catch (error) {

                console.error(
                    'خطأ في القائمة المنسدلة:',
                    error
                );


                if (
                    !interaction.replied &&
                    !interaction.deferred
                ) {

                    try {

                        await interaction.reply({

                            content:
                                '❌ حدث خطأ أثناء تنفيذ الاختيار.',

                            ephemeral:
                                true
                        });

                    } catch (replyError) {

                        console.error(
                            'تعذر الرد على التفاعل:',
                            replyError
                        );
                    }
                }
            }


            return;
        }


        // =========================
        // USER SELECT MENU
        // =========================
        if (
            interaction.isUserSelectMenu()
        ) {

            try {

                // =========================
                // إضافة شخص للتذكرة
                // =========================
                if (
                    interaction.customId ===
                    'ticket_add_user_select'
                ) {

                    await addUserToTicket(
                        interaction
                    );

                    return;
                }

            } catch (error) {

                console.error(
                    'خطأ في إضافة شخص للتذكرة:',
                    error
                );


                if (
                    !interaction.replied &&
                    !interaction.deferred
                ) {

                    try {

                        await interaction.reply({

                            content:
                                '❌ حدث خطأ أثناء إضافة الشخص للتذكرة.',

                            ephemeral:
                                true
                        });

                    } catch (replyError) {

                        console.error(
                            'تعذر الرد على التفاعل:',
                            replyError
                        );
                    }
                }
            }


            return;
        }


        // =========================
        // MODALS
        // =========================
        if (
            interaction.isModalSubmit()
        ) {

            try {

                // =========================
                // إغلاق التذكرة
                // =========================
                if (
                    interaction.customId ===
                    'close_ticket_modal'
                ) {

                    await handleCloseTicketModal(
                        interaction
                    );

                    return;
                }


                // =========================
                // إرسال رسالة لصاحب التذكرة
                // =========================
                if (
                    interaction.customId ===
                    'send_owner_message_modal'
                ) {

                    await handleSendOwnerMessageModal(
                        interaction
                    );

                    return;
                }


                // =========================
                // طلب معلومات من صاحب التذكرة
                // =========================
                if (
                    interaction.customId ===
                    'request_ticket_info_modal'
                ) {

                    await handleRequestInfoModal(
                        interaction
                    );

                    return;
                }


                // =========================
                // استقبال رد صاحب التذكرة
                // =========================
                if (
                    interaction.customId.startsWith(
                        'ticket_info_reply_modal:'
                    )
                ) {

                    const ticketChannelId =
                        interaction.customId.split(
                            ':'
                        )[1];


                    await handleTicketInfoReplyModal(
                        interaction,
                        ticketChannelId
                    );

                    return;
                }


                // =========================
                // 🔨 تسجيل الحظر الدائم
                // =========================
                if (
                    interaction.customId ===
                    'punishment_permanent_ban_modal'
                ) {

                    await handlePunishmentModal(
                        interaction,
                        'permanent_ban'
                    );

                    return;
                }


                // =========================
                // ⏱️ تسجيل الحظر المؤقت
                // =========================
                if (
                    interaction.customId ===
                    'punishment_temporary_ban_modal'
                ) {

                    await handlePunishmentModal(
                        interaction,
                        'temporary_ban'
                    );

                    return;
                }


                // =========================
                // ⚠️ تسجيل Warn 1
                // =========================
                if (
                    interaction.customId ===
                    'punishment_warn_1_modal'
                ) {

                    await handlePunishmentModal(
                        interaction,
                        'warn_1'
                    );

                    return;
                }


                // =========================
                // ⚠️ تسجيل Warn 2
                // =========================
                if (
                    interaction.customId ===
                    'punishment_warn_2_modal'
                ) {

                    await handlePunishmentModal(
                        interaction,
                        'warn_2'
                    );

                    return;
                }


                // =========================
                // 🚨 تسجيل Warn 3
                // =========================
                if (
                    interaction.customId ===
                    'punishment_warn_3_modal'
                ) {

                    await handlePunishmentModal(
                        interaction,
                        'warn_3'
                    );

                    return;
                }


                // =========================
                // 🔗 حفظ الدليل
                // =========================
                if (
                    interaction.customId.startsWith(
                        'add_evidence_modal:'
                    )
                ) {

                    const caseId =
                        interaction.customId.split(
                            ':'
                        )[1];


                    await handleEvidenceModal(
                        interaction,
                        caseId
                    );

                    return;
                }

            } catch (error) {

                console.error(
                    'خطأ في نافذة التفاعل:',
                    error
                );


                if (
                    !interaction.replied &&
                    !interaction.deferred
                ) {

                    try {

                        await interaction.reply({

                            content:
                                '❌ حدث خطأ أثناء تنفيذ العملية.',

                            ephemeral:
                                true
                        });

                    } catch (replyError) {

                        console.error(
                            'تعذر الرد على التفاعل:',
                            replyError
                        );
                    }
                }
            }


            return;
        }


        // =========================
        // SLASH COMMANDS
        // =========================
        if (
            interaction.isChatInputCommand()
        ) {

            const command =
                interaction.client.commands.get(
                    interaction.commandName
                );


            if (!command) {

                return;
            }


            try {

                await command.execute(
                    interaction
                );

            } catch (error) {

                console.error(
                    'خطأ في تنفيذ الأمر:',
                    error
                );


                const errorMessage = {

                    content:
                        '❌ حدث خطأ أثناء تنفيذ الأمر.',

                    ephemeral:
                        true
                };


                if (
                    interaction.replied ||
                    interaction.deferred
                ) {

                    await interaction.followUp(
                        errorMessage
                    );

                } else {

                    await interaction.reply(
                        errorMessage
                    );
                }
            }
        }
    }
};