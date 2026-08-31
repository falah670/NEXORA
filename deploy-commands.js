require('dotenv').config();

const fs = require('fs');
const path = require('path');

const {
    REST,
    Routes
} = require('discord.js');

const commands = [];
const commandsPath = path.join(__dirname, 'commands');

const commandFiles = fs
    .readdirSync(commandsPath)
    .filter(file => file.endsWith('.js'));

for (const file of commandFiles) {

    const filePath = path.join(commandsPath, file);

    try {

        const command = require(filePath);

        if (
            command &&
            command.data &&
            typeof command.execute === 'function'
        ) {

            commands.push(command.data.toJSON());

            console.log(`✅ تم تجهيز الأمر: ${command.data.name}`);

        } else {

            console.log(
                `⚠️ تم تجاهل الملف ${file} لأنه لا يحتوي على data أو execute.`
            );

        }

    } catch (error) {

        console.log(
            `❌ خطأ أثناء قراءة الملف ${file}:`,
            error.message
        );

    }

}

const rest = new REST({
    version: '10'
}).setToken(process.env.DISCORD_TOKEN);

(async () => {

    try {

        if (!process.env.DISCORD_TOKEN) {
            throw new Error('DISCORD_TOKEN غير موجود في ملف .env');
        }

        if (!process.env.CLIENT_ID) {
            throw new Error('CLIENT_ID غير موجود في ملف .env');
        }

        if (!process.env.GUILD_ID) {
            throw new Error('GUILD_ID غير موجود في ملف .env');
        }

        console.log('================================');
        console.log(`⏳ جاري تسجيل ${commands.length} أمر...`);
        console.log('================================');

        await rest.put(
            Routes.applicationGuildCommands(
                process.env.CLIENT_ID,
                process.env.GUILD_ID
            ),
            {
                body: commands
            }
        );

        console.log('================================');
        console.log('✅ تم تسجيل جميع الأوامر بنجاح!');
        console.log('================================');

    } catch (error) {

        console.error(
            '❌ حدث خطأ أثناء تسجيل الأوامر:'
        );

        console.error(error);

    }

})();