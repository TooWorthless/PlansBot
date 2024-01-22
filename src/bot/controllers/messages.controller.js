const messagesController = {};


messagesController.start = async (msg, bot, data) => {
    try {
        const chatId = msg.chat.id;

        await bot.sendMessage(
            chatId,
            `*Hello👋, ${msg.chat.first_name}!*\n`+
            `*Choose your language ⬇️*`,
            {
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
        console.log('error.message (in messagesController.start):>> ', error.message);
    }
};



export default messagesController;