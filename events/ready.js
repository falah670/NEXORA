const { Events } = require('discord.js');

const {
    startPunishmentChecker
} = require('../systems/punishmentSystem');


module.exports = {

    name: Events.ClientReady,

    once: true,


    async execute(client) {

        console.log(
            `🤖 تم تسجيل دخول البوت: ${client.user.tag}`
        );


        console.log(
            `📊 البوت موجود في ${client.guilds.cache.size} سيرفر`
        );


        // =========================
        // تشغيل نظام العقوبات المؤقتة
        // =========================
        startPunishmentChecker(
            client
        );


        console.log(
            '⚖️ نظام العقوبات المؤقتة جاهز.'
        );
    }
};