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
    console.log('GET request received at /');
    res.send('Server is running');
});

// Обработчик POST запросов из веб-приложения
app.post('/webhook', (req, res) => {
    const data = req.body;
    console.log('Received data from web app:', data);

    // Отправляем данные обратно в чат с помощью бота
    bot.sendMessage(data.chatId, 'Received your data from web app:')
        .then(() => bot.sendMessage(data.chatId, `Country: ${data.country}`))
        .then(() => bot.sendMessage(data.chatId, `Street: ${data.street}`))
        .then(() => {
            console.log('Messages sent successfully');
            res.sendStatus(200);
        })
        .catch(err => {
            console.error('Error sending message:', err);
            res.sendStatus(500);
        });
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
                    [{ text: 'Заполнить форму', url: 'https://telegram-react-node-js.vercel.app/form' }]
                ]
            }
        }).then(() => {
            console.log('Sent form link to user');
        }).catch(err => {
            console.error('Error sending form link:', err);
        });

        bot.sendMessage(chatId, 'Заходи в наш интернет магазин', {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Сделать заказ', url: 'https://telegram-react-node-js.vercel.app' }]
                ]
            }
        }).then(() => {
            console.log('Sent shop link to user');
        }).catch(err => {
            console.error('Error sending shop link:', err);
        });
    } else {
        bot.sendMessage(chatId, 'Received your message').then(() => {
            console.log('Acknowledged user message');
        }).catch(err => {
            console.error('Error acknowledging message:', err);
        });
    }
});

app.post('/web-data', async (req, res) => {
    const { queryId, products, totalPrice } = req.body;
    console.log('Received web-data:', req.body);

    try {
        await bot.answerWebAppQuery(queryId, {
            type: 'article',
            id: queryId,
            title: 'Успешная покупка',
            input_message_content: { message_text: 'Поздравляю с покупкой ' + totalPrice }
        });
        console.log('Purchase confirmation sent');
        return res.status(200).json({});
    } catch (error) {
        console.error('Error sending purchase confirmation:', error);
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
