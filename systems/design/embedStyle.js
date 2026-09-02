const { EmbedBuilder } = require('discord.js');

/*
|--------------------------------------------------------------------------
| NEXORA • Central Embed Design
|--------------------------------------------------------------------------
| هذا الملف مسؤول عن الهوية والتصميم المشترك للوحات NEXORA.
| لا نضع هنا منطق الأزرار أو الأنظمة.
|--------------------------------------------------------------------------
*/

// 🎨 ألوان الأنظمة
const COLORS = {
    default: 0x5865F2,
    tickets: 0x3498DB,
    waiting: 0x5865F2,
    callup: 0x8E44AD,
    punishment: 0xF39C12,
    evaluation: 0x9B59B6,
    points: 0xF1C40F,
    settings: 0x95A5A6
};

// 🖼️ صورة Sword الرئيسية
// سنضع رابط الصورة العام هنا بعد تجهيزها للـ Discord.
// لا تضع مسار من جهازك مثل C:\ أو /mnt/data.
const SWORD_IMAGE_URL = '';

/**
 * إنشاء Embed موحد لجميع أنظمة NEXORA
 *
 * @param {Object} options
 * @param {Object} options.client - Discord client
 * @param {string} options.system - اسم النظام
 * @param {string} options.title - عنوان اللوحة
 * @param {string} options.description - وصف اللوحة
 * @param {number} options.color - لون النظام
 * @param {boolean} options.showSwordImage - إظهار صورة Sword
 * @param {boolean} options.showBotThumbnail - إظهار شعار البوت
 * @param {Array} options.fields - حقول إضافية
 */
function createEmbed({
    client,
    system = 'NEXORA',
    title,
    description,
    color = COLORS.default,
    showSwordImage = true,
    showBotThumbnail = true,
    fields = []
}) {
    const embed = new EmbedBuilder()
        .setColor(color)
        .setAuthor({
            name: `NEXORA • ${system}`
        })
        .setTitle(title)
        .setDescription(description)
        .setFooter({
            text: `NEXORA • ${system}`
        })
        .setTimestamp();

    // 🤖 شعار NEXORA
    if (showBotThumbnail && client?.user) {
        embed.setThumbnail(
            client.user.displayAvatarURL({
                extension: 'png',
                size: 256
            })
        );
    }

    // 🖼️ صورة Sword الكبيرة
    if (showSwordImage && SWORD_IMAGE_URL) {
        embed.setImage(SWORD_IMAGE_URL);
    }

    // 📋 الحقول الإضافية
    if (fields.length > 0) {
        embed.addFields(fields);
    }

    return embed;
}

module.exports = {
    COLORS,
    SWORD_IMAGE_URL,
    createEmbed
};