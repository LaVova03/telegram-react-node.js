const TelegramBot = require('node-telegram-bot-api');

const token = '7225393978:AAEJaR_RDwpN_nXzC9oUr-UNm4KrNuM0XHY';
const site = 'https://main--storebot.netlify.app/';
const bot = new TelegramBot(token, { polling: true });

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    console.log('Received message:', msg);

    if (text === '/start') {
        await bot.sendMessage(chatId, 'Заполнить форму', {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Заполнить форму', web_app: { url: site + 'form' } }]
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
        await bot.sendMessage(chatId, 'Received your message');
    }

    if (msg.web_app_data && msg.web_app_data.data) {
        console.log('Received web app data:', msg.web_app_data.data);
        try {
            const data = JSON.parse(msg.web_app_data.data);
            console.log('Parsed data:', data);

            await bot.sendMessage(chatId, 'Data send successful');
            await bot.sendMessage(chatId, `Country: ${data.country}`);
            await bot.sendMessage(chatId, `Street: ${data.street}`);
        } catch (e) {
            console.error('Error parsing web app data:', e);
        }
    }
});
