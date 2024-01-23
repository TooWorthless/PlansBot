import db from "../../db/index.js";
import callbackController from "../controllers/callback.controller.js";
import messagesController from "../controllers/messages.controller.js";
import botService from "../service/bot.service.js";


export const callbackRouter = async (cb, bot) => {
    try {
        const msg = cb.message;
        const chatId = msg.chat.id;
        const action = cb.data;

        const query = msg.text || " ";

        const userDataFindingResponce = await db.models.Account.findAll({
            where: {
                tgId: chatId
            }
        });

        if(userDataFindingResponce && userDataFindingResponce.length > 0) {
            const userData = userDataFindingResponce[0].dataValues;

            if(userData.status == "ban") return;

            switch (action) {

                case "profile":
                    callbackController.profile(msg, bot, userData);
                    break;

                case "faq":
                    callbackController.faq(msg, bot, {});
                    break;

                case "close":
                    botService.close(chatId, msg.message_id, bot);
                    break;

                case "cancel_plan_writing":
                    const userState = botService.getUserState(chatId);
                    botService.close(chatId, userState.data.questionMessageId, bot);
                    botService.delUserState(chatId);
                    await bot.deleteMessage(chatId, msg.message_id);
                    break;
                

                default:
                    const actionData = action.split("|");
                    const actionType = actionData.splice(0,1)[0];

                    switch (actionType) {
                        case "lang":
                            callbackController.lang(msg, bot, actionData);
                            break;

                        case "menu":
                            callbackController.menu(msg, bot, actionData);

                        case "dates_list":
                            callbackController.datesList(msg, bot, actionData);
                            break;

                        case "plan_date":
                            callbackController.plan_date(msg, bot, actionData);
                            break;

                        case "plan":
                            callbackController.plan(msg, bot, actionData);
                            break;

                        case "close_all":
                            botService.close_all(msg, bot, actionData);
                            break;
                    
                        default:
                            break;
                    }
                    break;
            }
        }
    } catch (error) {
        console.log('error.message (in callbackRouter):>> ', error.message);
    }
}