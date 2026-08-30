const {
    loadAccountability,
    saveAccountability
} = require('./punishmentSystem');

const {
    getGuildSettings
} = require('./config');


// =========================
// إعدادات أنواع العقوبات
// =========================

const punishmentRoleSettings = {

    temporary_ban:
        'bannedTemporaryRole',

    warn_1:
        'warn1Role',

    warn_2:
        'warn2Role',

    warn_3:
        'warn3Role'

};


// =========================
// إزالة رتبة العقوبة
// =========================

async function removePunishmentRole(
    client,
    punishmentCase
) {

    try {

        // التأكد من وجود Discord ID
        if (
            !punishmentCase.discordId ||
            punishmentCase.discordId ===
            'غير محدد'
        ) {

            console.log(
                `⚠️ لا يوجد Discord ID للقضية ${punishmentCase.id}`
            );

            return false;
        }


        // جلب السيرفر
        const guild =
            client.guilds.cache.get(
                punishmentCase.guildId
            );


        if (!guild) {

            console.log(
                `❌ لم يتم العثور على السيرفر للقضية ${punishmentCase.id}`
            );

            return false;
        }


        // جلب العضو
        let member;


        try {

            member =
                await guild.members.fetch(
                    punishmentCase.discordId
                );

        } catch (error) {

            console.log(
                `⚠️ العضو غير موجود في السيرفر: ${punishmentCase.discordId}`
            );

            return false;
        }


        // إعدادات السيرفر
        const settings =
            getGuildSettings(
                punishmentCase.guildId
            );


        if (!settings) {

            console.log(
                `⚠️ لا توجد إعدادات للسيرفر ${punishmentCase.guildId}`
            );

            return false;
        }


        // معرفة مفتاح الرتبة
        const roleSettingKey =
            punishmentRoleSettings[
                punishmentCase.punishmentType
            ];


        if (!roleSettingKey) {

            console.log(
                `⚠️ لا توجد رتبة مرتبطة بالعقوبة: ${punishmentCase.punishmentType}`
            );

            return false;
        }


        // ID الرتبة
        const roleId =
            settings[roleSettingKey];


        if (!roleId) {

            console.log(
                `⚠️ لم يتم إعداد رتبة العقوبة: ${roleSettingKey}`
            );

            return false;
        }


        // جلب الرتبة
        const role =
            guild.roles.cache.get(
                roleId
            );


        if (!role) {

            console.log(
                `⚠️ لم يتم العثور على رتبة العقوبة ${roleId}`
            );

            return false;
        }


        // إزالة الرتبة
        if (
            member.roles.cache.has(
                role.id
            )
        ) {

            await member.roles.remove(
                role
            );

            console.log(
                `✅ تمت إزالة رتبة العقوبة من ${member.user.tag}`
            );

        }


        return true;

    } catch (error) {

        console.error(
            '❌ خطأ أثناء إزالة رتبة العقوبة:',
            error
        );

        return false;
    }
}


// =========================
// فحص العقوبات المنتهية
// =========================

async function checkExpiredPunishments(
    client
) {

    try {

        const cases =
            loadAccountability();


        let changed =
            false;


        const now =
            Date.now();


        for (
            const punishmentCase
            of cases
        ) {


            // العقوبة انتهت مسبقاً
            if (
                punishmentCase.expired === true
            ) {

                continue;
            }


            // لا يوجد وقت انتهاء
            if (
                !punishmentCase.expiresAt
            ) {

                continue;
            }


            // لم تنتهِ العقوبة
            if (
                now <
                punishmentCase.expiresAt
            ) {

                continue;
            }


            console.log(
                `⏰ انتهت عقوبة: ${punishmentCase.id}`
            );


            // إزالة الرتبة
            await removePunishmentRole(
                client,
                punishmentCase
            );


            // تحديث القضية
            punishmentCase.expired =
                true;


            punishmentCase.expiredAt =
                now;


            changed =
                true;


            console.log(
                `✅ تم إنهاء العقوبة: ${punishmentCase.id}`
            );

        }


        // حفظ التغييرات
        if (changed) {

            saveAccountability(
                cases
            );

        }

    } catch (error) {

        console.error(
            '❌ خطأ في فحص العقوبات المنتهية:',
            error
        );

    }
}


// =========================
// تشغيل نظام المتابعة
// =========================

function startPunishmentScheduler(
    client
) {

    console.log(
        '⏳ تم تشغيل مراقب انتهاء العقوبات'
    );


    // فحص مباشر عند تشغيل البوت
    checkExpiredPunishments(
        client
    );


    // فحص كل دقيقة
    setInterval(

        () => {

            checkExpiredPunishments(
                client
            );

        },

        60 * 1000

    );

}


// =========================
// EXPORTS
// =========================

module.exports = {

    startPunishmentScheduler,

    checkExpiredPunishments,

    removePunishmentRole

};