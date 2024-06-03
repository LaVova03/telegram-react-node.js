const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const TelegramBot = require('node-telegram-bot-api');

const app = express();
const token = '7225393978:AAEJaR_RDwpN_nXzC9oUr-UNm4KrNuM0XHY'; // Замените на ваш токен
const bot = new TelegramBot(token, { polling: true });

app.use(cors());
app.use(bodyParser.json());

// Обработчик GET запросов для главной страницы
app.get('/', (req, res) => {
    res.send('Server is running');
});

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

// Обработчик сообщений в чате Telegram
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    console.log('Received message:', msg);

    if (text === '/start') {
        bot.sendMessage(chatId, 'Заполнить форму', {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Заполнить форму', url: `${site}form` }]
                ]
            }
        });

        bot.sendMessage(chatId, 'Заходи в наш интернет магазин', {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Сделать заказ', url: site }]
                ]
            }
        });
    } else {
        bot.sendMessage(chatId, 'Received your message');
    }
});

app.post('/web-datsa', async (req, res) => {
    const { queryId, products, totalPrice } = req.body;
    try {
        await bot.answerWebAppQuery(queryId, {
            type: 'article',
            id: queryId,
            title: 'Успешная покупка',
            input_message_content: { message_text: 'Поздравляю с покупкой' + totalPrice }
        });
        return res.status(200).json({});
    } catch (error) {
        await bot.answerWebAppQuery(queryId, {
            type: 'article',
            id: queryId,
            title: 'Не удалось приобрести товар',
            input_message_content: { message_text: 'Не удалось приобрести товар' }
        });
        return res.status(500).json({});
    }
});

// Vercel предоставляет порт автоматически, так что вам не нужно явно указывать его
module.exports = app;
