import db from "../../db/index.js";
import botService from "../service/bot.service.js";

const callbackController = {};



callbackController.lang = async (msg, bot, data) => {
    try {
        if(msg == undefined || bot == undefined || data == undefined) throw new Error("Missing params");

        const chatId = msg.chat.id;
        const userTgId = data[0];
        const selectedLang = data[1];
        
        if(selectedLang == "eng") {
            const engLangErrMessage = await bot.sendMessage(
                chatId, 
                "*Зараз бот підтримує тільки українську мову*\n"+
                "*Найближчим часом вибір англійскої мови запрацює*",
                {
                    parse_mode: "Markdown"
                }
            );
            setTimeout(() => {
                botService.close(chatId, msg.message_id, bot);
            }, 10000);
            setTimeout(() => {
                botService.close(chatId, engLangErrMessage.message_id, bot);
            }, 10000);
            setTimeout(() => {
                botService.resendUserMainInlineMenu(chatId, bot);
            }, 10000);
            return;
        }

        await db.models.Account.update({ lang: selectedLang }, {
            where: {
                tgId: userTgId
            }
        });

        const newMessage = await bot.sendMessage(
            chatId, 
            "*Ви успішно змінили мову на українську!*",
            {
                parse_mode: "Markdown"
            }
        );


        setTimeout(() => {
            botService.close(chatId, msg.message_id, bot);
        }, 10000);
        setTimeout(() => {
            botService.close(chatId, newMessage.message_id, bot);
        }, 10000);
        setTimeout(() => {
            botService.resendUserMainInlineMenu(chatId, bot);
        }, 10000);
    } catch (error) {
        console.log('error.message (in callbackController.lang):>> ', error.message);
    }
}


callbackController.profile = async (msg, bot, userData) => {
    try {
        const chatId = msg.chat.id;

        const userInfo = userData.info.split("|");
        const userName = userInfo[0] + " " + userInfo[1];
        let userTag = "";

        if(userInfo[2] != "") userTag = "@"+userInfo[2];

        await bot.editMessageText(
            `🔰 <b>Ваш профіль:</b>\n\n`+
            `👤 ${userName}\n`+
            `${userTag}`+
            `\n\n<b>ID</b> <em>${userData.tgId}</em>`,
            {
                chat_id: chatId,
                message_id: msg.message_id,
                parse_mode: "HTML",
                reply_markup: JSON.stringify({
                    inline_keyboard: [
                        [{ text: "⬅️", callback_data: "menu|0" }]
                    ]
                })
            }
        );
    } catch (error) {
        console.log('error.message (in callbackController.profile):>> ', error.message);
    }
};


callbackController.menu = async (msg, bot, data) => {
    try {
        const chatId = msg.chat.id;
        const stage = data[0];

        switch (stage) {
            case "0":
                botService.resendUserMainInlineMenu(chatId, bot);
                break;


            case "slang":
                callbackController.selectLang(msg, bot, {});
                break;
        
            default:
                break;
        }

    } catch (error) {
        console.log('error.message (in callbackController.menu):>> ', error.message);
    }
};


callbackController.selectLang = async (msg, bot, data) => {
    try {
        const chatId = msg.chat.id;
        await bot.editMessageText(
            `*Обери свою мову* ⬇️`,
            {
                chat_id: chatId,
                message_id: msg.message_id,
                parse_mode: "Markdown",
                reply_markup: JSON.stringify({
                    inline_keyboard: [
                        [
                            { text: "🇺🇦", callback_data: `lang|${chatId}|ukr`}, 
                            { text: "🇬🇧", callback_data: `lang|${chatId}|eng`}
                        ],
                        [{ text: "⬅️", callback_data: "menu|0" }]
                    ]
                })
            }
        );
    } catch (error) {
        console.log('error.message (in callbackController.selectLang):>> ', error.message);
    }
};

const monthes = {
    1: "Січень", 2: "Лютий", 3: "Березень", 4: "Квітень", 5: "Травень",
    6: "Червень", 7: "Липень", 8: "Серпень", 9: "Вересень", 10: "Жовтень",
    11: "Листопад", 12: "Грудень"
};
callbackController.datesList = async (msg, bot, data) => {
    try {
        const chatId = msg.chat.id;
        const month = +data[0];
        const year = 2000 + +data[1];
        let isLeapYear = false;
        let days;


        const ikeyboard = [];


        if(year % 4 == 0) isLeapYear = true;
        if(month == 2 && !isLeapYear) days = 28;
        else if(month == 2 && isLeapYear) days = 29;
        else if(
            month == 1 ||
            month == 3 ||
            month == 5 ||
            month == 7 || 
            month == 8 ||
            month == 10 ||
            month == 12
        ) days = 31;
        else days = 30;

        ikeyboard.push([
            { text: ""+year, callback_data: "-" }
        ]);
        ikeyboard.push([
            { text: monthes[month], callback_data: "-" }
        ]);

        let weekCounter = 0;
        let week = [];
        for(let dayIndex = 1; dayIndex <= days; dayIndex++) {
            if(weekCounter != 7) {
                weekCounter++;
            }
            else {
                ikeyboard.push(week);
                weekCounter = 0;
                week = [];
            }

            let dayDate;
            if(dayIndex < 10) dayDate = "0"+dayIndex;
            else dayDate = ""+dayIndex;

            week.push({ text: dayDate, callback_data: `plan_date|${dayIndex}|${month}|${year-2000}` });
        }
        if(week.length != 0) ikeyboard.push(week);



        const controllers = [];
        
        let previousYear = year;
        let previousMonth = month-1;

        if(month == 1) {
            if(year > 2024) {
                previousYear--;
                previousMonth = 12;
                controllers.push({ text: "◀️", callback_data: `dates_list|${previousMonth}|${previousYear-2000}` });
            }
        }
        else {
            controllers.push({ text: "◀️", callback_data: `dates_list|${previousMonth}|${previousYear-2000}` });
        }

        let nextYear = year;
        let nextMonth = month+1;
        if(month == 12) {
            nextYear++;
            nextMonth = 1;
        }
        controllers.push({ text: "▶", callback_data: `dates_list|${nextMonth}|${nextYear-2000}` });
        

        ikeyboard.push(controllers);

        ikeyboard.push([{ text: "⬅️", callback_data: "menu|0" }]);



        await bot.editMessageText(
            `*Календар:*`,
            {
                chat_id: chatId,
                message_id: msg.message_id,
                parse_mode: "Markdown",
                reply_markup: JSON.stringify({
                    inline_keyboard: ikeyboard
                })
            }
        );
    } catch (error) {
        console.log('error.message (in callbackController.profile):>> ', error.message);
    }
};



callbackController.plan_date = async (msg, bot, data) => {
    try {
        const chatId = msg.chat.id;
        const day = +data[0];
        const month = +data[1];
        const year = 2000 + +data[2];

        await bot.editMessageText(
            `*${monthes[month]}, ${day}, ${year}:*`,
            {
                chat_id: chatId,
                message_id: msg.message_id,
                parse_mode: "Markdown",
                reply_markup: JSON.stringify({
                    inline_keyboard: [
                        [{ text: "Плани на цей день", callback_data: `-` }],
                        [{ text: "Додати план➕", callback_data: `-` }],
                        [{ text: "Головне меню", callback_data: `-` }],
                        [{ text: "⬅️", callback_data: `dates_list|${month}|${year-2000}` }]
                    ]
                })
            }
        );
    } catch (error) {
        console.log('error.message (in callbackController.plan_date):>> ', error.message);
    }
};


export default callbackController;