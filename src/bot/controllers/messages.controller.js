import db from "../../db/index.js";
import botService from "../service/bot.service.js";

const messagesController = {};


messagesController.start = async (msg, bot, userData) => {
    try {
        const chatId = msg.chat.id;

        console.log('userData (in start):>> ', userData);

        const userAdditionalData = JSON.parse(userData.data);
        console.log('userAdditionalData :>> ', userAdditionalData);
        const previousGreetingMessageId = userAdditionalData.gId;

        botService.close(chatId, previousGreetingMessageId, bot);

        const newGreetings = await bot.sendMessage(
            chatId,
            `*Hello👋, ${userData.info.split("|")[0]}!*`,
            {
                parse_mode: "Markdown",
                reply_markup: botService.getMenu()
            }
        );
        userAdditionalData.gId = newGreetings.message_id;

        await db.models.Account.update({ data: JSON.stringify(userAdditionalData) }, {
            where: {
                tgId: chatId
            }
        });
    } catch (error) {
        console.log('error.message (in messagesController.start):>> ', error.message);
    }
};



messagesController.selectLang = async (msg, bot, data) => {
    try {
        const chatId = msg.chat.id;

        await bot.sendMessage(
            chatId,
            `*Choose your language ⬇️*`,
            {
                parse_mode: "Markdown",
                reply_markup: JSON.stringify({
                    inline_keyboard: [
                        [
                            { text: "🇺🇦", callback_data: `lang|${chatId}|ukr`}, 
                            { text: "🇬🇧", callback_data: `lang|${chatId}|eng`}
                        ]
                    ]
                })
            }
        );
    } catch (error) {
        console.log('error.message (in messagesController.selectLang):>> ', error.message);
    }
};


messagesController.sendInlineMenu = async (msg, bot, data) => {
    try {
        const chatId = msg.chat.id;

        await bot.sendMessage(
            chatId,
            `*Меню* ⬇️`,
            {
                parse_mode: "Markdown",
                reply_markup: botService.getInlineMenu()
            }
        );
    } catch (error) {
        console.log('error.message (in messagesController.sendInlineMenu):>> ', error.message);
    }
};


const planStuses = {
    "inProgress": "В процесі",
    "completed": "Завершено",
    "canceled": "Скасовано"
};
messagesController.addPlan = async (msg, bot, userState, query) => {
    try {
        const chatId = msg.chat.id;
        
        const plan = await db.models.Plan.create({
            accountId: chatId,
            text: JSON.stringify(query),
            date: userState.data.date
        });
        const ikeyboard = [];
        ikeyboard.push([{ text: "Підтвердити ✅", callback_data: `plan|accept|${plan.dataValues.id}` }, { text: "Відмінити ❌", callback_data: `plan|cancel|${plan.dataValues.id}` }]);
        ikeyboard.push([{ text: "Закрити повідомлення ✖", callback_data: "close" }]);

        await bot.sendMessage(
            chatId,
            `*Ваш план додано(${userState.data.date} : ${planStuses[plan.dataValues.status]}):*\n\n`+
            JSON.parse(plan.dataValues.text),
            {
                parse_mode: "Markdown",
                reply_markup: JSON.stringify({
                    inline_keyboard: ikeyboard
                })
            }
        );
        
        botService.close(chatId, userState.data.questionMessageId, bot);
        botService.delUserState(chatId);
    } catch (error) {
        console.log('error.message (in messagesController.addPlan):>> ', error.message);
    }
};



export default messagesController;