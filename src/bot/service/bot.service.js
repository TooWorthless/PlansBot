import db from "../../db/index.js";

const botService = {};


botService.getInlineMenu = () => {

    try {
        const currentDate = new Date();
        const formattedDate = currentDate.getDate()+"|"+(currentDate.getMonth()+1)+"|"+(currentDate.getFullYear()-2000);
        console.log('formattedDate :>> ', formattedDate);
        return JSON.stringify({
            inline_keyboard: [
                [{ text: "🗄 Профіль 🗄", callback_data: "profile" }],
                [{ text: "📅 Календар планів 📅", callback_data: "dates_list|1|24" }, { text: "Сьогодні", callback_data: `plan_date|${formattedDate}` }],
                [{ text: "Змінити мову", callback_data: "menu|slang" }],
                [{ text: "📜 FAQ 📜", callback_data: "faq" }]
            ]
        });
    } catch (error) {
        console.log('error.message (in botService.getInlineMenu):>> ', error.message);
        return JSON.stringify({
            inline_keyboard: [
                [{ text: "🗄 Профіль 🗄", callback_data: "profile" }],
                [{ text: "📅 Календар планів 📅", callback_data: "dates_list|1|24" }],
                [{ text: "Змінити мову", callback_data: "menu|slang" }],
                [{ text: "📜 FAQ 📜", callback_data: "faq" }]
            ]
        });
    }

    
};


botService.getMenu = () => {
    return JSON.stringify({
        resize_keyboard: true,
        keyboard: [
            [{ text: "⚙️ Меню" }]
        ]
    });
};


botService.close = async (chatId, messageId, bot) => {
    try {
        await bot.deleteMessage(chatId, messageId);
        return true;
    } catch (error) {
        console.log('error.message (in botService.close):>> ', error.message);
        return false;
    }
};

botService.close_all = async (msg, bot, data) => {
    try {
        const chatId = msg.chat.id;
        console.log('data :>> ', data);

        for(const messageId of data) {
            await botService.close(chatId, messageId, bot);
        }
        await botService.close(chatId, msg.message_id, bot);
    } catch (error) {
        console.log('error.message (in botService.close):>> ', error.message);
    }
};


botService.resendUserMainInlineMenu = async (userTgId, bot) => {
    try {
        const userDataFindingResponce = await db.models.Account.findAll({
            where: {
                tgId: userTgId
            }
        });

        if(userDataFindingResponce && userDataFindingResponce.length > 0) {
            const userData = userDataFindingResponce[0].dataValues;

            if(userData.status == "ban") return;

            const userAdditionalData = JSON.parse(userData.data);
            console.log('userAdditionalData :>> ', userAdditionalData);
            const previousMainInlineMenuId = userAdditionalData.mId;

            botService.close(userTgId, previousMainInlineMenuId, bot);
            const newInlineMenu = await bot.sendMessage(
                userTgId,
                `*Меню* ⬇️`,
                {
                    parse_mode: "Markdown",
                    reply_markup: botService.getInlineMenu()
                }
            );
            userAdditionalData.mId = newInlineMenu.message_id;

            await db.models.Account.update({ data: JSON.stringify(userAdditionalData) }, {
                where: {
                    tgId: userTgId
                }
            });
        }
    } catch (error) {
        console.log('error.message (in botService.resendUserMainInlineMenu):>> ', error.message);
    }
}


const usersStates = {};
botService.changeUserState = (id, state) => {
    usersStates[id] = state;
};
botService.getUserState = (id) => {
    return usersStates[id];
};
botService.delUserState = (id) => {
    delete usersStates[id];
};



export default botService;