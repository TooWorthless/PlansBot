import db from "../../db/index.js";
import messagesController from "../controllers/messages.controller.js";
import botService from "../service/bot.service.js";

export const messagesRouter = async (msg, bot) => {
    try {
        const chatId = msg.chat.id;
        // console.log('chatId :>> ', chatId);
        // console.log('msg :>> ', msg);

        const query = msg.text || " ";

        botService.close(chatId, msg.message_id, bot);

        const userDataFindingResponce = await db.models.Account.findAll({
            where: {
                tgId: chatId
            }
        });

        if(userDataFindingResponce && userDataFindingResponce.length > 0) {
            const userData = userDataFindingResponce[0].dataValues;

            if(userData.status == "ban") return;

            if(query[0] == "/") {
                switch (query) {
                    case "/start":
                        await messagesController.start(msg, bot, userData);
                        await botService.resendUserMainInlineMenu(chatId, bot);
                        break;
                
                    default:
                        break;
                }
            }
            else {
                switch (query) {
                    case "⚙️ Меню":
                        console.log('kadjsk :>> ');
                        botService.resendUserMainInlineMenu(chatId, bot);
                        break;
                
                    default:
                        break;
                }
            }
        }
        else {
            let newAccount;

            if(msg.chat.type.toLowerCase() != "group") {
                newAccount = await db.models.Account.create({
                    tgId: chatId,
                    info: (msg.from.first_name||"")+"|"+(msg.from.last_name||"")+"|"+(msg.from.username||"")
                });
            }
            else if(msg.chat.type.toLowerCase() == "group") {
                newAccount = await db.models.Account.create({
                    tgId: chatId,
                    info: "group|"+msg.chat.title
                });
            }

            console.log('newAccount :>> ', newAccount);

            await messagesController.start(msg, bot, newAccount.dataValues);
            messagesController.selectLang(msg, bot, {});
        }
    } catch (error) {
        console.log('error.message (in messageRouter):>> ', error.message);
    }
}