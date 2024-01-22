import db from "../../db/index.js";
import messagesController from "../controllers/messages.controller.js";

export const messagesRouter = async (msg, bot) => {
    try {
        const chatId = msg.chat.id;
        console.log('chatId :>> ', chatId);
        console.log('msg :>> ', msg);

        const query = msg.text || " ";

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
                        messagesController.start(msg, bot, {});
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

            messagesController.start(msg, bot, {});            
        }
    } catch (error) {
        console.log('error.message (in messageRouter):>> ', error.message);
    }
}