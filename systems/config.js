const fs = require('fs');
const path = require('path');

const settingsPath = path.join(
    __dirname,
    'data/settings.json'
);

// =========================
// التأكد من وجود مجلد البيانات
// =========================

const dataDirectory = path.dirname(
    settingsPath
);

if (!fs.existsSync(dataDirectory)) {

    fs.mkdirSync(
        dataDirectory,
        {
            recursive: true
        }
    );

}

// =========================
// قراءة جميع الإعدادات
// =========================

function getAllSettings() {

    try {

        if (!fs.existsSync(settingsPath)) {

            fs.writeFileSync(
                settingsPath,
                '{}',
                'utf8'
            );

        }

        const data = fs.readFileSync(
            settingsPath,
            'utf8'
        );

        return JSON.parse(
            data || '{}'
        );

    } catch (error) {

        console.error(
            'خطأ في قراءة الإعدادات:',
            error
        );

        return {};

    }

}

// =========================
// حفظ جميع الإعدادات
// =========================

function saveAllSettings(data) {

    try {

        fs.writeFileSync(

            settingsPath,

            JSON.stringify(
                data,
                null,
                2
            ),

            'utf8'

        );

    } catch (error) {

        console.error(
            'خطأ في حفظ الإعدادات:',
            error
        );

    }

}

// =========================
// جلب إعدادات سيرفر معين
// =========================

function getGuildSettings(guildId) {

    const allSettings =
        getAllSettings();

    // =========================
    // إنشاء إعدادات السيرفر
    // =========================

    if (!allSettings[guildId]) {

        allSettings[guildId] = {};

    }

    // =========================
    // هوية النظام
    // =========================

    if (!('systemName' in allSettings[guildId])) {

        allSettings[guildId].systemName =
            'Falah Systems';

    }

    if (!('embedColor' in allSettings[guildId])) {

        allSettings[guildId].embedColor =
            '#5865F2';

    }

    if (!('systemFooter' in allSettings[guildId])) {

        allSettings[guildId].systemFooter =
            'Falah Systems';

    }

    if (!('systemLogo' in allSettings[guildId])) {

        allSettings[guildId].systemLogo =
            null;

    }

    // =========================
    // إعدادات التذاكر
    // =========================

    if (!('ticketCategory' in allSettings[guildId])) {

        allSettings[guildId].ticketCategory =
            null;

    }

    if (!('ticketSupportRole' in allSettings[guildId])) {

        allSettings[guildId].ticketSupportRole =
            null;

    }

    if (!('ticketLogChannel' in allSettings[guildId])) {

        allSettings[guildId].ticketLogChannel =
            null;

    }

    // =========================
    // إعدادات العقوبات
    // =========================

    if (!('punishmentLogChannel' in allSettings[guildId])) {

        allSettings[guildId].punishmentLogChannel =
            null;

    }

    if (!('punishmentReviewChannel' in allSettings[guildId])) {

        allSettings[guildId].punishmentReviewChannel =
            null;

    }

    // =========================
    // رتب العقوبات
    // =========================

    if (!('bannedTemporaryRole' in allSettings[guildId])) {

        allSettings[guildId].bannedTemporaryRole =
            null;

    }

    if (!('bannedPermanentRole' in allSettings[guildId])) {

        allSettings[guildId].bannedPermanentRole =
            null;

    }

    if (!('warn1Role' in allSettings[guildId])) {

        allSettings[guildId].warn1Role =
            null;

    }

    if (!('warn2Role' in allSettings[guildId])) {

        allSettings[guildId].warn2Role =
            null;

    }

    if (!('warn3Role' in allSettings[guildId])) {

        allSettings[guildId].warn3Role =
            null;

    }

    // =========================
    // Call Up
    // =========================

    if (!('callUpChannel' in allSettings[guildId])) {

        allSettings[guildId].callUpChannel =
            null;

    }

    // =========================
    // Waiting
    // =========================

    // روم انتظار الأعضاء

    if (!('waitingChannel' in allSettings[guildId])) {

        allSettings[guildId].waitingChannel =
            null;

    }

    // رتبة الإداريين المسموح لهم
    // باستخدام نظام الانتظار

    if (!('waitingAdminRole' in allSettings[guildId])) {

        allSettings[guildId].waitingAdminRole =
            null;

    }

    // الرومات الصوتية المخصصة
    // للإداريين أثناء الانتظار

    if (!('waitingStaffVoiceChannels' in allSettings[guildId])) {

        allSettings[guildId].waitingStaffVoiceChannels =
            [];

    }

    // روم إرسال تنبيهات الانتظار

    if (!('waitingNotificationChannel' in allSettings[guildId])) {

        allSettings[guildId].waitingNotificationChannel =
            null;

    }

    // مدة انتظار العضو قبل
    // إرسال التنبيه

    if (!('waitingWarningMinutes' in allSettings[guildId])) {

        allSettings[guildId].waitingWarningMinutes =
            10;

    }

    // مدة الميوت أو الصمم
    // قبل إخراج الإداري تلقائيًا

    if (!('waitingInactivityMinutes' in allSettings[guildId])) {

        allSettings[guildId].waitingInactivityMinutes =
            60;

    }

    // عدد النقاط لكل ساعة

    if (!('waitingPointsPerHour' in allSettings[guildId])) {

        allSettings[guildId].waitingPointsPerHour =
            1;

    }

    // عدد النقاط لكل Call Up

    if (!('waitingPointsPerCall' in allSettings[guildId])) {

        allSettings[guildId].waitingPointsPerCall =
            2;

    }

    // =========================
    // نظام النقاط العام
    // =========================

    if (!('pointsEnabled' in allSettings[guildId])) {

        allSettings[guildId].pointsEnabled =
            false;

    }

    // =========================
    // حفظ الإعدادات الجديدة
    // =========================

    saveAllSettings(
        allSettings
    );

    return allSettings[guildId];

}

// =========================
// تحديث إعداد واحد
// =========================

function updateGuildSetting(
    guildId,
    key,
    value
) {

    const allSettings =
        getAllSettings();

    // إنشاء إعدادات السيرفر إذا لم تكن موجودة

    if (!allSettings[guildId]) {

        getGuildSettings(
            guildId
        );

    }

    const updatedSettings =
        getAllSettings();

    updatedSettings[guildId][key] =
        value;

    saveAllSettings(
        updatedSettings
    );

    return updatedSettings[guildId];

}

// =========================
// تصدير النظام
// =========================

module.exports = {

    getAllSettings,

    saveAllSettings,

    getGuildSettings,

    updateGuildSetting

};