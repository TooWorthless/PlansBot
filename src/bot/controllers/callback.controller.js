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
            await botService.resendUserMainInlineMenu(chatId, bot);
            const engLangErrMessage = await bot.sendMessage(
                chatId, 
                "*Зараз бот підтримує тільки українську мову*\n"+
                "*Найближчим часом вибір англійскої мови запрацює*",
                {
                    parse_mode: "Markdown"
                }
            );
            // setTimeout(() => {
                botService.close(chatId, msg.message_id, bot);
            // }, 10000);
            setTimeout(() => {
                botService.close(chatId, engLangErrMessage.message_id, bot);
            }, 7000);
            // setTimeout(() => {
            // }, 10000);

            return;
        }

        await db.models.Account.update({ lang: selectedLang }, {
            where: {
                tgId: userTgId
            }
        });


        await botService.resendUserMainInlineMenu(chatId, bot);

        const newMessage = await bot.sendMessage(
            chatId, 
            "*Ви успішно змінили мову на українську!*",
            {
                parse_mode: "Markdown"
            }
        );


        // setTimeout(() => {
            botService.close(chatId, msg.message_id, bot);
        // }, 10000);
        setTimeout(() => {
            botService.close(chatId, newMessage.message_id, bot);
        }, 7000);
        // setTimeout(() => {
        // }, 10000);

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

callbackController.faq = async (msg, bot, data) => {
    try {
        const chatId = msg.chat.id;

        await bot.editMessageText(
            `🚀 *Ласкаво просимо до \`Planify\` FAQ!*\n\n`+
            `*Як додати нове завдання?*\n`+
            `Просто оберіть потрібний день в вкладці Календар планів та натисніть Додати план. 📅\n\n`+

            `*Як переглядати статистику?*\n`+
            `Спочатку оберіть потрібний день та продивіться наявні на цей день плани, кожен з них буде мати статус(виконано, не виконано, в процесі)`+
            `та можливість підтвердити чи відмінити його виконання. 📊\n\n`+

            `*Чи можна спільно планувати завдання?*\n`+
            `Зараз ні, але в майбутніх версіях ви зможете додавати друзів та планувати разом! 👫\n\n`+ 

            `*Чи можна налаштувати нагадування?*\n`+
            `Зараз ні, але в майбутніх версіях це буде доступно\n\n`+

            `*Дякуємо за використання* \`Planify\`*!* *Насолоджуйтеся плануванням своїх днів.* 🌟`,
            {
                chat_id: chatId,
                message_id: msg.message_id,
                parse_mode: "Markdown",
                reply_markup: JSON.stringify({
                    inline_keyboard: [
                        [{ text: "⬅️", callback_data: "menu|0" }]
                    ]
                })
            }
        );
    } catch (error) {
        console.log('error.message (in callbackController.faq):>> ', error.message);
    }
};


callbackController.menu = async (msg, bot, data) => {
    try {
        const chatId = msg.chat.id;
        const stage = data[0];

        switch (stage) {
            case "0":
                await bot.editMessageText(
                    `*Меню* ⬇️`,
                    {
                        chat_id: chatId,
                        message_id: msg.message_id,
                        parse_mode: "Markdown",
                        reply_markup: botService.getInlineMenu()
                    }
                );

                // botService.resendUserMainInlineMenu(chatId, bot);
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
                        ]
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
        if(data.length < 2) return;
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
            
            console.log(`${dayIndex}.${month}.${year-2000}`);
            console.log(chatId);
            
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
        controllers.push({ text: "▶️", callback_data: `dates_list|${nextMonth}|${nextYear-2000}` });
        

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
        console.log('error.message (in callbackController.datesList):>> ', error.message);
    }
};



callbackController.plan_date = async (msg, bot, data) => {
    try {
        const chatId = msg.chat.id;
        const day = +data[0];
        const month = +data[1];
        const year = 2000 + +data[2];

        // const ikeyboard = [];
        const currentDate = new Date();
        const formattedDate = currentDate.getDate()+"."+(currentDate.getMonth()+1)+"."+currentDate.getFullYear();
        const formattedDateToCheck = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
        const selectedDateToCheck = new Date(year, month-1, day);


        const plans = await db.models.Plan.findAll({
            where: {
                accountId: chatId,
                date: `${day}.${month}.${year-2000}`
            }
        });
        let stringPlansAmount = "";
        if(plans.length != 0) stringPlansAmount = `(${plans.length})`;


        if(selectedDateToCheck >= formattedDateToCheck) {
            await bot.editMessageText(
                `*${monthes[month]}, ${day}, ${year}:*`,
                {
                    chat_id: chatId,
                    message_id: msg.message_id,
                    parse_mode: "Markdown",
                    reply_markup: JSON.stringify({
                        inline_keyboard: [
                            [{ text: "Плани на цей день "+stringPlansAmount, callback_data: `plan|list|${day}.${month}.${year-2000}` }],
                            [{ text: "Додати план➕", callback_data: `plan|add|${day}.${month}.${year-2000}` }],
                            [{ text: "Головне меню ↩️", callback_data: `menu|0` }],
                            [{ text: "Календар ⬅️", callback_data: `dates_list|${month}|${year-2000}` }]
                        ]
                    })
                }
            );
        }
        else if(formattedDateToCheck > selectedDateToCheck) {
            await bot.editMessageText(
                `Минулий день\n`+
                `*${monthes[month]}, ${day}, ${year}:*`,
                {
                    chat_id: chatId,
                    message_id: msg.message_id,
                    parse_mode: "Markdown",
                    reply_markup: JSON.stringify({
                        inline_keyboard: [
                            [{ text: "Плани на цей день", callback_data: `plan|list|${day}.${month}.${year-2000}` }],
                            [{ text: "Головне меню ↩️", callback_data: `menu|0` }],
                            [{ text: "⬅️", callback_data: `dates_list|${month}|${year-2000}` }]
                        ]
                    })
                }
            );
        }

    } catch (error) {
        console.log('error.message (in callbackController.plan_date):>> ', error.message);
    }
};


const planStuses = {
    "inProgress": "В процесі",
    "completed": "Завершено",
    "canceled": "Скасовано"
};
callbackController.plan = async (msg, bot, data) => {
    try {
        const chatId = msg.chat.id;
        const action = data[0];
        

        switch (action) {
            case "add":
                const date = data[1];

                const questionMessage = await bot.sendMessage(
                    chatId,
                    `*Введіть текстовим повідомленням опис вашого плану:*`,
                    {
                        parse_mode: "Markdown",
                        reply_markup: JSON.stringify({
                            inline_keyboard: [
                                [{ text: "Відмінити", callback_data: "cancel_plan_writing" }]
                            ]
                        })
                    }
                );
                
                botService.changeUserState(chatId, {
                    stage: "writing_plan",
                    data: {
                        questionMessageId: questionMessage.message_id,
                        date
                    }
                });
                break;

            case "list":
                const dateForFindPlans = data[1];
                const plans = await db.models.Plan.findAll({
                    where: {
                        accountId: chatId,
                        date: dateForFindPlans
                    }
                });
                let plansMessagesIds = [];

                if(plans.length == 0) {
                    const tempMessage = await bot.sendMessage(
                        chatId,
                        `*Наразі у вас немає планів на цей день*`,
                        {
                            parse_mode: "Markdown"
                        }
                    );
                    setTimeout(() => {
                        botService.close(chatId, tempMessage.message_id, bot);
                    }, 7000);
                }
                else {
                    let plansCounter = 1;
                    for(const plan of plans) {
                        const ikeyboard = [];
                        if(plan.dataValues.status == "inProgress") {
                            ikeyboard.push([{ text: "Підтвердити ✅", callback_data: `plan|accept|${plan.dataValues.id}|${plansCounter}` }, { text: "Відмінити ❌", callback_data: `plan|cancel|${plan.dataValues.id}|${plansCounter}` }]);
                            ikeyboard.push([{ text: "Закрити повідомлення ✖", callback_data: "close" }]);
                        }
                        else {
                            ikeyboard.push([{ text: "Закрити повідомлення ✖", callback_data: "close" }]);
                        }
                        const planMessage = await bot.sendMessage(
                            chatId,
                            `*План №${plansCounter} (${planStuses[plan.dataValues.status]}):*\n\n`+
                            JSON.parse(plan.dataValues.text),
                            {
                                parse_mode: "Markdown",
                                reply_markup: JSON.stringify({
                                    inline_keyboard: ikeyboard
                                })
                            }
                        );
                        plansCounter++;

                        plansMessagesIds.push(planMessage.message_id);
                    }

                    await bot.sendMessage(
                        chatId,
                        `*Закрити плани:*`,
                        {
                            parse_mode: "Markdown",
                            reply_markup: JSON.stringify({
                                inline_keyboard: [
                                    [{ text: "Закрити усі повідомлення ✖", callback_data: "close_all|"+plansMessagesIds.join("|") }]
                                ]
                            })
                        }
                    );
                    
                }
        
                break;

            case "del":
                
                break;

            case "accept":
                const planIdForAccept = data[1];
                const planNumForAccept = data[2];

                await db.models.Plan.update({ status: "completed" }, {
                    where: {
                        id: planIdForAccept
                    }
                });
                const updatedPlan = await db.models.Plan.findAll({
                    where: {
                        id: planIdForAccept
                    }
                });
                console.log('updatedPlan :>> ', updatedPlan);
                const plan = updatedPlan[0];
                
                const ikeyboard = [];
                ikeyboard.push([{ text: "Закрити повідомлення ✖", callback_data: "close" }]);

                if(planIdForAccept) {
                    await bot.editMessageText(
                        `*План №${planNumForAccept} (${planStuses[plan.dataValues.status]}):*\n\n`+
                        JSON.parse(plan.dataValues.text),
                        {
                            chat_id: chatId,
                            message_id: msg.message_id,
                            parse_mode: "Markdown",
                            reply_markup: JSON.stringify({
                                inline_keyboard: ikeyboard
                            })
                        }
                    );
                }
                else {
                    await bot.editMessageText(
                        `*План ${planStuses[plan.dataValues.status]}:*\n\n`+
                        JSON.parse(plan.dataValues.text),
                        {
                            chat_id: chatId,
                            message_id: msg.message_id,
                            parse_mode: "Markdown",
                            reply_markup: JSON.stringify({
                                inline_keyboard: ikeyboard
                            })
                        }
                    );
                }
                break;

            case "cancel":
                const planIdForCancel = data[1];
                const planNumForCancel = data[2];
                

                await db.models.Plan.update({ status: "canceled" }, {
                    where: {
                        id: planIdForCancel
                    }
                });

                const updatedPlanForCancel = await db.models.Plan.findAll({
                    where: {
                        id: planIdForCancel
                    }
                });
                console.log('updatedPlanForCancel :>> ', updatedPlanForCancel);
                const planForCancel = updatedPlanForCancel[0];
                
                const ikeyboardForCancel = [];
                ikeyboardForCancel.push([{ text: "Закрити повідомлення ✖", callback_data: "close" }]);

                if(planNumForCancel) {
                    await bot.editMessageText(
                        `*План №${planNumForCancel} (${planStuses[planForCancel.dataValues.status]}):*\n\n`+
                        JSON.parse(planForCancel.dataValues.text),
                        {
                            chat_id: chatId,
                            message_id: msg.message_id,
                            parse_mode: "Markdown",
                            reply_markup: JSON.stringify({
                                inline_keyboard: ikeyboardForCancel
                            })
                        }
                    );
                }
                else {
                    await bot.editMessageText(
                        `*План ${planStuses[planForCancel.dataValues.status]}:*\n\n`+
                        JSON.parse(planForCancel.dataValues.text),
                        {
                            chat_id: chatId,
                            message_id: msg.message_id,
                            parse_mode: "Markdown",
                            reply_markup: JSON.stringify({
                                inline_keyboard: ikeyboardForCancel
                            })
                        }
                    );
                }
                break;

            default:
                break;
        }


    } catch (error) {
        console.log('error.message (in callbackController.plan):>> ', error.message);
    }
};

export default callbackController;