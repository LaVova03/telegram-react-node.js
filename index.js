const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const TelegramBot = require('node-telegram-bot-api');

const app = express();
const port = process.env.PORT || 8000;
const token = '7225393978:AAEJaR_RDwpN_nXzC9oUr-UNm4KrNuM0XHY';
const site = 'https://main--storebot.netlify.app/';
const bot = new TelegramBot(token, { polling: true });

app.use(cors());
app.use(bodyParser.json());

// Обработчик POST запросов из веб-приложения
app.post('/webhook', (req, res) => {
    const data = req.body;
    console.log('Received data from web app:', data);

    // Отправляем данные обратно в чат с помощью бота
    bot.sendMessage(data.chatId, 'Received your data from web app:');
    bot.sendMessage(data.chatId, `Country: ${data.country}`);
    bot.sendMessage(data.chatId, `Street: ${data.street}`);

    res.sendStatus(200);
});

// Обработчик корневого маршрута
app.get('/', (req, res) => {
    res.send('Server is running');
});

// Обработчик сообщений в чате Telegram
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    console.log('Received message:', msg);

    if (text === '/start') {
        bot.sendMessage(chatId, 'Заполнить форму', {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Заполнить форму', web_app: { url: site + 'form' } }]
                ]
            }
        });

        bot.sendMessage(chatId, 'Заходи в наш интернет магазин', {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Сделать заказ', web_app: { url: site } }]
                ]
            }
        });
    } else {
        bot.sendMessage(chatId, 'Received your message');
    }

    if (msg.web_app_data && msg.web_app_data.data) {
        console.log('Received web app data:', msg.web_app_data.data);
        try {
            const data = JSON.parse(msg.web_app_data.data);
            console.log('Parsed data:', data);

            bot.sendMessage(chatId, 'Data send successful');
            bot.sendMessage(chatId, `Country: ${data.country}`);
            bot.sendMessage(chatId, `Street: ${data.street}`);
        } catch (e) {
            console.error('Error parsing web app data:', e);
        }
    }
});

app.post('/web-data', async (req, res) => {
    const { queryId, products, totalPrice } = req.body;
    try {
        await bot.answerWebAppQuery(queryId, {
            type: 'article',
            id: queryId,
            title: 'Успешная покупка',
            input_message_content: { message_text: 'Поздравляю с покупкой на сумму ' + totalPrice }
        });
        return res.status(200).json({});
    } catch (error) {
        console.error('Error answering web app query:', error);
        await bot.answerWebAppQuery(queryId, {
            type: 'article',
            id: queryId,
            title: 'Не удалось приобрести товар',
            input_message_content: { message_text: 'Не удалось приобрести товар' }
        });
        return res.status(500).json({});
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
