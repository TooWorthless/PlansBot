import db from "../../db/index.js";

const callbackController = {};



callbackController.lang = async (msg, bot, data) => {
    try {
        if(msg == undefined || bot == undefined || data == undefined) throw new Error("Missing params");

        const chatId = msg.chat.id;
        const userTgId = data[0];
        const selectedLang = data[1];
        
        if(selectedLang == "eng") {
            await bot.sendMessage(
                chatId, 
                "*Зараз бот підтримує тільки українську мову*\n"+
                "*Найближчим часом вибір англійскої мови запрацює*",
                {
                    parse_mode: "Markdown"
                }
            );
            return;
        }

        await db.models.Account.update({ lang: selectedLang }, {
            where: {
                tgId: userTgId
            }
        });

        await bot.sendMessage(
            chatId, 
            "*Ви успішно змінили мову на українську!*",
            {
                parse_mode: "Markdown"
            }
        );
    } catch (error) {
        console.log('error.message (in callbackController.lang):>> ', error.message);
    }
}


export default callbackController;