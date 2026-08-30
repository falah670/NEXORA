require('dotenv').config();

const fs = require('fs');
const path = require('path');

const {
    Client,
    GatewayIntentBits,
    Collection
} = require('discord.js');

const {
    startPunishmentScheduler
} = require('./systems/punishmentExpirySystem');

const {
    startWaitingChecker,
    handleWaitingVoiceStateUpdate
} = require('./systems/waitingSystem');

const {
    handleCallUpInteraction
} = require('./systems/callUpSystem');

const {
    openPermanentBanModal,
    openTemporaryBanModal,
    openWarnModal,
    openWarn1Modal,
    openWarn2Modal,
    openWarn3Modal,
    handlePunishmentModal
} = require('./systems/punishmentSystem');


// =========================
// CLIENT
// =========================

const client = new Client({

    intents: [

        GatewayIntentBits.Guilds,

        GatewayIntentBits.GuildMembers,

        GatewayIntentBits.GuildVoiceStates

    ]

});


// =========================
// COMMANDS
// =========================

client.commands = new Collection();

const commandsPath = path.join(
    __dirname,
    'commands'
);

const commandFiles = fs
    .readdirSync(commandsPath)
    .filter(file => file.endsWith('.js'));

for (const file of commandFiles) {

    const filePath = path.join(
        commandsPath,
        file
    );

    const command = require(filePath);

    if (
        'data' in command &&
        'execute' in command
    ) {

        client.commands.set(
            command.data.name,
            command
        );

    } else {

        console.log(
            `⚠️ الأمر ${filePath} لا يحتوي على data أو execute`
        );

    }

}


// =========================
// EVENTS
// =========================

const eventsPath = path.join(
    __dirname,
    'events'
);

const eventFiles = fs
    .readdirSync(eventsPath)
    .filter(file => file.endsWith('.js'));

for (const file of eventFiles) {

    const filePath = path.join(
        eventsPath,
        file
    );

    const event = require(filePath);

    if (event.once) {

        client.once(

            event.name,

            (...args) =>
                event.execute(...args)

        );

    } else {

        client.on(

            event.name,

            (...args) =>
                event.execute(...args)

        );

    }

}


// =========================
// أزرار Call Up
// =========================

client.on(
    'interactionCreate',

    async interaction => {

        try {

            const handled =
                await handleCallUpInteraction(
                    interaction
                );

            if (handled) {

                return;

            }

        } catch (error) {

            console.error(
                'خطأ في نظام Call Up:',
                error
            );

        }

    }
);


// =========================
// نظام العقوبات
// =========================

client.on(
    'interactionCreate',

    async interaction => {

        try {

            // =========================
            // أزرار العقوبات
            // =========================

            if (interaction.isButton()) {

                // =========================
                // الحظر الدائم
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
                // الحظر المؤقت
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
                // Warn العام
                // =========================

                if (
                    interaction.customId ===
                    'punishment_warn'
                ) {

                    await openWarnModal(
                        interaction,
                        'warn'
                    );

                    return;

                }


                // =========================
                // Warn 1
                // =========================

                if (
                    interaction.customId ===
                    'punishment_warn_1'
                ) {

                    await openWarn1Modal(
                        interaction
                    );

                    return;

                }


                // =========================
                // Warn 2
                // =========================

                if (
                    interaction.customId ===
                    'punishment_warn_2'
                ) {

                    await openWarn2Modal(
                        interaction
                    );

                    return;

                }


                // =========================
                // Warn 3
                // =========================

                if (
                    interaction.customId ===
                    'punishment_warn_3'
                ) {

                    await openWarn3Modal(
                        interaction
                    );

                    return;

                }

            }


            // =========================
            // إرسال نماذج العقوبات
            // =========================

            if (interaction.isModalSubmit()) {

                // =========================
                // الحظر الدائم
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
                // الحظر المؤقت
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
                // Warn العام
                // =========================

                if (
                    interaction.customId ===
                    'punishment_warn_modal'
                ) {

                    await handlePunishmentModal(
                        interaction,
                        'warn'
                    );

                    return;

                }


                // =========================
                // Warn 1
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
                // Warn 2
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
                // Warn 3
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

            }

        } catch (error) {

            console.error(
                '❌ خطأ في نظام العقوبات:',
                error
            );

        }

    }
);


// =========================
// مراقبة الرومات الصوتية
// =========================

client.on(
    'voiceStateUpdate',

    async (
        oldState,
        newState
    ) => {

        try {

            await handleWaitingVoiceStateUpdate(
                oldState,
                newState
            );

        } catch (error) {

            console.error(
                'خطأ في مراقبة الرومات الصوتية:',
                error
            );

        }

    }
);


// =========================
// READY
// =========================

client.once(
    'ready',

    () => {

        console.log(
            `🤖 تم تسجيل دخول البوت: ${client.user.tag}`
        );

        startPunishmentScheduler(
            client
        );

        console.log(
            '⏳ تم تشغيل نظام متابعة العقوبات المؤقتة'
        );

        startWaitingChecker(
            client
        );

        console.log(
            '🎧 تم تفعيل مراقبة الرومات الصوتية'
        );

        console.log(
            '⏳ تم تشغيل مراقب نظام الانتظار'
        );

    }
);


// =========================
// LOGIN
// =========================

client.login(
    process.env.DISCORD_TOKEN
);