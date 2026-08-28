require("dotenv").config();
const fs = require("fs");
const path = require("path");

const {
Client,
GatewayIntentBits,
Events,
EmbedBuilder,
ActionRowBuilder,
StringSelectMenuBuilder,
StringSelectMenuOptionBuilder,
ButtonBuilder,
ButtonStyle,
ModalBuilder,
TextInputBuilder,
TextInputStyle,
UserSelectMenuBuilder,
ChannelType,
PermissionFlagsBits
} = require("discord.js");

const CONFIG_PATH = path.join(__dirname, "config.json");
const DATA_PATH = path.join(__dirname, "data.json");

function loadJson(file, fallback) {
try {
if (!fs.existsSync(file)) {
fs.writeFileSync(
file,
JSON.stringify(fallback, null, 2),
"utf8"
);
return fallback;
}

return JSON.parse(
fs.readFileSync(file, "utf8")
);
} catch (error) {
console.error("JSON ERROR:", error);
return fallback;
}
}

const config = loadJson(CONFIG_PATH, {});

const data = loadJson(DATA_PATH, {
ticketCounter: 0,
warnings: {},
adminSessions: {},
adminPoints: {},
waiting: []
});

data.ticketCounter ??= 0;
data.warnings ??= {};
data.adminSessions ??= {};
data.adminPoints ??= {};
data.waiting ??= [];

function saveData() {
fs.writeFileSync(
DATA_PATH,
JSON.stringify(data, null, 2),
"utf8"
);
}

const client = new Client({
intents: [
GatewayIntentBits.Guilds,
GatewayIntentBits.GuildMembers,
GatewayIntentBits.GuildVoiceStates
]
});

const WAITING_VOICE_ID = "1542671243449213051";

const BRAND = {
name: "NEXORA",
colors: {
primary: 0x6D5DF5,
success: 0x2ECC71,
danger: 0xE74C3C,
warning: 0xF1C40F
}
};

const TICKET_TYPES = {
activation: {
label: "التفعيل",
emoji: "🟢",
description: "طلب تفعيل أو متابعة التفعيل"
},

admin_application: {
label: "التقديم على الإدارة",
emoji: "👮",
description: "التقديم على فريق الإدارة"
},

store: {
label: "المتجر",
emoji: "🛒",
description: "طلبات واستفسارات المتجر"
},

complaint: {
label: "شكوى على لاعب",
emoji: "⚠️",
description: "تقديم شكوى على لاعب"
},

ban_appeal: {
label: "اعتراض على باند",
emoji: "🔨",
description: "طلب مراجعة أو اعتراض على الحظر"
},

technical: {
label: "دعم فني",
emoji: "🛠️",
description: "مشكلة أو استفسار فني"
},

programming: {
label: "مشكلة برمجية",
emoji: "💻",
description: "الإبلاغ عن مشكلة برمجية"
},

general_support: {
label: "دعم فني عام",
emoji: "📞",
description: "مساعدة عامة"
},

management: {
label: "التواصل مع الإدارة",
emoji: "🏛️",
description: "التواصل المباشر مع الإدارة"
}
};

function isAdmin(member) {
if (!member) return false;

return Boolean(
member.permissions?.has(
PermissionFlagsBits.Administrator
) ||
(
config.adminRoleId &&
member.roles?.cache?.has(
config.adminRoleId
)
)
);
}

function getChannel(id) {
if (!id) return null;

return client.channels.cache.get(id);
}

/* =========================
LOG SYSTEM
========================= */

async function sendLog(guild, message) {
const logId =
config.channels?.logs ||
config.channels?.adminPoints;

const channel = getChannel(logId);

if (!channel?.isTextBased()) return;

await channel.send({
content: message
}).catch(error => {
console.error("LOG ERROR:", error);
});
}

async function sendEmbedLog(
guild,
title,
description,
color = BRAND.colors.primary
) {
const logId =
config.channels?.logs ||
config.channels?.adminPoints;

const channel = getChannel(logId);

if (!channel?.isTextBased()) return;

const embed = new EmbedBuilder()
.setColor(color)
.setTitle(title)
.setDescription(description)
.setTimestamp()
.setFooter({
text: "NEXORA • Logs"
});

await channel.send({
embeds: [embed]
}).catch(() => {});
}

/* =========================
TICKET PANEL
========================= */

function ticketPanel() {
const embed = new EmbedBuilder()
.setColor(BRAND.colors.primary)
.setTitle(
"🎫 NEXORA • مركز التذاكر"
)
.setDescription(
"مرحبًا بك 👋\n\n" +
"اختر الخدمة المناسبة من القائمة بالأسفل.\n" +
"🔒 تذكرتك خاصة بك وبفريق الدعم.\n" +
"\u200b\n" +
"\u200b"
)
.setFooter({
text: "NEXORA • Tickets"
})
.setTimestamp();

const menu =
new StringSelectMenuBuilder()
.setCustomId("ticket_type")
.setPlaceholder(
"📋 اختر نوع التذكرة"
)
.addOptions(
Object.entries(
TICKET_TYPES
).map(
([value, item]) =>
new StringSelectMenuOptionBuilder()
.setLabel(
item.label
)
.setValue(
value
)
.setDescription(
item.description
)
.setEmoji(
item.emoji
)
)
);

return {
embeds: [embed],
components: [
new ActionRowBuilder()
.addComponents(menu)
]
};
}

/* =========================
WAITING PANEL
========================= */

function waitingPanel() {
const embed = new EmbedBuilder()
.setColor(BRAND.colors.primary)
.setTitle(
"⏳ NEXORA • نظام الانتظار"
)
.setDescription(
"نظام الانتظار والإداريين في مكان واحد.\n\n" +
"👤 ادخل أو غادر القائمة.\n" +
"👮 سجّل دخولك وخروجك الإداري.\n" +
"⭐ النقاط تُحتسب تلقائيًا.\n" +
"\u200b"
)
.setFooter({
text: "NEXORA • Waiting"
})
.setTimestamp();

const row =
new ActionRowBuilder()
.addComponents(

new ButtonBuilder()
.setCustomId(
"waiting_join"
)
.setLabel(
"دخول الانتظار"
)
.setEmoji("⏳")
.setStyle(
ButtonStyle.Success
),

new ButtonBuilder()
.setCustomId(
"waiting_leave"
)
.setLabel(
"مغادرة الانتظار"
)
.setEmoji("🚪")
.setStyle(
ButtonStyle.Secondary
),

new ButtonBuilder()
.setCustomId(
"admin_login"
)
.setLabel(
"دخول إداري"
)
.setEmoji("👮")
.setStyle(
ButtonStyle.Primary
),

new ButtonBuilder()
.setCustomId(
"admin_logout"
)
.setLabel(
"خروج إداري"
)
.setEmoji("🔴")
.setStyle(
ButtonStyle.Danger
)

);

const secondRow =
new ActionRowBuilder()
.addComponents(

new ButtonBuilder()
.setCustomId(
"waiting_status"
)
.setLabel(
"قائمة الانتظار"
)
.setEmoji("📋")
.setStyle(
ButtonStyle.Secondary
),

new ButtonBuilder()
.setCustomId(
"my_points"
)
.setLabel(
"نقاطي"
)
.setEmoji("⭐")
.setStyle(
ButtonStyle.Secondary
)

);

return {
embeds: [embed],
components: [
row,
secondRow
]
};
}

/* =========================
SYSTEM PANEL
========================= */

function systemPanel() {
const embed = new EmbedBuilder()
.setColor(BRAND.colors.primary)
.setTitle(
"🛡️ NEXORA • النظام الإداري"
)
.setDescription(
"اختر الإجراء الإداري من الأزرار بالأسفل.\n\n" +
"\u200b\n" +
"\u200b\n" +
"\u200b\n" +
"\u200b"
)
.setFooter({
text: "NEXORA • Administration"
})
.setTimestamp();

const row =
new ActionRowBuilder()
.addComponents(

new ButtonBuilder()
.setCustomId(
"system_ban_perm"
)
.setLabel(
"Banned Perm"
)
.setEmoji("🔨")
.setStyle(
ButtonStyle.Danger
),

new ButtonBuilder()
.setCustomId(
"system_ban_temp"
)
.setLabel(
"Banned Temporary"
)
.setEmoji("⏱️")
.setStyle(
ButtonStyle.Danger
),

new ButtonBuilder()
.setCustomId(
"system_warn"
)
.setLabel(
"Warn"
)
.setEmoji("⚠️")
.setStyle(
ButtonStyle.Danger
)

);

return {
embeds: [embed],
components: [row]
};
}

/* =========================
SYSTEM MEMBER SELECT
========================= */

function systemMemberRow(type) {
const menu =
new UserSelectMenuBuilder()
.setCustomId(
`system_member_${type}`
)
.setPlaceholder(
"اختر العضو"
)
.setMinValues(1)
.setMaxValues(1);

return new ActionRowBuilder()
.addComponents(menu);
}

/* =========================
SYSTEM MODAL
========================= */

function systemModal(
type,
memberId
) {

const modal =
new ModalBuilder()
.setCustomId(
`system_modal_${type}_${memberId}`
)
.setTitle(
type === "warn"
? "⚠️ تسجيل تحذير"
: type === "perm"
? "🔨 Banned Perm"
: "⏱️ Banned Temporary"
);

const discordId =
new TextInputBuilder()
.setCustomId(
"discord_id"
)
.setLabel(
"ID DISCORD"
)
.setStyle(
TextInputStyle.Short
)
.setRequired(true)
.setValue(memberId)
.setMaxLength(25);

const steam =
new TextInputBuilder()
.setCustomId(
"steam_user"
)
.setLabel(
"STEAM USER"
)
.setStyle(
TextInputStyle.Short
)
.setRequired(true)
.setPlaceholder(
"Steam Identifier / Steam User"
)
.setMaxLength(100);

const info =
new TextInputBuilder()
.setCustomId(
"person_info"
)
.setLabel(
"PERSON INFORMATION"
)
.setStyle(
TextInputStyle.Paragraph
)
.setRequired(true)
.setPlaceholder(
"معلومات الشخص"
)
.setMaxLength(2000);

const reason =
new TextInputBuilder()
.setCustomId(
"reason"
)
.setLabel(
"REASON"
)
.setStyle(
TextInputStyle.Paragraph
)
.setRequired(true)
.setPlaceholder(
"سبب المخالفة"
)
.setMaxLength(1000);

const rows = [
new ActionRowBuilder()
.addComponents(
discordId
),

new ActionRowBuilder()
.addComponents(
steam
),

new ActionRowBuilder()
.addComponents(
info
),

new ActionRowBuilder()
.addComponents(
reason
)
];

if (type === "temp") {

const duration =
new TextInputBuilder()
.setCustomId(
"duration"
)
.setLabel(
"SPECIFIED TIME"
)
.setStyle(
TextInputStyle.Short
)
.setRequired(true)
.setPlaceholder(
"مثال: 3h أو 2d أو 6h"
)
.setMaxLength(20);

rows.push(
new ActionRowBuilder()
.addComponents(
duration
)
);
}

modal.addComponents(rows);

return modal;
}

/* =========================
TICKET OWNER
========================= */

function getTicketOwner(channel) {

if (
!channel ||
!channel.permissionOverwrites
) {
return null;
}

const everyone =
channel.guild.roles.everyone.id;

const overwrite =
channel.permissionOverwrites.cache.find(
o =>
o.id !== everyone &&
o.type === 1 &&
o.allow.has(
PermissionFlagsBits.ViewChannel
)
);

return overwrite?.id || null;
}

/* =========================
COMMANDS
========================= */

async function registerCommands() {

const guildId =
process.env.GUILD_ID;

if (!guildId) {

console.log(
"⚠️ GUILD_ID غير موجود في .env"
);

return;
}

const guild =
client.guilds.cache.get(
guildId
);

if (!guild) {

console.log(
"❌ البوت غير موجود في السيرفر."
);

return;
}

await guild.commands.set([

{
name: "setup",
description:
"إعداد NEXORA",

default_member_permissions:
PermissionFlagsBits
.Administrator
.toString()
},

{
name: "ticket",
description:
"إرسال لوحة التذاكر"
},

{
name: "waiting",
description:
"إرسال لوحة الانتظار"
},

{
name: "system",
description:
"إرسال لوحة النظام",

default_member_permissions:
PermissionFlagsBits
.Administrator
.toString()
},

{
name: "points",
description:
"عرض نقاط الإداري"
},

{
name: "warn",
description:
"تسجيل تحذير",

options: [

{
name: "member",
description:
"العضو",
type: 6,
required: true
},

{
name: "reason",
description:
"السبب",
type: 3,
required: true
}

]
},

{
name: "warnings",
description:
"عرض مخالفات عضو",

options: [

{
name: "member",
description:
"العضو",
type: 6,
required: true
}

]
},

{
name: "unwarn",
description:
"حذف آخر تحذير",

options: [

{
name: "member",
description:
"العضو",
type: 6,
required: true
}

]
}

]);

console.log(
"✅ تم تسجيل الأوامر."
);
}

/* =========================
READY
========================= */

client.once(
Events.ClientReady,
async () => {

console.log(
`🚀 ${
config.brandName ||
"NEXORA"
} يعمل باسم ${client.user.tag}`
);

await registerCommands();

}
);

/* =========================
VOICE WAITING
========================= */

client.on(
Events.VoiceStateUpdate,
async (
oldState,
newState
) => {

try {

const member =
newState.member ||
oldState.member;

if (
!member ||
member.user.bot
) {
return;
}

/* دخول روم الانتظار */

if (
newState.channelId ===
WAITING_VOICE_ID &&
oldState.channelId !==
WAITING_VOICE_ID
) {

if (
!data.waiting.includes(
member.id
)
) {

data.waiting.push(
member.id
);

saveData();

}

await sendLog(
member.guild,

`⏳ **دخول الانتظار**\n` +
`👤 العضو: ${member}\n` +
`🆔 ID: **${member.id}**`
);

const channel =
getChannel(
config.channels
?.waitingPanel
);

if (
channel?.isTextBased()
) {

await channel.send({

content:
`🔔 **عضو جديد في الانتظار**\n\n` +
`👤 العضو: ${member}\n` +
`⏳ دخل روم الانتظار.\n\n` +
`👮 يرجى خدمته.`

}).catch(() => {});

}

return;
}

/* خروج من روم الانتظار */

if (
oldState.channelId ===
WAITING_VOICE_ID &&
newState.channelId !==
WAITING_VOICE_ID
) {

const index =
data.waiting.indexOf(
member.id
);

if (
index !== -1
) {

data.waiting.splice(
index,
1
);

saveData();

}

await sendLog(
member.guild,

`🚪 **خروج من الانتظار**\n` +
`👤 العضو: ${member}\n` +
`🆔 ID: **${member.id}**`
);

}

} catch (error) {

console.error(
"WAITING ERROR:",
error
);

}

}
);

/* =========================
INTERACTIONS
========================= */

client.on(
Events.InteractionCreate,
async interaction => {

try {

/* =====================
SLASH COMMANDS
===================== */

if (
interaction.isChatInputCommand()
) {

/* SETUP */

if (
interaction.commandName ===
"setup"
) {

if (
!isAdmin(
interaction.member
)
) {

return interaction.reply({

content:
"❌ هذا الأمر للإدارة فقط.",

ephemeral: true

});

}

await interaction.deferReply({
ephemeral: true
});

const guild =
interaction.guild;

/* TICKET CATEGORY */

let ticketCategory =
guild.channels.cache.get(
config.categories
?.tickets
);

if (!ticketCategory) {

ticketCategory =
await guild.channels.create({

name:
"NEXORA • Tickets",

type:
ChannelType.GuildCategory

});

config.categories ??= {};

config.categories.tickets =
ticketCategory.id;

}

/* WAITING CATEGORY */

let waitingCategory =
guild.channels.cache.get(
config.categories
?.waiting
);

if (!waitingCategory) {

waitingCategory =
await guild.channels.create({

name:
"NEXORA • Waiting",

type:
ChannelType.GuildCategory

});

config.categories ??= {};

config.categories.waiting =
waitingCategory.id;

}

/* TICKET PANEL */

let ticketPanelChannel =
guild.channels.cache.get(
config.channels
?.ticketPanel
);

if (!ticketPanelChannel) {

ticketPanelChannel =
await guild.channels.create({

name:
"🎫・التذاكر",

type:
ChannelType.GuildText,

parent:
ticketCategory.id

});

config.channels ??= {};

config.channels.ticketPanel =
ticketPanelChannel.id;

}

/* WAITING PANEL */

let waitingPanelChannel =
guild.channels.cache.get(
config.channels
?.waitingPanel
);

if (!waitingPanelChannel) {

waitingPanelChannel =
await guild.channels.create({

name:
"⏳・الانتظار",

type:
ChannelType.GuildText,

parent:
waitingCategory.id

});

config.channels ??= {};

config.channels.waitingPanel =
waitingPanelChannel.id;

}

/* ADMIN POINTS */

let pointsChannel =
guild.channels.cache.get(
config.channels
?.adminPoints
);

if (!pointsChannel) {

pointsChannel =
await guild.channels.create({

name:
"📊・سجل-الاداريين",

type:
ChannelType.GuildText,

parent:
waitingCategory.id

});

config.channels ??= {};

config.channels.adminPoints =
pointsChannel.id;

}

/* LOGS */

let logsChannel =
guild.channels.cache.get(
config.channels
?.logs
);

if (!logsChannel) {

logsChannel =
await guild.channels.create({

name:
"📜・logs",

type:
ChannelType.GuildText

});

config.channels ??= {};

config.channels.logs =
logsChannel.id;

}

/* SYSTEM */

let systemChannel =
guild.channels.cache.get(
config.channels
?.systemPanel
);

if (!systemChannel) {

systemChannel =
await guild.channels.create({

name:
"🛡️・system",

type:
ChannelType.GuildText

});

config.channels ??= {};

config.channels.systemPanel =
systemChannel.id;

}

/* SAVE CONFIG */

fs.writeFileSync(
CONFIG_PATH,
JSON.stringify(
config,
null,
2
),
"utf8"
);

/* SEND PANELS */

await ticketPanelChannel.send(
ticketPanel()
);

await waitingPanelChannel.send(
waitingPanel()
);

await systemChannel.send(
systemPanel()
);

await logsChannel.send({
content:
"📜 **NEXORA Logs**\nتم تجهيز روم السجلات بنجاح."
});

return interaction.editReply(
"✅ تم تجهيز NEXORA بالكامل.\n\n" +
`🎫 التذاكر: ${ticketPanelChannel}\n` +
`⏳ الانتظار: ${waitingPanelChannel}\n` +
`⭐ نقاط الإدارة: ${pointsChannel}\n` +
`📜 Logs: ${logsChannel}\n` +
`🛡️ System: ${systemChannel}`
);

}

/* TICKET */

if (
interaction.commandName ===
"ticket"
) {

return interaction.reply(
ticketPanel()
);

}

/* WAITING */

if (
interaction.commandName ===
"waiting"
) {

return interaction.reply(
waitingPanel()
);

}

/* SYSTEM */

if (
interaction.commandName ===
"system"
) {

if (
!isAdmin(
interaction.member
)
) {

return interaction.reply({

content:
"❌ هذا النظام للإدارة فقط.",

ephemeral: true

});

}

return interaction.reply(
systemPanel()
);

}

/* POINTS */

if (
interaction.commandName ===
"points"
) {

const id =
interaction.user.id;

const points =
data.adminPoints[
id
] || 0;

const session =
data.adminSessions[
id
];

return interaction.reply({

content:
`⭐ **نقاطك: ${points}**\n` +
`🟢 الحالة: ${
session
? "مسجل دخول"
: "غير مسجل دخول"
}`,

ephemeral: true

});

}

/* WARN */

if (
interaction.commandName ===
"warn"
) {

if (
!isAdmin(
interaction.member
)
) {

return interaction.reply({

content:
"❌ هذا الأمر للإدارة فقط.",

ephemeral: true

});

}

const member =
interaction.options.getMember(
"member"
);

const reason =
interaction.options.getString(
"reason"
);

if (!member) {

return interaction.reply({

content:
"❌ العضو غير موجود.",

ephemeral: true

});

}

data.warnings[
member.id
] ??= [];

data.warnings[
member.id
].push({

reason,

moderatorId:
interaction.user.id,

createdAt:
Date.now()

});

saveData();

await sendLog(
interaction.guild,

`⚠️ **Warn**\n` +
`👤 العضو: ${member}\n` +
`🆔 ID: **${member.id}**\n` +
`📝 السبب: **${reason}**\n` +
`👮 الإداري: ${interaction.user}`

);

return interaction.reply({

content:
`⚠️ تم تسجيل تحذير على ${member}.\n` +
`📝 السبب: **${reason}**`,

ephemeral: true

});

}

/* WARNINGS */

if (
interaction.commandName ===
"warnings"
) {

if (
!isAdmin(
interaction.member
)
) {

return interaction.reply({

content:
"❌ هذا الأمر للإدارة فقط.",

ephemeral: true

});

}

const member =
interaction.options.getMember(
"member"
);

if (!member) {

return interaction.reply({

content:
"❌ العضو غير موجود.",

ephemeral: true

});

}

const list =
data.warnings[
member.id
] || [];

if (
!list.length
) {

return interaction.reply({

content:
`✅ ${member} لا توجد عليه مخالفات.`,

ephemeral: true

});

}

const text =
list
.slice(-10)
.map(
(w, i) =>
`${i + 1}. **${w.reason}** — <@${w.moderatorId}> — <t:${Math.floor(w.createdAt / 1000)}:R>`
)
.join("\n");

return interaction.reply({

embeds: [

new EmbedBuilder()
.setColor(
0xe67e22
)
.setTitle(
`⚠️ مخالفات ${member.user.tag}`
)
.setDescription(
text
)
.setFooter({
text:
`الإجمالي: ${list.length}`
})

],

ephemeral: true

});

}

/* UNWARN */

if (
interaction.commandName ===
"unwarn"
) {

if (
!isAdmin(
interaction.member
)
) {

return interaction.reply({

content:
"❌ هذا الأمر للإدارة فقط.",

ephemeral: true

});

}

const member =
interaction.options.getMember(
"member"
);

if (!member) {

return interaction.reply({

content:
"❌ العضو غير موجود.",

ephemeral: true

});

}

const list =
data.warnings[
member.id
] || [];

if (
!list.length
) {

return interaction.reply({

content:
"❌ لا يوجد تحذير لحذفه.",

ephemeral: true

});

}

list.pop();

saveData();

await sendLog(
interaction.guild,

`🗑️ **حذف Warn**\n` +
`👤 العضو: ${member}\n` +
`👮 بواسطة: ${interaction.user}`

);

return interaction.reply({

content:
`✅ تم حذف آخر تحذير من ${member}.`,

ephemeral: true

});

}

}

/* =====================
TICKET SELECT
===================== */

if (
interaction.isStringSelectMenu() &&
interaction.customId ===
"ticket_type"
) {

await interaction.deferReply({
ephemeral: true
});

const type =
interaction.values[0];

const info =
TICKET_TYPES[type];

const guild =
interaction.guild;

const existing =
guild.channels.cache.find(
ch =>
ch.parentId ===
config.categories
?.tickets &&
ch.name.includes(
interaction.user.id.slice(-6)
)
);

if (existing) {

return interaction.editReply(
`🎫 عندك تذكرة مفتوحة بالفعل: ${existing}`
);

}

const category =
guild.channels.cache.get(
config.categories
?.tickets
);

if (!category) {

return interaction.editReply(
"❌ استخدم /setup أولًا."
);

}

data.ticketCounter++;

const number =
data.ticketCounter;

const channelName =
`ticket-${String(
number
).padStart(
4,
"0"
)}-${interaction.user.id.slice(-6)}`;

const channel =
await guild.channels.create({

name:
channelName,

type:
ChannelType.GuildText,

parent:
category.id,

topic:
`${info.label} | Owner: ${interaction.user.id}`,

permissionOverwrites: [

{

id:
guild.roles
.everyone.id,

deny: [

PermissionFlagsBits
.ViewChannel

]

},

{

id:
guild.members
.me.id,

allow: [

PermissionFlagsBits
.ViewChannel,

PermissionFlagsBits
.SendMessages,

PermissionFlagsBits
.ReadMessageHistory,

PermissionFlagsBits
.EmbedLinks,

PermissionFlagsBits
.ManageMessages

]

},

{

id:
interaction.user.id,

allow: [

PermissionFlagsBits
.ViewChannel,

PermissionFlagsBits
.SendMessages,

PermissionFlagsBits
.ReadMessageHistory,

PermissionFlagsBits
.AttachFiles

]

}

]

});

saveData();

await sendLog(
guild,

`🎫 **فتح تذكرة**\n` +
`👤 العضو: ${interaction.user}\n` +
`📂 النوع: **${info.label}**\n` +
`📌 التذكرة: ${channel}`

);

const embed =
new EmbedBuilder()
.setColor(
BRAND.colors.primary
)
.setTitle(
`${info.emoji} ${info.label}`
)
.setDescription(
`هلا ${interaction.user} 👋\n\n` +
`تم فتح تذكرتك بنجاح.\n` +
`**نوع الطلب:** ${info.label}\n\n` +
"اكتب تفاصيل طلبك بشكل واضح.\n\n" +
"🔒 عند الانتهاء اضغط إغلاق التذكرة."
)
.setFooter({
text:
"NEXORA • Support"
})
.setTimestamp();

const closeRow =
new ActionRowBuilder()
.addComponents(

new ButtonBuilder()
.setCustomId(
"close_ticket"
)
.setLabel(
"إغلاق التذكرة"
)
.setEmoji("🔒")
.setStyle(
ButtonStyle.Danger
)

);

await channel.send({

content:
`${interaction.user}${
config.supportRoleId
? ` <@&${config.supportRoleId}>`
: ""
}`,

embeds: [
embed
],

components: [
closeRow
]

});

return interaction.editReply(
`✅ تم فتح تذكرتك: ${channel}`
);

}

/* =====================
SYSTEM MEMBER SELECT
===================== */

if (
interaction.isUserSelectMenu() &&
interaction.customId.startsWith(
"system_member_"
)
) {

if (
!isAdmin(
interaction.member
)
) {

return interaction.reply({

content:
"❌ هذا النظام للإدارة فقط.",

ephemeral: true

});

}

const type =
interaction.customId.replace(
"system_member_",
""
);

const memberId =
interaction.values[0];

const member =
await interaction.guild.members
.fetch(
memberId
)
.catch(
() => null
);

if (!member) {

return interaction.update({

content:
"❌ العضو غير موجود.",

components: []

});

}

if (
member.id ===
interaction.guild.ownerId
) {

return interaction.update({

content:
"❌ لا يمكن تنفيذ الإجراء على مالك السيرفر.",

components: []

});

}

return interaction.showModal(
systemModal(
type,
member.id
)
);

}

/* =====================
SYSTEM MODAL
===================== */

if (
interaction.isModalSubmit() &&
interaction.customId.startsWith(
"system_modal_"
)
) {

if (
!isAdmin(
interaction.member
)
) {

return interaction.reply({

content:
"❌ هذا النظام للإدارة فقط.",

ephemeral: true

});

}

const match =
interaction.customId.match(
/^system_modal_(warn|perm|temp)_(.+)$/
);

if (!match) {

return interaction.reply({

content:
"❌ بيانات العملية غير صحيحة.",

ephemeral: true

});

}

const type =
match[1];

const memberId =
match[2];

const member =
await interaction.guild.members
.fetch(
memberId
)
.catch(
() => null
);

if (!member) {

return interaction.reply({

content:
"❌ العضو غير موجود.",

ephemeral: true

});

}

const discordId =
interaction.fields.getTextInputValue(
"discord_id"
);

const steamUser =
interaction.fields.getTextInputValue(
"steam_user"
);

const personInfo =
interaction.fields.getTextInputValue(
"person_info"
);

const reason =
interaction.fields.getTextInputValue(
"reason"
);

/* WARN */

if (
type === "warn"
) {

data.warnings[
member.id
] ??= [];

data.warnings[
member.id
].push({

reason,

moderatorId:
interaction.user.id,

createdAt:
Date.now(),

discordId,

steamUser,

personInfo

});

saveData();

await sendEmbedLog(
interaction.guild,

"⚠️ Warn",

`👤 **العضو:** ${member}\n` +
`🆔 **Discord ID:** ${discordId}\n` +
`🎮 **Steam:** ${steamUser}\n` +
`📋 **المعلومات:** ${personInfo}\n` +
`📝 **السبب:** ${reason}\n` +
`👮 **الإداري:** ${interaction.user}`,

BRAND.colors.warning
);

return interaction.reply({

content:
`⚠️ تم تسجيل التحذير على ${member} بنجاح.`,

ephemeral: true

});

}

/* PERMANENT BAN */

if (
type === "perm"
) {

await sendEmbedLog(
interaction.guild,

"🔨 Banned Perm",

`👤 **العضو:** ${member}\n` +
`🆔 **Discord ID:** ${discordId}\n` +
`🎮 **Steam:** ${steamUser}\n` +
`📋 **المعلومات:** ${personInfo}\n` +
`📝 **السبب:** ${reason}\n` +
`👮 **الإداري:** ${interaction.user}`,

BRAND.colors.danger
);

return interaction.reply({

content:
`🔨 تم تسجيل **Banned Perm** على ${member}.`,

ephemeral: true

});

}

/* TEMP BAN */

if (
type === "temp"
) {

const duration =
interaction.fields.getTextInputValue(
"duration"
);

await sendEmbedLog(
interaction.guild,

"⏱️ Banned Temporary",

`👤 **العضو:** ${member}\n` +
`🆔 **Discord ID:** ${discordId}\n` +
`🎮 **Steam:** ${steamUser}\n` +
`📋 **المعلومات:** ${personInfo}\n` +
`⏰ **المدة:** ${duration}\n` +
`📝 **السبب:** ${reason}\n` +
`👮 **الإداري:** ${interaction.user}`,

0xff8c00
);

return interaction.reply({

content:
`⏱️ تم تسجيل **Banned Temporary** على ${member}.\n` +
`⏰ المدة: **${duration}**`,

ephemeral: true

});

}

}

/* =====================
BUTTONS
===================== */

if (
interaction.isButton()
) {

/* SYSTEM */

if (
[
"system_ban_perm",
"system_ban_temp",
"system_warn"
].includes(
interaction.customId
)
) {

if (
!isAdmin(
interaction.member
)
) {

return interaction.reply({

content:
"❌ هذا النظام للإدارة فقط.",

ephemeral: true

});

}

const type =
interaction.customId ===
"system_warn"
? "warn"
: interaction.customId ===
"system_ban_perm"
? "perm"
: "temp";

return interaction.reply({

content:
"👤 اختر العضو المطلوب:",

components: [
systemMemberRow(
type
)
],

ephemeral: true

});

}

/* CLOSE TICKET */

if (
interaction.customId ===
"close_ticket"
) {

const ownerId =
getTicketOwner(
interaction.channel
);

const allowed =
interaction.user.id ===
ownerId ||
isAdmin(
interaction.member
) ||
(
config.supportRoleId &&
interaction.member.roles.cache.has(
config.supportRoleId
)
);

if (!allowed) {

return interaction.reply({

content:
"❌ لا تملك صلاحية الإغلاق.",

ephemeral: true

});

}

const row =
new ActionRowBuilder()
.addComponents(

new ButtonBuilder()
.setCustomId(
"confirm_close"
)
.setLabel(
"تأكيد الإغلاق"
)
.setEmoji("🔒")
.setStyle(
ButtonStyle.Danger
),

new ButtonBuilder()
.setCustomId(
"cancel_close"
)
.setLabel(
"إلغاء"
)
.setEmoji("↩️")
.setStyle(
ButtonStyle.Secondary
)

);

return interaction.reply({

content:
"⚠️ هل أنت متأكد من إغلاق التذكرة؟",

components: [
row
],

ephemeral: true

});

}

/* CANCEL */

if (
interaction.customId ===
"cancel_close"
) {

return interaction.update({

content:
"✅ تم إلغاء الإغلاق.",

components: []

});

}

/* CONFIRM CLOSE */

if (
interaction.customId ===
"confirm_close"
) {

const ownerId =
getTicketOwner(
interaction.channel
);

const allowed =
interaction.user.id ===
ownerId ||
isAdmin(
interaction.member
) ||
(
config.supportRoleId &&
interaction.member.roles.cache.has(
config.supportRoleId
)
);

if (!allowed) {

return interaction.update({

content:
"❌ لا تملك صلاحية الإغلاق.",

components: []

});

}

const owner =
ownerId
? `<@${ownerId}>`
: "غير معروف";

const type =
interaction.channel.topic
?.split("|")[0]
?.trim() ||
"تذكرة";

if (
isAdmin(
interaction.member
) ||
(
config.supportRoleId &&
interaction.member.roles.cache.has(
config.supportRoleId
)
)
) {

data.adminPoints[
interaction.user.id
] =
(
data.adminPoints[
interaction.user.id
] || 0
) +
(
config.points
?.pointsOnTicketClose ||
1
);

saveData();

}

await sendLog(
interaction.guild,

`🔒 **إغلاق تذكرة**\n` +
`📂 النوع: **${type}**\n` +
`👤 العضو: ${owner}\n` +
`👮 بواسطة: ${interaction.user}`

);

await interaction.update({

content:
"🔒 تم إغلاق التذكرة. سيتم حذف الروم خلال 5 ثوانٍ.",

components: []

});

setTimeout(
() =>
interaction.channel
.delete(
"Ticket closed"
)
.catch(
() => {}
),
5000
);

return;

}

/* WAITING JOIN */

if (
interaction.customId ===
"waiting_join"
) {

if (
!data.waiting.includes(
interaction.user.id
)
) {

data.waiting.push(
interaction.user.id
);

saveData();

await sendLog(
interaction.guild,

`⏳ **دخول قائمة الانتظار**\n` +
`👤 العضو: ${interaction.user}\n` +
`🆔 ID: **${interaction.user.id}**`

);

}

const position =
data.waiting.indexOf(
interaction.user.id
) + 1;

return interaction.reply({

content:
`⏳ تم إدخالك في قائمة الانتظار.\n📋 ترتيبك: **${position}**`,

ephemeral: true

});

}

/* WAITING LEAVE */

if (
interaction.customId ===
"waiting_leave"
) {

const existed =
data.waiting.includes(
interaction.user.id
);

data.waiting =
data.waiting.filter(
id =>
id !==
interaction.user.id
);

saveData();

if (existed) {

await sendLog(
interaction.guild,

`🚪 **مغادرة الانتظار**\n` +
`👤 العضو: ${interaction.user}\n` +
`🆔 ID: **${interaction.user.id}**`

);

}

return interaction.reply({

content:
"🚪 تم إخراجك من قائمة الانتظار.",

ephemeral: true

});

}

/* WAITING STATUS */

if (
interaction.customId ===
"waiting_status"
) {

if (
!data.waiting.length
) {

return interaction.reply({

content:
"📋 قائمة الانتظار فارغة.",

ephemeral: true

});

}

const list =
data.waiting
.map(
(id, i) =>
`${i + 1}. <@${id}>`
)
.join("\n");

return interaction.reply({

embeds: [

new EmbedBuilder()
.setColor(
BRAND.colors.success
)
.setTitle(
"⏳ قائمة الانتظار"
)
.setDescription(
list
)
.setFooter({
text:
`العدد: ${data.waiting.length}`
})

],

ephemeral: true

});

}

/* ADMIN LOGIN */

if (
interaction.customId ===
"admin_login"
) {

if (
!isAdmin(
interaction.member
)
) {

return interaction.reply({

content:
"❌ هذا الزر للإداريين فقط.",

ephemeral: true

});

}

if (
data.adminSessions[
interaction.user.id
]
) {

return interaction.reply({

content:
"🟢 أنت مسجل دخول بالفعل.",

ephemeral: true

});

}

data.adminSessions[
interaction.user.id
] = Date.now();

saveData();

await sendLog(
interaction.guild,

`🟢 **تسجيل دخول إداري**\n` +
`👮 الإداري: ${interaction.user}\n` +
`🆔 ID: **${interaction.user.id}**`

);

return interaction.reply({

content:
"🟢 تم تسجيل دخولك الإداري.",

ephemeral: true

});

}

/* ADMIN LOGOUT */

if (
interaction.customId ===
"admin_logout"
) {

if (
!isAdmin(
interaction.member
)
) {

return interaction.reply({

content:
"❌ هذا الزر للإداريين فقط.",

ephemeral: true

});

}

const started =
data.adminSessions[
interaction.user.id
];

if (!started) {

return interaction.reply({

content:
"🔴 أنت غير مسجل دخول.",

ephemeral: true

});

}

const minutes =
Math.floor(
(
Date.now() -
started
) / 60000
);

const perPoint =
Math.max(
1,
Number(
config.points
?.minutesPerPoint ||
10
)
);

const points =
Math.floor(
minutes /
perPoint
);

data.adminPoints[
interaction.user.id
] =
(
data.adminPoints[
interaction.user.id
] || 0
) +
points;

delete data.adminSessions[
interaction.user.id
];

saveData();

await sendLog(
interaction.guild,

`🔴 **تسجيل خروج إداري**\n` +
`👮 الإداري: ${interaction.user}\n` +
`⏱️ المدة: **${minutes} دقيقة**\n` +
`⭐ النقاط: **${points}**`

);

return interaction.reply({

content:
`🔴 تم تسجيل خروجك.\n` +
`⏱️ المدة: **${minutes} دقيقة**\n` +
`⭐ النقاط المكتسبة: **${points}**\n` +
`🏆 مجموع نقاطك: **${data.adminPoints[interaction.user.id]}**`,

ephemeral: true

});

}

/* MY POINTS */

if (
interaction.customId ===
"my_points"
) {

const points =
data.adminPoints[
interaction.user.id
] || 0;

const session =
data.adminSessions[
interaction.user.id
];

return interaction.reply({

content:
`⭐ **نقاطك: ${points}**\n` +
`🟢 الحالة: ${
session
? "مسجل دخول"
: "غير مسجل دخول"
}`,

ephemeral: true

});

}

}

} catch (error) {

console.error(
"INTERACTION ERROR:",
error
);

const message =
"❌ حدث خطأ غير متوقع. راجع Terminal.";

if (
interaction.replied ||
interaction.deferred
) {

await interaction
.followUp({

content:
message,

ephemeral: true

})
.catch(
() => {}
);

} else {

await interaction
.reply({

content:
message,

ephemeral: true

})
.catch(
() => {}
);

}

}

}
);

/* =========================
LOGIN
========================= */

client.login(
process.env.DISCORD_TOKEN
);