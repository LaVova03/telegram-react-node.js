const TelegramBot = require('node-telegram-bot-api');

const token = '7225393978:AAEJaR_RDwpN_nXzC9oUr-UNm4KrNuM0XHY';
const site = 'https://main--storebot.netlify.app/';
const bot = new TelegramBot(token, { polling: true });

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (text === '/start') {

        await bot.sendMessage(chatId, 'Заполнить форму', {
            reply_markup: {
                keyboard: [
                    [{ text: 'Сделать заказ', web_app: { url: '/form' } }]
                ]
            }
        });

        await bot.sendMessage(chatId, 'Заходи в наш интернет магазин', {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Сделать заказ', web_app: { url: site } }]
                ]
            }
        });
    } else {
        bot.sendMessage(chatId, 'Received your message');
    }
});
