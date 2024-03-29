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
                        botService.resendUserMainInlineMenu(chatId, bot);
                        break;
                
                    default:
                        const userState = botService.getUserState(chatId);
                        if(userState) {
                            const stage = userState.stage;
                            switch (stage) {
                                case "writing_plan":
                                    messagesController.addPlan(msg, bot, userState, query);
                                    break;
                            
                                default:
                                    break;
                            }
                        }
                        break;
                }
            }
        }
        else {
            let newAccount;
            console.log('msg.chat.type.toLowerCase() :>> ', msg.chat.type.toLowerCase());
            if(msg.chat.type.toLowerCase() == "private") {
                newAccount = await db.models.Account.create({
                    tgId: chatId,
                    info: (msg.from.first_name||"")+"|"+(msg.from.last_name||"")+"|"+(msg.from.username||"")
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