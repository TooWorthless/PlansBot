import TelegramBot from "node-telegram-bot-api";
import db from "../db/index.js";
import dotenv from "dotenv";
import { messagesRouter } from "./routers/messages.router.js";
import { callbackRouter } from "./routers/callback.router.js";
dotenv.config();



const TOKEN = process.env.TOKEN;

const bot = new TelegramBot(
    TOKEN,
    { polling: true }
);


bot.on("message", (msg) => {
    messagesRouter(msg, bot);
});


bot.on("callback_query", (cb) => {
    callbackRouter(cb, bot);
});




export default bot;