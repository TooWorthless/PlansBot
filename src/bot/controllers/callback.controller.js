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


export default callbackController;